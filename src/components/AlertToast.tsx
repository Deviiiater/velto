'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

type AlertToastProps = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
};

export default function AlertToast({ message, type, onClose }: AlertToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm"
        >
          <div className={`backdrop-blur-xl border p-4 rounded-2xl shadow-2xl flex items-start gap-3 relative overflow-hidden ${
            type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
          }`}>
            <div className="absolute inset-0 bg-background/60 -z-10" />
            <div className="mt-0.5">
              {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="flex-1 pr-6">
              <h4 className="font-bold text-sm tracking-tight text-foreground">{type === 'success' ? 'Success' : 'Error'}</h4>
              <p className="text-xs mt-0.5 leading-relaxed font-medium whitespace-pre-wrap opacity-90">{message}</p>
            </div>
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X size={14} className="text-foreground/50" />
            </button>
            
            {/* Progress Bar */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className={`absolute bottom-0 left-0 h-1 ${type === 'success' ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`} 
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
