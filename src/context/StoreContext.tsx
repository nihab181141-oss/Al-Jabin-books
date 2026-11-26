import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Book,
  CartItem,
  Order,
  Coupon,
  Subscriber,
  PaymentMethod,
  EntitledDownload,
  CustomerProfile,
  OptionalProfileFields,
  PublishBookInput,
} from '../types';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError,
} from '../lib/firebase';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
} from 'firebase/firestore';

export const BRAND_ASSETS = {
  STACKED_COLOR: '/assets/aistudio/al-jabin-publications-stacked-color_6753ceee.svg',
  ICON_COLOR: '/assets/aistudio/al-jabin-publications-icon-color_5b7e2d55.svg',
  WORDMARK_COLOR: '/assets/aistudio/al-jabin-publications-wordmark-color_968ade48.svg',
  OG_SHARE: '/og-share.png',
};

interface PublishResult {
  book: Book;
  firestoreSynced: boolean;
}

interface StoreContextType {
  // Books catalog & Self-publishing
  books: Book[];
  myPublishedBooks: Book[];
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  previewSampleBook: Book | null;
  setPreviewSampleBook: (book: Book | null) => void;
  publishBook: (input: PublishBookInput) => Promise<PublishResult>;
  deletePublishedBook: (bookId: string) => Promise<void>;

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

  // Customer Authentication, Profile & Library
  currentUser: FirebaseUser | null;
  userProfile: CustomerProfile | null;
  authLoading: boolean;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  registerWithEmail: (
    e: string,
    p: string,
    profileFields?: OptionalProfileFields
  ) => Promise<void>;
  updateUserProfile: (fields: OptionalProfileFields) => Promise<void>;
  resetUserPassword: (e: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  userLibrary: EntitledDownload[];
  refreshUserLibrary: () => Promise<void>;

  // Newsletter
  subscribers: Subscriber[];
  subscribeNewsletter: (email: string) => { success: boolean; message: string };

  // Brand Logo Assets
  logoStackedColor: string;
  logoIconColor: string;
  logoWordmarkColor: string;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  CART: 'aljabin_cart_v2',
  ORDERS: 'aljabin_orders_v2',
  SUBSCRIBERS: 'aljabin_subscribers_v2',
};

const LEGACY_KEYS_TO_PURGE = [
  'aljabin_books_v4',
  'aljabin_coupons_v2',
  'aljabin_logo_navy_v2',
  'aljabin_logo_white_v2',
];

function compactOptionalFields(fields?: OptionalProfileFields): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fields) return out;
  const assign = (key: keyof OptionalProfileFields, maxLen: number) => {
    const val = fields[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      out[key] = val.trim().slice(0, maxLen);
    }
  };
  assign('displayName', 120);
  assign('penName', 120);
  assign('phone', 40);
  assign('location', 120);
  assign('bio', 500);
  assign('website', 256);
  return out;
}

function generateAuthorCoverDataUrl(title: string, author: string, category: string): string {
  const safeTitle = title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 64);
  const safeAuthor = author
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 42);
  const safeCat = category
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .toUpperCase();

  const words = safeTitle.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > 16) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = (line ? line + ' ' : '') + w;
    }
  }
  if (line) lines.push(line);
  const titleTspans = lines
    .slice(0, 4)
    .map((l, idx) => `<tspan x="180" dy="${idx === 0 ? 0 : 34}">${l}</tspan>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 520" width="360" height="520">
    <rect width="360" height="520" fill="#171D50"/>
    <rect x="22" y="22" width="316" height="476" fill="none" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1"/>
    <rect x="30" y="30" width="300" height="460" fill="none" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1"/>
    <text x="180" y="76" text-anchor="middle" font-family="sans-serif" font-size="11" letter-spacing="3" fill="#CBD5E1">${safeCat}</text>
    <line x1="120" y1="96" x2="240" y2="96" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1"/>
    <text x="180" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="27" font-weight="600" fill="#FFFFFF">${titleTspans}</text>
    <line x1="140" y1="392" x2="220" y2="392" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1"/>
    <text x="180" y="424" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#E2E8F0">${safeAuthor}</text>
    <text x="180" y="464" text-anchor="middle" font-family="sans-serif" font-size="9" letter-spacing="2.5" fill="#94A3B8">AL JABIN PUBLICATIONS</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [previewSampleBook, setPreviewSampleBook] = useState<Book | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [coupons] = useState<Coupon[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<CustomerProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userLibrary, setUserLibrary] = useState<EntitledDownload[]>([]);

  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SUBSCRIBERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const pendingSignupProfileRef = useRef<OptionalProfileFields | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4200);
  };

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
    } catch {}
  }, [subscribers]);

  // Sync a single book into Express server memory so checkout & PDF download always work
  const syncBookToServer = async (book: Book) => {
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: book.id,
          ownerId: book.ownerId || 'aljabin_author',
          title: book.title,
          subtitle: book.subtitle,
          description: book.description,
          author: book.author,
          category: book.category,
          coverImage: book.coverImage,
          priceBDT: book.price,
          priceUSD: book.priceUSD,
          format: book.format,
          fileSize: book.fileSize,
          pages: book.pages,
          language: book.language,
          isbn: book.isbn,
          keyTakeaways: book.keyTakeaways,
          sampleChapters: book.sampleChapters,
          manuscriptContent: book.manuscriptContent,
          isPublished: true,
          isFeatured: book.isFeatured,
          isNewRelease: book.isNewRelease,
          publishedYear: book.publishedYear,
          createdAt: book.createdAt,
        }),
      });
    } catch {
      // Non-fatal background sync
    }
  };

  // Purge legacy dummy storage keys & load real published catalog from Firestore + server
  useEffect(() => {
    try {
      for (const key of LEGACY_KEYS_TO_PURGE) {
        localStorage.removeItem(key);
      }
    } catch {}

    const fetchPublishedCatalog = async () => {
      const mergedMap = new Map<string, Book>();

      try {
        const productsQuery = query(collection(db, 'products'), where('isPublished', '==', true));
        const snapshot = await getDocs(productsQuery);
        snapshot.docs.forEach((docSnap) => {
          const d = docSnap.data() as Record<string, any>;
          const mapped: Book = {
            id: docSnap.id,
            ownerId: d.ownerId ? String(d.ownerId) : undefined,
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
            coverImage:
              String(d.coverImage || '') ||
              generateAuthorCoverDataUrl(String(d.title || 'Untitled'), String(d.author || 'Author'), String(d.category || 'Personal Growth')),
            format: String(d.format || 'PDF & EPUB'),
            fileSize: String(d.fileSize || '1.2 MB'),
            pages: Number(d.pages || 24),
            language: String(d.language || 'English'),
            isbn: String(d.isbn || ''),
            publishedYear: Number(d.publishedYear || new Date().getFullYear()),
            description: String(d.description || d.shortDescription || ''),
            keyTakeaways: Array.isArray(d.keyTakeaways) ? d.keyTakeaways : [],
            sampleChapters: Array.isArray(d.sampleChapters) ? d.sampleChapters : [],
            manuscriptContent: d.manuscriptContent ? String(d.manuscriptContent) : undefined,
            downloadFileKey: String(d.originalFileStoragePath || docSnap.id),
            createdAt: d.createdAt ? String(d.createdAt) : undefined,
          };
          mergedMap.set(mapped.id, mapped);
          syncBookToServer(mapped);
        });
      } catch (err) {
        console.warn('Catalog Firestore read skipped or empty:', err);
      }

      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products)) {
            for (const p of data.products) {
              if (!mergedMap.has(p.id)) {
                mergedMap.set(p.id, {
                  ...p,
                  price: Number(p.priceBDT ?? p.price ?? 0),
                  coverImage:
                    p.coverImage ||
                    generateAuthorCoverDataUrl(p.title || 'Untitled', p.author || 'Author', p.category || 'Personal Growth'),
                });
              }
            }
          }
        }
      } catch {
        // Ignore network error on boot
      }

      setBooks(Array.from(mergedMap.values()));
    };

    fetchPublishedCatalog();
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        const userDocPath = `users/${user.uid}`;
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          const extra = compactOptionalFields(pendingSignupProfileRef.current || undefined);
          pendingSignupProfileRef.current = null;

          if (snap.exists()) {
            const existingProfile = snap.data() as CustomerProfile;
            if (Object.keys(extra).length > 0) {
              const mergedUpdate = { ...extra, updatedAt: new Date().toISOString() };
              try {
                await updateDoc(userDocRef, mergedUpdate);
              } catch (writeErr) {
                handleFirestoreError(writeErr, OperationType.UPDATE, userDocPath);
              }
              setUserProfile({ ...existingProfile, ...mergedUpdate });
            } else {
              setUserProfile(existingProfile);
            }
          } else {
            const now = new Date().toISOString();
            const newProfile: CustomerProfile = {
              uid: user.uid,
              email: user.email,
              ...(user.displayName ? { displayName: user.displayName.slice(0, 120) } : {}),
              ...extra,
              role: 'customer',
              createdAt: now,
              updatedAt: now,
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (writeErr) {
              handleFirestoreError(writeErr, OperationType.CREATE, userDocPath);
            }
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('User profile sync notice:', err);
          // Populate local fallback session state so UI remains usable while rules propagate
          const extra = compactOptionalFields(pendingSignupProfileRef.current || undefined);
          setUserProfile((prev) =>
            prev || {
              uid: user.uid,
              email: user.email!,
              ...(user.displayName ? { displayName: user.displayName } : {}),
              ...extra,
              role: 'customer',
              createdAt: new Date().toISOString(),
            }
          );
        }
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderStatus = params.get('order_status');
    const orderId = params.get('order_id');

    if (orderStatus === 'success' && orderId) {
      window.history.replaceState({}, '', window.location.pathname);
      clearCart();

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
      showToast('Payment was not completed or was declined.');
    } else if (orderStatus === 'cancelled') {
      window.history.replaceState({}, '', window.location.pathname);
      showToast('Payment session was cancelled.');
    }
  }, [currentUser]);

  // Self-Publishing Ebook Mutation
  const publishBook = async (input: PublishBookInput): Promise<PublishResult> => {
    if (!currentUser) {
      throw new Error('Please sign in or create an account before publishing an ebook.');
    }

    const cleanTitle = input.title.trim().slice(0, 180);
    const cleanAuthor = (input.author || userProfile?.penName || userProfile?.displayName || currentUser.displayName || 'Independent Author').trim().slice(0, 120);
    const cleanDesc = input.description.trim().slice(0, 5000);

    if (!cleanTitle || !cleanAuthor || !cleanDesc) {
      throw new Error('Title, author name, and synopsis are required.');
    }

    const now = new Date().toISOString();
    const bookId = `book_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const slug =
      cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 180) || bookId;
    const priceBDT = Math.max(0, Math.min(100000, Math.round(Number(input.price) || 0)));
    const priceUSD = Number((priceBDT / 115).toFixed(2));
    const coverImage =
      input.coverImage && input.coverImage.trim().length > 0
        ? input.coverImage.trim().slice(0, 250000)
        : generateAuthorCoverDataUrl(cleanTitle, cleanAuthor, input.category);

    const sampleChapters =
      input.sampleExcerpt && input.sampleExcerpt.trim()
        ? [
            {
              title: (input.sampleChapterTitle || 'Chapter 1 · Opening Excerpt').trim().slice(0, 140),
              excerpt: input.sampleExcerpt.trim().slice(0, 4000),
              pageCount: Math.max(1, Math.min(input.pages || 24, 15)),
            },
          ]
        : [];

    const keyTakeaways = (input.keyTakeaways || [])
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

    const pages = Math.max(1, Math.min(10000, Math.round(Number(input.pages) || 24)));
    const isbn = (input.isbn || `AJP-${Date.now().toString().slice(-6)}`).trim().slice(0, 64);
    const manuscriptContent = input.manuscriptContent ? input.manuscriptContent.trim().slice(0, 300000) : '';
    const approxKB = Math.max(240, Math.round((manuscriptContent.length + coverImage.length) / 1024));
    const fileSize = approxKB > 1024 ? `${(approxKB / 1024).toFixed(1)} MB` : `${approxKB} KB`;

    const newBook: Book = {
      id: bookId,
      ownerId: currentUser.uid,
      title: cleanTitle,
      ...(input.subtitle?.trim() ? { subtitle: input.subtitle.trim().slice(0, 240) } : {}),
      author: cleanAuthor,
      category: input.category,
      price: priceBDT,
      priceUSD,
      isNewRelease: true,
      isFeatured: false,
      coverImage,
      format: (input.format || 'PDF & EPUB').trim().slice(0, 60),
      fileSize,
      pages,
      language: (input.language || 'English').trim().slice(0, 60),
      isbn,
      publishedYear: new Date().getFullYear(),
      description: cleanDesc,
      keyTakeaways,
      sampleChapters,
      ...(manuscriptContent ? { manuscriptContent } : {}),
      downloadFileKey: bookId,
      createdAt: now,
    };

    // 1. Sync immediately with server runtime so checkout and PDF download work instantly
    const serverRes = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newBook,
        priceBDT,
        slug,
        shortDescription: cleanDesc.slice(0, 300),
        isPublished: true,
      }),
    });

    if (!serverRes.ok) {
      const errData = await serverRes.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to register ebook with publishing server.');
    }

    // 2. Persist to Firestore under strict allowlisted blueprint schema
    const firestorePayload: Record<string, any> = {
      ownerId: currentUser.uid,
      title: newBook.title,
      slug,
      author: newBook.author,
      category: newBook.category,
      priceBDT,
      priceUSD,
      isPublished: true,
      isFeatured: false,
      isNewRelease: true,
      coverImage: newBook.coverImage,
      format: newBook.format,
      fileSize: newBook.fileSize,
      pages: newBook.pages,
      language: newBook.language,
      isbn: newBook.isbn,
      publishedYear: newBook.publishedYear,
      description: newBook.description,
      shortDescription: cleanDesc.slice(0, 580),
      keyTakeaways: newBook.keyTakeaways,
      sampleChapters: newBook.sampleChapters,
      originalFileStoragePath: bookId,
      createdAt: now,
      updatedAt: now,
    };
    if (newBook.subtitle) firestorePayload.subtitle = newBook.subtitle;
    if (manuscriptContent) firestorePayload.manuscriptContent = manuscriptContent;

    let firestoreSynced = true;
    try {
      try {
        await setDoc(doc(db, 'products', bookId), firestorePayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `products/${bookId}`);
      }
    } catch (structuredErr: any) {
      firestoreSynced = false;
      console.warn('Firestore product sync pending rule deployment:', structuredErr?.message);
    }

    setBooks((prev) => [newBook, ...prev]);
    showToast(
      firestoreSynced
        ? `"${newBook.title}" is now published live!`
        : `"${newBook.title}" published locally (deploy firestore.rules for cloud sync).`
    );

    return { book: newBook, firestoreSynced };
  };

  const deletePublishedBook = async (bookId: string) => {
    if (!currentUser) {
      throw new Error('Authentication required.');
    }

    await fetch(`/api/products/${encodeURIComponent(bookId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId: currentUser.uid }),
    }).catch(() => {});

    try {
      try {
        await deleteDoc(doc(db, 'products', bookId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${bookId}`);
      }
    } catch (structuredErr) {
      console.warn('Firestore delete skipped:', structuredErr);
    }

    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setCart((prev) => prev.filter((c) => c.book.id !== bookId));
    showToast('Publication removed from the catalogue.');
  };

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
      }
      return { success: false, message: data.error || 'Invalid coupon.' };
    } catch {
      return { success: false, message: 'Unable to verify promotional code right now.' };
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  // Orders creation
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
    // Ensure all cart books are synced in Express memory before checkout validation
    await Promise.all(cart.map((c) => syncBookToServer(c.book)));

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

    try {
      await fetch('/api/payment/confirm-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: newOrder.id }),
      });
      const detailRes = await fetch(`/api/orders/${newOrder.id}`);
      if (detailRes.ok) {
        const detailJson = await detailRes.json();
        if (detailJson.success && detailJson.order?.downloads) {
          newOrder.downloads = detailJson.order.downloads;
        }
      }
      newOrder.paymentStatus = 'verified';
      newOrder.fulfillmentStatus = 'fulfilled';
    } catch {}

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setConfirmedOrder(newOrder);
    setIsCheckoutOpen(false);
    if (currentUser?.email) {
      refreshUserLibrary();
    }
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

  // Firebase Authentication & Profile Actions
  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
    showToast('Signed in successfully.');
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    showToast('Signed in with Google.');
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    profileFields?: OptionalProfileFields
  ) => {
    const cleanOptional = compactOptionalFields(profileFields);
    pendingSignupProfileRef.current = cleanOptional;

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const preferredDisplayName = cleanOptional.displayName || cleanOptional.penName;
    if (preferredDisplayName && cred.user) {
      await updateProfile(cred.user, { displayName: preferredDisplayName });
    }

    if (cred.user && cred.user.email) {
      const now = new Date().toISOString();
      const docPayload: CustomerProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        ...cleanOptional,
        role: 'customer',
        createdAt: now,
        updatedAt: now,
      };
      try {
        try {
          await setDoc(doc(db, 'users', cred.user.uid), docPayload);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${cred.user.uid}`);
        }
      } catch (err) {
        console.warn('Firestore profile creation notice:', err);
      }
      setUserProfile(docPayload);
      pendingSignupProfileRef.current = null;
    }

    showToast('Account created! Welcome to Al Jabin Publications.');
  };

  const updateUserProfile = async (fields: OptionalProfileFields) => {
    if (!currentUser || !currentUser.email) {
      throw new Error('Sign in required to update your profile.');
    }

    const cleanFields = compactOptionalFields(fields);
    const now = new Date().toISOString();
    const userDocRef = doc(db, 'users', currentUser.uid);

    if (cleanFields.displayName) {
      await updateProfile(currentUser, { displayName: cleanFields.displayName }).catch(() => {});
    }

    const baseCreatedAt = userProfile?.createdAt || now;
    const nextProfile: CustomerProfile = {
      uid: currentUser.uid,
      email: currentUser.email,
      ...cleanFields,
      role: 'customer',
      createdAt: baseCreatedAt,
      updatedAt: now,
    };

    try {
      try {
        const existingSnap = await getDoc(userDocRef);
        if (existingSnap.exists()) {
          await updateDoc(userDocRef, {
            displayName: cleanFields.displayName || '',
            penName: cleanFields.penName || '',
            phone: cleanFields.phone || '',
            location: cleanFields.location || '',
            bio: cleanFields.bio || '',
            website: cleanFields.website || '',
            updatedAt: now,
          });
        } else {
          await setDoc(userDocRef, nextProfile);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
      }
    } catch (err) {
      console.warn('Firestore profile update notice:', err);
    }

    setUserProfile(nextProfile);
    showToast('Author & reader profile saved.');
  };

  const resetUserPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
    showToast('Password reset link dispatched to your email.');
  };

  const logoutUser = async () => {
    await signOut(auth);
    showToast('Signed out of your account.');
  };

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

  const myPublishedBooks = currentUser
    ? books.filter((b) => b.ownerId === currentUser.uid)
    : [];

  return (
    <StoreContext.Provider
      value={{
        books,
        myPublishedBooks,
        selectedBook,
        setSelectedBook,
        previewSampleBook,
        setPreviewSampleBook,
        publishBook,
        deletePublishedBook,
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
        loginWithGoogle,
        registerWithEmail,
        updateUserProfile,
        resetUserPassword,
        logoutUser,
        userLibrary,
        refreshUserLibrary,
        subscribers,
        subscribeNewsletter,
        logoStackedColor: BRAND_ASSETS.STACKED_COLOR,
        logoIconColor: BRAND_ASSETS.ICON_COLOR,
        logoWordmarkColor: BRAND_ASSETS.WORDMARK_COLOR,
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
