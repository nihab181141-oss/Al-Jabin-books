export type BookCategory = 
  | 'All Books'
  | 'Personal Growth'
  | 'Mindset'
  | 'Productivity'
  | 'Fiction';

export interface SampleChapter {
  title: string;
  excerpt: string;
  pageCount: number;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  category: 'Personal Growth' | 'Mindset' | 'Productivity' | 'Fiction';
  price: number; // in BDT
  priceUSD?: number;
  originalPrice?: number;
  discountPercentage?: number;
  isFeatured?: boolean;
  isNewRelease?: boolean;
  coverImage: string;
  coverBgColor?: string;
  format: string; // e.g., 'PDF & EPUB'
  fileSize: string;
  pages: number;
  language: string;
  isbn: string;
  publishedYear: number;
  description: string;
  keyTakeaways: string[];
  sampleChapters: SampleChapter[];
  downloadFileKey: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export type PaymentMethod = 'sslcommerz' | 'bkash' | 'nagad' | 'rocket' | 'card' | 'international';

export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  format: string;
}

export interface EntitledDownload {
  downloadId: string;
  productId: string;
  productTitle: string;
  orderNumber: string;
  downloadUrl: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
  isExpired: boolean;
}

export interface Order {
  id: string;
  orderNumber?: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  currency?: 'BDT' | 'USD';
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'verified' | 'failed' | 'cancelled';
  fulfillmentStatus?: 'pending' | 'fulfilled' | 'failed';
  transactionId?: string;
  downloadAccessCode: string;
  downloads?: EntitledDownload[];
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  minSpend?: number;
  description: string;
  isActive: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: string;
}

export interface CustomerProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}
