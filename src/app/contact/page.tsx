'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [category, setCategory] = useState('payment');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

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
          Support Turnaround: &lt; 15 Minutes
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-card via-card/80 to-primary/5 border border-border/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <Phone size={14} /> 24x7 Customer Care & Help Desk
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Contact Us & Grievance Redressal
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
          Have questions about your order, payment authorization via Razorpay, or refund status? Our dedicated customer care dispatchers and regulatory grievance team are available 24/7.
        </p>
      </div>

      {/* Main Grid: Info Cards + Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contact Info Column (1 col) */}
        <div className="space-y-4 lg:col-span-1">
          
          <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Mail size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Customer Support</span>
                <a href="mailto:support@velto.delivery" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                  support@velto.delivery
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              For real-time delivery issues, missing items, and Razorpay payment clarifications.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Phone size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Helpline / Hotline</span>
                <a href="tel:+919876543210" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                  +91 98765 43210
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Emergency order helpline available during active delivery operational windows.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Registered Office</span>
                <span className="text-xs font-bold text-foreground block">
                  Velto Technologies / Platform
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cyber Hub, Gomti Nagar & Hazratganj, Lucknow, Uttar Pradesh 226010, India.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs">
              <Clock size={14} className="text-primary" /> Operating Hours
            </div>
            <p className="text-xs text-muted-foreground">
              Hyperlocal delivery: <strong>6:00 AM – 2:00 AM IST</strong> daily. Support desk: <strong>24x7</strong>.
            </p>
          </div>

        </div>

        {/* Contact Form Column (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-lg">
            
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Message Dispatched!</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you, <strong>{name}</strong>. Your ticket has been logged in our dispatch desk with high priority. A support specialist will respond to <strong>{email}</strong> within 15 minutes.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => { setSubmitted(false); setMessage(''); }}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    Submit Another Query
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Send us a Message</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fill out the form below and our customer support or grievance desk will assist you immediately.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-foreground">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-foreground">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-foreground">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="payment">Razorpay Payment / Debited Amount</option>
                      <option value="refund">Refund Claim / Status</option>
                      <option value="delivery">Live Order Delivery Delay</option>
                      <option value="quality">Item Quality / Damaged Goods</option>
                      <option value="grievance">Statutory Grievance Redressal</option>
                      <option value="other">General Inquiry</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-foreground">Order ID (Optional)</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. #ord_9f8a32bc"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-foreground">Detailed Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full bg-background border border-border rounded-xl p-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                >
                  <Send size={16} /> Submit Message
                </button>
              </form>
            )}

          </div>
        </div>

      </div>

      {/* Statutory Grievance Redressal Box (Mandatory for Indian E-Commerce) */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" />
          <h3 className="font-bold text-foreground text-base">
            Statutory Grievance Redressal Mechanism
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Pursuant to Rule 3(11) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the Consumer Protection (E-Commerce) Rules, 2020:
        </p>
        <div className="bg-muted/40 rounded-xl p-4 text-xs font-mono space-y-1">
          <div><strong className="text-foreground">Grievance Officer:</strong> Legal & Compliance Officer, Velto Platform</div>
          <div><strong className="text-foreground">Official Email:</strong> <a href="mailto:grievance@velto.delivery" className="text-primary hover:underline">grievance@velto.delivery</a></div>
          <div><strong className="text-foreground">Address:</strong> Velto Technologies, Gomti Nagar & Hazratganj, Lucknow, UP 226010, India</div>
          <div><strong className="text-foreground">Acknowledgment SLA:</strong> Within 48 hours | <strong>Resolution SLA:</strong> Within 30 days</div>
        </div>
      </div>
    </div>
  );
}
