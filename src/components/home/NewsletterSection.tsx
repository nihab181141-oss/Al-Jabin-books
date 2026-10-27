import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Feather } from 'lucide-react';

const LETTER_ILLUSTRATION = '/src/assets/images/reader_dispatch_letter_1793082224696.jpg';

export const NewsletterSection: React.FC = () => {
  const { subscribeNewsletter } = useStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus({
        type: 'error',
        message: 'Please provide an email address.',
      });
      return;
    }

    const res = subscribeNewsletter(email);
    if (res.success) {
      setStatus({
        type: 'success',
        message: res.message,
      });
      setEmail('');
    } else {
      setStatus({
        type: 'error',
        message: res.message,
      });
    }
  };

  return (
    <section id="reader-dispatches" className="w-full bg-[#FAFAFC] py-20 md:py-28 border-b border-[#E8E9F0] relative">
      <div id="newsletter" className="absolute -top-20" />
      {/* Centered Container */}
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Luxury Editorial Dispatch Box */}
        <div className="bg-white border border-[#E8E9F0] rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left: Letterpress Illustration with Vignette */}
            <div className="lg:col-span-5 bg-[#171D50] relative overflow-hidden h-72 sm:h-96 lg:h-full min-h-[320px]">
              <img
                src={LETTER_ILLUSTRATION}
                alt="Al Jabin Publications Letterpress Dispatch and Wax Seal"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-white/80 font-medium">
                  <Feather className="w-3 h-3" />
                  <span>The Private Correspondence</span>
                </div>
                <div className="text-xs font-serif italic text-white/95">
                  Delivered on Sunday mornings. Unhurried reflections from our authors.
                </div>
              </div>
            </div>

            {/* Right: Invitation & Subscription Form */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 space-y-6">
              <div className="space-y-3">
                <div className="inline-block text-xs uppercase tracking-[0.22em] text-[#686B78] font-semibold bg-[#FAFAFC] px-3.5 py-1 rounded-full border border-[#E8E9F0]">
                  Reader Dispatches
                </div>

                <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl text-[#171923] font-normal tracking-tight leading-snug">
                  Thoughtful Dispatches, Directly to Your Reading Sanctuary
                </h2>

                <p className="text-sm text-[#686B78] font-light leading-relaxed">
                  Receive private essays from our authors, notification of upcoming printed & digital editions, and exclusive DRM-free sample chapters. Zero algorithm noise, strictly curated prose.
                </p>
              </div>

              {/* Form with circular pill styling */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 bg-[#FAFAFC] p-1.5 sm:rounded-full border border-[#E8E9F0] focus-within:border-[#171D50] transition-colors shadow-2xs">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-[#686B78] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status.type !== 'idle') setStatus({ type: 'idle', message: '' });
                      }}
                      placeholder="Enter your email address..."
                      className="w-full pl-11 pr-4 py-3 text-xs bg-transparent text-[#171923] border-none focus:outline-none rounded-full"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-7 py-3 bg-[#171D50] text-white text-xs font-medium tracking-wide hover:bg-[#0f1338] transition-all cursor-pointer shrink-0 rounded-full shadow-sm hover:shadow"
                  >
                    Join Dispatches
                  </button>
                </div>

                {/* Validation & Feedback messages */}
                {status.type === 'error' && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 font-medium animate-fade-in bg-rose-50 py-2 px-4 rounded-full border border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{status.message}</span>
                  </div>
                )}

                {status.type === 'success' && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium animate-fade-in bg-emerald-50 py-2 px-4 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{status.message}</span>
                  </div>
                )}

                {/* Trust Reassurance */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#686B78] font-light">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#171D50]" />
                    <span>Your privacy is revered. No third-party sharing.</span>
                  </div>
                  <span aria-hidden="true" className="text-gray-300">·</span>
                  <span>Unsubscribe with a single click.</span>
                </div>
              </form>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
