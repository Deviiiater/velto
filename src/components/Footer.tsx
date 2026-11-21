'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Lock, CreditCard, Sparkles, HeartHandshake, PhoneCall } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide footer in admin/rider/vendor operational panels
  if (
    pathname.includes('/store-panel') || 
    pathname.includes('/rider-panel') || 
    pathname.includes('/kitchen') || 
    pathname.includes('/admin') ||
    pathname.includes('/warehouse') ||
    pathname.includes('/support-panel')
  ) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-[#070B14] text-zinc-400 text-xs mt-auto relative z-10 pt-12 pb-32 sm:pb-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Grid: Brand & Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand & Mission Column (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <img src="/logo.png" alt="Velto Logo" className="h-9 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white tracking-tight">Velto</span>
                <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">Instant Hyperlocal OS</span>
              </div>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              India&apos;s AI-powered hyperlocal delivery super app. Delivering fresh groceries, prepared gourmet meals, late-night campus food, and emergency OTC essentials to your doorstep in 10 minutes.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active 10-Min Zones
              </span>
              <span>•</span>
              <span>Lucknow & Selected Hubs</span>
            </div>
          </div>

          {/* Legal & Compliance Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" /> Legal & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/rules" className="hover:text-white transition-colors flex items-center gap-1 text-primary font-semibold">
                  <span>Rules &amp; Regulations</span>
                  <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.2 rounded font-mono">NEW</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white transition-colors">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-white transition-colors">
                  All Policies Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
              <PhoneCall size={14} className="text-primary" /> Customer Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us & Helpdesk
                </Link>
              </li>
              <li>
                <a href="mailto:support@velto.delivery" className="hover:text-white transition-colors font-mono">
                  support@velto.delivery
                </a>
              </li>
              <li>
                <a href="tel:+919876543210" className="hover:text-white transition-colors font-mono">
                  +91 98765 43210
                </a>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  My Orders & Refunds
                </Link>
              </li>
              <li className="text-[11px] text-zinc-500 pt-1">
                24x7 Order Support Dispatch
              </li>
            </ul>
          </div>

          {/* Partner Consoles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary" /> Partner Consoles
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/kitchen" className="hover:text-white transition-colors">
                  Chef &amp; Kitchen Portal
                </Link>
              </li>
              <li>
                <Link href="/store-panel" className="hover:text-white transition-colors">
                  Store Manager
                </Link>
              </li>
              <li>
                <Link href="/rider-panel" className="hover:text-white transition-colors">
                  Delivery Fleet
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin Control Room
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Razorpay Trust Banner & Compliance Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                <span>100% Secure Payments via Razorpay</span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                  RBI Authorized
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                End-to-end 256-bit SSL encrypted. Supports UPI, Cards, Net Banking &amp; Wallets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center text-[10px] font-mono font-bold text-zinc-400">
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">UPI</span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">RUPAY</span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">VISA</span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">MASTERCARD</span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">NET BANKING</span>
          </div>
        </div>

        {/* Copyright and Legal Entity Details */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-zinc-500">
          <div>
            &copy; 2026 Velto Technologies / Velto Platform. All rights reserved. Registered in Lucknow, UP, India.
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/rules" className="hover:text-white transition-colors">Rules</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/refund" className="hover:text-white transition-colors">Refunds</Link>
            <span>•</span>
            <Link href="/shipping" className="hover:text-white transition-colors">Shipping</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition-colors">Grievance</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
