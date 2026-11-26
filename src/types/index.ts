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
  ownerId?: string;
  title: string;
  subtitle?: string;
  author: string;
  category: 'Personal Growth' | 'Mindset' | 'Productivity' | 'Fiction';
  price: number; // in BDT (0 = free edition)
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
  manuscriptContent?: string;
  hasUploadedPdf?: boolean;
  downloadFileKey: string;
  createdAt?: string;
}

export interface PublishBookInput {
  title: string;
  subtitle?: string;
  author: string;
  category: 'Personal Growth' | 'Mindset' | 'Productivity' | 'Fiction';
  price: number;
  format: string;
  pages: number;
  language: string;
  isbn?: string;
  description: string;
  keyTakeaways: string[];
  sampleChapterTitle?: string;
  sampleExcerpt?: string;
  manuscriptContent?: string;
  uploadedPdfBase64?: string;
  uploadedFileName?: string;
  coverImage?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'card' | 'international';

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

export interface OptionalProfileFields {
  displayName?: string;
  penName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
}

export interface CustomerProfile extends OptionalProfileFields {
  uid: string;
  email: string;
  role: 'customer';
  createdAt: string;
  updatedAt?: string;
}

export interface AuthorSalesSummary {
  totalBooks: number;
  totalUnitsSold: number;
  totalRevenueBDT: number;
  totalDownloads: number;
}

export interface AuthorBookStat {
  bookId: string;
  title: string;
  category: string;
  priceBDT: number;
  unitsSold: number;
  revenueBDT: number;
  downloadsCount: number;
}

export interface AuthorRecentSale {
  orderNumber: string;
  bookId: string;
  bookTitle: string;
  buyerName: string;
  quantity: number;
  amountBDT: number;
  createdAt: string;
  paymentStatus: string;
}

export interface AuthorSalesData {
  summary: AuthorSalesSummary;
  perBookStats: AuthorBookStat[];
  recentSales: AuthorRecentSale[];
}

