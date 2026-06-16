'use client';
import { Search, MapPin, Clock, ShoppingBag, Apple, Leaf, Egg, Cookie, CupSoda, Flame, Plus, Sparkles, Zap, AlertCircle, Compass, HelpCircle, Mic, Bot, Send, Dumbbell, Coffee, Heart, Utensils, Calendar, ShieldCheck, Tag, Sparkle, Store, Users, DollarSign, Shield, HeartHandshake, Navigation, Pill, Truck, Wallet, Wrench, Megaphone } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProductCard, Product } from '@/components/ProductCard';
import DeliveryRiderAnimation from '@/components/DeliveryRiderAnimation';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { t, matchesSearchQuery } from '@/lib/translations';

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
  { id: 'combo-workout', name: 'Healthy Morning Workout Combo', description: '1kg Bananas + 120g Greek Yogurt cup.', price: 110, image_url: '', category: 'Fresh Fruits' }
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
  const [loading, setLoading] = useState(true);
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

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAnnouncements(data);
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
        setAnnouncements(JSON.parse(local));
      } catch (err) {
        console.error("Failed parsing localStorage announcements:", err);
      }
    } else {
      // Seed default mock announcements
      const defaultAnns: Announcement[] = [
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
          id: 'mock-ann-1',
          title: '📢 Weekend Late Night Kitchen Deliveries',
          content: 'Satisfy late midnight cravings! Cloud Kitchen is now delivering gourmet meals and snacks until 3:00 AM on Friday & Saturday.',
          type: 'announcement',
          created_at: new Date(Date.now() - 10800000).toISOString()
        }
      ];
      setAnnouncements(defaultAnns);
      localStorage.setItem('velto_announcements', JSON.stringify(defaultAnns));
    }
  };

  const { cart, addToCart } = useCart();
  const { language } = useSettings();

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
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // stop any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' || language === 'hinglish' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
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
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          const approved = data.filter((p: any) => p.is_approved !== false);
          setProducts(approved);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
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
      alert("Geolocation is not supported by your browser.");
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

            // Supported cities: Lucknow, Delhi, Bangalore, Mumbai, Moradabad, Sambhal, Chandausi, Bhind
            const SUPPORTED_CITIES = ['lucknow', 'delhi', 'bangalore', 'banlore', 'mumbai', 'moradabad', 'sambhal', 'chandausi', 'bhind', 'bhiind'];
            const matchedCity = SUPPORTED_CITIES.find(c => cityLower.includes(c) || formattedAddress.toLowerCase().includes(c));

            if (matchedCity) {
              let displayName = matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1);
              if (displayName === 'Banlore') displayName = 'Bangalore';
              if (displayName === 'Bhiind') displayName = 'Bhind';

              localStorage.setItem('selectedCity', displayName);
              localStorage.setItem('deliveryAddress', formattedAddress);
              setCurrentLocation(displayName);
              setServiceMessage({
                text: `📍 Location Detected! Welcome to Velto! 🚀 We are actively delivering to your doorstep in ${displayName}.`,
                type: 'success'
              });
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

    const inputLower = locationInput.toLowerCase().trim();
    // Supported cities: Lucknow, Delhi, Bangalore, Mumbai, Moradabad, Sambhal, Chandausi, Bhind
    const SUPPORTED_CITIES = ['lucknow', 'delhi', 'bangalore', 'banlore', 'mumbai', 'moradabad', 'sambhal', 'chandausi', 'bhind', 'bhiind'];

    const matchedCity = SUPPORTED_CITIES.find(city => inputLower.includes(city));

    if (matchedCity) {
      // Standardize display name
      let displayName = matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1);
      if (displayName === 'Banlore') displayName = 'Bangalore';
      if (displayName === 'Bhiind') displayName = 'Bhind';
      
      localStorage.setItem('selectedCity', displayName);
      localStorage.setItem('deliveryAddress', locationInput.trim());
      setCurrentLocation(displayName);
      setServiceMessage({ 
        text: `Welcome to Velto! 🚀 We are actively delivering fresh essentials in ${displayName}!`, 
        type: 'success' 
      });
    } else {
      setServiceMessage({ 
        text: `We are expanding fast! Velto is coming to "${locationInput.trim()}" very soon. 📦 Stand by for updates!`, 
        type: 'warning' 
      });
    }
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

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">Redirecting to login dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* 📱 Unified PWA Install Banner (Android & iOS) */}
      {showUnifiedInstallBanner && (
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-background/60 to-emerald-500/10 border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 animate-in slide-in-from-top-4 duration-300">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="flex items-start gap-4 relative z-10 w-full lg:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl shrink-0 shadow-inner">
              📲
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                Install Velto App <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-black uppercase">PWA</span>
              </h4>
              <p className="text-xs text-muted-foreground font-semibold max-w-xl leading-relaxed">
                Add Velto to your home screen for instant 10-minute deliveries, cloud kitchen food, and home services on both Android & iOS.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto relative z-10">
            {/* Android / Desktop Install */}
            <div className="flex-1 sm:flex-initial flex flex-col gap-1 w-full sm:w-auto">
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
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer animate-pulse-short"
              >
                <span>🤖</span> Android / Chrome
              </button>
              {deferredPrompt && (
                <span className="text-[9px] text-center text-amber-500/80 font-black uppercase tracking-wider animate-pulse">
                  ⚡ Direct Install Available
                </span>
              )}
            </div>

            {/* iOS Safari Install */}
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
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🍏</span> iPhone / iOS (Safari)
            </button>

            {/* Dismiss Button */}
            <button
              onClick={() => {
                setShowUnifiedInstallBanner(false);
                localStorage.setItem('velto_pwa_dismissed', 'true');
              }}
              className="w-full sm:w-auto bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground text-xs font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer text-center"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {/* 🚀 Multi-Service Super App Selector Menu */}
      <section className="glass-panel border border-border/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/60 pb-3 mb-3">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-full shadow-sm">
              Velto Super App
            </span>
            <h2 className="text-sm font-black text-foreground">Select Super Service</h2>
          </div>

          {/* 🎓 Student Mode Toggle */}
          <button
            onClick={() => {
              setStudentMode(!studentMode);
              if (!studentMode) {
                alert("🎓 Student Mode Active! Swapped to high-value budget combos, midnight snacks, and study packs.");
                speakResponse("Student Mode active. Check out cheap snacks and budget combos below.");
                setSearchQuery("Combo");
              } else {
                setSearchQuery("");
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
              studentMode 
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 animate-bounce' 
                : 'bg-accent/40 border-border hover:bg-primary hover:text-primary-foreground text-muted-foreground'
            }`}
          >
            <Users size={12} />
            {studentMode ? '🎓 Student Mode: On' : '🎓 Student Mode'}
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { id: 'grocery', name: 'Grocery', desc: '10-Min Delivery', icon: <ShoppingBag size={16} /> },
            { id: 'food', name: 'Food/Kitchen', desc: 'Cloud Kitchens', icon: <Utensils size={16} /> },
            { id: 'pharmacy', name: 'Pharmacy', desc: 'Medicines', icon: <Pill size={16} /> },
            { id: 'courier', name: 'Courier', desc: 'Send Packages', icon: <Truck size={16} /> },
            { id: 'bills', name: 'Bills/Pay', desc: 'Recharge/Utility', icon: <Wallet size={16} /> },
            { id: 'services', name: 'Services', desc: 'Home Cleaner', icon: <Wrench size={16} /> }
          ].map(service => {
            const isActive = activeSuperService === service.id;
            return (
              <button
                key={service.id}
                onClick={() => {
                  setActiveSuperService(service.id);
                  if (service.id === 'food') {
                    setActiveModule('kitchen');
                  } else {
                    setActiveModule('instamart');
                  }
                  alert(`Activated Super Service: ${service.name}`);
                }}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all hover:scale-[1.03] duration-300 ${
                  isActive 
                    ? 'border-primary bg-primary/10 ring-1 ring-primary neon-glow' 
                    : 'border-border/40 bg-muted/20 hover:border-primary/30 hover:bg-muted/40'
                }`}
              >
                <div className={`p-1.5 sm:p-2 rounded-lg mb-1 flex items-center justify-center ${
                  isActive ? 'bg-primary text-primary-foreground shadow-md' : 'bg-background text-muted-foreground'
                }`}>
                  {service.icon}
                </div>
                <span className="text-[10px] font-black text-foreground block">{service.name}</span>
                <span className="text-[8px] text-muted-foreground font-semibold block mt-0.5">{service.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-card via-background to-accent/20 rounded-2xl p-4 sm:p-6 md:p-8 border border-border/50 shadow-xl flex flex-col md:flex-row items-center gap-4 sm:gap-6 neon-glow">
        {!lowInternetMode && (
          <>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-primary/10 blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none"></div>
          </>
        )}
        <div className="flex-1 space-y-4 text-center md:text-left flex flex-col items-center md:items-start w-full relative z-10">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="inline-flex items-center gap-2 bg-primary/15 text-primary px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm">
              <Clock size={16} /> {t('deliveredIn10', language)}
            </div>
            <button
              type="button"
              onClick={() => {
                setEmergencyMode(!emergencyMode);
                if (!emergencyMode) {
                  alert("🚨 Emergency SOS Delivery Activated! Priority riders assigned. Instant dispatch on health, baby, & sanitary essentials.");
                  speakResponse("Emergency SOS Mode active. Only displaying essential pharmacy, babies, and chargers.");
                  setSearchQuery("Medicine");
                } else {
                  setSearchQuery("");
                }
              }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all ${
                emergencyMode 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md shadow-rose-500/20' 
                  : 'bg-card border-border hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground'
              }`}
            >
              <ShieldCheck size={14} />
              {emergencyMode ? 'Emergency Active (10m Priority)' : 'Emergency Mode (SOS)'}
            </button>
            {currentLocation && (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-3.5 py-1.5 rounded-full">
                <MapPin size={12} className="stroke-[2.5]" /> Active Service Area: {currentLocation}
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-[1.1] max-w-xl">
            Groceries delivered <br className="hidden sm:inline"/><span className="text-gradient-primary">in minutes.</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
            Fresh produce, daily essentials, hot meals, and tiffin plans delivered straight to your door. Experience the fastest delivery in the city.
          </p>
          
          <div className="flex flex-col gap-3 w-full max-w-md">
            <div className="flex w-full items-center space-x-1 sm:space-x-2 bg-card p-1.5 sm:p-2 rounded-xl border border-border focus-within:ring-2 focus-within:ring-primary transition-all">
              <MapPin className="text-muted-foreground ml-1.5" size={18} />
              <input 
                type="text" 
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                placeholder="Enter delivery location (e.g. Lucknow, Delhi...)" 
                className="flex-1 bg-transparent border-none focus:outline-none px-1.5 text-xs sm:text-sm min-w-0"
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className={`p-2 rounded-xl text-muted-foreground hover:text-primary transition-colors flex items-center justify-center mr-1 ${
                  detectingLocation ? 'animate-spin text-primary' : ''
                }`}
                title="Use Current Doorstep Location"
              >
                <Navigation size={18} className={detectingLocation ? '' : 'rotate-45 text-primary'} />
              </button>
              <button 
                onClick={handleExplore}
                className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Explore
              </button>
            </div>

            {serviceMessage.text && (
              <div className={`w-full p-3.5 rounded-xl text-xs font-bold border transition-all leading-relaxed ${
                serviceMessage.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {serviceMessage.text}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 w-full">
          <DeliveryRiderAnimation />
        </div>
      </section>

      {/* 📢 Active Broadcasts & Diet Programs */}
      {announcements.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Megaphone className="text-primary animate-pulse" size={16} /> Platform Broadcasts & Diets
            </h2>
            <span className="text-[10px] font-bold text-muted-foreground bg-accent px-2 py-0.5 rounded-md">
              {announcements.length} Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => {
              // Custom styles and icons based on type
              let borderClass = 'border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40';
              let icon = <Megaphone className="text-indigo-400" size={18} />;
              let badgeText = 'ANNOUNCEMENT';
              let badgeColor = 'bg-indigo-500/10 text-indigo-400';
              
              if (ann.type === 'sos') {
                borderClass = 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50 animate-pulse';
                icon = <AlertCircle className="text-rose-400" size={18} />;
                badgeText = 'SOS ALERT';
                badgeColor = 'bg-rose-500/20 text-rose-400';
              } else if (ann.type === 'diet') {
                borderClass = 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40';
                icon = <Dumbbell className="text-emerald-400" size={18} />;
                badgeText = 'DIET PROGRAM';
                badgeColor = 'bg-emerald-500/10 text-emerald-400';
              } else if (ann.type === 'promo') {
                borderClass = 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40';
                icon = <Tag className="text-amber-400" size={18} />;
                badgeText = 'PROMO';
                badgeColor = 'bg-amber-500/10 text-amber-400';
              } else if (ann.type === 'offer') {
                borderClass = 'border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40';
                icon = <ShoppingBag className="text-cyan-400" size={18} />;
                badgeText = 'SPECIAL OFFER';
                badgeColor = 'bg-cyan-500/10 text-cyan-400';
              }

              return (
                <div 
                  key={ann.id}
                  className={`glass-panel border p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between gap-3 ${borderClass}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase ${badgeColor}`}>
                        {badgeText}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-medium">
                        {new Date(ann.created_at).toLocaleDateString(undefined, { dateStyle: 'short' })}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 leading-tight">
                      {icon}
                      {ann.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                  
                  {/* Action buttons based on type */}
                  {ann.type === 'diet' && (
                    <button
                      onClick={() => {
                        setSearchQuery('healthy');
                        alert("🥗 Diet Filter Applied! Showing high-fiber, low-calorie, and nutritious essentials.");
                        speakResponse("Diet filter applied. Check out healthy foods in the list.");
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      <Dumbbell size={12} /> Apply Diet Filter
                    </button>
                  )}
                  {ann.type === 'sos' && (
                    <button
                      onClick={() => {
                        setEmergencyMode(true);
                        setSearchQuery('Medicine');
                        alert("🚨 SOS Mode Activated! Prioritizing healthcare, hydration, and hygiene packages.");
                        speakResponse("Emergency SOS Mode active. Only showing priority items.");
                      }}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      <AlertCircle size={12} /> Request SOS Dispatch
                    </button>
                  )}
                  {ann.type === 'promo' && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("HEAL20");
                        alert("📋 Promo Code 'HEAL20' copied to clipboard!");
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      <Tag size={12} /> Copy Code: HEAL20
                    </button>
                  )}
                  {ann.type === 'offer' && (
                    <button
                      onClick={() => {
                        setSearchQuery('Offer');
                        alert("🎉 Offers Applied! Showing discounted items and special combos.");
                        speakResponse("Showing all special offers.");
                      }}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      <ShoppingBag size={12} /> View Active Offers
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Swiggy-Style Split Navigation Panels */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Module 1: Instamart */}
        <div 
          onClick={() => {
            setActiveModule('instamart');
            setActiveSuperService('grocery');
            setSelectedCategory(null);
          }}
          className={`cursor-pointer group relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all duration-500 ${
            activeModule === 'instamart'
              ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-lg neon-glow -translate-y-1'
              : 'border-border/40 bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg'
          }`}
        >
          {!lowInternetMode && (
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl opacity-50 will-change-transform transition-opacity duration-500 ${
              activeModule === 'instamart' ? 'bg-primary/20' : 'bg-primary/5 opacity-0 group-hover:opacity-100'
            }`}></div>
          )}

          <div className="flex justify-between items-center relative z-10">
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit shadow-sm">
                <Zap size={8} className="fill-primary" /> Velto Instamart
              </span>
              <h3 className="text-lg font-black tracking-tight text-foreground">{t('groceryTitle', language)}</h3>
              <p className="text-[11px] text-muted-foreground font-medium max-w-xs leading-relaxed">
                {t('groceryDesc', language)}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-border bg-background transition-transform duration-500 group-hover:scale-[1.05]">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=150" 
                alt="Instamart" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Module 2: Cloud Kitchen & Tiffins */}
        <div 
          onClick={() => {
            setActiveModule('kitchen');
            setActiveSuperService('food');
            setSelectedCategory(null);
          }}
          className={`cursor-pointer group relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all duration-500 ${
            activeModule === 'kitchen'
              ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/10 shadow-lg -translate-y-1'
              : 'border-border/40 bg-card hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-lg'
          }`}
        >
          {!lowInternetMode && (
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl opacity-50 will-change-transform transition-opacity duration-500 ${
              activeModule === 'kitchen' ? 'bg-amber-500/20' : 'bg-amber-500/5 opacity-0 group-hover:opacity-100'
            }`}></div>
          )}

          <div className="flex justify-between items-center relative z-10">
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit shadow-sm">
                <Flame size={8} className="fill-amber-500" /> Velto Kitchen & Tiffins
              </span>
              <h3 className="text-lg font-black tracking-tight text-foreground">{t('mealsTitle', language)}</h3>
              <p className="text-[11px] text-muted-foreground font-medium max-w-xs leading-relaxed">
                {t('mealsDesc', language)}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-border bg-background transition-transform duration-500 group-hover:scale-[1.05]">
              <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150" 
                alt="Cloud Kitchen" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Auto Refill System */}
      <section className="glass-panel border border-border/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2 text-foreground">
              <Calendar className="text-primary w-5 h-5 animate-bounce" /> {t('replenishTitle', language)}
            </h3>
            <p className="text-xs text-muted-foreground font-semibold">
              {t('replenishDesc', language)}
            </p>
          </div>
          <button
            onClick={() => {
              // Add all refill items to cart
              refillItems.forEach(item => {
                const nameKey = item.name.split(' ')[0];
                const matchedProd = products.find(p => p.name.toLowerCase().includes(nameKey.toLowerCase()));
                if (matchedProd) {
                  addToCart(matchedProd);
                }
              });
              alert(language === 'hi' ? "🛒 ऑटो रिफिल सक्रिय! दूध, ब्रेड और टमाटर आपकी कार्ट में जोड़े गए हैं।" : language === 'hinglish' ? "🛒 Auto Refill ho gaya bhaiya! Milk, bread aur tomatoes cart me add kar diye hain." : "🛒 Auto Refill Triggered! Added milk, bread, & tomatoes to your cart.");
              speakResponse(language === 'hi' ? "ऑटो रिफिल सक्रिय। आवश्यक सामान कार्ट में जोड़ दिया गया है।" : language === 'hinglish' ? "Auto refill ho gaya hai. Aapka saaman basket me daal diya hai." : "Auto refill triggered. Added your running low essentials to the basket.");
            }}
            className="bg-primary text-primary-foreground text-xs font-black uppercase py-2.5 px-4 rounded-xl shadow-md shadow-primary/10 transition-all hover:bg-primary/95 active:scale-95 hover:scale-[1.02] duration-200"
          >
            {t('refillAll', language)}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {refillItems.map(item => (
            <div key={item.id} className="bg-muted/30 border border-border/30 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h4 className="text-xs font-black text-foreground">{item.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold">{t('lastOrdered', language)}: {item.lastBought}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  item.daysLeft <= 1 
                    ? 'bg-rose-500/10 text-rose-500 animate-pulse' 
                    : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {item.daysLeft === 1 ? t('refillTomorrow', language) : t('inDays', language).replace('{days}', String(item.daysLeft))}
                </span>
              </div>

              {/* Progress indicator */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-accent rounded-full overflow-hidden shadow-inner">
                  <div 
                    style={{ width: `${100 - item.progress}%` }} 
                    className={`h-full rounded-full transition-all ${
                      item.progress >= 70 ? 'bg-rose-500' : item.progress >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                  <span>{100 - item.progress}% {t('remaining', language)}</span>
                  <span>{t('usageRate', language)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔍 Smart Search Console */}
      <section className="glass-panel border border-border/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 relative overflow-hidden">
        {!lowInternetMode && (
          <div className={`absolute right-0 top-0 -mr-6 -mt-6 w-20 h-20 rounded-full blur-xl ${
            activeModule === 'instamart' ? 'bg-primary/5' : 'bg-amber-500/5'
          }`}></div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="space-y-1 flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                  <Search size={18} className="text-primary animate-pulse" /> Smart Search Desk
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Fuzzy matching & spelling correction auto-suggestions in real-time.
                </p>
              </div>
              <button
                onClick={startVoiceListening}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 text-xs font-black uppercase py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 self-start sm:self-center"
              >
                <Mic size={14} className="animate-pulse text-white" />
                <span>🗣️ Tap to Speak / बोलकर आर्डर करें</span>
              </button>
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <div className="relative flex items-center bg-background border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all p-1.5">
              <Search className="text-muted-foreground ml-2.5 flex-shrink-0" size={18} />
              <input
                type="text"
                placeholder={t('searchPlaceholder', language)}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm font-medium placeholder:text-muted-foreground/60 min-w-0"
              />
              <button
                onClick={startVoiceListening}
                className={`p-2 rounded-xl transition-all mr-1 flex items-center justify-center ${
                  voiceListening ? 'bg-red-500 text-white animate-pulse shadow-red-500/30 shadow-lg' : 'bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground'
                }`}
                title="Voice Ordering (Hindi / Hinglish / English)"
              >
                <Mic size={15} />
              </button>
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-colors mr-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Voice status banner */}
        {voiceStatus && (
          <div className="relative z-10 bg-primary/10 border border-primary/20 text-xs font-bold text-primary p-2.5 rounded-xl animate-pulse">
            🎤 {voiceStatus}
          </div>
        )}

        {/* 🎤 PENDING VOICE CONFIRMATION INTERACTIVE WIDGET */}
        {pendingVoiceProduct && (
          <div className="relative z-10 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4.5 space-y-3 animate-in zoom-in-95 duration-200 glass-panel">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                Voice Confirmation Required
              </span>
              <button 
                onClick={() => {
                  pendingVoiceProductRef.current = null;
                  setPendingVoiceProduct(null);
                }}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-xs font-bold text-foreground leading-relaxed">
              Did you mean to add <span className="text-primary font-black">{pendingVoiceProduct.quantity} x {pendingVoiceProduct.product.name}</span> (₹{pendingVoiceProduct.product.price * pendingVoiceProduct.quantity}) to your basket?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  for (let i = 0; i < pendingVoiceProduct.quantity; i++) {
                    addToCart(pendingVoiceProduct.product);
                  }
                  pendingVoiceProductRef.current = null;
                  setPendingVoiceProduct(null);
                  speakResponse("Added to basket!");
                }}
                className="flex-grow bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-black py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
              >
                Yes, Add
              </button>
              <button
                onClick={() => {
                  pendingVoiceProductRef.current = null;
                  setPendingVoiceProduct(null);
                  speakResponse("Cancelled.");
                }}
                className="flex-grow bg-accent text-accent-foreground hover:bg-accent/80 text-xs font-black py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
              >
                No, Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mood-based Discovery Filters */}
        <div className="relative z-10 flex flex-wrap gap-2.5 pt-1.5 items-center">
          <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider mr-1">
            {t('moodTitle', language)}
          </span>
          {[
            { id: 'cravings', name: t('moodCravings', language), icon: <Coffee size={12} className="text-amber-500" /> },
            { id: 'gym', name: t('moodGym', language), icon: <Dumbbell size={12} className="text-emerald-500" /> },
            { id: 'date', name: t('moodDate', language), icon: <Heart size={12} className="text-rose-500" /> },
            { id: 'home', name: t('moodHome', language), icon: <Utensils size={12} className="text-orange-500" /> }
          ].map(mood => (
            <button
              key={mood.id}
              onClick={() => {
                const targetMood = selectedMood === mood.id ? null : mood.id;
                setSelectedMood(targetMood);
                if (targetMood === 'cravings') {
                  setSearchQuery('Snack');
                  setSelectedCategory('Snacks');
                } else if (targetMood === 'gym') {
                  setSearchQuery('Fruit');
                  setSelectedCategory('Fresh Fruits');
                } else if (targetMood === 'date') {
                  setActiveModule('kitchen');
                  setActiveSuperService('food');
                  setSearchQuery('Gourmet');
                  setSelectedCategory(null);
                } else if (targetMood === 'home') {
                  setActiveModule('kitchen');
                  setActiveSuperService('food');
                  setSearchQuery('Tiffin');
                  setSelectedCategory(null);
                } else {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }
              }}
              className="flex items-center gap-1.5 bg-accent/40 hover:bg-accent border border-border/80 rounded-xl px-3 py-1.5 text-xs font-bold transition-all hover:border-primary shadow-sm"
            >
              {mood.icon}
              <span>{mood.name}</span>
            </button>
          ))}
        </div>

        {/* Immersive Mood Playlist & Combo Panel */}
        {selectedMood && (() => {
          interface MoodSetting {
            name: string;
            theme: string;
            tagline: string;
            song: string;
            comboName: string;
            items: string[];
            eqColor: string;
          }
          const MOOD_DATA: Record<string, MoodSetting> = {
            cravings: {
              name: 'Late Night Cravings 🍕',
              theme: 'from-purple-900/20 via-indigo-900/10 to-background border-purple-500/20',
              tagline: 'Munchies, chocolates, and carbonated fuzzy goodness for the midnight vibe.',
              song: 'Lofi Chill Hip Hop - Midnight Coffee',
              comboName: 'Midnight Snack Bundle',
              items: ['chips', 'pepsi'],
              eqColor: 'bg-purple-500'
            },
            gym: {
              name: 'Gym Mode Activated 🏋️',
              theme: 'from-emerald-950/20 via-teal-900/10 to-background border-emerald-500/20',
              tagline: 'High protein energy fuel, raw organic vitamins, and dynamic beats.',
              song: 'Synthwave Workout - Pump Up Radio',
              comboName: 'Clean Protein Stack',
              items: ['banana'],
              eqColor: 'bg-emerald-500'
            },
            date: {
              name: 'Romantic Date Night 🕯️',
              theme: 'from-rose-950/20 via-pink-900/10 to-background border-rose-500/20',
              tagline: 'Gourmet delicacies, sweet tooth builders, and smooth acoustic melodies.',
              song: 'Acoustic Jazz Cafe - Warm Candles',
              comboName: 'Gourmet Date Platter',
              items: ['paneer', 'cake'],
              eqColor: 'bg-rose-500'
            },
            home: {
              name: 'Home-style Comfort 🏡',
              theme: 'from-orange-950/20 via-amber-900/10 to-background border-amber-500/20',
              tagline: 'Warm home-cooked tiffins, fresh farm tomatoes, and soothing ambient flute.',
              song: 'Traditional Flute - Peaceful Fields',
              comboName: 'Ghar Ka Khana combo',
              items: ['bread', 'tomato'],
              eqColor: 'bg-orange-500'
            }
          };

          const activeMood = MOOD_DATA[selectedMood];
          if (!activeMood) return null;

          return (
            <div className={`relative z-10 bg-gradient-to-br ${activeMood.theme} border rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-300`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    {t('moodZone', language)}
                  </span>
                  <h4 className="text-sm font-black text-foreground">{activeMood.name}</h4>
                  <p className="text-xs text-muted-foreground font-semibold max-w-md">{activeMood.tagline}</p>
                </div>
                <div className="bg-background/90 border border-border/80 p-2.5 rounded-xl flex items-center gap-3 w-fit self-start sm:self-center shadow-inner">
                  <div className="flex gap-0.5 items-end h-4 w-4">
                    <span className={`w-0.5 h-2 rounded-full animate-bounce ${activeMood.eqColor}`} style={{ animationDelay: '0.1s' }}></span>
                    <span className={`w-0.5 h-3 rounded-full animate-bounce ${activeMood.eqColor}`} style={{ animationDelay: '0.3s' }}></span>
                    <span className={`w-0.5 h-1 rounded-full animate-bounce ${activeMood.eqColor}`} style={{ animationDelay: '0.5s' }}></span>
                    <span className={`w-0.5 h-4 rounded-full animate-bounce ${activeMood.eqColor}`} style={{ animationDelay: '0.2s' }}></span>
                  </div>
                  <div className="text-[10px] font-extrabold text-foreground">
                    <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{t('playingAmbience', language)}</span>
                    {activeMood.song}
                  </div>
                  <button 
                    onClick={() => {
                      alert(`🎵 Simulated Audio Playback: "${activeMood.song}"`);
                      speakResponse(language === 'hi' ? `आपके ${selectedMood} मूड के लिए एम्बिएंट संगीत चल रहा है।` : language === 'hinglish' ? `Ambient music play ho raha hai aapke ${selectedMood} mood ke liye.` : `Playing ambient music matches for your ${selectedMood} mood.`);
                    }}
                    className="p-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-black"
                  >
                    {t('play', language)}
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-primary/5 p-3 rounded-xl">
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-muted-foreground">{t('aiCuratedBundle', language)}</span>
                  <h5 className="text-xs font-black text-foreground">{activeMood.comboName}</h5>
                </div>
                <button
                  onClick={() => {
                    let addedCount = 0;
                    activeMood.items.forEach(keyword => {
                      const matchedItem = products.find(p => p.name.toLowerCase().includes(keyword));
                      if (matchedItem) {
                        addToCart(matchedItem);
                        addedCount++;
                      }
                    });
                    alert(language === 'hi' ? `🛒 कार्ट में ${addedCount} आइटम जोड़े गए!` : language === 'hinglish' ? `🛒 Basket me ${addedCount} items add kar diye!` : `🛒 Added ${addedCount} bundle items to your cart!`);
                    speakResponse(language === 'hi' ? `${activeMood.comboName} बंडल जोड़ा गया।` : language === 'hinglish' ? `${activeMood.comboName} bundle add ho gaya hai.` : `Added the ${activeMood.comboName} bundle to your basket.`);
                  }}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-black uppercase py-1.5 px-3 rounded-lg"
                >
                  {t('addComboBundle', language)}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Spelling suggestions alert box */}
        {spellingSuggestions.length > 0 && (
          <div className="relative z-10 bg-primary/5 border border-primary/10 rounded-xl p-3.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-primary animate-in fade-in slide-in-from-top-2 duration-200">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span>Did you mean:</span>
            <div className="flex flex-wrap gap-1.5">
              {spellingSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearchChange(suggestion)}
                  className="bg-background border border-primary/20 text-primary hover:bg-primary/10 hover:border-primary px-3 py-1 rounded-lg text-xs font-extrabold transition-all shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instant Search Results Dropdown inside Smart Search Desk */}
        {(() => {
          if (!searchQuery.trim()) return null;
          
          const q = searchQuery.toLowerCase().trim();
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
            
          const searchResults = moduleProducts.filter(p => 
            matchesSearchQuery(p.name, p.description || '', p.category || '', q)
          );

          return (
            <div className="relative z-10 border-t border-border/60 pt-4 mt-2 space-y-3 animate-in fade-in duration-200">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Zap size={12} className="text-primary fill-primary animate-pulse" /> Instant Search Results ({searchResults.length})
                </span>
                {searchResults.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-500 animate-pulse bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    {t('instantAddHelper', language)}
                  </span>
                )}
              </div>

              {searchResults.length === 0 ? (
                <div className="space-y-4">
                  <div className="p-5 text-center border border-dashed border-border rounded-2xl bg-accent/10 flex flex-col items-center justify-center gap-2">
                    <HelpCircle size={24} className="text-muted-foreground/60" />
                    <p className="text-xs font-bold text-muted-foreground">{t('noMatches', language)} "{searchQuery}".</p>
                  </div>

                  {/* Kids Zone: Sweet suggestions for chocolate, cake, and cookies */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🍭</span>
                      <div>
                        <h4 className="text-xs font-black uppercase text-primary tracking-wider">
                          {t('kidsZoneTitle', language)}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          {t('kidsZoneDesc', language)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
                      {(() => {
                        const realCookies = products.find(p => p.name.toLowerCase().includes('cookie'));
                        const realChocolate = products.find(p => p.name.toLowerCase().includes('dark chocolate'));
                        const realShake = products.find(p => p.name.toLowerCase().includes('milkshake'));

                        const kidsSuggestions = [
                          realCookies || {
                            id: 'fallback-cookies',
                            name: 'Chocolate Chip Cookies',
                            description: 'Crunchy baked cookies with rich cocoa chocolate chips.',
                            price: 49,
                            category: 'Snacks',
                            image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=150'
                          },
                          {
                            id: 'mock-chocolate-cake',
                            name: 'Rich Chocolate Fudge Cake Slice',
                            description: 'Layers of moist chocolate cake with fudgy icing. Kid favorite!',
                            price: 79,
                            category: 'Snacks',
                            image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150'
                          },
                          realChocolate || {
                            id: 'fallback-chocolate',
                            name: 'Premium Dark Chocolate',
                            description: '70% rich cocoa Belgian dark chocolate bar, smooth finish.',
                            price: 99,
                            category: 'Snacks',
                            image_url: 'https://images.unsplash.com/photo-1548907040-4d42b52125bf?w=150'
                          },
                          realShake || {
                            id: 'fallback-shake',
                            name: 'Chocolate Milkshake',
                            description: 'Creamy chocolate milkshake with rich cocoa syrup.',
                            price: 55,
                            category: 'Snacks',
                            image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=150'
                          }
                        ];

                        return kidsSuggestions.map((product) => {
                          const aesthetics = getCategoryAesthetics(product.category);
                          const isAdded = addedProductId === product.id;
                          return (
                            <div 
                              key={product.id}
                              className="bg-card border border-border/80 rounded-xl p-3 flex justify-between items-center gap-3 hover:border-primary transition-all duration-300 shadow-sm"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`relative w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 ${aesthetics.bg}`}>
                                  {product.image_url ? (
                                    <img 
                                      src={product.image_url} 
                                      alt={product.name} 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <div className="scale-75">{aesthetics.icon}</div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-xs text-foreground truncate">{product.name}</h4>
                                  <p className="text-[10px] text-muted-foreground truncate leading-relaxed max-w-[170px]">{product.description}</p>
                                  <span className="font-black text-xs text-foreground block mt-0.5">₹{product.price}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleInstantAdd(product as any)}
                                className={`font-black text-[11px] px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-sm flex-shrink-0 border ${
                                  isAdded 
                                    ? 'bg-emerald-500 border-emerald-400 text-white'
                                    : 'bg-primary border-primary text-primary-foreground hover:bg-primary/95'
                                }`}
                              >
                                {isAdded ? <span>Added ✓</span> : <><Plus size={12} className="stroke-[3]" /><span>ADD</span></>}
                              </button>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {searchResults.map((product) => {
                    const aesthetics = getCategoryAesthetics(product.category);
                    const isAdded = addedProductId === product.id;
                    
                    return (
                      <div 
                        key={product.id}
                        className="bg-background border border-border/80 rounded-xl p-3 flex justify-between items-center gap-3 hover:border-primary transition-all duration-300 shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`relative w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 ${aesthetics.bg}`}>
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="scale-75">{aesthetics.icon}</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-foreground truncate">{product.name}</h4>
                            <p className="text-[10px] text-muted-foreground truncate leading-relaxed max-w-[200px]">{product.description}</p>
                            <span className="font-black text-xs text-foreground block mt-0.5">₹{product.price}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleInstantAdd(product)}
                          className={`font-black text-[11px] px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-sm flex-shrink-0 border ${
                            isAdded 
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/10'
                              : 'bg-primary border-primary text-primary-foreground hover:bg-primary/95 shadow-primary/10'
                          }`}
                        >
                          {isAdded ? (
                            <span>Added ✓</span>
                          ) : (
                            <>
                              <Plus size={12} className="stroke-[3]" />
                              <span>ADD</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* 🏪 Hyperlocal Community Commerce */}
      <section className="bg-gradient-to-r from-emerald-500/5 via-primary/5 to-transparent border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Store size={18} className="text-primary" /> Hyperlocal Community Hubs
            </h3>
            <p className="text-xs text-muted-foreground font-semibold">
              Directly supporting local bakers, home chefs, and organic street vendors near you.
            </p>
          </div>
          {selectedVendor && (
            <button 
              onClick={() => setSelectedVendor(null)}
              className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full hover:bg-primary/20 transition-all"
            >
              Clear Vendor ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 'bakery', name: "Baker's Pride", desc: 'Local Home Baker', icon: <Apple size={14} className="text-amber-500" /> },
            { id: 'chef', name: "Maa's Kitchen", desc: 'Gourmet Home Chef', icon: <Utensils size={14} className="text-rose-500" /> },
            { id: 'produce', name: 'Green Farms', desc: 'Fresh Local Produce', icon: <Leaf size={14} className="text-emerald-500" /> },
            { id: 'street', name: 'Chaurasia Sweets', desc: 'Street Food Vendor', icon: <Cookie size={14} className="text-orange-500" /> }
          ].map(vendor => {
            const isSelected = selectedVendor === vendor.id;
            return (
              <button
                key={vendor.id}
                onClick={() => {
                  setSelectedVendor(isSelected ? null : vendor.id);
                  // Apply search filter terms for mock products matching vendor specialties
                  if (!isSelected) {
                    if (vendor.id === 'bakery') {
                      setSearchQuery('Bread');
                      setSelectedCategory(null);
                    } else if (vendor.id === 'chef') {
                      setActiveModule('kitchen');
                      setActiveSuperService('food');
                      setSearchQuery('Paneer');
                      setSelectedCategory(null);
                    } else if (vendor.id === 'produce') {
                      setSearchQuery('Fruit');
                      setSelectedCategory('Fresh Fruits');
                    } else if (vendor.id === 'street') {
                      setSearchQuery('Samosa');
                      setSelectedCategory(null);
                    }
                  } else {
                    setSearchQuery('');
                  }
                }}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all hover:scale-[1.02] shadow-sm ${
                  isSelected 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center mb-2.5">
                  {vendor.icon}
                </div>
                <span className="text-xs font-black text-foreground block">{vendor.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">{vendor.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 🔮 Predictive Ordering Prompt */}
      <section className="bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-500 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
            ☕ Daily Chai Vibe Predictor
          </div>
          <h3 className="text-xs font-black text-foreground">It's 4:30 PM: Ready for your evening ginger tea & samosa session?</h3>
          <p className="text-[11px] text-muted-foreground font-semibold">
            Based on your past orders, we predicted your daily refresh schedule.
          </p>
        </div>
        <button
          onClick={() => {
            const hotChai = products.find(p => p.name.toLowerCase().includes("chai"));
            const samosa = products.find(p => p.name.toLowerCase().includes("samosa"));
            let addedCount = 0;
            if (hotChai) { addToCart(hotChai); addedCount++; }
            if (samosa) { addToCart(samosa); addedCount++; }
            alert(`🛒 Chai Time Bundle added! Loaded ${addedCount} items to your basket.`);
            speakResponse("Added your predicted evening tea and samosas to the cart.");
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase py-2 px-4 rounded-xl shadow-md transition-all whitespace-nowrap"
        >
          One-Click Reorder
        </button>
      </section>

      {/* Categories Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">Shop by Category</h2>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              Show All Categories ✕
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {activeCategories.map((cat, i) => {
            const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
            return (
              <div 
                key={i} 
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`bg-card border rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md group ${
                  isSelected 
                    ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-md shadow-primary/5' 
                    : `border-border ${cat.bg}`
                }`}
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border/40 bg-background shadow-inner flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-background border border-border/40 shadow-sm ${cat.color}`}>
                    {cat.icon}
                  </div>
                </div>
                <span className={`font-bold text-sm text-center transition-colors ${
                  isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                }`}>
                  {getCategoryTranslation(cat.name)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Products Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">
            {selectedCategory 
              ? `${getCategoryTranslation(selectedCategory)} ${language === 'hi' ? 'सामान' : 'Essentials'}` 
              : activeModule === 'instamart' 
              ? t('instamartTitle', language) 
              : t('kitchenTitle', language)}
          </h2>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full hover:bg-primary/20 transition-all flex items-center gap-1"
            >
              Clear Filter ✕
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-accent/50 animate-pulse rounded-2xl"></div>
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

              let filtered = selectedCategory 
                ? moduleProducts.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())
                : moduleProducts;
              
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                filtered = filtered.filter(p => 
                  matchesSearchQuery(p.name, p.description || '', p.category || '', q)
                );
              }
              
              if (filtered.length === 0) {
                const realCookies = products.find(p => p.name.toLowerCase().includes('cookie'));
                const realChocolate = products.find(p => p.name.toLowerCase().includes('dark chocolate'));
                const mockCake = {
                  id: 'mock-chocolate-cake',
                  name: 'Rich Chocolate Fudge Cake',
                  description: 'Moist chocolate cake with fudgy icing. Kid favorite!',
                  price: 79,
                  category: 'Snacks',
                  image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150'
                };
                const mockCookies = {
                  id: 'mock-cookies',
                  name: 'Choco Chip Cookies',
                  description: 'Crunchy baked cookies with rich cocoa.',
                  price: 49,
                  category: 'Snacks',
                  image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=150'
                };

                return (
                  <div className="col-span-full flex flex-col gap-6">
                    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border rounded-3xl bg-accent/15 p-8 text-center">
                      <Search size={36} className="text-muted-foreground/50" />
                      <p className="text-sm font-bold text-muted-foreground">No exact matches found for "{searchQuery}".</p>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5 sm:p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="text-2xl">🍭</span>
                        <div>
                          <h4 className="text-sm font-black uppercase text-primary tracking-wider">
                            {t('kidsZoneTitle', language)}
                          </h4>
                          <p className="text-xs text-muted-foreground font-semibold">
                            {t('kidsZoneDesc', language)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <ProductCard product={realChocolate || mockCake} />
                        <ProductCard product={realCookies || mockCookies} />
                      </div>
                    </div>
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

      {/* Floating AI Assistant Chat Button and Panel */}
      <div className={`fixed ${cart.length > 0 ? 'bottom-40' : 'bottom-24'} sm:bottom-24 right-4 sm:right-6 z-[9999] flex flex-col items-end gap-3 max-w-[calc(100vw-2rem)] sm:max-w-none`}>
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

      {/* 📍 FORCED LOCATION SELECTOR OVERLAY */}
      {!currentLocation && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/60 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-card border border-border/85 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 overflow-hidden glass-panel">
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
                    onKeyDown={e => e.key === 'Enter' && handleExplore()}
                  />
                  <button
                    onClick={handleExplore}
                    className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-primary/95 transition-colors whitespace-nowrap"
                  >
                    {t('verify', language)}
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
                        setTimeout(() => {
                          localStorage.setItem('selectedCity', city);
                          localStorage.setItem('deliveryAddress', `${city} Central Plaza Hub`);
                          setCurrentLocation(city);
                          setServiceMessage({ 
                            text: `Welcome to Velto! 🚀 We are actively delivering fresh essentials in ${city}!`, 
                            type: 'success' 
                          });
                        }, 50);
                      }}
                      className="bg-accent/40 border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-inner"
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
    </div>
  );
}
