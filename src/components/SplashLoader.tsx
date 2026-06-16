'use client';
import { useState, useEffect } from 'react';

export function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Stage 1: Trigger fade-out animation slightly before 2 seconds
    const fadeTimeout = setTimeout(() => {
      setFadeOut(true);
    }, 1600);

    // Stage 2: Completely unmount component after exactly 2 seconds (2000ms)
    const unmountTimeout = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(unmountTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-all duration-500 ease-out select-none ${
        fadeOut 
          ? 'opacity-0 scale-105 pointer-events-none' 
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at center, #2e081c 0%, #0d060a 100%)'
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-5">
        {/* Animated outer glowing circle with pulse ring */}
        <div className="relative w-28 h-28 rounded-full border border-primary/40 flex items-center justify-center bg-white/5 shadow-2xl animate-pulse-ring">
          <img 
            src="/logo.png" 
            alt="Velto Logo" 
            className="w-16 h-16 object-contain animate-logo-entrance"
          />
        </div>

        {/* Text Logo branding */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black tracking-[0.2em] text-white uppercase animate-pulse">
            Velto
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-primary font-black animate-pulse duration-1000">
            Delivering in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
