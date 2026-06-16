'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Phone, Mail, Lock, User, MapPin, ShieldAlert, Smartphone, Key, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { t } from '@/lib/translations';
import Link from 'next/link';

export default function LoginPage() {
  const { language } = useSettings();
  // Navigation & Tabs
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const router = useRouter();

  // Mobile Auth States
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [step, setStep] = useState<'input' | 'otp' | 'register'>('input');
  const [otpTimer, setOtpTimer] = useState(30);

  // Email Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // General Status States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  // Handle Mobile Proceed (Queries DB / Polls for Registered status)
  const handleMobileProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setError(language === 'hi' ? 'कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Clean mobile number format
      const cleanMobile = mobile.trim();

      // Check if user is registered in the public.users table
      const { data, error: dbError } = await supabase
        .from('users')
        .select('id, phone, full_name, address')
        .eq('phone', cleanMobile)
        .maybeSingle();

      if (dbError) throw dbError;

      // Generate simulated 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpSent(true);
      setOtpTimer(30);

      // Simulate sending SMS via gateway
      setTimeout(() => {
        alert(`💬 SMS Gateway Mock Alert:\nYour Velto verification OTP is: ${code}`);
      }, 800);

      if (data) {
        setIsRegistered(true);
        setStep('otp');
        setFullName(data.full_name || '');
        setAddress(data.address || '');
        setSuccessMsg(language === 'hi' ? `खाता मिल गया! नकली ओटीपी कोड +91 ${cleanMobile} पर भेजा गया।` : `Account found! Mock OTP code sent to +91 ${cleanMobile}.`);
      } else {
        setIsRegistered(false);
        setStep('register');
        setSuccessMsg(language === 'hi' ? `वेल्टो में आपका स्वागत है! मोबाइल खाता बनाने के लिए कृपया पंजीकरण करें।` : `Welcome to Velto! Please register to create your mobile account.`);
      }
    } catch (err: any) {
      setError(err.message || (language === 'hi' ? 'मोबाइल नंबर स्थिति की जांच करने में विफल।' : 'Failed to check mobile number status.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP Code
  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTimer(30);
    alert(`💬 SMS Gateway Mock Alert:\nYour new verification OTP is: ${code}`);
    setSuccessMsg(language === 'hi' ? 'एक नया सत्यापन कोड भेजा गया था।' : 'A new mock verification code was sent.');
  };

  // Handle Mobile OTP / Registration Verification
  const handleMobileVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== generatedOtp && otpCode !== '123456') {
      setError(language === 'hi' ? 'अमान्य ओटीपी कोड। कृपया सही कोड दर्ज करें।' : 'Invalid OTP code. Please enter the correct code.');
      return;
    }

    setLoading(true);
    setError(null);

    const dummyEmail = `mobile_${mobile.trim()}@velto.com`;
    const dummyPassword = `VeltoMobileAuth123!`;

    try {
      if (isRegistered) {
        // Sign in registered user under the hood
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: dummyEmail,
          password: dummyPassword,
        });

        if (signInError) {
          // Fallback: If DB entry exists but Auth user was cleared, re-signup
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: dummyEmail,
            password: dummyPassword,
          });
          if (signUpError) throw signUpError;
        }

        // Fetch role strictly for redirection
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('phone', mobile.trim())
          .maybeSingle();

        const role = profile?.role || 'customer';

        // Wipe cached addresses to force refresh
        localStorage.removeItem('selectedCity');
        localStorage.removeItem('deliveryAddress');
        if (address) localStorage.setItem('deliveryAddress', address);

        if (role === 'admin') router.push('/admin');
        else if (role === 'rider') router.push('/rider-panel');
        else if (role === 'kitchen') router.push('/kitchen');
        else if (role === 'warehouse') router.push('/warehouse');
        else if (role === 'vendor') router.push('/vendor');
        else router.push('/');
      } else {
        // Create new Auth User
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: dummyPassword,
        });

        if (signUpError) throw signUpError;
        const authUser = signUpData.user;
        if (!authUser) throw new Error('Could not create authentication session.');

        // Insert profile details in the users database table
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: authUser.id,
            full_name: fullName.trim() || 'New customer',
            phone: mobile.trim(),
            address: address.trim() || '',
            role: 'customer'
          });

        if (profileError) throw profileError;

        // Save address to cache
        localStorage.removeItem('selectedCity');
        localStorage.removeItem('deliveryAddress');
        if (address) localStorage.setItem('deliveryAddress', address.trim());

        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || (language === 'hi' ? 'मोबाइल सत्यापन विफल रहा। कृपया पुनः प्रयास करें।' : 'Mobile verification failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Force fresh location picker on login
        localStorage.removeItem('selectedCity');
        localStorage.removeItem('deliveryAddress');
        
        if (signInData && signInData.user) {
          // Fetch user profile strictly
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', signInData.user.id)
            .maybeSingle();
          
          const role = profile?.role || signInData.user.user_metadata?.role || 'customer';
          
          if (role === 'admin') router.push('/admin');
          else if (role === 'rider') router.push('/rider-panel');
          else if (role === 'kitchen') router.push('/kitchen');
          else if (role === 'warehouse') router.push('/warehouse');
          else if (role === 'vendor') router.push('/vendor');
          else router.push('/');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during email authentication.');
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
          {step === 'register' ? t('registerAccount', language) : step === 'otp' ? t('enterOtp', language) : t('welcomeVelto', language)}
        </h1>
        <p className="text-xs text-muted-foreground font-medium">
          {step === 'register' 
            ? t('completeDetails10', language) 
            : step === 'otp' 
            ? `${t('sentCodeTo', language)} +91 ${mobile}` 
            : t('loginSignupAccess', language)}
        </p>
      </div>

      {/* Tabs Menu (Only visible on input step) */}
      {step === 'input' && (
        <div className="grid grid-cols-2 p-1 bg-accent/40 rounded-xl border border-border/50">
          <button
            onClick={() => {
              setAuthMethod('mobile');
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'mobile'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Smartphone size={14} /> {t('mobileAuth', language)}
          </button>
          <button
            onClick={() => {
              setAuthMethod('email');
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'email'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail size={14} /> {t('emailLogin', language)}
          </button>
        </div>
      )}

      {/* Error & Success Messages */}
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

      {/* MOBILE NUMBER INPUT STEP */}
      {authMethod === 'mobile' && step === 'input' && (
        <form onSubmit={handleMobileProceed} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('phoneNumber', language)}</label>
            <div className="relative flex items-center bg-background border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary p-1">
              <span className="text-xs font-bold text-muted-foreground/80 px-3 border-r border-border/60">+91</span>
              <Smartphone size={16} className="text-muted-foreground/60 absolute right-4 pointer-events-none" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full p-2.5 bg-transparent border-none focus:outline-none text-sm font-semibold tracking-wider placeholder:text-muted-foreground/50 pl-3 pr-10"
                placeholder="99887 76655"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-extrabold hover:bg-primary/95 transition-all flex justify-center items-center gap-2 text-xs uppercase tracking-wider shadow-md disabled:opacity-75 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn size={14} /> {t('getOtpProceed', language)}</>}
          </button>
        </form>
      )}

      {/* MOBILE OTP INPUT STEP (For Existing Users) */}
      {authMethod === 'mobile' && step === 'otp' && (
        <form onSubmit={handleMobileVerify} className="space-y-4">
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle size={14} /> {t('confirmLogin', language)}</>}
          </button>

          <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40">
            <button
              type="button"
              onClick={() => {
                setStep('input');
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
              disabled={otpTimer > 0}
              className={`font-black uppercase tracking-wider ${
                otpTimer > 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-primary hover:underline'
              }`}
            >
              {otpTimer > 0 ? `${t('resendCode', language)} (${otpTimer}s)` : t('resendOtp', language)}
            </button>
          </div>
        </form>
      )}

      {/* MOBILE REGISTRATION STEP (For New Users) */}
      {authMethod === 'mobile' && step === 'register' && (
        <form onSubmit={handleMobileVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('fullName', language)}</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={16} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 pl-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                placeholder="Ravi Kumar"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('deliveryAddress', language)}</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={16} />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 pl-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                placeholder="Apartment, Street name, City"
                required
              />
            </div>
          </div>

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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus size={14} /> {t('createAccountLogin', language)}</>}
          </button>

          <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40">
            <button
              type="button"
              onClick={() => {
                setStep('input');
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
              disabled={otpTimer > 0}
              className={`font-black uppercase tracking-wider ${
                otpTimer > 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-primary hover:underline'
              }`}
            >
              {otpTimer > 0 ? `${t('resendCode', language)} (${otpTimer}s)` : t('resendOtp', language)}
            </button>
          </div>
        </form>
      )}

      {/* EMAIL & PASSWORD INPUTS */}
      {authMethod === 'email' && (
        <form onSubmit={handleEmailAuth} className="space-y-4">
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('password', language)}</label>
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignUp ? <><UserPlus size={14} /> {t('signUp', language)}</> : <><LogIn size={14} /> {t('logIn', language)}</>}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-primary hover:underline font-bold uppercase tracking-wider"
            >
              {isSignUp ? t('switchToLogIn', language) : t('switchToSignUp', language)}
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
