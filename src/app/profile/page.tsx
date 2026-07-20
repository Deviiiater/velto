'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ClipboardList, Package, ExternalLink, Calendar, MapPin, DollarSign, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { t } from '@/lib/translations';
import Link from 'next/link';
import AlertToast from '@/components/AlertToast';
import RefundModal from '@/components/RefundModal';

type OrderItem = {
  id: string;
  quantity: number;
  products: {
    name: string;
  } | null;
};

type Order = {
  id: string;
  total_amount: number;
  status: 'pending' | 'accepted' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_method: string;
  delivery_address: string;
  created_at: string;
  order_items: OrderItem[];
};

type Complaint = {
  id: string;
  order_id: string;
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  admin_reply: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { language, lowInternetMode, setLowInternetMode, oneIndiaPass, setOneIndiaPass, liquidGlassMode, setLiquidGlassMode } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [friends, setFriends] = useState<{ id: string; name: string; email: string; status: string }[]>([]);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('velto_friends');
      if (saved) {
        setFriends(JSON.parse(saved));
      } else {
        const defaultFriends = [
          { id: '1', name: 'Rohan Sharma', email: 'rohan.s@velto.com', status: 'Online' },
          { id: '2', name: 'Priya Verma', email: 'priya.v@hostel.edu', status: 'Idle' },
          { id: '3', name: 'Aman Gupta', email: 'aman.gupta@college.in', status: 'In Cart Poll' }
        ];
        localStorage.setItem('velto_friends', JSON.stringify(defaultFriends));
        setFriends(defaultFriends);
      }
    }
  }, []);

  const handleAddFriend = async () => {
    const name = prompt("Enter friend's full name to verify:");
    if (!name) return;

    // Check if the user exists in the Supabase public.users table
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, role')
        .ilike('full_name', `%${name}%`);

      if (error) throw error;

      if (!data || data.length === 0) {
        alert(`❌ Verification failed: No user found matching name "${name}" in Velto Database. Please ask them to sign up first.`);
        return;
      }

      // Match found! Use the verified details from the DB
      const verifiedUser = data[0];
      const verifiedName = verifiedUser.full_name || name;
      
      const newFriend = {
        id: verifiedUser.id,
        name: verifiedName,
        email: `${verifiedName.toLowerCase().replace(/\s+/g, '')}@velto.com`,
        status: 'Online'
      };

      const updated = [...friends, newFriend];
      setFriends(updated);
      localStorage.setItem('velto_friends', JSON.stringify(updated));
      showToast(`${verifiedName} verified & added to your poll contacts squad!`, 'success');
    } catch (err: any) {
      console.warn("DB user verification offline, adding locally:", err);
      // Fallback local mock add
      const newFriend = {
        id: 'f-' + Date.now(),
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '')}@velto.com`,
        status: 'Online'
      };
      const updated = [...friends, newFriend];
      setFriends(updated);
      localStorage.setItem('velto_friends', JSON.stringify(updated));
      showToast(`${name} added to your poll contacts squad!`, 'success');
    }
  };

  const handleRemoveFriend = (id: string, name: string) => {
    const updated = friends.filter(f => f.id !== id);
    setFriends(updated);
    localStorage.setItem('velto_friends', JSON.stringify(updated));
    showToast(`${name} removed from poll contacts.`, 'success');
  };

  const fetchCustomerData = async (userId: string) => {
    setLoadingData(true);

    // 1. Fetch Orders (Fault-tolerant)
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            products (
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (orderError) throw orderError;
      setOrders(orderData || []);
    } catch (e) {
      console.warn('Error fetching customer orders (check if orders table exists and RLS is declared):', e);
      setOrders([]);
    }

    // 2. Fetch Complaints (Graceful degradation if table does not exist yet)
    try {
      const { data: complaintData, error: compError } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (compError) throw compError;
      setComplaints(complaintData || []);
    } catch (e) {
      console.warn('Error fetching customer complaints (complaints table may not exist yet in Supabase):', e);
      setComplaints([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCustomerData(user.id);
    } else if (!authLoading) {
      setLoadingData(false);
    }
  }, [user, authLoading]);

  if (authLoading || loadingData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground text-sm font-medium animate-pulse">{t('syncingHistory', language)}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-card border border-border rounded-2xl shadow-xl text-center space-y-6">
        <div className="inline-flex p-3.5 bg-destructive/10 text-destructive rounded-2xl">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">{t('signInRequired', language)}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t('signInRequiredDesc', language)}
        </p>
        <Link 
          href="/login" 
          className="block w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/95 transition-all text-sm shadow-md"
        >
          {t('signInVelto', language)}
        </Link>
      </div>
    );
  }

  // Calculate day-wise statistics
  const getDayWiseStats = () => {
    const stats: Record<string, number> = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' });
      stats[date] = (stats[date] || 0) + 1;
    });
    return Object.entries(stats).map(([date, count]) => ({ date, count }));
  };

  const dayWiseStats = getDayWiseStats();
  const totalSpend = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const veltoCoins = orders.reduce((sum, o) => sum + Math.floor(Number(o.total_amount) / 200) * 10, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-6">
      
      {/* Page Header */}
      <div className="border-b border-border pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">{t('customerDashboard', language)}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('manageOrdersDesc', language)}</p>
        </div>
        <div className="bg-accent/40 border border-border px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground font-mono">
          Email: <span className="text-foreground">{user.email}</span>
        </div>
      </div>

      {/* Dynamic Personal Dispatch Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#101828]/95 border border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors">
          <div className="p-3.5 bg-primary/10 text-primary rounded-xl">
            <ClipboardList size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{t('totalOrdersPlaced', language)}</span>
            <h3 className="text-2xl font-black text-white mt-0.5">{orders.length}</h3>
          </div>
        </div>

        <div className="bg-[#101828]/95 border border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{t('totalSpend', language)}</span>
            <h3 className="text-2xl font-black text-white mt-0.5">₹{totalSpend.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-[#101828]/95 border border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors">
          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
            <span className="text-xl">🪙</span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Velto Coins</span>
            <h3 className="text-2xl font-black text-white mt-0.5">{veltoCoins.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-[#101828]/95 border border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors">
          <div className="p-3.5 bg-pink-500/10 text-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-xl">🎫</span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Gift Vouchers</span>
            <h3 className="text-2xl font-black text-white mt-0.5">3 Active</h3>
          </div>
        </div>
      </div>

      {/* ⚙️ App Preferences & Graphics Control Center */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            ⚙️ App Preferences & Engine Configuration
          </h3>
          <p className="text-xs text-muted-foreground font-semibold mt-0.5">
            Optimize graphic details, network usage, and subscription levels for your device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Liquid Glass Mode */}
          <div className="flex items-center justify-between bg-accent/25 border border-border/60 rounded-2xl p-4.5 text-left">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                🧪 Liquid Glass UI
              </h4>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Enables premium iOS 26 glass refractions & reflection effects.
              </p>
            </div>
            <button
              onClick={() => {
                setLiquidGlassMode(!liquidGlassMode);
                showToast(`Liquid Glass Mode is now ${!liquidGlassMode ? 'Enabled' : 'Disabled'}!`, 'success');
              }}
              className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center shrink-0 cursor-pointer ${
                liquidGlassMode ? 'bg-[#FF5F1F]' : 'bg-zinc-700'
              }`}
            >
              <span className={`absolute w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                liquidGlassMode ? 'translate-x-[18px]' : 'translate-x-[2px]'
              }`} />
            </button>
          </div>

          {/* Low Internet / Lite Mode */}
          <div className="flex items-center justify-between bg-accent/25 border border-border/60 rounded-2xl p-4.5 text-left">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                🔌 Data Saving / Lite Mode
              </h4>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Bypasses heavy image loading and disables transitions.
              </p>
            </div>
            <button
              onClick={() => {
                setLowInternetMode(!lowInternetMode);
                showToast(`Data Saving Mode is now ${!lowInternetMode ? 'Enabled' : 'Disabled'}!`, 'success');
              }}
              className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center shrink-0 cursor-pointer ${
                lowInternetMode ? 'bg-[#FF5F1F]' : 'bg-zinc-700'
              }`}
            >
              <span className={`absolute w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                lowInternetMode ? 'translate-x-[18px]' : 'translate-x-[2px]'
              }`} />
            </button>
          </div>

          {/* One India Pass Membership Status */}
          <div className="flex items-center justify-between bg-accent/25 border border-border/60 rounded-2xl p-4.5 text-left">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                👑 One India Pass
              </h4>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Unlocks free deliveries and zero platform charge across stores.
              </p>
            </div>
            <button
              onClick={() => {
                setOneIndiaPass(!oneIndiaPass);
                showToast(`One India Pass is now ${!oneIndiaPass ? 'Active' : 'Inactive'}!`, 'success');
              }}
              className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center shrink-0 cursor-pointer ${
                oneIndiaPass ? 'bg-[#FF5F1F]' : 'bg-zinc-700'
              }`}
            >
              <span className={`absolute w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                oneIndiaPass ? 'translate-x-[18px]' : 'translate-x-[2px]'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Family Wallet & Delegation Accounts */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              👪 {t('familyWalletTitle', language)}
            </h3>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              {t('familyWalletDesc', language)}
            </p>
          </div>
          <button
            onClick={() => {
              const name = prompt(language === 'hi' ? "परिवार के सदस्य का नाम दर्ज करें (जैसे बेटी, माँ):" : "Enter family member name (e.g. Daughter, Mother):");
              if (name) {
                showToast(language === 'hi' ? `साझा वॉलेट अनुमति के साथ ${name} को जोड़ा गया! मासिक सीमा ₹1500 निर्धारित की गई।` : `Added ${name} with shared wallet permissions! Monthly limit set to ₹1500.`, 'success');
              }
            }}
            className="bg-primary text-primary-foreground text-xs font-black uppercase py-1.5 px-3 rounded-lg hover:bg-primary/95 transition-all"
          >
            {t('addMember', language)}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Priya (Daughter - Hostel)", role: language === 'hi' ? "चाइल्ड डेलिगेट" : "Child Delegate", walletLimit: 1500, spent: 340, status: "Active" },
            { name: "Rajesh (Father)", role: language === 'hi' ? "को-ओनर" : "Co-Owner", walletLimit: 5000, spent: 1820, status: "Active" },
            { name: "Anil (Son - College)", role: language === 'hi' ? "चाइल्ड डेलिगेट" : "Child Delegate", walletLimit: 1000, spent: 980, status: "Limit Warning" }
          ].map((member, i) => (
            <div key={i} className="bg-accent/25 border border-border/60 rounded-xl p-4 space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-foreground">{member.name}</h4>
                  <span className="text-[9px] text-muted-foreground font-bold">{member.role}</span>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                  member.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500 animate-pulse"
                }`}>
                  {member.status === "Active" ? (language === 'hi' ? 'सक्रिय' : 'Active') : (language === 'hi' ? 'सीमित चेतावनी' : 'Limit Warning')}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                  <span>{language === 'hi' ? 'खर्च: ₹' : language === 'hinglish' ? 'Spent: ₹' : 'Spent: ₹'}{member.spent}</span>
                  <span>{language === 'hi' ? 'सीमा: ₹' : language === 'hinglish' ? 'Limit: ₹' : 'Limit: ₹'}{member.walletLimit}</span>
                </div>
                <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${(member.spent / member.walletLimit) * 100}%` }} 
                    className={`h-full rounded-full ${
                      (member.spent / member.walletLimit) >= 0.9 ? 'bg-rose-500' : 'bg-primary'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day-Wise Dispatch Volume */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          {t('dayWiseVolume', language)}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {dayWiseStats.slice(0, 6).map((stat, idx) => (
            <div key={idx} className="bg-accent/30 border border-border/60 rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{stat.date}</span>
              <span className="text-lg font-black text-primary mt-1">{stat.count} {stat.count === 1 ? t('orderSingular', language) : t('orderPlural', language)}</span>
            </div>
          ))}
          {dayWiseStats.length === 0 && (
            <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic">
              {t('noDispatches', language)}
            </div>
          )}
        </div>
      </div>

      {/* 🤝 Friends & Live Group Poll Contacts */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              🤝 Friends & Live Group Poll Contacts
            </h3>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              Add your squad email addresses to instantly invite them to split bills or vote on meal menus.
            </p>
          </div>
          <button
            onClick={handleAddFriend}
            className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-xs font-black uppercase py-1.5 px-3 rounded-lg hover:opacity-90 transition-all cursor-pointer"
          >
            + Add Friend
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div key={friend.id} className="bg-accent/25 border border-border/60 rounded-xl p-4 flex justify-between items-center relative overflow-hidden group">
              <div>
                <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                  {friend.name}
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                </h4>
                <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">{friend.email}</span>
                <span className="text-[8px] bg-white/5 border border-white/10 text-zinc-300 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  {friend.status}
                </span>
              </div>
              <button
                onClick={() => handleRemoveFriend(friend.id, friend.name)}
                className="text-[10px] font-black text-rose-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
          {friends.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-muted-foreground italic">
              No squad contacts saved. Click '+ Add Friend' to build your group ordering crew.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Orders Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList size={20} className="text-primary" /> {t('pastOrdersTitle', language)}
          </h2>

          {orders.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl p-12 text-center bg-card/50 space-y-4">
              <div className="inline-flex p-3 bg-accent rounded-xl text-muted-foreground">
                <Package size={24} />
              </div>
              <h3 className="font-bold text-lg">{t('noOrdersPlaced', language)}</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {t('exploreFreshProduce', language)}
              </p>
              <Link 
                href="/" 
                className="inline-block bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-md"
              >
                {t('startShopping', language)} ⚡
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-colors space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 border-b border-border pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground font-mono">#{order.id.slice(0, 8)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          order.status === 'cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          order.status === 'out_for_delivery' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {order.status === 'out_for_delivery' ? (language === 'hi' ? 'राइडर आ रहा है' : 'Zooming') : order.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.created_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-muted-foreground">{language === 'hi' ? 'कुल राशि' : 'Order Total'}</span>
                      <span className="font-extrabold text-primary text-base">₹{order.total_amount}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('orderedDeliverables', language)}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {order.order_items.map((item) => (
                        <span key={item.id} className="text-xs bg-accent border border-border/50 px-2 py-1 rounded-lg text-foreground font-medium">
                          {item.products?.name || 'Item'} x {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                      (() => {
                        const isTiffin = order.order_items?.some((item: any) => item.products?.category?.toLowerCase() === 'tiffin service');
                        const isBills = order.order_items?.some((item: any) => {
                          const cat = item.products?.category?.toLowerCase() || '';
                          return cat === 'bills & recharge' || cat === 'bills/pay' || cat === 'bills';
                        });
                        const isServices = order.order_items?.some((item: any) => {
                          const cat = item.products?.category?.toLowerCase() || '';
                          return cat === 'home services' || cat === 'services';
                        });
                        
                        return (
                          <Link 
                            href={`/orders/${order.id}`}
                            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm"
                          >
                            {isTiffin ? t('subConsole', language) :
                             isBills ? t('rechargeReceipt', language) :
                             isServices ? t('serviceStatus', language) : t('trackDelivery', language)}
                          </Link>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Link 
                          href={`/orders/${order.id}`}
                          className="flex-1 bg-accent text-accent-foreground border border-border/80 py-2.5 rounded-xl font-bold hover:bg-accent/80 transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm"
                        >
                          {t('supportCenter', language)}
                        </Link>
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => setRefundOrderId(order.id)}
                            className="flex-grow bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer"
                          >
                            {t('requestRefund', language)}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complaints Column */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert size={20} className="text-primary" /> {language === 'hi' ? 'सहायता शिकायतें' : 'Support Complaints'}
          </h2>

          {complaints.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground text-xs space-y-2 py-10 shadow-sm">
              <CheckCircle size={28} className="text-green-500 mx-auto mb-2 animate-bounce" />
              <div className="font-bold text-foreground">{t('zeroIssues', language)}</div>
              <p>{t('everythingGreat', language)}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((comp) => (
                <div key={comp.id} className="bg-card border border-border rounded-2xl p-5 space-y-3.5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground">Order ID: #{comp.order_id.slice(0, 8)}</span>
                      <h4 className="font-bold text-xs text-foreground mt-0.5">{comp.subject}</h4>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      comp.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      comp.status === 'in_progress' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {comp.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed italic bg-accent/30 p-2.5 rounded-lg border border-border/40">
                    "{comp.description}"
                  </p>

                  {/* Admin Reply */}
                  {comp.admin_reply ? (
                    <div className="space-y-1.5 border-t border-border/50 pt-2.5">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-green-500 flex items-center gap-1">
                        {t('supportResponse', language)}
                      </span>
                      <p className="text-xs font-semibold text-foreground leading-relaxed bg-green-500/5 border border-green-500/10 p-3 rounded-xl">
                        {comp.admin_reply}
                      </p>
                    </div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground italic flex items-center gap-1 border-t border-border/50 pt-2.5">
                      <Clock size={12} className="animate-spin text-primary" />
                      {t('supportReviewing', language)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      {toast && <AlertToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {refundOrderId && user && (
        <RefundModal 
          orderId={refundOrderId} 
          userId={user.id} 
          language={language} 
          onClose={() => setRefundOrderId(null)}
          onSuccess={() => {
            showToast(language === 'hi' 
              ? `🛡️ रिफंड अनुरोध प्रस्तुत किया गया। धोखाधड़ी रोकथाम जांच सक्रिय हैं।` 
              : `🛡️ Refund Request Submitted. Fraud prevention checks are active.`, 'success');
            fetchCustomerData(user.id);
          }}
        />
      )}
    </div>
  );
}
