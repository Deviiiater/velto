'use client';
import { useState, useEffect } from 'react';

export default function WelcomeSplash() {
  const [phase, setPhase] = useState<'riding' | 'logo'>('riding');

  useEffect(() => {
    // Transition from rider riding to logo reveal after 3.2 seconds
    const timer = setTimeout(() => {
      setPhase('logo');
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0c1e15] flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background glowing particle effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,255,59,0.08)_0%,transparent_70%)] pointer-events-none" />

      {phase === 'riding' ? (
        <div className="relative w-full max-w-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          
          {/* Riding animation container */}
          <div className="relative w-full h-48 flex items-center justify-center">
            
            {/* Scooter / Bike Rider */}
            <div className="relative animate-scooter-ride">
              <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#b5ff3b]" fill="currentColor">
                {/* Scooter Main Body */}
                <path d="M20 70 C20 60 25 55 35 55 L65 55 C70 55 75 58 78 62 L85 70 C87 72 85 75 80 75 L30 75 C25 75 20 72 20 70 Z" className="fill-emerald-800" />
                
                {/* Wheels */}
                <circle cx="32" cy="76" r="10" className="fill-zinc-900 stroke-[#b5ff3b] stroke-2" />
                <circle cx="32" cy="76" r="4" className="fill-white" />
                <circle cx="70" cy="76" r="10" className="fill-zinc-900 stroke-[#b5ff3b] stroke-2" />
                <circle cx="70" cy="76" r="4" className="fill-white" />

                {/* Scooter Details (Steering / Windshield) */}
                <path d="M72 55 L78 30 C79 28 82 28 83 30 L85 36" stroke="#b5ff3b" strokeWidth="3" fill="none" strokeLinecap="round" />
                
                {/* Delivery Box / Parcel on Back */}
                <rect x="12" y="42" width="18" height="18" rx="2" className="fill-amber-500 stroke-amber-600 stroke-1" />
                {/* Ribbon on Box */}
                <line x1="21" y1="42" x2="21" y2="60" stroke="#fff" strokeWidth="2" />
                
                {/* Rider Silhouette */}
                <circle cx="48" cy="30" r="7" className="fill-zinc-200" />
                <path d="M48 24 L52 24 C55 24 57 26 56 29 L54 33" stroke="#b5ff3b" strokeWidth="2" fill="none" />
                <path d="M38 48 C38 40 43 37 48 37 C53 37 56 40 56 48 L46 55 Z" className="fill-zinc-800" />
                <path d="M50 44 L68 46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>

              {/* Speed Lines */}
              <div className="absolute top-10 left-[-40px] flex flex-col gap-2 opacity-60">
                <div className="w-8 h-1 bg-[#b5ff3b] rounded-full animate-speed-line-1" />
                <div className="w-12 h-1 bg-white rounded-full animate-speed-line-2" />
                <div className="w-6 h-1 bg-[#b5ff3b] rounded-full animate-speed-line-3" />
              </div>
            </div>
            
            {/* Dust Particles */}
            <div className="absolute bottom-6 left-[12%] flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20 animate-dust-cloud-1" />
              <div className="w-3.5 h-3.5 rounded-full bg-white/10 animate-dust-cloud-2" />
              <div className="w-2 h-2 rounded-full bg-white/20 animate-dust-cloud-3" />
            </div>
          </div>

          {/* Ground road line */}
          <div className="w-64 h-[3px] bg-gradient-to-r from-transparent via-[#b5ff3b]/40 to-transparent relative overflow-hidden mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-16 animate-road-dash" />
          </div>

          {/* Text Title */}
          <div className="mt-8 text-center space-y-1">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#b5ff3b] animate-pulse">Zooming Delivery</h2>
            <p className="text-[10px] font-bold text-emerald-100/50">Your rider is packing essentials...</p>
          </div>
          
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
          {/* Logo container with radial pulse */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#b5ff3b]/20 blur-xl animate-pulse duration-1000" />
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative z-10 p-3">
              <img src="/logo.png" alt="Velto Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Brand details */}
          <div className="mt-6 text-center space-y-1">
            <h1 className="text-xl font-black tracking-widest text-white uppercase">Velto</h1>
            <p className="text-xs font-semibold text-[#b5ff3b] tracking-wider">10-Min Super App</p>
          </div>
        </div>
      )}

      {/* Custom keyframe animations */}
      <style jsx global>{`
        @keyframes scooter-ride {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(-1deg); }
        }
        @keyframes road-dash {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(200px); }
        }
        @keyframes speed-line {
          0% { transform: translateX(20px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(-50px); opacity: 0; }
        }
        @keyframes dust-cloud {
          0% { transform: scale(0.6) translate(10px, 0); opacity: 0.8; }
          100% { transform: scale(1.4) translate(-40px, -10px); opacity: 0; }
        }
        .animate-scooter-ride {
          animation: scooter-ride 0.35s infinite ease-in-out;
        }
        .animate-road-dash {
          animation: road-dash 0.6s infinite linear;
        }
        .animate-speed-line-1 {
          animation: speed-line 0.5s infinite linear;
        }
        .animate-speed-line-2 {
          animation: speed-line 0.4s infinite linear 0.1s;
        }
        .animate-speed-line-3 {
          animation: speed-line 0.6s infinite linear 0.2s;
        }
        .animate-dust-cloud-1 {
          animation: dust-cloud 0.5s infinite linear;
        }
        .animate-dust-cloud-2 {
          animation: dust-cloud 0.5s infinite linear 0.15s;
        }
        .animate-dust-cloud-3 {
          animation: dust-cloud 0.5s infinite linear 0.3s;
        }
      `}</style>
    </div>
  );
}
