import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  User,
  PenTool,
  BarChart3,
  LogIn,
  UserPlus,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';

interface HeaderProps {
  activeView: 'store' | 'auth' | 'publish' | 'dashboard';
  onNavigateStore: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup', reason?: string) => void;
  onOpenPublish: () => void;
  onOpenDashboard: () => void;
  onOpenOrderLookup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigateStore,
  onOpenAuth,
  onOpenPublish,
  onOpenDashboard,
  onOpenOrderLookup,
}) => {
  const {
    cartCount,
    setIsCartOpen,
    currentUser,
    userProfile,
    logoutUser,
    logoIconColor,
    logoWordmarkColor,
  } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [drawerOpen]);

  const scrollToSection = (id: string) => {
    setDrawerOpen(false);
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
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/[0.08] text-[#171923] shadow-2xs transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-5 bg-white">
          {/* Zone 1: Brand Icon Logo + Wordmark SVG Lockup */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setDrawerOpen(false);
              onNavigateStore();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-0 whitespace-nowrap shrink-0"
            aria-label="Al Jabin Publications Home"
          >
            <img
              src={logoIconColor}
              alt="Al Jabin Publications Icon"
              className="h-12 sm:h-[60px] w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            <img
              src={logoWordmarkColor}
              alt="Al Jabin Publications"
              className="h-14 sm:h-[74px] w-auto object-contain shrink-0 -ml-3.5 sm:-ml-5"
            />
            <span className="sr-only">Al Jabin Publications</span>
          </a>

          {/* Zone 2: Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-6 text-[13.5px] font-bold tracking-tight text-[#575A66]"
          >
            <button
              type="button"
              onClick={() => scrollToSection('bookstore')}
              className="hover:text-[#171D50] transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#171D50]/30"
            >
              Books
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('our-story')}
              className="hover:text-[#171D50] transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#171D50]/30"
            >
              Our Story
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('newsletter')}
              className="hover:text-[#171D50] transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#171D50]/30"
            >
              Dispatches
            </button>
            <button
              type="button"
              onClick={onOpenOrderLookup}
              className="hover:text-[#171D50] transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#171D50]/30"
            >
              Find Order
            </button>

            {/* Private Author Dashboard Tab — Rendered ONLY when authenticated */}
            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenDashboard();
                }}
                className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  activeView === 'dashboard'
                    ? 'text-[#171D50] font-semibold border-[#171D50]'
                    : 'text-[#575A66] hover:text-[#171D50] border-transparent hover:border-[#171D50]/30'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Author Dashboard</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Auth Actions, Bag & Right-to-Left Hamburger Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {!currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-bold tracking-tight text-[#171923] hover:text-[#171D50] bg-white border border-black/[0.12] hover:border-[#171D50] rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-bold tracking-tight text-white bg-[#171D50] hover:bg-[#0f1338] rounded-full transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenPublish();
                  }}
                  className={`hidden sm:inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap border ${
                    activeView === 'publish'
                      ? 'bg-[#171D50] text-white border-[#171D50]'
                      : 'bg-[#F5F4EF] text-[#171D50] border-black/[0.08] hover:border-[#171D50]'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Publish Ebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenAuth('signin');
                  }}
                  className={`hidden md:inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap border ${
                    activeView === 'auth'
                      ? 'bg-[#171D50] text-white border-[#171D50]'
                      : 'bg-white text-[#171923] border-black/[0.1] hover:border-[#171D50]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[110px] truncate">{displayAccountLabel}</span>
                </button>
              </>
            )}

            {/* Shopping Bag Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative min-w-[44px] min-h-[44px] px-2.5 text-[#171923] hover:bg-[#F5F4EF] rounded-full transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              <span className="hidden xl:inline text-xs font-bold tracking-tight">Bag</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#171D50] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Right-to-Left Drawer Hamburger Toggle (Available Across All Screen Sizes) */}
            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#171923] hover:bg-[#F5F4EF] border border-black/[0.08] rounded-full focus:outline-none transition-colors cursor-pointer shrink-0"
              aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={drawerOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Right-to-Left Smooth Sliding Drawer Navigation */}
      <AnimatePresence>
        {drawerOpen && (
          <div
            id="mobile-navigation-drawer"
            className="fixed inset-0 z-50 flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation drawer"
          >
            {/* Translucent Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-[#171923]/40 backdrop-blur-[2px]"
            />

            {/* Sliding Panel (Right -> Left) */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 36, mass: 0.9 }}
              className="relative z-10 w-full max-w-[340px] h-full bg-white text-[#171923] border-l border-black/[0.08] shadow-2xl flex flex-col justify-between overflow-y-auto will-change-transform"
            >
              {/* Drawer Top Brand Header */}
              <div>
                <div className="px-5 h-16 sm:h-20 border-b border-black/[0.08] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img
                      src={logoIconColor}
                      alt="Al Jabin Icon"
                      className="h-7 w-auto object-contain shrink-0"
                    />
                    <img
                      src={logoWordmarkColor}
                      alt="Al Jabin Publications"
                      className="h-9 w-auto object-contain shrink-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close navigation menu"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#575A66] hover:text-[#171923] hover:bg-[#F5F4EF] transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Signed-in Author Summary */}
                {currentUser && (
                  <div className="mx-5 mt-5 p-3.5 bg-[#F5F4EF] border border-black/[0.06] rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#171D50] text-white flex items-center justify-center font-editorial text-base shrink-0">
                      {(displayAccountLabel?.[0] || 'A').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#171923] truncate">
                        {displayAccountLabel}
                      </div>
                      <div className="text-[11px] text-[#686B78] truncate">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                )}

                {/* Accessible Vertical Navigation List */}
                <nav aria-label="Mobile Navigation" className="p-4 space-y-4">
                  <div>
                    <div className="px-3 pb-1.5 text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-extrabold">
                      Explore
                    </div>
                    <ul className="flex flex-col space-y-1 text-[15px] font-bold tracking-tight">
                      <li>
                        <button
                          type="button"
                          onClick={() => scrollToSection('bookstore')}
                          className="w-full text-left min-h-[44px] px-3.5 hover:bg-[#F5F4EF] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <BookOpen className="w-4 h-4 text-[#171D50]" />
                            <span>Books Catalogue</span>
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#686B78]" />
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => scrollToSection('our-story')}
                          className="w-full text-left min-h-[44px] px-3.5 hover:bg-[#F5F4EF] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span>Our Publishing Story</span>
                          <ArrowRight className="w-4 h-4 text-[#686B78]" />
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => scrollToSection('newsletter')}
                          className="w-full text-left min-h-[44px] px-3.5 hover:bg-[#F5F4EF] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span>Dispatches & Updates</span>
                          <ArrowRight className="w-4 h-4 text-[#686B78]" />
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setDrawerOpen(false);
                            onOpenOrderLookup();
                          }}
                          className="w-full text-left min-h-[44px] px-3.5 hover:bg-[#F5F4EF] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span>Find Order & Library</span>
                          <ArrowRight className="w-4 h-4 text-[#686B78]" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Authenticated-Only Author Studio Vertical List */}
                  {currentUser && (
                    <div className="pt-3 border-t border-black/[0.08]">
                      <div className="px-3 pb-1.5 text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-extrabold">
                        Author Studio
                      </div>
                      <ul className="flex flex-col space-y-1 text-[15px] font-bold tracking-tight">
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              setDrawerOpen(false);
                              onOpenDashboard();
                            }}
                            className={`w-full text-left min-h-[44px] px-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                              activeView === 'dashboard'
                                ? 'bg-[#171D50] text-white'
                                : 'hover:bg-[#F5F4EF] text-[#171923]'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <BarChart3 className="w-4 h-4" />
                              <span>Author Dashboard</span>
                            </span>
                            <ArrowRight className="w-4 h-4 opacity-70" />
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              setDrawerOpen(false);
                              onOpenPublish();
                            }}
                            className={`w-full text-left min-h-[44px] px-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                              activeView === 'publish'
                                ? 'bg-[#171D50] text-white'
                                : 'hover:bg-[#F5F4EF] text-[#171923]'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <PenTool className="w-4 h-4" />
                              <span>Publish an Ebook</span>
                            </span>
                            <ArrowRight className="w-4 h-4 opacity-70" />
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              setDrawerOpen(false);
                              onOpenAuth('signin');
                            }}
                            className="w-full text-left min-h-[44px] px-3.5 hover:bg-[#F5F4EF] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <span className="flex items-center gap-2.5">
                              <User className="w-4 h-4 text-[#171D50]" />
                              <span>Account & Purchases</span>
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#686B78]" />
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </nav>
              </div>

              {/* Drawer Footer Auth Actions */}
              <div className="p-5 border-t border-black/[0.08] bg-[#FAF9F6] space-y-2.5">
                {!currentUser ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        onOpenAuth('signup');
                      }}
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up Free</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        onOpenAuth('signin');
                      }}
                      className="w-full min-h-[44px] px-4 py-2.5 bg-white text-[#171923] border border-black/[0.12] hover:border-[#171D50] text-xs font-semibold rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        onOpenAuth('signup', 'Sign up or log in to publish your own ebook.');
                      }}
                      className="w-full min-h-[40px] px-4 py-2 text-xs font-medium text-[#171D50] hover:underline flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Publish Your Own Ebook</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      setDrawerOpen(false);
                      await logoutUser();
                      onNavigateStore();
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-white text-rose-700 border border-black/[0.1] hover:border-rose-300 text-xs font-semibold rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
