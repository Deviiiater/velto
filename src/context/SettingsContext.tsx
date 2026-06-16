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
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [lowInternetMode, setLowInternetModeState] = useState(false);
  const [oneIndiaPass, setOneIndiaPassState] = useState(false);
  const [language, setLanguageState] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [groupCartActive, setGroupCartActive] = useState(false);
  const [dontRush, setDontRush] = useState(false);
  const [riderTip, setRiderTip] = useState(0);

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
    setGroupCartVotes(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
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

  // Hydrate on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLite = localStorage.getItem('velto_low_internet') === 'true';
      setLowInternetModeState(isLite);
      document.documentElement.classList.toggle('lite-mode', isLite);
      setOneIndiaPassState(localStorage.getItem('velto_one_india_pass') === 'true');
      const savedLang = localStorage.getItem('velto_language') as 'en' | 'hi' | 'hinglish';
      if (savedLang) setLanguageState(savedLang);
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
