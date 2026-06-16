'use client';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, LogOut, User as UserIcon, Package, Bike, Shield, Sun, Moon, Trash2, Settings, Globe, Crown, ZapOff } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { t } from '@/lib/translations';

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { cart, clearCart } = useCart();

  if (
    pathname.includes('/kitchen') ||
    pathname.includes('/warehouse') ||
    pathname.includes('/admin') ||
    pathname.includes('/store-panel') ||
    pathname.includes('/rider-panel') ||
    pathname.includes('/support-panel')
  ) {
    return null;
  }
  const { 
    lowInternetMode, setLowInternetMode, 
    oneIndiaPass, setOneIndiaPass, 
    language, setLanguage 
  } = useSettings();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const targetNode = e.target as Node;
      // If the clicked target element was unmounted or detached from the document body
      // during a React state update, we ignore it to prevent accidental dropdown closing.
      if (targetNode && !document.body.contains(targetNode)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(targetNode)) {
        setShowSettingsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="border-b border-border/40 backdrop-blur-md bg-background/80 p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg shadow-black/10">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Velto Logo" className="h-9 w-auto object-contain hover:scale-105 transition-transform duration-300" />
          <div className="hidden md:flex flex-col border-l border-border/80 pl-3">
            <span className="text-[11px] font-black text-foreground tracking-tight">Velto Dispatch</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Delivering Freshness. Under 10 Mins. ⚡</span>
          </div>
        </Link>
      </div>
      <nav className="flex items-center gap-4">
        
        {loading ? (
          <div className="w-20 h-8 bg-accent animate-pulse rounded-md"></div>
        ) : user ? (
          <>
            <span className="text-sm font-medium hidden lg:block text-muted-foreground font-mono">
              {user.email}
            </span>
            <Link 
              href="/profile" 
              className="px-4 py-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-muted-foreground flex items-center gap-1.5 text-xs font-black uppercase tracking-wider border border-border/60 bg-muted/40 shadow-sm hover:scale-[1.03] active:scale-95 duration-200"
              title={t('myOrders', language)}
            >
              <Package size={16} className="text-primary animate-pulse" />
              <span>{t('myOrders', language)}</span>
            </Link>
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="p-2.5 hover:bg-destructive/10 hover:text-destructive rounded-full transition-all text-muted-foreground border border-border/60 bg-muted/40 shadow-sm hover:scale-[1.03] active:scale-95 duration-200"
              title={t('logout', language)}
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link href="/login" className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors flex items-center gap-2">
            <UserIcon size={18} /> {t('login', language)}
          </Link>
        )}
        
        {/* Preferences settings controls dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
            className={`p-2.5 rounded-xl transition-all duration-300 border shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 ${
              lowInternetMode || oneIndiaPass 
                ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' 
                : 'text-muted-foreground hover:text-foreground border-border/60 bg-muted/40'
            }`}
            title="Preferences & Settings"
          >
            <Settings size={18} className={showSettingsDropdown ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
          </button>
          
          {showSettingsDropdown && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-2.5 w-64 bg-background border border-border shadow-2xl rounded-2xl p-4 space-y-4 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <h3 className="text-xs font-black uppercase tracking-wider border-b border-border/60 pb-2 text-foreground">
                {t('preferences', language)}
              </h3>
              
              {/* Language Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                  <Globe size={11} /> {t('appLanguage', language)}
                </label>
                <div className="grid grid-cols-3 gap-1 bg-accent/30 p-1 rounded-lg">
                  {(['en', 'hi', 'hinglish'] as const).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage(lang);
                        setTimeout(() => setShowSettingsDropdown(false), 200);
                      }}
                      className={`text-[10px] font-black py-2 px-1.5 rounded uppercase transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                        language === lang ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/40'
                      }`}
                    >
                      {lang === 'hinglish' ? 'Hing' : lang}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Low Internet Mode */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                    {lowInternetMode && <ZapOff size={12} className="text-amber-500" />}
                    {t('liteMode', language)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{t('liteModeDesc', language)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLowInternetMode(!lowInternetMode)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-300 flex items-center cursor-pointer ${
                    lowInternetMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-zinc-700'
                  }`}
                  aria-label="Toggle low internet mode"
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    lowInternetMode ? 'translate-x-4' : 'translate-x-0'
                  }`}></span>
                </button>
              </div>
 
              {/* One India Pass */}
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-amber-500">
                    <Crown size={12} className="fill-amber-500" />
                    {t('oneIndiaPass', language)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{t('oneIndiaPassDesc', language)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOneIndiaPass(!oneIndiaPass)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-300 flex items-center cursor-pointer ${
                    oneIndiaPass ? 'bg-amber-500' : 'bg-slate-300 dark:bg-zinc-700'
                  }`}
                  aria-label="Toggle One India Pass"
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    oneIndiaPass ? 'translate-x-4' : 'translate-x-0'
                  }`}></span>
                </button>
              </div>
            </div>
          )}
        </div>
 
        <button 
          onClick={toggleTheme}
          className="p-2.5 hover:bg-primary/10 rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground border border-border/60 bg-muted/40 shadow-sm flex items-center justify-center hover:scale-105 active:scale-95"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-yellow-500 animate-[spin_8s_linear_infinite]" />
          ) : (
            <Moon size={18} className="text-blue-500 hover:rotate-12 transition-transform duration-300" />
          )}
        </button>
 
        <div className="flex items-center gap-2">
          <Link href="/cart" className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-[1.03] active:scale-95 duration-200 flex items-center gap-2">
            <ShoppingCart size={18} /> {t('cart', language)} ({cart.length})
          </Link>
          {cart.length > 0 && (
            <button 
              onClick={() => clearCart()}
              className="p-2.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive hover:text-white transition-all shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 duration-200"
              title="Clear all basket items"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
