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
  AuthorSalesData,
} from '../types';
import {
  auth,
  db,
  storage,
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
  updatePublishedBook: (
    bookId: string,
    updates: {
      title?: string;
      subtitle?: string;
      pricingMode?: 'free' | 'paid';
      price?: number;
      category?: 'Personal Growth' | 'Mindset' | 'Productivity' | 'Fiction';
      description?: string;
    }
  ) => Promise<void>;
  deletePublishedBook: (bookId: string) => Promise<void>;
  fetchAuthorSalesStats: () => Promise<AuthorSalesData>;

  // Cart & Free Quick-Acquire
  cart: CartItem[];
  addToCart: (book: Book, qty?: number) => void;
  quickAcquireFreeBook: (book: Book) => void;
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
    onProgress?: (stage: 'creating' | 'initiating' | 'verifying' | 'unlocking') => void;
  }) => Promise<{ order: Order; redirectUrl?: string }>;
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
  userOrders: Order[];
  loadingUserOrders: boolean;
  refreshUserOrders: () => Promise<Order[]>;

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

async function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 15000
): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
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
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);

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

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (!auth.currentUser) return {};
    try {
      const token = await withTimeout(auth.currentUser.getIdToken(), 5000, 'Auth token timeout');
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  };

  // Sync a single book into Express server memory using verified author token or Firestore REST check
  const syncBookToServer = async (book: Book) => {
    try {
      if (auth.currentUser && book.ownerId === auth.currentUser.uid) {
        const authHeaders = await getAuthHeaders();
        if (authHeaders.Authorization) {
          let privateFields: {
            manuscriptContent?: string;
            privatePdfUrl?: string;
            pdfStoragePath?: string;
          } = {};
          try {
            const privSnap = await withTimeout(
              getDoc(doc(db, 'products', book.id, 'private', 'manuscript')),
              3500,
              'Private doc fetch timeout'
            );
            if (privSnap.exists()) {
              const pData = privSnap.data() as Record<string, any>;
              if (typeof pData.manuscriptContent === 'string') {
                privateFields.manuscriptContent = pData.manuscriptContent;
              }
              if (typeof pData.privatePdfUrl === 'string') {
                privateFields.privatePdfUrl = pData.privatePdfUrl;
              }
              if (typeof pData.pdfStoragePath === 'string') {
                privateFields.pdfStoragePath = pData.pdfStoragePath;
              }
            }
          } catch {}

          await fetchWithTimeout(
            '/api/products',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
              },
              body: JSON.stringify({
                id: book.id,
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
                manuscriptContent: book.manuscriptContent || privateFields.manuscriptContent,
                ...(privateFields.privatePdfUrl ? { privatePdfUrl: privateFields.privatePdfUrl } : {}),
                ...(privateFields.pdfStoragePath ? { pdfStoragePath: privateFields.pdfStoragePath } : {}),
                isPublished: true,
                isFeatured: book.isFeatured,
                isNewRelease: book.isNewRelease,
                publishedYear: book.publishedYear,
                createdAt: book.createdAt,
              }),
            },
            10000
          );
          return;
        }
      }

      // Public/unauthenticated catalog hydration: server verifies fields directly from Firestore
      await fetchWithTimeout(
        '/api/products/catalog-sync',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: book.id }),
        },
        7000
      );
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

      // Fetch server catalog and Firestore catalog concurrently so neither stalls the other
      const [firestoreRes, serverRes] = await Promise.allSettled([
        withTimeout(
          getDocs(query(collection(db, 'products'), where('isPublished', '==', true))),
          6500,
          'Firestore catalog load timeout'
        ),
        fetchWithTimeout('/api/products', {}, 8000),
      ]);

      if (firestoreRes.status === 'fulfilled') {
        firestoreRes.value.docs.forEach((docSnap) => {
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
            downloadFileKey: String(d.originalFileStoragePath || docSnap.id),
            createdAt: d.createdAt ? String(d.createdAt) : undefined,
          };
          mergedMap.set(mapped.id, mapped);
          syncBookToServer(mapped);
        });
      } else {
        console.warn('Catalog Firestore read skipped or timed out:', firestoreRes.reason);
      }

      if (serverRes.status === 'fulfilled' && serverRes.value.ok) {
        try {
          const data = await serverRes.value.json();
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
        } catch {}
      }

      // Non-destructive merge: preserve any newly published books already in React state
      let finalBooksList: Book[] = [];
      setBooks((prev) => {
        const finalMap = new Map(mergedMap);
        for (const existingBook of prev) {
          if (!finalMap.has(existingBook.id)) {
            finalMap.set(existingBook.id, existingBook);
          }
        }
        finalBooksList = Array.from(finalMap.values());
        return finalBooksList;
      });

      // Handle ?book=<id> deep-link sharing URL
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const targetBookId = params.get('book');
        if (targetBookId) {
          const matched = mergedMap.get(targetBookId);
          if (matched) {
            setSelectedBook(matched);
          }
        }
      }
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
          const snap = await withTimeout(getDoc(userDocRef), 4500, 'User profile fetch timeout');
          const extra = compactOptionalFields(pendingSignupProfileRef.current || undefined);
          pendingSignupProfileRef.current = null;

          if (snap.exists()) {
            const existingProfile = snap.data() as CustomerProfile;
            if (Object.keys(extra).length > 0) {
              const mergedUpdate = { ...extra, updatedAt: new Date().toISOString() };
              try {
                await withTimeout(updateDoc(userDocRef, mergedUpdate), 4500, 'Profile update timeout');
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
              await withTimeout(setDoc(userDocRef, newProfile), 4500, 'Profile create timeout');
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
        loadUserLibrary();
        loadUserOrders();
      } else {
        setUserProfile(null);
        setUserLibrary([]);
        setUserOrders([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserLibrary = async () => {
    if (!auth.currentUser) return;
    try {
      const authHeaders = await getAuthHeaders();
      if (!authHeaders.Authorization) return;
      const res = await fetchWithTimeout('/api/user/library', { headers: authHeaders }, 8000);
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
      await loadUserLibrary();
    }
  };

  const loadUserOrders = async (): Promise<Order[]> => {
    if (!auth.currentUser) {
      setUserOrders([]);
      return [];
    }
    setLoadingUserOrders(true);
    try {
      const authHeaders = await getAuthHeaders();
      let serverOrders: Order[] = [];
      if (authHeaders.Authorization) {
        const res = await fetchWithTimeout('/api/user/orders', { headers: authHeaders }, 8000);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            serverOrders = data.orders as Order[];
          }
        }
      }

      const signedInEmail = auth.currentUser.email?.toLowerCase();
      const mergedMap = new Map<string, Order>();
      for (const srvOrder of serverOrders) {
        mergedMap.set(srvOrder.id, srvOrder);
      }
      if (signedInEmail) {
        for (const localOrder of orders) {
          if (
            localOrder.customerEmail?.toLowerCase() === signedInEmail &&
            !mergedMap.has(localOrder.id)
          ) {
            mergedMap.set(localOrder.id, localOrder);
          }
        }
      }

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setUserOrders(mergedList);
      return mergedList;
    } catch (e) {
      console.warn('Failed to fetch user order history:', e);
      return [];
    } finally {
      setLoadingUserOrders(false);
    }
  };

  const refreshUserOrders = async (): Promise<Order[]> => {
    if (auth.currentUser) {
      return await loadUserOrders();
    }
    return [];
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderStatus = params.get('order_status');
    const orderId = params.get('order_id');

    if (orderStatus === 'success' && orderId) {
      window.history.replaceState({}, '', window.location.pathname);
      clearCart();

      getAuthHeaders()
        .then((headers) => fetch(`/api/orders/${encodeURIComponent(orderId)}`, { headers }))
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setConfirmedOrder(data.order);
            showToast('Payment verified! Your digital volume is available for instant download.');
            if (currentUser?.email) {
              refreshUserLibrary();
              refreshUserOrders();
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

  // Self-Publishing Ebook Mutation (Fast Server Vault First + Non-Blocking Cloud/Firestore Sync)
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
    const isFreeMode = input.pricingMode === 'free' || Number(input.price) <= 0;
    const priceBDT = isFreeMode
      ? 0
      : Math.max(1, Math.min(100000, Math.round(Number(input.price) || 0)));
    const priceUSD = Number((priceBDT / 115).toFixed(2));
    const coverImage =
      input.coverImage && input.coverImage.trim().length > 0
        ? input.coverImage.trim().slice(0, 248000)
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
    const approxKB = input.uploadedPdfFile
      ? Math.max(120, Math.round(input.uploadedPdfFile.size / 1024))
      : input.uploadedPdfBase64
      ? Math.max(240, Math.round((input.uploadedPdfBase64.length * 0.75) / 1024))
      : Math.max(240, Math.round((manuscriptContent.length + coverImage.length) / 1024));
    const fileSize = approxKB > 1024 ? `${(approxKB / 1024).toFixed(1)} MB` : `${approxKB} KB`;

    // Fast bounded optional cloud PDF upload (max 3s) so unprovisioned storage NEVER hangs publishing
    let privatePdfUrl: string | undefined;
    let pdfStoragePath: string | undefined;
    if (input.uploadedPdfFile && !input.uploadedPdfBase64) {
      try {
        const storagePath = `ebooks/${currentUser.uid}/${bookId}.pdf`;
        const fileRef = ref(storage, storagePath);
        await withTimeout(
          uploadBytes(fileRef, input.uploadedPdfFile, {
            contentType: 'application/pdf',
            customMetadata: { bookId, ownerId: currentUser.uid },
          }),
          3000,
          'Cloud PDF storage timeout'
        );
        const downloadUrl = await withTimeout(getDownloadURL(fileRef), 2000, 'Cloud URL timeout');
        if (downloadUrl && downloadUrl.length <= 512) {
          privatePdfUrl = downloadUrl;
          pdfStoragePath = storagePath;
        }
      } catch (storageErr) {
        console.warn('Cloud PDF storage skipped (using server vault):', storageErr);
      }
    }

    const newBook: Book = {
      id: bookId,
      ownerId: currentUser.uid,
      title: cleanTitle,
      ...(input.subtitle?.trim() ? { subtitle: input.subtitle.trim().slice(0, 240) } : {}),
      author: cleanAuthor,
      category: input.category,
      pricingMode: priceBDT === 0 ? 'free' : 'paid',
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
      hasUploadedPdf: Boolean(input.uploadedPdfBase64 || privatePdfUrl),
      downloadFileKey: bookId,
      createdAt: now,
    };

    const authHeaders = await getAuthHeaders();
    if (!authHeaders.Authorization) {
      throw new Error('Authentication session expired. Please sign in again and retry.');
    }

    // 1. Save immediately to server disk vault & persisted catalog (.products_catalog.json + .private_ebooks)
    const serverRes = await fetchWithTimeout(
      '/api/products',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          ...newBook,
          ...(manuscriptContent ? { manuscriptContent } : {}),
          ...(input.uploadedPdfBase64 ? { uploadedPdfBase64: input.uploadedPdfBase64 } : {}),
          ...(privatePdfUrl ? { privatePdfUrl } : {}),
          ...(pdfStoragePath ? { pdfStoragePath } : {}),
          priceBDT,
          slug,
          shortDescription: cleanDesc.slice(0, 300),
          isPublished: true,
        }),
      },
      20000
    );

    if (!serverRes.ok) {
      const errData = await serverRes.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to register ebook with publishing server.');
    }

    // 2. Persist public metadata to Firestore with a strict 7s timeout so UI NEVER hangs indefinitely
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

    let firestoreSynced = true;
    try {
      try {
        await withTimeout(
          setDoc(doc(db, 'products', bookId), firestorePayload),
          7000,
          'Firestore metadata sync timed out'
        );
        if (manuscriptContent || input.uploadedFileName || input.uploadedPdfBase64 || privatePdfUrl) {
          const privatePayload: Record<string, any> = {
            ownerId: currentUser.uid,
            hasUploadedPdf: Boolean(input.uploadedPdfBase64 || privatePdfUrl),
            updatedAt: now,
          };
          if (manuscriptContent) privatePayload.manuscriptContent = manuscriptContent;
          if (input.uploadedFileName) {
            privatePayload.originalFileName = input.uploadedFileName.trim().slice(0, 180);
          }
          if (privatePdfUrl) privatePayload.privatePdfUrl = privatePdfUrl;
          if (pdfStoragePath) privatePayload.pdfStoragePath = pdfStoragePath;
          await withTimeout(
            setDoc(doc(db, 'products', bookId, 'private', 'manuscript'), privatePayload),
            5000,
            'Firestore private doc timeout'
          );
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `products/${bookId}`);
      }
    } catch (structuredErr: any) {
      firestoreSynced = false;
      console.warn('Firestore product sync notice:', structuredErr?.message);
    }

    // Optional background backup of PDF to Firebase Storage if uploadedPdfFile exists (non-blocking!)
    if (input.uploadedPdfFile && !privatePdfUrl) {
      const storagePath = `ebooks/${currentUser.uid}/${bookId}.pdf`;
      const fileRef = ref(storage, storagePath);
      withTimeout(
        uploadBytes(fileRef, input.uploadedPdfFile, {
          contentType: 'application/pdf',
          customMetadata: { bookId, ownerId: currentUser.uid },
        }).then(() => getDownloadURL(fileRef)),
        4000,
        'Background cloud backup timeout'
      )
        .then(async (downloadUrl) => {
          if (downloadUrl && downloadUrl.length <= 512) {
            await setDoc(
              doc(db, 'products', bookId, 'private', 'manuscript'),
              {
                ownerId: currentUser.uid,
                hasUploadedPdf: true,
                privatePdfUrl: downloadUrl,
                pdfStoragePath: storagePath,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            ).catch(() => {});
          }
        })
        .catch(() => {});
    }

    setBooks((prev) => [newBook, ...prev.filter((b) => b.id !== newBook.id)]);
    showToast(
      firestoreSynced
        ? `"${newBook.title}" is now published live!`
        : `"${newBook.title}" published live on server!`
    );

    return { book: newBook, firestoreSynced };
  };

  const deletePublishedBook = async (bookId: string) => {
    if (!currentUser) {
      throw new Error('Authentication required.');
    }

    const authHeaders = await getAuthHeaders();
    await fetchWithTimeout(
      `/api/products/${encodeURIComponent(bookId)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      },
      8000
    ).catch(() => {});

    // Clean up private Firebase Storage object if uploaded (fast bounded timeout)
    withTimeout(
      deleteObject(ref(storage, `ebooks/${currentUser.uid}/${bookId}.pdf`)),
      2500,
      'Storage delete timeout'
    ).catch(() => {});

    try {
      await withTimeout(
        deleteDoc(doc(db, 'products', bookId, 'private', 'manuscript')),
        4000,
        'Private doc delete timeout'
      ).catch(() => {});
      try {
        await withTimeout(
          deleteDoc(doc(db, 'products', bookId)),
          5000,
          'Firestore delete timeout'
        );
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

  const updatePublishedBook = async (
    bookId: string,
    updates: {
      title?: string;
      subtitle?: string;
      pricingMode?: 'free' | 'paid';
      price?: number;
      category?: 'Personal Growth' | 'Mindset' | 'Productivity' | 'Fiction';
      description?: string;
    }
  ) => {
    if (!currentUser) {
      throw new Error('Authentication required.');
    }
    const existing = books.find((b) => b.id === bookId && b.ownerId === currentUser.uid);
    if (!existing) {
      throw new Error('Publication not found under your author account.');
    }

    const nextTitle = updates.title?.trim().slice(0, 180) || existing.title;
    const nextSubtitle =
      updates.subtitle !== undefined ? updates.subtitle.trim().slice(0, 240) : existing.subtitle;
    const rawPrice = updates.price !== undefined ? Number(updates.price) || 0 : existing.price;
    const nextPrice =
      updates.pricingMode === 'free'
        ? 0
        : Math.max(0, Math.min(100000, Math.round(rawPrice)));
    const nextPriceUSD = Number((nextPrice / 115).toFixed(2));
    const nextCategory = updates.category || existing.category;
    const nextDesc = updates.description?.trim().slice(0, 5000) || existing.description;
    const updatedBook: Book = {
      ...existing,
      title: nextTitle,
      ...(nextSubtitle ? { subtitle: nextSubtitle } : { subtitle: undefined }),
      pricingMode: nextPrice === 0 ? 'free' : 'paid',
      price: nextPrice,
      priceUSD: nextPriceUSD,
      category: nextCategory,
      description: nextDesc,
    };

    await withTimeout(syncBookToServer(updatedBook), 8000, 'Server update timeout').catch(() => {});

    try {
      const productRef = doc(db, 'products', bookId);
      const updatePayload: Record<string, any> = {
        title: nextTitle,
        subtitle: nextSubtitle || '',
        priceBDT: nextPrice,
        priceUSD: nextPriceUSD,
        category: nextCategory,
        description: nextDesc,
        shortDescription: nextDesc.slice(0, 580),
        updatedAt: new Date().toISOString(),
      };
      try {
        await withTimeout(
          updateDoc(productRef, updatePayload),
          6000,
          'Firestore update timeout'
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `products/${bookId}`);
      }
    } catch (structuredErr) {
      console.warn('Firestore product update notice:', structuredErr);
    }

    setBooks((prev) => prev.map((b) => (b.id === bookId ? updatedBook : b)));
    setCart((prev) =>
      prev.map((c) => (c.book.id === bookId ? { ...c, book: updatedBook } : c))
    );
    if (selectedBook?.id === bookId) {
      setSelectedBook(updatedBook);
    }
    showToast(`Updated "${nextTitle}" (${nextPrice === 0 ? 'Free Edition' : `৳${nextPrice}`}).`);
  };

  const fetchAuthorSalesStats = async (): Promise<AuthorSalesData> => {
    if (!currentUser) {
      return {
        summary: { totalBooks: 0, totalUnitsSold: 0, totalRevenueBDT: 0, totalDownloads: 0 },
        perBookStats: [],
        recentSales: [],
      };
    }

    const authored = books.filter((b) => b.ownerId === currentUser.uid);
    if (authored.length > 0) {
      await withTimeout(
        Promise.all(authored.map((b) => syncBookToServer(b))),
        5000,
        'Book sync timeout'
      ).catch(() => {});
    }

    const authHeaders = await getAuthHeaders();
    const res = await fetchWithTimeout('/api/author/stats', { headers: authHeaders }, 10000);
    if (!res.ok) {
      throw new Error('Unable to load author sales statistics.');
    }
    const data = await res.json();
    return {
      summary: data.summary || {
        totalBooks: authored.length,
        totalUnitsSold: 0,
        totalRevenueBDT: 0,
        totalDownloads: 0,
      },
      perBookStats: Array.isArray(data.perBookStats) ? data.perBookStats : [],
      recentSales: Array.isArray(data.recentSales) ? data.recentSales : [],
    };
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

  // Instant 1-step free edition checkout trigger
  const quickAcquireFreeBook = (book: Book) => {
    setSelectedBook(null);
    if (cart.length === 0 || (cart.length === 1 && cart[0].book.id === book.id)) {
      setCart([{ book, quantity: 1 }]);
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    } else {
      addToCart(book, 1);
      setIsCartOpen(true);
    }
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
      const res = await fetchWithTimeout(
        '/api/coupons/validate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: cleanCode, subtotal: cartSubtotal }),
        },
        8000
      );
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

  // Two-path Order Creation: Instant Free Claim (total === 0) OR Automated Gateway Verification (total > 0)
  const createOrder = async ({
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod,
    onProgress,
  }: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: PaymentMethod;
    onProgress?: (stage: 'creating' | 'initiating' | 'verifying' | 'unlocking') => void;
  }): Promise<{ order: Order; redirectUrl?: string }> => {
    onProgress?.('creating');
    await withTimeout(
      Promise.all(cart.map((c) => syncBookToServer(c.book))),
      4000,
      'Catalog sync timeout'
    ).catch(() => {});
    const authHeaders = await getAuthHeaders();

    const response = await fetchWithTimeout(
      '/api/orders/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod,
          items: cart.map((c) => ({
            id: c.book.id,
            title: c.book.title,
            quantity: c.quantity,
          })),
          couponCode: activeCoupon?.code,
          currency: 'BDT',
        }),
      },
      15000
    );

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to initialize order on server.');
    }

    const baseOrder: Order = {
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
      paymentMethod: data.requiresPayment ? paymentMethod : 'free',
      paymentStatus: 'pending',
      fulfillmentStatus: 'pending',
      downloadAccessCode: `DL-${data.orderNumber}`,
    };

    // PATH A: Free Edition (total === 0) -> Instant Server Claim & Immediate PDF Unlock
    if (!data.requiresPayment) {
      onProgress?.('unlocking');
      const freeRes = await fetchWithTimeout(
        '/api/orders/free-claim',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderId }),
        },
        12000
      );
      const freeData = await freeRes.json();
      if (!freeRes.ok || !freeData.success || !freeData.order) {
        throw new Error(freeData.error || 'Could not claim free PDF edition.');
      }

      const fulfilledOrder: Order = {
        ...baseOrder,
        ...freeData.order,
        paymentStatus: 'verified',
        fulfillmentStatus: 'fulfilled',
        verificationMode: 'free',
      };

      setOrders((prev) => [fulfilledOrder, ...prev]);
      clearCart();
      setConfirmedOrder(fulfilledOrder);
      setIsCheckoutOpen(false);
      if (currentUser?.email) {
        refreshUserLibrary();
        refreshUserOrders();
      }
      showToast('Free PDF unlocked! Click Download PDF to save your copy.');
      return { order: fulfilledOrder };
    }

    // PATH B: Paid Edition (total > 0) -> Automated Payment Gateway Initiation & Verification
    onProgress?.('initiating');
    const initRes = await fetchWithTimeout(
      '/api/payment/initiate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderId,
          paymentMethod,
        }),
      },
      15000
    );
    const initData = await initRes.json();
    if (!initRes.ok || !initData.success) {
      throw new Error(initData.error || 'Unable to initiate automated payment gateway.');
    }

    // Real SSLCommerz Hosted Redirect Mode
    if (initData.mode === 'sslcommerz' && initData.gatewayUrl) {
      setOrders((prev) => [baseOrder, ...prev]);
      return { order: baseOrder, redirectUrl: initData.gatewayUrl };
    }

    // Automated Sandbox Gateway Verification Mode
    if (!initData.verificationToken) {
      throw new Error('Gateway verification token was not issued by server.');
    }

    onProgress?.('verifying');
    await new Promise((resolve) => setTimeout(resolve, 450));

    onProgress?.('unlocking');
    const verifyRes = await fetchWithTimeout(
      '/api/payment/verify-automated',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderId,
          verificationToken: initData.verificationToken,
          paymentMethod,
        }),
      },
      15000
    );
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success || !verifyData.order) {
      throw new Error(verifyData.error || 'Automated payment verification could not complete.');
    }

    const verifiedOrder: Order = {
      ...baseOrder,
      ...verifyData.order,
      paymentStatus: 'verified',
      fulfillmentStatus: 'fulfilled',
    };

    setOrders((prev) => [verifiedOrder, ...prev]);
    clearCart();
    setConfirmedOrder(verifiedOrder);
    setIsCheckoutOpen(false);
    if (currentUser?.email) {
      refreshUserLibrary();
      refreshUserOrders();
    }
    showToast('Payment automatically verified! Your PDF download is ready.');
    return { order: verifiedOrder };
  };

  const lookupOrder = async (orderId: string): Promise<Order | undefined> => {
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetchWithTimeout(
        `/api/orders/${encodeURIComponent(orderId.trim())}`,
        { headers: authHeaders },
        10000
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          const srvOrder = data.order as Order;
          setOrders((prev) =>
            prev.some((o) => o.id === srvOrder.id)
              ? prev.map((o) => (o.id === srvOrder.id ? { ...o, ...srvOrder } : o))
              : prev
          );
          setUserOrders((prev) =>
            prev.some((o) => o.id === srvOrder.id)
              ? prev.map((o) => (o.id === srvOrder.id ? { ...o, ...srvOrder } : o))
              : prev
          );
          return srvOrder;
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
        const existingSnap = await withTimeout(getDoc(userDocRef), 4500, 'Profile lookup timeout');
        if (existingSnap.exists()) {
          await withTimeout(
            updateDoc(userDocRef, {
              displayName: cleanFields.displayName || '',
              penName: cleanFields.penName || '',
              phone: cleanFields.phone || '',
              location: cleanFields.location || '',
              bio: cleanFields.bio || '',
              website: cleanFields.website || '',
              updatedAt: now,
            }),
            5000,
            'Profile update timeout'
          );
        } else {
          await withTimeout(setDoc(userDocRef, nextProfile), 5000, 'Profile save timeout');
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
        updatePublishedBook,
        deletePublishedBook,
        fetchAuthorSalesStats,
        // Cart
        cart,
        addToCart,
        quickAcquireFreeBook,
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
        userOrders,
        loadingUserOrders,
        refreshUserOrders,
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
