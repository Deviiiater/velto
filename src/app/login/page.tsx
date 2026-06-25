'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Phone, Mail, User, MapPin, ShieldAlert, Key, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
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

  // Input fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState(''); // 4-digit security PIN

  // Flow control states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pre-fill email from localStorage (IRCTC Style)
  useEffect(() => {
    const savedEmail = localStorage.getItem('velto_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
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
  }, [user, authLoading, router]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || pin.length !== 4) {
      setError(language === 'hi' ? 'कृपया सही ईमेल और 4-अंकीय पिन दर्ज करें।' : 'Please enter a valid email and 4-digit PIN.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pin,
      });

      if (signInError) throw signInError;

      localStorage.setItem('velto_saved_email', email.trim());
      setSuccessMsg(language === 'hi' ? 'लॉगिन सफल!' : 'Login successful!');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName || !phone || !address || pin.length !== 4) {
      setError(language === 'hi' ? 'कृपया सभी फ़ील्ड और 4-अंकीय पिन भरें।' : 'Please fill in all fields and provide a 4-digit PIN.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: pin,
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

        // Upsert profile details in the users database table
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

        setSuccessMsg(language === 'hi' ? 'पंजीकरण सफल! लॉग इन हो रहा है...' : 'Registration successful! Logging you in...');
      }
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-card border border-border rounded-2xl shadow-xl space-y-6 relative overflow-hidden glass-panel">
      {/* Visual top highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>

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

      {/* Mode Switches */}
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

      {/* Auth Form */}
      <form onSubmit={mode === 'signup' ? handleSignup : handleLogin} className="space-y-4">
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

        {/* 4-Digit Security PIN */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            {language === 'hi' ? '4-अंकीय सुरक्षा पिन' : '4-Digit Security PIN'}
          </label>
          <div className="relative">
            <Key className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={16} />
            <input
              type="password"
              pattern="[0-9]{4}"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
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
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <LogIn size={14} />{' '}
              {mode === 'signup'
                ? language === 'hi' ? 'पंजीकरण करें और लॉगिन करें' : 'Register & Log In'
                : language === 'hi' ? 'लॉग इन करें' : 'Log In'}
            </>
          )}
        </button>
      </form>

      {/* Bottom Back Button */}
      <div className="text-center border-t border-border/40 pt-4 mt-2">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-bold uppercase tracking-wider transition-colors">
          <ArrowLeft size={12} /> {t('backCustomerStore', language)}
        </Link>
      </div>
    </div>
  );
}
