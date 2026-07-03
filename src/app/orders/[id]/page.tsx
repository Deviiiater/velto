'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Check, ClipboardList, MapPin, Truck, ShoppingBag, ArrowLeft, ShieldAlert, Send, Clock, CheckCircle, Bike, AlertCircle, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { t } from '@/lib/translations';
import Link from 'next/link';
import AlertToast from '@/components/AlertToast';

type OrderItem = {
  id: string;
  quantity: number;
  price_at_time: number;
  products: {
    name: string;
    category: string;
  } | null;
};

type Order = {
  id: string;
  total_amount: number;
  status: 'pending' | 'accepted' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_method: string;
  delivery_address: string;
  phone_number: string;
  created_at: string;
  order_items: OrderItem[];
};

type Complaint = {
  id: string;
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  admin_reply: string | null;
};

// Address parsing helper to decode transit situations & rider info encoded in delivery_address
const parseDeliveryAddress = (fullAddress: string) => {
  if (!fullAddress) return { address: '', eta: '10 mins', situation: 'Clear Skies / Smooth Sailing', riderInfo: '', tiffinStartDay: null };
  
  let tiffinStartDay: string | null = null;
  const tiffinMatch = fullAddress.match(/\[Tiffin Start Day: (.*?)\]/);
  if (tiffinMatch) {
    tiffinStartDay = tiffinMatch[1];
  }
  
  const cleanAddress = fullAddress.replace(/\[Tiffin Start Day: (.*?)\]\s*/, '');
  const parts = cleanAddress.split(" || ");
  const address = parts[0];
  
  if (parts.length < 2) {
    return { address, eta: '10 mins', situation: 'Clear Skies / Smooth Sailing', riderInfo: '', tiffinStartDay };
  }
  
  const detailsStr = parts[1];
  const detailsParts = detailsStr.split(" | ");
  
  let eta = '10 mins';
  let situation = 'Clear Skies / Smooth Sailing';
  let riderInfo = '';
  
  detailsParts.forEach(part => {
    if (part.startsWith("ETA: ")) {
      eta = part.replace("ETA: ", "");
    } else if (part.startsWith("Situation: ")) {
      situation = part.replace("Situation: ", "");
    } else if (part.startsWith("Rider: ")) {
      riderInfo = part.replace("Rider: ", "");
    }
  });
  
  return { address, eta, situation, riderInfo, tiffinStartDay };
};

export default function OrderTrackerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { language } = useSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Complaints State
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [complaintSubject, setComplaintSubject] = useState('Missing Items');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
  };

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_time,
            products (
              name,
              category
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      let processedOrder = data;
      if (data && data.status !== 'delivered' && data.status !== 'cancelled') {
        const createdAt = new Date(data.created_at);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = diffMs / (1000 * 60);
        if (diffMins >= 60) {
          processedOrder = {
            ...data,
            status: 'cancelled',
            timeoutCancelled: true
          };
        }
      }
      setOrder(processedOrder);
    } catch (e) {
      console.error('Error fetching order:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaint = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('order_id', id)
        .limit(1);

      if (!error && data && data.length > 0) {
        setComplaint(data[0]);
      } else {
        setComplaint(null);
      }
    } catch (e) {
      console.error('Error fetching complaint:', e);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchComplaint();

    // Subscribe to changes on this specific order in real time
    const orderChannel = supabase
      .channel(`order-tracker-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (payload.new && payload.new.id === id) {
            fetchOrder();
          }
        }
      )
      .subscribe();

    // Subscribe to changes on complaints in real time
    const complaintChannel = supabase
      .channel(`complaint-tracker-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        (payload: any) => {
          if (payload.new && payload.new.order_id === id) {
            fetchComplaint();
          }
        }
      )
      .subscribe();

    // Fallback polling interval in case the WebSocket is restricted, RLS filters block update streams, or Supabase Replication is disabled!
    const fallbackPolling = setInterval(() => {
      fetchOrder();
      fetchComplaint();
    }, 3000);

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(complaintChannel);
      clearInterval(fallbackPolling);
    };
  }, [id]);

  const handleRaiseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast(t('alertLoginRequiredComplaint', language), 'error');
      return;
    }
    if (!complaintDesc.trim()) {
      showToast(t('alertDescribeIssue', language), 'error');
      return;
    }

    setSubmittingComplaint(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          order_id: id,
          user_id: user.id,
          subject: complaintSubject,
          description: complaintDesc,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      setComplaint(data);
      setComplaintDesc('');
      showToast(t('alertTicketSubmitted', language), 'success');
    } catch (err: any) {
      showToast(t('alertTicketFailed', language).replace('{err}', err.message), 'error');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
        <span>{t('syncingHistory', language)}</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold">{t('orderNotFound', language)}</h2>
        <p className="text-muted-foreground text-sm max-w-sm">{t('couldNotRetrieveOrder', language).replace('{id}', id.slice(0, 8))}</p>
        <Link href="/" className="mt-4 bg-primary text-primary-foreground px-5 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-all">{t('goHome', language)}</Link>
      </div>
    );
  }

  // Map database status to tracking steps
  const steps = [
    { label: t('orderPlacedStep', language), desc: t('orderPlacedDesc', language), keys: ['pending', 'packing', 'accepted', 'out_for_delivery', 'delivered'] },
    { label: t('packingItemsStep', language), desc: t('packingItemsDesc', language), keys: ['packing', 'accepted', 'out_for_delivery', 'delivered'] },
    { label: t('readyForRiderStep', language), desc: t('readyForRiderDesc', language), keys: ['accepted', 'out_for_delivery', 'delivered'] },
    { label: t('outForDeliveryStep', language), desc: t('outForDeliveryDesc', language), keys: ['out_for_delivery', 'delivered'] },
    { label: t('deliveredStep', language), desc: t('deliveredDesc', language), keys: ['delivered'] },
  ];

  const getActiveStepIndex = () => {
    if (order.status === 'pending') return 0;
    if (order.status === 'packing') return 1;
    if (order.status === 'accepted') return 2;
    if (order.status === 'out_for_delivery') return 3;
    if (order.status === 'delivered') return 4;
    return -1; // Cancelled or unknown
  };

  const activeIndex = getActiveStepIndex();
  const parsedAddress = parseDeliveryAddress(order.delivery_address);
  const isTiffinSubscription = order.order_items?.some(item => 
    item.products?.category?.toLowerCase() === 'tiffin service'
  );

  const isBillsRecharge = order.order_items?.some(item => {
    const cat = item.products?.category?.toLowerCase() || '';
    return cat === 'bills & recharge' || cat === 'bills/pay' || cat === 'bills';
  });

  const isHomeServices = order.order_items?.some(item => {
    const cat = item.products?.category?.toLowerCase() || '';
    return cat === 'home services' || cat === 'services';
  });

  const isPanIndiaOrder = order.order_items?.some(item => {
    const cat = item.products?.category?.toLowerCase() || '';
    const name = item.products?.name?.toLowerCase() || '';
    return cat === 'pan india' || cat === 'ghee' || name.includes('ghee');
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-6">
      
      {/* Back button & Title */}
      <div className="flex flex-col gap-3">
        <Link href="/profile" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 w-fit transition-colors font-semibold">
          <ArrowLeft size={14} /> {t('backToDashboard', language)}
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {isTiffinSubscription ? t('tiffinSubscriptionConsole', language) : 
               isBillsRecharge ? t('digitalRechargeReceipt', language) :
               isHomeServices ? t('serviceBookingConsole', language) : 
               isPanIndiaOrder ? (language === 'hi' ? 'कूरियर शिपमेंट ट्रैकर' : 'Courier Shipment Tracker') : t('liveOrderTracker', language)}
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{t('orderSingular', language)} ID: <span className="font-mono">{order.id}</span></p>
          </div>
          {isTiffinSubscription || isBillsRecharge || isHomeServices ? (
            <span className="text-xs text-emerald-500 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full w-fit">
              {isTiffinSubscription ? t('subscriptionActive', language) : 
               isBillsRecharge ? t('rechargeSuccessful', language) : t('bookingConfirmed', language)}
            </span>
          ) : isPanIndiaOrder ? (
            <span className="text-xs text-amber-500 font-extrabold bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full w-fit flex items-center gap-1.5">
              🚚 {language === 'hi' ? 'कूरियर डिलीवरी (3-5 दिन)' : 'Courier Delivery (3-5 Days)'}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground font-semibold bg-accent border border-border px-3 py-1.5 rounded-lg w-fit flex items-center gap-1.5">
              <Clock size={12} className="text-primary animate-pulse" /> {t('estDelivery', language).replace('{eta}', parsedAddress.eta)}
            </span>
          )}
        </div>
      </div>

      {/* Live Rider Dispatch & Transit Status Card (Only for non-Tiffins) */}
      {!isTiffinSubscription && order.status === 'out_for_delivery' && parsedAddress.riderInfo && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-primary/10 pb-3">
            <h2 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <Bike size={16} className="text-primary animate-bounce-short" /> {t('activeRiderDispatchDetails', language)}
            </h2>
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
              {t('enRoute', language)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="block text-[8px] font-black uppercase text-muted-foreground tracking-wider">{t('assignedCourierPartner', language)}</span>
              <p className="text-sm font-bold text-foreground">{parsedAddress.riderInfo.split(" | ")[0]}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">{parsedAddress.riderInfo.split(" | ")[1]}</p>
            </div>
            <div className="space-y-1">
              <span className="block text-[8px] font-black uppercase text-muted-foreground tracking-wider">{t('liveTransitSituation', language)}</span>
              <p className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-500 animate-pulse" /> {parsedAddress.situation}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">{t('etaUpdatedDynamically', language)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Card OR Stepper tracking container */}
      {isTiffinSubscription ? (
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-inner">
              <ShoppingBag size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">{t('tiffinSubscriptionConsole', language)}</h2>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{t('recurringHomestyleDesc', language)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1.5">
              <span className="block text-[9px] font-black uppercase text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md w-fit tracking-wider">
                {t('selectSubStartDay', language)}
              </span>
              <p className="text-xl font-black text-foreground">
                📅 {parsedAddress.tiffinStartDay || 'Monday'}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">{language === 'hi' ? 'इस दिन पहली ताज़ा डिलीवरी शुरू होगी' : language === 'hinglish' ? 'First delivery is din start hogi' : 'First delivery begins fresh on this day'}</p>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit tracking-wider">
                {language === 'hi' ? 'ऑर्डर की स्थिति' : language === 'hinglish' ? 'Fulfillment Status' : 'Fulfillment Status'}
              </span>
              <p className="text-xl font-black text-foreground">
                {t('preparingKitchen', language)}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">{t('chefAssignedDesc', language)}</p>
            </div>
          </div>

          <div className="bg-background/40 border border-border/40 p-4.5 rounded-2xl space-y-2 mt-4">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              💡 {t('planOperationGuide', language)}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('tiffinMealPlanDesc', language)}
            </p>
          </div>
        </div>
      ) : isBillsRecharge ? (
        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="w-12 h-12 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 rounded-2xl flex items-center justify-center shadow-inner">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">{t('digitalRechargeReceipt', language)}</h2>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{language === 'hi' ? 'वाउचर लागू और उपयोगिता खाता क्रेडिट हुआ' : language === 'hinglish' ? 'Voucher applied & account credit ho gaya' : 'Voucher applied & utility account credited'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1.5">
              <span className="block text-[9px] font-black uppercase text-cyan-600 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit tracking-wider">
                {t('utilityOperator', language)}
              </span>
              <p className="text-lg font-black text-foreground">
                {t('jioFiberMobile', language)}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">{t('accountNumberLabel', language).replace('{num}', order.phone_number)}</p>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit tracking-wider">
                {t('voucherRefId', language)}
              </span>
              <p className="text-lg font-mono font-black text-foreground">
                TXN-VELTO-9824X
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">{t('instantlyVerifiedUpi', language)}</p>
            </div>
          </div>

          <div className="bg-background/40 border border-border/40 p-4.5 rounded-2xl space-y-2 mt-4">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              {t('digitalVoucherGuide', language)}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('digitalVoucherGuideDesc', language)}
            </p>
          </div>
        </div>
      ) : isHomeServices ? (
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-2xl flex items-center justify-center shadow-inner">
              <span className="text-xl">🧹</span>
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">{t('homeServiceBookingConfirmed', language)}</h2>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{t('specialistScheduled', language)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1.5">
              <span className="block text-[9px] font-black uppercase text-indigo-600 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md w-fit tracking-wider">
                {t('assignedSpecialist', language)}
              </span>
              <p className="text-lg font-black text-foreground">
                {t('assignedSpecialistLabel', language)}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">{t('specialistIdLabel', language)}</p>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit tracking-wider">
                {t('scheduledSlot', language)}
              </span>
              <p className="text-lg font-black text-foreground">
                {t('scheduledSlotLabel', language)}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">{t('specialistWillCall', language)}</p>
            </div>
          </div>

          <div className="bg-background/40 border border-border/40 p-4.5 rounded-2xl space-y-2 mt-4">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              {t('homeServiceGuide', language)}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('homeServiceGuideDesc', language)}
            </p>
          </div>
        </div>
      ) : isPanIndiaOrder ? (
        <div className="bg-gradient-to-br from-amber-600/15 via-yellow-600/5 to-transparent border border-amber-600/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-inner">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">
                {language === 'hi' ? 'अखिल भारतीय कूरियर ट्रैकिंग' : 'Pan India Courier Tracking'}
              </h2>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                {language === 'hi' 
                  ? 'राष्ट्रीय कूरियर पार्टनर के माध्यम से आपका ऑर्डर शिप किया गया है।' 
                  : 'Your order is shipped via national courier partner.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1.5">
              <span className="block text-[9px] font-black uppercase text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md w-fit tracking-wider">
                {language === 'hi' ? 'शिपिंग का तरीका' : 'Shipping Mode'}
              </span>
              <p className="text-lg font-black text-foreground">
                🚚 Standard Courier (3-5 Days)
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {language === 'hi' ? 'कोई स्थानीय डिलीवरी बॉय असाइन नहीं' : 'No hyperlocal rider tracking'}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit tracking-wider">
                {language === 'hi' ? 'कूरियर पार्टनर' : 'Courier Partner'}
              </span>
              <p className="text-lg font-black text-foreground">
                BlueDart / Delhivery Express
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {language === 'hi' ? 'ट्रैकिंग आईडी जल्द ही अपडेट की जाएगी' : 'Tracking ID will update shortly'}
              </p>
            </div>
          </div>

          {/* Courier Stepper */}
          <div className="border-t border-border/40 pt-6 space-y-4">
            <h3 className="text-xs font-bold text-foreground">
              {language === 'hi' ? 'शिपमेंट की प्रगति' : 'Shipment Progress'}
            </h3>
            
            <div className="grid grid-cols-4 text-center text-[10px] font-bold text-muted-foreground relative">
              <div className="absolute top-2 left-[12%] right-[12%] h-0.5 bg-border -z-10">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ 
                    width: order.status === 'delivered' ? '100%' :
                           order.status === 'out_for_delivery' ? '75%' :
                           order.status === 'packing' ? '50%' : '25%' 
                  }}
                ></div>
              </div>
              
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                  ['pending', 'packing', 'out_for_delivery', 'delivered'].includes(order.status)
                    ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}></div>
                <span className={['pending', 'packing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'text-primary' : ''}>
                  {language === 'hi' ? 'स्वीकृत' : 'Confirmed'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                  ['packing', 'out_for_delivery', 'delivered'].includes(order.status)
                    ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}></div>
                <span className={['packing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'text-primary' : ''}>
                  {language === 'hi' ? 'पैक हुआ' : 'Packed'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                  ['out_for_delivery', 'delivered'].includes(order.status)
                    ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}></div>
                <span className={['out_for_delivery', 'delivered'].includes(order.status) ? 'text-primary' : ''}>
                  {language === 'hi' ? 'प्रेषित' : 'Dispatched'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                  order.status === 'delivered'
                    ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}></div>
                <span className={order.status === 'delivered' ? 'text-primary' : ''}>
                  {language === 'hi' ? 'वितरित' : 'Delivered'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background/40 border border-border/40 p-4 rounded-2xl text-xs text-muted-foreground leading-relaxed">
            {language === 'hi'
              ? '💡 यह उत्पाद अखिल भारतीय वितरण के लिए उपलब्ध है। इसे आपके स्थान पर कूरियर के माध्यम से 3 से 5 दिनों में सुरक्षित पहुँचाया जाएगा।'
              : '💡 This product is processed for Pan India shipping. It will be delivered to your address safely via national courier in 3 to 5 business days.'}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 shadow-sm space-y-8 relative overflow-hidden">
          {order.status === 'cancelled' ? (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl">
              <span className="text-xl">🛑</span>
              <div>
                <div className="font-bold text-sm">{t('orderCancelled', language)}</div>
                <div className="text-xs opacity-90">
                  {(order as any).timeoutCancelled 
                    ? "This order could not be delivered due to delay in rider dispatch/processing (exceeded 1 hour limit). The amount (if paid online) will be refunded shortly."
                    : t('orderCancelledDesc', language)}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-bold border-b border-border pb-3 flex items-center gap-2">
                <Truck className="text-primary animate-pulse" size={20} /> {t('realtimeProgress', language)}
              </h2>
              
              {/* Steps Workflow */}
              <div className="relative pl-12 space-y-8">
                {/* Stepper vertical line - Perfected centering and margins */}
                <div className="absolute left-[-28px] top-[14px] bottom-[22px] w-[2px] bg-border/80"></div>
   
                {steps.map((step, idx) => {
                  const isCompleted = idx < activeIndex || order.status === 'delivered';
                  const isActive = idx === activeIndex && order.status !== 'delivered';
                  const isFuture = idx > activeIndex && order.status !== 'delivered';
   
                  return (
                    <div key={idx} className="relative flex flex-row items-start md:items-center justify-between gap-4">
                      {/* Stepper node circle - spacious right tick alignment */}
                      <div className={`absolute left-[-44px] w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                        isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                        isActive ? 'bg-background border-primary text-primary shadow-[0_0_12px_rgba(147,51,234,0.3)] animate-pulse' : 
                        'bg-card border-border text-muted-foreground'
                      }`}>
                        {isCompleted ? <Check size={14} className="stroke-[3]" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>
   
                      <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                        <h3 className={`font-bold text-xs sm:text-sm ${isActive ? 'text-primary font-black animate-pulse' : isFuture ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {step.label}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground max-w-md leading-relaxed">{step.desc}</p>
                      </div>
   
                      {isActive && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {t('active', language)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Deliverables & Location details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Deliverables checklist */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2 border-b border-border pb-2.5">
            <ShoppingBag size={18} className="text-primary" /> {t('deliveryBag', language)}
          </h2>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm items-center py-0.5">
                <span className="text-foreground font-medium">
                  {item.products?.name || 'Loading Item...'}
                </span>
                <span className="text-xs font-semibold text-muted-foreground bg-accent px-2 py-0.5 rounded border border-border/50">
                  {t('qty', language)}: {item.quantity}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 mt-2 flex justify-between items-center text-sm font-bold">
            <span>{t('totalCollectedAmount', language)}</span>
            <span className="text-primary text-base">₹{order.total_amount}</span>
          </div>
        </div>

        {/* Address & Payment Info */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2 border-b border-border pb-2.5">
            <MapPin size={18} className="text-primary" /> {isBillsRecharge ? t('rechargeTarget', language) : isHomeServices ? t('serviceTarget', language) : t('deliveryTarget', language)}
          </h2>
          <div className="space-y-3.5 text-xs text-muted-foreground">
            <div>
              <span className="block font-bold text-foreground text-[10px] uppercase tracking-wider mb-0.5">
                {isBillsRecharge ? t('rechargeAccountTarget', language) : t('destinationAddress', language)}
              </span>
              <p className="font-medium text-foreground leading-relaxed text-sm line-clamp-2">
                {isBillsRecharge ? `${language === 'hi' ? 'जियो ऑपरेटर नेटवर्क नंबर' : language === 'hinglish' ? 'Jio Operator Network Number' : 'Jio Operator Network Number'}: ${order.phone_number}` : parsedAddress.address}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block font-bold text-foreground text-[10px] uppercase tracking-wider mb-0.5">{t('contactTel', language)}</span>
                <p className="font-semibold text-foreground text-sm">{order.phone_number}</p>
              </div>
              <div>
                <span className="block font-bold text-foreground text-[10px] uppercase tracking-wider mb-0.5">{t('paymentMethod', language)}</span>
                <p className="font-semibold text-foreground text-sm uppercase">{order.payment_method}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Velto Live Support Hub */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-base flex items-center gap-2 border-b border-border pb-2.5">
          <ShieldAlert size={18} className="text-primary" /> {t('veltoSupportHub', language)}
        </h2>

        {complaint ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('activeSupportCase', language)}</span>
                <h4 className="font-bold text-sm text-foreground mt-0.5">{complaint.subject}</h4>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${
                complaint.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                complaint.status === 'in_progress' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
              }`}>
                {complaint.status}
              </span>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed italic bg-accent/30 p-3 rounded-xl border border-border/40">
              "{complaint.description}"
            </div>

            {complaint.admin_reply ? (
              <div className="space-y-2 border-t border-border/50 pt-3">
                <span className="block text-[10px] font-black uppercase tracking-wider text-green-500 flex items-center gap-1">
                  <CheckCircle size={12} /> {t('supportReply', language)}
                </span>
                <p className="text-xs font-semibold text-foreground leading-relaxed bg-green-500/5 border border-green-500/10 p-3.5 rounded-xl">
                  {complaint.admin_reply}
                </p>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic flex items-center gap-1.5 border-t border-border/50 pt-3">
                <Clock size={14} className="animate-spin text-primary" />
                {t('supportReviewingCase', language)}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleRaiseComplaint} className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('facingIssueDesc', language)}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('issueTopic', language)}</label>
                <select
                  value={complaintSubject}
                  onChange={e => setComplaintSubject(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs font-bold"
                >
                  <option value="Missing Items">{t('topicMissingItems', language)}</option>
                  <option value="Damaged Products">{t('topicDamagedProducts', language)}</option>
                  <option value="Late Delivery">{t('topicLateDelivery', language)}</option>
                  <option value="Wrong Address">{t('topicWrongAddress', language)}</option>
                  <option value="Other">{t('topicOther', language)}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('detailedDescription', language)}</label>
                <textarea
                  value={complaintDesc}
                  onChange={e => setComplaintDesc(e.target.value)}
                  placeholder={t('tellUsWrongPlaceholder', language)}
                  rows={2}
                  className="w-full p-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingComplaint}
              className="w-full sm:w-auto bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-primary/95 transition-all text-xs flex justify-center items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Send size={12} /> {submittingComplaint ? t('submittingCase', language) : t('submitSupportTicket', language)}
            </button>
          </form>
        )}
      </div>

      {toast && <AlertToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
