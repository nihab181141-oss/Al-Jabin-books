import React from 'react';
import { useStore } from '../../context/StoreContext';
import { PrintingPressEngraving } from '../ui/BookcraftIllustrations';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenReadingStudio?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenReadingStudio }) => {
  const { setSelectedBook, books } = useStore();
  const flagshipBook = books[0] || null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-[#FCFAF6] pt-12 pb-16 md:pt-18 md:pb-24 overflow-hidden border-b border-[#EBE6DF]">
      {/* Warm Parchment Radial Gradient Atmosphere */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(23, 29, 80, 0.04) 0%, rgba(244, 240, 232, 0.8) 60%, transparent 100%)'
        }}
      />

      {/* Centered Editorial Container */}
      <div className="relative max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Editorial Kicker - Clean unboxed text with typography */}
          <div className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#686B78] font-medium mb-6">
            <span>Independent Publishing House</span>
            <span aria-hidden="true" className="text-[#171D50]/30">·</span>
            <span>Est. 2024</span>
            <span aria-hidden="true" className="text-[#171D50]/30">·</span>
            <span>Digital Volumes</span>
          </div>

          {/* Main Headline with Bodoni Moda / Tall Serif */}
          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-[#171923] font-normal tracking-tight leading-[1.14] mb-6">
            Good Books. <br className="hidden sm:inline" />
            <span className="italic text-[#171D50] font-normal">Better Perspectives.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#686B78] font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Discover thoughtful reads, practical guides, and enduring ideas designed to cultivate clarity in an age of infinite noise.
          </p>

          {/* Action CTAs with circular pill corners */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
            <button
              onClick={() => scrollToSection('bookstore')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#171D50] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#0f1338] transition-all duration-200 cursor-pointer rounded-full shadow-sm hover:shadow"
            >
              Explore Publications
            </button>

            {onOpenReadingStudio && (
              <button
                onClick={onOpenReadingStudio}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-[#171D50] text-xs font-semibold tracking-wider uppercase border border-[#171D50]/30 hover:border-[#171D50] hover:bg-[#171D50]/5 transition-all duration-200 cursor-pointer rounded-full shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Reading Studio</span>
              </button>
            )}

            <button
              onClick={() => scrollToSection('our-story')}
              className="w-full sm:w-auto px-7 py-3.5 bg-transparent text-[#171923] text-xs font-semibold tracking-wider uppercase border border-[#E8E9F0] hover:border-[#171D50] hover:text-[#171D50] transition-all duration-200 cursor-pointer rounded-full"
            >
              Our Philosophy
            </button>
          </div>
        </div>

        {/* Featured Editorial Visual Showcase (displayed when active books exist) */}
        {flagshipBook ? (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-[#FAFAFC] border border-[#E8E9F0] p-6 sm:p-10 md:p-12 relative rounded-3xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Book Presentation with realistic spine shadow */}
                <div className="md:col-span-5 flex justify-center">
                  <div
                    onClick={() => setSelectedBook(flagshipBook)}
                    className="group relative cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 shadow-2xl rounded-lg"
                  >
                    <div className="w-48 sm:w-56 aspect-[3/4.4] relative overflow-hidden bg-[#171D50] border-r-4 border-black/20 rounded-lg">
                      <img
                        src={flagshipBook.coverImage}
                        alt={flagshipBook.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-white/20 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Flagship Editorial Detail */}
                <div className="md:col-span-7 text-left space-y-4">
                  <div className="inline-block text-[11px] uppercase tracking-[0.2em] text-[#686B78] font-semibold bg-white/80 px-3 py-1 rounded-full border border-[#E8E9F0]">
                    Spotlight Release · {flagshipBook.category}
                  </div>
                  <h2 className="font-editorial text-2xl sm:text-3xl text-[#171923] font-normal leading-snug">
                    {flagshipBook.title}
                  </h2>
                  <p className="text-xs text-[#686B78]">
                    By <span className="text-[#171923] font-medium">{flagshipBook.author}</span>
                  </p>
                  <p className="text-sm text-[#686B78] leading-relaxed line-clamp-3 font-light">
                    {flagshipBook.description}
                  </p>
                  <div className="pt-2 flex items-center gap-6">
                    <div>
                      <span className="text-xl font-semibold text-[#171D50]">৳{flagshipBook.price}</span>
                      {flagshipBook.originalPrice && (
                        <span className="ml-2 text-sm text-[#686B78] line-through font-light">
                          ৳{flagshipBook.originalPrice}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedBook(flagshipBook)}
                      className="px-4 py-2 text-xs font-semibold text-[#171D50] hover:bg-[#171D50] hover:text-white border border-[#171D50] rounded-full transition-all cursor-pointer"
                    >
                      View Details & Chapters →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Handcrafted Letterpress Broadsheet Showcase */
          <div className="mt-4 max-w-4xl mx-auto">
            <div className="bg-[#FAF7F0] border border-[#EBE6DF] p-7 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xs text-left">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Handcrafted Monochrome Letterpress Engraving */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="w-56 h-44 sm:w-64 sm:h-48 p-4 bg-white/80 border border-[#E8E2D8] rounded-2xl flex items-center justify-center shadow-xs">
                    <PrintingPressEngraving strokeColor="#171D50" />
                  </div>
                </div>

                {/* Editorial Letterpress Manifesto & Specimen Launcher */}
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#686B78] font-medium">
                    <span>The Publishing Atelier</span>
                    <span aria-hidden="true" className="text-[#171D50]/40">·</span>
                    <span>Specimen Edition</span>
                  </div>

                  <h3 className="font-editorial text-xl sm:text-2xl text-[#171923] font-normal leading-snug">
                    “We champion the slow alchemy of movable type, rigorous editing, and enduring digital craft.”
                  </h3>

                  <p className="text-xs sm:text-sm text-[#686B78] font-light leading-relaxed">
                    Every digital volume from Al Jabin Publications is crafted with comfortable line-measures, balanced typographic scales, and lifetime DRM-free ownership.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {onOpenReadingStudio && (
                      <button
                        onClick={onOpenReadingStudio}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171D50] text-white text-xs font-medium rounded-full hover:bg-[#0f1338] transition-all shadow-xs cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Launch Reading Specimen Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Quiet Craft Markers Ribbon */}
              <div className="mt-8 pt-6 border-t border-[#E8E2D8] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#686B78]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#171D50] font-semibold">01.</span>
                  <span>DRM-Free Universal Files</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#171D50] font-semibold">02.</span>
                  <span>Archival Typographic Grid</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#171D50] font-semibold">03.</span>
                  <span>Direct Author Royalties</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};

