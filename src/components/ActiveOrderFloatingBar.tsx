'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { t } from '@/lib/translations';
import { useRouter, usePathname } from 'next/navigation';
import { MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ActiveOrder = {
  id: string;
  status: 'pending' | 'accepted' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';
};

export function ActiveOrderFloatingBar() {
  const { user } = useAuth();
  const { language } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);

  const fetchActiveOrder = async () => {
    if (!user) {
      setActiveOrder(null);
      return;
    }

    try {
      // Find latest non-delivered, non-cancelled order
      const { data, error } = await supabase
        .from('orders')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', ['pending', 'packing', 'accepted', 'out_for_delivery'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setActiveOrder(data[0]);
      } else {
        setActiveOrder(null);
      }
    } catch (e) {
      console.error('Error fetching active order floating bar:', e);
    }
  };

  useEffect(() => {
    fetchActiveOrder();

    if (!user) return;

    // Listen to database modifications to update the active order status dynamically
    const channel = supabase
      .channel(`active-order-floating-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => {
          fetchActiveOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Render floating bar ONLY on the customer homepage ('/')
  if (!activeOrder || pathname !== '/') {
    return null;
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('statusPending', language);
      case 'packing': return t('statusPacking', language);
      case 'accepted': return t('statusAccepted', language);
      case 'out_for_delivery': return t('statusOutForDelivery', language);
      default: return t('statusDefault', language);
    }
  };

  return (
    <div className="fixed bottom-[78px] left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-[998] animate-in slide-in-from-bottom-12 duration-300">
      <div className="glass-panel border border-[#FF5F1F]/30 hover:border-[#FF5F1F]/60 rounded-3xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex justify-between items-center gap-4 text-foreground">
        {/* Glowing dynamic background pulse */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#FF5F1F]/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 absolute"></span>
            <span className="text-[9px] font-black text-[#00D26A] uppercase tracking-widest pl-3.5">{t('veltoActiveOrder', language)}</span>
          </div>

          <h4 className="text-xs font-black text-foreground mt-1 truncate">
            {activeOrder.status === 'pending' && "Order placed, preparing soon... 🕒"}
            {activeOrder.status === 'accepted' && "Order prepared & packed! 🛍️"}
            {activeOrder.status === 'packing' && "Rider assigned at the hub 🛵"}
            {activeOrder.status === 'out_for_delivery' && "Rider is out for delivery! 🚀"}
          </h4>

          {/* Stepper Status Indicators */}
          <div className="flex items-center justify-between gap-1 mt-3 w-full border-t border-foreground/5 pt-2">
            {[
              { label: 'Prepared', done: ['accepted', 'packing', 'out_for_delivery'].includes(activeOrder.status), active: activeOrder.status === 'pending' || activeOrder.status === 'accepted' },
              { label: 'Rider Assigned', done: ['packing', 'out_for_delivery'].includes(activeOrder.status), active: activeOrder.status === 'packing' },
              { label: 'Out for Delivery', done: activeOrder.status === 'out_for_delivery', active: activeOrder.status === 'out_for_delivery' }
            ].map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center relative">
                {/* Step bubble */}
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black z-10 transition-colors duration-300 ${
                  step.done ? 'bg-[#00D26A] text-white' : step.active ? 'bg-[#FF5F1F] text-white animate-pulse' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {step.active ? (
                    <span className="w-1 h-1 bg-white rounded-full"></span>
                  ) : step.done ? (
                    '✓'
                  ) : (
                    idx + 1
                  )}
                </div>
                {/* Step label */}
                <span className={`text-[7px] font-black uppercase tracking-tight mt-1 transition-colors duration-300 ${
                  step.active ? 'text-[#FF5F1F]' : step.done ? 'text-[#00D26A]' : 'text-zinc-500'
                }`}>
                  {step.label}
                </span>
                {/* Connecting Line */}
                {idx < 2 && (
                  <div className="absolute left-[50%] right-[-50%] top-[6px] h-[1.5px] bg-zinc-800 -z-0">
                    <div className={`h-full bg-[#00D26A] transition-all duration-500`} style={{ width: step.done ? '100%' : '0%' }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Link 
          href={`/orders/${activeOrder.id}`} 
          className="bg-gradient-to-r from-[#FF5F1F] via-[#FF8A00] to-[#FF3D71] text-white font-black uppercase text-[10px] tracking-wider py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-lg shrink-0 z-10"
        >
          {t('trackLive', language)} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
