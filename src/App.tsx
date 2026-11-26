import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { Hero } from './components/home/Hero';
import { BookCatalogue } from './components/bookstore/BookCatalogue';
import { AboutSection } from './components/home/AboutSection';
import { NewsletterSection } from './components/home/NewsletterSection';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { BookDetailsModal } from './components/bookstore/BookDetailsModal';
import { SampleReaderModal } from './components/bookstore/SampleReaderModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderSuccessModal } from './components/checkout/OrderSuccessModal';
import { OrderLookupModal } from './components/orders/OrderLookupModal';
import { ReadingStudioModal } from './components/home/ReadingStudioModal';
import { AuthPage } from './components/auth/AuthPage';
import { PublishBookPage } from './components/publish/PublishBookPage';
import { Toast } from './components/ui/Toast';

type AppView = 'store' | 'auth' | 'publish';

function getInitialView(): AppView {
  if (typeof window === 'undefined') return 'store';
  if (window.location.hash === '#auth' || window.location.pathname === '/auth') return 'auth';
  if (window.location.hash === '#publish' || window.location.pathname === '/publish') return 'publish';
  return 'store';
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>(getInitialView);
  const [authRedirectReason, setAuthRedirectReason] = useState<string | null>(null);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [isReadingStudioOpen, setIsReadingStudioOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      setActiveView(getInitialView());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateTo = (view: AppView, reason?: string) => {
    setAuthRedirectReason(reason || null);
    setActiveView(view);
    if (typeof window !== 'undefined') {
      const targetHash = view === 'store' ? '' : `#${view}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState({}, '', targetHash || window.location.pathname);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <StoreProvider>
      <div className="min-h-screen bg-[#F5F4EF] text-[#171923] flex flex-col font-sans selection:bg-[#171D50] selection:text-white">
        <Header
          activeView={activeView}
          onNavigateStore={() => navigateTo('store')}
          onOpenAuth={(reason) => navigateTo('auth', reason)}
          onOpenPublish={() => navigateTo('publish')}
          onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
        />

        <main className="flex-1">
          {activeView === 'auth' ? (
            <AuthPage
              onBackToStore={() => navigateTo('store')}
              onOpenPublish={() => navigateTo('publish')}
              redirectReason={authRedirectReason}
            />
          ) : activeView === 'publish' ? (
            <PublishBookPage
              onBackToStore={() => navigateTo('store')}
              onOpenAuth={(reason) => navigateTo('auth', reason)}
            />
          ) : (
            <>
              <Hero
                onOpenReadingStudio={() => setIsReadingStudioOpen(true)}
                onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
                onOpenAuth={() => navigateTo('auth')}
                onOpenPublish={() => navigateTo('publish')}
              />

              <BookCatalogue
                onOpenReadingStudio={() => setIsReadingStudioOpen(true)}
                onOpenPublish={() => navigateTo('publish')}
              />

              <AboutSection />

              <NewsletterSection />
            </>
          )}
        </main>

        <Footer
          onNavigateStore={() => navigateTo('store')}
          onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
          onOpenAuth={() => navigateTo('auth')}
          onOpenPublish={() => navigateTo('publish')}
        />

        {/* Global Modals & Drawers */}
        <CartDrawer />
        <BookDetailsModal />
        <SampleReaderModal />
        <CheckoutModal />
        <OrderSuccessModal />
        <OrderLookupModal
          isOpen={isOrderLookupOpen}
          onClose={() => setIsOrderLookupOpen(false)}
          onOpenAuth={() => {
            setIsOrderLookupOpen(false);
            navigateTo('auth');
          }}
          onOpenPublish={() => {
            setIsOrderLookupOpen(false);
            navigateTo('publish');
          }}
        />
        <ReadingStudioModal
          isOpen={isReadingStudioOpen}
          onClose={() => setIsReadingStudioOpen(false)}
        />
        <Toast />
      </div>
    </StoreProvider>
  );
}
