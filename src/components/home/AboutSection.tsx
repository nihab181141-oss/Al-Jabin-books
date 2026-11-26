import React from 'react';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="our-story" className="w-full bg-[#F5F4EF] py-20 md:py-28 border-t border-black/[0.04]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Asymmetric Bento Row: Manifesto Card + 2-Up Standards Grid (Dribbble Shot #2 Inspired) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left: Pure White Manifesto Squircle Card */}
          <div className="lg:col-span-7 bg-white rounded-[30px] p-8 sm:p-11 flex flex-col justify-between shadow-2xs">
            <div className="space-y-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#686B78] font-semibold">
                Our Publishing Mission
              </div>

              <h2 className="font-editorial text-2xl sm:text-3xl md:text-[34px] text-[#171923] font-normal leading-[1.24]">
                “Al Jabin Publications brings together thoughtful books and practical ideas for readers who want to learn, grow, and see the world differently.”
              </h2>

              <p className="text-sm sm:text-base text-[#575A66] font-normal leading-relaxed">
                Founded with an uncompromising commitment to enduring quality over fleeting digital noise. We collaborate with independent thinkers to distill complex philosophies, mental models, and literary reflections into accessible digital volumes.
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-[#F0EFEA] flex flex-wrap items-center gap-5 text-xs font-semibold text-[#171923]">
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

          {/* Right: 2-Up Clean Metric & Standard Cards (Dribbble Statistics Grid Pattern) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            
            {/* Stat Card 1: Clean White Surface */}
            <div className="bg-white rounded-[28px] p-7 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#686B78]">Ownership Model</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Permanent
                </span>
              </div>
              <div className="my-4">
                <div className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#171923] tabular-nums">
                  100% DRM-Free
                </div>
                <p className="text-xs text-[#686B78] mt-1">
                  Universal PDF & EPUB files readable on Kindle, Apple Books, Kobo & tablets.
                </p>
              </div>
              {/* Clean progress bar visual */}
              <div className="w-full h-1.5 bg-[#F5F4EF] rounded-full overflow-hidden">
                <div className="w-full h-full bg-[#171D50] rounded-full" />
              </div>
            </div>

            {/* Stat Card 2: Soft Lavender/Butter Global Distribution Bento Card with Online_world SVG */}
            <div className="bg-[#EAE6FF] rounded-[28px] p-7 flex items-center justify-between gap-4">
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#171D50]">Global Distribution</span>
                  <ArrowUpRight className="w-4 h-4 text-[#171D50]" />
                </div>
                <div className="my-3">
                  <div className="text-xl sm:text-2xl font-bold tracking-[-0.03em] text-[#171923]">
                    Bangladesh & Worldwide
                  </div>
                  <p className="text-xs text-[#4B4E6D] mt-1 leading-relaxed">
                    Instant checkout in BDT via bKash, Nagad & Rocket, plus international cards.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#171D50]">
                  <span>৳ BDT</span>
                  <span aria-hidden="true">·</span>
                  <span>Direct MFS & Cards</span>
                  <span aria-hidden="true">·</span>
                  <span>Instant Token</span>
                </div>
              </div>
              <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 bg-white/85 rounded-2xl p-2 flex items-center justify-center shadow-2xs">
                <img
                  src="/assets/aistudio/Online_world-amico_9426eeb6.svg"
                  alt="Connected digital readers across Bangladesh and worldwide"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom 3 Tactile Craft Pillars with Pastel Illustration Plates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Pillar 1: Bookmarks-pana (Terracotta & Navy) */}
          <div className="bg-white rounded-[28px] p-7 flex flex-col justify-between shadow-2xs group hover:-translate-y-0.5 transition-all duration-300">
            <div>
              <div className="w-full h-48 bg-[#FFE2DB]/65 rounded-2xl p-3 flex items-center justify-center mb-6 overflow-hidden">
                <img
                  src="/assets/aistudio/Bookmarks-pana_fc1b81f4.svg"
                  alt="Editorial bookmarks and reading workflow illustration"
                  className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="text-[11px] font-semibold text-[#686B78] tabular-nums mb-1">
                01 · Editorial Rigor
              </div>
              <h3 className="text-xl font-bold tracking-[-0.02em] text-[#171923]">
                Signal Over Noise
              </h3>
              <p className="text-xs sm:text-sm text-[#575A66] leading-relaxed mt-2">
                Every manuscript is thoroughly line-edited to maximize clarity and eliminate superficial filler.
              </p>
            </div>
          </div>

          {/* Pillar 2: Bookshop-bro (Editorial Sage & Navy) */}
          <div className="bg-white rounded-[28px] p-7 flex flex-col justify-between shadow-2xs group hover:-translate-y-0.5 transition-all duration-300">
            <div>
              <div className="w-full h-48 bg-[#E9F3F0] rounded-2xl p-3 flex items-center justify-center mb-6 overflow-hidden">
                <img
                  src="/assets/aistudio/Bookshop-bro_04087275.svg"
                  alt="Curated bookstore selection and fulfillment illustration"
                  className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="text-[11px] font-semibold text-[#686B78] tabular-nums mb-1">
                02 · Tactile Craft
              </div>
              <h3 className="text-xl font-bold tracking-[-0.02em] text-[#171923]">
                Curated Bookshop Experience
              </h3>
              <p className="text-xs sm:text-sm text-[#575A66] leading-relaxed mt-2">
                Balanced reading measures, classical proportions, and seamless acquisition across every screen size.
              </p>
            </div>
          </div>

          {/* Pillar 3: Hotel_Booking-cuate (Sky Blue & Royal Indigo mobile access) */}
          <div className="bg-white rounded-[28px] p-7 flex flex-col justify-between shadow-2xs group hover:-translate-y-0.5 transition-all duration-300">
            <div>
              <div className="w-full h-48 bg-[#E1EEFF]/80 rounded-2xl p-3 flex items-center justify-center mb-6 overflow-hidden">
                <img
                  src="/assets/aistudio/Hotel_Booking-cuate_3b3357b3.svg"
                  alt="Mobile order confirmation and instant digital library access illustration"
                  className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="text-[11px] font-semibold text-[#686B78] tabular-nums mb-1">
                03 · Instant Delivery
              </div>
              <h3 className="text-xl font-bold tracking-[-0.02em] text-[#171923]">
                Private Reader Library
              </h3>
              <p className="text-xs sm:text-sm text-[#575A66] leading-relaxed mt-2">
                Verified purchases unlock permanent digital access tokens and cloud library sync across your devices.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
