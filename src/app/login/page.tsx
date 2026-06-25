'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Phone, Mail, User, MapPin, ShieldAlert, Key, ArrowLeft, CheckCircle, Loader2, Lock } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/translations';
import Link from 'next/link';

export default function LoginPage() {
  const { language } = useSettings();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Mode: 'login' or 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Input fields for standard authentication
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // PIN settings and quick login
  const [quickPin, setQuickPin] = useState(''); // input pin on login
  const [useQuickPin, setUseQuickPin] = useState(false);
  const [savedEmailForPin, setSavedEmailForPin] = useState('');
  
  // Pin setup states
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  // Flow control states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if Quick PIN is configured on mount
  const [hasStoredPin, setHasStoredPin] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const configuredPin = localStorage.getItem('velto_quick_pin');
      const savedEmail = localStorage.getItem('velto_saved_email');
      if (configuredPin) {
        setHasStoredPin(true);
      }
      if (configuredPin && savedEmail) {
        setUseQuickPin(true);
        setSavedEmailForPin(savedEmail);
      }
    }
  }, []);

  // Auto-redirect if user is already logged in (but not in PIN setup mode)
  useEffect(() => {
    if (user && !authLoading && !showPinSetup) {
      const checkUserRoleAndRedirect = async () => {
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          const role = profile?.role || 'customer';
          
          if (role === 'admin') router.push('/admin');
          else if (role === 'rider') router.push('/rider-panel');
          else if (role === 'kitchen') router.push('/kitchen');
          else if (role === 'warehouse') router.push('/warehouse');
          else if (role === 'vendor') router.push('/vendor');
          else router.push('/');
        } catch (e) {
          router.push('/');
        }
      };
      checkUserRoleAndRedirect();
    }
  }, [user, authLoading, showPinSetup, router]);

  // Handle Standard Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) throw signInError;

      // Save email and password locally for future Quick PIN encryption/authentication
      localStorage.setItem('velto_saved_email', email.trim());
      localStorage.setItem('velto_saved_password', password);

      // Check if quick PIN is already setup
      const hasPin = localStorage.getItem('velto_quick_pin');
      if (!hasPin) {
        // Offer to set up a Quick PIN
        setShowPinSetup(true);
      } else {
        setSuccessMsg(language === 'hi' ? 'लॉगिन सफल!' : 'Login successful!');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick PIN Login (IRCTC Style)
  const handleQuickPinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const storedPin = localStorage.getItem('velto_quick_pin');
    const storedEmail = localStorage.getItem('velto_saved_email');
    const storedPassword = localStorage.getItem('velto_saved_password');

    if (quickPin !== storedPin) {
      setError(language === 'hi' ? 'गलत सुरक्षा पिन। कृपया पुनः प्रयास करें।' : 'Incorrect security PIN. Please try again.');
      return;
    }

    if (!storedEmail || !storedPassword) {
      setError(language === 'hi' ? 'सहेजे गए क्रेडेंशियल नहीं मिले। कृपया पासवर्ड के साथ लॉगिन करें।' : 'Saved credentials not found. Please log in with password.');
      setUseQuickPin(false);
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: storedEmail,
        password: storedPassword,
      });

      if (signInError) throw signInError;
      setSuccessMsg(language === 'hi' ? 'लॉगिन सफल!' : 'Login successful!');
    } catch (err: any) {
      setError(err.message || 'Fast login failed. Please enter your email and password.');
      setUseQuickPin(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup (Registration)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phone || !address) {
      setError(language === 'hi' ? 'कृपया सभी फ़ील्ड भरें।' : 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        localStorage.setItem('velto_saved_email', email.trim());
        localStorage.setItem('velto_saved_password', password);

        // Save profile details in the users database table
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            role: 'customer',
          });

        if (profileError) throw profileError;

        localStorage.removeItem('selectedCity');
        localStorage.removeItem('deliveryAddress');
        localStorage.setItem('deliveryAddress', address.trim());

        // Ask to set up 4-digit PIN
        setShowPinSetup(true);
      }
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save/Create 4-Digit Security PIN
  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || confirmNewPin.length !== 4) {
      setError(language === 'hi' ? 'पिन 4 अंकों का होना चाहिए।' : 'PIN must be exactly 4 digits.');
      return;
    }

    if (newPin !== confirmNewPin) {
      setError(language === 'hi' ? 'सुरक्षा पिन मेल नहीं खाते।' : 'Security PINs do not match.');
      return;
    }

    localStorage.setItem('velto_quick_pin', newPin);
    setShowPinSetup(false);
    setSuccessMsg(language === 'hi' ? 'त्वरित लॉगिन पिन सफलतापूर्वक सेट किया गया!' : 'Quick Login PIN configured successfully!');

    // Redirect to home or admin dashboard
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-card border border-border rounded-2xl shadow-xl space-y-6 relative overflow-hidden glass-panel">
      {/* Visual top highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>

      {/* 4-DIGIT PIN SETUP MODAL VIEW */}
      {showPinSetup ? (
        <form onSubmit={handleCreatePin} className="space-y-5">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {language === 'hi' ? '🔐 त्वरित लॉगिन पिन सेट करें' : '🔐 Setup Quick Login PIN'}
            </h1>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              {language === 'hi' 
                ? 'अगली बार पासवर्ड के बिना तुरंत लॉग इन करने के लिए एक 4-अंकीय पिन बनाएं।'
                : 'Create a 4-digit PIN to log in instantly next time without entering your password.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              {language === 'hi' ? 'नया 4-अंकीय पिन दर्ज करें' : 'Enter New 4-Digit PIN'}
            </label>
            <input
              type="password"
              pattern="[0-9]{4}"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bold tracking-[0.3em] text-center"
              placeholder="••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              {language === 'hi' ? 'पिन की पुष्टि करें' : 'Confirm PIN'}
            </label>
            <input
              type="password"
              pattern="[0-9]{4}"
              inputMode="numeric"
              maxLength={4}
              value={confirmNewPin}
              onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bold tracking-[0.3em] text-center"
              placeholder="••••"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowPinSetup(false);
                router.push('/');
              }}
              className="flex-1 bg-accent hover:bg-accent/80 text-foreground py-3 rounded-xl font-bold text-xs uppercase transition-all"
            >
              {language === 'hi' ? 'छोड़ें' : 'Skip'}
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-xs uppercase hover:bg-primary/95 transition-all shadow-md"
            >
              {language === 'hi' ? 'पिन सहेजें' : 'Save PIN'}
            </button>
          </div>
        </form>
      ) : useQuickPin ? (
        /* QUICK 4-DIGIT PIN LOGIN VIEW (IRCTC STYLE) */
        <form onSubmit={handleQuickPinLogin} className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {language === 'hi' ? '🔐 त्वरित लॉगिन' : '🔐 Quick PIN Login'}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              {language === 'hi' ? 'उपयोगकर्ता के रूप में लॉगिन करें:' : 'Logging in as:'}{' '}
              <span className="text-primary font-mono">{savedEmailForPin}</span>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle size={14} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              {language === 'hi' ? '4-अंकीय सुरक्षा पिन दर्ज करें' : 'Enter 4-Digit Security PIN'}
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={16} />
              <input
                type="password"
                pattern="[0-9]{4}"
                inputMode="numeric"
                maxLength={4}
                value={quickPin}
                onChange={(e) => setQuickPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full p-3 pl-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bold tracking-[0.3em] text-center"
                placeholder="••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-extrabold hover:bg-primary/95 transition-all flex justify-center items-center gap-2 text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn size={14} /> {language === 'hi' ? 'लॉग इन करें' : 'Unlock & Log In'}</>}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setUseQuickPin(false);
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-primary hover:underline font-bold uppercase tracking-wider"
            >
              {language === 'hi' ? 'पासवर्ड के साथ लॉगिन करें' : 'Login with Password instead'}
            </button>
          </div>
        </form>
      ) : (
        /* STANDARD EMAIL & PASSWORD LOGIN / SIGNUP VIEW */
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {mode === 'signup' ? t('registerAccount', language) : t('welcomeVelto', language)}
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              {mode === 'signup' 
                ? t('completeDetails10', language) 
                : t('loginSignupAccess', language)}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-accent/40 rounded-xl border border-border/50">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LogIn size={14} /> {t('logIn', language)}
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus size={14} /> {t('signUp', language)}
            </button>
          </div>

          {/* Error & Success Alerts */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle size={14} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={mode === 'signup' ? handleSignup : handlePasswordLogin} className="space-y-4">
            {mode === 'signup' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('fullName', language)}</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={16} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-3 pl-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('phoneNumber', language)}</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={16} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full p-3 pl-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                      placeholder="9998887776"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('deliveryAddress', language)}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={16} />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-3 pl-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                      placeholder="Apartment, Landmark, City"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('emailAddress', language)}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 pl-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                {mode === 'signup' ? (language === 'hi' ? 'पासवर्ड बनाएं' : 'Create Password') : t('password', language)}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-extrabold hover:bg-primary/95 transition-all flex justify-center items-center gap-2 text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn size={14} />{' '}
                  {mode === 'signup'
                    ? language === 'hi' ? 'पंजीकरण करें' : 'Register'
                    : language === 'hi' ? 'लॉग इन करें' : 'Log In'}
                </>
              )}
            </button>
          </form>

          {/* Quick Login toggle button if PIN is configured */}
          {hasStoredPin && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setUseQuickPin(true);
                  const savedEmail = localStorage.getItem('velto_saved_email');
                  if (savedEmail) setSavedEmailForPin(savedEmail);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-primary hover:underline font-bold uppercase tracking-wider"
              >
                {language === 'hi' ? '4-अंकीय त्वरित पिन से लॉगिन करें' : 'Login with 4-Digit Quick PIN'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="text-center border-t border-border/40 pt-4 mt-2">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-bold uppercase tracking-wider transition-colors">
          <ArrowLeft size={12} /> {t('backCustomerStore', language)}
        </Link>
      </div>
    </div>
  );
}
