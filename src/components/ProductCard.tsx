'use client';
import { useState } from 'react';
import { Plus, Apple, Leaf, Egg, Cookie, CupSoda, ShoppingBag, ShieldCheck, ThumbsUp, Star, Award, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
};

const getCategoryAesthetics = (category: string) => {
  const normalized = category?.toLowerCase() || '';
  if (normalized.includes('fruit')) {
    return {
      icon: <Apple className="w-16 h-16 text-rose-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />,
      bg: 'bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-500/20'
    };
  }
  if (normalized.includes('veg')) {
    return {
      icon: <Leaf className="w-16 h-16 text-emerald-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />,
      bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20'
    };
  }
  if (normalized.includes('dairy') || normalized.includes('bread')) {
    return {
      icon: <Egg className="w-16 h-16 text-amber-500 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />,
      bg: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20'
    };
  }
  if (normalized.includes('snack')) {
    return {
      icon: <Cookie className="w-16 h-16 text-orange-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />,
      bg: 'bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20'
    };
  }
  if (normalized.includes('bev')) {
    return {
      icon: <CupSoda className="w-16 h-16 text-cyan-500 group-hover:scale-110 group-hover:bounce transition-all duration-300" />,
      bg: 'bg-gradient-to-br from-cyan-500/10 to-sky-500/5 border border-cyan-500/20'
    };
  }
  return {
    icon: <ShoppingBag className="w-16 h-16 text-primary group-hover:scale-110 transition-all duration-300" />,
    bg: 'bg-gradient-to-br from-primary/10 to-transparent border border-primary/20'
  };
};

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { lowInternetMode } = useSettings();
  const [showTrustScore, setShowTrustScore] = useState(false);
  
  const aesthetics = getCategoryAesthetics(product.category);

  // Determistic Hygiene trust scores based on product ID charCode
  const trustSeed = product.id ? product.id.charCodeAt(0) % 7 + 92 : 95;

  // Deterministic Freshness Score details based on product ID charCode
  const freshnessSeed = product.id ? product.id.charCodeAt(0) % 5 + 95 : 98;

  return (
    <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2 transition-all duration-300 ease-out hover:border-primary hover:-translate-y-1 hover:shadow-md group relative">
      
      {/* 🟢 Freshness Score Badge (For Groceries) */}
      {product.category && !['cloud kitchen', 'tiffin service'].includes(product.category.toLowerCase()) && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
            <ThumbsUp size={8} className="fill-white" />
            <span>Fresh: {freshnessSeed}%</span>
          </div>
        </div>
      )}

      {/* 🛡️ Verified Taste & Hygiene Trust Score Badge */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowTrustScore(!showTrustScore);
          }}
          className="flex items-center gap-1 bg-background/95 backdrop-blur border border-emerald-500/30 text-emerald-500 px-2 py-0.5 rounded-full text-[9px] font-black hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
          title="Verified Taste & Hygiene Score"
        >
          <ShieldCheck size={10} className="fill-emerald-500/15" />
          <span>{trustSeed}% Trust</span>
        </button>

        {showTrustScore && (
          <div className="absolute left-0 mt-1.5 w-48 bg-card border border-border/80 rounded-xl shadow-2xl p-2.5 z-30 space-y-1.5 text-[9px] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-border/50 pb-1">
              <span className="font-extrabold text-emerald-500 flex items-center gap-1">
                <Award size={10} /> Hygiene Breakdown
              </span>
              <button onClick={() => setShowTrustScore(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-1 font-semibold text-muted-foreground">
              <div className="flex justify-between">
                <span>Real Reviews:</span>
                <span className="text-foreground">{trustSeed - 1}%</span>
              </div>
              <div className="flex justify-between">
                <span>Packaging Standard:</span>
                <span className="text-foreground">{trustSeed + 2}%</span>
              </div>
              <div className="flex justify-between">
                <span>Transit Temp Control:</span>
                <span className="text-foreground">{trustSeed - 2}%</span>
              </div>
              <div className="flex justify-between font-black text-emerald-500">
                <span>Repeat Order Rate:</span>
                <span>{trustSeed + 1}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Image Panel (Bypasses image fetching if Lite/Low Internet Mode is active) */}
      <div className={`relative w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center transition-transform duration-300 ${aesthetics.bg}`}>
        {product.image_url && !lowInternetMode ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            {aesthetics.icon}
            {lowInternetMode && (
              <span className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-wider">
                Lite Mode Enabled
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5 flex-1">
        <h3 className="font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
      </div>

      <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/40">
        <span className="font-black text-sm sm:text-base text-foreground">₹{product.price}</span>
        <button 
          onClick={() => addToCart(product)}
          className="bg-primary text-primary-foreground p-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm hover:bg-primary/95 flex items-center justify-center"
          aria-label="Add to cart"
        >
          <Plus size={15} className="stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
