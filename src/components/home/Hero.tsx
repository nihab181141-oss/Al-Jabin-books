import React from 'react';
import { useStore } from '../../context/StoreContext';
import { BookOpen, ArrowRight, PenTool, ShieldCheck, User } from 'lucide-react';

interface HeroProps {
  onOpenReadingStudio?: () => void;
  onOpenOrderLookup?: () => void;
  onOpenAuth?: () => void;
  onOpenPublish?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenReadingStudio,
  onOpenOrderLookup,
  onOpenAuth,
  onOpenPublish,
}) => {
  const { setSelectedBook, books, currentUser, logoIconColor } = useStore();
  const flagshipBook = books[0] || null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-[#F5F4EF] pt-10 pb-14 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20 overflow-hidden">
      {/* Subtle Watermark Accent */}
      <img
        src={logoIconColor}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -left-16 top-10 w-72 h-72 opacity-[0.03] hidden lg:block"
      />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Side-by-Side Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT: Editorial Statement & Primary Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 text-xs font-medium tracking-[0.16em] uppercase text-[#686B78]">
              <span>Independent Publishing House</span>
              <span aria-hidden="true" className="text-[#171D50]/30">·</span>
              <span>Read & Self-Publish</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl xl:text-[58px] font-bold text-[#171923] tracking-[-0.035em] leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Good Books.{' '}
              <span className="font-editorial italic font-normal text-[#171D50]">
                Better Perspectives.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#575A66] font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Discover DRM-free digital editions, or open your own author account to publish and share your ebooks directly with readers.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                onClick={() => scrollToSection('bookstore')}
                className="w-full sm:w-auto min-h-[46px] px-7 py-3 bg-[#171D50] text-white text-sm font-semibold tracking-tight hover:bg-[#0f1338] transition-all cursor-pointer rounded-full shadow-xs hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Explore Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenPublish && (
                <button
                  onClick={onOpenPublish}
                  className="w-full sm:w-auto min-h-[46px] px-7 py-3 bg-white text-[#171923] text-sm font-semibold tracking-tight hover:bg-white/90 transition-all cursor-pointer rounded-full border border-black/[0.08] flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <PenTool className="w-4 h-4 text-[#171D50]" />
                  <span>Publish Your Ebook</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1 text-xs text-[#686B78]">
              <span>DRM-Free PDF & EPUB</span>
              <span aria-hidden="true">·</span>
              <span>Independent Self-Publishing</span>
              <span aria-hidden="true">·</span>
              <span>Instant Delivery</span>
            </div>
          </div>

          {/* RIGHT: Free, Unboxed Illustration Stage (or Spotlight Publication when live) */}
          <div className="lg:col-span-6 flex justify-center">
            {flagshipBook ? (
              <div className="w-full max-w-xl bg-[#121638] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-lg">
                <div className="relative flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div
                    onClick={() => setSelectedBook(flagshipBook)}
                    className="w-36 sm:w-40 aspect-[3/4.4] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/15 cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                  >
                    <img
                      src={flagshipBook.coverImage}
                      alt={flagshipBook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3 text-center sm:text-left">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-medium">
                      Spotlight Release · {flagshipBook.category}
                    </div>
                    <h2 className="font-editorial text-2xl sm:text-3xl text-white font-normal leading-snug">
                      {flagshipBook.title}
                    </h2>
                    <p className="text-xs text-white/70">By {flagshipBook.author}</p>
                    <p className="text-xs sm:text-sm text-white/75 font-light line-clamp-3 leading-relaxed">
                      {flagshipBook.description}
                    </p>
                  </div>
                </div>

                <div className="relative mt-6 pt-5 border-t border-white/15 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] text-white/60">Digital Edition</div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums">
                      {flagshipBook.price === 0 ? 'Free Edition' : `৳${flagshipBook.price}`}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBook(flagshipBook)}
                    className="px-6 py-3 bg-white text-[#121638] text-xs font-bold rounded-full hover:bg-white/90 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>Inspect Volume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center">
                <img
                  src="/assets/aistudio/Ebook-rafiki_016c9ebe.svg"
                  alt="Digital ebook reading and self-publishing sanctuary illustration"
                  className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[480px] h-auto object-contain select-none"
                />
                <p className="font-editorial italic text-sm sm:text-base text-[#171D50]/85 text-center max-w-md mt-2">
                  “True reading is an unhurried dialogue between author and reader.”
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full-Width Side-by-Side 4-Column Quick Action Strip */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-black/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <button
            type="button"
            onClick={onOpenReadingStudio}
            className="group text-left flex items-start gap-3.5 py-2 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-black/[0.07] flex items-center justify-center text-[#171D50] shrink-0 group-hover:bg-[#171D50] group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#686B78] tabular-nums">01 · Specimen</div>
              <h3 className="text-sm font-bold text-[#171923] flex items-center gap-1.5 group-hover:text-[#171D50] transition-colors">
                <span>Reading Studio</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
              </h3>
              <p className="text-xs text-[#575A66] leading-relaxed">
                Test serif, sans & parchment themes live.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenPublish}
            className="group text-left flex items-start gap-3.5 py-2 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-black/[0.07] flex items-center justify-center text-[#171D50] shrink-0 group-hover:bg-[#171D50] group-hover:text-white transition-colors">
              <PenTool className="w-4 h-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#686B78] tabular-nums">02 · Authors</div>
              <h3 className="text-sm font-bold text-[#171923] flex items-center gap-1.5 group-hover:text-[#171D50] transition-colors">
                <span>Publish Ebook</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
              </h3>
              <p className="text-xs text-[#575A66] leading-relaxed">
                Share your own manuscript or ebook directly.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            className="group text-left flex items-start gap-3.5 py-2 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-black/[0.07] flex items-center justify-center text-[#171D50] shrink-0 group-hover:bg-[#171D50] group-hover:text-white transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#686B78] tabular-nums">03 · Account</div>
              <h3 className="text-sm font-bold text-[#171923] flex items-center gap-1.5 group-hover:text-[#171D50] transition-colors">
                <span>{currentUser ? 'Author Profile' : 'Sign Up / Login'}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
              </h3>
              <p className="text-xs text-[#575A66] leading-relaxed">
                Manage optional records, ebooks & downloads.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenOrderLookup}
            className="group text-left flex items-start gap-3.5 py-2 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-black/[0.07] flex items-center justify-center text-[#171D50] shrink-0 group-hover:bg-[#171D50] group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#686B78] tabular-nums">04 · Access</div>
              <h3 className="text-sm font-bold text-[#171923] flex items-center gap-1.5 group-hover:text-[#171D50] transition-colors">
                <span>Find Order & Library</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
              </h3>
              <p className="text-xs text-[#575A66] leading-relaxed">
                Instant DRM-free PDF & EPUB retrieval.
              </p>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
