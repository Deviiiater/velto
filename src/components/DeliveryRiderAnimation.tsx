'use client';
import { useState } from 'react';
import { Zap, MapPin } from 'lucide-react';

export default function DeliveryRiderAnimation() {
  const [speed, setSpeed] = useState<'normal' | 'fast'>('normal');

  return (
    <div 
      onMouseEnter={() => setSpeed('fast')}
      onMouseLeave={() => setSpeed('normal')}
      className="relative w-full overflow-hidden bg-[#071c14] border border-[#10b981]/15 rounded-3xl p-5 shadow-xl select-none flex items-center justify-between text-left transition-all duration-300 hover:border-[#10b981]/30 hover:shadow-2xl"
    >
      {/* 🟢 Glow aura background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(16,185,129,0.05)_0%,transparent_60%)] pointer-events-none" />

      {/* Left Column Text */}
      <div className="flex flex-col gap-0.5 z-10">
        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block">Faster deliveries</span>
        <h4 className="text-sm font-black text-white tracking-tight leading-snug max-w-[160px] sm:max-w-xs mt-0.5">
          Hover to boost rider speed 🚀
        </h4>
        <button className="mt-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10b981] border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all w-fit cursor-pointer">
          Learn More
        </button>
      </div>

      {/* Middle/Right Map Track & Rider */}
      <div className="flex-1 flex items-center justify-end gap-6 z-10 max-w-[55%]">
        
        {/* Track path with moving rider */}
        <div className="relative w-32 sm:w-44 h-12 flex items-center">
          {/* Dotted path line */}
          <div className="w-full h-px border-t border-dashed border-emerald-500/30 relative"></div>
          
          {/* Start & End Map Pins */}
          <div className="absolute left-0 -translate-y-1/2 top-1/2 text-emerald-500/60">
            <div className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-400/30 animate-pulse"></div>
          </div>
          <div className="absolute right-0 -translate-y-1/2 top-1/2 text-emerald-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 border border-[#b5ff3b] animate-ping"></div>
          </div>

          {/* Delivery Rider Scooter */}
          <div 
            className="absolute top-1.5 h-10 w-10 flex items-center justify-center transition-all duration-300"
            style={{
              left: speed === 'fast' ? '70%' : '20%',
              animation: speed === 'fast' ? 'rumble 0.15s infinite ease-in-out' : 'rumble 0.4s infinite ease-in-out',
              transitionDuration: speed === 'fast' ? '0.6s' : '1.5s',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            <svg viewBox="0 0 100 100" className="w-9 h-9 text-[#b5ff3b]" fill="currentColor">
              {/* Scooter Main Body */}
              <path d="M20 70 C20 60 25 55 35 55 L65 55 C70 55 75 58 78 62 L85 70 C87 72 85 75 80 75 L30 75 Z" className="fill-emerald-800" />
              
              {/* Wheels */}
              <circle cx="32" cy="76" r="10" className="fill-zinc-900 stroke-[#b5ff3b] stroke-2" />
              <circle cx="32" cy="76" r="4" className="fill-white" />
              <circle cx="70" cy="76" r="10" className="fill-zinc-900 stroke-[#b5ff3b] stroke-2" />
              <circle cx="70" cy="76" r="4" className="fill-white" />

              {/* Scooter Steering Handle */}
              <path d="M72 55 L78 30 C79 28 82 28 83 30 L85 36" stroke="#b5ff3b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              
              {/* Delivery Box with 'V' Logo */}
              <rect x="12" y="42" width="18" height="18" rx="3" className="fill-emerald-500" />
              <text x="21" y="55" fontSize="12" fontWeight="900" fill="#white" textAnchor="middle" className="fill-white font-sans font-black">v</text>
              
              {/* Rider Helmet and Jacket */}
              <circle cx="48" cy="30" r="7" className="fill-zinc-200" />
              <path d="M48 24 L52 24 C55 24 57 26 56 29 Z" className="fill-emerald-950" />
              <path d="M38 48 C38 40 43 37 48 37 C53 37 56 40 56 48 L46 55 Z" className="fill-emerald-600" />
            </svg>

            {/* Jet sparks trail when fast */}
            {speed === 'fast' && (
              <div className="absolute left-[-10px] top-4 flex gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping inline-block"></span>
                <span className="w-1 h-1 rounded-full bg-yellow-400 animate-ping inline-block"></span>
              </div>
            )}
          </div>
        </div>

        {/* Lightning Boost Button */}
        <div 
          className={`w-12 h-12 rounded-full bg-[#10b981] text-[#071c14] flex items-center justify-center shadow-lg transition-all duration-300 relative shrink-0 cursor-pointer ${
            speed === 'fast' 
              ? 'scale-110 rotate-12 bg-[#b5ff3b] shadow-[#b5ff3b]/30 shadow-2xl' 
              : 'shadow-emerald-500/20'
          }`}
        >
          {speed === 'fast' && (
            <span className="absolute inset-0 rounded-full bg-[#b5ff3b]/20 blur-md animate-ping" />
          )}
          <Zap size={20} className={speed === 'fast' ? 'stroke-[2.5] text-black' : 'stroke-[2.5] text-black'} />
        </div>

      </div>

      {/* Global rumble keyframe */}
      <style jsx global>{`
        @keyframes rumble {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
}
