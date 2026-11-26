import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function resolvePort(): number {
  const portFlagIdx = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portFlagIdx !== -1 && process.argv[portFlagIdx + 1]) {
    const parsed = parseInt(process.argv[portFlagIdx + 1], 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  const portEq = process.argv.find((arg) => arg.startsWith('--port='));
  if (portEq) {
    const parsed = parseInt(portEq.split('=')[1], 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : NaN;
  if (!Number.isNaN(envPort) && envPort > 0 && (process.env.NODE_ENV === 'production' || envPort !== 8080)) {
    return envPort;
  }
  return 3000;
}

const PORT = resolvePort();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-Memory Fallback Cache / Store when cloud connectivity is initializing
interface ServerProduct {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  author: string;
  category: string;
  coverImage: string;
  priceBDT: number;
  priceUSD: number;
  format: string;
  fileSize: string;
  pages: number;
  isbn: string;
  isPublished: boolean;
  publishedYear: number;
}

interface ServerOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  currency: 'BDT' | 'USD';
  paymentProvider: 'direct';
  paymentStatus: 'pending' | 'verified' | 'failed' | 'cancelled';
  fulfillmentStatus: 'pending' | 'fulfilled' | 'failed';
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
}

interface ServerDownload {
  id: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  productId: string;
  productTitle: string;
  tokenHash: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
  createdAt: string;
  revokedAt?: string;
}

interface ServerCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderValue: number;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

// Server-authoritative data store (empty until real records are created)
const database = {
  products: new Map<string, ServerProduct>(),
  orders: new Map<string, ServerOrder>(),
  downloads: new Map<string, ServerDownload>(),
  coupons: new Map<string, ServerCoupon>(),
};

/* =========================================================================
   1. Health & Configuration Diagnostics
   ========================================================================= */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Al Jabin Publications E-Commerce Engine',
    timestamp: new Date().toISOString(),
    counts: {
      products: database.products.size,
      orders: database.orders.size,
      downloads: database.downloads.size,
      coupons: database.coupons.size,
    },
  });
});

/* =========================================================================
   2. Product Catalog API (Server-Authoritative)
   ========================================================================= */
app.get('/api/products', (req: Request, res: Response) => {
  const published = Array.from(database.products.values()).filter(p => p.isPublished);
  res.json({
    success: true,
    count: published.length,
    products: published,
  });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = database.products.get(req.params.id);
  if (!product || !product.isPublished) {
    return res.status(404).json({ error: 'Publication not found or unpublished.' });
  }
  res.json({ success: true, product });
});

/* =========================================================================
   3. Coupon Validation (Server-Side)
   ========================================================================= */
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Promo code required.' });
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = database.coupons.get(cleanCode);

  if (!coupon || !coupon.isActive) {
    return res.status(404).json({ error: 'Invalid or inactive promotional code.' });
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return res.status(400).json({ error: 'Promotional code usage limit has been reached.' });
  }

  const amount = Number(subtotal) || 0;
  if (amount < coupon.minimumOrderValue) {
    return res.status(400).json({
      error: `Minimum order subtotal of ৳${coupon.minimumOrderValue} required for this code.`,
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((amount * coupon.discountValue) / 100);
  } else {
    discount = Math.min(amount, coupon.discountValue);
  }

  res.json({
    success: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: discount,
  });
});

/* =========================================================================
   4. Secure Order Creation (Server-Calculated Totals)
   ========================================================================= */
app.post('/api/orders/create', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      couponCode,
      currency = 'BDT',
      userId,
    } = req.body;

    if (!customerEmail || !customerName) {
      return res.status(400).json({ error: 'Customer name and email are required.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Shopping cart is empty.' });
    }

    // Server-calculated prices: Reject client-supplied prices!
    let calculatedSubtotal = 0;
    const validatedItems: ServerOrder['items'] = [];

    for (const item of items) {
      const product = database.products.get(item.id);
      if (!product || !product.isPublished) {
        return res.status(400).json({
          error: `Publication "${item.title || item.id}" is not available in the verified catalogue.`,
        });
      }

      const price = currency === 'USD' ? product.priceUSD : product.priceBDT;
      const title = product.title;
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      calculatedSubtotal += price * qty;
      validatedItems.push({
        id: item.id,
        title,
        price,
        quantity: qty,
      });
    }

    // Server-side coupon verification
    let discountAmount = 0;
    if (couponCode) {
      const cleanCode = String(couponCode).trim().toUpperCase();
      const coupon = database.coupons.get(cleanCode);
      if (coupon && coupon.isActive && calculatedSubtotal >= coupon.minimumOrderValue) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
        } else {
          discountAmount = Math.min(calculatedSubtotal, coupon.discountValue);
        }
        coupon.usageCount += 1;
      }
    }

    const calculatedTotal = Math.max(0, calculatedSubtotal - discountAmount);
    const orderNumber = `AJP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    const newOrder: ServerOrder = {
      id: orderId,
      orderNumber,
      userId: userId || undefined,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone ? String(customerPhone).trim() : undefined,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      total: calculatedTotal,
      currency: currency === 'USD' ? 'USD' : 'BDT',
      paymentProvider: 'direct',
      paymentStatus: 'pending',
      fulfillmentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    database.orders.set(orderId, newOrder);

    return res.status(201).json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      subtotal: newOrder.subtotal,
      discount: newOrder.discount,
      total: newOrder.total,
      currency: newOrder.currency,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Failed to process and initialize order.' });
  }
});

/* =========================================================================
   5. Order Fulfillment & Digital Entitlement Generation
   ========================================================================= */
const fulfillOrderPayment = (order: ServerOrder) => {
  // Idempotency check: never fulfill an already paid order twice!
  if (order.paymentStatus === 'verified') {
    return;
  }

  order.paymentStatus = 'verified';
  order.paidAt = new Date().toISOString();

  // Generate secure expiring download entitlement tokens for each purchased ebook
  for (const item of order.items) {
    const token = crypto.randomBytes(24).toString('hex');
    const downloadId = `dl_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiration

    database.downloads.set(token, {
      id: downloadId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      productId: item.id,
      productTitle: item.title,
      tokenHash: token,
      expiresAt,
      downloadCount: 0,
      maxDownloads: 5,
      createdAt: new Date().toISOString(),
    });
  }

  order.fulfillmentStatus = 'fulfilled';
  order.deliveredAt = new Date().toISOString();
  console.log(`[Order Fulfilled] Order ${order.orderNumber} for ${order.customerEmail} marked PAID & FULFILLED.`);
};

// Direct API endpoint to confirm order and issue digital entitlements
app.post('/api/payment/confirm-test', (req: Request, res: Response) => {
  const { orderId } = req.body;
  const order = database.orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  fulfillOrderPayment(order);
  res.json({
    success: true,
    message: 'Payment verified and digital entitlements generated.',
    orderId: order.id,
    orderNumber: order.orderNumber,
  });
});

/* =========================================================================
   6. Secure Digital Ebook Delivery & Expiring Token Download
   ========================================================================= */
app.get('/api/downloads/:token', (req: Request, res: Response) => {
  const token = req.params.token;
  const entitlement = database.downloads.get(token);

  if (!entitlement) {
    return res.status(404).send('Invalid or non-existent download token.');
  }

  if (entitlement.revokedAt) {
    return res.status(403).send('This download token has been revoked.');
  }

  if (new Date() > new Date(entitlement.expiresAt)) {
    return res.status(410).send('This download link has expired. Please access your purchase from your account library.');
  }

  if (entitlement.downloadCount >= entitlement.maxDownloads) {
    return res.status(429).send(`Download limit of ${entitlement.maxDownloads} downloads exceeded for this security token.`);
  }

  // Increment download count
  entitlement.downloadCount += 1;

  // Stream authentic DRM-free publication specimen
  const safeFilename = `${entitlement.productTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Al_Jabin_Publications.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
  
  // High-fidelity minimal binary PDF stub representing digital volume delivery
  const specimenPdf = Buffer.from(
    `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<<>>>>endobj\n4 0 obj<</Length 180>>stream\nBT\n/Helvetica 16 Tf\n50 720 Td\n(Al Jabin Publications - DRM-Free Edition) Tj\n/Helvetica 12 Tf\n0 -30 Td\n(Title: ${entitlement.productTitle}) Tj\n0 -20 Td\n(Licensed to: ${entitlement.customerEmail}) Tj\n0 -20 Td\n(Order: ${entitlement.orderNumber}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000057 00000 n \n0000000114 00000 n \n0000000216 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n448\n%%EOF`
  );

  return res.send(specimenPdf);
});

// Customer Purchased Ebook Library
app.get('/api/user/library', (req: Request, res: Response) => {
  const email = (req.query.email as string)?.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Customer email required.' });
  }

  const userEntitlements = Array.from(database.downloads.values())
    .filter(d => d.customerEmail === email)
    .map(d => ({
      downloadId: d.id,
      productId: d.productId,
      productTitle: d.productTitle,
      orderNumber: d.orderNumber,
      downloadUrl: `/api/downloads/${d.tokenHash}`,
      expiresAt: d.expiresAt,
      downloadCount: d.downloadCount,
      maxDownloads: d.maxDownloads,
      isExpired: new Date() > new Date(d.expiresAt),
    }));

  res.json({
    success: true,
    count: userEntitlements.length,
    library: userEntitlements,
  });
});

// Order Lookup by ID or orderNumber
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const idOrNum = req.params.id;
  const order = database.orders.get(idOrNum) ||
    Array.from(database.orders.values()).find(o => o.orderNumber === idOrNum);

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const downloads = Array.from(database.downloads.values())
    .filter(d => d.orderId === order.id)
    .map(d => ({
      productTitle: d.productTitle,
      downloadUrl: `/api/downloads/${d.tokenHash}`,
      expiresAt: d.expiresAt,
      downloadCount: d.downloadCount,
      maxDownloads: d.maxDownloads,
    }));

  res.json({
    success: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      currency: order.currency,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      downloads: order.paymentStatus === 'verified' ? downloads : [],
    },
  });
});

/* =========================================================================
   7. Vite Middleware (Dev) & Static Serving (Prod)
   ========================================================================= */
function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const viteReady = import('vite').then(({ createServer: createViteServer }) =>
      createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
        },
        appType: 'spa',
      })
    );

    app.use((req, res, next) => {
      viteReady
        .then((vite) => vite.middlewares(req, res, next))
        .catch(next);
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Al Jabin Publications] Full-stack engine running on http://localhost:${PORT}`);
  });
}

startServer();
