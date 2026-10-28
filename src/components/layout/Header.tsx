import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Shield, Search, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeaderProps {
  onOpenOrderLookup: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOrderLookup, onOpenAdmin }) => {
  const { cartCount, setIsCartOpen } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#171D50] border-b border-[#242C6B] shadow-sm transition-colors">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Text-Only Wordmark in White — Exact requirement */}
        <div className="flex items-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex flex-col justify-center"
            aria-label="Al Jabin Publications Home"
          >
            <span className="font-editorial text-2xl sm:text-[26px] tracking-[0.14em] uppercase font-semibold text-white leading-none transition-opacity group-hover:opacity-90">
              Al Jabin Publications
            </span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-[13.5px] font-medium tracking-wide text-white/80">
          <button
            onClick={() => scrollToSection('bookstore')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Books
          </button>
          <button
            onClick={() => scrollToSection('featured-collection')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Collections
          </button>
          <button
            onClick={() => scrollToSection('our-story')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Our Story
          </button>
          <button
            onClick={() => scrollToSection('newsletter')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Updates
          </button>
          <button
            onClick={onOpenOrderLookup}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Find Order
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Admin shortcut button */}
          <button
            onClick={onOpenAdmin}
            title="Publisher Admin Portal"
            className="hidden lg:flex items-center gap-1.5 text-xs text-white/80 hover:text-white px-3.5 py-1.5 transition-colors border border-white/20 hover:border-white/50 hover:bg-white/10 rounded-full"
            aria-label="Open Admin Dashboard"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          {/* Shopping Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer flex items-center justify-center"
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-white text-[#171D50] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#171D50]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-full focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/15 bg-[#131844] px-6 py-6 shadow-xl rounded-b-3xl transition-all text-white">
          <nav className="flex flex-col space-y-3 text-base font-medium">
            <button
              onClick={() => scrollToSection('bookstore')}
              className="text-left py-2.5 px-3 hover:bg-white/10 rounded-xl border-b border-white/10 flex items-center justify-between"
            >
              <span>Books Catalogue</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => scrollToSection('featured-collection')}
              className="text-left py-2.5 px-3 hover:bg-white/10 rounded-xl border-b border-white/10 flex items-center justify-between"
            >
              <span>Curated Collections</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => scrollToSection('our-story')}
              className="text-left py-2.5 px-3 hover:bg-white/10 rounded-xl border-b border-white/10 flex items-center justify-between"
            >
              <span>Our Publishing Story</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => scrollToSection('newsletter')}
              className="text-left py-2.5 px-3 hover:bg-white/10 rounded-xl border-b border-white/10 flex items-center justify-between"
            >
              <span>Dispatches & Updates</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOrderLookup();
              }}
              className="text-left py-2.5 px-3 text-white/80 hover:bg-white/10 rounded-xl border-b border-white/10 flex items-center justify-between"
            >
              <span>Download Access / Order Lookup</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="text-left py-2.5 px-3 text-white/80 hover:bg-white/10 rounded-xl flex items-center justify-between"
            >
              <span>Publisher Portal (Admin)</span>
              <Shield className="w-4 h-4 text-white/60" />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
