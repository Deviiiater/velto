import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RefreshCcw, CheckCircle2, XCircle, Clock, ShieldAlert, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy - Velto Instant Delivery',
  description: 'Understand the cancellation windows, refund eligibility, and Razorpay turnaround times for orders placed on Velto.',
};

export default function RefundPage() {
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
          Standard Razorpay SLA: 5-7 Business Days
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-card via-card/80 to-emerald-500/5 border border-border/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <RefreshCcw size={14} /> Customer Assurance Guarantee
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Refund & Cancellation Policy
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
          At <strong className="text-foreground">Velto</strong>, we are dedicated to delivering pristine quality food, groceries, and essentials in 10 minutes. If something goes wrong with your order, our transparent cancellation and refund policy ensures your money is safeguarded.
        </p>
      </div>

      {/* Highlights summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
          <h3 className="font-bold text-foreground text-sm">Pre-Packing Cancel</h3>
          <p className="text-xs text-muted-foreground">
            Cancel 100% free of charge before the merchant dark store or kitchen starts packing your order.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <CreditCard size={18} />
          </div>
          <h3 className="font-bold text-foreground text-sm">5-7 Days SLA</h3>
          <p className="text-xs text-muted-foreground">
            Approved refunds are credited back to the original source (Card, UPI, Bank) via Razorpay within 5–7 working days.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <CheckCircle2 size={18} />
          </div>
          <h3 className="font-bold text-foreground text-sm">In-App Claim Desk</h3>
          <p className="text-xs text-muted-foreground">
            Submit a photo verification and instant claim directly from your Profile or Order Details page.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
        
        {/* Section 1 */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">01.</span> Order Cancellation Rules
          </h2>
          <p>
            Due to our 10-minute automated dispatch velocity, packing begins within seconds of order receipt:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong>Cancellations Allowed:</strong> You may cancel anytime while the order status remains <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">Pending</code> or before store preparation begins. A 100% full refund will be processed immediately.
            </li>
            <li>
              <strong>Restricted Once Out for Delivery:</strong> Once an order is handed over to the fleet delivery rider (<code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">Out for Delivery</code>), cancellation is not permitted to prevent food waste and rider fuel expenditure.
            </li>
            <li>
              <strong>Cancellation by Velto / Merchant:</strong> In rare cases of inventory stockouts, sudden store closures, or severe weather constraints preventing safe rider transit, Velto reserves the right to cancel the order. You will receive an immediate notification and 100% refund.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">02.</span> Eligibility for Refunds
          </h2>
          <p>
            You are eligible for a partial or full refund under any of the following circumstances:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block">Damaged / Leaking Item:</strong>
                Food packages with broken seals, crushed bakery items, or leaking dairy containers.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block">Missing / Wrong Product:</strong>
                Item billed but absent in the delivery bag, or wrong flavor/variant sent by the vendor.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block">Spoiled / Expired Perishables:</strong>
                Produce or dairy delivered past marked expiration dates or unfit for consumption.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block">Unfulfilled Delivery SLA:</strong>
                Severe, uncommunicated delays where delivery takes significantly longer without updates.
              </div>
            </div>
          </div>

          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-2 text-xs sm:text-sm">
            <div className="font-bold text-destructive flex items-center gap-2">
              <XCircle size={16} /> Non-Refundable Scenarios:
            </div>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
              <li>Customer unreachable by rider at designated delivery address after 3 phone attempts.</li>
              <li>Incorrect delivery address or wrong contact phone number provided at checkout.</li>
              <li>Items consumed, opened, or disposed of before photo evidence could be captured.</li>
              <li>Requests initiated more than <strong>24 hours</strong> after delivery completion.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">03.</span> Refund Timelines & Razorpay Processing
          </h2>
          <p>
            Once a refund claim is approved by our automated inspection engine or support desk:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-3 text-foreground font-bold">Payment Mode</th>
                  <th className="p-3 text-foreground font-bold">Refund Destination</th>
                  <th className="p-3 text-foreground font-bold">Estimated Turnaround</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="p-3 font-semibold text-foreground">UPI (GPay, PhonePe, Paytm)</td>
                  <td className="p-3">Original Linked Bank Account</td>
                  <td className="p-3 text-emerald-400 font-mono">24 to 48 Hours</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-foreground">Debit / Credit Cards</td>
                  <td className="p-3">Issuing Bank Account / Card Statement</td>
                  <td className="p-3 text-emerald-400 font-mono">5 to 7 Business Days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-foreground">Net Banking</td>
                  <td className="p-3">Source Bank Account via Razorpay</td>
                  <td className="p-3 text-emerald-400 font-mono">3 to 7 Business Days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-foreground">Velto Smart Wallet</td>
                  <td className="p-3">Instant Velto Wallet Balance</td>
                  <td className="p-3 text-emerald-400 font-mono">Instant (Under 5 Mins)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs pt-1">
            <em>Note: Actual settlement speeds depend on your bank&apos;s internal NEFT/IMPS clearing schedules. A Razorpay Refund ID (e.g. <code className="bg-muted px-1.5 py-0.5 rounded font-mono">rfnd_xxx</code>) will be shared via email/SMS for end-to-end tracking with your issuing bank.</em>
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-sm">04.</span> How to Request a Refund
          </h2>
          <p>You can lodge a refund request easily via any of the following channels:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Method A: In-App Support</h3>
              <p className="text-xs">
                Go to <Link href="/profile" className="text-primary underline font-semibold">My Orders</Link>, select your order, and click the <strong>&quot;Request Refund&quot;</strong> button. Upload a photo of the damaged item and describe the issue.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Method B: Support Desk</h3>
              <p className="text-xs">
                Email our 24/7 care team at <a href="mailto:support@velto.delivery" className="text-primary font-mono hover:underline">support@velto.delivery</a> with your Order ID, registered phone number, and issue details.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
