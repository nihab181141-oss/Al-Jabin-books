import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Book,
  CartItem,
  Order,
  Coupon,
  Subscriber,
  PaymentMethod,
  EntitledDownload,
  CustomerProfile,
} from '../types';
import { INITIAL_COUPONS } from '../data/books';
import { auth, db } from '../lib/firebase';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

interface StoreContextType {
  // Books catalog
  books: Book[];
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  previewSampleBook: Book | null;
  setPreviewSampleBook: (book: Book | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (book: Book, qty?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Checkout & Orders
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  orders: Order[];
  createOrder: (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: PaymentMethod;
    transactionId?: string;
  }) => Promise<{ order: Order }>;
  lookupOrder: (orderId: string) => Promise<Order | undefined>;
  confirmedOrder: Order | null;
  setConfirmedOrder: (order: Order | null) => void;

  // Coupons
  coupons: Coupon[];
  activeCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  // Customer Authentication & Library
  currentUser: FirebaseUser | null;
  userProfile: CustomerProfile | null;
  authLoading: boolean;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, name?: string) => Promise<void>;
  resetUserPassword: (e: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  userLibrary: EntitledDownload[];
  refreshUserLibrary: () => Promise<void>;

  // Newsletter
  subscribers: Subscriber[];
  subscribeNewsletter: (email: string) => { success: boolean; message: string };

  // Brand Logo Assets
  logoNavyOnWhite: string;
  logoWhiteOnNavy: string;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  BOOKS: 'aljabin_books_v4',
  CART: 'aljabin_cart_v2',
  ORDERS: 'aljabin_orders_v2',
  COUPONS: 'aljabin_coupons_v2',
  SUBSCRIBERS: 'aljabin_subscribers_v2',
  LOGO_NAVY: 'aljabin_logo_navy_v2',
  LOGO_WHITE: 'aljabin_logo_white_v2',
};

const DEFAULT_LOGO_NAVY = '/assets/logos/al-jabin-logo-navy-on-white.svg';
const DEFAULT_LOGO_WHITE = '/assets/logos/al-jabin-logo-white-on-navy.svg';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Books State — strictly real published titles from Firestore / backend
  const [books, setBooks] = useState<Book[]>([]);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [previewSampleBook, setPreviewSampleBook] = useState<Book | null>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Coupons State
  const [coupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<CustomerProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userLibrary, setUserLibrary] = useState<EntitledDownload[]>([]);

  // Newsletter Subscribers State
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SUBSCRIBERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Logos
  const [logoNavyOnWhite] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.LOGO_NAVY) || DEFAULT_LOGO_NAVY;
  });
  const [logoWhiteOnNavy] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.LOGO_WHITE) || DEFAULT_LOGO_WHITE;
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Clear any legacy cached fake book/coupon keys and fetch real published catalog
  useEffect(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.BOOKS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.COUPONS);
    } catch {}

    const fetchPublishedCatalog = async () => {
      try {
        const productsQuery = query(collection(db, 'products'), where('isPublished', '==', true));
        const snapshot = await getDocs(productsQuery);
        if (!snapshot.empty) {
          const firestoreBooks: Book[] = snapshot.docs.map((docSnap) => {
            const d = docSnap.data() as Record<string, any>;
            return {
              id: docSnap.id,
              title: String(d.title || ''),
              subtitle: d.subtitle ? String(d.subtitle) : undefined,
              author: String(d.author || ''),
              category: d.category || 'Personal Growth',
              price: Number(d.priceBDT ?? d.price ?? 0),
              priceUSD: d.priceUSD ? Number(d.priceUSD) : undefined,
              originalPrice: d.originalPrice ? Number(d.originalPrice) : undefined,
              discountPercentage: d.discountPercentage ? Number(d.discountPercentage) : undefined,
              isFeatured: Boolean(d.isFeatured),
              isNewRelease: Boolean(d.isNewRelease),
              coverImage: String(d.coverImage || ''),
              format: String(d.format || 'PDF & EPUB'),
              fileSize: String(d.fileSize || ''),
              pages: Number(d.pages || 0),
              language: String(d.language || 'English'),
              isbn: String(d.isbn || ''),
              publishedYear: Number(d.publishedYear || new Date().getFullYear()),
              description: String(d.description || d.shortDescription || ''),
              keyTakeaways: Array.isArray(d.keyTakeaways) ? d.keyTakeaways : [],
              sampleChapters: Array.isArray(d.sampleChapters) ? d.sampleChapters : [],
              downloadFileKey: String(d.originalFileStoragePath || docSnap.id),
            };
          });
          setBooks(firestoreBooks);
          return;
        }
      } catch {
        // Fallback to server catalog endpoint
      }

      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products) && data.products.length > 0) {
            setBooks(data.products);
          }
        }
      } catch {
        // Leave empty when no real books exist
      }
    };
    fetchPublishedCatalog();
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        try {
          // Fetch or initialize user profile document in Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as CustomerProfile);
          } else {
            const newProfile: CustomerProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0],
              role: 'customer',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('User profile sync:', err);
        }
        // Load user's purchased downloads
        loadUserLibrary(user.email);
      } else {
        setUserProfile(null);
        setUserLibrary([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserLibrary = async (email: string) => {
    try {
      const res = await fetch(`/api/user/library?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUserLibrary(data.library || []);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch user library:', e);
    }
  };

  const refreshUserLibrary = async () => {
    if (currentUser?.email) {
      await loadUserLibrary(currentUser.email);
    }
  };

  // URL Parameters check for payment return callbacks
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderStatus = params.get('order_status');
    const orderId = params.get('order_id');

    if (orderStatus === 'success' && orderId) {
      // Clear URL params cleanly
      window.history.replaceState({}, '', window.location.pathname);
      clearCart();

      // Fetch confirmed order from backend
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setConfirmedOrder(data.order);
            showToast('Payment verified! Your digital volume is available for instant download.');
            if (currentUser?.email) {
              refreshUserLibrary();
            }
          }
        })
        .catch(() => {
          showToast('Payment succeeded! Digital entitlement generated.');
        });
    } else if (orderStatus === 'failed') {
      window.history.replaceState({}, '', window.location.pathname);
      showToast('Payment was not completed or was declined. You have not been charged.');
    } else if (orderStatus === 'cancelled') {
      window.history.replaceState({}, '', window.location.pathname);
      showToast('Payment session was cancelled.');
    }
  }, [currentUser]);

  // Cart calculations
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
  const applyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, subtotal: cartSubtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const couponObj: Coupon = {
          code: data.code,
          discountPercentage: data.discountValue,
          description: `${data.discountValue}% discount applied`,
          isActive: true,
        };
        setActiveCoupon(couponObj);
        return { success: true, message: `Applied ${data.code} (${data.discountValue}% discount)` };
      } else {
        return { success: false, message: data.error || 'Invalid coupon.' };
      }
    } catch {
      // Local fallback
      const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);
      if (found) {
        setActiveCoupon(found);
        return { success: true, message: `Applied ${found.code}` };
      }
      return { success: false, message: 'Invalid or expired promotional code.' };
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  // Orders creation: Communicates with backend /api/orders/create
  const createOrder = async ({
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
  }): Promise<{ order: Order }> => {
    // 1. Create order on server
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        customerEmail,
        customerPhone,
        items: cart.map((c) => ({
          id: c.book.id,
          title: c.book.title,
          price: c.book.price,
          quantity: c.quantity,
        })),
        couponCode: activeCoupon?.code,
        currency: 'BDT',
        userId: currentUser?.uid,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to initialize order on server.');
    }

    const newOrder: Order = {
      id: data.orderId,
      orderNumber: data.orderNumber,
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
      subtotal: data.subtotal,
      discountAmount: data.discount,
      couponCode: activeCoupon?.code,
      total: data.total,
      currency: data.currency,
      paymentMethod,
      paymentStatus: 'pending',
      fulfillmentStatus: 'pending',
      transactionId: transactionId || `TXN-${data.orderNumber}`,
      downloadAccessCode: `DL-${data.orderNumber}`,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 2. Confirm direct checkout delivery
    try {
      await fetch('/api/payment/confirm-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: newOrder.id }),
      });
      newOrder.paymentStatus = 'verified';
      newOrder.fulfillmentStatus = 'fulfilled';
    } catch {}

    clearCart();
    setConfirmedOrder(newOrder);
    setIsCheckoutOpen(false);
    return { order: newOrder };
  };

  const lookupOrder = async (orderId: string): Promise<Order | undefined> => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          return data.order as Order;
        }
      }
    } catch {}

    return orders.find(
      (o) =>
        o.id.toUpperCase() === orderId.trim().toUpperCase() ||
        o.orderNumber?.toUpperCase() === orderId.trim().toUpperCase() ||
        o.downloadAccessCode?.toUpperCase() === orderId.trim().toUpperCase()
    );
  };

  // Firebase Authentication Actions
  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
    showToast('Authenticated successfully.');
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    showToast('Account registered. Welcome to Al Jabin Publications.');
  };

  const resetUserPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
    showToast('Password reset link dispatched to your email.');
  };

  const logoutUser = async () => {
    await signOut(auth);
    showToast('Signed out of session.');
  };

  // Newsletter
  const subscribeNewsletter = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = subscribers.find((s) => s.email === cleanEmail);
    if (existing) {
      return { success: false, message: 'This email is already registered for dispatches.' };
    }
    const newSubscriber: Subscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
      source: 'Newsletter Footer Section',
    };
    setSubscribers((prev) => [newSubscriber, ...prev]);
    showToast('Subscribed to Al Jabin Publications Dispatches.');
    return { success: true, message: 'Thank you for subscribing.' };
  };

  return (
    <StoreContext.Provider
      value={{
        books,
        selectedBook,
        setSelectedBook,
        previewSampleBook,
        setPreviewSampleBook,
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
        orders,
        createOrder,
        lookupOrder,
        confirmedOrder,
        setConfirmedOrder,
        currentUser,
        userProfile,
        authLoading,
        loginWithEmail,
        registerWithEmail,
        resetUserPassword,
        logoutUser,
        userLibrary,
        refreshUserLibrary,
        subscribers,
        subscribeNewsletter,
        logoNavyOnWhite,
        logoWhiteOnNavy,
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
