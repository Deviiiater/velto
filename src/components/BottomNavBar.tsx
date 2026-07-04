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
    <div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-[999] bg-[#09090B]/90 backdrop-blur-xl py-2 px-3 flex justify-between items-center rounded-[2rem] border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] transform-gpu will-change-transform"
      style={{ position: 'fixed', left: '50%' }}
    >
      {/* 1. FOOD TAB */}
      <button
        onClick={() => handleClick('food', '/')}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer ${
          (activeTab === 'food' || activeTab === '') && pathname === '/'
            ? 'bg-gradient-to-r from-[#EC4899] to-[#FF5F1F] text-white shadow-lg font-black scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Utensils size={15} />
        {((activeTab === 'food' || activeTab === '') && pathname === '/') && (
          <span className="text-[10px] uppercase tracking-wider animate-in fade-in duration-300">Food</span>
        )}
      </button>

      {/* 2. BOLT TAB */}
      <button
        onClick={() => handleClick('bolt', '/')}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer relative ${
          activeTab === 'bolt' && pathname === '/'
            ? 'bg-gradient-to-r from-[#EC4899] to-[#FF5F1F] text-white shadow-lg font-black scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className="relative flex items-center">
          <Zap size={15} />
          {!(activeTab === 'bolt' && pathname === '/') && (
            <span className="absolute -top-3.5 -right-6 bg-[#ff5f1f] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full scale-90 tracking-tighter">15 MIN</span>
          )}
        </div>
        {(activeTab === 'bolt' && pathname === '/') && (
          <span className="text-[10px] uppercase tracking-wider animate-in fade-in duration-300">Bolt</span>
        )}
      </button>

      {/* 3. 99 STORE TAB */}
      <button
        onClick={() => handleClick('offer', '/')}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer relative ${
          activeTab === 'offer' && pathname === '/'
            ? 'bg-gradient-to-r from-[#EC4899] to-[#FF5F1F] text-white shadow-lg font-black scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className="relative flex items-center">
          <Tag size={15} />
          {!(activeTab === 'offer' && pathname === '/') && (
            <span className="absolute -top-3.5 -right-4 bg-amber-500 text-black font-extrabold text-[8px] px-1 rounded-full">99</span>
          )}
        </div>
        {(activeTab === 'offer' && pathname === '/') && (
          <span className="text-[10px] uppercase tracking-wider animate-in fade-in duration-300">99 Store</span>
        )}
      </button>

      {/* 4. CART TAB */}
      <button
        onClick={() => router.push('/cart')}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer relative ${
          pathname === '/cart'
            ? 'bg-gradient-to-r from-[#EC4899] to-[#FF5F1F] text-white shadow-lg font-black scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className="relative flex items-center">
          <ShoppingBag size={15} />
          {cart.length > 0 && !(pathname === '/cart') && (
            <span className="absolute -top-3.5 -right-3.5 bg-[#ff5f1f] text-white text-[7px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
              {cart.length}
            </span>
          )}
        </div>
        {(pathname === '/cart') && (
          <span className="text-[10px] uppercase tracking-wider animate-in fade-in duration-300">Cart</span>
        )}
      </button>

      {/* 5. REORDER TAB */}
      <button
        onClick={() => handleClick('reorder', '/')}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer ${
          activeTab === 'reorder' && pathname === '/'
            ? 'bg-gradient-to-r from-[#EC4899] to-[#FF5F1F] text-white shadow-lg font-black scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <History size={15} />
        {(activeTab === 'reorder' && pathname === '/') && (
          <span className="text-[10px] uppercase tracking-wider animate-in fade-in duration-300">Reorder</span>
        )}
      </button>
    </div>
  );
}
