import React, { useState } from 'react';
import { ShoppingBag, Menu, X, ArrowRight, User, PenTool } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeaderProps {
  activeView: 'store' | 'auth' | 'publish';
  onNavigateStore: () => void;
  onOpenAuth: (reason?: string) => void;
  onOpenPublish: () => void;
  onOpenOrderLookup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigateStore,
  onOpenAuth,
  onOpenPublish,
  onOpenOrderLookup,
}) => {
  const { cartCount, setIsCartOpen, currentUser, userProfile, logoIconColor } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (activeView !== 'store') {
      onNavigateStore();
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayAccountLabel =
    userProfile?.penName ||
    userProfile?.displayName ||
    currentUser?.displayName ||
    (currentUser?.email ? currentUser.email.split('@')[0] : null);

  return (
    <header className="sticky top-0 z-40 bg-[#171D50] border-b border-[#242C6B] shadow-sm transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 lg:gap-6">
        {/* Zone 1: Brand Emblem + Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigateStore();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-2.5 sm:gap-3 whitespace-nowrap shrink-0"
          aria-label="Al Jabin Publications Home"
        >
          <img
            src={logoIconColor}
            alt="Al Jabin Crest"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain brightness-0 invert shrink-0 transition-transform group-hover:scale-105"
          />
          <span className="font-editorial text-base sm:text-xl lg:text-[22px] tracking-[0.1em] sm:tracking-[0.13em] uppercase font-semibold text-white leading-none transition-opacity group-hover:opacity-90 whitespace-nowrap">
            Al Jabin Publications
          </span>
        </a>

        {/* Zone 2: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium tracking-wide text-white/80">
          <button
            onClick={() => scrollToSection('bookstore')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-white/50"
          >
            Books
          </button>
          <button
            onClick={() => scrollToSection('our-story')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-white/50"
          >
            Our Story
          </button>
          <button
            onClick={() => scrollToSection('newsletter')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-white/50"
          >
            Dispatches
          </button>
          <button
            onClick={onOpenOrderLookup}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-white/50"
          >
            Find Order
          </button>
        </nav>

        {/* Zone 3: Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Publish Ebook CTA */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (!currentUser) {
                onOpenAuth('Sign up or sign in to publish your own ebook.');
              } else {
                onOpenPublish();
              }
            }}
            className={`hidden sm:inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'publish'
                ? 'bg-white text-[#171D50]'
                : 'bg-white/12 text-white hover:bg-white/20 border border-white/15'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Publish Ebook</span>
          </button>

          {/* Dedicated Sign In / Account Page Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAuth();
            }}
            className={`hidden md:inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'auth'
                ? 'bg-white text-[#171D50]'
                : 'bg-white text-[#171D50] hover:bg-white/90'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[120px] truncate">
              {displayAccountLabel || 'Sign In / Join'}
            </span>
          </button>

          {/* Shopping Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative min-w-[44px] min-h-[44px] px-2.5 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            <span className="hidden xl:inline text-xs font-medium tracking-wide">Bag</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-white text-[#171D50] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#171D50] tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:bg-white/10 rounded-full focus:outline-none transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/15 bg-[#131844] px-4 sm:px-6 py-5 shadow-xl text-white">
          <nav className="flex flex-col space-y-1.5 text-sm font-medium">
            <button
              onClick={() => scrollToSection('bookstore')}
              className="text-left min-h-[44px] px-3 hover:bg-white/10 rounded-xl flex items-center justify-between cursor-pointer"
            >
              <span>Books Catalogue</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => scrollToSection('our-story')}
              className="text-left min-h-[44px] px-3 hover:bg-white/10 rounded-xl flex items-center justify-between cursor-pointer"
            >
              <span>Our Publishing Story</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => scrollToSection('newsletter')}
              className="text-left min-h-[44px] px-3 hover:bg-white/10 rounded-xl flex items-center justify-between cursor-pointer"
            >
              <span>Dispatches & Updates</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOrderLookup();
              }}
              className="text-left min-h-[44px] px-3 hover:bg-white/10 rounded-xl flex items-center justify-between cursor-pointer"
            >
              <span>Find Order & Library</span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
            <div className="pt-3 mt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (!currentUser) {
                    onOpenAuth('Sign up or sign in to publish your own ebook.');
                  } else {
                    onOpenPublish();
                  }
                }}
                className="min-h-[44px] px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                <span>Publish Ebook</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="min-h-[44px] px-4 py-2.5 bg-white text-[#171D50] text-xs font-semibold rounded-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{displayAccountLabel ? 'My Account' : 'Sign In / Sign Up'}</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
