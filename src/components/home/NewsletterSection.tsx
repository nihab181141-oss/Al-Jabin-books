import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mail, CheckCircle2, AlertCircle, ShieldCheck, Feather } from 'lucide-react';
import { WritingDeskSanctuary } from '../ui/BookcraftIllustrations';

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
    <section id="reader-dispatches" className="w-full bg-white py-20 md:py-24 border-t border-black/[0.04] relative">
      <div id="newsletter" className="absolute -top-20" />
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Two-Tone Dribbble Bento Correspondence Container */}
        <div className="bg-[#F5F4EF] rounded-[32px] p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* Left: Dark Navy Anchor Correspondence Card */}
          <div className="lg:col-span-5 bg-[#121638] text-white rounded-[26px] p-8 flex flex-col justify-between relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background:
                  'radial-gradient(circle at 80% 15%, rgba(229, 224, 255, 0.35) 0%, transparent 55%)',
              }}
            />
            <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/65 font-semibold">
              <Feather className="w-3.5 h-3.5" />
              <span>Private Correspondence</span>
            </div>

            <div className="relative my-6 h-36 flex items-center justify-center">
              <WritingDeskSanctuary className="w-full h-full" strokeColor="#FFFFFF" />
            </div>

            <div className="relative space-y-1">
              <div className="font-editorial italic text-lg text-white/95">
                Sunday Morning Essays
              </div>
              <p className="text-xs text-white/65 font-light leading-relaxed">
                Unhurried notes from our authors, forthcoming volume notices, and private reading specimens.
              </p>
            </div>
          </div>

          {/* Right: Crisp Pure White Subscription Form Card */}
          <div className="lg:col-span-7 bg-white rounded-[26px] p-8 sm:p-12 flex flex-col justify-center space-y-6 shadow-2xs">
            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#686B78] font-semibold">
                Reader Dispatches
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.03em] text-[#171923] leading-tight">
                Thoughtful Dispatches, Directly to Your Sanctuary
              </h2>

              <p className="text-sm text-[#575A66] leading-relaxed">
                Receive curated notes, release announcements for upcoming editions, and complimentary DRM-free sample chapters.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 bg-[#F5F4EF] p-1.5 sm:rounded-full focus-within:ring-2 focus-within:ring-[#171D50]/15 transition-all">
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
                  className="px-7 py-3 bg-[#171D50] text-white text-xs font-semibold tracking-tight hover:bg-[#0f1338] transition-all cursor-pointer shrink-0 rounded-full shadow-xs"
                >
                  Join Dispatches
                </button>
              </div>

              {status.type === 'error' && (
                <div className="flex items-center gap-2 text-xs text-rose-600 font-medium bg-rose-50 py-2.5 px-4 rounded-full">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              {status.type === 'success' && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 py-2.5 px-4 rounded-full">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#686B78]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#171D50]" />
                  <span>Zero spam or third-party sharing.</span>
                </div>
                <span aria-hidden="true" className="text-gray-300">·</span>
                <span>Unsubscribe anytime.</span>
              </div>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
