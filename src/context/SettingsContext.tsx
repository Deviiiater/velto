'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type Member = {
  name: string;
  items: { name: string; price: number; quantity: number }[];
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
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [lowInternetMode, setLowInternetModeState] = useState(false);
  const [oneIndiaPass, setOneIndiaPassState] = useState(false);
  const [language, setLanguageState] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [groupCartActive, setGroupCartActive] = useState(false);
  const [dontRush, setDontRush] = useState(false);
  const [riderTip, setRiderTip] = useState(0);
  const [liquidGlassMode, setLiquidGlassModeState] = useState(true);

  // Simulated group members who order together
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

  // Simulated item voting for the group
  const [groupCartVotes, setGroupCartVotes] = useState<Record<string, number>>({
    'samosa': 3,
    'pizza': 1,
    'biryani': 2
  });

  const castGroupVote = (itemId: string) => {
    setGroupCartVotes(prev => {
      const next = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      
      // Auto-simulate a friend voting on another option 1.2 seconds later
      setTimeout(() => {
        const options = ['samosa', 'pizza', 'biryani'];
        const otherOptions = options.filter(o => o !== itemId);
        const randomOption = otherOptions[Math.floor(Math.random() * otherOptions.length)];
        
        // Grab a friend name if saved
        let friendName = "Rohan Sharma";
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('velto_friends');
          if (saved) {
            const friendsArr = JSON.parse(saved);
            if (friendsArr.length > 0) {
              friendName = friendsArr[Math.floor(Math.random() * friendsArr.length)].name;
            }
          }
        }
        
        setGroupCartVotes(current => ({
          ...current,
          [randomOption]: (current[randomOption] || 0) + 1
        }));
        
        // Broadcast custom notification alert toast
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
    }
  }, []);

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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
