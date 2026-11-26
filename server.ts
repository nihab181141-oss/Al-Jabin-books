import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
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

/* =========================================================================
   Firebase Project Config & Private Ebook Disk Vault
   ========================================================================= */
interface FirebaseAppletConfig {
  projectId: string;
  firestoreDatabaseId?: string;
}

function loadFirebaseConfig(): FirebaseAppletConfig {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      projectId: String(parsed.projectId || ''),
      firestoreDatabaseId: parsed.firestoreDatabaseId ? String(parsed.firestoreDatabaseId) : '(default)',
    };
  } catch {
    return { projectId: '', firestoreDatabaseId: '(default)' };
  }
}

const PRIVATE_EBOOKS_DIR = path.resolve(process.cwd(), '.private_ebooks');
fs.mkdirSync(PRIVATE_EBOOKS_DIR, { recursive: true });

const MAX_PDF_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
const PRODUCT_ID_REGEX = /^[a-zA-Z0-9_-]{3,128}$/;

function resolveVaultPdfPath(productId: string): string | null {
  if (!PRODUCT_ID_REGEX.test(productId)) {
    return null;
  }
  const resolved = path.resolve(PRIVATE_EBOOKS_DIR, `${productId}.pdf`);
  if (!resolved.startsWith(PRIVATE_EBOOKS_DIR + path.sep)) {
    return null;
  }
  return resolved;
}

function hasStoredPdf(productId: string): boolean {
  const vaultPath = resolveVaultPdfPath(productId);
  if (!vaultPath) return false;
  try {
    return fs.existsSync(vaultPath) && fs.statSync(vaultPath).isFile();
  } catch {
    return false;
  }
}

/* =========================================================================
   Cryptographic Firebase ID Token Verification (No IAM / Key Files Needed)
   ========================================================================= */
interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
}

let cachedCerts: Record<string, string> = {};
let certsExpiresAtMs = 0;

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certsExpiresAtMs > now && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }
  const response = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!response.ok) {
    throw new Error('Failed to retrieve Google public verification keys.');
  }
  const certs = (await response.json()) as Record<string, string>;
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSec = maxAgeMatch ? Math.max(60, parseInt(maxAgeMatch[1], 10)) : 3600;
  cachedCerts = certs;
  certsExpiresAtMs = now + maxAgeSec * 1000;
  return cachedCerts;
}

function decodeBase64Url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const mod = padded.length % 4;
  const normalized = mod === 0 ? padded : padded + '='.repeat(4 - mod);
  return Buffer.from(normalized, 'base64');
}

async function verifyFirebaseIdToken(authHeader?: string): Promise<VerifiedFirebaseUser | null> {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+([A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+)$/);
  if (!match) return null;

  const token = match[1];
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(decodeBase64Url(parts[0]).toString('utf8'));
    const payload = JSON.parse(decodeBase64Url(parts[1]).toString('utf8'));
    const signature = decodeBase64Url(parts[2]);

    if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
      return null;
    }

    const certs = await getFirebasePublicCerts();
    const certPem = certs[header.kid];
    if (!certPem) {
      return null;
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    if (!verifier.verify(certPem, signature)) {
      return null;
    }

    const { projectId } = loadFirebaseConfig();
    if (!projectId) return null;

    const nowSec = Math.floor(Date.now() / 1000);
    if (
      payload.aud !== projectId ||
      payload.iss !== `https://securetoken.google.com/${projectId}` ||
      typeof payload.exp !== 'number' ||
      payload.exp <= nowSec ||
      typeof payload.iat !== 'number' ||
      payload.iat > nowSec + 300 ||
      typeof payload.auth_time !== 'number' ||
      payload.auth_time > nowSec + 300 ||
      typeof payload.sub !== 'string' ||
      payload.sub.length === 0 ||
      payload.sub.length > 128
    ) {
      return null;
    }

    return {
      uid: payload.sub,
      email: typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : undefined,
    };
  } catch {
    return null;
  }
}

// Middlewares (22MB limit supports up to 15MB base64-encoded PDF payloads)
app.use(cors());
app.use(express.json({ limit: '22mb' }));
app.use(express.urlencoded({ extended: true, limit: '22mb' }));

interface SampleChapter {
  title: string;
  excerpt: string;
  pageCount: number;
}

interface ServerProduct {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  author: string;
  category: 'Personal Growth' | 'Mindset' | 'Productivity' | 'Fiction';
  coverImage: string;
  price: number;
  priceBDT: number;
  priceUSD: number;
  format: string;
  fileSize: string;
  pages: number;
  language: string;
  isbn: string;
  keyTakeaways: string[];
  sampleChapters: SampleChapter[];
  manuscriptContent?: string;
  hasUploadedPdf?: boolean;
  isPublished: boolean;
  isNewRelease?: boolean;
  isFeatured?: boolean;
  publishedYear: number;
  downloadFileKey: string;
  createdAt: string;
}

interface PublicProductView {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  author: string;
  category: 'Personal Growth' | 'Mindset' | 'Productivity' | 'Fiction';
  coverImage: string;
  price: number;
  priceBDT: number;
  priceUSD: number;
  format: string;
  fileSize: string;
  pages: number;
  language: string;
  isbn: string;
  keyTakeaways: string[];
  sampleChapters: SampleChapter[];
  hasUploadedPdf?: boolean;
  isPublished: boolean;
  isNewRelease?: boolean;
  isFeatured?: boolean;
  publishedYear: number;
  downloadFileKey: string;
  createdAt: string;
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
  userId?: string;
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

// Server-authoritative data store (empty until real user-published records are created)
const database = {
  products: new Map<string, ServerProduct>(),
  orders: new Map<string, ServerOrder>(),
  downloads: new Map<string, ServerDownload>(),
  coupons: new Map<string, ServerCoupon>(),
};

// Strip private manuscript & internal binary fields from any public API response
function toPublicProduct(product: ServerProduct): PublicProductView {
  const { manuscriptContent: _omitted, ...publicFields } = product;
  return {
    ...publicFields,
    hasUploadedPdf: Boolean(product.hasUploadedPdf || hasStoredPdf(product.id)),
  };
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

function parseFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return undefined;
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('arrayValue' in val) {
    const values = val.arrayValue?.values;
    return Array.isArray(values) ? values.map(parseFirestoreValue) : [];
  }
  if ('mapValue' in val) {
    const fields = val.mapValue?.fields || {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = parseFirestoreValue(v);
    }
    return out;
  }
  return undefined;
}

async function fetchVerifiedProductFromFirestore(productId: string): Promise<ServerProduct | null> {
  if (!PRODUCT_ID_REGEX.test(productId)) return null;
  const { projectId, firestoreDatabaseId } = loadFirebaseConfig();
  if (!projectId) return null;

  const dbId = encodeURIComponent(firestoreDatabaseId || '(default)');
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/${dbId}/documents/products/${encodeURIComponent(productId)}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const docJson = (await resp.json()) as { fields?: Record<string, any> };
    if (!docJson.fields) return null;

    const parsed: Record<string, any> = {};
    for (const [key, value] of Object.entries(docJson.fields)) {
      parsed[key] = parseFirestoreValue(value);
    }

    if (parsed.isPublished !== true) return null;
    const allowedCategories = ['Personal Growth', 'Mindset', 'Productivity', 'Fiction'];
    const category = allowedCategories.includes(parsed.category)
      ? (parsed.category as ServerProduct['category'])
      : 'Personal Growth';
    const priceBDT = Math.max(0, Math.min(100000, Number(parsed.priceBDT ?? 0) || 0));
    const existing = database.products.get(productId);

    const synced: ServerProduct = {
      id: productId,
      ownerId: String(parsed.ownerId || ''),
      title: String(parsed.title || '').slice(0, 180),
      slug: String(parsed.slug || productId).slice(0, 200),
      subtitle: parsed.subtitle ? String(parsed.subtitle).slice(0, 240) : undefined,
      description: String(parsed.description || parsed.shortDescription || '').slice(0, 5000),
      author: String(parsed.author || '').slice(0, 120),
      category,
      coverImage: typeof parsed.coverImage === 'string' ? parsed.coverImage.slice(0, 250000) : '',
      price: priceBDT,
      priceBDT,
      priceUSD: Number(parsed.priceUSD) || Math.max(0, Number((priceBDT / 115).toFixed(2))),
      format: String(parsed.format || 'PDF & EPUB').slice(0, 60),
      fileSize: String(parsed.fileSize || '1.2 MB').slice(0, 40),
      pages: Math.max(1, Math.min(10000, Number(parsed.pages) || 24)),
      language: String(parsed.language || 'English').slice(0, 60),
      isbn: String(parsed.isbn || `AJP-${Date.now().toString().slice(-6)}`).slice(0, 64),
      keyTakeaways: Array.isArray(parsed.keyTakeaways)
        ? parsed.keyTakeaways.filter((t: unknown) => typeof t === 'string').slice(0, 10)
        : [],
      sampleChapters: Array.isArray(parsed.sampleChapters) ? parsed.sampleChapters.slice(0, 5) : [],
      manuscriptContent: existing?.manuscriptContent,
      hasUploadedPdf: Boolean(existing?.hasUploadedPdf || hasStoredPdf(productId)),
      isPublished: true,
      isFeatured: Boolean(parsed.isFeatured),
      isNewRelease: Boolean(parsed.isNewRelease),
      publishedYear: Number(parsed.publishedYear) || new Date().getFullYear(),
      downloadFileKey: productId,
      createdAt: String(parsed.createdAt || new Date().toISOString()),
    };

    if (!synced.ownerId || !synced.title || !synced.author) return null;
    database.products.set(productId, synced);
    return synced;
  } catch {
    return null;
  }
}

function sanitizePdfText(input: string): string {
  return input
    .replace(/[^\x20-\x7E\n\r]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapTextLines(text: string, maxChars = 76): string[] {
  const result: string[] = [];
  const paragraphs = text.replace(/\r\n/g, '\n').split('\n');
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      result.push('');
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > maxChars) {
        if (current) result.push(current);
        current = word.slice(0, maxChars);
      } else {
        current = (current ? current + ' ' : '') + word;
      }
    }
    if (current) result.push(current);
  }
  return result;
}

function buildEbookPdfBuffer(
  title: string,
  author: string,
  customerEmail: string,
  orderNumber: string,
  product?: ServerProduct
): Buffer {
  const bodySections: string[] = [];
  if (product?.subtitle) bodySections.push(product.subtitle, '');
  if (product?.description) {
    bodySections.push('SYNOPSIS', ...wrapTextLines(product.description), '');
  }
  if (product?.sampleChapters && product.sampleChapters.length > 0) {
    for (const ch of product.sampleChapters) {
      bodySections.push(ch.title.toUpperCase(), ...wrapTextLines(ch.excerpt), '');
    }
  }
  if (product?.manuscriptContent && product.manuscriptContent.trim()) {
    bodySections.push('FULL EDITION MANUSCRIPT', ...wrapTextLines(product.manuscriptContent));
  } else {
    bodySections.push(
      'OFFICIAL DIGITAL EDITION',
      'Published independently through Al Jabin Publications.',
      'DRM-Free Edition licensed strictly for personal reading.'
    );
  }

  const linesPerPage = 42;
  const pageChunks: string[][] = [];
  for (let i = 0; i < Math.max(1, bodySections.length); i += linesPerPage) {
    pageChunks.push(bodySections.slice(i, i + linesPerPage));
  }

  const objects: string[] = [];
  objects.push('1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj');

  const pageObjIds: number[] = [];
  let nextObjId = 4;

  pageChunks.forEach((chunk, idx) => {
    const pageId = nextObjId++;
    const contentId = nextObjId++;
    pageObjIds.push(pageId);

    const streamOps: string[] = ['BT', '/Helvetica 11 Tf', '54 744 Td'];
    if (idx === 0) {
      streamOps.push(
        '/Helvetica 16 Tf',
        `(${sanitizePdfText(title)}) Tj`,
        '0 -20 Td',
        '/Helvetica 10 Tf',
        `(By ${sanitizePdfText(author)} | Al Jabin Publications) Tj`,
        '0 -16 Td',
        `(Licensed to: ${sanitizePdfText(customerEmail)} | Order: ${sanitizePdfText(orderNumber)}) Tj`,
        '0 -26 Td',
        '/Helvetica 11 Tf'
      );
    } else {
      streamOps.push(
        '/Helvetica 9 Tf',
        `(${sanitizePdfText(title)} — Page ${idx + 1}) Tj`,
        '0 -24 Td',
        '/Helvetica 11 Tf'
      );
    }

    for (const line of chunk) {
      if (line === '') {
        streamOps.push('0 -10 Td');
      } else {
        streamOps.push(`(${sanitizePdfText(line)}) Tj`, '0 -14 Td');
      }
    }
    streamOps.push('ET');
    const streamData = streamOps.join('\n');

    objects.push(
      `${pageId} 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents ${contentId} 0 R/Resources<</Font<</Helvetica 3 0 R>>>>>>endobj`
    );
    objects.push(
      `${contentId} 0 obj<</Length ${Buffer.byteLength(streamData, 'utf8')}>>stream\n${streamData}\nendstream endobj`
    );
  });

  objects.splice(
    1,
    0,
    `2 0 obj<</Type/Pages/Kids[${pageObjIds.map((id) => `${id} 0 R`).join(' ')}]/Count ${pageObjIds.length}>>endobj`,
    `3 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj`
  );

  const sorted = objects
    .map((obj) => ({ id: parseInt(obj.split(' ', 1)[0], 10), body: obj }))
    .sort((a, b) => a.id - b.id);

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const item of sorted) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += item.body + '\n';
  }
  const xrefPos = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${sorted.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer<</Size ${sorted.length + 1}/Root 1 0 R>>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

/* =========================================================================
   1. Health & Configuration Diagnostics
   ========================================================================= */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Al Jabin Publications E-Commerce & Self-Publishing Engine',
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
   2. Product Catalog & Authenticated Author Publishing API
   ========================================================================= */
app.get('/api/products', (req: Request, res: Response) => {
  const published = Array.from(database.products.values())
    .filter((p) => p.isPublished)
    .map(toPublicProduct);
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
  res.json({ success: true, product: toPublicProduct(product) });
});

// Firestore-verified public catalog sync for checkout hydration (never trusts client prices)
app.post('/api/products/catalog-sync', async (req: Request, res: Response) => {
  const id = typeof req.body?.id === 'string' ? req.body.id.trim() : '';
  if (!PRODUCT_ID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Valid publication ID is required.' });
  }
  const verifiedProduct = await fetchVerifiedProductFromFirestore(id);
  if (!verifiedProduct) {
    return res.status(404).json({ error: 'Published volume not found in verified Firestore catalogue.' });
  }
  return res.json({ success: true, product: toPublicProduct(verifiedProduct) });
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const verifiedUser = await verifyFirebaseIdToken(req.headers.authorization);
    if (!verifiedUser) {
      return res.status(401).json({ error: 'Verified Firebase authentication required to publish or modify volumes.' });
    }

    const body = req.body || {};
    const id =
      typeof body.id === 'string' && PRODUCT_ID_REGEX.test(body.id)
        ? body.id
        : `book_${crypto.randomBytes(6).toString('hex')}`;
    const ownerId = verifiedUser.uid;
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 180) : '';
    const author = typeof body.author === 'string' ? body.author.trim().slice(0, 120) : '';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 5000) : '';

    if (!title || !author || !description) {
      return res.status(400).json({ error: 'title, author, and description are required.' });
    }

    const existingProduct = database.products.get(id);
    if (existingProduct && existingProduct.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Only the publishing author may modify this publication.' });
    }

    // Validate & persist uploaded binary PDF into the private non-public disk vault
    let uploadedPdfSaved = Boolean(existingProduct?.hasUploadedPdf || hasStoredPdf(id));
    if (typeof body.uploadedPdfBase64 === 'string' && body.uploadedPdfBase64.trim().length > 0) {
      const stripped = body.uploadedPdfBase64.replace(/^data:application\/pdf;base64,/i, '').trim();
      const pdfBuffer = Buffer.from(stripped, 'base64');
      if (pdfBuffer.byteLength === 0 || pdfBuffer.byteLength > MAX_PDF_UPLOAD_BYTES) {
        return res.status(400).json({ error: 'Uploaded PDF exceeds 15 MB limit or is empty.' });
      }
      if (pdfBuffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
        return res.status(400).json({ error: 'Invalid PDF file signature (%PDF- header required).' });
      }
      const vaultPath = resolveVaultPdfPath(id);
      if (!vaultPath) {
        return res.status(400).json({ error: 'Invalid publication identifier for secure storage.' });
      }
      fs.writeFileSync(vaultPath, pdfBuffer);
      uploadedPdfSaved = true;
    }

    const allowedCategories = ['Personal Growth', 'Mindset', 'Productivity', 'Fiction'];
    const category = allowedCategories.includes(body.category)
      ? (body.category as ServerProduct['category'])
      : 'Personal Growth';

    const priceBDT = Math.max(0, Math.min(100000, Number(body.priceBDT ?? body.price ?? 0) || 0));
    const slug =
      typeof body.slug === 'string' && body.slug.trim()
        ? body.slug.trim().slice(0, 200)
        : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || id;

    const incomingManuscript =
      typeof body.manuscriptContent === 'string' && body.manuscriptContent.trim().length > 0
        ? body.manuscriptContent.slice(0, 300000)
        : existingProduct?.manuscriptContent;

    const product: ServerProduct = {
      id,
      ownerId,
      title,
      slug,
      subtitle: typeof body.subtitle === 'string' ? body.subtitle.trim().slice(0, 240) : undefined,
      description,
      author,
      category,
      coverImage: typeof body.coverImage === 'string' ? body.coverImage.slice(0, 250000) : '',
      price: priceBDT,
      priceBDT,
      priceUSD: Number(body.priceUSD) || Math.max(0, Number((priceBDT / 115).toFixed(2))),
      format: typeof body.format === 'string' && body.format.trim() ? body.format.trim().slice(0, 60) : 'PDF & EPUB',
      fileSize: typeof body.fileSize === 'string' && body.fileSize.trim() ? body.fileSize.trim().slice(0, 40) : '1.2 MB',
      pages: Math.max(1, Math.min(10000, Number(body.pages) || 24)),
      language: typeof body.language === 'string' && body.language.trim() ? body.language.trim().slice(0, 60) : 'English',
      isbn: typeof body.isbn === 'string' && body.isbn.trim() ? body.isbn.trim().slice(0, 64) : `AJP-${Date.now().toString().slice(-6)}`,
      keyTakeaways: Array.isArray(body.keyTakeaways)
        ? body.keyTakeaways.filter((t: unknown) => typeof t === 'string' && t.trim()).slice(0, 10)
        : [],
      sampleChapters: Array.isArray(body.sampleChapters) ? body.sampleChapters.slice(0, 5) : [],
      manuscriptContent: incomingManuscript,
      hasUploadedPdf: uploadedPdfSaved,
      isPublished: body.isPublished !== false,
      isNewRelease: Boolean(body.isNewRelease ?? true),
      isFeatured: Boolean(body.isFeatured ?? false),
      publishedYear: Number(body.publishedYear) || new Date().getFullYear(),
      downloadFileKey: id,
      createdAt:
        existingProduct?.createdAt ||
        (typeof body.createdAt === 'string' ? body.createdAt : new Date().toISOString()),
    };

    database.products.set(id, product);
    return res.status(201).json({ success: true, product: toPublicProduct(product) });
  } catch (err) {
    console.error('Publish sync error:', err);
    return res.status(500).json({ error: 'Failed to sync publication.' });
  }
});

app.get('/api/author/stats', async (req: Request, res: Response) => {
  const verifiedUser = await verifyFirebaseIdToken(req.headers.authorization);
  if (!verifiedUser) {
    return res.status(401).json({ error: 'Authentication required to access author statistics.' });
  }
  const ownerId = verifiedUser.uid;

  const ownedProducts = Array.from(database.products.values()).filter((p) => p.ownerId === ownerId);
  const bookStatsMap = new Map<
    string,
    {
      bookId: string;
      title: string;
      category: string;
      priceBDT: number;
      unitsSold: number;
      revenueBDT: number;
      downloadsCount: number;
    }
  >();

  for (const p of ownedProducts) {
    bookStatsMap.set(p.id, {
      bookId: p.id,
      title: p.title,
      category: p.category,
      priceBDT: p.priceBDT,
      unitsSold: 0,
      revenueBDT: 0,
      downloadsCount: 0,
    });
  }

  let totalUnitsSold = 0;
  let totalRevenueBDT = 0;
  let totalDownloads = 0;
  const recentSales: Array<{
    orderNumber: string;
    bookId: string;
    bookTitle: string;
    buyerName: string;
    quantity: number;
    amountBDT: number;
    createdAt: string;
    paymentStatus: string;
  }> = [];

  for (const order of database.orders.values()) {
    if (order.paymentStatus !== 'verified') continue;
    for (const item of order.items) {
      const stat = bookStatsMap.get(item.id);
      if (!stat) continue;

      const lineRevenueBDT =
        order.currency === 'USD'
          ? Math.round(item.price * 115 * item.quantity)
          : Math.round(item.price * item.quantity);

      stat.unitsSold += item.quantity;
      stat.revenueBDT += lineRevenueBDT;
      totalUnitsSold += item.quantity;
      totalRevenueBDT += lineRevenueBDT;

      const firstName = order.customerName.trim().split(/\s+/)[0] || 'Reader';
      recentSales.push({
        orderNumber: order.orderNumber,
        bookId: item.id,
        bookTitle: item.title,
        buyerName: firstName,
        quantity: item.quantity,
        amountBDT: lineRevenueBDT,
        createdAt: order.paidAt || order.createdAt,
        paymentStatus: order.paymentStatus,
      });
    }
  }

  for (const dl of database.downloads.values()) {
    const stat = bookStatsMap.get(dl.productId);
    if (!stat) continue;
    stat.downloadsCount += dl.downloadCount;
    totalDownloads += dl.downloadCount;
  }

  recentSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({
    success: true,
    summary: {
      totalBooks: ownedProducts.length,
      totalUnitsSold,
      totalRevenueBDT,
      totalDownloads,
    },
    perBookStats: Array.from(bookStatsMap.values()),
    recentSales: recentSales.slice(0, 50),
  });
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const verifiedUser = await verifyFirebaseIdToken(req.headers.authorization);
  if (!verifiedUser) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const existing = database.products.get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Publication not found.' });
  }
  if (existing.ownerId !== verifiedUser.uid) {
    return res.status(403).json({ error: 'Only the publishing author may delete this publication.' });
  }

  database.products.delete(req.params.id);
  const vaultPath = resolveVaultPdfPath(req.params.id);
  if (vaultPath && fs.existsSync(vaultPath)) {
    try {
      fs.unlinkSync(vaultPath);
    } catch {}
  }

  return res.json({ success: true });
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
app.post('/api/orders/create', async (req: Request, res: Response) => {
  try {
    const verifiedUser = await verifyFirebaseIdToken(req.headers.authorization);
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      couponCode,
      currency = 'BDT',
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
      let product = database.products.get(item.id);
      if (!product && typeof item.id === 'string') {
        const fetched = await fetchVerifiedProductFromFirestore(item.id);
        if (fetched) product = fetched;
      }

      if (!product || !product.isPublished) {
        return res.status(400).json({
          error: `Publication "${item.title || item.id}" is not available in the verified catalogue.`,
        });
      }

      const price = currency === 'USD' ? product.priceUSD : product.priceBDT;
      const title = product.title;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
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
      userId: verifiedUser?.uid,
      customerName: String(customerName).trim().slice(0, 120),
      customerEmail: String(customerEmail).trim().toLowerCase().slice(0, 320),
      customerPhone: customerPhone ? String(customerPhone).trim().slice(0, 40) : undefined,
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
  if (order.paymentStatus === 'verified') {
    return;
  }

  order.paymentStatus = 'verified';
  order.paidAt = new Date().toISOString();

  for (const item of order.items) {
    const token = crypto.randomBytes(24).toString('hex');
    const downloadId = `dl_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    database.downloads.set(token, {
      id: downloadId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
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
};

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

  entitlement.downloadCount += 1;
  const product = database.products.get(entitlement.productId);

  const safeFilename = `${entitlement.productTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Al_Jabin_Publications.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Stream uploaded original PDF from private vault if present
  const vaultPath = resolveVaultPdfPath(entitlement.productId);
  if (vaultPath && fs.existsSync(vaultPath)) {
    return res.sendFile(vaultPath);
  }

  const pdfBuffer = buildEbookPdfBuffer(
    entitlement.productTitle,
    product?.author || 'Al Jabin Author',
    entitlement.customerEmail,
    entitlement.orderNumber,
    product
  );

  return res.send(pdfBuffer);
});

app.get('/api/user/library', async (req: Request, res: Response) => {
  const verifiedUser = await verifyFirebaseIdToken(req.headers.authorization);
  if (!verifiedUser) {
    return res.status(401).json({ error: 'Authentication required to access your personal library.' });
  }

  const userEntitlements = Array.from(database.downloads.values())
    .filter(
      (d) =>
        (d.userId && d.userId === verifiedUser.uid) ||
        (verifiedUser.email && d.customerEmail === verifiedUser.email)
    )
    .map((d) => ({
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

app.get('/api/orders/:id', async (req: Request, res: Response) => {
  const idOrNum = req.params.id;
  const order =
    database.orders.get(idOrNum) ||
    Array.from(database.orders.values()).find((o) => o.orderNumber === idOrNum);

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const verifiedUser = await verifyFirebaseIdToken(req.headers.authorization);
  const isOwner = Boolean(
    verifiedUser &&
      ((order.userId && order.userId === verifiedUser.uid) ||
        (verifiedUser.email && order.customerEmail === verifiedUser.email))
  );

  const downloads = Array.from(database.downloads.values())
    .filter((d) => d.orderId === order.id)
    .map((d) => ({
      productId: d.productId,
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
      customerEmail: isOwner ? order.customerEmail : maskEmail(order.customerEmail),
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
          allowedHosts: true,
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
