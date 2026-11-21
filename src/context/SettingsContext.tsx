'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Member = {
  name: string;
  items: { name: string; price: number; quantity: number }[];
};

export type StoreTimingConfig = {
  startTime: string;
  endTime: string;
  isOpen: boolean;
  onlyMedicineEnabled: boolean;
};

export function checkStoreIsOpen(config: { startTime: string; endTime: string; isOpen: boolean }): boolean {
  if (!config.isOpen) return false;
  if (!config.startTime || !config.endTime) return true;

  const now = new Date();
  const currentVal = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = config.startTime.split(':').map(Number);
  const [endH, endM] = config.endTime.split(':').map(Number);

  const startVal = (isNaN(startH) ? 8 : startH) * 60 + (isNaN(startM) ? 0 : startM);
  const endVal = (isNaN(endH) ? 22 : endH) * 60 + (isNaN(endM) ? 0 : endM);

  // Normal schedule (e.g. 08:00 to 22:00)
  if (startVal <= endVal) {
    return currentVal >= startVal && currentVal <= endVal;
  }
  // Overnight schedule (e.g. 20:00 to 04:00)
  return currentVal >= startVal || currentVal <= endVal;
}

const DEFAULT_STORE_CONFIG: StoreTimingConfig = {
  startTime: '08:00',
  endTime: '22:00',
  isOpen: true,
  onlyMedicineEnabled: false
};

type SettingsContextType = {
  lowInternetMode: boolean;
  setLowInternetMode: (val: boolean) => void;
  oneIndiaPass: boolean;
  setOneIndiaPass: (val: boolean) => void;
  language: 'en' | 'hi' | 'hinglish';
  setLanguage: (lang: 'en' | 'hi' | 'hinglish') => void;
  groupCartActive: boolean;
  setGroupCartActive: (val: boolean) => void;
  groupCartMembers: Member[];
  setGroupCartMembers: (members: Member[]) => void;
  groupCartVotes: Record<string, number>;
  castGroupVote: (itemId: string) => void;
  dontRush: boolean;
  setDontRush: (val: boolean) => void;
  riderTip: number;
  setRiderTip: (val: number) => void;
  liquidGlassMode: boolean;
  setLiquidGlassMode: (val: boolean) => void;
  storeConfig: StoreTimingConfig;
  isStoreOpen: boolean;
  updateStoreConfig: (newConfig: Partial<StoreTimingConfig>) => Promise<boolean>;
  refreshStoreConfig: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType>({
  lowInternetMode: false,
  setLowInternetMode: () => {},
  oneIndiaPass: false,
  setOneIndiaPass: () => {},
  language: 'en',
  setLanguage: () => {},
  groupCartActive: false,
  setGroupCartActive: () => {},
  groupCartMembers: [],
  setGroupCartMembers: () => {},
  groupCartVotes: {},
  castGroupVote: () => {},
  dontRush: false,
  setDontRush: () => {},
  riderTip: 0,
  setRiderTip: () => {},
  liquidGlassMode: true,
  setLiquidGlassMode: () => {},
  storeConfig: DEFAULT_STORE_CONFIG,
  isStoreOpen: true,
  updateStoreConfig: async () => false,
  refreshStoreConfig: async () => {},
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [lowInternetMode, setLowInternetModeState] = useState(false);
  const [oneIndiaPass, setOneIndiaPassState] = useState(false);
  const [language, setLanguageState] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [groupCartActive, setGroupCartActive] = useState(false);
  const [dontRush, setDontRush] = useState(false);
  const [riderTip, setRiderTip] = useState(0);
  const [liquidGlassMode, setLiquidGlassModeState] = useState(true);

  // Store timing & operational states
  const [storeConfig, setStoreConfig] = useState<StoreTimingConfig>(DEFAULT_STORE_CONFIG);
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);

  // Group members simulation
  const [groupCartMembers, setGroupCartMembers] = useState<Member[]>([
    {
      name: 'Rohan (Friend)',
      items: [{ name: 'Gourmet Samosa', price: 40, quantity: 2 }]
    },
    {
      name: 'Priya (Colleague)',
      items: [{ name: 'Organic Bananas', price: 60, quantity: 1 }]
    }
  ]);

  const [groupCartVotes, setGroupCartVotes] = useState<Record<string, number>>({
    'samosa': 3,
    'pizza': 1,
    'biryani': 2
  });

  const castGroupVote = (itemId: string) => {
    setGroupCartVotes(prev => {
      const next = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      setTimeout(() => {
        const options = ['samosa', 'pizza', 'biryani'];
        const otherOptions = options.filter(o => o !== itemId);
        const randomOption = otherOptions[Math.floor(Math.random() * otherOptions.length)];
        
        let friendName = "Rohan Sharma";
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('velto_friends');
          if (saved) {
            try {
              const friendsArr = JSON.parse(saved);
              if (friendsArr.length > 0) {
                friendName = friendsArr[Math.floor(Math.random() * friendsArr.length)].name;
              }
            } catch(e) {}
          }
        }
        
        setGroupCartVotes(current => ({
          ...current,
          [randomOption]: (current[randomOption] || 0) + 1
        }));
        
        window.dispatchEvent(new CustomEvent('toast-alert', { 
          detail: { message: `🗳️ ${friendName} voted for ${randomOption === 'samosa' ? 'Samosa Combo' : randomOption === 'pizza' ? 'Tandoori Pizza' : 'Paneer Biryani'}!`, type: 'success' } 
        }));
      }, 1200);

      return next;
    });
  };

  const setLowInternetMode = (val: boolean) => {
    setLowInternetModeState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('velto_low_internet', val ? 'true' : 'false');
      document.documentElement.classList.toggle('lite-mode', val);
    }
  };

  const setOneIndiaPass = (val: boolean) => {
    setOneIndiaPassState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('velto_one_india_pass', val ? 'true' : 'false');
    }
  };

  const setLanguage = (lang: 'en' | 'hi' | 'hinglish') => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('velto_language', lang);
    }
  };

  const setLiquidGlassMode = (val: boolean) => {
    setLiquidGlassModeState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('velto_liquid_glass', val ? 'true' : 'false');
      document.documentElement.classList.toggle('liquid-glass-enabled', val);
    }
  };

  // Recompute isStoreOpen
  const recomputeStoreOpen = useCallback((config: StoreTimingConfig) => {
    const openStatus = checkStoreIsOpen(config);
    setIsStoreOpen(openStatus);
  }, []);

  // Fetch store configuration from API/storage
  const refreshStoreConfig = useCallback(async () => {
    try {
      // 1. Try local cache first for instant hydration
      if (typeof window !== 'undefined') {
        const localConfig = localStorage.getItem('velto_store_config');
        if (localConfig) {
          try {
            const parsed = JSON.parse(localConfig);
            setStoreConfig(parsed);
            recomputeStoreOpen(parsed);
          } catch(e) {}
        }
      }

      // 2. Fetch fresh data from API
      const res = await fetch('/api/store-config');
      if (res.ok) {
        const data = await res.json();
        const freshConfig: StoreTimingConfig = {
          startTime: data.startTime || '08:00',
          endTime: data.endTime || '22:00',
          isOpen: data.isOpen !== false,
          onlyMedicineEnabled: !!data.onlyMedicineEnabled
        };
        setStoreConfig(freshConfig);
        recomputeStoreOpen(freshConfig);

        if (typeof window !== 'undefined') {
          localStorage.setItem('velto_store_config', JSON.stringify(freshConfig));
          
          // Also update velto_announcements for legacy readers
          try {
            const list = localStorage.getItem('velto_announcements') 
              ? JSON.parse(localStorage.getItem('velto_announcements')!) 
              : [];
            const clean = list.filter((ann: any) => !ann.title?.includes('[STORE_CONFIG]'));
            clean.unshift({
              id: 'store-config-sync',
              title: '[STORE_CONFIG]',
              content: JSON.stringify(freshConfig),
              type: 'announcement',
              created_at: new Date().toISOString()
            });
            localStorage.setItem('velto_announcements', JSON.stringify(clean));
          } catch(e) {}
        }
      }
    } catch(err) {
      console.warn('Failed refreshing store config from API, using cached state:', err);
    }
  }, [recomputeStoreOpen]);

  // Update store configuration
  const updateStoreConfig = async (newConfig: Partial<StoreTimingConfig>): Promise<boolean> => {
    const merged: StoreTimingConfig = {
      ...storeConfig,
      ...newConfig
    };

    // 1. Immediate optimistic UI update
    setStoreConfig(merged);
    recomputeStoreOpen(merged);

    // 2. Immediate localStorage persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('velto_store_config', JSON.stringify(merged));
      
      // Update announcements array for legacy components
      try {
        const list = localStorage.getItem('velto_announcements') 
          ? JSON.parse(localStorage.getItem('velto_announcements')!) 
          : [];
        const clean = list.filter((ann: any) => !ann.title?.includes('[STORE_CONFIG]'));
        clean.unshift({
          id: 'store-config-' + Date.now(),
          title: '[STORE_CONFIG]',
          content: JSON.stringify(merged),
          type: 'announcement',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('velto_announcements', JSON.stringify(clean));
      } catch(e) {}

      // Broadcast custom event so all open tabs / components update instantly
      window.dispatchEvent(new CustomEvent('velto-store-timing-updated', { detail: merged }));
    }

    // 3. Persist to API / Supabase
    try {
      const res = await fetch('/api/store-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
      if (!res.ok) {
        console.warn('Store config server save failed, but saved locally');
      }
      return true;
    } catch(e) {
      console.warn('Network error saving store config, saved in local storage:', e);
      return true;
    }
  };

  // Hydrate on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLite = localStorage.getItem('velto_low_internet') === 'true';
      setLowInternetModeState(isLite);
      document.documentElement.classList.toggle('lite-mode', isLite);
      setOneIndiaPassState(localStorage.getItem('velto_one_india_pass') === 'true');
      const savedLang = localStorage.getItem('velto_language') as 'en' | 'hi' | 'hinglish';
      if (savedLang) setLanguageState(savedLang);
      
      const savedGlass = localStorage.getItem('velto_liquid_glass');
      if (savedGlass) {
        const isGlass = savedGlass === 'true';
        setLiquidGlassModeState(isGlass);
        document.documentElement.classList.toggle('liquid-glass-enabled', isGlass);
      } else {
        document.documentElement.classList.add('liquid-glass-enabled');
      }

      // Read cached store config immediately
      const savedConfig = localStorage.getItem('velto_store_config');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setStoreConfig(parsed);
          recomputeStoreOpen(parsed);
        } catch(e) {}
      }

      // Initial API sync
      refreshStoreConfig();

      // Listen for updates from other tabs or components
      const handleTimingUpdate = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail) {
          setStoreConfig(detail);
          recomputeStoreOpen(detail);
        }
      };
      window.addEventListener('velto-store-timing-updated', handleTimingUpdate);

      // Periodic check every 30 seconds to update isStoreOpen if clock passes opening/closing
      const timer = setInterval(() => {
        setStoreConfig(current => {
          recomputeStoreOpen(current);
          return current;
        });
      }, 30000);

      return () => {
        window.removeEventListener('velto-store-timing-updated', handleTimingUpdate);
        clearInterval(timer);
      };
    }
  }, [refreshStoreConfig, recomputeStoreOpen]);

  return (
    <SettingsContext.Provider
      value={{
        lowInternetMode,
        setLowInternetMode,
        oneIndiaPass,
        setOneIndiaPass,
        language,
        setLanguage,
        groupCartActive,
        setGroupCartActive,
        groupCartMembers,
        setGroupCartMembers,
        groupCartVotes,
        castGroupVote,
        dontRush,
        setDontRush,
        riderTip,
        setRiderTip,
        liquidGlassMode,
        setLiquidGlassMode,
        storeConfig,
        isStoreOpen,
        updateStoreConfig,
        refreshStoreConfig,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
