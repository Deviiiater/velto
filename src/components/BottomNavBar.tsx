'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Bot, Zap, Compass, User } from 'lucide-react';

export function BottomNavBar() {
  const { cart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<string>('home');

  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('home');
    } else if (pathname === '/profile') {
      setActiveTab('profile');
    } else if (pathname === '/cart') {
      setActiveTab('cart');
    }
  }, [pathname]);

  const handleClick = (tab: string, targetPath: string) => {
    setActiveTab(tab);
    if (tab === 'ai') {
      // Trigger voice ordering overlay or AI chat on home screen
      window.dispatchEvent(new CustomEvent('bottom-nav-click', { detail: { type: 'ai' } }));
      if (pathname !== '/') router.push('/');
    } else if (tab === 'explore') {
      window.dispatchEvent(new CustomEvent('bottom-nav-click', { detail: { type: 'explore' } }));
      if (pathname !== '/') router.push('/');
    } else if (tab === 'bolt') {
      window.dispatchEvent(new CustomEvent('bottom-nav-click', { detail: { type: 'bolt' } }));
      if (pathname !== '/') router.push('/');
    } else if (tab === 'home') {
      window.dispatchEvent(new CustomEvent('bottom-nav-click', { detail: { type: 'home' } }));
      if (pathname !== '/') router.push('/');
    } else {
      router.push(targetPath);
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-[999] glass-panel py-2.5 px-3.5 flex justify-between items-center rounded-[2rem] border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] transform-gpu will-change-transform"
      style={{ position: 'fixed', left: '50%' }}
    >
      {/* 1. HOME TAB */}
      <button
        onClick={() => handleClick('home', '/')}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer ${
          activeTab === 'home' && pathname === '/'
            ? 'bg-gradient-to-r from-[#EC4899] to-[#FF5F1F] text-white shadow-lg font-black scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Home size={15} />
        {(activeTab === 'home' && pathname === '/') && (
          <span className="text-[10px] uppercase tracking-wider animate-in fade-in duration-300">Home</span>
        )}
      </button>

      {/* 2. AI TAB */}
      <button
        onClick={() => handleClick('ai', '/')}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer relative ${
          activeTab === 'ai'
            ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-lg font-black scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Bot size={15} />
        {activeTab === 'ai' && (
          <span className="text-[10px] uppercase tracking-wider animate-in fade-in duration-300">AI Assist</span>
        )}
      </button>

      {/* 3. BOLT TAB */}
      <button
        onClick={() => handleClick('bolt', '/')}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer relative ${
          activeTab === 'bolt'
            ? 'bg-gradient-to-r from-[#EC4899] to-[#FF5F1F] text-white shadow-lg font-black scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className="relative flex items-center">
          <Zap size={15} />
          {activeTab !== 'bolt' && (
            <span className="absolute -top-3.5 -right-6 bg-[#ff5f1f] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full scale-90 tracking-tighter">10 MIN</span>
          )}
        </div>
        {activeTab === 'bolt' && (
          <span className="text-[10px] uppercase tracking-wider animate-in fade-in duration-300">Bolt</span>
        )}
      </button>

      {/* 4. EXPLORE TAB */}
      <button
        onClick={() => handleClick('explore', '/')}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer relative ${
          activeTab === 'explore'
            ? 'bg-gradient-to-r from-[#EC4899] to-[#FF5F1F] text-white shadow-lg font-black scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Compass size={15} />
        {activeTab === 'explore' && (
          <span className="text-[10px] uppercase tracking-wider animate-in fade-in duration-300">Explore</span>
        )}
      </button>

      {/* 5. PROFILE TAB */}
      <button
        onClick={() => handleClick('profile', '/profile')}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer ${
          activeTab === 'profile'
            ? 'bg-gradient-to-r from-[#EC4899] to-[#FF5F1F] text-white shadow-lg font-black scale-105'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <User size={15} />
        {activeTab === 'profile' && (
          <span className="text-[10px] uppercase tracking-wider animate-in fade-in duration-300">Profile</span>
        )}
      </button>
    </div>
  );
}
