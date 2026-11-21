import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck, Lock, Eye, Database, UserCheck, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Velto Instant Delivery',
  description: 'Learn how Velto protects your personal data, handles payments via Razorpay, and complies with privacy regulations.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors bg-card/60 border border-border/60 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Last Updated: January 1, 2026
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-card via-card/80 to-purple-500/5 border border-border/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Eye size={14} /> Data Privacy & Protection
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
          At <strong className="text-foreground">Velto Platform</strong> (&quot;Velto&quot;, &quot;we&quot;, &quot;us&quot;), protecting your privacy and personal data is a foundational engineering priority. This Privacy Policy details how we collect, process, store, and safeguard your information across our hyperlocal delivery network.
        </p>

        {/* Quick Links */}
        <div className="mt-6 pt-6 border-t border-border/60 flex flex-wrap gap-2 text-xs">
          <a href="#data-collected" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">1. Data Collected</a>
          <a href="#payment-data" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">2. Razorpay & Payments</a>
          <a href="#data-usage" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">3. How We Use Data</a>
          <a href="#data-sharing" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">4. Third-Party Sharing</a>
          <a href="#user-rights" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">5. Your Data Rights</a>
          <a href="#grievance" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">6. Grievance Officer</a>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
        
        {/* Section 1 */}
        <section id="data-collected" className="bg-card border border-border/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">01.</span> Information We Collect
          </h2>
          <p>
            When you browse, register, or order on Velto, we collect necessary telemetry and identifying data to fulfill instant deliveries:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <UserCheck size={14} className="text-primary" /> Profile & Identity
              </h3>
              <p className="text-xs">
                Full name, email address, mobile phone number, and authenticated session tokens managed securely via Supabase.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <Database size={14} className="text-primary" /> Location & Geodata
              </h3>
              <p className="text-xs">
                Accurate GPS coordinates, landmark details, room/hostel numbers, and delivery pin codes used to assign the nearest dark store & dispatch riders.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={14} className="text-primary" /> Order Records
              </h3>
              <p className="text-xs">
                Purchased food/grocery items, delivery notes, dietary preferences, order timestamps, and refund/support ticket history.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <Lock size={14} className="text-primary" /> Device Telemetry
              </h3>
              <p className="text-xs">
                PWA installation state, browser version, operating system, and push notification tokens for live order dispatch updates.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 - Razorpay & Payment Security */}
        <section id="payment-data" className="bg-card border border-border/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-sm">02.</span> Payment Data & Razorpay Security
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
              <Lock size={12} /> PCI-DSS Compliant
            </span>
          </div>
          <p>
            Velto partners with <strong>Razorpay Software Private Limited</strong> (&quot;Razorpay&quot;) to manage end-to-end digital transaction checkout. Your financial data security is handled under the highest global standards:
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2 text-xs sm:text-sm">
            <div className="font-bold text-foreground flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" /> What Velto NEVER Stores:
            </div>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
              <li>We <strong>NEVER</strong> record or store full 16-digit debit/credit card numbers.</li>
              <li>We <strong>NEVER</strong> record Card Verification Values (CVV/CVC).</li>
              <li>We <strong>NEVER</strong> store bank netbanking passwords, UPI MPINs, or ATM PINs.</li>
            </ul>
            <p className="text-muted-foreground pt-1">
              All payment submissions occur within Razorpay&apos;s encrypted tokenized iframe or UPI SDK. Velto only receives and stores merchant transaction confirmation identifiers (such as <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">razorpay_order_id</code>, <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">razorpay_payment_id</code>) to verify order settlement and process refunds.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="data-usage" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">03.</span> How We Utilize Your Data
          </h2>
          <p>We process your data strictly for legitimate operational purposes:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>10-Minute Fulfillment:</strong> Transmitting delivery addresses and cart requirements to nearest dark-store pickers and assigned fleet riders.</li>
            <li><strong>Live Tracking & Notifications:</strong> Streaming real-time rider GPS coordinates and dispatch milestone alerts.</li>
            <li><strong>Customer Support & Refunds:</strong> Investigating order discrepancies, damaged items, and processing automated Razorpay refund reconciliations.</li>
            <li><strong>Safety & Fraud Prevention:</strong> Preventing malicious bot traffic, duplicate coupon abuse, and verifying valid delivery handovers.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="data-sharing" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">04.</span> Third-Party Service Providers
          </h2>
          <p>
            We do not sell, rent, or trade your personal data. We share only strictly necessary information with trusted partners under strict confidentiality:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>Assigned Delivery Fleet:</strong> Riders receive your first name, phone number, and delivery address to navigate and hand over your items.</li>
            <li><strong>Payment Aggregator (Razorpay):</strong> Transaction totals and order identifiers are shared to initialize checkout and verify settlements.</li>
            <li><strong>Database & Infrastructure (Supabase & Vercel):</strong> Cloud databases encrypted at rest using AES-256 and SSL/TLS in transit.</li>
            <li><strong>Law Enforcement:</strong> Disclosed only when strictly required by applicable Indian laws, court orders, or statutory regulatory directives.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="user-rights" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">05.</span> Your Rights & Data Retention
          </h2>
          <p>
            Under Indian data protection laws, you retain clear rights regarding your personal information:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Access & Correction:</strong> Review or update your profile details and saved delivery addresses at any time via your <Link href="/profile" className="text-primary underline">Profile Page</Link>.</li>
            <li><strong>Account Deletion:</strong> You may request complete erasure of your profile and history by emailing <a href="mailto:support@velto.delivery" className="text-primary hover:underline">support@velto.delivery</a> with the subject &quot;Data Erasure Request&quot;.</li>
            <li><strong>Retention:</strong> Financial transaction identifiers and invoices are retained for the statutory period mandated by Indian tax and GST authorities.</li>
          </ul>
        </section>

        {/* Section 6 - Grievance Redressal */}
        <section id="grievance" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">06.</span> Grievance Redressal Officer
          </h2>
          <p>
            In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the designated Grievance Officer for Velto is:
          </p>
          <div className="bg-muted/40 rounded-xl p-4 text-xs sm:text-sm space-y-1 font-mono">
            <div><strong className="text-foreground">Designation:</strong> Grievance Redressal Officer, Data Protection Desk</div>
            <div><strong className="text-foreground">Entity:</strong> Velto Technologies / Velto Platform</div>
            <div><strong className="text-foreground">Email:</strong> <a href="mailto:grievance@velto.delivery" className="text-primary hover:underline">grievance@velto.delivery</a> (copy to <a href="mailto:support@velto.delivery" className="text-primary hover:underline">support@velto.delivery</a>)</div>
            <div><strong className="text-foreground">Physical Office:</strong> Gomti Nagar / Hazratganj, Lucknow, Uttar Pradesh 226010, India</div>
            <div><strong className="text-foreground">Turnaround Time:</strong> Acknowledgment within 48 hours; resolution within 30 days.</div>
          </div>
          <div className="pt-2">
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              Visit Contact Us Page <ExternalLink size={12} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
