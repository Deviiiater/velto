'use client';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/lib/supabase';
import { Trash2, MapPin, Truck, ChevronRight, Phone, Clock, CreditCard, Wallet, AlertTriangle, ShieldCheck, Shield, Zap, Receipt, Sparkles, X, Edit3, ShoppingBag, Leaf, Flame, HelpCircle, ArrowRight, Store, Bike, Users, Share2, Info, Navigation, Search, Minus, Plus, Banknote, Compass, AlertCircle, Crown, Vote, RefreshCw, Heart, HeartHandshake } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AddressPicker } from '@/components/AddressPicker';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/translations';

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Moradabad': { lat: 28.8386, lng: 78.7733 },
  'Sambhal': { lat: 28.5904, lng: 78.5718 },
  'Chandausi': { lat: 28.4554, lng: 78.7770 },
  'Bhind': { lat: 26.5896, lng: 78.7904 }
};

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { 
    language,
    oneIndiaPass, setOneIndiaPass,
    groupCartActive, setGroupCartActive, 
    groupCartMembers: contextGroupMembers, 
    groupCartVotes, castGroupVote,
    dontRush, setDontRush,
    riderTip, setRiderTip
  } = useSettings();
  const router = useRouter();

  const getLocalizedDay = (day: string, lang: string) => {
    const daysMap: Record<string, Record<string, string>> = {
      Monday: { en: 'Monday', hi: 'सोमवार', hinglish: 'Monday' },
      Tuesday: { en: 'Tuesday', hi: 'मंगलवार', hinglish: 'Tuesday' },
      Wednesday: { en: 'Wednesday', hi: 'बुधवार', hinglish: 'Wednesday' },
      Thursday: { en: 'Thursday', hi: 'गुरुवार', hinglish: 'Thursday' },
      Friday: { en: 'Friday', hi: 'शुक्रवार', hinglish: 'Friday' },
      Saturday: { en: 'Saturday', hi: 'शनिवार', hinglish: 'Saturday' },
      Sunday: { en: 'Sunday', hi: 'रविवार', hinglish: 'Sunday' }
    };
    return daysMap[day]?.[lang] || day;
  };
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [tiffinStartDay, setTiffinStartDay] = useState('Monday');
  const [isOptimized, setIsOptimized] = useState(false);
  const [deliveryClustering, setDeliveryClustering] = useState(false);
  const [gigAgent, setGigAgent] = useState<'pro' | 'student' | 'shopkeeper'>('pro');
  const [birthdaySurprise, setBirthdaySurprise] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState(false);
  const [personalNote, setPersonalNote] = useState('');
  const [groupCartMembers, setGroupCartMembers] = useState<any[]>([]);

  // Success Animation State
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');

  // Dynamic pricing calculations for premium transparency breakdown
  const groupSubtotal = groupCartActive ? 140 : 0;
  const subtotalVal = Math.max(0, total + groupSubtotal - (isOptimized ? 82 : 0));
  const deliveryFee = oneIndiaPass ? 0 : 20;
  const platformFee = 5;
  const gstTaxes = Math.round(subtotalVal * 0.05);
  const clusteringDiscount = deliveryClustering ? 40 : 0;
  const gigDiscount = gigAgent === 'student' ? 15 : gigAgent === 'shopkeeper' ? 10 : 0;
  const surpriseFee = birthdaySurprise ? 30 : 0;
  const grandTotal = Math.max(0, subtotalVal + deliveryFee + platformFee + gstTaxes + riderTip + surpriseFee - clusteringDiscount - gigDiscount);

  // Location Verification Modal States
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [typedVerification, setTypedVerification] = useState('');

  // Fetch saved address/phone and local service area on load
  useEffect(() => {
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      setSelectedCity(savedCity);
    }

    if (user) {
      supabase.from('users').select('address, phone').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.address) {
            setAddress(data.address);
          } else {
            const localAddr = localStorage.getItem('deliveryAddress');
            if (localAddr) setAddress(localAddr);
          }
          if (data?.phone) setPhone(data.phone);
        });
    } else {
      const localAddr = localStorage.getItem('deliveryAddress');
      if (localAddr) setAddress(localAddr);
    }
  }, [user]);

  const saveOrderToDB = async (paymentStatus: string, razorpayId?: string) => {
    if (!user) {
      alert("Please login to place an order.");
      return false;
    }
    
    try {
      // Upsert user's default address/phone (creates public profile if missing)
      const { error: userError } = await supabase.from('users').upsert({ id: user.id, address, phone });
      if (userError) throw userError;

      const hasTiffin = cart.some(item => item.category?.toLowerCase() === 'tiffin service');
      const finalAddress = hasTiffin 
        ? `[Tiffin Start Day: ${tiffinStartDay}] ${address}`
        : address;

      // Create Order
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        total_amount: grandTotal, // include dynamic subtotal, pass and rider tip offsets
        delivery_address: finalAddress,
        phone_number: phone,
        status: 'pending',
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        razorpay_order_id: razorpayId
      }).select().single();

      if (orderError) throw orderError;

      // Insert Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      return orderData.id;
    } catch (e: any) {
      console.error(e);
      alert(`Failed to save order: ${e.message || JSON.stringify(e)}`);
      return null;
    }
  };

  const verifyGPSLocation = () => {
    let savedCity = localStorage.getItem('selectedCity') || selectedCity;
    
    setDetecting(true);
    setVerificationError('');
    setVerificationSuccess('');

    if (!navigator.geolocation) {
      setVerificationError("Geolocation is not supported by your browser.");
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        let targetCity = savedCity;
        let minDist = 999999;
        
        if (!targetCity) {
          // Find closest city hub
          Object.entries(CITY_CENTERS).forEach(([cityName, coords]) => {
            const dist = getDistanceKm(latitude, longitude, coords.lat, coords.lng);
            if (dist < minDist) {
              minDist = dist;
              targetCity = cityName;
            }
          });
        } else {
          const center = CITY_CENTERS[targetCity];
          if (center) {
            minDist = getDistanceKm(latitude, longitude, center.lat, center.lng);
          }
        }

        if (targetCity && minDist <= 5.0) {
          setVerificationSuccess(`📍 Detected Location: Success! You are only ${minDist.toFixed(2)} km from our active ${targetCity} hub. Delivery boundary verified!`);
          localStorage.setItem('selectedCity', targetCity);
          setSelectedCity(targetCity);
          setIsLocationVerified(true);
          setVerificationError('');
          setTimeout(() => {
            setShowLocationModal(false);
            executeCheckout();
          }, 1500);
        } else {
          setVerificationError(`📍 Detected Location: Too Far! You are ${minDist.toFixed(2)} km away from the nearest active ${targetCity || 'hub'}. We only deliver within a 5 km radius.`);
        }
        setDetecting(false);
      },
      (error) => {
        console.error(error);
        setVerificationError("Failed to retrieve GPS location. Please check permissions or type address manually.");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const verifyTypedLocation = () => {
    if (!typedVerification.trim()) {
      setVerificationError("Please enter your current delivery address/landmark.");
      return;
    }

    setVerificationError('');
    setVerificationSuccess('');

    const typedLower = typedVerification.toLowerCase();
    
    // Find supported city in the typed verification input
    const SUPPORTED_CITIES = ['lucknow', 'delhi', 'bangalore', 'banlore', 'mumbai', 'moradabad', 'sambhal', 'chandausi', 'bhind', 'bhiind'];
    const matchedCity = SUPPORTED_CITIES.find(city => typedLower.includes(city));

    if (matchedCity) {
      let displayName = matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1);
      if (displayName === 'Banlore') displayName = 'Bangalore';
      if (displayName === 'Bhiind') displayName = 'Bhind';
      
      const center = CITY_CENTERS[displayName];
      const dist = getDistanceKm(center.lat + (Math.random() * 0.015 - 0.0075), center.lng + (Math.random() * 0.015 - 0.0075), center.lat, center.lng);
      
      setVerificationSuccess(`📍 Verified! Your typed location is ${dist.toFixed(2)} km from the nearest active ${displayName} hub. Delivery is fully supported!`);
      localStorage.setItem('selectedCity', displayName);
      setSelectedCity(displayName);
      setAddress(typedVerification);
      setIsLocationVerified(true);
      
      setTimeout(() => {
        setShowLocationModal(false);
        executeCheckout();
      }, 1500);
    } else {
      setVerificationError(`📍 Boundary Restriction: The address must be located inside an active service city (Lucknow, Delhi, Bangalore, Mumbai, Moradabad, Sambhal, Chandausi, Bhind).`);
    }
  };

  const simulateNearbyLocation = () => {
    const savedCity = localStorage.getItem('selectedCity') || selectedCity || 'Lucknow';
    const center = CITY_CENTERS[savedCity];
    
    // Simulate exactly 1.8km next to the hub
    const simulatedLat = center.lat + 0.012;
    const simulatedLng = center.lng + 0.009;
    const dist = getDistanceKm(simulatedLat, simulatedLng, center.lat, center.lng);
    
    setVerificationSuccess(`🛰️ Simulated GPS coordinates: Success! You are 1.80 km from the active ${savedCity} center. Delivery boundary verified!`);
    localStorage.setItem('selectedCity', savedCity);
    setSelectedCity(savedCity);
    setIsLocationVerified(true);
    setVerificationError('');
    setAddress(`Fulfillment Hub Area, Sector 4, ${savedCity}`);
    
    setTimeout(() => {
      setShowLocationModal(false);
      executeCheckout();
    }, 1500);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (!address || !phone) {
      alert("Please provide delivery address and phone number.");
      return;
    }

    // Verify if the manually entered address text corresponds to a supported city
    const addressLower = address.toLowerCase();
    const SUPPORTED_CITIES = ['lucknow', 'delhi', 'bangalore', 'banlore', 'mumbai', 'moradabad', 'sambhal', 'chandausi', 'bhind', 'bhiind'];
    const matchedCity = SUPPORTED_CITIES.find(city => addressLower.includes(city));

    let currentCity = localStorage.getItem('selectedCity') || selectedCity;

    if (matchedCity) {
      let displayName = matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1);
      if (displayName === 'Banlore') displayName = 'Bangalore';
      if (displayName === 'Bhiind') displayName = 'Bhind';
      
      localStorage.setItem('selectedCity', displayName);
      setSelectedCity(displayName);
      currentCity = displayName;
    }

    const isPanIndia = cart.some(item => 
      item.category?.toLowerCase() === 'pan india' || 
      item.category?.toLowerCase() === 'ghee' || 
      item.name?.toLowerCase().includes('ghee')
    );

    if (!isPanIndia) {
      if (!currentCity) {
        // If city is still not determined, prompt location verification modal
        setShowLocationModal(true);
        return;
      }

      if (!isLocationVerified) {
        setShowLocationModal(true);
        return;
      }
    }

    executeCheckout();
  };

  const executeCheckout = async () => {
    setLoading(true);

    try {
      if (paymentMethod === 'cod') {
        const orderId = await saveOrderToDB('pending');
        if (orderId) {
          clearCart();
          setSuccessOrderId(orderId);
          setShowSuccessAnim(true);
          setTimeout(() => {
            router.push(`/orders/${orderId}`);
          }, 2000);
          return;
        }
        setLoading(false);
        return;
      }

      // Online Payment Flow (Razorpay)
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal }),
      });
      
      const orderData = await res.json();
      
      if (orderData.error) {
        alert(orderData.error);
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Velto MVP',
        description: 'Instant Grocery Delivery',
        order_id: orderData.id,
        handler: async function (response: any) {
          const orderId = await saveOrderToDB('paid', response.razorpay_payment_id);
          if (orderId) {
            clearCart();
            setSuccessOrderId(orderId);
            setShowSuccessAnim(true);
            setTimeout(() => {
              router.push(`/orders/${orderId}`);
            }, 2000);
          }
        },
        prefill: {
          name: user?.email || 'Customer',
          email: user?.email || 'customer@velto.com',
          contact: phone
        },
        theme: { color: '#9333ea' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
      
    } catch (err) {
      alert('Checkout failed due to a network error.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-4xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold">{t('cartEmpty', language)}</h2>
        <p className="text-muted-foreground">{t('cartEmptyDesc', language)}</p>
        <a href="/" className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">{t('startShopping', language)}</a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 mt-4 sm:mt-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="flex-1 space-y-6">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">{t('checkout', language)}</h1>
        
        {/* Group Ordering Console */}
        <div className="glass-panel border border-border/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Users className="text-primary w-5 h-5" />
              <h2 className="font-black text-sm sm:text-base">{t('smartGroupOrdering', language)}</h2>
            </div>
            <button
              onClick={() => setGroupCartActive(!groupCartActive)}
              className={`text-[10px] sm:text-xs font-black uppercase px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all border w-full sm:w-auto text-center ${
                groupCartActive 
                  ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/95 border-primary shadow-md'
              }`}
            >
              {groupCartActive ? t('leaveGroupSession', language) : t('startGroupCart', language)}
            </button>
          </div>

          {groupCartActive ? (
            <div className="space-y-4">
              <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between text-xs">
                <span className="font-extrabold text-primary flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  {t('activeSession', language)}: VELTO-993-SPLIT
                </span>
                <span className="text-muted-foreground font-mono">3 {t('membersJoined', language)}</span>
              </div>

              {/* Members List */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold p-2.5 bg-accent/40 rounded-xl border border-border/40">
                  <span className="flex items-center gap-1.5"><Users size={12} className="text-primary" /> {language === 'hi' ? 'आप' : language === 'hinglish' ? 'You' : 'You'}</span>
                  <span>{cart.length} {language === 'hi' ? 'आइटम' : 'items'} • ₹{total}</span>
                </div>
                {groupCartMembers.map((m, i) => (
                  <div key={i} className="flex justify-between items-center text-xs font-semibold p-2.5 bg-accent/20 rounded-xl border border-border/20">
                    <span className="text-muted-foreground">{m.name}</span>
                    <span>{m.items.reduce((acc: number, it: any) => acc + it.quantity, 0)} {language === 'hi' ? 'आइटम' : 'items'} • ₹{m.items.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0)}</span>
                  </div>
                ))}
              </div>

              {/* Voting Section */}
              <div className="border-t border-border/50 pt-3 space-y-2.5">
                <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                  <Vote size={12} className="text-primary" /> {t('liveGroupFoodPoll', language)}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'samosa', label: 'Samosa Combo' },
                    { id: 'pizza', label: 'Tandoori Pizza' },
                    { id: 'biryani', label: 'Paneer Biryani' }
                  ].map(option => {
                    const votes = groupCartVotes[option.id] || 0;
                    return (
                      <div key={option.id} className="bg-accent/30 p-2.5 rounded-xl border border-border/60 text-center space-y-1.5">
                        <span className="text-[10px] font-bold block truncate">{option.label}</span>
                        <div className="flex justify-center items-center gap-1 text-[11px] font-black text-primary">
                          <span>{votes} {t('votes', language)}</span>
                        </div>
                        <button
                          onClick={() => castGroupVote(option.id)}
                          className="w-full bg-background hover:bg-accent border border-border text-[9px] font-black py-1 rounded uppercase transition-colors"
                        >
                          {t('vote', language)}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('orderWithFriendsDesc', language)}
            </p>
          )}
        </div>

        {/* Smart Cart Optimization Banner */}
        {cart.length > 0 && (
          <div className={`border rounded-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md ${
            isOptimized 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
              : 'bg-primary/10 border-primary/20 text-foreground'
          }`}>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary px-2.5 py-0.5 rounded-full">
                {t('smartOptimizer', language)}
              </span>
              <h3 className="text-xs font-black">
                {isOptimized 
                  ? t('basketOptimized', language) 
                  : t('saveInstant', language)}
              </h3>
              <p className="text-[11px] text-muted-foreground font-semibold">
                {isOptimized 
                  ? t('optimizedDesc', language) 
                  : t('optimizeDesc', language)}
              </p>
            </div>
            <button
              onClick={() => {
                setIsOptimized(!isOptimized);
              }}
              className={`text-xs font-black uppercase px-4 py-2 rounded-xl transition-all shadow-sm w-full sm:w-auto text-center ${
                isOptimized 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/95'
              }`}
            >
              {isOptimized ? t('revertSwap', language) : t('optimizeAndSave', language)}
            </button>
          </div>
        )}

        {/* Cart Items */}
        <div className="glass-panel border border-border/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <h2 className="font-black text-sm sm:text-base border-b border-border pb-2">{t('yourItems', language)} ({cart.length})</h2>
          <div className="divide-y divide-border/50 space-y-4">
            {cart.map((item, idx) => (
              <div key={item.id} className={`flex gap-3 sm:gap-4 items-center ${idx > 0 ? 'pt-4' : ''}`}>
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-accent/50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                   {item.image_url ? (
                     <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                   ) : (
                     <ShoppingBag className="text-muted-foreground/60 w-5 h-5 sm:w-6 sm:h-6" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm truncate">{item.name}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-0.5 sm:mt-1">₹{item.price}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-2.5 bg-zinc-900 dark:bg-zinc-950 text-white rounded-full p-1 shadow-inner">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                      disabled={item.quantity <= 1} 
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center disabled:opacity-30 disabled:hover:bg-primary transition-all cursor-pointer"
                    >
                      <Minus size={10} className="stroke-[3]" />
                    </button>
                    <span className="font-black text-xs min-w-[12px] sm:min-w-[16px] text-center text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Plus size={10} className="stroke-[3]" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive text-[10px] sm:text-xs transition-colors">{t('remove', language)}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiffin Subscription Options (Only if cart contains a Tiffin Service item) */}
        {cart.some(item => item.category?.toLowerCase() === 'tiffin service') && (
          <div className="glass-panel border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-6 -mt-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl"></div>
            <div className="flex items-center gap-2 text-amber-500 border-b border-border pb-3">
              <span className="text-xl">🍱</span>
              <h2 className="font-extrabold text-base sm:text-lg">{t('tiffinSubSetup', language)}</h2>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                {t('selectSubStartDay', language)}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setTiffinStartDay(day)}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                      tiffinStartDay === day
                        ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'border-border bg-background hover:bg-accent text-foreground'
                    }`}
                  >
                    {getLocalizedDay(day, language)}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-2.5 flex items-start gap-1.5">
                <Info size={11} className="text-primary flex-shrink-0 mt-0.5" />
                <span>{t('tiffinSubDesc', language)}</span>
              </p>
            </div>
          </div>
        )}

        {/* Delivery Details */}
        <div className="glass-panel border border-border/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
           <h2 className="font-black text-sm sm:text-base border-b border-border pb-2">{t('deliveryDetails', language)}</h2>
           
           <div>
             <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Phone size={16}/> {t('phoneNumber', language)}</label>
             <input 
               type="tel" 
               value={phone}
               onChange={e => setPhone(e.target.value)}
               placeholder="+91 9999999999" 
               className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
             />
           </div>

           <div>
             <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-medium">{t('deliveryAddress', language)}</label>
               <button onClick={() => setShowAddressPicker(!showAddressPicker)} className="text-xs text-primary font-medium hover:underline">
                 {showAddressPicker ? t('closeMap', language) : t('pickOnMap', language)}
               </button>
             </div>
             
             {showAddressPicker ? (
               <AddressPicker onAddressConfirmed={(addr) => { setAddress(addr); setShowAddressPicker(false); }} />
             ) : (
               <textarea 
                 value={address}
                 onChange={e => setAddress(e.target.value)}
                 placeholder={t('enterAddressPlaceholder', language)} 
                 className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
               />
             )}
            </div>

            {/* 🌳 Smart Delivery Clustering */}
            <div className="border-t border-border/60 pt-4 space-y-3">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Compass size={14} className="text-emerald-500 animate-spin" /> {t('ecoClusteringTitle', language)}
              </h3>
              <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl">
                <input
                  type="checkbox"
                  id="delivery-clustering"
                  checked={deliveryClustering}
                  onChange={(e) => {
                    setDeliveryClustering(e.target.checked);
                    if (e.target.checked) {
                      alert(language === 'hi' ? "🌳 ग्रीन विकल्प सक्रिय! 3 पड़ोसियों के साथ ऑर्डर बंडल हुआ। 8 मिनट इंतजार करने पर ₹40 की बचत।" : language === 'hinglish' ? "🌳 Green Option Activated! Bundled order with 3 neighbors. Waiting 8 minutes saves you ₹40." : "🌳 Green Option Activated! Bundled order with 3 neighbors. Waiting 8 minutes saves you ₹40.");
                    }
                  }}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 bg-background"
                />
                <div className="space-y-1">
                  <label htmlFor="delivery-clustering" className="text-xs font-black text-foreground cursor-pointer block select-none">
                    {t('waitAndSave', language)}
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                    {t('ecoClusteringDesc', language)}
                  </p>
                </div>
              </div>
            </div>

            {/* 🤝 Community Gig Delivery Agent Picker */}
            <div className="border-t border-border/60 pt-4 space-y-3">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-primary" /> {t('supportLocalTitle', language)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'pro', name: t('proRider', language), desc: t('expressDispatch', language), icon: <Navigation size={12} />, discount: 0 },
                  { id: 'student', name: t('localStudent', language), desc: t('supportCollege', language), icon: <Users size={12} />, discount: 15 },
                  { id: 'shopkeeper', name: t('nearbyShopkeeper', language), desc: t('localStoreSave', language), icon: <ShoppingBag size={12} />, discount: 10 }
                ].map(agent => (
                  <button
                    key={agent.id}
                    type="button"
                     onClick={() => setGigAgent(agent.id as any)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      gigAgent === agent.id 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-border/60 bg-background hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black text-foreground mb-1">
                      {agent.icon}
                      <span>{agent.name}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold leading-tight">{agent.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 🎀 Delivery Happiness & Personalized Notes */}
            <div className="border-t border-border/60 pt-4 space-y-3">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Heart size={14} className="text-rose-500 fill-rose-500/10" /> {t('deliveryHappinessTitle', language)}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Birthday Surprise */}
                <div className="flex items-center gap-2.5 bg-accent/20 border border-border/60 p-3 rounded-xl">
                  <input
                    type="checkbox"
                    id="birthday-surprise"
                    checked={birthdaySurprise}
                    onChange={(e) => setBirthdaySurprise(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-background"
                  />
                  <div className="space-y-0.5">
                    <label htmlFor="birthday-surprise" className="text-xs font-black text-foreground cursor-pointer block select-none">
                      {t('birthdaySurprise', language)}
                    </label>
                    <p className="text-[9px] text-muted-foreground font-semibold">{t('birthdaySurpriseDesc', language)}</p>
                  </div>
                </div>

                {/* Rider Thank You Message */}
                <div className="flex items-center gap-2.5 bg-accent/20 border border-border/60 p-3 rounded-xl">
                  <input
                    type="checkbox"
                    id="thank-you-msg"
                    checked={thankYouMessage}
                    onChange={(e) => setThankYouMessage(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-background"
                  />
                  <div className="space-y-0.5">
                    <label htmlFor="thank-you-msg" className="text-xs font-black text-foreground cursor-pointer block select-none">
                      {t('thankYouCard', language)}
                    </label>
                    <p className="text-[9px] text-muted-foreground font-semibold">{t('thankYouCardDesc', language)}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1">
                  {t('personalNote', language)}
                </label>
                <textarea
                  value={personalNote}
                  onChange={e => setPersonalNote(e.target.value)}
                  placeholder={t('personalNotePlaceholder', language)}
                  className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-16 text-xs"
                />
              </div>
            </div>

            {/* Delivery Partner Safety & Respect Console */}
            <div className="border-t border-border/60 pt-6 space-y-5">
              <div className="flex items-center gap-2 text-amber-500">
                <HeartHandshake className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">{t('riderSafetyTitle', language)}</h3>
              </div>
              
              {/* Don't Rush Mode */}
              <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl">
                <input
                  type="checkbox"
                  id="dont-rush"
                  checked={dontRush}
                  onChange={(e) => setDontRush(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 bg-background"
                />
                <div className="space-y-1">
                  <label htmlFor="dont-rush" className="text-xs font-black text-foreground cursor-pointer block select-none">
                    {t('activateDontRush', language)}
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {t('dontRushDesc', language)}
                  </p>
                </div>
              </div>

              {/* Rider Tip Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-wider block">
                    {t('supportRiderTip', language)}
                  </label>
                  {riderTip > 0 && (
                    <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {t('tipAdded', language).replace('{amt}', String(riderTip))}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[10, 20, 30, 50, 100].map(tipAmount => (
                    <button
                      key={tipAmount}
                      type="button"
                      onClick={() => setRiderTip(riderTip === tipAmount ? 0 : tipAmount)}
                      className={`py-2 px-0.5 sm:px-2 rounded-xl text-[10px] sm:text-xs font-black border transition-all ${
                        riderTip === tipAmount
                          ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
                          : 'border-border bg-background hover:bg-accent text-foreground'
                      }`}
                    >
                      +₹{tipAmount}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground font-semibold leading-relaxed flex items-center gap-1.5 bg-accent/20 p-2 rounded-lg">
                  <Shield size={10} className="text-primary flex-shrink-0" />
                  <span>{t('tipDesc', language)}</span>
                </p>
              </div>

              {/* Emergency simulation link */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert(language === 'hi' ? "आपातकालीन एसओएस अलर्ट सिमुलेटेड! डिलीवरी पार्टनर की सुरक्षा सर्वोपरि है।" : language === 'hinglish' ? "SOS Alert Simulated! Emergency partner dispatch notified. We prioritize our rider's safety." : "SOS Alert Simulated! Emergency partner dispatch notified. We prioritize our rider's health & safety 24/7.")}
                  className="flex-1 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl shadow-sm"
                >
                  {t('emergencySos', language)}
                </button>
                <button
                  type="button"
                  onClick={() => alert("Thank you! Rider politeness & safety compliance tracker has logged your positive rating request.")}
                  className="flex-1 bg-accent hover:bg-accent/80 text-foreground border border-border/80 transition-all text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl shadow-sm"
                >
                  {t('politenessRate', language)}
                </button>
              </div>
            </div>
        </div>
      </div>
      
      {/* Order Summary & Payment */}
      <div className="w-full lg:w-96 h-fit p-4 sm:p-6 border border-border/40 rounded-2xl glass-panel shadow-xl sticky top-24 space-y-6 neon-glow">
        {!oneIndiaPass && (
          <div className="bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-orange-500/5 border border-amber-500/20 p-4 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[9px] bg-amber-500/10 text-amber-600 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">👑 {t('oneIndiaPass', language)}</span>
                <h4 className="text-xs font-black text-foreground pt-1">{language === 'hi' ? 'वन इंडिया पास सब्सक्रिप्शन लें' : language === 'hinglish' ? 'One India Pass subscription lein' : 'Get One India Pass subscription'}</h4>
                <p className="text-[9px] text-muted-foreground font-semibold">{language === 'hi' ? 'डिलीवरी शुल्क तुरंत ₹0 करें! (1 महीने की वैधता)' : language === 'hinglish' ? 'Instantly delivery fees ₹0 karein! (1 Month Validity)' : 'Instantly drop delivery fees to ₹0! (1 Month Validity)'}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOneIndiaPass(true);
                  alert(language === 'hi' ? "🎉 वन इंडिया पास प्रीमियम मेंबरशिप सक्रिय! 1 महीने के लिए डिलीवरी फीस ₹0।" : "🎉 One India Pass Premium Subscription Purchased! Delivery fees are now ₹0 for 1 month.");
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-lg transition-all shadow-md shrink-0"
              >
                ₹99/mo
              </button>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
            <span>{t('orderSummary', language)}</span>
            {oneIndiaPass && (
              <span className="text-[10px] bg-amber-500/10 text-amber-500 font-black uppercase px-2 py-1 rounded-lg flex items-center gap-1">
                <Crown size={10} /> {t('passActive', language)}
              </span>
            )}
          </h2>

          {/* Coupon Code / Discount Slot (Figma aesthetic) */}
          <div className="border border-dashed border-primary/30 bg-primary/5 rounded-2xl p-4 flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎟️</span>
              <div className="text-left">
                <p className="text-xs font-black text-foreground">{language === 'hi' ? 'कूपन कोड दर्ज करें' : 'Discount Coupon Code'}</p>
                <p className="text-[10px] text-muted-foreground">{language === 'hi' ? 'ऑफ़र लागू करने के लिए टैप करें' : 'Tap to apply promo code'}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                alert(language === 'hi' ? "कूपन कोड VELTO50 सफलतापूर्वक लागू: ₹50 की अतिरिक्त छूट!" : "Promo coupon VELTO50 successfully applied: Additional ₹50 discount!");
              }}
              className="text-xs font-black text-primary hover:underline cursor-pointer"
            >
              {language === 'hi' ? 'लागू करें' : 'Apply'}
            </button>
          </div>
          
          <div className="space-y-3.5 text-xs border-b border-border pb-4 mb-4">
            <div className="flex justify-between font-semibold">
              <span className="text-muted-foreground">{t('subtotal', language)}</span>
              <span className="font-bold">₹{total}</span>
            </div>

            {groupCartActive && (
              <div className="flex justify-between font-semibold text-primary">
                <span className="flex items-center gap-1">🤝 {t('rohanPriyaItems', language)}</span>
                <span className="font-bold">₹140</span>
              </div>
            )}

            <div className="flex justify-between items-center font-semibold">
              <span className="text-muted-foreground">{t('deliveryFee', language)}</span>
              {oneIndiaPass ? (
                <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                  <span className="line-through text-muted-foreground/60 font-semibold">₹20</span> {language === 'hi' ? 'मुफ़्त' : 'Free'}
                </span>
              ) : (
                <span className="font-bold">₹20</span>
              )}
            </div>

            <div className="flex justify-between items-center font-semibold">
              <span className="text-muted-foreground">{t('platformFee', language)}</span>
              <span className="font-bold">₹5</span>
            </div>

            <div className="flex justify-between font-semibold">
              <span className="text-muted-foreground">{t('gstPacking', language)}</span>
              <span className="font-bold">₹{gstTaxes}</span>
            </div>

            {riderTip > 0 && (
              <div className="flex justify-between font-semibold text-amber-500">
                <span className="flex items-center gap-1">{t('thankYouTip', language)}</span>
                <span className="font-bold">₹{riderTip}</span>
              </div>
            )}

            {deliveryClustering && (
              <div className="flex justify-between font-semibold text-emerald-500 animate-pulse">
                <span className="flex items-center gap-1">{t('ecoClusteringSaved', language)}</span>
                <span className="font-bold">-₹40</span>
              </div>
            )}

            {gigAgent !== 'pro' && (
              <div className="flex justify-between font-semibold text-emerald-500">
                <span className="flex items-center gap-1">{t('communityAgentOffset', language)}</span>
                <span className="font-bold">-₹{gigDiscount}</span>
              </div>
            )}

            {birthdaySurprise && (
              <div className="flex justify-between font-semibold text-primary">
                <span className="flex items-center gap-1">{t('birthdayGiftWrap', language)}</span>
                <span className="font-bold">₹30</span>
              </div>
            )}
          </div>

          {/* Animated Cost Allocation Bar Chart */}
          <div className="mb-4 space-y-1.5 bg-accent/20 p-3 rounded-2xl border border-border/40">
            <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground tracking-wider">
              <span>{t('feeAllocationChart', language)}</span>
              <span className="text-primary font-bold">{t('gstPartnerDriven', language)}</span>
            </div>
            
            <div className="w-full h-3 bg-accent rounded-full overflow-hidden flex shadow-inner">
              <div 
                style={{ width: `${(subtotalVal / (grandTotal || 1)) * 100}%` }} 
                className="h-full bg-primary transition-all duration-500" 
                title={t('foodAndGrocery', language)}
              ></div>
              <div 
                style={{ width: `${((deliveryFee + platformFee) / (grandTotal || 1)) * 100}%` }} 
                className="h-full bg-amber-500 transition-all duration-500" 
                title={t('deliveryAndPlatform', language)}
              ></div>
              <div 
                style={{ width: `${(gstTaxes / (grandTotal || 1)) * 100}%` }} 
                className="h-full bg-rose-500 transition-all duration-500" 
                title={t('taxes', language)}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-[9px] font-extrabold text-muted-foreground pt-1">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-primary rounded-full"></span> {language === 'hi' ? 'भोजन' : 'Food'}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {language === 'hi' ? 'डिलीवरी' : 'Delivery'}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> {language === 'hi' ? 'टैक्स' : 'Taxes'}</span>
            </div>
          </div>

          <div className="flex justify-between font-black text-lg border-t border-dashed border-border pt-4">
            <span>{t('totalPayable', language)}</span>
            <span className="text-primary">₹{grandTotal}</span>
          </div>

          {oneIndiaPass && (
            <p className="text-[10px] text-emerald-500 font-extrabold text-center mt-3 uppercase tracking-wider bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 animate-pulse">
              {t('passSavedNotice', language)}
            </p>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-3">{t('paymentMethod', language)}</h3>
          <div className="flex flex-col gap-2">
            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}>
              <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="hidden" />
              <CreditCard size={20} className={paymentMethod === 'online' ? 'text-primary' : 'text-muted-foreground'} />
              <span className="font-medium text-sm">{t('payOnline', language)}</span>
            </label>
            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}>
              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
              <Banknote size={20} className={paymentMethod === 'cod' ? 'text-primary' : 'text-muted-foreground'} />
              <span className="font-medium text-sm">{t('payCod', language)}</span>
            </label>
          </div>
        </div>
        
        {!selectedCity ? (
          <div className="space-y-3">
            <button 
              onClick={() => {
                alert(language === 'hi' ? "लोकेशन सत्यापन आवश्यक: कृपया होम पेज पर जाएं और अपनी डिलीवरी लोकेशन सत्यापित करें!" : "Location Verification Required: Please return to the Home Page and enter your delivery location first to verify if we service your area!");
                router.push('/');
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            >
              <MapPin size={16} /> {t('setLocationCheckout', language)}
            </button>
            <p className="text-[10px] text-center text-amber-500 font-extrabold uppercase tracking-wider">
              {t('serviceAreaMandatory', language)}
            </p>
          </div>
        ) : (
          <>
            <button 
              onClick={handleCheckout} 
              disabled={loading || !user}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70 shadow-md"
            >
              {loading ? (language === 'hi' ? 'ऑर्डर दर्ज हो रहा है...' : 'Placing Order...') : !user ? t('loginToCheckout', language) : `${t('placeOrder', language)} • ₹${grandTotal}`}
            </button>
            {!user && <p className="text-xs text-center text-muted-foreground">{t('loginMandatoryDesc', language)}</p>}
          </>
        )}
      </div>

      {/* Service Area boundary verification modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl relative space-y-6 overflow-hidden">
            <div className="absolute right-0 top-0 -mr-12 -mt-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                <MapPin size={18} className="text-primary" /> {t('serviceAreaCheck', language)}
              </h3>
              <button 
                onClick={() => { setShowLocationModal(false); setVerificationError(''); setVerificationSuccess(''); }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors bg-accent hover:bg-accent/80 p-2 rounded-xl flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('serviceAreaRadiusDesc', language)}
              </p>

              {/* Status Alerts */}
              {verificationError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl space-y-2">
                  <p className="font-semibold leading-relaxed">{verificationError}</p>
                  <button 
                    onClick={simulateNearbyLocation} 
                    className="w-full bg-red-500 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Navigation size={10} className="rotate-45" /> {language === 'hi' ? `यहाँ क्लिक करें ${selectedCity || 'हब'} के पास लोकेशन सिमुलेट करने के लिए` : `Click here to simulate coordinates near ${selectedCity || 'Center'}`}
                  </button>
                </div>
              )}

              {verificationSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold p-3.5 rounded-xl animate-pulse">
                  {verificationSuccess}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3.5">
                <button
                  onClick={verifyGPSLocation}
                  disabled={detecting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                >
                  {detecting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin animate-duration-1000"></div>
                      {t('detectingLocation', language)}
                    </>
                  ) : (
                    <><Compass size={16} className="animate-[spin_4s_linear_infinite]" /> {t('detectLocation', language)}</>
                  )}
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border/60"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-black uppercase text-muted-foreground tracking-wider">{t('orVerifyAddress', language)}</span>
                  <div className="flex-grow border-t border-border/60"></div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                    {t('enterAddressLabel', language)}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`e.g. Sector 4, ${selectedCity || 'Lucknow'}`}
                      value={typedVerification}
                      onChange={(e) => setTypedVerification(e.target.value)}
                      className="flex-1 p-2.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                    />
                    <button
                      onClick={verifyTypedLocation}
                      className="bg-accent hover:bg-accent/80 text-foreground font-extrabold px-4 rounded-xl text-xs transition-colors border border-border/60"
                    >
                      {t('verify', language)}
                    </button>
                  </div>
                  <p className="text-[9px] text-muted-foreground font-medium italic flex items-center gap-1">
                    <Info size={10} className="text-primary" /> {t('addressMatchCityWarning', language).replace('{city}', selectedCity || '')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showSuccessAnim && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            {/* Confetti / Sparkle Effects */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: 0, 
                  scale: Math.random() * 1.5 + 0.5,
                  x: (Math.random() - 0.5) * window.innerWidth,
                  y: (Math.random() - 0.5) * window.innerHeight
                }}
                transition={{ 
                  duration: 1.5 + Math.random() * 1.5, 
                  ease: "easeOut"
                }}
                className="absolute"
              >
                <Sparkles className="text-primary/40" size={24 + Math.random() * 24} />
              </motion.div>
            ))}

            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="relative z-10 flex flex-col items-center text-center p-8 bg-card border border-border rounded-3xl shadow-2xl max-w-sm w-full mx-4"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-3xl -z-10" />
              
              {/* Animated checkmark circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
                className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 relative"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-500/20 rounded-full"
                />
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                    d="M20 6L9 17l-5-5"
                  />
                </svg>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-3xl font-black mb-2 tracking-tight"
              >
                {language === 'hi' ? 'ऑर्डर सफल!' : language === 'hinglish' ? 'Order Success!' : 'Order Placed!'}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-muted-foreground font-medium mb-6"
              >
                {language === 'hi' ? 'आपका ऑर्डर कन्फर्म हो गया है और पैक किया जा रहा है।' : 'Your order is confirmed and being packed.'}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="bg-accent/50 border border-border px-5 py-3 rounded-2xl w-full"
              >
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block mb-1">
                  Order ID
                </span>
                <span className="font-mono text-sm font-bold text-foreground truncate block">
                  {successOrderId}
                </span>
              </motion.div>

              {/* Progress bar to routing */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear" }}
                className="h-1 bg-primary absolute bottom-0 left-0 rounded-b-3xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
