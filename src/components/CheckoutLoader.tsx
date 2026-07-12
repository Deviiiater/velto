'use client';
import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, Store, Bike } from 'lucide-react';

type LoaderStage = 'payment' | 'store' | 'rider' | 'success';

interface CheckoutLoaderProps {
  onComplete: () => void;
}

export function CheckoutLoader({ onComplete }: CheckoutLoaderProps) {
  const [stage, setStage] = useState<LoaderStage>('payment');

  useEffect(() => {
    // Stage transition timer
    const t1 = setTimeout(() => setStage('store'), 1200);
    const t2 = setTimeout(() => setStage('rider'), 2400);
    const t3 = setTimeout(() => setStage('success'), 3600);
    const t4 = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center p-6 bg-[#070B14]/90 backdrop-blur-2xl select-none animate-in fade-in duration-300">
      <div className="w-full max-w-sm glass-panel border border-[#FF5F1F]/20 rounded-[2.5rem] p-8 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
        {/* Decorative glowing blobs */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#7C3AED]/10 rounded-full blur-[40px] pointer-events-none"></div>

        {/* Dynamic stage icon animation */}
        <div className="w-24 h-24 rounded-full bg-foreground/5 border border-foreground/5 flex items-center justify-center relative shadow-inner">
          {stage === 'payment' && (
            <div className="flex flex-col items-center justify-center relative">
              <Loader2 className="w-12 h-12 text-[#FF5F1F] animate-spin" />
              <ShieldCheck className="w-5 h-5 text-emerald-500 absolute" />
            </div>
          )}
          {stage === 'store' && (
            <div className="flex flex-col items-center justify-center animate-bounce-short">
              <Store className="w-12 h-12 text-primary" />
              <span className="absolute text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase top-[-8px]">
                Accepting
              </span>
            </div>
          )}
          {stage === 'rider' && (
            <div className="flex flex-col items-center justify-center relative">
              <Bike className="w-12 h-12 text-sky-500 animate-pulse" />
              <Loader2 className="w-16 h-16 text-sky-500/30 animate-spin absolute" />
            </div>
          )}
          {stage === 'success' && (
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/25 animate-in zoom-in duration-300">
              ✓
            </div>
          )}
        </div>

        {/* Dynamic Text Messages */}
        <div className="space-y-2 z-10">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#FF5F1F] animate-pulse">
            {stage === 'payment' && 'Securing Checkout'}
            {stage === 'store' && 'Contacting Store'}
            {stage === 'rider' && 'Finding Rider'}
            {stage === 'success' && 'Order Placed!'}
          </h3>
          <h2 className="text-base font-black text-foreground uppercase tracking-tight leading-snug">
            {stage === 'payment' && 'Confirming payment with bank...'}
            {stage === 'store' && 'Store accepting your order...'}
            {stage === 'rider' && 'Locating nearest Velto rider...'}
            {stage === 'success' && 'Aapka order accept ho gaya!'}
          </h2>
          <p className="text-[10px] text-muted-foreground font-semibold px-4 leading-relaxed">
            {stage === 'payment' && 'Please do not close the app or tap the back button while we secure your connection.'}
            {stage === 'store' && 'Preparing groceries and meals. Zero contact bagging in progress.'}
            {stage === 'rider' && 'Assigning a partner at the nearest hub for under 10-minute dispatch.'}
            {stage === 'success' && 'Redirecting you to the live tracking page. Have a great day!'}
          </p>
        </div>

        {/* Status indicator timeline steps */}
        <div className="w-full flex justify-between items-center gap-1.5 mt-4 border-t border-foreground/5 pt-5 z-10">
          {[
            { label: 'Payment', done: stage !== 'payment' },
            { label: 'Confirm', done: ['rider', 'success'].includes(stage) },
            { label: 'Rider', done: stage === 'success' }
          ].map((step, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                step.done ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}></div>
              <span className={`text-[8px] font-black uppercase tracking-wider ${
                step.done ? 'text-emerald-500' : 'text-zinc-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
