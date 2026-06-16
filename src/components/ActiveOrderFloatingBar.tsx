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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-[9999] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card/90 backdrop-blur-md border border-primary/45 rounded-2xl p-4 shadow-[0_8px_30px_rgb(147,51,234,0.15)] flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Pulsing indicator */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('veltoActiveOrder', language)}</div>
            <div className="text-sm font-extrabold text-foreground leading-tight mt-0.5">
              {getStatusText(activeOrder.status)}
            </div>
          </div>
        </div>

        <Link 
          href={`/orders/${activeOrder.id}`} 
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(147,51,234,0.2)] whitespace-nowrap"
        >
          {t('trackLive', language)} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
