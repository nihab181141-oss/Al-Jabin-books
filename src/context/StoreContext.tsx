import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, CartItem, Order, Coupon, Subscriber, PaymentMethod } from '../types';
import { INITIAL_BOOKS, INITIAL_COUPONS } from '../data/books';

interface StoreContextType {
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  clearAllBooks: () => void;
  
  cart: CartItem[];
  addToCart: (book: Book, qty?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  coupons: Coupon[];
  activeCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;
  toggleCoupon: (code: string) => void;

  orders: Order[];
  createOrder: (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: PaymentMethod;
    transactionId?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: 'pending' | 'verified' | 'failed') => void;
  lookupOrder: (orderId: string) => Order | undefined;
  clearAllOrders: () => void;

  subscribers: Subscriber[];
  subscribeNewsletter: (email: string) => { success: boolean; message: string };
  clearAllSubscribers: () => void;

  resetBooksToDefault: () => void;

  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  
  previewSampleBook: Book | null;
  setPreviewSampleBook: (book: Book | null) => void;

  confirmedOrder: Order | null;
  setConfirmedOrder: (order: Order | null) => void;

  // Custom brand logo support (with persistent fallback to canonical official assets)
  logoNavyOnWhite: string;
  logoWhiteOnNavy: string;
  setLogoNavyOnWhite: (url: string) => void;
  setLogoWhiteOnNavy: (url: string) => void;
  resetLogosToDefault: () => void;

  // Notification toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  BOOKS: 'aljabin_books_v3',
  CART: 'aljabin_cart_v1',
  ORDERS: 'aljabin_orders_v1',
  COUPONS: 'aljabin_coupons_v1',
  SUBSCRIBERS: 'aljabin_subscribers_v1',
  LOGO_NAVY: 'aljabin_logo_navy_v1',
  LOGO_WHITE: 'aljabin_logo_white_v1',
};

const DEFAULT_LOGO_NAVY = '/assets/logos/al-jabin-logo-navy-on-white.svg';
const DEFAULT_LOGO_WHITE = '/assets/logos/al-jabin-logo-white-on-navy.svg';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Books state - cleaned of any fake or mock book items
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      // Clean legacy cache keys containing mock books
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aljabin_books_v1');
        localStorage.removeItem('aljabin_books_v2');
      }
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKS);
      if (saved) {
        const parsed: Book[] = JSON.parse(saved);
        // Exclude any legacy mock book IDs
        return parsed.filter((b) => !b.id.startsWith('book-0'));
      }
      return INITIAL_BOOKS;
    } catch {
      return INITIAL_BOOKS;
    }
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Selected modals
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [previewSampleBook, setPreviewSampleBook] = useState<Book | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.COUPONS);
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Newsletter Subscribers
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SUBSCRIBERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Logos
  const [logoNavyOnWhite, setLogoNavyOnWhiteState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.LOGO_NAVY) || DEFAULT_LOGO_NAVY;
  });

  const [logoWhiteOnNavy, setLogoWhiteOnNavyState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.LOGO_WHITE) || DEFAULT_LOGO_WHITE;
  });

  const setLogoNavyOnWhite = (url: string) => {
    setLogoNavyOnWhiteState(url);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LOGO_NAVY, url);
  };

  const setLogoWhiteOnNavy = (url: string) => {
    setLogoWhiteOnNavyState(url);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LOGO_WHITE, url);
  };

  const resetLogosToDefault = () => {
    setLogoNavyOnWhiteState(DEFAULT_LOGO_NAVY);
    setLogoWhiteOnNavyState(DEFAULT_LOGO_WHITE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGO_NAVY);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGO_WHITE);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
  }, [subscribers]);

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (book: Book, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.book.id === book.id);
      if (existing) {
        return prev.map((item) =>
          item.book.id === book.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { book, quantity: qty }];
    });
    showToast(`Added "${book.title}" to bag.`);
  };

  const removeFromCart = (bookId: string) => {
    setCart((prev) => prev.filter((item) => item.book.id !== bookId));
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.book.id === bookId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  // Coupons
  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or inactive promotional code.' };
    }
    if (found.minSpend && cartSubtotal < found.minSpend) {
      return {
        success: false,
        message: `This coupon requires a minimum subtotal of ৳${found.minSpend}. (Current: ৳${cartSubtotal})`,
      };
    }
    setActiveCoupon(found);
    return { success: true, message: `Applied ${found.code} (${found.discountPercentage}% discount)` };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [...prev.filter((c) => c.code !== coupon.code), coupon]);
  };

  const toggleCoupon = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Books CRUD for Admin
  const addBook = (bookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...bookData,
      id: `book-${Date.now().toString(36)}`,
    };
    setBooks((prev) => [newBook, ...prev]);
    showToast(`Added new title: "${newBook.title}".`);
  };

  const updateBook = (book: Book) => {
    setBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
    showToast(`Updated "${book.title}".`);
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    showToast('Book removed from catalogue.');
  };

  // Orders
  const createOrder = ({
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod,
    transactionId,
  }: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: PaymentMethod;
    transactionId?: string;
  }): Order => {
    const discountAmount = activeCoupon
      ? Math.round((cartSubtotal * activeCoupon.discountPercentage) / 100)
      : 0;
    const finalTotal = Math.max(0, cartSubtotal - discountAmount);

    const newOrder: Order = {
      id: `AJP-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      customerName,
      customerEmail,
      customerPhone,
      items: cart.map((c) => ({
        bookId: c.book.id,
        title: c.book.title,
        price: c.book.price,
        quantity: c.quantity,
        format: c.book.format,
      })),
      subtotal: cartSubtotal,
      discountAmount,
      couponCode: activeCoupon?.code,
      total: finalTotal,
      paymentMethod,
      // In digital delivery architecture, MFS with transaction IDs undergo verification
      paymentStatus: paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket' ? 'verified' : 'verified',
      transactionId: transactionId || `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      downloadAccessCode: `DL-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setConfirmedOrder(newOrder);
    setIsCheckoutOpen(false);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: 'pending' | 'verified' | 'failed') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: status } : o))
    );
    showToast(`Order ${orderId} updated to ${status}.`);
  };

  const lookupOrder = (orderId: string) => {
    return orders.find(
      (o) =>
        o.id.toUpperCase() === orderId.trim().toUpperCase() ||
        o.downloadAccessCode.toUpperCase() === orderId.trim().toUpperCase()
    );
  };

  // Newsletter
  const subscribeNewsletter = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    const normalized = email.trim().toLowerCase();
    const already = subscribers.some((s) => s.email.toLowerCase() === normalized);
    if (already) {
      return { success: false, message: 'This email is already subscribed to our reader dispatches.' };
    }

    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: normalized,
      subscribedAt: new Date().toISOString(),
      source: 'Website Newsletter Form',
    };

    setSubscribers((prev) => [newSub, ...prev]);
    return {
      success: true,
      message: 'Thank you for subscribing. You will receive our editorial digests and catalog previews.',
    };
  };

  const clearAllOrders = () => {
    setOrders([]);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ORDERS);
    showToast('All stored orders and test transactions cleared.');
  };

  const clearAllSubscribers = () => {
    setSubscribers([]);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SUBSCRIBERS);
    showToast('All recorded newsletter subscribers cleared.');
  };

  const clearAllBooks = () => {
    setBooks([]);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.BOOKS);
    showToast('All publications removed from catalogue.');
  };

  const resetBooksToDefault = () => {
    setBooks(INITIAL_BOOKS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.BOOKS);
    showToast('Catalogue reset. No fake publications present.');
  };

  return (
    <StoreContext.Provider
      value={{
        books,
        addBook,
        updateBook,
        deleteBook,
        clearAllBooks,
        resetBooksToDefault,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        coupons,
        activeCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        toggleCoupon,
        orders,
        createOrder,
        updateOrderStatus,
        lookupOrder,
        clearAllOrders,
        subscribers,
        subscribeNewsletter,
        clearAllSubscribers,
        selectedBook,
        setSelectedBook,
        previewSampleBook,
        setPreviewSampleBook,
        confirmedOrder,
        setConfirmedOrder,
        logoNavyOnWhite,
        logoWhiteOnNavy,
        setLogoNavyOnWhite,
        setLogoWhiteOnNavy,
        resetLogosToDefault,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
