import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  WritingDeskSanctuary,
  BookbindingCraftVignette,
  OpenCodexSpecimen,
} from '../ui/BookcraftIllustrations';

export const AboutSection: React.FC = () => {
  return (
    <section id="our-story" className="w-full bg-[#FFFFFF] py-20 md:py-28 border-b border-[#E8E9F0]">
      {/* Centered Main Container */}
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mission & Editorial Manifesto */}
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-20">
          <div className="inline-block text-xs uppercase tracking-[0.24em] text-[#686B78] font-semibold bg-[#FAF7F0] px-4 py-1.5 rounded-full border border-[#EBE6DF]">
            Our Publishing Mission
          </div>
          
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#171923] font-normal leading-[1.25]">
            “Al Jabin Publications brings together thoughtful books and practical ideas for readers who want to learn, grow, and see the world differently.”
          </h2>
          
          <p className="text-base text-[#686B78] font-light leading-relaxed">
            Founded with an uncompromising editorial commitment to enduring quality over fleeting digital novelty. We collaborate with independent thinkers and authors to distill complex philosophies, mental models, and literary reflections into accessible, timeless digital publications.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#171923] font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#171D50]" />
              <span>Original Research & Thought</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#171D50]" />
              <span>Zero AI Derivative Ghostwriting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#171D50]" />
              <span>Direct Author Royalties</span>
            </div>
          </div>
        </div>

        {/* Publishing Pillars with Handcrafted Monochrome Bookcraft Plates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#E8E9F0]">
          
          {/* Pillar 1: Editorial Rigor & Solitary Writing Sanctuary */}
          <div className="p-8 bg-[#FAF7F0] border border-[#EBE6DF] rounded-3xl space-y-4 hover:shadow-md hover:border-[#171D50]/30 transition-all group flex flex-col justify-between">
            <div>
              {/* Handcrafted Line Art Plate */}
              <div className="w-full h-36 p-4 bg-white/90 border border-[#E8E2D8] rounded-2xl flex items-center justify-center mb-6 group-hover:border-[#171D50]/40 transition-colors shadow-2xs">
                <WritingDeskSanctuary className="w-full h-full" strokeColor="#171D50" />
              </div>

              <div className="text-[11px] uppercase tracking-[0.2em] text-[#686B78] font-medium mb-1">
                Pillar I · Invariable Depth
              </div>
              <h3 className="font-editorial text-2xl text-[#171923] font-normal leading-snug">
                Editorial Rigor
              </h3>
              <p className="text-xs sm:text-sm text-[#686B78] leading-relaxed font-light mt-2">
                We curate only ideas that endure. Every manuscript is thoroughly line-edited to maximize signal density, clarify argument structures, and eliminate superficial digital filler.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8E2D8] text-[11px] text-[#171D50] font-medium">
              Manuscript Verification & Peer Review →
            </div>
          </div>

          {/* Pillar 2: DRM-Free Ownership & Bookbinding Craft */}
          <div className="p-8 bg-[#FAF7F0] border border-[#EBE6DF] rounded-3xl space-y-4 hover:shadow-md hover:border-[#171D50]/30 transition-all group flex flex-col justify-between">
            <div>
              {/* Handcrafted Line Art Plate */}
              <div className="w-full h-36 p-4 bg-white/90 border border-[#E8E2D8] rounded-2xl flex items-center justify-center mb-6 group-hover:border-[#171D50]/40 transition-colors shadow-2xs">
                <BookbindingCraftVignette className="w-full h-full" strokeColor="#171D50" />
              </div>

              <div className="text-[11px] uppercase tracking-[0.2em] text-[#686B78] font-medium mb-1">
                Pillar II · Digital Ownership
              </div>
              <h3 className="font-editorial text-2xl text-[#171923] font-normal leading-snug">
                DRM-Free Formats
              </h3>
              <p className="text-xs sm:text-sm text-[#686B78] leading-relaxed font-light mt-2">
                Readers own their books permanently. Distributed in universally compatible PDF and EPUB files readable across Apple Books, Kindle, Kobo, reMarkable, and desktops without lock-in.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8E2D8] text-[11px] text-[#171D50] font-medium">
              Permanent Lifetime Download Access →
            </div>
          </div>

          {/* Pillar 3: Local & Global Reach & Typography Specimen */}
          <div className="p-8 bg-[#FAF7F0] border border-[#EBE6DF] rounded-3xl space-y-4 hover:shadow-md hover:border-[#171D50]/30 transition-all group flex flex-col justify-between">
            <div>
              {/* Handcrafted Line Art Plate */}
              <div className="w-full h-36 p-4 bg-white/90 border border-[#E8E2D8] rounded-2xl flex items-center justify-center mb-6 group-hover:border-[#171D50]/40 transition-colors shadow-2xs">
                <OpenCodexSpecimen className="w-full h-full" strokeColor="#171D50" />
              </div>

              <div className="text-[11px] uppercase tracking-[0.2em] text-[#686B78] font-medium mb-1">
                Pillar III · Universal Exchange
              </div>
              <h3 className="font-editorial text-2xl text-[#171923] font-normal leading-snug">
                Local & Global Access
              </h3>
              <p className="text-xs sm:text-sm text-[#686B78] leading-relaxed font-light mt-2">
                Seamless instantaneous purchases in Bangladeshi Taka (৳ BDT) via bKash, Nagad, Rocket, and local bank cards, alongside seamless international checkout for readers worldwide.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8E2D8] text-[11px] text-[#171D50] font-medium">
              Zero Transaction Friction Across Devices →
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
