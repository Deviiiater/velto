'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Scale, 
  Eye, 
  RefreshCcw, 
  Truck, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Search, 
  FileText, 
  Lock, 
  CreditCard, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface PolicyItem {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  href: string;
  category: string;
  tagline: string;
  desc: string;
  lastUpdated: string;
  keyPoints: string[];
  summarySections: {
    title: string;
    content: string;
  }[];
}

const POLICIES_DATA: PolicyItem[] = [
  {
    id: 'rules',
    name: 'Rules & Regulations',
    shortName: 'Rules',
    icon: Scale,
    href: '/rules',
    category: 'Operational Conduct',
    tagline: 'Code of conduct, campus delivery rules, and platform usage regulations.',
    desc: 'Mandatory guidelines for users, campus students, merchants, and riders to ensure safe 10-minute deliveries.',
    lastUpdated: 'January 2026',
    keyPoints: [
      'Zero tolerance for physical or verbal abuse of delivery riders or store staff.',
      'Mandatory gate/kiosk pickup for campus dorms and student hostels during curfew hours.',
      'Strict ban on illegal narcotics, hazardous goods, and unprescribed Schedule H/X drugs.',
      'Severe weather protocols: riders are never penalized for safety buffers during monsoons.',
      'Consecutive unsubstantiated COD rejections result in permanent disabling of Cash on Delivery.'
    ],
    summarySections: [
      {
        title: 'User Code of Conduct & Rider Welfare',
        content: 'Velto enforces a zero-abuse policy. Customers must treat delivery partners with dignity. Coercing riders to violate traffic laws, harsh communication, or refusal to pick up ordered parcels will lead to immediate account review and potential service restriction.'
      },
      {
        title: 'Hostel & Campus Delivery Framework',
        content: 'Between 11:00 PM and 6:00 AM, our fleet operates under Silent Night Drop protocols (no honking or doorbell ringing). Handover is executed at the main security barrier in accordance with university administration guidelines.'
      },
      {
        title: 'Fraud Prevention & Disciplinary Tiers',
        content: 'Abuse of promotional vouchers, bot automation, multi-account cloning, or coordinated refund fraud will trigger tiered sanctions from official warnings to permanent bans and reports to state cyber crime authorities.'
      }
    ]
  },
  {
    id: 'terms',
    name: 'Terms & Conditions',
    shortName: 'Terms',
    icon: FileText,
    href: '/terms',
    category: 'Legal Contract',
    tagline: 'User agreement, account rules, Razorpay payments, and governing law.',
    desc: 'The master binding legal agreement governing access to Velto web/PWA services, APIs, and commercial transactions.',
    lastUpdated: 'January 2026',
    keyPoints: [
      'Must be at least 18 years of age (or have guardian consent) to register and transact.',
      'All listed prices are in Indian Rupees (INR ₹) inclusive of applicable GST taxes.',
      'Digital payments processed via RBI-authorized Payment Aggregator Razorpay.',
      'Velto acts as an intermediary connecting buyers, registered merchants, and riders.',
      'Exclusive jurisdiction for legal disputes rests in Lucknow, Uttar Pradesh, India.'
    ],
    summarySections: [
      {
        title: 'Intermediary Marketplace Role',
        content: 'Velto operates an ultra-fast logistics and delivery marketplace connecting consumers with local partner dark stores and restaurant kitchens. Item quality and product warranty remain the direct responsibility of the respective manufacturer or merchant.'
      },
      {
        title: 'Razorpay Payment Gateway Terms',
        content: 'By placing an order via UPI, Cards, Net Banking, or Wallets, you authorize Razorpay Software Private Limited to charge your payment instrument. Raw banking credentials are never saved on Velto servers.'
      },
      {
        title: 'Governing Law & Jurisdiction',
        content: 'This agreement is constructed under the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020. Any unresolved disputes are subject to the exclusive jurisdiction of Lucknow courts.'
      }
    ]
  },
  {
    id: 'privacy',
    name: 'Privacy Policy',
    shortName: 'Privacy',
    icon: Eye,
    href: '/privacy',
    category: 'Data Protection',
    tagline: 'Data handling, DPDP Act 2023 compliance, and payment confidentiality.',
    desc: 'Comprehensive overview of telemetry, GPS coordinates, personal data storage, and tokenized payment security.',
    lastUpdated: 'January 2026',
    keyPoints: [
      'Strict adherence to India Digital Personal Data Protection (DPDP) Act, 2023.',
      'Precise GPS data is accessed exclusively for routing riders to your active delivery drop-off.',
      'No selling, leasing, or commercial brokering of customer personal data to third parties.',
      'Session tokens and authentication credentials secured via Supabase AES-256 encryption.',
      'Users have the right to request full erasure or export of their profile data anytime.'
    ],
    summarySections: [
      {
        title: 'Information Collected & Usage',
        content: 'We collect your name, phone number, saved delivery coordinates, order history, and device telemetry to facilitate 10-minute dispatch, fraud detection, and transactional SMS notifications.'
      },
      {
        title: 'Razorpay Payment Confidentiality',
        content: 'All financial checkout sessions are encrypted via 256-bit SSL directly with Razorpay. Velto retains only masked transaction tokens, order identifiers, and payment confirmation statuses.'
      },
      {
        title: 'Your Privacy Rights & Grievance Officer',
        content: 'You can update your personal data or request profile deletion by contacting our designated Grievance Officer at privacy@velto.delivery with guaranteed 24-hour turnaround.'
      }
    ]
  },
  {
    id: 'refund',
    name: 'Refund & Cancellation',
    shortName: 'Refunds',
    icon: RefreshCcw,
    href: '/refund',
    category: 'Customer Assurance',
    tagline: '5-7 business day Razorpay refund turnaround and cancellation criteria.',
    desc: 'Clear rules governing when orders can be cancelled, item return eligibility, and payment reversal timelines.',
    lastUpdated: 'January 2026',
    keyPoints: [
      '100% free cancellation before the dark store begins packing your basket.',
      'Non-cancellable once the rider departs to prevent perishable food waste.',
      'Approved refunds credited back to original source via Razorpay in 5-7 business days.',
      'Damaged or missing items must be reported with photographic proof within 2 hours.',
      'Instant wallet credit option available for immediate replacement re-orders.'
    ],
    summarySections: [
      {
        title: 'Cancellation Windows',
        content: 'Because orders are packed within 2 minutes of placement, cancellations can be initiated free of cost only while the status is "pending" or "accepted". Once "packing" or "out_for_delivery" begins, cancellations are locked.'
      },
      {
        title: 'Damaged or Expired Goods Replacement',
        content: 'If an item arrives damaged, leaking, or past its expiration date, submit a claim with photo verification via your Profile or Order Details. Our support desk approves valid claims within 15 minutes.'
      },
      {
        title: 'Razorpay Refund Turnaround (SLA)',
        content: 'Once approved, refunds are processed via the Razorpay API directly to your original payment method (UPI, Card, Net Banking). Bank processing typically reflects in your statement within 5 to 7 business days.'
      }
    ]
  },
  {
    id: 'shipping',
    name: 'Shipping & Delivery',
    shortName: 'Shipping',
    icon: Truck,
    href: '/shipping',
    category: 'Hyperlocal Logistics',
    tagline: '10-minute hyperlocal delivery promise, operational zones, and fees.',
    desc: 'How our micro-fulfillment dark stores and electric fleet achieve consistent ultra-fast deliveries.',
    lastUpdated: 'January 2026',
    keyPoints: [
      'Target delivery timeline: 10 to 20 minutes from checkout confirmation.',
      'Dark store clustering ensures rider travel distance is minimized to under 3 kilometers.',
      'Free delivery available on qualifying order amounts or with active One India Pass.',
      'Live GPS telemetry tracking available in-app with rider speed and arrival ETA.',
      'Temperature-shielded carry pods ensure hot meals stay hot and ice cream stays frozen.'
    ],
    summarySections: [
      {
        title: '10-Minute Hyperlocal Engine',
        content: 'Velto achieves speed through localized dark stores positioned within residential and campus clusters. Orders are auto-routed to the closest hub, packed in 90 seconds, and dispatched immediately.'
      },
      {
        title: 'Live Telemetry & Tracking',
        content: 'Once dispatched, customers can track their assigned delivery rider on a real-time interactive map showing battery health, vehicle movement, and accurate minute-by-minute ETAs.'
      },
      {
        title: 'Shipping Charges & Night Surcharges',
        content: 'Standard daytime delivery fees range between ₹15 to ₹25. Late-night deliveries (after 11 PM) or extreme rain surges may include a small fee directly transferred to rider hazard pay.'
      }
    ]
  },
  {
    id: 'contact',
    name: 'Contact & Grievance',
    shortName: 'Contact',
    icon: Phone,
    href: '/contact',
    category: 'Support & Redressal',
    tagline: '24x7 customer care helpline, registered office, and Grievance Officer.',
    desc: 'Reach out to our round-the-clock dispatch support team or file regulatory compliance tickets.',
    lastUpdated: 'January 2026',
    keyPoints: [
      '24x7 live order support via in-app tickets and phone helpline.',
      'Average response time: under 15 minutes for live active orders.',
      'Statutory Grievance Officer details published under Rule 3(11) of IT Rules, 2021.',
      'Operational headquarters in Lucknow, Uttar Pradesh, India.',
      'Dedicated escalations desk for payment issues and Razorpay transaction reconciliations.'
    ],
    summarySections: [
      {
        title: 'Customer Care & Live Orders',
        content: 'For immediate assistance regarding delayed orders, missing items, or delivery instructions, reach our dispatch team at support@velto.delivery or call our 24x7 helpline at +91 98765 43210.'
      },
      {
        title: 'Payment Reconciliations & Razorpay Support',
        content: 'If an amount was debited from your bank account without an order being generated, our payment desk auto-reconciles transactions with Razorpay every 60 minutes and processes immediate reversals.'
      },
      {
        title: 'Statutory Grievance Redressal Desk',
        content: 'For regulatory inquiries or complaints under Consumer Protection rules, contact our Grievance Officer at grievance@velto.delivery. Written acknowledgement is provided within 24 hours.'
      }
    ]
  }
];

export default function PoliciesHubPage() {
  const [activeTab, setActiveTab] = useState('rules');
  const [searchQuery, setSearchQuery] = useState('');

  const currentPolicy = POLICIES_DATA.find((p) => p.id === activeTab) || POLICIES_DATA[0];

  const filteredPolicies = POLICIES_DATA.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.keyPoints.some((pt) => pt.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors bg-card/60 border border-border/60 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" /> Razorpay Verified Compliance Hub
        </span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-gradient-to-br from-card via-card/85 to-primary/10 border border-border/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <BookOpen size={14} /> Legal, Rules &amp; Compliance Portal
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Velto Policy &amp; Regulatory Hub
        </h1>
        
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
          Complete, transparent documentation of our operational rules, customer code of conduct, data privacy commitments, and Razorpay-powered payment standards.
        </p>

        {/* Search Bar */}
        <div className="mt-6 pt-6 border-t border-border/60">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search policies, rules, refunds, Razorpay, or campus..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-background/80 border border-border/80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-mono"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          {POLICIES_DATA.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                <Icon size={14} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Active Tab Deep-Dive View */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Policy Tab Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              {(() => {
                const Icon = currentPolicy.icon;
                return <Icon size={24} />;
              })()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-foreground">
                  {currentPolicy.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase border border-primary/20">
                  {currentPolicy.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {currentPolicy.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href={currentPolicy.href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
            >
              <span>Read Full Document</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Key Highlights Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" /> Core Mandates &amp; Key Highlights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentPolicy.keyPoints.map((point, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/40 text-xs text-foreground"
              >
                <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary Sections */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
            <FileText size={14} className="text-primary" /> Clause Summaries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentPolicy.summarySections.map((sec, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <h4 className="font-bold text-foreground text-xs">
                    {sec.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {sec.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick Navigation Cards for All Policies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <BookOpen size={16} className="text-primary" /> Complete Policy Directory
          </h3>
          <span className="text-xs font-mono text-muted-foreground">
            {filteredPolicies.length} Policies Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolicies.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <div 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`border rounded-2xl p-5 space-y-3 transition-all cursor-pointer group flex flex-col justify-between ${
                  isCurrent 
                    ? 'bg-card border-primary ring-1 ring-primary/40 shadow-lg' 
                    : 'bg-card/70 border-border/80 hover:border-primary/50 hover:bg-card'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                    <Check size={12} /> Active Policy
                  </span>
                  <Link 
                    href={item.href}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Open Page <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Razorpay Trust Banner & Compliance Box */}
      <div className="bg-gradient-to-r from-card via-muted/40 to-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Lock size={12} /> RBI Authorized Gateway
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400 shrink-0" /> 
              Razorpay Secured Payment Architecture
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every digital transaction on Velto is processed directly through <strong>Razorpay Software Private Limited</strong>. With 256-bit AES encryption, multi-factor 3D Secure verification, and PCI-DSS Level 1 compliance, your financial instruments are strictly protected.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono font-bold">
              <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground">UPI 2.0</span>
              <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground">RuPay</span>
              <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground">Visa / MC</span>
              <span className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground">NetBanking</span>
            </div>
            <Link
              href="/contact"
              className="text-center px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md"
            >
              Contact Legal &amp; Compliance Desk
            </Link>
          </div>
        </div>

        {/* Regulatory Assurances Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60 text-center">
          <div className="p-3 rounded-xl bg-card/60 border border-border/40 space-y-1">
            <div className="text-[10px] uppercase font-mono text-muted-foreground">IT Rules 2021</div>
            <div className="text-xs font-bold text-foreground">Intermediary Compliant</div>
          </div>
          <div className="p-3 rounded-xl bg-card/60 border border-border/40 space-y-1">
            <div className="text-[10px] uppercase font-mono text-muted-foreground">Consumer Protection</div>
            <div className="text-xs font-bold text-foreground">E-Commerce Act 2020</div>
          </div>
          <div className="p-3 rounded-xl bg-card/60 border border-border/40 space-y-1">
            <div className="text-[10px] uppercase font-mono text-muted-foreground">Data Privacy</div>
            <div className="text-xs font-bold text-foreground">DPDP Act 2023</div>
          </div>
          <div className="p-3 rounded-xl bg-card/60 border border-border/40 space-y-1">
            <div className="text-[10px] uppercase font-mono text-muted-foreground">Food Safety</div>
            <div className="text-xs font-bold text-foreground">FSSAI Certified Hubs</div>
          </div>
        </div>

      </div>

    </div>
  );
}
