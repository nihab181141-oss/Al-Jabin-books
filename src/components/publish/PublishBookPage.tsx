import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Book } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  PenTool,
  Trash2,
  Upload,
} from 'lucide-react';

interface PublishBookPageProps {
  onBackToStore: () => void;
  onOpenAuth: (reason?: string) => void;
}

const CATEGORIES: Array<Book['category']> = [
  'Personal Growth',
  'Mindset',
  'Productivity',
  'Fiction',
];

async function compressCoverFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format.'));
      img.onload = () => {
        const attempts: Array<{ maxWidth: number; quality: number }> = [
          { maxWidth: 480, quality: 0.82 },
          { maxWidth: 420, quality: 0.7 },
          { maxWidth: 360, quality: 0.58 },
          { maxWidth: 300, quality: 0.48 },
        ];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result || ''));
          return;
        }
        let bestDataUrl = '';
        for (const { maxWidth, quality } of attempts) {
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const w = Math.max(120, Math.round(img.width * scale));
          const h = Math.max(160, Math.round(img.height * scale));
          canvas.width = w;
          canvas.height = h;
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          bestDataUrl = canvas.toDataURL('image/jpeg', quality);
          if (bestDataUrl.length <= 220000) {
            resolve(bestDataUrl);
            return;
          }
        }
        resolve(bestDataUrl);
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read PDF file.'));
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      if (commaIdx === -1) {
        reject(new Error('Failed to encode PDF file.'));
        return;
      }
      resolve(result.slice(commaIdx + 1));
    };
    reader.readAsDataURL(file);
  });
}

export const PublishBookPage: React.FC<PublishBookPageProps> = ({
  onBackToStore,
  onOpenAuth,
}) => {
  const {
    currentUser,
    userProfile,
    publishBook,
    deletePublishedBook,
    myPublishedBooks,
    setSelectedBook,
    logoIconColor,
    showToast,
  } = useStore();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<Book['category']>('Personal Growth');
  const [language, setLanguage] = useState('English');
  const [format, setFormat] = useState('PDF & EPUB');
  const [pricingMode, setPricingMode] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('0');
  const [pages, setPages] = useState('48');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [takeawaysInput, setTakeawaysInput] = useState('');
  const [sampleTitle, setSampleTitle] = useState('Chapter 1 · Opening Excerpt');
  const [sampleExcerpt, setSampleExcerpt] = useState('');
  const [manuscriptContent, setManuscriptContent] = useState('');
  const [uploadedPdfBase64, setUploadedPdfBase64] = useState<string | null>(null);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishedSuccess, setPublishedSuccess] = useState<Book | null>(null);

  useEffect(() => {
    const defaultAuthor =
      userProfile?.penName ||
      userProfile?.displayName ||
      currentUser?.displayName ||
      '';
    if (defaultAuthor && !author) {
      setAuthor(defaultAuthor);
    }
  }, [userProfile, currentUser]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressCoverFileToDataUrl(file);
      if (compressed.length > 245000) {
        setErrorMsg('Cover image is still too detailed after compression. Please use a simpler JPG/PNG.');
      } else {
        setCoverImage(compressed);
        setErrorMsg(null);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not process cover image.');
    } finally {
      inputEl.value = '';
    }
  };

  const handleManuscriptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    try {
      if (
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')
      ) {
        const maxBytes = 15 * 1024 * 1024;
        if (file.size > maxBytes) {
          setErrorMsg('PDF file must be 15 MB or smaller.');
          return;
        }
        const headerBuffer = await file.slice(0, 5).arrayBuffer();
        const headerBytes = new Uint8Array(headerBuffer);
        // Verify %PDF- magic header
        if (
          headerBytes.length < 5 ||
          headerBytes[0] !== 0x25 ||
          headerBytes[1] !== 0x50 ||
          headerBytes[2] !== 0x44 ||
          headerBytes[3] !== 0x46 ||
          headerBytes[4] !== 0x2d
        ) {
          setErrorMsg('The selected file does not have a valid PDF signature.');
          return;
        }
        const base64Pdf = await readFileAsBase64(file);
        setUploadedPdfBase64(base64Pdf);
        setUploadedPdfFile(file);
        setUploadedFileName(file.name);
        setFormat('PDF (Original Edition)');
        if (!manuscriptContent.trim()) {
          setManuscriptContent(
            `Digital PDF volume "${file.name}" (${Math.max(1, Math.round(file.size / 1024))} KB) secured in private vault.`
          );
        }
      } else if (
        file.type.startsWith('text/') ||
        file.name.toLowerCase().endsWith('.md') ||
        file.name.toLowerCase().endsWith('.txt')
      ) {
        setUploadedPdfBase64(null);
        setUploadedPdfFile(null);
        setUploadedFileName(file.name);
        const text = await file.text();
        const trimmed = text.slice(0, 280000);
        setManuscriptContent(trimmed);
        const estimatedPages = Math.max(8, Math.ceil(trimmed.split(/\s+/).length / 260));
        setPages(String(estimatedPages));
        if (!sampleExcerpt.trim()) {
          setSampleExcerpt(trimmed.slice(0, 1200));
        }
      } else {
        setErrorMsg('Please upload a .pdf, .txt, or .md manuscript file.');
      }
    } catch {
      setErrorMsg('Could not read uploaded manuscript file.');
    } finally {
      inputEl.value = '';
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPublishedSuccess(null);

    if (!currentUser) {
      onOpenAuth('Create an account or sign in before publishing your ebook.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide both a book title and a synopsis.');
      return;
    }

    if (pricingMode === 'paid' && (Number(price) || 0) < 1) {
      setErrorMsg('Paid editions require a price of at least ৳1 BDT, or select Free Edition.');
      return;
    }

    setSubmitting(true);
    try {
      const keyTakeaways = takeawaysInput
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10);

      const finalAuthor =
        author.trim() ||
        userProfile?.penName ||
        userProfile?.displayName ||
        currentUser.displayName ||
        'Independent Author';

      const result = await publishBook({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        author: finalAuthor,
        category,
        pricingMode,
        price: pricingMode === 'free' ? 0 : Math.max(1, Math.round(Number(price) || 0)),
        format: format.trim() || 'PDF & EPUB',
        pages: Number(pages) || 24,
        language: language.trim() || 'English',
        isbn: isbn.trim() || undefined,
        description: description.trim(),
        keyTakeaways,
        sampleChapterTitle: sampleTitle.trim() || undefined,
        sampleExcerpt:
          sampleExcerpt.trim() || manuscriptContent.trim().slice(0, 1200) || undefined,
        manuscriptContent: manuscriptContent.trim() || undefined,
        uploadedPdfBase64: uploadedPdfBase64 || undefined,
        uploadedPdfFile: uploadedPdfFile || undefined,
        uploadedFileName: uploadedFileName || undefined,
        coverImage: coverImage || undefined,
      });

      setPublishedSuccess(result.book);
      setTitle('');
      setSubtitle('');
      setDescription('');
      setTakeawaysInput('');
      setSampleExcerpt('');
      setManuscriptContent('');
      setUploadedPdfBase64(null);
      setUploadedPdfFile(null);
      setCoverImage('');
      setUploadedFileName(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to publish ebook.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <section className="relative w-full min-h-[calc(100vh-80px)] bg-[#F5F4EF] py-14 sm:py-20 overflow-hidden">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="flex justify-center">
            <img
              src="/assets/aistudio/Ebook-rafiki_016c9ebe.svg"
              alt="Publish your ebook"
              className="w-64 sm:w-72 h-auto object-contain select-none"
            />
          </div>
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#D97706] font-extrabold">
              Author Self-Publishing Desk
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#171923] leading-[1.08]">
              Sign Up Before{' '}
              <span className="font-editorial italic font-bold text-[#171D50]">
                Publishing Your Ebook
              </span>
            </h1>
            <p className="text-sm text-[#575A66] leading-relaxed">
              Every independent author publishes under a verified account so you can edit or manage your editions anytime. Create an account in seconds—additional profile fields are optional.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenAuth('Create your account to publish your ebook.')}
              className="min-h-[46px] px-7 py-3 bg-[#171D50] text-white text-xs sm:text-sm font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <span>Create Account / Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onBackToStore}
              className="min-h-[46px] px-6 py-3 bg-white text-[#171923] border border-black/[0.08] text-xs sm:text-sm font-semibold rounded-full hover:bg-white/80 transition-colors cursor-pointer"
            >
              Back to Bookstore
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] bg-[#F5F4EF] py-10 sm:py-14 overflow-hidden">
      {/* Subtle Brand Icon Watermark */}
      <img
        src={logoIconColor}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none fixed -right-14 bottom-8 w-80 h-80 opacity-[0.03] hidden md:block"
      />

      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-xs font-semibold text-[#171D50] bg-white/80 hover:bg-white rounded-full border border-black/[0.08] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bookstore</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth()}
            className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-xs font-semibold text-[#171923] bg-white/80 hover:bg-white rounded-full border border-black/[0.08] transition-colors cursor-pointer"
          >
            <span>Author Profile ({userProfile?.penName || userProfile?.displayName || currentUser.email})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Live Cover & Edition Preview */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#D97706] font-extrabold">
                Self-Publishing Desk
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[#171923] leading-[1.08]">
                Publish Your{' '}
                <span className="font-editorial italic font-bold text-[#171D50]">Ebook</span>
              </h1>
              <p className="text-xs text-[#575A66] leading-relaxed">
                Upload or compose your own ebook. Once published, readers can preview excerpts and download or acquire it from the catalogue.
              </p>
            </div>

            {/* Live Book Cover Mockup */}
            <div className="bg-white border border-black/[0.07] rounded-3xl p-6 flex flex-col items-center text-center space-y-4 shadow-xs">
              <div className="w-44 aspect-[3/4.4] rounded-xl overflow-hidden shadow-xl bg-[#171D50] relative flex flex-col justify-between p-5 text-white border-r-2 border-black/25">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="text-[9px] uppercase tracking-[0.22em] text-white/65">
                      {category}
                    </div>
                    <div className="space-y-2 my-auto">
                      <div className="font-editorial font-bold text-xl leading-snug line-clamp-4">
                        {title.trim() || 'Your Book Title'}
                      </div>
                      {subtitle.trim() && (
                        <div className="text-[10px] text-white/75 line-clamp-2 italic">
                          {subtitle}
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-white/15 flex flex-col items-center gap-1.5">
                      <img
                        src={logoIconColor}
                        alt=""
                        className="w-4 h-4 brightness-0 invert opacity-80"
                      />
                      <div className="text-[11px] font-medium text-white/90 truncate max-w-full">
                        {author.trim() || 'Author Name'}
                      </div>
                    </div>
                  </>
                )}
                <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
              </div>

              <div className="w-full space-y-2">
                <label className="inline-flex items-center justify-center gap-2 w-full min-h-[40px] px-4 py-2 bg-[#F5F4EF] hover:bg-[#EAE8E0] text-[#171923] text-xs font-semibold rounded-full cursor-pointer transition-colors">
                  <ImageIcon className="w-3.5 h-3.5 text-[#171D50]" />
                  <span>{coverImage ? 'Replace Cover Image' : 'Upload Custom Cover (Optional)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="sr-only"
                  />
                </label>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="text-[11px] text-[#686B78] hover:text-rose-700 underline cursor-pointer"
                  >
                    Use Al Jabin Typographic Cover
                  </button>
                )}
              </div>
            </div>

            {/* Already Published by Current Author */}
            {myPublishedBooks.length > 0 && (
              <div className="bg-white border border-black/[0.07] rounded-3xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-[#171923]">
                  <span>Your Published Volumes</span>
                  <span className="tabular-nums text-[#686B78]">{myPublishedBooks.length}</span>
                </div>
                <div className="space-y-2">
                  {myPublishedBooks.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-2 p-2.5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onBackToStore();
                          setSelectedBook(b);
                        }}
                        className="text-left font-medium text-[#171923] hover:text-[#171D50] truncate cursor-pointer"
                      >
                        {b.title}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await deletePublishedBook(b.id);
                          } catch (err: any) {
                            showToast(err?.message || 'Could not remove publication.');
                          }
                        }}
                        className="p-1 text-[#686B78] hover:text-rose-700 cursor-pointer shrink-0"
                        title="Remove volume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Publishing Form */}
          <div className="lg:col-span-8 bg-white border border-black/[0.07] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
            {publishedSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-semibold">
                      "{publishedSuccess.title}" is now live in the Editorial Catalogue!
                    </div>
                    <div className="text-emerald-700">
                      Readers can inspect, preview excerpts, and acquire it right away.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onBackToStore();
                    setSelectedBook(publishedSuccess);
                  }}
                  className="px-4 py-2 bg-emerald-700 text-white font-semibold rounded-full hover:bg-emerald-800 transition-colors cursor-pointer shrink-0"
                >
                  View in Storefront
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#171923] mb-1">
                    Ebook Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Quiet Architecture of Deep Work"
                    maxLength={180}
                    className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#171923] mb-1">
                    Subtitle <span className="text-[#686B78] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Notes on clarity and craft"
                    maxLength={240}
                    className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#171923] mb-1">
                    Author / Pen Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name or pen name"
                    maxLength={120}
                    className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#171923] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Book['category'])}
                    className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#171923] mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="English, Bengali, Bilingual..."
                    maxLength={60}
                    className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="block text-xs font-semibold text-[#171923] mb-2">
                    Edition Pricing Model *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPricingMode('free');
                        setPrice('0');
                      }}
                      className={`p-4 text-left rounded-2xl border transition-all cursor-pointer ${
                        pricingMode === 'free'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs'
                          : 'border-[#E8E9F0] bg-[#FAFAFC] hover:border-black/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#171923]">Free Edition</span>
                        <span className="font-mono text-xs font-bold text-emerald-700">৳0</span>
                      </div>
                      <p className="text-[11px] text-[#575A66] mt-1 leading-relaxed">
                        Readers claim and download the PDF instantly with zero payment steps.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPricingMode('paid');
                        if (!price || Number(price) <= 0) {
                          setPrice('249');
                        }
                      }}
                      className={`p-4 text-left rounded-2xl border transition-all cursor-pointer ${
                        pricingMode === 'paid'
                          ? 'border-[#171D50] bg-[#171D50]/[0.04] shadow-2xs'
                          : 'border-[#E8E9F0] bg-[#FAFAFC] hover:border-black/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#171923]">Paid Edition</span>
                        <span className="font-mono text-xs font-bold text-[#171D50]">
                          {pricingMode === 'paid' ? `৳${Number(price) || 0}` : 'Custom ৳'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#575A66] mt-1 leading-relaxed">
                        Automatic payment verification unlocks instant PDF delivery upon checkout.
                      </p>
                    </button>
                  </div>

                  {pricingMode === 'paid' && (
                    <div className="mt-3 p-4 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-[#171923] mb-1">
                          Set Edition Price (BDT)
                        </label>
                        <div className="relative max-w-[200px]">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#171D50]">
                            ৳
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={100000}
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full min-h-[42px] pl-8 pr-4 py-2 text-sm font-bold bg-white border border-[#E8E9F0] rounded-xl focus:border-[#171D50] focus:outline-none font-mono tabular-nums"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {['149', '249', '399', '599'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setPrice(preset)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border cursor-pointer transition-colors ${
                              price === preset
                                ? 'bg-[#171D50] text-white border-[#171D50]'
                                : 'bg-white text-[#171923] border-[#E8E9F0] hover:border-[#171D50]/40'
                            }`}
                          >
                            ৳{preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#171923] mb-1">Format</label>
                    <input
                      type="text"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      maxLength={60}
                      className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171923] mb-1">Pages</label>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171923] mb-1">
                  Book Synopsis / Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the core premise, ideas, and who this ebook helps..."
                  maxLength={5000}
                  className="w-full px-4 py-3 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171923] mb-1">
                  Key Takeaways <span className="text-[#686B78] font-normal">(Optional, one per line)</span>
                </label>
                <textarea
                  rows={2}
                  value={takeawaysInput}
                  onChange={(e) => setTakeawaysInput(e.target.value)}
                  placeholder="Practical mental models&#10;Step-by-step daily habits"
                  className="w-full px-4 py-2.5 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                />
              </div>

              {/* Manuscript Upload or Text Composer */}
              <div className="pt-4 border-t border-black/[0.07] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#171923] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#171D50]" />
                      <span>Ebook Manuscript Content</span>
                    </div>
                    <p className="text-[11px] text-[#686B78]">
                      Upload a .txt / .md manuscript file or write/paste your ebook chapters below. Readers receive this packaged as a DRM-free PDF.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-1.5 min-h-[38px] px-4 py-2 bg-[#F5F4EF] hover:bg-[#EAE8E0] text-[#171D50] text-xs font-semibold rounded-full cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadedFileName ? uploadedFileName : 'Upload Manuscript (.pdf / .txt / .md)'}</span>
                    <input
                      type="file"
                      accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
                      onChange={handleManuscriptUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                {uploadedPdfBase64 && uploadedFileName && (
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <span>
                      Protected PDF staged for cloud & private vault delivery: <strong>{uploadedFileName}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedPdfBase64(null);
                        setUploadedPdfFile(null);
                        setUploadedFileName(null);
                      }}
                      className="text-emerald-800 hover:underline font-medium cursor-pointer shrink-0"
                    >
                      Clear file
                    </button>
                  </div>
                )}

                <textarea
                  rows={6}
                  value={manuscriptContent}
                  onChange={(e) => setManuscriptContent(e.target.value)}
                  placeholder="Paste or write your ebook chapters here..."
                  maxLength={280000}
                  className="w-full px-4 py-3 text-xs font-serif bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none leading-relaxed"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#171923] mb-1">
                      Sample Excerpt Title <span className="text-[#686B78] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={sampleTitle}
                      onChange={(e) => setSampleTitle(e.target.value)}
                      maxLength={140}
                      className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171923] mb-1">
                      Catalogue Code / ISBN <span className="text-[#686B78] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="Auto-generated if blank"
                      maxLength={64}
                      className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#171923] mb-1">
                    Free Sample Reader Excerpt <span className="text-[#686B78] font-normal">(Optional — auto-filled from manuscript if blank)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={sampleExcerpt}
                    onChange={(e) => setSampleExcerpt(e.target.value)}
                    placeholder="Opening passage readers can preview before acquiring..."
                    maxLength={4000}
                    className="w-full px-4 py-2.5 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#686B78]">
                  Published immediately to the Al Jabin Catalogue.
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[46px] px-8 py-3 bg-[#171D50] text-white text-xs sm:text-sm font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
                >
                  <PenTool className="w-4 h-4" />
                  <span>{submitting ? 'Publishing...' : 'Publish Ebook Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
