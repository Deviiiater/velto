'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { Utensils, Zap, Tag, ShoppingBag, History } from 'lucide-react';

export function BottomNavBar() {
  const { cart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<string>('');

  // Listen to state changes from page.tsx to update highlighted icon
  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;

      const { activeSuperService, studentMode, searchQuery, activePill } = detail;
      
      if (studentMode) {
        setActiveTab('bolt');
      } else if (searchQuery?.toLowerCase().includes('offer')) {
        setActiveTab('offer');
      } else if (activePill === 'reorder') {
        setActiveTab('reorder');
      } else if (activeSuperService === 'food') {
        setActiveTab('food');
      } else {
        setActiveTab('');
      }
    };

    window.addEventListener('page-state-change', handleStateChange);
    return () => window.removeEventListener('page-state-change', handleStateChange);
  }, []);

  // Set active tab based on path initially or reset if not on home page
  useEffect(() => {
    if (pathname !== '/') {
      setActiveTab(pathname === '/cart' ? 'cart' : '');
    }
  }, [pathname]);

  const handleClick = (type: string, targetPath: string) => {
    if (pathname === '/') {
      window.dispatchEvent(new CustomEvent('bottom-nav-click', { detail: { type } }));
    } else {
      router.push(targetPath);
      // Wait for navigation before sending the event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('bottom-nav-click', { detail: { type } }));
      }, 150);
    }
  };

  // Hide the navigation bar on admin/rider/vendor panels
  if (
    pathname.includes('/store-panel') || 
    pathname.includes('/rider-panel') || 
    pathname.includes('/kitchen') || 
    pathname.includes('/admin') ||
    pathname.includes('/warehouse')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-[999] glass-panel py-2.5 px-3 flex justify-between items-center rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-white/10">
      <button
        onClick={() => handleClick('food', '/')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer ${
          activeTab === 'food' && pathname === '/' ? 'text-primary scale-105 font-black' : 'text-muted-foreground font-bold'
        }`}
      >
        <Utensils size={18} />
        <span className="text-[9px] uppercase tracking-wider mt-0.5">Food</span>
      </button>

      <button
        onClick={() => handleClick('bolt', '/')}
        className={`flex flex-col items-center justify-center gap-1 flex-grow relative transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer ${
          activeTab === 'bolt' && pathname === '/' ? 'text-primary scale-105 font-black' : 'text-muted-foreground font-bold'
        }`}
      >
        <div className="relative">
          <Zap size={18} className="text-amber-500" />
          <span className="absolute -top-1.5 -right-5 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full scale-90 tracking-tighter">15 MIN</span>
        </div>
        <span className="text-[9px] uppercase tracking-wider mt-0.5">Bolt</span>
      </button>

      <button
        onClick={() => handleClick('offer', '/')}
        className={`flex flex-col items-center justify-center gap-1 flex-grow transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer ${
          activeTab === 'offer' && pathname === '/' ? 'text-primary scale-105 font-black' : 'text-muted-foreground font-bold'
        }`}
      >
        <div className="relative">
          <Tag size={18} className="text-emerald-500" />
          <span className="absolute -top-1.5 -right-3 text-emerald-500 font-extrabold text-[8px] bg-emerald-500/10 px-1 rounded-full">99</span>
        </div>
        <span className="text-[9px] uppercase tracking-wider mt-0.5">99 Store</span>
      </button>

      <button
        onClick={() => router.push('/cart')}
        className={`flex flex-col items-center justify-center gap-1 flex-grow relative transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer ${
          pathname === '/cart' ? 'text-primary scale-105 font-black' : 'text-muted-foreground font-bold'
        }`}
      >
        <div className="relative">
          <ShoppingBag size={18} />
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
              {cart.length}
            </span>
          )}
        </div>
        <span className="text-[9px] uppercase tracking-wider mt-0.5">Cart</span>
      </button>

      <button
        onClick={() => handleClick('reorder', '/')}
        className={`flex flex-col items-center justify-center gap-1 flex-grow transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer ${
          activeTab === 'reorder' && pathname === '/' ? 'text-primary scale-105 font-black' : 'text-muted-foreground font-bold'
        }`}
      >
        <History size={18} />
        <span className="text-[9px] uppercase tracking-wider mt-0.5">Reorder</span>
      </button>
    </div>
  );
}
