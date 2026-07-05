'use client';
import { useState, useEffect } from 'react';
import { getPortalSupabase, supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { ShieldAlert, LogIn, Lock, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

type StaffAuthGuardProps = {
  allowedRoles: ('admin' | 'rider' | 'warehouse' | 'kitchen' | 'vendor')[];
  portalName: string;
  portalIcon: React.ReactNode;
  portalId: 'admin' | 'rider' | 'warehouse' | 'kitchen' | 'vendor';
  children: React.ReactNode;
};

export default function StaffAuthGuard({ 
  allowedRoles, 
  portalName, 
  portalIcon, 
  portalId,
  children 
}: StaffAuthGuardProps) {
  const client = getPortalSupabase(portalId as any);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userRole, setUserRole] = useState<'customer' | 'rider' | 'admin' | 'warehouse' | 'kitchen' | 'vendor' | null>(null);
  
  // Login & Registration Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'vendor',
            full_name: storeName
          }
        }
      });
      if (error) throw error;
      
      // Clear skip-sync flag upon successful registration
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`velto-skip-sync-${portalId}`);
      }
      
      alert("Vendor registered successfully! You are now logged in.");
      setIsRegistering(false);
    } catch (err: any) {
      setLoginError(err.message || 'Registration failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const allowedRolesKey = allowedRoles.join(',');

  // Subscribe to portal-specific auth state
  useEffect(() => {
    // Only show verifying clearances spinner on first mount when session is unchecked
    if (!user) {
      setAuthLoading(true);
    }
    
    // Check initial session with catch handler to prevent hangs
    client.auth.getSession().then(async (res: any) => {
      let session = res.data?.session;
      
      // Auto-sync global session if portal session is empty AND skip-sync is not active
      const skipSync = typeof window !== 'undefined' && sessionStorage.getItem(`velto-skip-sync-${portalId}`) === 'true';
      if (!session && !skipSync) {
        try {
          const { data: { session: globalSession } } = await supabase.auth.getSession();
          if (globalSession) {
            const { data: profile } = await supabase
              .from('users')
              .select('role')
              .eq('id', globalSession.user.id)
              .single();
              
            if (profile && allowedRoles.includes(profile.role as any)) {
              try {
                const { data: syncRes, error: syncError } = await client.auth.setSession({
                  access_token: globalSession.access_token,
                  refresh_token: globalSession.refresh_token || ''
                });
                if (!syncError && syncRes) {
                  session = syncRes.session;
                }
              } catch (innerErr) {
                // Silently skip auth sync if token is expired/invalid
              }
            }
          }
        } catch (err) {
          console.error("Failed to auto-sync global session to portal:", err);
        }
      }
      
      setUser(session?.user ?? null);
      setAuthLoading(false);
    }).catch((err: any) => {
      console.error("Error checking initial staff session:", err);
      setAuthLoading(false);
    });

    // Listen for auth state changes on the portal-specific client
    const { data: { subscription } } = client.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [client, allowedRolesKey, portalId]);

  const fetchUserProfile = async (uid: string) => {
    // Create a 3s timeout promise to guarantee UI never gets stuck
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn("Profile query timed out. Graceful recovery activated.");
        resolve(null);
      }, 3000);
    });

    try {
      // Race the profile database fetch against the safety timeout
      const profileData = await Promise.race([
        (async () => {
          // 1. Try portal client first (authenticated as the user, guaranteed RLS compliance!)
          try {
            const { data, error } = await client
              .from('users')
              .select('role')
              .eq('id', uid)
              .single();
            if (!error && data) {
              console.log("Profile fetched successfully from portal client:", data);
              return data;
            }
          } catch (err) {
            console.warn("Portal client profile fetch failed:", err);
          }

          // 2. Try global client as a fallback
          try {
            const { data, error } = await supabase
              .from('users')
              .select('role')
              .eq('id', uid)
              .single();
            if (!error && data) {
              console.log("Profile fetched successfully from global client:", data);
              return data;
            }
          } catch (err) {
            console.warn("Global client profile fetch failed:", err);
          }
          return null;
        })(),
        timeoutPromise
      ]);

      // 3. Resolve user role with database value, falling back to token metadata role, then defaulting to 'customer'
      const finalRole = profileData?.role || user?.user_metadata?.role || user?.app_metadata?.role || 'customer';
      console.log("Determined user role:", finalRole);
      setUserRole(finalRole);
    } catch (e) {
      console.error('Error fetching staff profile:', e);
      // Fail-safe to token metadata role
      setUserRole(user?.user_metadata?.role || 'customer');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      fetchUserProfile(user.id);
    } else {
      setUserRole(null);
      setProfileLoading(false);
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Clear skip-sync flag upon successful direct login!
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`velto-skip-sync-${portalId}`);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`velto-skip-sync-${portalId}`, 'true');
    }
    await client.auth.signOut();
    setUserRole(null);
    setUser(null);
  };

  // 1. Root Authentication / Profile Loading state
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Verifying security clearances...</p>
      </div>
    );
  }

  // 2. Unauthenticated / Unauthorized states: Render dynamic login portal styled for this panel!
  const hasAccess = userRole && allowedRoles.includes(userRole as any);
  if (!user || !hasAccess) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-card border border-border/80 rounded-2xl shadow-xl space-y-8 relative overflow-hidden">
        {/* Glow backdrop decorative layer */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>

        <div className="text-center space-y-3 relative z-10">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            {portalIcon}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center justify-center gap-1.5 text-foreground">
              {isRegistering ? "Register Vendor Store" : portalName}
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-1.5">
              {isRegistering ? "Create your merchant store account on Velto" : "Secure staff node authorization required. Please authenticate."}
            </p>
          </div>
        </div>

        {/* Informative warning if user is logged into the wrong role */}
        {user && !hasAccess && !isRegistering && (
          <div className="p-3.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-semibold text-center leading-relaxed relative z-10">
            ⚠️ Authenticated as <strong className="uppercase">{userRole}</strong>.<br />
            Please sign in with a <strong className="uppercase text-foreground">{allowedRoles.join('/')}</strong> account to access this panel.
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4 relative z-10">
          {loginError && (
            <div className="p-3.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-semibold text-center leading-relaxed">
              ⚠️ {loginError}
            </div>
          )}
          
          {isRegistering && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Store / Brand Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                placeholder="e.g. Burger Point"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
              placeholder="name@velto.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-extrabold hover:bg-primary/90 transition-all flex justify-center items-center gap-2 text-sm shadow-md disabled:opacity-70 mt-6 cursor-pointer"
          >
            {loginLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegistering ? (
              <><Sparkles size={16} /> Register Store</>
            ) : (
              <><LogIn size={16} /> Authenticate Session</>
            )}
          </button>
        </form>

        <div className="flex flex-col gap-2.5 text-center relative z-10 border-t border-border/50 pt-4">
          {portalId === 'vendor' && (
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setLoginError(null);
              }}
              className="text-xs text-primary hover:underline transition-all font-bold uppercase tracking-wider cursor-pointer"
            >
              {isRegistering ? "Already have a store? Login" : "Don't have a store? Register Store"}
            </button>
          )}

          {user && !isRegistering && (
            <button 
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors font-bold uppercase tracking-wider cursor-pointer"
            >
              <Lock size={12} /> Sign Out of {userRole?.toUpperCase()} Session
            </button>
          )}
          <Link href="/" className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
            <ArrowLeft size={14} /> Back to Customer Store
          </Link>
        </div>
      </div>
    );
  }

  // 4. Authorized state: render the dashboard page
  return <>{children}</>;
}
