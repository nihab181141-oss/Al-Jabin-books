import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, Mail, MapPin, Globe, CreditCard } from 'lucide-react';

interface FooterProps {
  onOpenOrderLookup: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenOrderLookup, onOpenAdmin }) => {
  const { logoWhiteOnNavy } = useStore();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#171D50] text-white selection:bg-white selection:text-[#171D50]">
      {/* Upper Footer - Centered Container with Full-Width Background */}
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Brand Mission Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-editorial text-2xl tracking-wider text-white">
              Al Jabin Publications
            </h3>
            <p className="text-sm leading-relaxed text-white/70 max-w-sm font-sans font-light">
              An independent publishing house committed to rigorous thought, mental clarity, and enduring perspectives. Delivering digital volumes to curious minds across Bangladesh and international borders.
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

          {/* Publishing House Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50">
              Publishing
            </h4>
            <ul className="space-y-2 text-sm text-white/80 font-light">
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
                  onClick={() => scrollToSection('featured-collection')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Curated Volumes
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOrderLookup}
                  className="hover:text-white transition-colors cursor-pointer text-left text-white/90 underline decoration-white/30 underline-offset-4"
                >
                  Find Purchased Order
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-white transition-colors cursor-pointer text-left text-white/60"
                >
                  Publisher Portal
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
              <span className="text-[11px] uppercase tracking-wider text-white/40 block mb-2 font-medium">
                Accepted Payment Gateways
              </span>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/80">
                <span className="px-3 py-1 bg-white/10 rounded-full">bKash</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">Nagad</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">Rocket</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">Visa / MC</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">Amex</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">Stripe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Info Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 space-y-4 sm:space-y-0">
          <div>
            <span>© 2026 Al Jabin Publications. Independent Publishing House.</span>
          </div>
          <div className="flex items-center space-x-6 text-white/60">
            <span className="hover:text-white cursor-pointer">Terms of Digital Service</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer">Privacy & Data</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer">Digital Rights</span>
          </div>
        </div>
      </div>

      {/* FINAL BOTTOM-MOST BRAND STRIP — STRICT REQUIREMENT */}
      {/*
        Display the original white-on-navy logo image.
        Centered, object-fit contain, responsive max-width 320-380px,
        adequate vertical padding, matching deep navy background.
      */}
      <div className="w-full bg-[#171D50] border-t border-white/10 py-12 px-4 sm:px-6">
        <div className="max-w-[1160px] mx-auto flex flex-col items-center justify-center">
          <div className="w-full flex justify-center items-center">
            <img
              src={logoWhiteOnNavy}
              alt="Al Jabin Publications Official Logo"
              className="max-w-[280px] sm:max-w-[340px] md:max-w-[380px] w-full h-auto object-contain select-none transition-opacity duration-300"
              style={{
                objectFit: 'contain',
                maxHeight: '110px',
              }}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
