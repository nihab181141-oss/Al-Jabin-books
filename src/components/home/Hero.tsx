import React from 'react';
import { useStore } from '../../context/StoreContext';
import { PrintingPressEngraving } from '../ui/BookcraftIllustrations';
import { BookOpen, ArrowRight, Library, ShieldCheck, Compass, Layers } from 'lucide-react';

interface HeroProps {
  onOpenReadingStudio?: () => void;
  onOpenOrderLookup?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenReadingStudio, onOpenOrderLookup }) => {
  const { setSelectedBook, books } = useStore();
  const flagshipBook = books[0] || null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-[#F5F4EF] pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      {/* Subtle Ambient Soft-Pastel Studio Wash (Dribbble-inspired atmospheric glow) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 10%, rgba(229, 224, 255, 0.55) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(255, 232, 214, 0.5) 0%, transparent 45%)',
        }}
      />

      <div className="relative max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Typographic Greeting & Statement */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 md:mb-12">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-[#686B78]">
              <span>Independent Publishing House</span>
              <span aria-hidden="true" className="text-[#171D50]/30">·</span>
              <span>Est. 2024</span>
              <span aria-hidden="true" className="text-[#171D50]/30">·</span>
              <span>Dhaka & Global</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-[56px] font-bold text-[#171923] tracking-[-0.035em] leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Good Books.{' '}
              <span className="font-editorial italic font-normal text-[#171D50]">
                Better Perspectives.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#575A66] font-normal leading-relaxed max-w-xl">
              Thoughtful digital editions, timeless essays, and practical volumes crafted for clarity in an age of noise.
            </p>
          </div>

          {/* Clean Pill Action Group */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => scrollToSection('bookstore')}
              className="px-6 py-3.5 bg-[#171D50] text-white text-xs sm:text-sm font-semibold tracking-tight hover:bg-[#0f1338] transition-all cursor-pointer rounded-full shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <span>Explore Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onOpenReadingStudio && (
              <button
                onClick={onOpenReadingStudio}
                className="px-6 py-3.5 bg-white text-[#171923] text-xs sm:text-sm font-semibold tracking-tight hover:bg-white/90 transition-all cursor-pointer rounded-full shadow-xs border border-black/[0.06] flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#171D50]" />
                <span>Reading Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* =====================================================================
            ASMMETRIC DRIBBBLE BENTO GRID (Dark Anchor Card + 2x2 Pastel Tiles)
           ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT: Dark Obsidian/Navy Anchor Card */}
          <div className="lg:col-span-6 flex">
            {flagshipBook ? (
              /* Spotlight Real Publication Card (only shown when real book exists) */
              <div className="w-full bg-[#121638] text-white rounded-[30px] p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden shadow-lg">
                <div
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    background:
                      'radial-gradient(circle at 80% 15%, rgba(167, 139, 250, 0.35) 0%, transparent 55%)',
                  }}
                />

                <div className="relative flex flex-col sm:flex-row gap-7 items-center sm:items-start">
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

                <div className="relative mt-8 pt-6 border-t border-white/15 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] text-white/60">Digital Edition</div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums">
                      ৳{flagshipBook.price}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBook(flagshipBook)}
                    className="px-6 py-3 bg-white text-[#121638] text-xs font-bold rounded-full hover:bg-white/90 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>Inspect Volume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Dark Bento Anchor Card: Digital Reading Sanctuary & Specimen */
              <div className="w-full bg-[#121638] text-white rounded-[30px] p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden shadow-lg">
                {/* Soft ambient highlight inside dark card */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    background:
                      'radial-gradient(circle at 85% 15%, rgba(165, 180, 252, 0.28) 0%, transparent 55%)',
                  }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-semibold">
                      Today · Reading Atelier
                    </div>
                    <h2 className="text-2xl sm:text-[28px] font-bold tracking-[-0.02em] leading-tight">
                      The Digital Reading Sanctuary
                    </h2>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Middle: Tactile Bookcraft Line-Art Frame + Quote */}
                <div className="relative my-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-white/[0.06] border border-white/10 rounded-2xl p-5">
                  <div className="sm:col-span-5 h-32 flex items-center justify-center">
                    <PrintingPressEngraving className="w-full h-full" strokeColor="#FFFFFF" />
                  </div>
                  <div className="sm:col-span-7 space-y-2">
                    <p className="font-editorial italic text-base sm:text-lg text-white/95 leading-snug">
                      “True reading is an unhurried architectural dialogue between author and reader.”
                    </p>
                    <div className="text-[11px] text-white/60 tracking-wide">
                      DRM-Free PDF & EPUB · Interactive Specimen
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="relative flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-4 text-xs text-white/70">
                    <div>
                      <span className="font-semibold text-white">3 Essays</span> · Live Type Controls
                    </div>
                  </div>
                  {onOpenReadingStudio && (
                    <button
                      onClick={onOpenReadingStudio}
                      className="px-6 py-3 bg-white text-[#121638] text-xs font-bold rounded-full hover:bg-white/95 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                      <span>Open Reading Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: 2x2 Tactile Pastel Bento Tiles (Dribbble Shot #1 & #3 Pattern) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tile 1: Soft Lavender — Interactive Reading Studio */}
            <button
              type="button"
              onClick={onOpenReadingStudio}
              className="group text-left bg-[#EAE6FF] hover:bg-[#E1DBFF] rounded-[28px] p-6 flex flex-col justify-between min-h-[185px] transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl bg-white/80 flex items-center justify-center text-[#171D50] shadow-2xs group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-[#171D50]/70 tabular-nums">
                  01 · Specimen
                </span>
              </div>

              <div className="space-y-1 mt-5">
                <h3 className="text-lg font-bold tracking-[-0.02em] text-[#171923] flex items-center justify-between">
                  <span>Reading Studio</span>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-[#4B4E6D] leading-relaxed">
                  Test serif, sans & parchment themes live in the digital reader.
                </p>
              </div>
            </button>

            {/* Tile 2: Warm Butter — Digital Catalogue & Collections (Folder stack feel) */}
            <button
              type="button"
              onClick={() => scrollToSection('bookstore')}
              className="group text-left bg-[#FFF2C6] hover:bg-[#FCEBB1] rounded-[28px] p-6 flex flex-col justify-between min-h-[185px] transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl bg-white/80 flex items-center justify-center text-[#784A00] shadow-2xs group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-[#784A00]/80 tabular-nums">
                  02 · Shelf
                </span>
              </div>

              <div className="space-y-1 mt-5">
                <h3 className="text-lg font-bold tracking-[-0.02em] text-[#171923] flex items-center justify-between">
                  <span>Browse Catalogue</span>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-[#6B5428] leading-relaxed">
                  {books.length > 0
                    ? `${books.length} curated digital ${books.length === 1 ? 'volume' : 'volumes'} ready.`
                    : 'Mindset, productivity, growth & delta literary collections.'}
                </p>
              </div>
            </button>

            {/* Tile 3: Soft Blush Peach — DRM-Free Ownership & Instant Delivery */}
            <button
              type="button"
              onClick={() => scrollToSection('our-story')}
              className="group text-left bg-[#FFE2DB] hover:bg-[#FFD6CC] rounded-[28px] p-6 flex flex-col justify-between min-h-[185px] transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl bg-white/80 flex items-center justify-center text-[#8B261D] shadow-2xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-[#8B261D]/75 tabular-nums">
                  03 · Rights
                </span>
              </div>

              <div className="space-y-1 mt-5">
                <h3 className="text-lg font-bold tracking-[-0.02em] text-[#171923] flex items-center justify-between">
                  <span>DRM-Free Forever</span>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-[#6E3D37] leading-relaxed">
                  Universal PDF & EPUB files for Kindle, Apple Books & tablets.
                </p>
              </div>
            </button>

            {/* Tile 4: Soft Sky Blue — Customer Library & Order Access */}
            <button
              type="button"
              onClick={onOpenOrderLookup}
              className="group text-left bg-[#E1EEFF] hover:bg-[#D2E5FF] rounded-[28px] p-6 flex flex-col justify-between min-h-[185px] transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl bg-white/80 flex items-center justify-center text-[#171D50] shadow-2xs group-hover:scale-105 transition-transform">
                  <Library className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-[#171D50]/75 tabular-nums">
                  04 · Account
                </span>
              </div>

              <div className="space-y-1 mt-5">
                <h3 className="text-lg font-bold tracking-[-0.02em] text-[#171923] flex items-center justify-between">
                  <span>My Digital Library</span>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-xs text-[#3C4F72] leading-relaxed">
                  Access purchased ebooks, verify orders, or sign into your shelf.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
