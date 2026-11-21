import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Truck, Zap, MapPin, ShieldCheck, Clock, Navigation } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy - Velto Instant Delivery',
  description: 'Learn about Velto 10-minute instant delivery timelines, serviced operational zones, and shipping fees.',
};

export default function ShippingPage() {
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
          Ultra-Fast Dispatch: 10–20 Minutes
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-card via-card/80 to-amber-500/5 border border-border/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Truck size={14} /> Instant Logistics Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Shipping & Delivery Policy
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
          Velto is engineered to eliminate waiting. We deliver fresh groceries, chef-prepared meals, daily pharmacy essentials, and hostel packages in <strong>under 10 to 20 minutes</strong> using our dense network of micro-fulfillment dark stores and electric fleet.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Zap size={18} />
          </div>
          <h3 className="font-bold text-foreground text-sm">10-20 Min Delivery</h3>
          <p className="text-xs text-muted-foreground">
            Algorithmically assigned dark stores ensure rapid item picking within 2 minutes of checkout.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Navigation size={18} />
          </div>
          <h3 className="font-bold text-foreground text-sm">Live GPS Telemetry</h3>
          <p className="text-xs text-muted-foreground">
            Watch your assigned fleet rider travel on a live map with real-time ETA updates.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck size={18} />
          </div>
          <h3 className="font-bold text-foreground text-sm">Safe Handover</h3>
          <p className="text-xs text-muted-foreground">
            Contactless delivery option and temperature-shielded carry pods keep foods hot and fresh.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
        
        {/* Section 1 */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">01.</span> Operating Zones & Coverage
          </h2>
          <p>
            Velto operates in designated high-density hyperlocal delivery clusters across serviced Indian cities, including active dark stores and merchant networks in:
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-foreground font-semibold">Lucknow (Central & East Hubs)</span>
            <span className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-foreground font-semibold">Delhi NCR (Select Zones)</span>
            <span className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-foreground font-semibold">Moradabad</span>
            <span className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-foreground font-semibold">Sambhal & Chandausi</span>
            <span className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-foreground font-semibold">Campus & Hostel Clusters</span>
          </div>
          <p className="text-xs pt-2">
            Delivery eligibility is automatically evaluated based on your exact device location coordinates. If your location falls outside our active 5 km dark-store radius, you will be notified prior to order placement.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">02.</span> Delivery Timelines & Operating Hours
          </h2>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>Standard Hours:</strong> 6:00 AM to 2:00 AM daily across grocery, bakery, food, and daily essentials.</li>
            <li><strong>Late-Night Canteens:</strong> Select campus and night-hub canteens operate 24/7 or through 4:00 AM for student communities.</li>
            <li><strong>Emergency Medicines:</strong> 24/7 OTC medicine delivery within 15 minutes subject to pharmacy partner availability.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">03.</span> Delivery Fee Structure
          </h2>
          <p>
            Velto maintains 100% pricing transparency with no hidden convenience surcharges:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Standard Hyperlocal Delivery:</strong> Typically ₹15 to ₹35 depending on exact dark store distance (within 3–5 km).</li>
            <li><strong>Free Delivery Tier:</strong> Qualifying basket values above ₹199 or ₹299 (depending on category) enjoy complimentary free delivery.</li>
            <li><strong>One India Pass Members:</strong> Unlimited free deliveries across all eligible grocery and meal orders.</li>
            <li><strong>Weather / Surge Pricing:</strong> During severe torrential rain or extreme nighttime hours, a nominal surge charge (₹10–₹25) may be applied, 100% of which is passed directly to the brave delivery fleet.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">04.</span> Delivery Handover & Customer Protocols
          </h2>
          <p>
            To guarantee a seamless 10-minute handover:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Please keep your contact phone nearby once the rider is marked &quot;Out for Delivery&quot;.</li>
            <li>Provide helpful landmarks (e.g. &quot;Opposite Main Gate, Hostel Block B, Room 304&quot;) in the address notes.</li>
            <li>If you select <strong>Contactless Delivery</strong>, the rider will place your sealed package at your door and capture a delivery confirmation photo.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
