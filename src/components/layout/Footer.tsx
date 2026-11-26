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
  const { logoStackedColor, logoIconColor } = useStore();

  const scrollToSection = (id: string) => {
    onNavigateStore();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <footer className="w-full bg-[#171D50] text-white selection:bg-white selection:text-[#171D50]">
      {/* Upper Footer */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-12 sm:pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand Mission Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoIconColor}
                alt="Al Jabin Publications Emblem"
                className="w-8 h-8 object-contain brightness-0 invert shrink-0"
              />
              <h3 className="font-editorial text-2xl tracking-wider text-white">
                Al Jabin Publications
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-white/70 max-w-sm font-sans font-light">
              An independent publishing house committed to rigorous thought, mental clarity, and enduring perspectives. Open for readers and independent ebook authors worldwide.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-white/60">
              <MapPin className="w-3.5 h-3.5 text-white/40" />
              <span>Dhaka, Bangladesh · Global Digital Distribution</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-white/60">
              <Mail className="w-3.5 h-3.5 text-white/40" />
              <span>editorial@aljabinpublications.com</span>
            </div>
          </div>

          {/* Catalogue Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50">
              Catalogue
            </h4>
            <ul className="space-y-2 text-sm text-white/80 font-light">
              <li>
                <button
                  onClick={() => scrollToSection('bookstore')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  All Publications
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('bookstore')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Mindset Series
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('bookstore')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Productivity
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('bookstore')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Personal Growth
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('bookstore')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Literary Fiction
                </button>
              </li>
            </ul>
          </div>

          {/* Publishing & Author Portal Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50">
              Publishing
            </h4>
            <ul className="space-y-2 text-sm text-white/80 font-light">
              <li>
                <button
                  onClick={onOpenPublish}
                  className="hover:text-white transition-colors cursor-pointer text-left text-white font-normal underline decoration-white/30 underline-offset-4"
                >
                  Publish an Ebook
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAuth}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sign In / Author Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('our-story')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Editorial Story
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOrderLookup}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Find Purchased Order
                </button>
              </li>
            </ul>
          </div>

          {/* Secure Digital Delivery & Payment Trust */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50">
              Verified Delivery
            </h4>
            <p className="text-xs text-white/70 leading-relaxed font-light">
              Instant DRM-free delivery in high-fidelity PDF & EPUB. Compatible with Apple Books, Kindle, Kobo, and desktop readers.
            </p>
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-white/45 block mb-1.5 font-medium">
                Accepted Payment Gateways
              </span>
              <p className="text-xs text-white/80 font-light leading-relaxed">
                bKash · Nagad · Rocket · Visa / MC · Amex · Free Editions
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Info Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/55 gap-4 text-center sm:text-left">
          <div>
            <span>© 2026 Al Jabin Publications. Independent Publishing House.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-white/65">
            <span className="hover:text-white cursor-pointer">Terms of Digital Service</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-white cursor-pointer">Privacy & Data</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-white cursor-pointer">Author Rights</span>
          </div>
        </div>
      </div>

      {/* FINAL BOTTOM-MOST BRAND COLOPHON STRIP — Official Stacked Color Crest */}
      <div className="w-full bg-[#F5F4EF] border-t border-black/[0.08] py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center justify-center gap-3">
          <img
            src={logoStackedColor}
            alt="Al Jabin Publications Official Crest"
            className="w-40 sm:w-48 h-auto object-contain select-none"
            loading="lazy"
          />
        </div>
      </div>
    </footer>
  );
};
