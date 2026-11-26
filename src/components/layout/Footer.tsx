import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigateStore: () => void;
  onOpenOrderLookup: () => void;
  onOpenAuth: () => void;
  onOpenPublish: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateStore,
  onOpenOrderLookup,
  onOpenAuth,
  onOpenPublish,
}) => {
  const { logoStackedColor } = useStore();

  const scrollToSection = (id: string) => {
    onNavigateStore();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <footer className="w-full bg-[#F5F4EF] text-[#171923] border-t border-black/[0.08] selection:bg-[#171D50] selection:text-white">
      {/* Main Footer */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-10 sm:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-10 border-b border-black/[0.08]">
          {/* Brand Mission Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center">
              <img
                src={logoStackedColor}
                alt="Al Jabin Publications Crest"
                className="w-24 sm:w-28 h-auto object-contain shrink-0"
              />
              <h3 className="sr-only">
                Al Jabin Publications
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-[#575A66] max-w-sm font-sans font-normal">
              An independent publishing house committed to rigorous thought, mental clarity, and enduring perspectives. Open for readers and independent ebook authors worldwide.
            </p>
            <div className="pt-1 flex items-center space-x-2 text-xs text-[#575A66]">
              <MapPin className="w-3.5 h-3.5 text-[#171D50] shrink-0" />
              <span>Dhaka, Bangladesh · Global Digital Distribution</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#575A66]">
              <Mail className="w-3.5 h-3.5 text-[#171D50] shrink-0" />
              <span>editorial@aljabinpublications.com</span>
            </div>
          </div>

          {/* Catalogue Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.22em] font-extrabold text-[#171D50]">
              Catalogue
            </h4>
            <ul className="space-y-2 text-sm text-[#575A66] font-normal">
              <li>
                <button
                  onClick={() => scrollToSection('bookstore')}
                  className="hover:text-[#171D50] transition-colors cursor-pointer text-left"
                >
                  All Publications
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('bookstore')}
                  className="hover:text-[#171D50] transition-colors cursor-pointer text-left"
                >
                  Mindset Series
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('bookstore')}
                  className="hover:text-[#171D50] transition-colors cursor-pointer text-left"
                >
                  Productivity
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('bookstore')}
                  className="hover:text-[#171D50] transition-colors cursor-pointer text-left"
                >
                  Personal Growth
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('bookstore')}
                  className="hover:text-[#171D50] transition-colors cursor-pointer text-left"
                >
                  Literary Fiction
                </button>
              </li>
            </ul>
          </div>

          {/* Publishing & Author Portal Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.22em] font-extrabold text-[#171D50]">
              Publishing
            </h4>
            <ul className="space-y-2 text-sm text-[#575A66] font-normal">
              <li>
                <button
                  onClick={onOpenPublish}
                  className="hover:text-[#0f1338] transition-colors cursor-pointer text-left text-[#171D50] font-semibold underline decoration-[#171D50]/30 underline-offset-4"
                >
                  Publish an Ebook
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAuth}
                  className="hover:text-[#171D50] transition-colors cursor-pointer text-left"
                >
                  Sign In / Author Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('our-story')}
                  className="hover:text-[#171D50] transition-colors cursor-pointer text-left"
                >
                  Editorial Story
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOrderLookup}
                  className="hover:text-[#171D50] transition-colors cursor-pointer text-left"
                >
                  Find Purchased Order
                </button>
              </li>
            </ul>
          </div>

          {/* Secure Digital Delivery & Payment Trust */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.22em] font-extrabold text-[#171D50]">
              Verified Delivery
            </h4>
            <p className="text-xs text-[#575A66] leading-relaxed font-normal">
              Instant DRM-free delivery in high-fidelity PDF & EPUB. Compatible with Apple Books, Kindle, Kobo, and desktop readers.
            </p>
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#D97706] block mb-1.5 font-extrabold">
                Accepted Payment Gateways
              </span>
              <p className="text-xs text-[#171923] font-bold leading-relaxed">
                bKash · Nagad · Rocket · Visa / MC · Amex · Free Editions
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between text-xs text-[#686B78] gap-4 text-center sm:text-left">
          <div>
            <span>© 2026 Al Jabin Publications. Independent Publishing House.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[#575A66]">
            <span className="hover:text-[#171D50] transition-colors cursor-pointer">Terms of Digital Service</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-[#171D50] transition-colors cursor-pointer">Privacy & Data</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-[#171D50] transition-colors cursor-pointer">Author Rights</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
