'use client';
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

type Props = {
  portalName: string;
  logoUrl: string;
};

export default function DashboardInstallBanner({ portalName, logoUrl }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem(`velto_dismiss_install_${portalName.toLowerCase()}`);
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also trigger display if prompt has already fired and is ready (Chrome fallback)
    const timer = setTimeout(() => {
      if (!deferredPrompt && !localStorage.getItem(`velto_dismiss_install_${portalName.toLowerCase()}`)) {
        // Show install options so users can always install via browser menus too
        setShowBanner(true);
      }
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [portalName, deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("Please use your browser menu options (e.g. Add to Home Screen) to install this Portal application.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome for ${portalName}: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(`velto_dismiss_install_${portalName.toLowerCase()}`, 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="w-full bg-[#0c1e15] border border-[#1e3c27] text-white p-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg select-none mb-4 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center border border-white/10">
          <img src={logoUrl} alt={portalName} className="w-8 h-8 object-contain" />
        </div>
        <div className="text-left">
          <span className="text-[10px] font-bold text-[#b5ff3b] uppercase tracking-wider block">Install App</span>
          <h4 className="text-xs font-black text-white">{portalName} Portal PWA</h4>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleInstall}
          className="bg-[#b5ff3b] hover:bg-[#a2e632] text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md active:scale-95"
        >
          <Download size={12} className="stroke-[3]" /> Install
        </button>
        <button 
          onClick={handleDismiss}
          className="text-white/40 hover:text-white/80 p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
