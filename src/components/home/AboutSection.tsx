import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="our-story" className="w-full bg-[#F5F4EF] py-16 sm:py-20 lg:py-24 border-t border-black/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-20">
        
        {/* Top Side-by-Side Split: Publishing Mission Left · Ownership & Global Distribution Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left: Editorial Mission */}
          <div className="lg:col-span-7 space-y-5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#686B78] font-semibold">
              Our Publishing Mission
            </div>

            <h2
              className="font-editorial text-2xl sm:text-3xl lg:text-[36px] text-[#171923] font-normal leading-[1.24]"
              style={{ textWrap: 'balance' }}
            >
              “Al Jabin Publications brings together thoughtful books and practical ideas for readers who want to learn, grow, and see the world differently.”
            </h2>

            <p className="text-sm sm:text-base text-[#575A66] font-normal leading-relaxed max-w-2xl">
              Founded with an uncompromising commitment to enduring quality over fleeting digital noise. We collaborate with independent thinkers to distill complex philosophies, mental models, and literary reflections into accessible digital volumes.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-semibold text-[#171923]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#171D50]" />
                <span>Original Research</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#171D50]" />
                <span>Human Editorial Craft</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#171D50]" />
                <span>Direct Author Royalties</span>
              </div>
            </div>
          </div>

          {/* Right: Clean Side-by-Side Standards Panel (Uncluttered surface, zero pill spam) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:pl-8 lg:border-l lg:border-black/[0.08]">
            
            <div className="space-y-2 pb-6 sm:pb-0 lg:pb-6 sm:border-r lg:border-r-0 lg:border-b border-black/[0.08] sm:pr-6 lg:pr-0">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#686B78] font-semibold">
                Ownership Model · Permanent
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[#171923] tabular-nums">
                100% DRM-Free
              </div>
              <p className="text-xs sm:text-sm text-[#575A66] leading-relaxed">
                Universal PDF & EPUB files readable on Kindle, Apple Books, Kobo, laptops, and tablets forever.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#686B78] font-semibold">
                Global Distribution
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[#171923]">
                Bangladesh & Worldwide
              </div>
              <p className="text-xs sm:text-sm text-[#575A66] leading-relaxed">
                Instant checkout in BDT via bKash, Nagad & Rocket, plus international card delivery.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#171D50]">
                <span>৳ BDT</span>
                <span aria-hidden="true">·</span>
                <span>Direct MFS & Cards</span>
                <span aria-hidden="true">·</span>
                <span>Instant Token</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom 3 Craft Pillars Side-by-Side: Free, Unboxed SVG Illustrations */}
        <div className="pt-12 border-t border-black/[0.08] grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          
          {/* Pillar 1 */}
          <div className="group flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-full h-52 sm:h-56 flex items-center justify-center mb-6">
              <img
                src="/assets/aistudio/Bookmarks-pana_fc1b81f4.svg"
                alt="Editorial bookmarks and reading workflow illustration"
                className="w-full max-w-[240px] h-full object-contain group-hover:scale-[1.03] transition-transform duration-300 select-none"
              />
            </div>
            <div className="text-[11px] font-semibold text-[#686B78] uppercase tracking-[0.16em] tabular-nums mb-1.5">
              01 · Editorial Rigor
            </div>
            <h3 className="text-xl font-bold tracking-[-0.02em] text-[#171923]">
              Signal Over Noise
            </h3>
            <p className="text-sm text-[#575A66] leading-relaxed mt-2">
              Every manuscript is thoroughly line-edited to maximize clarity and eliminate superficial filler.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="group flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-full h-52 sm:h-56 flex items-center justify-center mb-6">
              <img
                src="/assets/aistudio/Bookshop-bro_04087275.svg"
                alt="Curated bookstore selection and fulfillment illustration"
                className="w-full max-w-[240px] h-full object-contain group-hover:scale-[1.03] transition-transform duration-300 select-none"
              />
            </div>
            <div className="text-[11px] font-semibold text-[#686B78] uppercase tracking-[0.16em] tabular-nums mb-1.5">
              02 · Tactile Craft
            </div>
            <h3 className="text-xl font-bold tracking-[-0.02em] text-[#171923]">
              Curated Bookshop Experience
            </h3>
            <p className="text-sm text-[#575A66] leading-relaxed mt-2">
              Balanced reading measures, classical proportions, and seamless acquisition across every screen size.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="group flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-full h-52 sm:h-56 flex items-center justify-center mb-6">
              <img
                src="/assets/aistudio/Hotel_Booking-cuate_3b3357b3.svg"
                alt="Mobile order confirmation and instant digital library access illustration"
                className="w-full max-w-[240px] h-full object-contain group-hover:scale-[1.03] transition-transform duration-300 select-none"
              />
            </div>
            <div className="text-[11px] font-semibold text-[#686B78] uppercase tracking-[0.16em] tabular-nums mb-1.5">
              03 · Instant Delivery
            </div>
            <h3 className="text-xl font-bold tracking-[-0.02em] text-[#171923]">
              Private Reader Library
            </h3>
            <p className="text-sm text-[#575A66] leading-relaxed mt-2">
              Verified purchases unlock permanent digital access tokens and cloud library sync across your devices.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
