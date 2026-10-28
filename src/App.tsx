import React, { useState } from 'react';
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
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ReadingStudioModal } from './components/home/ReadingStudioModal';
import { SSLCommerzSimulator } from './components/checkout/SSLCommerzSimulator';
import { Toast } from './components/ui/Toast';

export default function App() {
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isReadingStudioOpen, setIsReadingStudioOpen] = useState(false);

  return (
    <StoreProvider>
      <div className="min-h-screen bg-white text-[#171923] flex flex-col font-sans selection:bg-[#171D50] selection:text-white">
        
        {/* Header with Text-Only Wordmark as required */}
        <Header
          onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* Main Editorial Content */}
        <main className="flex-1">
          {/* Hero Section */}
          <Hero onOpenReadingStudio={() => setIsReadingStudioOpen(true)} />

          {/* Complete Bookstore Catalogue with Filters */}
          <BookCatalogue onOpenReadingStudio={() => setIsReadingStudioOpen(true)} />

          {/* About Al Jabin Publications Mission & Emblem */}
          <AboutSection />

          {/* Reader Dispatches Newsletter */}
          <NewsletterSection />
        </main>

        {/* Full-Width Navy Blue Footer with Original Centered Logo Strip */}
        <Footer
          onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
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
        />
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
        <ReadingStudioModal
          isOpen={isReadingStudioOpen}
          onClose={() => setIsReadingStudioOpen(false)}
        />
        <SSLCommerzSimulator />
        <Toast />

      </div>
    </StoreProvider>
  );
}
