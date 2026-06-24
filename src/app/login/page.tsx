'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Phone, Mail, User, MapPin, ShieldAlert, Key, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { t } from '@/lib/translations';
import Link from 'next/link';

export default function LoginPage() {
  const { language } = useSettings();
  const router = useRouter();

  // Mode: 'login' or 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Input fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Flow control states
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(30);

  // OTP Timer Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // Handle Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          data: mode === 'signup' ? {
            full_name: fullName.trim(),
            phone: phone.trim(),
          } : undefined
        }
      });

      if (otpError) throw otpError;

      setOtpSent(true);
      setOtpTimer(30);
      setSuccessMsg(language === 'hi' ? '6-अंकीय ओटीपी आपके ईमेल पर भेजा गया है!' : 'A 6-digit OTP code has been sent to your email!');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
      });
      if (otpError) throw otpError;

      setOtpTimer(30);
      setSuccessMsg(language === 'hi' ? 'नया ओटीपी कोड भेजा गया!' : 'New OTP verification code sent!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'email',
      });

      if (verifyError) throw verifyError;

      if (!data.user) {
        throw new Error('Verification succeeded but session could not be retrieved.');
      }

      // If user registered, make sure metadata profile exists
      if (mode === 'signup') {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            full_name: fullName.trim() || 'New User',
            phone: phone.trim(),
            address: address.trim(),
            role: 'customer',
          });

        if (profileError) throw profileError;

        if (address) {
          localStorage.removeItem('selectedCity');
          localStorage.removeItem('deliveryAddress');
          localStorage.setItem('deliveryAddress', address.trim());
        }
      } else {
        // Redirection checks for exist roles
        const { data: profile } = await supabase
          .from('users')
          .select('role, address')
          .eq('id', data.user.id)
          .maybeSingle();

        const role = profile?.role || 'customer';
        if (profile?.address) {
          localStorage.removeItem('selectedCity');
          localStorage.removeItem('deliveryAddress');
          localStorage.setItem('deliveryAddress', profile.address);
        }

        if (role === 'admin') {
          router.push('/admin');
          return;
        } else if (role === 'rider') {
          router.push('/rider-panel');
          return;
        } else if (role === 'kitchen') {
          router.push('/kitchen');
          return;
        } else if (role === 'warehouse') {
          router.push('/warehouse');
          return;
        } else if (role === 'vendor') {
          router.push('/vendor');
          return;
        }
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Check code.');
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
          {otpSent ? t('enterOtp', language) : mode === 'signup' ? t('registerAccount', language) : t('welcomeVelto', language)}
        </h1>
        <p className="text-xs text-muted-foreground font-medium">
          {otpSent 
            ? `${language === 'hi' ? 'हमने एक सत्यापन कोड ईमेल किया है' : 'We sent a verification code to'} ${email}` 
            : mode === 'signup' 
            ? t('completeDetails10', language) 
            : t('loginSignupAccess', language)}
        </p>
      </div>

      {/* Mode Switches */}
      {!otpSent && (
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
      )}

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

      {/* REQUEST OTP FLOW */}
      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
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

          {/* Email input (For both Login & Signup) */}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-extrabold hover:bg-primary/95 transition-all flex justify-center items-center gap-2 text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail size={14} /> {language === 'hi' ? 'सत्यापन कोड भेजें' : 'Send Verification OTP'}</>}
          </button>
        </form>
      ) : (
        /* VERIFY OTP FLOW */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('enter6DigitOtp', language)}</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={16} />
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-3 pl-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bold tracking-[0.3em] text-center"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-extrabold hover:bg-primary/95 transition-all flex justify-center items-center gap-2 text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle size={14} /> {language === 'hi' ? 'सत्यापित करें और लॉग इन करें' : 'Verify & Log In'}</>}
          </button>

          <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setSuccessMsg(null);
              }}
              className="text-muted-foreground hover:text-primary font-bold flex items-center gap-1"
            >
              <ArrowLeft size={12} /> {t('back', language)}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={otpTimer > 0 || loading}
              className={`font-black uppercase tracking-wider ${
                otpTimer > 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-primary hover:underline'
              }`}
            >
              {otpTimer > 0 ? `${t('resendCode', language)} (${otpTimer}s)` : t('resendOtp', language)}
            </button>
          </div>
        </form>
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
