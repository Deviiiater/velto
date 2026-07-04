'use client';
import Script from 'next/script';
import { Search, MapPin, Clock, ShoppingBag, Apple, Leaf, Egg, Cookie, CupSoda, Flame, Plus, Sparkles, Zap, AlertCircle, Compass, HelpCircle, Mic, Bot, Send, Dumbbell, Coffee, Heart, Utensils, Calendar, ShieldCheck, Tag, Sparkle, Store, Users, DollarSign, Shield, HeartHandshake, Navigation, Pill, Truck, Wallet, Wrench, Megaphone, ChevronDown, User as UserIcon, History, Headphones, Bike, Scan } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProductCard, Product } from '@/components/ProductCard';
import DeliveryRiderAnimation from '@/components/DeliveryRiderAnimation';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { t, matchesSearchQuery } from '@/lib/translations';
import WelcomeSplash from '@/components/WelcomeSplash';

const MOCK_PRODUCTS: Product[] = [
  { id: 'e86b4f73-2e06-4993-96b5-0c30a8a65c91', name: 'Farm Fresh Tomatoes', description: 'Locally sourced red tomatoes.', price: 40, image_url: '', category: 'Vegetables' },
  { id: 'f72a1e05-c357-4b11-9a74-4b51829e248b', name: 'Whole Wheat Bread', description: 'Freshly baked daily.', price: 55, image_url: '', category: 'Dairy & Bread' },
  { id: 'a5d0a649-8b89-4972-8874-9f46b14d2e77', name: 'Organic Bananas', description: 'Sweet and ripe robusta bananas.', price: 60, image_url: '', category: 'Fresh Fruits' },
  { id: 'd2922be2-2615-4fe0-86db-ee55d64ffef7', name: 'Full Cream Milk', description: '1L packet of fresh milk.', price: 68, image_url: '', category: 'Dairy & Bread' },
  { id: 'c905db42-998f-4cf6-ba9e-1d5be5a248f2', name: 'Potato Chips', description: 'Classic salted potato chips.', price: 20, image_url: '', category: 'Snacks' },
  { id: 'b819f71c-32e6-42ee-8e7f-b649d2146ac9', name: 'Cold Drink 2L', description: 'Refreshing cola beverage.', price: 95, image_url: '', category: 'Beverages' },
  { id: 'dolo-650-medic', name: 'Paracetamol 650mg (Dolo)', description: 'Fast relief from fever and body pain (15 tablets strip).', price: 32, image_url: '', category: 'Pharmacy' },
  { id: 'first-aid-kit', name: 'Instant First Aid Box Kit', description: 'Bandages, antiseptic solution, cotton rolls, and burn ointments.', price: 180, image_url: '', category: 'Pharmacy' },
  { id: 'cough-syrup', name: 'Herbal Cough Syrup', description: 'Non-drowsy ayurvedic cough formula for throat irritation.', price: 95, image_url: '', category: 'Pharmacy' },
  { id: 'courier-doc', name: 'Instant Document Dispatch', description: 'Rider picks up and delivers documents across the city in 30 mins.', price: 60, image_url: '', category: 'Courier' },
  { id: 'courier-box', name: 'Heavy Box Parcel Courier', description: 'Deliver boxes up to 10kg with verified safe delivery.', price: 150, image_url: '', category: 'Courier' },
  { id: 'bill-airtel', name: 'Instant Airtel 1-Month Plan', description: '2GB/day unlimited voice calls & SMS voucher.', price: 299, image_url: '', category: 'Bills & Recharge' },
  { id: 'bill-jio', name: 'Jio 84-Day Unlimited Recharge', description: 'Long validity voucher with high-speed data.', price: 749, image_url: '', category: 'Bills & Recharge' },
  { id: 'service-cleaning', name: 'Professional Deep Home Cleaning (2 Hours)', description: 'Top-tier floor sanitization, bathroom scrubbing & dust removal.', price: 599, image_url: '', category: 'Home Services' },
  { id: 'service-ac', name: 'AC Maintenance & Jet Cleaning', description: 'Filters wash, gas checkup, and cooling efficiency improvement.', price: 450, image_url: '', category: 'Home Services' },
  { id: 'tiffin-standard', name: 'Daily Standard Veg Lunch Plan', description: 'Weekly subscription: Home-style Dal, Sabzi, 4 Rotis, Rice, Curd, Salad (Mon-Sat).', price: 999, image_url: '', category: 'Tiffin Service' },
  { id: 'tiffin-dinner', name: 'North Indian Dinner Plan', description: 'Weekly subscription: Premium Shahi Paneer/Dal, Special Sabzi, Butter Rotis, Rice (Mon-Sat).', price: 1299, image_url: '', category: 'Tiffin Service' },
  { id: 'combo-student', name: 'Student Study Late-Night Combo', description: 'Chai + Instant Noodles + Potato Chips packet to fuel study sessions.', price: 99, image_url: '', category: 'Cloud Kitchen' },
  { id: 'combo-chai', name: 'Chai & Ginger Samosa Evening Combo', description: 'Fresh brewing ginger tea flask with 2 hot crunchy samosas.', price: 60, image_url: '', category: 'Cloud Kitchen' },
  { id: 'combo-family', name: 'Family Sunday Breakfast Combo', description: 'Bread + Butter + 1L Milk pack + 6 Eggs bundle.', price: 240, image_url: '', category: 'Dairy & Bread' },
  { id: 'combo-workout', name: 'Healthy Morning Workout Combo', description: '1kg Bananas + 120g Greek Yogurt cup.', price: 110, image_url: '', category: 'Fresh Fruits' },
  { id: 'mock-choco-cookies', name: 'Chocolate Chip Cookies', description: 'Crunchy baked cookies with rich cocoa chocolate chips.', price: 80, image_url: '', category: 'Snacks' },
  { id: 'mock-dark-choco', name: 'Premium Dark Chocolate', description: '70% rich cocoa Belgian dark chocolate bar.', price: 150, image_url: '', category: 'Snacks' },
  { id: 'mock-choco-shake', name: 'Chocolate Milkshake', description: 'Creamy cold milkshake blended with rich chocolate syrup.', price: 120, image_url: '', category: 'Beverages' },
  { id: 'mock-choco-cake', name: 'Fudge Chocolate Cake', description: 'Decadent slice of double chocolate fudge cake.', price: 180, image_url: '', category: 'Cloud Kitchen' }
];


const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) tmp.push([i]);
  for (j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
};

const getSpellingSuggestions = (query: string, allProducts: Product[]): string[] => {
  if (!query || query.length < 2) return [];
  const queryLower = query.toLowerCase().trim();

  const candidates = new Set<string>();
  allProducts.forEach(p => {
    if (p.name) candidates.add(p.name);
    if (p.category) candidates.add(p.category);
  });

  const suggestions: { name: string; score: number }[] = [];

  candidates.forEach(cand => {
    const candLower = cand.toLowerCase();
    
    if (candLower.startsWith(queryLower)) {
      suggestions.push({ name: cand, score: 0 });
    }
    else if (candLower.includes(queryLower)) {
      suggestions.push({ name: cand, score: 1 });
    }
    else {
      const words = candLower.split(/\s+/);
      let minDistance = 999;
      words.forEach(word => {
        const dist = getLevenshteinDistance(queryLower, word);
        if (dist < minDistance) minDistance = dist;
      });

      if (minDistance <= 2) {
        suggestions.push({ name: cand, score: minDistance + 2 });
      }
    }
  });

  return Array.from(new Set(
    suggestions
      .sort((a, b) => a.score - b.score)
      .map(s => s.name)
  )).slice(0, 3);
};

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { lowInternetMode } = useSettings();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [products, setProducts] = useState<Product[]>([]);
  const [storeConfig, setStoreConfig] = useState({ startTime: "08:00", endTime: "22:00", isOpen: true });
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(500);
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bal = localStorage.getItem('velto_wallet_balance');
      if (bal) {
        setWalletBalance(parseFloat(bal));
      } else {
        localStorage.setItem('velto_wallet_balance', '500');
      }
    }
  }, [showWalletModal]);
  const [customNotifications, setCustomNotifications] = useState([
    {
      id: 1,
      title: "🍳 Breakfast Special Deals",
      content: "Start your morning right! Ginger tea & crunchy samosas delivered to your door in 10 minutes.",
      type: "promo",
      time: "8:00 AM"
    },
    {
      id: 2,
      title: "🏏 Match Day Combo Active!",
      content: "Snack combo (Chips + Chai + Noodles) at just ₹99. Order before the match begins!",
      type: "offer",
      time: "Evening"
    },
    {
      id: 3,
      title: "🌧️ Heavy Rain Advisory",
      content: "Deliveries may be delayed by 5-10 mins. Our riders are traveling safely.",
      type: "sos",
      time: "Just Now"
    },
    {
      id: 4,
      title: "🎁 Welcome Offer: Code WELTO50",
      content: "Get Flat 50% discount on fresh organic veggies & grocery items on your first checkout.",
      type: "promo",
      time: "Yesterday"
    }
  ]);
  const [activePill, setActivePill] = useState<'reorder' | 'food'>('food');
  const [vegOnly, setVegOnly] = useState(false);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<'instamart' | 'kitchen'>('instamart');

  const [locationInput, setLocationInput] = useState('');
  const [serviceMessage, setServiceMessage] = useState<{ text: string; type: 'success' | 'warning' | '' }>({ text: '', type: '' });
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Search and spelling suggestions states
  const [searchQuery, setSearchQuery] = useState('');
  const [spellingSuggestions, setSpellingSuggestions] = useState<string[]>([]);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search for 'chocolate'...");

  // Onboarding Wizard states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem('velto_onboarding_dismissed') === 'true';
    if (!dismissed) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const items = ["chocolate", "cookies", "cake"];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % items.length;
      setSearchPlaceholder(`Search for '${items[idx]}' or fresh meals...`);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfileName('');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setProfileName(data.full_name || '');
        }
      } catch (err) {
        console.warn("Could not fetch user profile:", err);
      }
    }
    fetchProfile();
  }, [user]);

  // Premium Voice Ordering states
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [voiceMatchedProduct, setVoiceMatchedProduct] = useState<Product | null>(null);
  const [pendingVoiceProduct, setPendingVoiceProduct] = useState<{ product: Product; quantity: number } | null>(null);
  const pendingVoiceProductRef = useRef<{ product: Product; quantity: number } | null>(null);

  // New Super App features states
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [studentMode, setStudentMode] = useState(false);
  const [activeSuperService, setActiveSuperService] = useState('grocery');
  const [refillItems, setRefillItems] = useState([
    { id: '1', name: 'Full Cream Milk 1L', lastBought: '2 days ago', progress: 20, daysLeft: 1 },
    { id: '2', name: 'Whole Wheat Bread', lastBought: '4 days ago', progress: 40, daysLeft: 2 },
    { id: '3', name: 'Fresh Farm Tomatoes', lastBought: '6 days ago', progress: 75, daysLeft: 4 }
  ]);

  // Premium Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  // AI Modal State
  const [aiModal, setAiModal] = useState<{ title: string; subtitle: string; content: string; icon: string } | null>(null);

  // Animated Location Selector states
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  // Active Deals Auto-slide state
  const [activeDealIndex, setActiveDealIndex] = useState(0);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);

  useEffect(() => {
    const totalHighlights = 3;
    const interval = setInterval(() => {
      setActiveHighlightIndex((prev) => (prev + 1) % totalHighlights);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // AI Assistant states
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; actionText?: string; actionType?: string; payload?: any }>>([
    { 
      sender: 'bot', 
      text: 'Namaste! Welcome to Velto AI Support. How can I feed you today? You can try one-tap commands below or search anything!' 
    }
  ]);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showUnifiedInstallBanner, setShowUnifiedInstallBanner] = useState(false);

  useEffect(() => {
    const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
    const dismissed = typeof window !== 'undefined' && localStorage.getItem('velto_pwa_dismissed') === 'true';

    if (!isStandalone && !dismissed) {
      setShowUnifiedInstallBanner(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && !dismissed) {
        setShowUnifiedInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    async function checkActiveOrder() {
      if (!user) {
        setHasActiveOrder(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status')
          .eq('user_id', user.id)
          .in('status', ['pending', 'packing', 'accepted', 'out_for_delivery'])
          .order('created_at', { ascending: false })
          .limit(1);
        if (!error && data && data.length > 0) {
          setHasActiveOrder(true);
        } else {
          setHasActiveOrder(false);
        }
      } catch (err) {
        setHasActiveOrder(false);
      }
    }
    checkActiveOrder();

    if (!user) return;
    const channel = supabase
      .channel(`active-order-home-sync-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => {
          checkActiveOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowUnifiedInstallBanner(false);
    localStorage.setItem('velto_pwa_dismissed', 'true');
  };

  // Announcements & Diet plans states
  type Announcement = {
    id: string;
    title: string;
    content: string;
    type: 'announcement' | 'diet' | 'promo' | 'sos' | 'offer';
    created_at: string;
  };
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [popupAnn, setPopupAnn] = useState<Announcement | null>(null);
  const [showGheePreorder, setShowGheePreorder] = useState(false);
  const [selectedGheeType, setSelectedGheeType] = useState<'cow' | 'buffalo'>('cow');
  const [gheeQuantity, setGheeQuantity] = useState(1);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      const popup = announcements.find(a => a.title.startsWith('[POPUP]'));
      if (popup) {
        const isShown = sessionStorage.getItem('velto_popup_shown') === 'true';
        if (!isShown) {
          setPopupAnn(popup);
          sessionStorage.setItem('velto_popup_shown', 'true');
        }
      }
      
      // Extract store timings config
      const configAnn = announcements.find(ann => ann.title?.includes('[STORE_CONFIG]'));
      if (configAnn) {
        try {
          const parsed = JSON.parse(configAnn.content);
          setStoreConfig({
            startTime: parsed.startTime || '08:00',
            endTime: parsed.endTime || '22:00',
            isOpen: parsed.isOpen !== false
          });
        } catch(e) {}
      }
    }
  }, [announcements]);

  const isStoreOpen = () => {
    if (!storeConfig.isOpen) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [startHour, startMin] = storeConfig.startTime.split(':').map(Number);
    const [endHour, endMin] = storeConfig.endTime.split(':').map(Number);
    
    const currentVal = currentHour * 60 + currentMinute;
    const startVal = startHour * 60 + startMin;
    const endVal = endHour * 60 + endMin;
    
    return currentVal >= startVal && currentVal <= endVal;
  };
  const storeOpen = isStoreOpen();

  useEffect(() => {
    const totalSlides = announcements?.length || 0;
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setActiveDealIndex((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(interval);
  }, [announcements]);

  const updateAnnouncementsState = (anns: Announcement[]) => {
    const hasGhee = anns.some(a => a.title?.toLowerCase().includes('ghee') || a.content?.toLowerCase().includes('ghee'));
    if (!hasGhee) {
      const gheeAnn: Announcement = {
        id: 'mock-ghee-popup',
        title: '[POPUP] Pure Buffalo & Cow Ghee - Launching Soon!',
        content: 'Pure natural goodness is coming soon! Order premium quality Cow Ghee & Buffalo Ghee delivering across India with trusted safety.',
        type: 'offer',
        created_at: new Date().toISOString()
      };
      setAnnouncements([gheeAnn, ...anns]);
    } else {
      setAnnouncements(anns);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        updateAnnouncementsState(data);
        localStorage.setItem('velto_announcements', JSON.stringify(data));
      } else {
        loadLocalStorageAnnouncements();
      }
    } catch (e) {
      console.warn("Supabase announcements fetch failed, falling back to localStorage:", e);
      loadLocalStorageAnnouncements();
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const loadLocalStorageAnnouncements = () => {
    const local = localStorage.getItem('velto_announcements');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        updateAnnouncementsState(parsed);
      } catch (err) {
        console.error("Failed parsing localStorage announcements:", err);
      }
    } else {
      // Seed default mock announcements
      const defaultAnns: Announcement[] = [
        {
          id: 'mock-ghee-popup',
          title: '[POPUP] Pure Buffalo & Cow Ghee - Launching Soon!',
          content: 'Pure natural goodness is coming soon! Order premium quality Cow Ghee & Buffalo Ghee delivering across India with trusted safety.',
          type: 'offer',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-sos-1',
          title: '🚨 Extreme Heatwave Advisory',
          content: 'Stay hydrated! Free chilled ORS rehydration sachets added automatically with all grocery orders today.',
          type: 'sos',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-diet-1',
          title: '🥗 Premium Low-Carb Keto Program',
          content: 'Kickstart your fitness goal! Try fresh avocados, high-protein Greek yogurts, and raw almonds under our healthy section.',
          type: 'diet',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'mock-promo-1',
          title: '🎉 Monsoon Immunity Booster Sale',
          content: 'Enjoy Flat 20% Off on all organic herbal teas, honey bottles, and vitamin C supplements. Use coupon HEAL20.',
          type: 'promo',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'mock-offer-1',
          title: '⚡ 10-Min Super Saver Hour!',
          content: 'Flat 50% discount on fresh organic strawberries and blueberries for the next 45 minutes.',
          type: 'offer',
          created_at: new Date(Date.now() - 14400000).toISOString()
        },
        {
          id: 'mock-promo-2',
          title: '🍕 Friday Midnight Feast Deal',
          content: 'Order from Top Cloud Kitchens and get free garlic bread + dessert on orders above ₹350. Code: FEAST50',
          type: 'promo',
          created_at: new Date(Date.now() - 18000000).toISOString()
        },
        {
          id: 'mock-ann-1',
          title: '📢 Weekend Late Night Kitchen Deliveries',
          content: 'Satisfy late midnight cravings! Cloud Kitchen is now delivering gourmet meals and snacks until 3:00 AM on Friday & Saturday.',
          type: 'announcement',
          created_at: new Date(Date.now() - 10800000).toISOString()
        }
      ];
      updateAnnouncementsState(defaultAnns);
      localStorage.setItem('velto_announcements', JSON.stringify(defaultAnns));
    }
  };

  const { cart, addToCart, clearCart, updateQuantity } = useCart();
  const { language } = useSettings();

  // Dispatch page state changes to global BottomNavBar
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('page-state-change', {
      detail: { activeSuperService, studentMode, searchQuery, activePill }
    }));
  }, [activeSuperService, studentMode, searchQuery, activePill]);

  // Listen to menu clicks from global BottomNavBar
  useEffect(() => {
    const handleNavClick = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      
      switch (detail.type) {
        case 'food':
          setActiveSuperService('food');
          setActiveModule('kitchen');
          setActivePill('food');
          setSelectedCategory(null);
          setStudentMode(false);
          setSearchQuery('');
          break;
        case 'bolt':
          setStudentMode(true);
          setSearchQuery('Combo');
          break;
        case 'offer':
          setSearchQuery('offer');
          setStudentMode(false);
          break;
        case 'reorder':
          setActivePill('reorder');
          setStudentMode(false);
          break;
      }
    };

    window.addEventListener('bottom-nav-click', handleNavClick);
    return () => window.removeEventListener('bottom-nav-click', handleNavClick);
  }, []);

  const getCategoryTranslation = (name: string) => {
    const norm = name.toLowerCase();
    if (norm.includes('fruit')) return t('catFruits', language);
    if (norm.includes('veg')) return t('catVeg', language);
    if (norm.includes('dairy') || norm.includes('bread')) return t('catDairy', language);
    if (norm.includes('snack')) return t('catSnacks', language);
    if (norm.includes('bev')) return t('catBev', language);
    if (norm.includes('kitchen')) return t('catKitchen', language);
    if (norm.includes('tiffin')) return t('catTiffin', language);
    return name;
  };

  const handleInstantAdd = (product: Product) => {
    addToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1000);
  };

  // Text synthesis to voice helper
  const speakResponse = (text: string) => {
    // Muted per user request to avoid annoying sounds on every action
    console.log("Muted voice feedback:", text);
  };

  // ─── VOICE COMMAND INTELLIGENCE ENGINE ───────────────────────────────────
  // Helper: check if a word exists as a standalone token in speech
  const wordInSpeech = (word: string, s: string) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(s);
  };

  const startVoiceListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? "आपका ब्राउज़र वॉयस ऑर्डरिंग को सपोर्ट नहीं करता। कृपया Google Chrome उपयोग करें!"
          : language === 'hinglish'
          ? "Aapka browser voice ordering support nahi karta. Kripya Google Chrome use karein!"
          : "Voice ordering is not supported on this browser. Please use Google Chrome!"
      );
      return;
    }

    const recognition = new SpeechRecognition();
    // Use Indian-locale for all languages — en-IN handles Indian accents much better than en-US
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'hinglish' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    // Capture top 3 alternatives for smarter fallback matching
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = () => {
      setVoiceListening(true);
      const pending = pendingVoiceProductRef.current;
      if (pending) {
        setVoiceStatus(
          language === 'hi'
            ? `बोलें "हाँ" या "ना" ("${pending.product.name}" के लिए)`
            : language === 'hinglish'
            ? `Bolein "Haan" ya "Naa" ("${pending.product.name}" ke liye)`
            : `Say "Yes" or "No" to confirm "${pending.product.name}"`
        );
      } else {
        setVoiceStatus(
          language === 'hi'
            ? 'सुन रहे हैं... बोलें जैसे: "दो दूध" या "एक ब्रेड"'
            : language === 'hinglish'
            ? 'Listening... Bolein jaise: "do doodh" ya "ek bread"'
            : 'Listening... Try saying: "Add 2 Milk" or "I want bread"'
        );
      }
    };

    recognition.onerror = (err: any) => {
      // err.error is a DOMException-like string, not a plain Error
      const errorCode = err?.error || 'unknown';
      console.error('Voice recognition error [code:', errorCode, ']', err);
      setVoiceListening(false);
      const errorMsg =
        errorCode === 'no-speech'
          ? (language === 'hi' ? 'कोई आवाज़ नहीं मिली। फिर से बोलें!' : language === 'hinglish' ? 'Koi awaaz nahi aayi. Dobara bolein!' : 'No speech detected. Please try again!')
          : errorCode === 'not-allowed'
          ? (language === 'hi' ? 'माइक्रोफ़ोन की अनुमति दें।' : language === 'hinglish' ? 'Microphone permission dein.' : 'Please allow microphone access.')
          : (language === 'hi' ? 'आवाज़ साफ़ नहीं थी। फिर कोशिश करें।' : language === 'hinglish' ? 'Awaaz clear nahi thi. Firse try karein.' : 'Could not understand. Please try again.');
      setVoiceStatus(errorMsg);
      setTimeout(() => setVoiceStatus(''), 3500);
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.onresult = (e: any) => {
      // Collect all alternatives and pick the best one after processing
      const alternatives: string[] = [];
      for (let i = 0; i < e.results[0].length; i++) {
        alternatives.push(e.results[0][i].transcript.toLowerCase().trim());
      }
      const speech = alternatives[0]; // primary transcript
      setVoiceStatus(`🎙️ "${speech}"`);
      setSearchQuery(speech);
      setTimeout(() => setVoiceStatus(''), 4000);

      // ── CONFIRMATION FLOW ────────────────────────────────────────────────
      const pending = pendingVoiceProductRef.current;
      if (pending) {
        // 'do' is a Hindi word for quantity (2) — removed from yesWords to avoid collision
        const yesWords = ['yes', 'yep', 'yeah', 'ok', 'sure', 'haan', 'haanji', 'ha', 'karo', 'confirm', 'correct', 'le lo', 'thik hai', 'de do', 'bilkul', 'add karo', 'हाँ', 'हाँजी', 'हा', 'बिल्कुल', 'जी हाँ', 'ठीक है'];
        const noWords = ['no', 'nope', 'nah', 'cancel', 'nahi', 'naa', 'mat karo', 'reject', 'galat', 'chhoro', 'rehno do', 'band karo', 'ना', 'नहीं', 'मत करो', 'बंद करो'];
        const isYes = yesWords.some(w => speech.includes(w));
        const isNo = noWords.some(w => speech.includes(w));

        if (isYes) {
          for (let i = 0; i < pending.quantity; i++) addToCart(pending.product);
          pendingVoiceProductRef.current = null;
          setPendingVoiceProduct(null);
          const msg =
            language === 'hi'
              ? `जी बिल्कुल! मैंने ${pending.quantity} ${pending.product.name} आपकी बास्केट में जोड़ दिया। और क्या चाहिए?`
              : language === 'hinglish'
              ? `Haanji! Maine ${pending.quantity} ${pending.product.name} basket mein add kar diya. Kuch aur chahiye?`
              : `Done! Added ${pending.quantity} × ${pending.product.name} to your basket. What else?`;
          speakResponse(msg);
        } else if (isNo) {
          pendingVoiceProductRef.current = null;
          setPendingVoiceProduct(null);
          const msg =
            language === 'hi'
              ? 'ठीक है, कैंसिल कर दिया। और क्या लाऊं?'
              : language === 'hinglish'
              ? 'Theek hai, cancel kar diya. Aur kya mangwana hai?'
              : 'Cancelled. What else can I get you?';
          speakResponse(msg);
        } else {
          const msg =
            language === 'hi'
              ? `कृपया "हाँ" या "ना" बोलकर बताएं — क्या "${pending.product.name}" चाहिए?`
              : language === 'hinglish'
              ? `Haan ya naa bolein — kya "${pending.product.name}" add karein?`
              : `Say "yes" or "no" — shall I add "${pending.product.name}"?`;
          speakResponse(msg);
        }
        return;
      }

      // ── CHECKOUT TRIGGER ─────────────────────────────────────────────────
      const checkoutCommands = [
        'order now', 'checkout', 'pay now', 'place order', 'order this',
        'buy this', 'order place', 'order kar do', 'checkout karo',
        'payment karo', 'kharido', 'order karo', 'cart dekho'
      ];
      const isCheckoutTrigger = checkoutCommands.some(cmd => speech.includes(cmd));

      // ── REORDER SHORTCUT ─────────────────────────────────────────────────
      if (
        speech.includes('usual') ||
        speech.includes('purana order') ||
        speech.includes('reorder') ||
        speech.includes('repeat') ||
        speech.includes('doobara') ||
        speech.includes('wahi order')
      ) {
        const milk = products.find(p => p.name.toLowerCase().includes('milk'));
        const bread = products.find(p => p.name.toLowerCase().includes('bread'));
        if (milk) addToCart(milk);
        if (bread) addToCart(bread);
        setVoiceStatus(
          language === 'hi' ? 'पुराना ऑर्डर दोबारा किया जा रहा है!' :
          language === 'hinglish' ? 'Purana order repeat ho raha hai!' :
          'Reordering your usual essentials!'
        );
        speakResponse(
          language === 'hi' ? 'दूध और ब्रेड दोबारा बास्केट में जोड़ दिए। चेकआउट पर जा रहे हैं।' :
          language === 'hinglish' ? 'Doodh aur bread basket mein add kar diye. Checkout par ja rahe hain.' :
          'Added your usual milk and bread. Heading to checkout now.'
        );
        setTimeout(() => router.push('/cart'), 1500);
        return;
      }

      // ── QUANTITY PARSING (word-boundary safe) ────────────────────────────
      // Uses word-boundary regex to prevent "doodh", "document", "doobara" triggering qty=2
      let quantity = 1;
      if (
        wordInSpeech('do', speech) ||
        speech.includes(' 2 ') || speech.startsWith('2 ') || speech.endsWith(' 2') ||
        wordInSpeech('two', speech) || speech.includes('दो ')
      ) quantity = 2;
      if (
        wordInSpeech('teen', speech) ||
        speech.includes(' 3 ') || speech.startsWith('3 ') || speech.endsWith(' 3') ||
        wordInSpeech('three', speech) || speech.includes('तीन')
      ) quantity = 3;
      if (
        wordInSpeech('char', speech) ||
        speech.includes(' 4 ') || speech.startsWith('4 ') || speech.endsWith(' 4') ||
        wordInSpeech('four', speech) || speech.includes('चार')
      ) quantity = 4;
      if (
        wordInSpeech('paanch', speech) ||
        speech.includes(' 5 ') || speech.startsWith('5 ') || speech.endsWith(' 5') ||
        wordInSpeech('five', speech) || speech.includes('पाँच')
      ) quantity = 5;

      // ── BILINGUAL SYNONYM MAP (Latin + Devnagari) ─────────────────────────
      // Longest keys first to prevent partial overrides (e.g. "cold drink" > "drink")
      const relatedMap: Record<string, string> = {
        // ── Multi-word keys first (longest priority) ──
        'cold drink': 'drink',
        'soft drink': 'drink',
        'phone pay': 'bill-airtel',
        'purana order': 'reorder',
        'home cleaning': 'service-cleaning',
        'deep cleaning': 'service-cleaning',
        'ac service': 'service-ac',
        'ac repair': 'service-ac',
        'combo student': 'combo-student',
        'combo workout': 'combo-workout',
        'combo family': 'combo-family',
        // ── Medicines / Pharmacy ──
        'paracetamol': 'dolo',
        'dolo 650': 'dolo',
        'dolo650': 'dolo',
        'tablet': 'dolo',
        'medicine': 'dolo',
        'dawai': 'dolo',
        'dawa': 'dolo',
        'bukhar': 'dolo',
        'fever': 'dolo',
        'bimari': 'dolo',
        'दवाई': 'dolo',
        'दवा': 'dolo',
        'बुखार': 'dolo',
        'टेबलेट': 'dolo',
        // ── Cough Syrup ──
        'khansi': 'cough',
        'syrup': 'cough',
        'khasi': 'cough',
        'खाँसी': 'cough',
        'खांसी': 'cough',
        // ── Vegetables / Tomato ──
        'tamatar': 'tomato',
        'tamaatar': 'tomato',
        'tomato': 'tomato',
        'aloo': 'tomato',
        'sabzi': 'tomato',
        'vegetable': 'tomato',
        'टमाटर': 'tomato',
        'सब्जी': 'tomato',
        'आलू': 'tomato',
        // ── Bread / Roti ──
        'bread': 'bread',
        'roti': 'bread',
        'pav': 'bread',
        'double roti': 'bread',
        'ब्रेड': 'bread',
        'रोटी': 'bread',
        // ── Milk / Dairy ──
        'doodh': 'milk',
        'dudh': 'milk',
        'milk': 'milk',
        'dairy': 'milk',
        'dood': 'milk',
        'दूध': 'milk',
        // ── Banana / Fruit ──
        'banana': 'banana',
        'kela': 'banana',
        'fruit': 'banana',
        'kele': 'banana',
        'केला': 'banana',
        'फल': 'banana',
        // ── Chips / Snacks ──
        'chips': 'chips',
        'snack': 'chips',
        'wafer': 'chips',
        'lays': 'chips',
        'namkeen': 'chips',
        'चिप्स': 'chips',
        'नमकीन': 'chips',
        // ── Drinks / Beverages ──
        'cola': 'drink',
        'pepsi': 'drink',
        'coke': 'drink',
        'drink': 'drink',
        'beverage': 'drink',
        'soda': 'drink',
        'thanda': 'drink',
        'ठंडा': 'drink',
        'कोला': 'drink',
        // ── Chai / Tea combo ──
        'samosa': 'combo-chai',
        'chai': 'combo-chai',
        'tea': 'combo-chai',
        'ginger tea': 'combo-chai',
        'adrak chai': 'combo-chai',
        'चाय': 'combo-chai',
        'समोसा': 'combo-chai',
        // ── Student Combo ──
        'maggi': 'combo-student',
        'maggie': 'combo-student',
        'noodle': 'combo-student',
        'instant': 'combo-student',
        'dinner': 'combo-student',
        'study': 'combo-student',
        'मैगी': 'combo-student',
        // ── Family Breakfast Combo ──
        'breakfast': 'combo-family',
        'nashta': 'combo-family',
        'naashta': 'combo-family',
        'egg': 'combo-family',
        'anda': 'combo-family',
        'ande': 'combo-family',
        'नाश्ता': 'combo-family',
        'अंडा': 'combo-family',
        // ── Workout Combo ──
        'diet': 'combo-workout',
        'workout': 'combo-workout',
        'gym': 'combo-workout',
        'protein': 'combo-workout',
        'fitness': 'combo-workout',
        // ── Courier ──
        'parcel': 'courier-box',
        'package': 'courier-box',
        'courier': 'courier-box',
        'box': 'courier-box',
        'dastavez': 'courier-doc',
        'document': 'courier-doc',
        'docs': 'courier-doc',
        'letter': 'courier-doc',
        'दस्तावेज': 'courier-doc',
        'पार्सल': 'courier-box',
        // ── Home Services ──
        'cleaning': 'service-cleaning',
        'clean': 'service-cleaning',
        'safai': 'service-cleaning',
        'cleaner': 'service-cleaning',
        'झाड़ू': 'service-cleaning',
        'सफाई': 'service-cleaning',
        'ac': 'service-ac',
        'cooling': 'service-ac',
        'repair': 'service-ac',
        'एसी': 'service-ac',
        // ── Bills / Recharge ──
        'airtel': 'bill-airtel',
        'recharge': 'bill-airtel',
        'bill': 'bill-airtel',
        'mobile recharge': 'bill-airtel',
        'jio': 'bill-jio',
        'jio recharge': 'bill-jio',
        'रिचार्ज': 'bill-airtel',
        'एयरटेल': 'bill-airtel',
        'जियो': 'bill-jio',
      };

      // ── LONGEST-KEY-FIRST RESOLVER ────────────────────────────────────────
      // Sort keys by length descending so "cold drink" matches before "drink"
      let resolvedQuery = speech;
      const sortedKeys = Object.keys(relatedMap).sort((a, b) => b.length - a.length);
      for (const key of sortedKeys) {
        if (speech.includes(key)) {
          resolvedQuery = relatedMap[key];
          break; // stop at the first (longest) match
        }
      }

      // ── PRODUCT MATCHING ──────────────────────────────────────────────────
      let foundProduct: Product | undefined;

      // Try all alternatives if primary transcript doesn't match
      const transcriptsToTry = [resolvedQuery, ...alternatives.slice(1)];

      for (const attempt of transcriptsToTry) {
        // 1. Exact / partial product name match
        foundProduct = products.find(p => {
          const pName = p.name.toLowerCase();
          return attempt === pName || attempt.includes(pName) || pName.includes(attempt);
        });
        if (foundProduct) break;

        // 2. Category match
        foundProduct = products.find(p =>
          p.category &&
          (attempt.includes(p.category.toLowerCase()) || p.category.toLowerCase().includes(attempt))
        );
        if (foundProduct) break;

        // 3. Levenshtein word-by-word fuzzy match
        let bestDistance = 999;
        const spokenWords = attempt.split(/\s+/).filter(w => w.length > 2);
        products.forEach((p: Product) => {
          const prodWords = p.name.toLowerCase().split(/\s+/);
          spokenWords.forEach(sw => {
            prodWords.forEach(pw => {
              if (pw.length > 2) {
                const dist = getLevenshteinDistance(sw, pw);
                if (dist <= 2 && dist < bestDistance) {
                  bestDistance = dist;
                  foundProduct = p;
                }
              }
            });
          });
        });
        if (foundProduct) break;
      }

      if (foundProduct) {
        pendingVoiceProductRef.current = { product: foundProduct, quantity };
        setPendingVoiceProduct({ product: foundProduct, quantity });
        const confirmMsg =
          language === 'hi'
            ? `क्या "${quantity} ${foundProduct.name}" चाहिए? हाँ या ना बोलें!`
            : language === 'hinglish'
            ? `Kya "${quantity} ${foundProduct.name}" chahiye? Haan ya naa bolein!`
            : `Did you mean "${quantity} × ${foundProduct.name}"? Say "yes" to add or "no" to cancel.`;
        speakResponse(confirmMsg);
      } else {
        if (isCheckoutTrigger) {
          speakResponse(
            language === 'hi'
              ? 'ठीक है, पेमेंट स्क्रीन पर ले चल रहे हैं!'
              : language === 'hinglish'
              ? 'Ok bhaiya, cart checkout par ja rahe hain!'
              : 'Alright! Taking you to the cart now.'
          );
          setTimeout(() => router.push('/cart'), 1500);
        } else {
          setSearchQuery(speech);
          const failMsg =
            language === 'hi'
              ? `"${speech}" का कोई सटीक मिलान नहीं मिला — लेकिन मैंने स्क्रीन पर मिलते-जुलते सामान दिखा दिए हैं!`
              : language === 'hinglish'
              ? `"${speech}" ka exact match nahi mila — lekin related items screen par search kar diye hain, dekho!`
              : `Couldn't find an exact match for "${speech}" — but I've shown related items on screen!`;
          speakResponse(failMsg);
        }
      }
    };

    try {
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err?.message || err);
    }
  };

  // AI Conversational chat parser

  const handleAiChatSubmit = async (customText?: string) => {
    const text = (customText || aiChatQuery).trim();
    if (!text) return;
    
    setAiMessages(prev => [...prev, { sender: 'user', text }]);
    setAiChatQuery('');

    // Wait a brief moment to simulate AI thinking, matching the 600ms transition
    setTimeout(async () => {
      const cleanText = text.toLowerCase();
      let botResponse = "Arey, mujhe acche se samajh nahi aaya bhaiya! Aap mujhse 'paneer roll', 'healthy dinner combo', ya 'One India Pass' ke baare mein puchh sakte hain.";
      let actionText: string | undefined;
      let actionType: string | undefined;
      let payload: any = null;

      // 1. Check if asking about order status
      if (user && (cleanText.includes('order') || cleanText.includes('kaha') || cleanText.includes('status') || cleanText.includes('track') || cleanText.includes('where') || cleanText.includes('delivery') || cleanText.includes('kahan') || cleanText.includes('kaha h') || cleanText.includes('order id'))) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('id, status, total_amount')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (!error && data && data.length > 0) {
            const latest = data[0];
            const statusMap: Record<string, string> = {
              pending: 'Order Placed (Waiting Store)',
              packing: 'Fulfillment: Packing Grocery Bag',
              accepted: 'Warehouse: Packed & Ready',
              out_for_delivery: 'Rider Zooming to Doorstep! 🚴',
              delivered: 'Delivered successfully 🎉',
              cancelled: 'Cancelled 🛑'
            };
            const statusMapHinglish: Record<string, string> = {
              pending: 'Order ho chuka hai, store accept kar raha hai',
              packing: 'Aapka bags packing ho raha hai',
              accepted: 'Warehouse se ready ho chuka hai',
              out_for_delivery: 'Rider partner nikal chuke hain, zoom kar rahe hain 🚴',
              delivered: 'Deliver ho gaya hai bhaiya 🎉',
              cancelled: 'Cancel ho gaya hai 🛑'
            };
            const statusMapHindi: Record<string, string> = {
              pending: 'ऑर्डर हो गया है, स्टोर स्वीकार कर रहा है',
              packing: 'सामान पैक किया जा रहा है',
              accepted: 'वेयरहाउस से तैयार हो चुका है',
              out_for_delivery: 'डिलीवरी पार्टनर निकल चुके हैं 🚴',
              delivered: 'सफलतापूर्वक डिलीवर हो गया है 🎉',
              cancelled: 'रद्द कर दिया गया है 🛑'
            };

            const displayStatus = language === 'hi' 
              ? (statusMapHindi[latest.status] || latest.status)
              : language === 'hinglish' 
              ? (statusMapHinglish[latest.status] || latest.status)
              : (statusMap[latest.status] || latest.status);

            botResponse = language === 'hi' 
              ? `आपके ताज़ा ऑर्डर (ID: #${latest.id.slice(0, 8)}) का स्टेटस है: "${displayStatus}"। कुल बिल ₹${latest.total_amount} है।`
              : language === 'hinglish' 
              ? `Bhaiya, aapke latest order (ID: #${latest.id.slice(0, 8)}) ka status hai: "${displayStatus}". Total amount ₹${latest.total_amount} hai.`
              : `Your latest order (ID: #${latest.id.slice(0, 8)}) status is: "${displayStatus}". Total amount is ₹${latest.total_amount}.`;
              
            actionText = language === 'hi' ? 'ऑर्डर ट्रैक करें' : language === 'hinglish' ? 'Track order karein' : 'Track Order';
            actionType = 'TRACK_ORDER';
            payload = latest.id;
          } else {
            botResponse = language === 'hi' 
              ? "मुझे आपका कोई सक्रिय ऑर्डर नहीं मिला। क्या आप कुछ ताज़ा किराना या भोजन ऑर्डर करना चाहते हैं?"
              : language === 'hinglish' 
              ? "Bhaiya, aapka koi active order nahi mila abhi. Kuch fresh items mangwana chahte hain?"
              : "I couldn't find any recent orders for your account. Would you like to check out some fresh essentials?";
          }
        } catch (e: any) {
          console.error('AI chat: failed to fetch order status from Supabase —', e?.message || e);
        }
      } 
      // 2. Gibberish or Kids Zone sweets
      else if ((cleanText.length > 15 && !cleanText.includes(' ')) || cleanText.includes('sweet') || cleanText.includes('chocolate') || cleanText.includes('cookies') || cleanText.includes('cake') || cleanText.includes('candy') || cleanText.includes('meetha') || cleanText.includes('choclat') || cleanText.includes('kookie') || cleanText.includes('choclate')) {
        botResponse = language === 'hi' 
          ? "अरे वाह! क्या आपको मीठी चीजें पसंद हैं? 🍭 चॉकलेट, केक और कुकीज़ के लिए हमारे किड्स ज़ोन में स्वादिष्ट मीठे ट्रीट देखें!" 
          : language === 'hinglish' 
          ? "Arey waah! Lagta hai kisi pyaare bache ko meetha khana hai! 🍭 Humare pass chocolate, cake aur cookies hain Kids Zone mein. Basket mein daal doon?" 
          : "Oh yummy! Looking for some sweet treats? 🍭 We have delicious chocolate, cake, and cookies in our Kids Zone. Should I show them?";
        actionText = language === 'hi' ? 'किड्स ज़ोन देखें' : language === 'hinglish' ? 'Kids Zone dekhein' : 'Show Kids Zone';
        actionType = 'SHOW_KIDS_ZONE';
      } 
      // 3. Synonym matching for milk
      else if (cleanText.includes('doodh') || cleanText.includes('dudh') || cleanText.includes('milk') || cleanText.includes('dairy') || cleanText.includes('dood')) {
        const item = products.find(p => p.name.toLowerCase().includes('milk')) || products.find(p => p.category?.toLowerCase() === 'dairy & bread') || products[0];
        botResponse = language === 'hi' 
          ? `जी बिल्कुल! मुझे ताज़ा दूध मिल गया: "${item.name}" (₹${item.price})। कार्ट में जोड़ दें?` 
          : language === 'hinglish' 
          ? `Ji bhaiya, fresh milk mil gaya: "${item.name}" (₹${item.price}). Basket mein add kar doon?` 
          : `Sure! I found fresh milk: "${item.name}" (₹${item.price}). Add it to your cart?`;
        actionText = `Add ${item.name}`;
        actionType = 'ADD_TO_CART';
        payload = item;
      } 
      // 4. Synonym matching for tomatoes
      else if (cleanText.includes('tamatar') || cleanText.includes('tomatar') || cleanText.includes('tomato')) {
        const item = products.find(p => p.name.toLowerCase().includes('tomato')) || products[0];
        botResponse = language === 'hi' 
          ? `जी बिल्कुल! ताज़ा लाल टमाटर: "${item.name}" (₹${item.price})। कार्ट में जोड़ दें?` 
          : language === 'hinglish' 
          ? `Arey bilkul, fresh laal tamatar mil gaye: "${item.name}" (₹${item.price}). Basket mein add kar doon?` 
          : `Got it! Fresh red tomatoes: "${item.name}" (₹${item.price}). Add it to your cart?`;
        actionText = `Add ${item.name}`;
        actionType = 'ADD_TO_CART';
        payload = item;
      } 
      // 5. Synonym matching for bananas
      else if (cleanText.includes('kela') || cleanText.includes('banana')) {
        const item = products.find(p => p.name.toLowerCase().includes('banana')) || products[0];
        botResponse = language === 'hi' 
          ? `जी हाँ! मीठे केले उपलब्ध हैं: "${item.name}" (₹${item.price})। कार्ट में जोड़ दें?` 
          : language === 'hinglish' 
          ? `Haanji! Fresh kele mil gaye: "${item.name}" (₹${item.price}). Basket mein add kar doon?` 
          : `Yes! Ripe bananas: "${item.name}" (₹${item.price}). Add to your cart?`;
        actionText = `Add ${item.name}`;
        actionType = 'ADD_TO_CART';
        payload = item;
      } 
      // 6. Synonym matching for bread
      else if (cleanText.includes('bread') || cleanText.includes('roti') || cleanText.includes('double') || cleanText.includes('bred')) {
        const item = products.find(p => p.name.toLowerCase().includes('bread')) || products[0];
        botResponse = language === 'hi' 
          ? `ताज़ा ब्रेड: "${item.name}" (₹${item.price})। कार्ट में जोड़ दें?` 
          : language === 'hinglish' 
          ? `Fresh bread mil gayi bhaiya: "${item.name}" (₹${item.price}). Basket mein add karein?` 
          : `Fresh bread: "${item.name}" (₹${item.price}). Add to your cart?`;
        actionText = `Add ${item.name}`;
        actionType = 'ADD_TO_CART';
        payload = item;
      } 
      // 7. Synonym matching for chips
      else if (cleanText.includes('chips') || cleanText.includes('snack') || cleanText.includes('lays') || cleanText.includes('namkeen')) {
        const item = products.find(p => p.name.toLowerCase().includes('chips')) || products[0];
        botResponse = language === 'hi' 
          ? `चिप्स का पैकेट तैयार है: "${item.name}" (₹${item.price})। कार्ट में जोड़ें?` 
          : language === 'hinglish' 
          ? `Lays chips packet ready hai bhaiya: "${item.name}" (₹${item.price}). Basket mein add karein?` 
          : `Chips pack ready: "${item.name}" (₹${item.price}). Add to your cart?`;
        actionText = `Add ${item.name}`;
        actionType = 'ADD_TO_CART';
        payload = item;
      } 
      // 8. Synonym matching for cold drinks
      else if (cleanText.includes('drink') || cleanText.includes('pepsi') || cleanText.includes('coke') || cleanText.includes('cola') || cleanText.includes('soda') || cleanText.includes('paani') || cleanText.includes('pani')) {
        const item = products.find(p => p.name.toLowerCase().includes('drink')) || products[0];
        botResponse = language === 'hi' 
          ? `कोल्ड ड्रिंक तैयार है: "${item.name}" (₹${item.price})। कार्ट में जोड़ें?` 
          : language === 'hinglish' 
          ? `Ekdum chilled Cold drink ready hai: "${item.name}" (₹${item.price}). Add kar doon?` 
          : `Cold drink is ready: "${item.name}" (₹${item.price}). Add to your cart?`;
        actionText = `Add ${item.name}`;
        actionType = 'ADD_TO_CART';
        payload = item;
      } 
      // 9. Paneer / general roll items
      else if (cleanText.includes('paneer') || cleanText.includes('usual')) {
        const paneerItem = products.find(p => p.name.toLowerCase().includes('paneer')) || products[0];
        botResponse = `Arey bilkul! Mujhe mil gaya: "${paneerItem.name}"! Bahut hi badhiya choice hai. Cart mein daal doon?`;
        actionText = `Add ${paneerItem.name}`;
        actionType = 'ADD_TO_CART';
        payload = paneerItem;
      } 
      // 10. Cheap healthy diet
      else if (cleanText.includes('healthy') || cleanText.includes('150') || cleanText.includes('diet')) {
        const cheapHealthy = products.filter(p => p.price <= 150 && (p.category.toLowerCase().includes('fruit') || p.category.toLowerCase().includes('veg') || p.name.toLowerCase().includes('combo')));
        if (cheapHealthy.length > 0) {
          botResponse = `Maine ₹150 ke andar healthy items dhoondh liye hain! Ek hai "${cheapHealthy[0]?.name}" aur dusra "${cheapHealthy[1]?.name}". Dono ekdum fresh hain!`;
          actionText = `Filter Healthy Under ₹150`;
          actionType = 'FILTER_HEALTHY';
          payload = cheapHealthy;
        } else {
          botResponse = "Mujhe ₹150 ke andar abhi koi item nahi mila, aap hamara Fresh Fruits section ek baar check kar sakte hain!";
        }
      }
      // 11. Breakfast combo budget
      else if (cleanText.includes('breakfast') || cleanText.includes('under') || cleanText.includes('people') || cleanText.includes('300')) {
        const mealItems = products.filter(p => 
          p.category.toLowerCase().includes('fruit') || 
          p.category.toLowerCase().includes('dairy') || 
          p.category.toLowerCase().includes('bread')
        );
        let allocatedItems: Product[] = [];
        let runningTotal = 0;
        mealItems.forEach(item => {
          if (runningTotal + item.price <= 300) {
            allocatedItems.push(item);
            runningTotal += item.price;
          }
        });
        if (allocatedItems.length > 0) {
          botResponse = `Lo ji! 4 logon ka breakfast ₹300 ke andar set ho gaya. Maine add kiye hain: ${allocatedItems.map(i => i.name).join(', ')}. Total bill bas ₹${runningTotal} bana (Poore ₹${300 - runningTotal} bach gaye!). Cart mein daal doon?`;
          actionText = "One-Click Add Breakfast Combo";
          actionType = "ADD_COMBO_TO_CART";
          payload = allocatedItems;
        } else {
          botResponse = "Mujhe ₹300 ke budget mein koi package nahi mila. Fruits ya bread add kar ke dekh sakte hain.";
        }
      }
      // 12. One India Pass
      else if (cleanText.includes('pass') || cleanText.includes('one india') || cleanText.includes('free delivery')) {
        botResponse = "One India Pass toh bahut faydemand hai bhaiya! Har delivery free ho jayegi, koi platform fee nahi lagegi aur cashbacks alag se. Chutki mein activate kar lijiye!";
        actionText = "Activate One India Pass";
        actionType = "ACTIVATE_PASS";
      }

      setAiMessages(prev => [...prev, { sender: 'bot', text: botResponse, actionText, actionType, payload }]);
      speakResponse(botResponse);
    }, 600);
  };

  const getCategoryAesthetics = (category: string) => {
    const normalized = category?.toLowerCase() || '';
    if (normalized.includes('fruit')) {
      return {
        icon: <Apple className="w-6 h-6 text-rose-500" />,
        bg: 'bg-rose-500/10 border border-rose-500/20'
      };
    }
    if (normalized.includes('veg')) {
      return {
        icon: <Leaf className="w-6 h-6 text-emerald-500" />,
        bg: 'bg-emerald-500/10 border border-emerald-500/20'
      };
    }
    if (normalized.includes('dairy') || normalized.includes('bread')) {
      return {
        icon: <Egg className="w-6 h-6 text-amber-500" />,
        bg: 'bg-amber-500/10 border border-amber-500/20'
      };
    }
    if (normalized.includes('snack')) {
      return {
        icon: <Cookie className="w-6 h-6 text-orange-500" />,
        bg: 'bg-orange-500/10 border border-orange-500/20'
      };
    }
    if (normalized.includes('bev')) {
      return {
        icon: <CupSoda className="w-6 h-6 text-cyan-500" />,
        bg: 'bg-cyan-500/10 border border-cyan-500/20'
      };
    }
    return {
      icon: <ShoppingBag className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/10 border border-primary/20'
    };
  };

  useEffect(() => {
    const isShown = sessionStorage.getItem('velto_splash_shown') === 'true';
    if (isShown) {
      setShowSplash(false);
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false);
        setLoading(false);
        sessionStorage.setItem('velto_splash_shown', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        let merged = [...MOCK_PRODUCTS];
        if (data && data.length > 0) {
          const approved = data.filter((p: any) => p.is_approved !== false);
          approved.forEach((dbProd: any) => {
            const idx = merged.findIndex(p => p.id === dbProd.id);
            if (idx >= 0) {
              merged[idx] = dbProd;
            } else {
              merged.push(dbProd);
            }
          });
        }
        setProducts(merged);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
    fetchAnnouncements();

    // Set saved city if it exists
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      setCurrentLocation(savedCity);
    }
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", 'error');
      return;
    }

    setDetectingLocation(true);
    setServiceMessage({ text: 'Accessing GPS device to detect doorstep location...', type: 'success' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Fetch exact human-readable address from OpenStreetMap's free Nominatim reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'Velto-PWA-App'
              }
            }
          );
          const data = await response.json();
          if (data && data.display_name) {
            const formattedAddress = data.display_name;
            setLocationInput(formattedAddress);
            
            // Extract city from address fields
            const addressObj = data.address || {};
            const city = addressObj.city || addressObj.town || addressObj.village || addressObj.state_district || addressObj.county || '';
            const cityLower = city.toLowerCase();

            // Supported cities: Chandausi
            const SUPPORTED_CITIES = ['chandausi'];
            const matchedCity = SUPPORTED_CITIES.find(c => cityLower.includes(c) || formattedAddress.toLowerCase().includes(c));

            if (matchedCity) {
              let displayName = 'Chandausi';
              localStorage.setItem('selectedCity', displayName);
              localStorage.setItem('deliveryAddress', formattedAddress);
              setCurrentLocation(displayName);
              setServiceMessage({
                text: `📍 Location Detected! Welcome to Velto! 🚀 We are actively delivering to your doorstep in ${displayName}.`,
                type: 'success'
              });
              showToast(`📍 Location set to ${displayName}!`, 'success');
              setTimeout(() => {
                setShowLocationSelector(false);
              }, 1500);
            } else {
              setServiceMessage({
                text: `📍 Detected doorstep address: "${formattedAddress}". Velto is coming to your area soon! 📦 Stand by for updates.`,
                type: 'warning'
              });
            }
          } else {
            const fallbackAddr = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setLocationInput(fallbackAddr);
            setServiceMessage({ text: `Detected coordinates: ${fallbackAddr}. Please type your city name.`, type: 'warning' });
          }
        } catch (err: any) {
          console.error('Reverse geocoding failed (OpenStreetMap) —', err?.message || err);
          const fallbackAddr = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocationInput(fallbackAddr);
          setServiceMessage({ text: `Detected coordinates: ${fallbackAddr}. Please type your city name.`, type: 'warning' });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        // GeolocationPositionError is a DOMException-like object — log code not the object
        console.error('Geolocation denied or timed out — code:', error?.code, 'message:', error?.message);
        setServiceMessage({ text: 'GPS permission denied or timed out. Please type your city manually.', type: 'warning' });
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleExplore = () => {
    if (!locationInput.trim()) {
      setServiceMessage({ text: 'Please type your delivery location first!', type: 'warning' });
      return;
    }

    setSavingLocation(true);
    setTimeout(() => {
      const inputLower = locationInput.toLowerCase().trim();
      // Supported cities: Chandausi
      const SUPPORTED_CITIES = ['chandausi'];

      const matchedCity = SUPPORTED_CITIES.find(city => inputLower.includes(city));

      if (matchedCity) {
        let displayName = 'Chandausi';
        localStorage.setItem('selectedCity', displayName);
        localStorage.setItem('deliveryAddress', locationInput.trim());
        setCurrentLocation(displayName);
        setServiceMessage({ 
          text: `Welcome to Velto! 🚀 We are actively delivering fresh essentials in ${displayName}!`, 
          type: 'success' 
        });
        showToast(`📍 Location set to ${displayName}!`, 'success');
        setTimeout(() => {
          setShowLocationSelector(false);
        }, 1000);
      } else {
        setServiceMessage({ 
          text: `We are expanding fast! Velto is coming to "${locationInput.trim()}" very soon. 📦 Stand by for updates!`, 
          type: 'warning' 
        });
      }
      setSavingLocation(false);
    }, 1200);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      const suggestions = getSpellingSuggestions(query, products);
      setSpellingSuggestions(suggestions);
    } else {
      setSpellingSuggestions([]);
    }
  };

  const instamartCategories = [
    { name: "Fresh Fruits", img: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=150", icon: <Apple size={14} />, color: "text-rose-500", bg: "bg-white/20 border border-white/40 shadow-sm hover:border-primary/30" },
    { name: "Vegetables", img: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=150", icon: <Leaf size={14} />, color: "text-emerald-500", bg: "bg-white/20 border border-white/40 shadow-sm hover:border-primary/30" },
    { name: "Dairy & Bread", img: "https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?w=150", icon: <Egg size={14} />, color: "text-amber-500", bg: "bg-white/20 border border-white/40 shadow-sm hover:border-primary/30" },
    { name: "Snacks", img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=150", icon: <Cookie size={14} />, color: "text-orange-500", bg: "bg-white/20 border border-white/40 shadow-sm hover:border-primary/30" },
    { name: "Beverages", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=150", icon: <CupSoda size={14} />, color: "text-cyan-500", bg: "bg-white/20 border border-white/40 shadow-sm hover:border-primary/30" },
    { name: "Meat & Fish", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=150", icon: <Flame size={14} />, color: "text-red-500", bg: "bg-white/20 border border-white/40 shadow-sm hover:border-primary/30" },
  ];

  const kitchenCategories = [
    { name: "Cloud Kitchen", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150", icon: <Flame size={14} />, color: "text-amber-500", bg: "bg-white/20 border border-white/40 shadow-sm hover:border-primary/30" },
    { name: "Tiffin Service", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150", icon: <ShoppingBag size={14} />, color: "text-emerald-500", bg: "bg-white/20 border border-white/40 shadow-sm hover:border-primary/30" },
  ];

  const activeCategories = activeModule === 'instamart' ? instamartCategories : kitchenCategories;

  if (showSplash) {
    return <WelcomeSplash />;
  }

  if (authLoading || !user) {
    return null;
  }

  if (showOnboarding) {
    const onboardingSlides = [
      {
        title: "From kitchen to doorstep, hot and on time.",
        description: "Track your order in real time and get delicious meals delivered right to your doorstep.",
        bg: "from-amber-50 to-orange-500/10 dark:from-zinc-950 dark:to-orange-950/20",
        illustration: (
          <div className="relative w-64 h-64 flex items-center justify-center animate-bounce-short">
            {/* Scooter rider illustration using SVG */}
            <svg viewBox="0 0 200 200" className="w-full h-full text-primary" fill="currentColor">
              <circle cx="100" cy="100" r="80" className="fill-orange-500/10 stroke-primary/20 stroke-2" />
              {/* scooter wheel 1 */}
              <circle cx="65" cy="145" r="18" className="fill-zinc-800" />
              <circle cx="65" cy="145" r="8" className="fill-white" />
              {/* scooter wheel 2 */}
              <circle cx="135" cy="145" r="18" className="fill-zinc-800" />
              <circle cx="135" cy="145" r="8" className="fill-white" />
              {/* scooter body */}
              <path d="M 60 120 L 140 120 L 130 90 L 80 90 Z" className="fill-primary" />
              <rect x="75" y="80" width="40" height="25" rx="4" className="fill-amber-500" />
              <circle cx="95" cy="60" r="16" className="fill-amber-100 stroke-amber-500 stroke-2" />
              {/* delivery cap */}
              <path d="M 80 50 Q 95 38 110 50 Z" className="fill-primary" />
              {/* windshield */}
              <path d="M 135 120 L 145 75" className="stroke-zinc-800 stroke-[4]" />
            </svg>
            <div className="absolute top-10 right-10 bg-primary text-white text-[10px] font-black p-2 rounded-2xl shadow-lg rotate-12">
              ⚡ 15 MIN
            </div>
          </div>
        )
      },
      {
        title: "Delicious food, just a tap away.",
        description: "Discover top local restaurants and kitchens serving your favorite foods with zero-friction ordering.",
        bg: "from-rose-50 to-orange-500/10 dark:from-zinc-950 dark:to-orange-950/20",
        illustration: (
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full text-primary" fill="currentColor">
              <circle cx="100" cy="100" r="80" className="fill-orange-500/10 stroke-primary/20 stroke-2" />
              {/* Bowl */}
              <path d="M 40 100 Q 100 200 160 100 Z" className="fill-primary" />
              {/* Noodles */}
              <path d="M 50 100 Q 70 80 90 100 T 130 100 T 150 100" className="fill-none stroke-amber-500 stroke-[5] stroke-linecap-round" />
              {/* Chopsticks */}
              <line x1="120" y1="50" x2="170" y2="120" className="stroke-zinc-800 stroke-[6] stroke-linecap-round" />
              <line x1="135" y1="45" x2="185" y2="115" className="stroke-zinc-800 stroke-[6] stroke-linecap-round" />
              {/* Herbs */}
              <circle cx="70" cy="120" r="8" className="fill-emerald-500" />
              <circle cx="130" cy="120" r="8" className="fill-rose-500" />
              <circle cx="100" cy="140" r="10" className="fill-yellow-400" />
            </svg>
          </div>
        )
      },
      {
        title: "Lightning-fast safe dispatch.",
        description: "Zero-contact deliveries, sanitized packaging, and precise live tracking at your fingertips.",
        bg: "from-emerald-50 to-orange-500/10 dark:from-zinc-950 dark:to-orange-950/20",
        illustration: (
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full text-primary" fill="currentColor">
              <circle cx="100" cy="100" r="80" className="fill-orange-500/10 stroke-primary/20 stroke-2" />
              {/* Shield */}
              <path d="M 60 60 L 100 40 L 140 60 Q 140 120 100 160 Q 60 120 60 60 Z" className="fill-primary" />
              {/* Checkmark inside shield */}
              <path d="M 80 100 L 95 115 L 120 85" className="fill-none stroke-white stroke-[8] stroke-linecap-round stroke-linejoin-round" />
            </svg>
          </div>
        )
      }
    ];

    const currentSlide = onboardingSlides[onboardingStep];

    return (
      <div className={`min-h-screen bg-gradient-to-b ${currentSlide.bg} flex flex-col items-center justify-between p-6 text-center transition-all duration-500 ease-in-out`}>
        {/* Top Status Indicators (matching Figma design) */}
        <div className="w-full max-w-md flex justify-between items-center text-xs font-black text-foreground/80 pt-2 px-2">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span>📶</span>
            <span>🛜</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center gap-8 py-8">
          {currentSlide.illustration}

          <div className="space-y-4 px-4">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
              {currentSlide.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed">
              {currentSlide.description}
            </p>
          </div>
        </div>

        {/* Action Bottom Drawer */}
        <div className="w-full max-w-md space-y-6 pb-8 px-4">
          {/* Pagination Indicators */}
          <div className="flex justify-center gap-2">
            {onboardingSlides.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  onboardingStep === idx ? 'w-6 bg-primary' : 'w-2 bg-zinc-300 dark:bg-zinc-700'
                }`}
              ></span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                if (onboardingStep < onboardingSlides.length - 1) {
                  setOnboardingStep(prev => prev + 1);
                } else {
                  localStorage.setItem('velto_onboarding_dismissed', 'true');
                  setShowOnboarding(false);
                }
              }}
              className="w-full bg-primary text-primary-foreground py-4 rounded-3xl font-black text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              {onboardingStep === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
            </button>
            <button
              onClick={() => {
                localStorage.setItem('velto_onboarding_dismissed', 'true');
                setShowOnboarding(false);
              }}
              className="text-xs font-black text-muted-foreground hover:text-foreground tracking-widest uppercase py-2 cursor-pointer transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* 🥞 Toast Notification Overlay */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100005] w-[90%] max-w-sm bg-zinc-900/95 dark:bg-zinc-950/95 text-white py-3.5 px-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
          <span className="text-base shrink-0">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <p className="text-xs font-black text-white/95 flex-1 leading-tight">{toast.message}</p>
          <button 
            onClick={() => setToast(null)}
            className="text-white/40 hover:text-white text-sm font-black cursor-pointer px-1.5 shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* 🧙‍♂️ AI TasteGenie Report Modal Overlay */}
      {aiModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-background/85 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-card border border-[#ffd700]/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 overflow-hidden glass-panel">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-28 h-28 rounded-full bg-[#9c27b0]/10 blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3">
              <span className="text-3xl shrink-0">{aiModal.icon}</span>
              <div>
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  Velto AI TasteGenie
                  <span className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase">Report</span>
                </h3>
                <p className="text-[10px] text-muted-foreground font-bold">{aiModal.title}</p>
              </div>
            </div>

            <div className="bg-muted/30 border border-border p-4 rounded-2xl space-y-1.5 text-left">
              <h4 className="font-black text-xs text-foreground uppercase tracking-wide">{aiModal.subtitle}</h4>
              <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed whitespace-pre-line">{aiModal.content}</p>
            </div>

            <button
              onClick={() => setAiModal(null)}
              className="w-full bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider py-3.5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-md"
            >
              Awesome, Got It!
            </button>
          </div>
        </div>
      )}

      {/* 📱 Unified PWA Install Modal Popup (Android & iOS) */}
      {showUnifiedInstallBanner && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 overflow-hidden glass-panel">
            {/* Ambient background glows */}
            <div className="absolute -right-12 -top-12 w-36 h-36 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none"></div>
            <div className="absolute -left-12 -bottom-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl shadow-inner shrink-0">
                  📲
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground uppercase tracking-tight flex items-center gap-1.5">
                    Install Velto App <span className="text-[9px] bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">PWA</span>
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                    Get 10-minute grocery delivery & cloud kitchen meals
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowUnifiedInstallBanner(false);
                  localStorage.setItem('velto_pwa_dismissed', 'true');
                }}
                className="text-muted-foreground hover:text-foreground text-xs bg-accent hover:bg-accent/80 p-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body Info */}
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed relative z-10">
              Add Velto to your mobile device home screen for lighting-fast loading, lower data usage, offline cart support, and instant tracking notifications.
            </p>

            {/* OS Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {/* Android / PC Column */}
              <div className="bg-background/50 border border-border/60 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-amber-500/20 transition-all duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Android / Chrome</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                    Supports native background sync and notifications. Installs in one-click.
                  </p>
                </div>
                
                <div className="w-full flex flex-col gap-1">
                  <button
                    onClick={async () => {
                      if (deferredPrompt) {
                        await handleInstallClick();
                      } else {
                        alert(
                          language === 'hi'
                            ? "🤖 एंड्रॉइड / क्रोम पर इंस्टॉल करने के लिए: क्रोम मेनू (ऊपर दाएं तीन बिंदु ⋮) पर क्लिक करें और 'होम स्क्रीन पर जोड़ें' या 'ऐप इंस्टॉल करें' चुनें।"
                            : language === 'hinglish'
                            ? "🤖 Android / Chrome par install karne ke liye: Chrome menu (top right 3 dots ⋮) par click karein aur 'Add to Home screen' ya 'Install app' select karein."
                            : "🤖 To install on Android/Chrome: Tap the browser menu (⋮) and select 'Add to Home screen' or 'Install App'."
                        );
                      }
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🤖</span> {deferredPrompt ? "Install Now" : "Android Steps"}
                  </button>
                  {deferredPrompt && (
                    <span className="text-[8px] text-center text-amber-500 font-black uppercase tracking-wider animate-pulse">
                      ⚡ Direct Install Available
                    </span>
                  )}
                </div>
              </div>

              {/* iOS Column */}
              <div className="bg-background/50 border border-border/60 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-emerald-500/20 transition-all duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🍏</span>
                    <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Apple iOS (Safari)</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                    Run standalone directly on Apple Devices. Installed via the Safari Share menu.
                  </p>
                </div>

                <button
                  onClick={() => {
                    alert(
                      language === 'hi'
                        ? "🍏 आईओएस (सफारी) पर इंस्टॉल करने के लिए:\n\n1. सफारी ब्राउज़र में नीचे 'शेयर' आइकन (↑) पर टैप करें।\n2. मेनू में नीचे स्क्रॉल करें और 'होम स्क्रीन में जोड़ें' (+) चुनें।"
                        : language === 'hinglish'
                        ? "🍏 iOS (Safari) par install karne ke liye:\n\n1. Safari browser mein niche 'Share' icon (↑) par tap karein.\n2. Menu mein niche scroll karein aur 'Add to Home Screen' (+) select karein."
                        : "🍏 To install on iOS (Safari):\n\n1. Tap the Share button (↑) in the Safari toolbar.\n2. Scroll down and select 'Add to Home Screen' (+)."
                    );
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🍏</span> iOS Instructions
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center border-t border-border/60 pt-4 relative z-10 text-[9px] sm:text-[10px]">
              <span className="text-muted-foreground font-semibold">
                *Standalone display mode supports full screen view.
              </span>
              <button
                onClick={() => {
                  setShowUnifiedInstallBanner(false);
                  localStorage.setItem('velto_pwa_dismissed', 'true');
                }}
                className="text-muted-foreground hover:text-foreground font-black uppercase tracking-wider hover:underline transition-all cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🏆 Apple Design Award / Dribbble Quality Header Area */}
      <div className="-mx-4 -mt-4 p-4 sm:-mx-8 sm:-mt-8 sm:p-6 bg-[#070B14] text-white flex flex-col gap-5 relative overflow-hidden pb-6 font-sans">
        
        {/* Glow ambient background graphics */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[20px] left-[-20px] w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* 1. Header Bar: Location, Bell, Wallet, Profile */}
        <div className="flex justify-between items-center z-10 select-none">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setShowLocationSelector(true)}>
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-all">
              <MapPin size={16} className="text-[#FF5F1F] animate-bounce-short" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-widest leading-none">Delivering to</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1">
                  Bhopal, Madhya Pradesh
                  <ChevronDown size={14} className="text-[#FF5F1F] group-hover:translate-y-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
 
          <div className="flex items-center gap-2.5">
            {/* Bell notification button */}
            <button 
              onClick={() => setShowNotificationsDrawer(true)}
              className="w-9 h-9 rounded-xl bg-[#101828]/95 border border-white/8 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
            >
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FF5F1F] rounded-full animate-ping"></span>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FF5F1F] rounded-full"></span>
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-zinc-300" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            {/* Wallet button */}
            <button 
              onClick={() => setShowWalletModal(true)}
              className="w-9 h-9 rounded-xl bg-[#101828]/95 border border-white/8 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Wallet size={16} className="text-zinc-300" />
            </button>
 
            {/* Profile Avatar */}
            <button 
              onClick={() => router.push('/profile')}
              className="relative w-9 h-9 rounded-xl border border-[#7C3AED]/35 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] shrink-0 overflow-hidden"
            >
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Mohit Profile" className="w-full h-full object-cover" />
              {user && (
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-[#070B14] rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* 2. Greetings Section */}
        <div className="text-left mt-1 select-none z-10">
          <span className="text-xs font-semibold text-[#FF5F1F] tracking-wide block">Good Evening 👋</span>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none mt-1">Mohit</h1>
        </div>

        {/* 3. Hero Pizza Banner with floating ingredients */}
        {!searchQuery.trim() && (
          <div className="relative w-full rounded-[2rem] bg-gradient-to-r from-[#FF5F1F] via-[#FF8A00] to-[#FF3D71] overflow-hidden shadow-2xl p-6 flex items-center justify-between text-left select-none my-1 border border-white/10 group">
            
            {/* Ambient animated particle glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)] pointer-events-none" />

            {/* Left text block */}
            <div className="flex flex-col gap-0.5 z-10 max-w-[55%]">
              <span className="text-white font-black text-4xl leading-none tracking-tight uppercase drop-shadow-md">50% OFF</span>
              <span className="text-white/95 font-black text-[10px] uppercase tracking-widest mt-1 drop-shadow-sm">On Your First Order</span>
              
              <div className="border border-dashed border-white/30 rounded-xl px-3 py-1.5 bg-black/10 text-[9px] font-black uppercase text-white tracking-widest mt-3 w-fit select-text cursor-copy">
                Use Code: VELTO50
              </div>

              <button 
                onClick={() => {
                  setSelectedCategory('Cloud Kitchen');
                  setActiveSuperService('food');
                  setActiveModule('kitchen');
                  showToast('Switched to Cloud Kitchen', 'info');
                }}
                className="mt-4 bg-black hover:bg-zinc-900 text-white text-[9px] font-black uppercase tracking-wider px-5 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl w-fit cursor-pointer flex items-center gap-1.5 border border-white/5"
              >
                ORDER NOW &rarr;
              </button>
            </div>
            
            {/* Realistic Overlapping Pizza with Floating Ingredients */}
            <div className="absolute right-0 top-0 bottom-0 w-[45%] overflow-visible flex items-center justify-end z-0">
              <div className="relative w-48 h-48 translate-x-3 translate-y-1.5 shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=450" 
                  alt="Delicious Pizza" 
                  className="w-full h-full object-cover rounded-full border-4 border-white/20 shadow-2xl group-hover:rotate-6 transition-transform duration-700" 
                />
                
                {/* Floating ingredients */}
                {/* Tomatoes */}
                <span className="absolute top-4 left-0 text-lg animate-bounce select-none pointer-events-none drop-shadow-lg" style={{ animationDelay: '0.2s' }}>🍅</span>
                {/* Cheese */}
                <span className="absolute bottom-2 left-4 text-sm animate-bounce select-none pointer-events-none drop-shadow-lg" style={{ animationDelay: '0.6s' }}>🧀</span>
                {/* Basil */}
                <span className="absolute top-2 right-12 text-sm animate-bounce select-none pointer-events-none drop-shadow-lg" style={{ animationDelay: '1s' }}>🌿</span>

                {/* HOT DEALS badge */}
                <div className="absolute -left-3 top-8 bg-white border border-rose-100 rounded-full w-12 h-12 flex flex-col items-center justify-center shadow-2xl select-none rotate-12 animate-pulse">
                  <span className="text-[9px] font-black tracking-tight leading-none text-rose-500">HOT</span>
                  <span className="text-[7px] font-bold text-zinc-500 tracking-wide mt-0.5 leading-none">DEALS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Large Glass Search Bar */}
        <div className="w-full flex flex-col gap-2 z-10">
          <div className="w-full bg-[#101828]/95 border border-white/8 rounded-2xl p-1.5 flex items-center gap-2.5 shadow-xl backdrop-blur-xl">
            <Search className="text-zinc-500 ml-2.5 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Search restaurants, groceries, medicines..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-zinc-100 text-[15px] sm:text-sm font-semibold placeholder:text-zinc-500 min-w-0 py-1.5 px-1"
            />
            
            <button
              onClick={startVoiceListening}
              className={`p-2 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                voiceListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30' 
                  : 'hover:bg-white/5 text-[#FF5F1F]'
              }`}
              title="Voice Ordering"
            >
              <Mic size={16} />
            </button>

            <button
              onClick={() => showToast("📷 Barcode Scanner initializing...", "info")}
              className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 shrink-0"
              title="Barcode Scanner"
            >
              <Scan size={16} />
            </button>

            <div className="w-px h-6 bg-white/10 shrink-0"></div>

            <div 
              onClick={(e) => {
                e.stopPropagation();
                setVegOnly(!vegOnly);
              }}
              className="flex items-center gap-1.5 px-2 shrink-0 cursor-pointer select-none"
              title="Toggle Vegetarian Only"
            >
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Veg</span>
              <button
                type="button"
                className={`relative w-8 h-4.5 rounded-full transition-colors duration-300 flex items-center ${
                  vegOnly ? 'bg-emerald-500' : 'bg-zinc-800'
                }`}
                aria-label="Toggle vegetarian filter"
              >
                <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  vegOnly ? 'translate-x-3.5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>
          </div>

          {/* Spell suggestions */}
          {spellingSuggestions.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center flex-wrap gap-1.5 text-xs text-white">
              <span className="font-bold text-zinc-400">Suggestions:</span>
              {spellingSuggestions.map((sug, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setSearchQuery(sug);
                    setSpellingSuggestions([]);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg font-black tracking-tight transition-all text-[10px] uppercase"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. Floating AI Assistant Block ("Ask Velto AI") */}
        {!searchQuery.trim() && (
          <div className="w-full bg-[#101828]/95 border border-white/8 rounded-[2rem] p-4 flex items-center justify-between gap-4 shadow-xl relative overflow-hidden backdrop-blur-xl select-none text-left">
            <div className="absolute right-[-40px] top-[-40px] w-24 h-24 bg-[#8B5CF6]/15 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3.5 z-10">
              {/* Glowing Robot Icon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white relative shadow-lg">
                <span className="absolute inset-0 rounded-2xl bg-[#8B5CF6]/30 blur-sm animate-ping"></span>
                <span className="text-2xl">🤖</span>
              </div>

              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                  Ask Velto AI <span className="text-[8px] bg-[#8B5CF6]/20 text-[#8B5CF6] px-2 py-0.5 rounded-full font-black uppercase">Plus</span>
                </h3>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Order using your voice agent.</p>
                
                <button 
                  onClick={startVoiceListening}
                  className="mt-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1 cursor-pointer"
                >
                  🎤 Start Speaking
                </button>
              </div>
            </div>

            {/* Voice Wave Animation */}
            <div className="flex items-center gap-0.5 z-10 h-8 pr-2">
              <span className="w-1 h-3 bg-[#8B5CF6] rounded-full animate-pulse"></span>
              <span className="w-1 h-6 bg-[#7C3AED] rounded-full animate-[pulse_1.2s_infinite]"></span>
              <span className="w-1 h-4 bg-[#8B5CF6] rounded-full animate-[pulse_0.8s_infinite]"></span>
              <span className="w-1 h-7 bg-[#EC4899] rounded-full animate-pulse"></span>
              <span className="w-1 h-5 bg-[#8B5CF6] rounded-full animate-[pulse_1s_infinite]"></span>
            </div>
          </div>
        )}

        {/* 6. Circular 3D Categories Grid */}
        {!searchQuery.trim() && (
          <div className="w-full flex flex-col gap-3 z-10 text-left">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Choose Service</span>
            <div className="grid grid-cols-6 gap-3 pb-2 w-full">
              {[
                { name: 'Food', icon: '🍕', color: 'from-orange-500/10 to-red-500/10 border-orange-500/20' },
                { name: 'Grocery', icon: '🍓', color: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20' },
                { name: 'Medicine', icon: '💊', color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20' },
                { name: 'Meat', icon: '🍗', color: 'from-rose-500/10 to-red-500/10 border-rose-500/20' },
                { name: 'Tiffin', icon: '🍱', color: 'from-amber-500/10 to-yellow-500/10 border-amber-500/20' },
                { name: 'Pickup', icon: '📦', color: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20' },
                { name: 'Dine Out', icon: '🍷', color: 'from-pink-500/10 to-rose-500/10 border-pink-500/20' },
                { name: 'Bakery', icon: '🍰', color: 'from-amber-400/10 to-orange-400/10 border-amber-400/20' },
                { name: 'Pet Shop', icon: '🐶', color: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20' },
                { name: 'Flowers', icon: '💐', color: 'from-pink-500/10 to-purple-500/10 border-pink-500/20' },
                { name: 'More', icon: '➕', color: 'from-zinc-500/10 to-slate-500/10 border-zinc-500/20' }
              ].slice(0, 12).map((cat, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    showToast(`Switched to ${cat.name}!`, 'success');
                  }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${cat.color} border flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition-all`}>
                    <span className="text-xl select-none">{cat.icon}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider text-center">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Quick Services Grid */}
        {!searchQuery.trim() && (
          <div className="w-full flex flex-col gap-2 z-10 text-left">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Quick Actions</span>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { name: 'Bolt Delivery', time: '15-20 mins', icon: '⚡', bg: 'from-orange-500/10 to-amber-500/10 border-orange-500/20' },
                { name: 'Express Grocery', time: '10-15 mins', icon: '🛒', bg: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20' },
                { name: 'Medicine Delivery', time: '15 mins', icon: '💊', bg: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20' },
                { name: 'Schedule Order', time: 'Pick slot', icon: '📅', bg: 'from-purple-500/10 to-pink-500/10 border-purple-500/20' }
              ].map((serv, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(serv.name.includes('Grocery') ? 'Grocery' : serv.name.includes('Medicine') ? 'Pharmacy' : null);
                    showToast(`Active: ${serv.name}`, 'info');
                  }}
                  className={`bg-gradient-to-b ${serv.bg} border p-3 rounded-2xl flex flex-col justify-between items-start cursor-pointer hover:scale-[1.02] transition-all h-[95px] text-left`}
                >
                  <span className="text-lg">{serv.icon}</span>
                  <div className="mt-1">
                    <span className="text-[9px] font-black text-white leading-tight block">{serv.name}</span>
                    <span className="text-[8px] font-bold text-zinc-400 block mt-0.5">{serv.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⏰ Closed Store Notice Banner */}
        {!storeOpen && (
          <div className="w-full bg-[#1b0c0f] border border-rose-500/20 text-rose-500 rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden select-none text-left z-10">
            <div className="flex items-start gap-3 z-10 max-w-[65%]">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                <Store size={18} />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider block text-rose-400">Store Operations Closed</span>
                <p className="text-[10px] font-bold leading-normal text-zinc-300 mt-1">We are currently closed. Delivery hours: {storeConfig.startTime} to {storeConfig.endTime}. You can browse, but ordering is disabled.</p>
              </div>
            </div>
            {/* Vector cityscape outline on right */}
            <div className="absolute right-0 top-0 bottom-0 w-[30%] opacity-40 z-0 select-none pointer-events-none flex items-center justify-end">
              <svg viewBox="0 0 100 100" className="w-full h-full text-rose-500" fill="currentColor">
                <path d="M10 80h80v-20h-80z" />
                <path d="M5 60l45-20 45 20z" className="fill-rose-700" />
                <rect x="25" y="65" width="10" height="15" />
                <rect x="45" y="65" width="10" height="10" />
              </svg>
            </div>
          </div>
        )}

        {/* Dine-out Festival Banner */}
        {!searchQuery.trim() && (
          <div 
            onClick={() => {
              showToast('Dine-Out Festival is booking now!', 'success');
            }}
            className="w-full h-[115px] rounded-[2rem] overflow-hidden relative cursor-pointer group border border-purple-500/10 text-left z-10"
          >
            <img 
              src="https://images.unsplash.com/photo-1544025162-d76694265947?w=600" 
              alt="Dine Out Fest" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/90 via-[#7C3AED]/30 to-transparent" />
            <div className="w-full p-5 flex justify-between items-center relative z-10 h-full">
              <div className="flex flex-col justify-end h-full">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight uppercase text-white">DINE-OUT FEST</span>
                  <span className="bg-[#EC4899] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">BOOK NOW</span>
                </div>
                <span className="text-xs font-black tracking-tight uppercase mt-1 text-zinc-200">Flat 30% OFF at top fine dining</span>
              </div>
            </div>
          </div>
        )}

        {/* 8. Popular Near You Restaurant list */}
        {!searchQuery.trim() && (
          <div className="w-full flex flex-col gap-2.5 z-10 text-left">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">🔥 Popular Near You</span>
              <span className="text-[10px] font-black uppercase text-[#FF5F1F] tracking-wider cursor-pointer hover:underline">View all &rarr;</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { name: 'Burger Barn Café', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', rate: '4.6', time: '20-25 mins', dist: '2.1 km', promo: '50% OFF' },
                { name: 'Noodle Nation', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300', rate: '4.4', time: '25-30 mins', dist: '2.3 km', promo: '30% OFF' },
                { name: "La Pino'z Pizza", image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300', rate: '4.5', time: '20-25 mins', dist: '1.8 km', promo: '40% OFF' }
              ].map((rest, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setSearchQuery(rest.name);
                    showToast(`Selected: ${rest.name}`, 'info');
                  }}
                  className="bg-[#101828]/95 border border-white/8 rounded-2xl overflow-hidden shadow-xl cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between text-left h-[165px]"
                >
                  <div className="relative w-full h-[85px]">
                    <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" />
                    {/* promo tag */}
                    <span className="absolute top-1.5 left-1.5 bg-[#FF5F1F] text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">
                      {rest.promo}
                    </span>
                    {/* heart */}
                    <button className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:text-white">
                      ♡
                    </button>
                  </div>
                  <div className="p-2.5 flex flex-col justify-between flex-1">
                    <h4 className="text-[10px] font-black text-white leading-tight line-clamp-1">{rest.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[8px] font-black text-white bg-emerald-600 px-1 rounded flex items-center gap-0.5">★ {rest.rate}</span>
                      <span className="text-[8px] text-zinc-400 font-bold">{rest.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. Live Order Tracking Map Banner */}
        {!searchQuery.trim() && (
          <div 
            onClick={() => router.push('/profile')}
            className="w-full bg-[#101828]/95 border border-white/8 rounded-[2rem] p-4 shadow-xl relative overflow-hidden backdrop-blur-xl select-none text-left z-10"
          >
            <div className="absolute right-[-45px] top-[-45px] w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                <span className="text-[9px] font-black text-[#00D26A] uppercase tracking-widest block">Live Order Tracking</span>
                <h4 className="text-xs font-black text-white mt-1 leading-snug">Your order is on the way! 🚀</h4>
                <span className="text-[9px] font-semibold text-zinc-400 block mt-0.5">Arriving in <span className="text-[#00D26A] font-black">18 mins</span></span>
                
                {/* Route progress */}
                <div className="flex items-center gap-1.5 mt-3 text-[8px] font-bold text-zinc-400">
                  <span>🏪 Hub</span>
                  <div className="flex-1 h-0.5 bg-zinc-800 relative rounded-full">
                    <div className="absolute left-0 top-0 bottom-0 bg-[#00D26A] w-[60%] rounded-full relative">
                      <span className="absolute right-0 top-[-3px] w-2 h-2 rounded-full bg-[#00D26A] border border-white animate-ping"></span>
                    </div>
                  </div>
                  <span>🏠 Home</span>
                </div>
              </div>

              {/* Rider and Action Button */}
              <div className="flex flex-col items-center gap-2.5">
                <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
                  🛵
                </div>
                <button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[8px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all shadow-md">
                  Track Live &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ─── WHITE/CARD CONTENT BODY CONTAINER ─── */}
      <div id="catalog-start" className="flex flex-col gap-8 mt-6">
        {searchQuery.trim() ? (
          /* 🔍 Global Search Results View (Hides other categories to save space) */
          <section className="space-y-4 pb-12">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                Search Results for &quot;{searchQuery}&quot;
              </h2>
              <button 
                onClick={() => handleSearchChange('')}
                className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full hover:bg-primary/20 transition-all cursor-pointer"
              >
                Clear Search ✕
              </button>
            </div>
            
            {false ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-accent/50 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {(() => {
                  const q = searchQuery.toLowerCase().trim();
                  let filtered = products.filter(p => 
                    matchesSearchQuery(p.name, p.description || '', p.category || '', q)
                  );
                  
                  if (vegOnly) {
                    filtered = filtered.filter(p => {
                      const normName = p.name.toLowerCase();
                      return !normName.includes('chicken') && !normName.includes('fish') && !normName.includes('meat') && !normName.includes('egg');
                    });
                  }

                  let isFallback = false;
                  if (filtered.length === 0) {
                    isFallback = true;
                    filtered = products.filter(p => {
                      const name = p.name.toLowerCase();
                      const desc = (p.description || '').toLowerCase();
                      const cat = (p.category || '').toLowerCase();
                      return (
                        name.includes('chocolate') || name.includes('choc') ||
                        name.includes('cookie') || name.includes('cookies') ||
                        name.includes('cake') || name.includes('brownie') ||
                        desc.includes('chocolate') || desc.includes('cookie') ||
                        desc.includes('cookies') || desc.includes('cake') ||
                        cat.includes('chocolate') || cat.includes('cookie') ||
                        cat.includes('cake')
                      );
                    });
                  }

                  if (filtered.length === 0) {
                    return (
                      <div className="col-span-full py-12 text-center text-xs font-bold text-muted-foreground border border-dashed border-border rounded-3xl bg-accent/10">
                        No products matched &quot;{searchQuery}&quot;. Please try another search!
                      </div>
                    );
                  }

                  return (
                    <>
                      {isFallback && (
                        <div className="col-span-full p-5 rounded-3xl bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20 text-xs font-bold text-violet-300 flex flex-col md:flex-row items-center gap-4 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                          {/* Glowing background radial blur */}
                          <span className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl -z-10"></span>
                          <span className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl -z-10"></span>
                          
                          <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-3 rounded-2xl text-white shadow-lg shadow-violet-500/25 flex-shrink-0 animate-bounce">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <p className="font-black text-sm text-white mb-1 uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                              No Direct Matches for &quot;{searchQuery}&quot;
                            </p>
                            <p className="opacity-80 font-medium text-[11px] text-zinc-300">
                              Don&apos;t worry, we&apos;ve got you covered! Automatically showing mouth-watering chocolates, cookies, and cakes to satisfy your cravings. 🍫🍪🍰
                            </p>
                          </div>
                        </div>
                      )}
                      {filtered.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </>
                  );
                })()}
              </div>
            )}
          </section>
        ) : (
          /* 🏠 Standard Browse View */
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* 🚀 Quick Super-Service Selector Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <button 
                onClick={() => {
                  setActiveSuperService('grocery');
                  setActiveModule('instamart');
                  setActivePill('reorder');
                  setSelectedCategory(null);
                  showToast("Switched to Grocery Shop!", "success");
                }}
                className={`relative overflow-hidden p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                  activeSuperService === 'grocery' 
                    ? 'border-primary bg-gradient-to-br from-primary/15 via-background to-primary/5 ring-1 ring-primary shadow-md scale-[1.02]' 
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <span className="absolute top-2.5 right-3.5 text-[7px] bg-primary/10 text-primary font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">10 Min</span>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 rounded-full bg-primary/10 blur-md"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                    🥦
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-tight">Grocery Shop</h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">10-Min doorstep delivery</p>
                  </div>
                </div>
                {activeSuperService === 'grocery' && (
                  <span className="absolute bottom-2.5 right-3 text-[8px] bg-primary text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Active</span>
                )}
              </button>

              <button 
                onClick={() => {
                  setActiveSuperService('food');
                  setActiveModule('kitchen');
                  setActivePill('food');
                  setSelectedCategory(null);
                  showToast("Switched to Food Delivery!", "success");
                }}
                className={`relative overflow-hidden p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                  activeSuperService === 'food' 
                    ? 'border-primary bg-gradient-to-br from-primary/15 via-background to-primary/5 ring-1 ring-primary shadow-md scale-[1.02]' 
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <span className="absolute top-2.5 right-3.5 text-[7px] bg-primary/10 text-primary font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Live</span>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 rounded-full bg-primary/10 blur-md"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                    🍲
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-tight">Food Delivery</h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Cloud Kitchens & Meals</p>
                  </div>
                </div>
                {activeSuperService === 'food' && (
                  <span className="absolute bottom-2.5 right-3 text-[8px] bg-primary text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Active</span>
                )}
              </button>

              <button 
                onClick={() => {
                  setActiveSuperService('pharmacy');
                  setSelectedCategory(null);
                  showToast("Switched to Pharmacy Meds!", "success");
                }}
                className={`relative overflow-hidden p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                  activeSuperService === 'pharmacy' 
                    ? 'border-primary bg-gradient-to-br from-primary/15 via-background to-primary/5 ring-1 ring-primary shadow-md scale-[1.02]' 
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <span className="absolute top-2.5 right-3.5 text-[7px] bg-primary/10 text-primary font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">24/7 SOS</span>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 rounded-full bg-primary/10 blur-md"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                    💊
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-tight">Pharmacy Meds</h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">SOS Medicine Delivery</p>
                  </div>
                </div>
                {activeSuperService === 'pharmacy' && (
                  <span className="absolute bottom-2.5 right-3 text-[8px] bg-primary text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Active</span>
                )}
              </button>

              <button 
                onClick={() => {
                  setActiveSuperService('courier');
                  setSelectedCategory(null);
                  showToast("Switched to Courier dispatch!", "success");
                }}
                className={`relative overflow-hidden p-4 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                  activeSuperService === 'courier' 
                    ? 'border-primary bg-gradient-to-br from-primary/15 via-background to-primary/5 ring-1 ring-primary shadow-md scale-[1.02]' 
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <span className="absolute top-2.5 right-3.5 text-[7px] bg-primary/10 text-primary font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Same Day</span>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 rounded-full bg-primary/10 blur-md"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                    📦
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-tight">Send Courier</h3>
                    <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Same-Day Package Dispatch</p>
                  </div>
                </div>
                {activeSuperService === 'courier' && (
                  <span className="absolute bottom-2.5 right-3 text-[8px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Active</span>
                )}
              </button>
            </div>

            {/* 🪄 Velto AI TasteGenie Section */}
            <section className="bg-gradient-to-br from-[#ffd700]/15 via-background to-[#9c27b0]/10 border border-[#ffd700]/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 rounded-full bg-[#9c27b0]/20 blur-xl pointer-events-none animate-pulse"></div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🪄</span>
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    Velto AI TasteGenie
                    <span className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase">PRO</span>
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Your personal AI Food Chef & Meal Planner</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    const chefPicks = [
                      { name: "Student Study Late-Night Combo", price: 99, desc: "Chai + Instant Noodles + Potato Chips to fuel study sessions!" },
                      { name: "Chai & Ginger Samosa Evening Combo", price: 60, desc: "Fresh brewing ginger tea flask with 2 hot crunchy samosas." },
                      { name: "Daily Standard Veg Lunch Plan", price: 999, desc: "Weekly subscription: Home-style Dal, Sabzi, 4 Rotis, Rice, Curd, Salad." }
                    ];
                    const pick = chefPicks[Math.floor(Math.random() * chefPicks.length)];
                    setAiModal({
                      title: "Chef's Pick Recommendation",
                      subtitle: `${pick.name} (₹${pick.price})`,
                      content: `${pick.desc}\n\n🛒 Added to your basket!`,
                      icon: "👨‍🍳"
                    });
                    
                    const matchedProd = products.find(p => p.name.toLowerCase().includes(pick.name.toLowerCase().split(' ')[0]));
                    if (matchedProd) {
                      addToCart(matchedProd);
                      speakResponse(`Chef's pick added: ${pick.name}`);
                    }
                  }}
                  className="bg-card hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-border p-3 rounded-2xl text-left transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-lg">👨‍🍳</span>
                  <h4 className="text-[10px] font-black text-foreground uppercase mt-1">Chef's Pick</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-medium leading-tight">AI recommends a random tasty combo</p>
                </button>

                <button
                  onClick={() => {
                    const dietCombos = [
                      { name: "Healthy Morning Workout Combo", price: 110, desc: "1kg Bananas + 120g Greek Yogurt cup." },
                      { name: "Family Sunday Breakfast Combo", price: 240, desc: "Bread + Butter + 1L Milk pack + 6 Eggs bundle." }
                    ];
                    const pick = dietCombos[Math.floor(Math.random() * dietCombos.length)];
                    setAiModal({
                      title: "Healthy Diet Suggestion",
                      subtitle: `${pick.name} (₹${pick.price})`,
                      content: `${pick.desc}\n\n🥑 Added to your basket!`,
                      icon: "🥗"
                    });
                    
                    const nameKey = pick.name.split(' ')[0];
                    const matchedProd = products.find(p => p.name.toLowerCase().includes(nameKey.toLowerCase()));
                    if (matchedProd) {
                      addToCart(matchedProd);
                      speakResponse(`Diet combo added: ${pick.name}`);
                    }
                  }}
                  className="bg-card hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-[#1e5235]/30 p-3 rounded-2xl text-left transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-lg">🥑</span>
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase mt-1">Diet Planner</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-medium leading-tight">AI plans healthy low-cal breakfast</p>
                </button>
              </div>

              {/* AI Calorie Calculator Input */}
              <div className="bg-card/70 border border-border/80 rounded-2xl p-3 flex flex-col gap-2">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">AI Calorie & Macro Estimator</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="calorieInput"
                    placeholder="Enter a food item (e.g. Samosa, Paneer Roll, Bread)..."
                    className="flex-grow bg-background border border-border rounded-xl px-3 py-2 text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const inputEl = document.getElementById('calorieInput') as HTMLInputElement;
                        if (inputEl && inputEl.value.trim()) {
                          const val = inputEl.value.toLowerCase().trim();
                          let result = `Estimated macros for 1 serving of "${inputEl.value}":\n\n🔥 Calories: 250 kcal\n💪 Protein: 8g\n🍞 Carbs: 30g\n🥑 Fats: 12g\n\n💡 AI tip: Try our Farm Fresh Tomatoes as a healthy ingredient!`;
                          if (val.includes('samosa')) {
                            result = `Estimated macros for 1 Samosa:\n\n🔥 Calories: 260 kcal\n💪 Protein: 3.5g\n🍞 Carbs: 24g\n🥑 Fats: 17g\n\n💡 AI tip: High calorie/fat cheat meal! Swap for a Healthy Morning Workout Combo instead.`;
                          } else if (val.includes('bread')) {
                            result = `Estimated macros for 2 slices of Whole Wheat Bread:\n\n🔥 Calories: 150 kcal\n💪 Protein: 6g\n🍞 Carbs: 28g\n🥑 Fats: 1.5g\n\n💡 AI tip: Excellent fiber source! Pair with Full Cream Milk.`;
                          }
                          setAiModal({
                            title: "AI Macro Analysis Report",
                            subtitle: inputEl.value,
                            content: result,
                            icon: "🧙‍♂️"
                          });
                          inputEl.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const inputEl = document.getElementById('calorieInput') as HTMLInputElement;
                      if (inputEl && inputEl.value.trim()) {
                        const val = inputEl.value.toLowerCase().trim();
                        let result = `Estimated macros for 1 serving of "${inputEl.value}":\n\n🔥 Calories: 250 kcal\n💪 Protein: 8g\n🍞 Carbs: 30g\n🥑 Fats: 12g\n\n💡 AI tip: Try our Farm Fresh Tomatoes as a healthy ingredient!`;
                        if (val.includes('samosa')) {
                          result = `Estimated macros for 1 Samosa:\n\n🔥 Calories: 260 kcal\n💪 Protein: 3.5g\n🍞 Carbs: 24g\n🥑 Fats: 17g\n\n💡 AI tip: High calorie/fat cheat meal! Swap for a Healthy Morning Workout Combo instead.`;
                        } else if (val.includes('bread')) {
                          result = `Estimated macros for 2 slices of Whole Wheat Bread:\n\n🔥 Calories: 150 kcal\n💪 Protein: 6g\n🍞 Carbs: 28g\n🥑 Fats: 1.5g\n\n💡 AI tip: Excellent fiber source! Pair with Full Cream Milk.`;
                        }
                        setAiModal({
                          title: "AI Macro Analysis Report",
                          subtitle: inputEl.value,
                          content: result,
                          icon: "🧙‍♂️"
                        });
                        inputEl.value = '';
                      }
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/95 text-[9px] font-black uppercase py-2 px-3 rounded-xl transition-all cursor-pointer"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            </section>

            {/* Toggle Pills: REORDER vs FOOD IN 15 MINS */}
            <div className="flex justify-center w-full">
              <div className="bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-full flex items-center gap-1 shadow-sm w-full max-w-sm border border-zinc-200/80 dark:border-zinc-700">
                <button
                  onClick={() => {
                    setActivePill('reorder');
                  }}
                  className={`flex-1 text-center py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activePill === 'reorder'
                      ? 'bg-white dark:bg-zinc-900 text-primary shadow-md'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                  }`}
                >
                  Reorder
                </button>
                <button
                  onClick={() => {
                    setActivePill('food');
                  }}
                  className={`flex-1 text-center py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activePill === 'food'
                      ? 'bg-white dark:bg-zinc-900 text-primary shadow-md'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                  }`}
                >
                  Food In 15 Mins
                </button>
              </div>
            </div>

            {/* 🍔 Product Horizontal Sliders */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <span>{activePill === 'reorder' ? '🔄 Quick Refills & Reorder' : '🍲 Live Cloud Kitchens & Meals'}</span>
                </h2>
                <span className="text-[10px] font-bold text-muted-foreground bg-accent px-2 py-0.5 rounded-md">
                  Slider View
                </span>
              </div>

              {activePill === 'reorder' ? (
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x flex-nowrap w-full">
                  {refillItems.map((item) => {
                    const nameKey = item.name.split(' ')[0];
                    const matchedProd = products.find(p => p.name.toLowerCase().includes(nameKey.toLowerCase()));
                    
                    return (
                      <div 
                        key={item.id}
                        className="w-56 shrink-0 snap-center bg-card border border-border rounded-3xl p-4 flex flex-col justify-between gap-3 shadow-md hover:shadow-lg transition-all hover:border-primary text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="bg-primary/10 text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                              Refill Item
                            </span>
                            <span className="text-[8px] text-rose-500 font-bold animate-pulse">
                              {item.daysLeft} Day Left
                            </span>
                          </div>
                          <h4 className="font-black text-xs text-foreground mt-1 line-clamp-1">{item.name}</h4>
                          <p className="text-[9px] text-muted-foreground font-semibold">Last: {item.lastBought}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                            <div style={{ width: `${100 - item.progress}%` }} className="h-full bg-amber-500 rounded-full" />
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-muted-foreground">
                            <span>{100 - item.progress}% Left</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!storeOpen) {
                              showToast(`⏳ Store Closed! Operational hours: ${storeConfig.startTime} - ${storeConfig.endTime}`, 'error');
                              return;
                            }
                            if (matchedProd) {
                              if (matchedProd.stock !== undefined && matchedProd.stock <= 0) {
                                showToast(`❌ ${matchedProd.name} is currently out of stock!`, 'error');
                                return;
                              }
                              addToCart(matchedProd);
                              showToast(`🛒 Added ${matchedProd.name} to basket!`, 'success');
                            } else {
                              showToast(`Could not find ${item.name} in store!`, 'error');
                            }
                          }}
                          className="w-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider py-2 rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                        >
                          One-Tap Reorder
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x flex-nowrap w-full">
                  {(() => {
                    let displayProducts = products.filter(p => p.category && ['cloud kitchen', 'tiffin service'].includes(p.category.toLowerCase()));

                    if (studentMode) {
                      displayProducts = products.filter(p => 
                        p.name.toLowerCase().includes('combo') || 
                        p.description?.toLowerCase().includes('combo') ||
                        p.category?.toLowerCase().includes('combo') ||
                        p.name.toLowerCase().includes('student') ||
                        p.description?.toLowerCase().includes('student')
                      );
                    }

                    if (vegOnly) {
                      displayProducts = displayProducts.filter(p => {
                        const normName = p.name.toLowerCase();
                        return !normName.includes('chicken') && !normName.includes('fish') && !normName.includes('meat') && !normName.includes('egg');
                      });
                    }

                    if (displayProducts.length === 0) {
                      return (
                        <div className="w-full text-center py-8 text-xs font-bold text-muted-foreground border border-dashed border-border rounded-3xl bg-accent/10">
                          No matching food products found. Try changing filters or search query!
                        </div>
                      );
                    }

                    return displayProducts.map((product) => {
                      const ratingSeed = (3.9 + (product.id ? product.id.charCodeAt(0) % 11 : 4) / 10).toFixed(1);
                      const deliveryTime = product.id ? (product.id.charCodeAt(0) % 4) * 5 + 15 : 20;
                      const isVeg = !product.name.toLowerCase().includes('fish') && 
                                    !product.name.toLowerCase().includes('meat') && 
                                    !product.name.toLowerCase().includes('chicken') && 
                                    !product.name.toLowerCase().includes('egg');

                      let restaurantName = "Hotel Kings Kitchen";
                      let cuisine = "North Indian";
                      
                      if (product.name.includes('Chai')) {
                        restaurantName = "Apna Singh Tea Stall";
                        cuisine = "Tea & Fast Food";
                      } else if (product.name.includes('Tiffin') || product.name.includes('Lunch')) {
                        restaurantName = "Apna Singh Dhaba";
                        cuisine = "Tiffin Service";
                      } else if (product.name.includes('Combo')) {
                        restaurantName = "Khana Khazana Kitchen";
                        cuisine = "Combos & Snacks";
                      }

                      return (
                        <div 
                          key={product.id}
                          className="w-56 shrink-0 snap-center bg-card border border-border rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative flex flex-col justify-between text-left"
                        >
                          <button className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors shadow-sm cursor-pointer">
                            <Heart size={14} />
                          </button>

                          <div className="absolute top-3 left-3 z-20">
                            <span className="bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-0.5 shadow-sm">
                              ★ Top Seller
                            </span>
                          </div>

                          <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-gradient-to-br from-primary/10 to-transparent">
                                <Utensils size={32} className="opacity-40" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                              <span className="text-[9px] font-black text-white uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                                ITEMS AT ₹{product.price}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-black text-xs sm:text-sm text-foreground line-clamp-1 leading-tight">{restaurantName}</h4>
                              <p className="text-[10px] font-bold text-muted-foreground line-clamp-1 mt-0.5">{product.name}</p>
                              
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="bg-emerald-600 text-white px-1.5 py-0.5 rounded-md text-[9px] font-black flex items-center gap-0.5">
                                  <span>★</span>
                                  <span>{ratingSeed}</span>
                                </div>
                                <span className="text-[9px] font-bold text-muted-foreground">•</span>
                                <span className="text-[9px] font-black text-foreground">{deliveryTime}-{deliveryTime + 5} mins</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-border/40 pt-2 mt-2">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full inline-block ${isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                                {cuisine}
                              </span>
                              {product.stock !== undefined && product.stock <= 0 ? (
                                <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl">
                                  OUT
                                </span>
                              ) : (
                                <button 
                                  onClick={() => {
                                    if (!storeOpen) {
                                      showToast(`⏳ Store Closed! Operational hours: ${storeConfig.startTime} - ${storeConfig.endTime}`, 'error');
                                      return;
                                    }
                                    addToCart(product);
                                    showToast(`🛒 Added ${product.name} to basket!`, 'success');
                                  }}
                                  className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                >
                                  ADD
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </section>

            {/* 🍕 "What's on your mind?" Categories Slider */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">What's on your mind?</h2>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                  >
                    Clear Filter ✕
                  </button>
                )}
              </div>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide flex-nowrap w-full snap-x">
                {activeCategories.map((cat, i) => {
                  const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <div 
                      key={i} 
                      onClick={() => {
                        const willSelect = !isSelected;
                        setSelectedCategory(willSelect ? cat.name : null);
                        
                        // Smart Auto-switching super service based on category selection
                        if (willSelect) {
                          if (['cloud kitchen', 'tiffin service'].includes(cat.name.toLowerCase())) {
                            setActiveSuperService('food');
                            setActiveModule('kitchen');
                          } else if (cat.name.toLowerCase() === 'pharmacy') {
                            setActiveSuperService('pharmacy');
                          } else {
                            setActiveSuperService('grocery');
                            setActiveModule('instamart');
                          }
                        }
                      }}
                      className={`flex flex-col items-center justify-center gap-2 cursor-pointer shrink-0 snap-center transition-all duration-300 hover:scale-105 active:scale-95`}
                    >
                      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shadow-md flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'border-primary bg-primary/15 ring-4 ring-primary/20 scale-105 shadow-md shadow-primary/15' 
                          : 'border-border bg-white dark:bg-zinc-900 hover:border-primary/40'
                      }`}>
                        <img 
                          src={cat.img} 
                          alt={cat.name} 
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            isSelected ? 'scale-110' : 'hover:scale-110'
                          }`}
                        />
                      </div>
                      <span className={`font-black text-[9px] sm:text-xs text-center transition-colors uppercase tracking-wider ${
                        isSelected ? 'text-primary' : 'text-zinc-500 dark:text-zinc-300'
                      }`}>
                        {getCategoryTranslation(cat.name)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 🥦 Rest of Categories & Services (Instamart, etc.) */}
            <section className="space-y-4 pt-2 border-t border-border/40">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Explore Services</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { id: 'grocery', name: 'Grocery Shop', desc: '10-Min Delivery', icon: <ShoppingBag size={16} /> },
                  { id: 'food', name: 'Food Delivery', desc: 'Cloud Kitchens', icon: <Utensils size={16} /> },
                  { id: 'pharmacy', name: 'Pharmacy Meds', desc: 'SOS Medicine', icon: <Pill size={16} /> },
                  { id: 'courier', name: 'Send Courier', desc: 'Same-Day Package', icon: <Truck size={16} /> },
                  { id: 'bills', name: 'Utility Bills', desc: 'Recharge & Pay', icon: <Wallet size={16} /> },
                  { id: 'services', name: 'Home Services', desc: 'Deep Cleaning', icon: <Wrench size={16} /> }
                ].map(service => {
                  const isActive = activeSuperService === service.id;
                  return (
                    <button
                      key={service.id}
                      onClick={() => {
                        setActiveSuperService(service.id);
                        if (service.id === 'food') {
                          setActiveModule('kitchen');
                          setActivePill('food');
                        } else {
                          setActiveModule('instamart');
                          setActivePill('reorder');
                        }
                        setSelectedCategory(null);
                        showToast(`Switched to ${service.name} service`, 'success');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 ${
                        isActive 
                          ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                          : 'border-border/40 bg-muted/20 hover:border-primary/20'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mb-1.5 flex items-center justify-center ${
                        isActive ? 'bg-primary text-primary-foreground shadow-sm animate-pulse' : 'bg-background text-muted-foreground'
                      }`}>
                        {service.icon}
                      </div>
                      <span className="text-[10px] font-black text-foreground block uppercase tracking-tight">{service.name}</span>
                      <span className="text-[8px] text-muted-foreground font-semibold block mt-0.5">{service.desc}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 🍱 Food Role Sub-Navigation Tabs */}
            {activeSuperService === 'food' && (
              <div className="flex gap-2.5 justify-center py-2 pt-4 border-t border-border/20">
                {[
                  { id: 'all', name: 'All Food 🍲' },
                  { id: 'cloud kitchen', name: 'Cloud Kitchen 🍳' },
                  { id: 'tiffin service', name: 'Tiffin Services 🍱' }
                ].map(tab => {
                  const isActive = (tab.id === 'all' && !selectedCategory) || (selectedCategory?.toLowerCase() === tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSelectedCategory(tab.id === 'all' ? null : tab.id);
                        showToast(`Filtered to ${tab.name}`, 'success');
                      }}
                      className={`text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.02]'
                          : 'bg-muted/10 border-border text-muted-foreground hover:text-foreground hover:bg-muted/20'
                      }`}
                    >
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 🛒 ALL ITEMS LIST (Collapsible / Toggleable) */}
            <section className="space-y-4 pt-2 border-t border-border/40 pb-12">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                  {selectedCategory 
                    ? `${getCategoryTranslation(selectedCategory)} Items` 
                    : `${activeSuperService.toUpperCase()} Catalog`}
                </h2>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full hover:bg-primary/20 transition-all cursor-pointer"
                  >
                    Show All ✕
                  </button>
                )}
              </div>

              {false ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-accent/50 animate-pulse rounded-2xl"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {(() => {
                    let moduleProducts = products;
                    if (studentMode) {
                      moduleProducts = products.filter(p => 
                        p.name.toLowerCase().includes('combo') || 
                        p.description?.toLowerCase().includes('combo') ||
                        p.category?.toLowerCase().includes('combo') ||
                        p.name.toLowerCase().includes('student') ||
                        p.description?.toLowerCase().includes('student')
                      );
                    } else {
                      if (activeSuperService === 'grocery') {
                        moduleProducts = products.filter(p => p.category && !['cloud kitchen', 'tiffin service', 'pharmacy', 'courier', 'bills & recharge', 'home services'].includes(p.category.toLowerCase()));
                      } else if (activeSuperService === 'food') {
                        moduleProducts = products.filter(p => p.category && ['cloud kitchen', 'tiffin service'].includes(p.category.toLowerCase()));
                      } else if (activeSuperService === 'pharmacy') {
                        moduleProducts = products.filter(p => p.category && p.category.toLowerCase() === 'pharmacy');
                      } else if (activeSuperService === 'courier') {
                        moduleProducts = products.filter(p => p.category && p.category.toLowerCase() === 'courier');
                      } else if (activeSuperService === 'bills') {
                        moduleProducts = products.filter(p => p.category && p.category.toLowerCase() === 'bills & recharge');
                      } else if (activeSuperService === 'services') {
                        moduleProducts = products.filter(p => p.category && p.category.toLowerCase() === 'home services');
                      }
                    }

                    if (vegOnly) {
                      moduleProducts = moduleProducts.filter(p => {
                        const normName = p.name.toLowerCase();
                        return !normName.includes('chicken') && !normName.includes('fish') && !normName.includes('meat') && !normName.includes('egg');
                      });
                    }

                    let filtered = selectedCategory 
                      ? moduleProducts.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())
                      : moduleProducts;

                    if (filtered.length === 0) {
                      return (
                        <div className="col-span-full py-8 text-center text-xs font-bold text-muted-foreground border border-dashed border-border rounded-3xl bg-accent/10">
                          No items matching current criteria. Try resetting query or categories.
                        </div>
                      );
                    }

                    return filtered.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ));
                  })()}
                </div>
              )}
            </section>
          </div>
        )}
      </div>


      {/* 🔮 Special Landing Page Popup Modal Banner */}
      {popupAnn && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#2a085c] via-[#0d0614] to-[#04010a] border border-violet-500/30 text-white shadow-2xl p-6 text-center animate-in zoom-in-95 duration-300">
            {/* Background glowing highlights */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#ff5e97]/20 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Close Button Top Right */}
            <button 
              onClick={() => setPopupAnn(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 active:scale-95 transition-all text-white flex items-center justify-center cursor-pointer font-bold text-xs"
              title="Close"
            >
              ✕
            </button>

            {/* Display Ghee Banner Image if it's a Ghee launch announcement */}
            {popupAnn.title.toLowerCase().includes('ghee') || popupAnn.content.toLowerCase().includes('ghee') ? (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-lg mt-2">
                <img 
                  src="/ghee-banner.jpg" 
                  alt="Velto Ghee Launch Banner" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              /* Glowing Logo Badge */
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary to-[#ff5e97] mx-auto flex items-center justify-center text-white text-3xl shadow-xl shadow-primary/20 mb-4 animate-bounce-short">
                📢
              </div>
            )}

            {/* Title (Stripped) */}
            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              {popupAnn.title.replace('[POPUP]', '').trim()}
            </h2>

            {/* Content Text */}
            <p className="text-xs text-zinc-300 leading-relaxed font-semibold mb-6 px-2">
              {popupAnn.content}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2 relative z-10">
              <button
                onClick={() => {
                  setPopupAnn(null);
                  const isGhee = popupAnn.title.toLowerCase().includes('ghee') || popupAnn.content.toLowerCase().includes('ghee');
                  if (isGhee) {
                    setShowGheePreorder(true);
                    setGheeQuantity(1);
                  } else {
                    const element = document.getElementById('catalog-start');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⚡</span> Claim Now & View Shop
              </button>
              <button
                onClick={() => setPopupAnn(null)}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 py-3 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer"
              >
                Dismiss Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🍯 Special Ghee Pre-order Selection Modal */}
      {showGheePreorder && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#2f1b0c] via-[#0f0a07] to-[#050302] border border-amber-500/30 text-white shadow-2xl p-6 text-center animate-in zoom-in-95 duration-300">
            {/* Background glowing highlights */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Close Button Top Right */}
            <button 
              onClick={() => setShowGheePreorder(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 active:scale-95 transition-all text-white flex items-center justify-center cursor-pointer font-bold text-xs"
              title="Close"
            >
              ✕
            </button>

            {/* Ghee Image */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 border border-amber-500/20 shadow-lg mt-2">
              <img 
                src="/ghee-banner.jpg" 
                alt="Velto Ghee Preorder" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-amber-500 text-black text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                Pan India Delivery
              </div>
            </div>

            <h2 className="text-xl font-black uppercase tracking-tight text-amber-400 mb-1">
              🥛 Pure Desi Ghee Pre-Order
            </h2>
            <p className="text-[10px] text-zinc-300 leading-normal mb-4 font-medium px-4">
              Order premium quality Cow Ghee & Buffalo Ghee delivering across India with trusted safety.
            </p>

            {/* Selection of Ghee type */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSelectedGheeType('cow')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedGheeType === 'cow' 
                    ? 'bg-amber-500/25 border-amber-500 text-amber-200' 
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-black uppercase">🐮 Cow Ghee</div>
                <div className="text-[10px] opacity-80 mt-0.5">₹1950 / 1 KG</div>
              </button>
              <button
                onClick={() => setSelectedGheeType('buffalo')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedGheeType === 'buffalo' 
                    ? 'bg-amber-500/25 border-amber-500 text-amber-200' 
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-black uppercase">🦬 Buffalo Ghee</div>
                <div className="text-[10px] opacity-80 mt-0.5">₹1450 / 1 KG</div>
              </button>
            </div>

            {/* Quantity Selector in KG */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-6">
              <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Select Quantity (KG)</div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setGheeQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-bold flex items-center justify-center cursor-pointer text-lg"
                >
                  -
                </button>
                <span className="text-xl font-black text-amber-400 min-w-16">
                  {gheeQuantity} KG
                </span>
                <button
                  onClick={() => setGheeQuantity(prev => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-bold flex items-center justify-center cursor-pointer text-lg"
                >
                  +
                </button>
              </div>
              <div className="text-xs text-zinc-300 font-extrabold mt-3">
                Total Price: ₹{(selectedGheeType === 'cow' ? 1950 : 1450) * gheeQuantity}
              </div>
            </div>

            {/* Place Order / Add to Cart Action */}
            <button
              onClick={() => {
                const gheeProduct = {
                  id: selectedGheeType === 'cow' ? 'ghee-cow' : 'ghee-buffalo',
                  name: selectedGheeType === 'cow' ? 'A2 Pure Desi Cow Ghee' : 'Premium Vedic Buffalo Ghee',
                  description: `Pure natural ${selectedGheeType === 'cow' ? 'Cow' : 'Buffalo'} Ghee delivering across India with trusted safety.`,
                  price: selectedGheeType === 'cow' ? 1950 : 1450,
                  image_url: '/ghee-banner.jpg',
                  category: 'Ghee'
                };
                clearCart();
                addToCart(gheeProduct);
                setTimeout(() => {
                  updateQuantity(gheeProduct.id, gheeQuantity);
                  setShowGheePreorder(false);
                  router.push('/cart');
                }, 100);
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black py-4 rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🛒</span> Place Order Now
            </button>
          </div>
        </div>
      )}

      {/* Floating AI Assistant Chat Button and Panel */}
      <div className={`fixed ${cart.length > 0 ? 'bottom-44' : 'bottom-28'} sm:bottom-28 right-4 sm:right-6 z-[9999] flex flex-col items-end gap-3 max-w-[calc(100vw-2rem)] sm:max-w-none`}>
        {showAiChat && (
          <div className="w-[calc(100vw-2rem)] sm:w-96 h-[340px] sm:h-[400px] bg-card/95 backdrop-blur border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="bg-primary/5 border-b border-border/60 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-tight text-foreground flex items-center gap-1">Velto AI Agent <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span></h4>
                  <p className="text-[9px] text-muted-foreground font-semibold">Online & ready to order</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiChat(false)}
                className="text-muted-foreground hover:text-foreground text-xs bg-accent hover:bg-accent/85 p-1 px-2.5 rounded-lg font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[160px] sm:max-h-[220px]">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground font-medium animate-in slide-in-from-right-2 duration-150' 
                      : 'bg-accent/50 text-foreground border border-border/40 font-semibold animate-in slide-in-from-left-2 duration-150'
                  }`}>
                    <p>{msg.text}</p>
                    
                    {msg.sender === 'bot' && msg.actionText && (
                      <button
                        onClick={() => {
                          if (msg.actionType === 'ADD_TO_CART') {
                            addToCart(msg.payload);
                            speakResponse(`Added ${msg.payload.name} to your basket!`);
                          } else if (msg.actionType === 'ADD_COMBO_TO_CART') {
                            const items = msg.payload as Product[];
                            items.forEach(item => addToCart(item));
                            speakResponse("AI Copilot has added the meal combo items to your basket!");
                          } else if (msg.actionType === 'FILTER_HEALTHY') {
                            setSelectedCategory('Fresh Fruits');
                            speakResponse("Filtered to Fresh Fruits category!");
                          } else if (msg.actionType === 'ACTIVATE_PASS') {
                            speakResponse("One India Pass Activated! Enjoy free delivery.");
                          }
                          // Close chat on successful click
                          setShowAiChat(false);
                        }}
                        className="mt-2.5 w-full bg-background/90 hover:bg-background text-foreground border border-border/80 font-black uppercase text-[9px] py-1.5 px-3 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Plus size={10} /> {msg.actionText}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-accent/25 border-t border-border/60 p-2.5 flex flex-wrap gap-1.5">
              {[
                { label: 'Order Usual Paneer Roll', text: 'Order usual paneer roll' },
                { label: 'Healthy Dinner < ₹150', text: 'Healthy dinner under ₹150 nearby' },
                { label: 'Reorder Birthday Cake', text: "Mom's birthday cake reorder" },
                { label: 'Breakfast for 4 < ₹300', text: 'Make breakfast for 4 people under ₹300' }
              ].map((shortcut, i) => (
                <button
                  key={i}
                  onClick={() => handleAiChatSubmit(shortcut.text)}
                  className="bg-background/90 hover:bg-background border border-border/60 text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-lg transition-all hover:border-primary shadow-inner"
                >
                  {shortcut.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="border-t border-border/60 p-3 bg-card flex gap-2">
              <input
                type="text"
                placeholder="Ask: 'paneer roll', 'One India Pass'..."
                value={aiChatQuery}
                onChange={e => setAiChatQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiChatSubmit()}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
              />
              <button
                onClick={() => handleAiChatSubmit()}
                className="bg-primary hover:bg-primary/95 text-primary-foreground p-2 rounded-xl flex items-center justify-center transition-all shadow-md"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowAiChat(!showAiChat)}
          className="w-14 h-14 bg-primary hover:bg-primary/95 text-primary-foreground rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-primary-foreground/10 group"
          title="Open AI Personal Assistant"
        >
          <Bot size={24} className="group-hover:rotate-6 transition-transform" />
        </button>
      </div>

      {/* 📍 FORCED/MANUAL LOCATION SELECTOR OVERLAY */}
      {(!currentLocation || showLocationSelector) && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/60 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-card border border-border/85 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 overflow-hidden glass-panel text-left">
            {/* Close button if location is already set */}
            {currentLocation && (
              <button 
                onClick={() => setShowLocationSelector(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm font-black cursor-pointer p-1"
              >
                ✕
              </button>
            )}

            {/* Ambient Pink Glow Blob */}
            {!lowInternetMode && (
              <>
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none"></div>
              </>
            )}

            <div className="text-center space-y-2 relative z-10">
              <div className="inline-flex p-4 bg-primary/10 text-primary rounded-3xl mb-2 animate-bounce-short">
                <MapPin size={36} />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">{t('verifyLocation', language)}</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {t('verifyLocationDesc', language)}
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              {/* GPS Auto Detect */}
              <button
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {detectingLocation ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                    {t('detectingLocation', language)}
                  </>
                ) : (
                  <>
                    <Navigation size={16} className="rotate-45 fill-primary-foreground" />
                    {t('detectLocation', language)}
                  </>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border/40"></div>
                <span className="flex-shrink mx-3 text-[9px] font-black uppercase text-muted-foreground tracking-widest">{t('orSearchManually', language)}</span>
                <div className="flex-grow border-t border-border/40"></div>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <div className="flex w-full items-center space-x-2 bg-background/50 p-1.5 rounded-xl border border-border focus-within:ring-2 focus-within:ring-primary transition-all">
                  <MapPin className="text-muted-foreground ml-2" size={18} />
                  <input
                    type="text"
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                    placeholder={t('placeholderCity', language)}
                    className="flex-1 bg-transparent border-none focus:outline-none px-1 text-xs sm:text-sm font-semibold"
                    onKeyDown={e => e.key === 'Enter' && !savingLocation && handleExplore()}
                  />
                  <button
                    onClick={handleExplore}
                    disabled={savingLocation}
                    className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-primary/95 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 min-w-[70px]"
                  >
                    {savingLocation ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                        Saving
                      </>
                    ) : (
                      t('verify', language)
                    )}
                  </button>
                </div>
              </div>

              {serviceMessage.text && (
                <div className={`w-full p-3.5 rounded-xl text-xs font-bold border leading-relaxed transition-all ${
                  serviceMessage.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {serviceMessage.text}
                </div>
              )}

              {/* Active Hubs Guideline */}
              <div className="border-t border-border/40 pt-4 space-y-2">
                <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t('activeHubs', language)}</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Lucknow', 'Delhi', 'Bangalore', 'Mumbai', 'Moradabad', 'Sambhal', 'Chandausi', 'Bhind'].map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setLocationInput(city);
                        setSavingLocation(true);
                        setTimeout(() => {
                          if (city.toLowerCase() === 'chandausi') {
                            localStorage.setItem('selectedCity', city);
                            localStorage.setItem('deliveryAddress', `${city} Central Plaza Hub`);
                            setCurrentLocation(city);
                            setServiceMessage({ 
                              text: `Welcome to Velto! 🚀 We are actively delivering fresh essentials in ${city}!`, 
                              type: 'success' 
                            });
                            setSavingLocation(false);
                            showToast(`📍 Location set to ${city}!`, 'success');
                            setTimeout(() => {
                              setShowLocationSelector(false);
                            }, 1000);
                          } else {
                            setServiceMessage({ 
                              text: `We are expanding fast! Velto is coming to "${city}" very soon. 📦 Stand by for updates!`, 
                              type: 'warning' 
                            });
                            setSavingLocation(false);
                            showToast(`⏳ ${city}: Coming Soon!`, 'warning');
                          }
                        }, 1200);
                      }}
                      className="bg-accent/40 border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-inner cursor-pointer"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 💳 Wallet Modal (Razorpay Top-Up) */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300 select-none">
          <div className="relative w-full max-w-sm bg-[#101828] border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-5 text-left">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Velto Wallet</h3>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Top-up instantly using Razorpay</p>
              </div>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Balance Display */}
            <div className="bg-gradient-to-r from-[#FF5F1F] via-[#FF8A00] to-[#FF3D71] rounded-2xl p-5 text-white flex flex-col justify-between h-32 relative overflow-hidden border border-white/10">
              <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Available Balance</span>
              <h2 className="text-3xl font-black tracking-tight mt-2">₹{walletBalance.toFixed(2)}</h2>
              <span className="text-[8px] font-black uppercase tracking-wider text-white/60 mt-1">Unified Family Credit Active</span>
            </div>

            {/* Inputs & Quick add */}
            <div className="space-y-3.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Add Money (INR)</label>
              
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-sm">₹</span>
                <input 
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white text-sm font-bold focus:outline-none focus:border-[#FF5F1F]"
                  placeholder="Enter amount"
                />
              </div>

              {/* Quick buttons */}
              <div className="grid grid-cols-3 gap-2">
                {['100', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(amt)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-xl text-xs font-black text-white cursor-pointer transition-all"
                  >
                    + ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Proceed Online Payment Razorpay */}
            <button
              disabled={walletLoading}
              onClick={async () => {
                const amt = parseFloat(topUpAmount);
                if (isNaN(amt) || amt <= 0) {
                  alert("Please enter a valid amount to top up.");
                  return;
                }
                setWalletLoading(true);

                try {
                  const res = await fetch('/api/razorpay/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: amt }),
                  });
                  const orderData = await res.json();

                  if (orderData.error) {
                    alert(orderData.error);
                    setWalletLoading(false);
                    return;
                  }

                  const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'Velto Wallet Topup',
                    description: 'Instant Wallet Add Money',
                    order_id: orderData.id,
                    handler: async function (response: any) {
                      const newBal = walletBalance + amt;
                      localStorage.setItem('velto_wallet_balance', newBal.toString());
                      setWalletBalance(newBal);
                      
                      // Trigger notifications
                      import('@/lib/notifications').then((mod) => {
                        mod.showLocalNotification('💳 Wallet Top-Up Successful!', `₹${amt.toFixed(2)} successfully added to your Velto Wallet balance.`);
                      });
                      
                      showToast(`Successfully added ₹${amt} to your Wallet!`, 'success');
                      setWalletLoading(false);
                      setShowWalletModal(false);
                    },
                    prefill: {
                      name: user?.email || 'Customer',
                      email: user?.email || 'customer@velto.com'
                    },
                    theme: { color: '#ff5f1f' }
                  };

                  const rzp = new (window as any).Razorpay(options);
                  rzp.on('payment.failed', function (resp: any) {
                    alert(`Payment failed: ${resp.error.description}`);
                    setWalletLoading(false);
                  });
                  rzp.open();

                } catch (e) {
                  alert("Network error: Wallet Topup failed.");
                  setWalletLoading(false);
                }
              }}
              className="w-full bg-gradient-to-r from-[#FF5F1F] via-[#FF8A00] to-[#FF3D71] text-white text-xs font-black uppercase tracking-wider py-4 rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              {walletLoading ? "Processing Payment..." : "Proceed with Razorpay"}
            </button>

          </div>
        </div>
      )}

      {/* 🔔 Notifications Drawer panel */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setShowNotificationsDrawer(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />

          <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-card border-l border-border flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 text-left">
            
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Notification Box</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Simulated Swiggy & Zepto Style alerts</p>
              </div>
              <button 
                onClick={() => setShowNotificationsDrawer(false)}
                className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {customNotifications.map((notif) => (
                <div key={notif.id} className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col justify-between gap-3 hover:border-primary/40 transition-all">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        notif.type === 'sos' ? 'bg-rose-500/10 text-rose-500' :
                        notif.type === 'offer' ? 'bg-[#b5ff3b]/20 text-emerald-400' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {notif.type}
                      </span>
                      <span className="text-[8px] font-semibold text-muted-foreground">{notif.time}</span>
                    </div>
                    <h4 className="text-xs font-black text-foreground">{notif.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">{notif.content}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        if ('Notification' in window) {
                          if (Notification.permission === 'granted') {
                            import('@/lib/notifications').then((mod) => {
                              mod.showLocalNotification(notif.title, notif.content);
                            });
                          } else {
                            alert("Please enable notification permissions first! (Tap allow on the browser popups).");
                            Notification.requestPermission();
                          }
                        }
                      }
                    }}
                    className="w-full bg-[#12271a] hover:bg-[#1c3c28] text-white text-[9px] font-black uppercase tracking-wider py-2 rounded-xl transition-all cursor-pointer border border-[#1e3c27] flex items-center justify-center gap-1 shadow-sm"
                  >
                    🔔 Try Mobile Screen Alert
                  </button>
                </div>
              ))}
            </div>

            {/* Footer / CTA */}
            <div className="p-4 bg-muted/20 border-t border-border/60">
              <button 
                onClick={() => {
                  import('@/lib/notifications').then((mod) => {
                    mod.showLocalNotification("🎉 Live Alerts Setup Active!", "Velto is monitoring your instant deliveries in real-time.");
                  });
                }}
                className="w-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider py-3.5 rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Send General Test Notification
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
