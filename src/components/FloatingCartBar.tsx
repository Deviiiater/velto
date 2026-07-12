'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { t } from '@/lib/translations';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';

type ActiveOrder = {
  id: string;
  status: string;
};

export function FloatingCartBar() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { language } = useSettings();
  const pathname = usePathname();
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  // Check if an active order exists to determine vertical stack offset
  const checkActiveOrder = async () => {
    if (!user) {
      setHasActiveOrder(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['pending', 'packing', 'accepted', 'out_for_delivery'])
        .limit(1);

      if (!error && data && data.length > 0) {
        setHasActiveOrder(true);
      } else {
        setHasActiveOrder(false);
      }
    } catch (e) {
      setHasActiveOrder(false);
    }
  };

  useEffect(() => {
    checkActiveOrder();
    
    if (!user) return;
    
    const channel = supabase
      .channel(`cart-tracking-sync-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => {
          checkActiveOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Don't render floating cart bar if:
  // 1. Cart is empty
  // 2. Currently on the cart checkout page
  // 3. Currently on dashboard panels (warehouse/rider/admin/kitchen)
  if (
    cart.length === 0 || 
    pathname.includes('/cart') || 
    pathname.includes('/store-panel') || 
    pathname.includes('/rider-panel') || 
    pathname.includes('/kitchen') || 
    pathname.includes('/admin') ||
    pathname.includes('/warehouse')
  ) {
    return null;
  }

  // Calculate total items count
  const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Determine dynamic vertical offset depending on whether active tracking bar is displayed
  const bottomPositionClass = hasActiveOrder ? 'bottom-[172px]' : 'bottom-[90px]';

  return (
    <div className={`fixed ${bottomPositionClass} left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-[9998] transition-all duration-500 ease-out animate-in slide-in-from-bottom-4`}>
      <div className="bg-emerald-500 text-white rounded-2xl p-4 shadow-[0_8px_32px_rgba(16,185,129,0.25)] flex justify-between items-center gap-4 border border-emerald-400/30 relative overflow-hidden">
        {/* Dynamic ambient pulse decorative element */}
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl flex items-center justify-center shadow-inner">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-100/90">
              {t('instamartBasket', language)}
            </div>
            <div className="text-sm font-extrabold leading-tight mt-0.5">
              {t('itemsAdded', language)
                .replace('{count}', String(itemsCount))
                .replace('{total}', String(total))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={() => clearCart()}
            className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-inner"
            title={t('clearBasketTooltip', language)}
          >
            <Trash2 size={16} />
          </button>
          <Link 
            href="/cart" 
            className="bg-white text-emerald-600 hover:bg-emerald-50 active:scale-95 font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(255,255,255,0.15)] whitespace-nowrap"
          >
            {t('viewBasket', language)} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
