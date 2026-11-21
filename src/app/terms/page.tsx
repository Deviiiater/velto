import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, ExternalLink, Scale, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Velto Instant Delivery',
  description: 'Read the Terms and Conditions for using Velto Platform and services.',
};

export default function TermsPage() {
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
          Effective Date: January 1, 2026
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-card via-card/80 to-primary/5 border border-border/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <Scale size={14} /> Legal & Regulatory Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Terms & Conditions
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
          Welcome to <strong className="text-foreground">Velto Platform</strong> (&quot;Velto&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms and Conditions govern your access to and use of the Velto website, progressive web app, APIs, and 10-minute on-demand hyperlocal delivery services.
        </p>
        
        {/* Quick Jump Links */}
        <div className="mt-6 pt-6 border-t border-border/60 flex flex-wrap gap-2 text-xs">
          <a href="#acceptance" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">1. Acceptance</a>
          <a href="#services" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">2. Services</a>
          <a href="#accounts" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">3. Accounts</a>
          <a href="#pricing-payments" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">4. Payments & Razorpay</a>
          <a href="#cancellation" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">5. Cancellations</a>
          <a href="#liability" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">6. Liability</a>
          <a href="#jurisdiction" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">7. Governing Law</a>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
        
        {/* Section 1 */}
        <section id="acceptance" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">01.</span> Acceptance of Terms
          </h2>
          <p>
            By accessing or using the Velto application, browsing products, creating an account, or placing an order, you agree to be bound by these Terms and Conditions, our <Link href="/privacy" className="text-primary underline underline-offset-4 font-semibold">Privacy Policy</Link>, and our <Link href="/refund" className="text-primary underline underline-offset-4 font-semibold">Refund & Cancellation Policy</Link>.
          </p>
          <p>
            If you do not agree with any portion of these terms, please immediately discontinue use of the platform. You must be at least 18 years of age, or have the consent of a parent/legal guardian, to create an account and transact on Velto.
          </p>
        </section>

        {/* Section 2 */}
        <section id="services" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">02.</span> Scope of Services
          </h2>
          <p>
            Velto operates an intelligent hyperlocal operating system and marketplace facilitating the ultra-fast delivery (targeted within 10 to 20 minutes) of fresh groceries, prepared meals, emergency medicines, dairy, hostel/student budget meals, and daily essentials sourced through authorized dark stores, merchant partner kitchens, and local vendors.
          </p>
          <p>
            Velto acts as a technology intermediary connecting customers, registered local merchants, and independent delivery partners. All products are subject to stock availability in the specific delivery cluster or pin code assigned to your GPS location.
          </p>
        </section>

        {/* Section 3 */}
        <section id="accounts" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">03.</span> User Accounts & Security
          </h2>
          <p>
            To use certain features, including saving delivery addresses, managing cart polls, and earning reward points, you must sign in via Supabase Authentication (email or verified phone OTP). You are responsible for:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground">
            <li>Maintaining the confidentiality of your login credentials and OTPs.</li>
            <li>Providing accurate, current, and complete delivery address details and contact numbers.</li>
            <li>All activities and purchases that occur under your user profile.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="pricing-payments" className="bg-card border border-border/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-sm">04.</span> Pricing, Billing & Payment Processing
            </h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock size={12} /> Razorpay Secured 256-Bit SSL
            </span>
          </div>
          <p>
            All prices displayed on the Velto app are in <strong>Indian Rupees (INR ₹)</strong> and are inclusive of applicable Goods and Services Tax (GST), packaging charges, and standard delivery fees unless specifically itemized at checkout.
          </p>
          
          <div className="bg-muted/40 border border-border/60 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" /> Razorpay Payment Gateway Integration
            </h3>
            <p className="text-xs sm:text-sm">
              Online digital payments on Velto are processed securely via <strong>Razorpay Software Private Limited</strong> (&quot;Razorpay&quot;), a Reserve Bank of India (RBI) authorized Payment Aggregator. Velto does not store or process raw credit/debit card numbers, CVVs, or bank net-banking passwords on our servers.
            </p>
            <p className="text-xs sm:text-sm">
              We support multiple secure payment instruments:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-card border border-border text-foreground font-medium">Unified Payments Interface (UPI)</span>
              <span className="px-2.5 py-1 rounded-md bg-card border border-border text-foreground font-medium">Credit & Debit Cards (Visa, MasterCard, RuPay)</span>
              <span className="px-2.5 py-1 rounded-md bg-card border border-border text-foreground font-medium">Net Banking (50+ Indian Banks)</span>
              <span className="px-2.5 py-1 rounded-md bg-card border border-border text-foreground font-medium">Digital Wallets & Cash on Delivery (COD)</span>
            </div>
          </div>

          <p>
            By initiating an online transaction, you authorize Razorpay and our banking partners to charge your designated payment instrument. If your payment is debited but the order does not confirm due to network interruption, Razorpay will automatically reverse the transaction according to standard banking reconciliation windows (typically 24 to 48 banking hours).
          </p>
        </section>

        {/* Section 5 */}
        <section id="cancellation" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">05.</span> Order Acceptance & Cancellation
          </h2>
          <p>
            Because Velto operates an ultra-fast 10-minute dispatch pipeline, order packaging begins almost instantaneously after payment confirmation:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Before Packing:</strong> You may cancel an order free of charge before the dark store or partner kitchen accepts and begins packing your items.</li>
            <li><strong>After Dispatch:</strong> Once a rider is assigned and the order is out for delivery, cancellations are restricted to avoid perishable food waste.</li>
            <li><strong>Merchant Stockouts:</strong> If an ordered item is unavailable, Velto will issue an instant partial or full refund for the unavailable items.</li>
          </ul>
          <p>
            For full details on claim timelines and refund processing, please review our detailed <Link href="/refund" className="text-primary underline underline-offset-4 font-semibold">Refund & Cancellation Policy</Link>.
          </p>
        </section>

        {/* Section 6 */}
        <section id="liability" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">06.</span> Disclaimers & Limitation of Liability
          </h2>
          <p>
            Velto strives to fulfill every delivery within estimated timeframes. However, delivery estimates may be impacted by extreme meteorological events (heavy monsoon rain, fog), roadblocks, public holidays, or unforeseen vehicular breakdowns.
          </p>
          <p>
            Velto disclaims liability for any indirect, incidental, or consequential damages arising out of merchant product manufacturing defects, manufacturer packaging defects, or consumer allergies. Always check manufacturer ingredient labels on packaged foods and medications. In all cases, Velto&apos;s total aggregate liability is limited to the transaction amount paid for the specific order.
          </p>
        </section>

        {/* Section 7 */}
        <section id="jurisdiction" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">07.</span> Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of the <strong>Republic of India</strong>, including the Information Technology Act, 2000, and the Consumer Protection (E-Commerce) Rules, 2020.
          </p>
          <p>
            Any dispute, controversy, or claim arising out of or relating to these terms or transactions on Velto shall be subject to the exclusive jurisdiction of the competent courts in <strong>Lucknow, Uttar Pradesh, India</strong>.
          </p>
        </section>

        {/* Section 8 */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">08.</span> Contact Us & Grievance Redressal
          </h2>
          <p>
            If you have questions regarding these Terms or need to report any compliance grievances:
          </p>
          <div className="bg-muted/40 rounded-xl p-4 text-xs sm:text-sm space-y-1.5 font-mono">
            <div><strong className="text-foreground">Entity:</strong> Velto Technologies / Velto Platform</div>
            <div><strong className="text-foreground">Email:</strong> <a href="mailto:support@velto.delivery" className="text-primary hover:underline">support@velto.delivery</a></div>
            <div><strong className="text-foreground">Operational Hub:</strong> Lucknow, Uttar Pradesh 226010, India</div>
            <div><strong className="text-foreground">Grievance Officer:</strong> Grievance Redressal Desk, Velto Platform</div>
          </div>
          <div className="pt-2">
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              Visit Contact & Grievance Redressal Page <ExternalLink size={12} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
