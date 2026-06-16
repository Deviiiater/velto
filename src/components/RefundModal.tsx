'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Upload, AlertTriangle, Camera, Check, X, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/translations';

type RefundModalProps = {
  orderId: string;
  userId: string;
  language: 'en' | 'hi' | 'hinglish';
  onClose: () => void;
  onSuccess: () => void;
};

export default function RefundModal({ orderId, userId, language, onClose, onSuccess }: RefundModalProps) {
  const [step, setStep] = useState(1);
  const [issue, setIssue] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 1 && !issue.trim()) {
      setError(language === 'hi' ? 'कृपया समस्या दर्ज करें' : 'Please describe the issue');
      return;
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const { error: insertError } = await supabase
        .from('complaints')
        .insert({
          order_id: orderId,
          user_id: userId,
          subject: 'Refund Request',
          description: `[Refund Requested] Issue: ${issue}. Photo Proof Confirmed: Yes. Fraud Warning Acknowledged: Yes.`,
          status: 'pending'
        });
      
      if (insertError) throw insertError;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit refund request.');
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/50 flex justify-between items-center bg-accent/30 relative">
            <h2 className="font-black text-lg flex items-center gap-2">
              <ShieldAlert className="text-rose-500" size={22} />
              {language === 'hi' ? 'रिफंड अनुरोध' : 'Refund Request'}
            </h2>
            <button onClick={onClose} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-xl border border-rose-500/20 flex items-center gap-2">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                    {language === 'hi' ? 'समस्या का विवरण दें' : 'Describe the Issue'}
                  </label>
                  <textarea 
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder={language === 'hi' ? "जैसे दूध कम था, टमाटर सड़े हुए थे..." : "e.g., Missing milk, squashed tomatoes..."}
                    className="w-full p-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm font-medium resize-none"
                    rows={4}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera size={28} />
                  </div>
                  <h3 className="font-bold text-foreground">
                    {language === 'hi' ? 'फोटो अपलोड अनिवार्य' : 'Photo Proof Required'}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {language === 'hi' ? 'रिफंड धोखाधड़ी को रोकने के लिए, हमें क्षतिग्रस्त वस्तुओं की फोटो अपलोड करने की आवश्यकता है।' : 'To prevent refund fraud, we require uploading a clear photo of the damaged or missing items.'}
                  </p>
                </div>
                
                <div 
                  onClick={() => setHasPhoto(!hasPhoto)}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-3 ${
                    hasPhoto ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent/50 text-muted-foreground'
                  }`}
                >
                  {hasPhoto ? <Check size={28} /> : <Upload size={28} className="opacity-50" />}
                  <span className="text-sm font-bold">
                    {hasPhoto 
                      ? (language === 'hi' ? 'फोटो अपलोड सिमुलेटेड' : 'Photo Mock Uploaded')
                      : (language === 'hi' ? 'कैमरा खोलने के लिए टैप करें' : 'Tap to simulate photo upload')
                    }
                  </span>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 space-y-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-rose-500 flex-shrink-0 mt-0.5" size={24} />
                    <div>
                      <h3 className="font-black text-rose-500 uppercase tracking-wider text-sm mb-1">
                        {language === 'hi' ? 'धोखाधड़ी चेतावनी' : 'Strict Fraud Warning'}
                      </h3>
                      <p className="text-xs font-semibold text-rose-500/80 leading-relaxed">
                        {language === 'hi' 
                          ? 'गलत रिफंड का दावा करना वेल्टो नीति का उल्लंघन है। धोखाधड़ी के अनुरोधों के परिणामस्वरूप खाता स्थायी रूप से निलंबित और ब्लैकलिस्ट कर दिया जाएगा।' 
                          : 'Falsifying refund claims is a strict violation of Velto policy. Fraudulent requests will result in permanent account suspension, IP block, and legal action.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/40 rounded-xl p-4 text-xs font-medium text-muted-foreground space-y-2">
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span>Order ID</span>
                    <span className="font-mono">{orderId.slice(0,8)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Issue</span>
                    <span className="font-bold text-foreground text-right w-2/3 truncate">{issue}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-5 border-t border-border/50 bg-accent/30 flex gap-3">
            {step > 1 && (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-background border border-border hover:bg-accent transition-colors"
              >
                {language === 'hi' ? 'पीछे' : 'Back'}
              </button>
            )}
            
            {step < 3 ? (
              <button 
                onClick={handleNext}
                disabled={step === 2 && !hasPhoto}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'hi' ? 'अगला कदम' : 'Next Step'}
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl font-black uppercase tracking-wider text-xs bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <ShieldCheck size={16} />}
                {language === 'hi' ? 'सहमति और सबमिट' : 'I Agree & Submit'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
