'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Bike } from 'lucide-react';

import { useSettings } from '@/context/SettingsContext';

export default function DeliveryRiderAnimation() {
  const { lowInternetMode } = useSettings();
  const [speed, setSpeed] = useState('normal'); // 'normal' | 'fast'
  const [showSpeech, setShowSpeech] = useState(false);
  const [slogan, setSlogan] = useState("Delivering Freshness under 10 Mins!");

  if (lowInternetMode) {
    return (
      <div className="relative w-full h-[80px] bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-4 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Bike size={24} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-primary tracking-wider">Superfast Doorstep Delivery</h4>
            <p className="text-[10px] text-zinc-200 font-semibold">Delivered in 10 minutes from our nearest hub.</p>
          </div>
        </div>
        <div className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
          Active
        </div>
      </div>
    );
  }

  const slogans = [
    "Delivering Freshness under 10 Mins!",
    "Lucknow, Delhi, Bangalore - We are flying!",
    "Farm to Table, in a flash!",
    "Red light? Dijkstra routing finds a way!",
    "Traffic or Rain, we got you covered!"
  ];

  // Rotate slogan every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomSlogan = slogans[Math.floor(Math.random() * slogans.length)];
      setSlogan(randomSlogan);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseEnter = () => {
    setSpeed('fast');
    setShowSpeech(true);
  };

  const handleMouseLeave = () => {
    setSpeed('normal');
    setShowSpeech(false);
  };

  return (
    <div 
      className="relative w-full overflow-hidden h-[180px] bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-4 shadow-sm select-none cursor-pointer transition-all duration-300 hover:shadow-md hover:border-white/20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Scrolling Clouds Background (Slower and smoother) */}
      <div 
        className="absolute top-4 left-0 w-[200%] h-6 flex gap-48 opacity-30 pointer-events-none"
        style={{
          animation: speed === 'fast' ? 'bg-scroll 10s linear infinite' : 'bg-scroll 18s linear infinite'
        }}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" className="text-muted-foreground/40 fill-muted-foreground/15"><path d="M19.36 10.04A6 6 0 0 0 8 11a4 4 0 1 0-.64 7.92H19.5a3.5 3.5 0 0 0 .14-7.88Z" /></svg>
        <svg viewBox="0 0 24 24" width="16" height="16" className="text-muted-foreground/40 fill-muted-foreground/15"><path d="M19.36 10.04A6 6 0 0 0 8 11a4 4 0 1 0-.64 7.92H19.5a3.5 3.5 0 0 0 .14-7.88Z" /></svg>
        <svg viewBox="0 0 24 24" width="22" height="22" className="text-muted-foreground/40 fill-muted-foreground/15"><path d="M19.36 10.04A6 6 0 0 0 8 11a4 4 0 1 0-.64 7.92H19.5a3.5 3.5 0 0 0 .14-7.88Z" /></svg>
        <svg viewBox="0 0 24 24" width="16" height="16" className="text-muted-foreground/40 fill-muted-foreground/15"><path d="M19.36 10.04A6 6 0 0 0 8 11a4 4 0 1 0-.64 7.92H19.5a3.5 3.5 0 0 0 .14-7.88Z" /></svg>
      </div>

      {/* Speech Bubble */}
      <div className={`absolute top-2 left-[50%] sm:left-[45%] bg-primary text-primary-foreground font-black text-[10px] sm:text-xs px-4 py-2 rounded-full shadow-lg border border-primary-foreground/10 transition-all duration-300 z-10 flex items-center gap-1 ${
        showSpeech ? 'opacity-100 scale-100 -translate-y-0' : 'opacity-0 scale-95 translate-y-2'
      }`}>
        <Sparkles size={12} className="animate-spin" /> {slogan}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45 border-r border-b border-primary-foreground/10"></div>
      </div>

      {/* 2. Scrolling Background Trees (Parallax landscape layer) */}
      <div 
        className="absolute bottom-10 left-0 w-[300%] h-8 flex gap-32 opacity-20 pointer-events-none items-end"
        style={{
          animation: speed === 'fast' ? 'bg-scroll 4s linear infinite' : 'bg-scroll 8s linear infinite'
        }}
      >
        <div className="w-1.5 h-6 bg-emerald-500 rounded-t-full"></div>
        <div className="w-2.5 h-8 bg-emerald-500"></div>
        <div className="w-2 h-7 bg-emerald-500 rounded-t-full"></div>
        <div className="w-1 h-5 bg-emerald-500"></div>
        <div className="w-2.5 h-8 bg-emerald-500 rounded-t-full"></div>
        <div className="w-1.5 h-6 bg-emerald-500"></div>
      </div>

      {/* Road solid boundary line */}
      <div className="absolute bottom-10 left-0 right-0 h-[2px] bg-border/40"></div>

      {/* 3. Infinite Scrolling Road Lane Stripes */}
      <div 
        className="absolute bottom-4 left-0 right-0 h-4 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 16px, transparent 16px, transparent 32px)',
          backgroundSize: '64px 100%',
          animation: speed === 'fast' ? 'scroll-road-bg 0.5s linear infinite' : 'scroll-road-bg 1s linear infinite'
        }}
      ></div>

      {/* 4. Centered Rumble Rider Group */}
      <div 
        className={`absolute bottom-6 left-[15%] sm:left-[25%] flex items-end pointer-events-none ${
          speed === 'fast' 
            ? 'animate-[rumble-heavy_0.3s_infinite_ease-in-out]' 
            : 'animate-[rumble-light_0.6s_infinite_ease-in-out]'
        }`}
        style={{ transformOrigin: 'bottom right' }}
      >
        {/* Exhaust Flame Sparks (Speed mode only) */}
        {speed === 'fast' && (
          <div className="flex gap-0.5 mr-1 mb-2.5 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block"></span>
          </div>
        )}

        {/* Vector SVG Scooter Rider */}
        <svg 
          width="80" 
          height="70" 
          viewBox="0 0 100 85" 
          className="transition-transform duration-300"
          style={{ transform: speed === 'fast' ? 'rotate(-5deg)' : 'none' }}
        >
          {/* Scooter Body Back */}
          <path d="M15,65 L35,62 L45,55 L30,50 Z" fill="#88888F" />
          
          {/* Wheel Back */}
          <g 
            className={speed === 'fast' ? 'animate-[spin_0.2s_linear_infinite]' : 'animate-[spin_0.6s_linear_infinite]'}
            style={{ transformOrigin: '22px 70px' }}
          >
            <circle cx="22" cy="70" r="11" fill="#18181B" stroke="#888" strokeWidth="2" />
            <circle cx="22" cy="70" r="4" fill="#E4E4E7" />
            <line x1="22" y1="59" x2="22" y2="81" stroke="#E4E4E7" strokeWidth="1" />
            <line x1="11" y1="70" x2="33" y2="70" stroke="#E4E4E7" strokeWidth="1" />
            <line x1="14" y1="62" x2="30" y2="78" stroke="#E4E4E7" strokeWidth="1" />
            <line x1="14" y1="78" x2="30" y2="62" stroke="#E4E4E7" strokeWidth="1" />
          </g>

          {/* Delivery Box (Velto PWA Mint Branding) */}
          <rect x="5" y="32" width="26" height="26" rx="4" fill="#00b074" stroke="#00905e" strokeWidth="1.5" />
          <rect x="9" y="36" width="18" height="4" fill="#ffffff" opacity="0.2" />
          <path d="M14,40 L18,48 L22,40" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Rider Silhouette Body */}
          <path d="M38,28 L52,24 L60,42 L48,58 L32,54 Z" fill="#2d2d30" />
          <path d="M48,34 L68,36 L66,42 Z" fill="#18181b" />
          
          {/* Rider Jacket */}
          <path d="M38,30 L50,26 L55,42 L40,46 Z" fill="#00b074" />
          
          {/* Rider Helmet */}
          <circle cx="50" cy="18" r="9" fill="#18181B" />
          <circle cx="50" cy="18" r="8.5" fill="#00b074" />
          <path d="M52,14 C58,14 59,20 54,22 Z" fill="#18181b" />
          
          {/* Scooter Front Panel */}
          <path d="M68,36 L64,68 L56,66 L62,38 Z" fill="#E4E4E7" />
          <line x1="68" y1="36" x2="62" y2="34" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Front Light Beam */}
          <path d="M66,40 L72,41 L70,46 Z" fill="#facc15" />
          {speed === 'fast' && (
            <path d="M72,41 L98,32 L98,58 Z" fill="url(#lightGrad)" opacity="0.3" />
          )}

          {/* Wheel Front */}
          <g 
            className={speed === 'fast' ? 'animate-[spin_0.2s_linear_infinite]' : 'animate-[spin_0.6s_linear_infinite]'}
            style={{ transformOrigin: '65px 70px' }}
          >
            <circle cx="65" cy="70" r="11" fill="#18181B" stroke="#888" strokeWidth="2" />
            <circle cx="65" cy="70" r="4" fill="#E4E4E7" />
            <line x1="65" y1="59" x2="65" y2="81" stroke="#E4E4E7" strokeWidth="1" />
            <line x1="54" y1="70" x2="76" y2="70" stroke="#E4E4E7" strokeWidth="1" />
            <line x1="57" y1="62" x2="73" y2="78" stroke="#E4E4E7" strokeWidth="1" />
            <line x1="57" y1="78" x2="73" y2="62" stroke="#E4E4E7" strokeWidth="1" />
          </g>

          <defs>
            <linearGradient id="lightGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 5. Scrolling Wind particles (Slower, elegant) */}
      <div className={`absolute bottom-16 right-0 left-0 h-10 overflow-hidden pointer-events-none transition-opacity duration-300 ${
        speed === 'fast' ? 'opacity-60' : 'opacity-20'
      }`}>
        <div className="absolute h-0.5 bg-primary/40 rounded-full animate-[wind_1.2s_infinite_linear] w-12 top-2"></div>
        <div className="absolute h-0.5 bg-primary/30 rounded-full animate-[wind_0.9s_infinite_linear] w-8 top-6" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Active Area Badge */}
      <div className="absolute bottom-2 left-4 text-[9px] font-bold text-muted-foreground tracking-wide flex items-center gap-1.5 uppercase">
        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-ping inline-block"></span>
        HOVER TO BOOST RIDER SPEED <svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor" className="inline-block animate-pulse text-primary"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>

      {/* Injecting CSS Keyframes directly */}
      <style jsx global>{`
        @keyframes bg-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-road-bg {
          0% { background-position-x: 0px; }
          100% { background-position-x: -64px; }
        }
        @keyframes rumble-light {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(0.5deg); }
        }
        @keyframes rumble-heavy {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-3px) rotate(-6.5deg); }
        }
        @keyframes wind {
          0% { transform: translateX(400px); opacity: 0; }
          40% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateX(-150px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
