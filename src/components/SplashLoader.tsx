'use client';
import { useState, useEffect } from 'react';

export function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Show spinning animation first, then reveal logo at 800ms
    const logoTimeout = setTimeout(() => {
      setShowLogo(true);
    }, 800);

    // Trigger full overlay fade-out slightly before 2 seconds (1700ms)
    const fadeTimeout = setTimeout(() => {
      setFadeOut(true);
    }, 1700);

    // Completely unmount component at 2200ms
    const unmountTimeout = setTimeout(() => {
      setVisible(false);
    }, 2200);

    return () => {
      clearTimeout(logoTimeout);
      clearTimeout(fadeTimeout);
      clearTimeout(unmountTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100005] flex flex-col items-center justify-center select-none transition-all duration-700 ease-in-out ${
        fadeOut 
          ? 'opacity-0 scale-105 pointer-events-none' 
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at center, #180915 0%, #040205 100%)'
      }}
    >
      {/* Inline styles for custom premium hardware-accelerated animations */}
      <style>{`
        @keyframes orbit-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbit-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes logo-reveal {
          0% { opacity: 0; transform: scale(0.7) translateY(10px); filter: blur(5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(255, 95, 31, 0.2); }
          50% { text-shadow: 0 0 25px rgba(255, 95, 31, 0.6), 0 0 40px rgba(236, 72, 153, 0.4); }
        }
        .ring-container {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .outer-orbit {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #FF5F1F;
          border-bottom-color: #EC4899;
          animation: orbit-spin 1.4s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }
        .inner-orbit {
          position: absolute;
          width: 82%;
          height: 82%;
          border-radius: 50%;
          border: 2px solid transparent;
          border-left-color: #7C3AED;
          border-right-color: #06B6D4;
          animation: orbit-reverse 1s linear infinite;
          opacity: 0.7;
        }
        .logo-wrap {
          animation: logo-reveal 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .glow-text {
          animation: text-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Orbit loader rings */}
        <div className="ring-container">
          <div className="outer-orbit" />
          <div className="inner-orbit" />

          {/* Logo reveals inside the orbits */}
          {showLogo && (
            <div className="logo-wrap z-10 flex items-center justify-center w-24 h-24 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(255,95,31,0.25)]">
              <img 
                src="/logo.png" 
                alt="Velto Logo" 
                className="w-14 h-14 object-contain"
              />
            </div>
          )}
        </div>

        {/* Branding description */}
        <div className={`text-center space-y-2 transition-all duration-500 ${showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <h2 className="text-3xl font-black tracking-[0.25em] text-white uppercase glow-text">
            Velto
          </h2>
          <div className="h-0.5 w-12 bg-gradient-to-r from-[#FF5F1F] to-[#EC4899] mx-auto rounded-full"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#FF5F1F] font-black">
            Delivering in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
