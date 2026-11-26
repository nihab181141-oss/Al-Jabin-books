import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mail, CheckCircle2, AlertCircle, ShieldCheck, Feather } from 'lucide-react';

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
    <section id="reader-dispatches" className="w-full bg-white py-16 sm:py-20 lg:py-24 border-t border-black/[0.06] relative">
      <div id="newsletter" className="absolute -top-20" />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left: Free, Unboxed Correspondence Illustration */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="w-full flex justify-center lg:justify-start">
              <img
                src="/assets/aistudio/Online_world-amico_9426eeb6.svg"
                alt="Global reader dispatches and digital correspondence illustration"
                className="w-full max-w-[320px] sm:max-w-[380px] h-auto object-contain select-none"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-black/[0.08] w-full max-w-sm space-y-1.5">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-bold">
                <Feather className="w-3.5 h-3.5 text-[#171D50]" />
                <span>Private Correspondence</span>
              </div>
              <div className="font-editorial italic font-bold text-2xl text-[#171D50]">
                Sunday Morning Essays
              </div>
              <p className="text-xs sm:text-sm text-[#575A66] font-normal leading-relaxed">
                Unhurried notes from our authors, forthcoming volume notices, and private reading specimens.
              </p>
            </div>
          </div>

          {/* Right: Open Subscription Form Column */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="space-y-3 text-center lg:text-left">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#D97706] font-bold">
                Reader Dispatches
              </div>

              <h2
                className="text-3xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#171923] leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Thoughtful Dispatches, Directly to{' '}
                <span className="font-editorial italic font-bold text-[#171D50]">
                  Your Sanctuary
                </span>
              </h2>

              <p className="text-sm sm:text-base text-[#575A66] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Receive curated notes, release announcements for upcoming editions, and complimentary DRM-free sample chapters.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto lg:mx-0 w-full">
              <div className="flex flex-col sm:flex-row gap-2.5 bg-[#F5F4EF] p-2 rounded-2xl sm:rounded-full focus-within:ring-2 focus-within:ring-[#171D50]/15 transition-all">
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
                    aria-label="Email address for reader dispatches"
                    className="w-full min-h-[44px] pl-11 pr-4 py-2.5 text-sm sm:text-xs bg-transparent text-[#171923] border-none focus:outline-none rounded-full"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[44px] px-7 py-2.5 bg-[#171D50] text-white text-xs sm:text-sm font-semibold tracking-tight hover:bg-[#0f1338] transition-all cursor-pointer shrink-0 rounded-full shadow-xs whitespace-nowrap"
                >
                  Join Dispatches
                </button>
              </div>

              {status.type === 'error' && (
                <div className="flex items-center gap-2 text-xs text-rose-700 font-medium bg-rose-50 py-2.5 px-4 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              {status.type === 'success' && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 py-2.5 px-4 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 pt-1 text-xs text-[#686B78]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#171D50]" />
                  <span>Zero spam or third-party sharing</span>
                </div>
                <span aria-hidden="true" className="text-gray-300">·</span>
                <span>Unsubscribe anytime</span>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};
