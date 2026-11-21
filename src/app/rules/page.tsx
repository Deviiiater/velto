import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldAlert, 
  ShieldCheck, 
  Scale, 
  UserX, 
  Bike, 
  Clock, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Lock, 
  Sparkles, 
  ExternalLink,
  Ban,
  ShoppingBag,
  HeartHandshake
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rules & Regulations - Velto Instant Delivery OS',
  description: 'Official Code of Conduct, Campus Delivery Rules, Fair Usage Policies, and Platform Regulations for Velto users, merchants, and riders.',
};

export default function RulesAndRegulationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors bg-card/60 border border-border/60 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Version 2.4 • Effective January 2026
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-card via-card/85 to-primary/10 border border-border/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <Scale size={14} /> Platform Code of Conduct
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Rules &amp; Regulations
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
          To ensure lightning-fast 10-minute deliveries, safety for our rider fleet, and uncompromising product hygiene, all <strong className="text-foreground">Velto</strong> users, merchants, and partners agree to adhere to these operational and legal regulations.
        </p>

        {/* Quick Jump Bar */}
        <div className="mt-6 pt-6 border-t border-border/60 flex flex-wrap gap-2 text-xs">
          <a href="#code-of-conduct" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">1. Code of Conduct</a>
          <a href="#ordering-rules" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">2. Account &amp; Ordering</a>
          <a href="#campus-rules" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">3. Campus &amp; Hostels</a>
          <a href="#prohibited-items" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">4. Prohibited Items</a>
          <a href="#rider-safety" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">5. Rider Safety</a>
          <a href="#cancellation-rules" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">6. Cancellations &amp; Fraud</a>
          <a href="#discounts-abuse" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">7. Coupons &amp; Passes</a>
          <a href="#penalties" className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">8. Violations &amp; Bans</a>
        </div>
      </div>

      {/* Key Guarantees Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <HeartHandshake size={20} />
          </div>
          <h3 className="font-bold text-foreground text-sm">Mutual Respect</h3>
          <p className="text-xs text-muted-foreground">
            Zero-tolerance for verbal or physical abuse directed towards delivery partners, chefs, or dispatch staff.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Bike size={20} />
          </div>
          <h3 className="font-bold text-foreground text-sm">Safe Fleet Operations</h3>
          <p className="text-xs text-muted-foreground">
            Speed targets are governed by algorithms with safety buffers; riders are never penalized for weather delays.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-foreground text-sm">FSSAI &amp; RBI Compliance</h3>
          <p className="text-xs text-muted-foreground">
            Strict adherence to Indian food hygiene standards and Razorpay 256-bit encrypted checkout workflows.
          </p>
        </div>
      </div>

      {/* Main Sections */}
      <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
        
        {/* Section 1 */}
        <section id="code-of-conduct" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">01.</span> User Code of Conduct &amp; Zero Abuse Policy
          </h2>
          <p>
            Velto is dedicated to fostering a supportive, safe, and professional environment for customers, dark-store workers, kitchen partners, and fleet riders. By accessing or using the platform, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>Treat Delivery Riders with Dignity:</strong> Riders brave traffic, extreme temperatures, and heavy monsoons. Harassment, condescension, discriminatory remarks, or physical intimidation will result in immediate and permanent account deactivation.</li>
            <li><strong>Fair Communication:</strong> When contacting customer support or rider partners via in-app calls, communicate courteously. Obscene language or abusive messages are automatically flagged by AI moderation.</li>
            <li><strong>Accurate Delivery Instructions:</strong> Provide honest gate numbers, building blocks, and pin codes to prevent rider search delays.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section id="ordering-rules" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">02.</span> Account Ownership &amp; Ordering Rules
          </h2>
          <p>
            To preserve inventory integrity and prevent bot exploitation of promotional flash-sales:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" /> One Account Per Person
              </h3>
              <p className="text-xs">
                Each user profile must be tied to a verified mobile number and email. Running bot farms or automated scrapers will result in instant IP bans.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} className="text-primary" /> Realistic Dispatch Windows
              </h3>
              <p className="text-xs">
                10 to 20 minute targets apply within designated active dark store geo-fences. Orders placed outside cluster boundaries will reflect extended ETAs.
              </p>
            </div>
          </div>
          <p className="pt-2">
            Customers must be available at their registered phone number once the rider reaches the delivery perimeter. If a customer is unreachable for more than 8 minutes after arrival, the order may be marked as failed without a refund for perishable foods.
          </p>
        </section>

        {/* Section 3 */}
        <section id="campus-rules" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">03.</span> Campus, Hostel &amp; Late-Night Delivery Regulations
          </h2>
          <p>
            Velto operates specialized late-night canteens and student budget drops across university campuses and coaching hostels:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>Main Gate Handover:</strong> Due to campus security protocols, riders cannot enter restricted hostel dorm corridors or private residential wings unless institutional security passes are explicitly approved. Customers must collect parcels at the designated gate or security kiosk.</li>
            <li><strong>Curfew Compliance:</strong> Orders scheduled during campus lock-in hours must have prior clearance with campus security guards. Velto is not responsible for confiscated food if customers violate their institution’s curfew.</li>
            <li><strong>Silent Night Drops:</strong> Between 11:00 PM and 6:00 AM, riders will not honk or ring doorbells. Arrival alerts will be transmitted exclusively via silent PWA push notifications and SMS.</li>
            <li><strong>Shared Group Carts:</strong> Group cart sessions allow friends to pool items into one delivery. All members in a group cart are jointly responsible for clearing the order total upon arrival.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="prohibited-items" className="bg-card border border-border/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-sm">04.</span> Prohibited Goods &amp; Pharmacy Regulations
            </h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <Ban size={12} /> Strictly Regulated
            </span>
          </div>
          <p>
            Velto strictly complies with statutory Indian trade restrictions and central licensing guidelines:
          </p>
          
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-destructive text-sm flex items-center gap-2">
              <AlertTriangle size={16} /> Absolute Prohibitions
            </h3>
            <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 text-muted-foreground">
              <li>No illicit narcotics, psychotropic substances, or prohibited intoxicants.</li>
              <li>No tobacco, cigarettes, vape devices, or alcoholic beverages without state-specific digital excise permits.</li>
              <li>No firearms, ammunition, pyrotechnics, toxic chemicals, or flammable fuels.</li>
            </ul>
          </div>

          <p>
            <strong>Prescription Medications (Schedule H &amp; X):</strong> Over-the-counter (OTC) health items (bandages, paracetamol, digestive aids) can be ordered freely. For restricted medications, users must upload a valid, stamped medical prescription from a registered practitioner before delivery can be dispatched.
          </p>
        </section>

        {/* Section 5 */}
        <section id="rider-safety" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">05.</span> Rider Safety &amp; Severe Weather Protocols
          </h2>
          <p>
            The physical safety and dignity of our delivery champions comes before speed. We enforce the following rules:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>No Coerced Speeding:</strong> Customers must never prompt or incentivize riders to break traffic lights, drive rashly, or violate highway regulations. Our speed algorithms dynamically reward defensive driving.</li>
            <li><strong>Severe Monsoon &amp; Heatwave Buffers:</strong> During torrential rainstorms, lightning alerts, flooding, or severe heat waves, delivery SLAs are automatically extended by 15–30 minutes to protect riders. Cancellation penalties during meteorological emergencies are waived.</li>
            <li><strong>Contactless Handover:</strong> Riders have the right to request contactless doorstep drop-offs if a residence displays contagious illness quarantine notices.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="cancellation-rules" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">06.</span> Cancellations, Return Fraud &amp; COD Abuse
          </h2>
          <p>
            Because prepared meals and fresh items cannot be re-shelved once dispatched:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>Cancellation Window:</strong> Free cancellation is guaranteed within <strong>60 seconds</strong> of placing the order, or up until the dark store starts packing. Once out for delivery, cancellations are prohibited.</li>
            <li><strong>Cash on Delivery (COD) Threshold:</strong> Rejecting COD orders at the doorstep without a verified quality defect wastes food and fuel. Accounts with two consecutive unsubstantiated COD refusals will have the Cash on Delivery payment option permanently disabled.</li>
            <li><strong>Refund Inspection:</strong> Claims regarding damaged, spoiled, or missing goods require a clear photograph or unboxing video submitted via our <Link href="/profile" className="text-primary underline underline-offset-4 font-semibold">Refund Portal</Link> within 2 hours of delivery.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section id="discounts-abuse" className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">07.</span> Promotional Codes, Student Passes &amp; Referral Fair Use
          </h2>
          <p>
            Velto provides community incentives, such as the <strong>One India Pass</strong> and campus meal deals:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Coupons and welcome credits are non-transferable, cannot be redeemed for fiat cash, and have a one-time validity per household.</li>
            <li>Creating multiple dummy accounts, using virtual disposable SIM cards, or spoofing device IDs to stack referral rewards is classified as commercial fraud.</li>
            <li>Velto reserves the right to claw back illegitimately obtained wallet balances and revoke One India Pass benefits without prior notification.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section id="penalties" className="bg-card border border-border/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">08.</span> Enforcement, Disciplinary Actions &amp; Account Bans
          </h2>
          <p>
            Violations of these Rules &amp; Regulations are handled in a structured, transparent manner:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold text-xs uppercase shrink-0">Level 1</span>
              <div>
                <strong className="text-foreground">Official Warning:</strong> Issued for minor infractions, unjustified COD cancellations, or inaccurate gate instructions.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs sm:text-sm">
              <span className="px-2 py-0.5 rounded bg-purple-500 text-white font-bold text-xs uppercase shrink-0">Level 2</span>
              <div>
                <strong className="text-foreground">Service Restriction:</strong> Revocation of Cash on Delivery, suspension of promotion vouchers, or 14-day account cooldown.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs sm:text-sm">
              <span className="px-2 py-0.5 rounded bg-destructive text-white font-bold text-xs uppercase shrink-0">Level 3</span>
              <div>
                <strong className="text-foreground">Permanent Ban &amp; Legal Referral:</strong> Immediate termination for rider violence, fraudulent refund rings, narcotic requests, or cyber-tampering. Severe offenses are reported to the Cyber Crime Cell and local police.
              </div>
            </div>
          </div>
        </section>

        {/* Section 9 */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">09.</span> Statutory Governance &amp; Grievances
          </h2>
          <p>
            These rules are published in accordance with Rule 3(1) of the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong> and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>.
          </p>
          <div className="bg-muted/40 rounded-xl p-4 text-xs sm:text-sm space-y-1.5 font-mono">
            <div><strong className="text-foreground">Grievance Officer:</strong> Chief Compliance Officer, Velto Platform</div>
            <div><strong className="text-foreground">Email:</strong> <a href="mailto:grievance@velto.delivery" className="text-primary hover:underline">grievance@velto.delivery</a></div>
            <div><strong className="text-foreground">Response SLA:</strong> Acknowledged within 24 hours; resolved within 15 days</div>
            <div><strong className="text-foreground">Jurisdiction:</strong> Lucknow, Uttar Pradesh, India</div>
          </div>
          <div className="pt-2 flex flex-wrap gap-4 text-xs">
            <Link href="/policies" className="text-primary hover:underline font-bold inline-flex items-center gap-1">
              View All Legal Policies <ExternalLink size={12} />
            </Link>
            <Link href="/contact" className="text-primary hover:underline font-bold inline-flex items-center gap-1">
              Contact Support Help Desk <ExternalLink size={12} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
