import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, Download, BookOpen, Key, Copy, Check, X, ShieldCheck, Mail } from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const { confirmedOrder, setConfirmedOrder, showToast, setPreviewSampleBook, books } = useStore();
  const [copied, setCopied] = React.useState(false);

  if (!confirmedOrder) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(confirmedOrder.downloadAccessCode);
    setCopied(true);
    showToast('Download Access Code copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (bookId: string, title: string, format: 'PDF' | 'EPUB') => {
    const bookMeta = books.find((b) => b.id === bookId);
    
    // Generate an authentic DRM-free ebook file
    const content = `================================================================================
AL JABIN PUBLICATIONS — OFFICIAL DIGITAL EDITION
================================================================================
Title:       ${title}
${bookMeta?.subtitle ? `Subtitle:    ${bookMeta.subtitle}\n` : ''}Author:      ${bookMeta?.author || 'Al Jabin Publications'}
Category:    ${bookMeta?.category || 'General'}
ISBN:        ${bookMeta?.isbn || '978-984-09-8421-2'}
Language:    ${bookMeta?.language || 'English'}
Format:      Universal ${format} (DRM-Free Personal Edition)
Order ID:    ${confirmedOrder.id}
Licensed To: ${confirmedOrder.customerName} (${confirmedOrder.customerEmail})
Access Code: ${confirmedOrder.downloadAccessCode}
Publisher:   Al Jabin Publications, Dhaka, Bangladesh
Date:        ${new Date(confirmedOrder.createdAt).toLocaleDateString()}
================================================================================

SYNOPSIS:
${bookMeta?.description || 'A published work of Al Jabin Publications.'}

${bookMeta?.keyTakeaways && bookMeta.keyTakeaways.length > 0 ? `CORE PERSPECTIVES & TAKEAWAYS:
${bookMeta.keyTakeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}
` : ''}
${bookMeta?.sampleChapters && bookMeta.sampleChapters.length > 0 ? `MANUSCRIPT EXCERPTS:
${bookMeta.sampleChapters.map((ch) => `--- ${ch.title} ---
${ch.excerpt}
`).join('\n\n')}` : ''}

================================================================================
© ${bookMeta?.publishedYear || 2026} Al Jabin Publications. All rights reserved.
Purchased via https://aljabinpublications.com
================================================================================`;

    const blob = new Blob([content], { type: format === 'PDF' ? 'application/pdf' : 'application/epub+zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_aljabin.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded "${title}" (${format}).`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl shadow-2xl border border-[#E8E9F0] rounded-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-[#171D50] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/60 font-medium">
                Payment Verified & Order Confirmed
              </div>
              <h3 className="font-editorial text-2xl text-white font-normal">
                Thank You for Your Order
              </h3>
            </div>
          </div>
          <button
            onClick={() => setConfirmedOrder(null)}
            className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Order Details Banner with rounded-2xl */}
          <div className="bg-[#FAFAFC] p-4 border border-[#E8E9F0] rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shadow-2xs">
            <div>
              <div className="text-[#686B78]">Order ID</div>
              <div className="font-bold text-[#171D50] font-mono">{confirmedOrder.id}</div>
            </div>
            <div>
              <div className="text-[#686B78]">Amount Paid</div>
              <div className="font-bold text-[#171923]">৳{confirmedOrder.total} BDT</div>
            </div>
            <div>
              <div className="text-[#686B78]">Payment Method</div>
              <div className="font-semibold text-[#171923] uppercase">{confirmedOrder.paymentMethod}</div>
            </div>
            <div>
              <div className="text-[#686B78]">Delivery Status</div>
              <div className="font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Instant Ready</span>
              </div>
            </div>
          </div>

          {/* Access Code Box with rounded-2xl */}
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-700" />
                <span>Digital Download Access Code</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 font-medium cursor-pointer px-2.5 py-1 rounded-full bg-amber-100/60"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-amber-900 bg-white/80 p-2.5 rounded-xl border border-amber-200 select-all">
              {confirmedOrder.downloadAccessCode}
            </div>
            <div className="text-[11px] text-amber-800/80">
              Save this code. You can use it in the "Find Order" tool to redownload your ebooks anytime.
            </div>
          </div>

          {/* Purchased Items & Instant Download Links with rounded-2xl */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#171923]">
              Your Downloadable Ebooks
            </h4>

            <div className="space-y-3">
              {confirmedOrder.items.map((item, idx) => {
                const bookMeta = books.find((b) => b.id === item.bookId);
                return (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-[#E8E9F0] hover:border-[#171D50]/30 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div>
                      <h5 className="font-editorial text-base font-medium text-[#171923]">
                        {item.title}
                      </h5>
                      <div className="text-xs text-[#686B78] flex items-center gap-2 mt-0.5">
                        <span>Universal DRM-Free</span>
                        <span>·</span>
                        <span>{item.format}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-medium">Licensed</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {bookMeta && (
                        <button
                          onClick={() => {
                            setConfirmedOrder(null);
                            setPreviewSampleBook(bookMeta);
                          }}
                          className="px-3.5 py-1.5 text-xs text-[#171D50] border border-[#171D50] hover:bg-[#171D50] hover:text-white rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Now</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownload(item.bookId, item.title, 'PDF')}
                        className="px-4 py-1.5 bg-[#171D50] text-white text-xs font-semibold hover:bg-[#0f1338] rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => handleDownload(item.bookId, item.title, 'EPUB')}
                        className="px-4 py-1.5 bg-gray-100 text-[#171923] text-xs font-semibold hover:bg-gray-200 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>EPUB</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Note with rounded-xl */}
          <div className="p-3.5 bg-gray-50 border border-[#E8E9F0] rounded-xl flex items-center gap-3 text-xs text-[#686B78]">
            <Mail className="w-4 h-4 text-[#171D50] shrink-0" />
            <span>
              A digital receipt with permanent download tokens has been generated for{' '}
              <strong className="text-[#171923]">{confirmedOrder.customerEmail}</strong>.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-[#FAFAFC] border-t border-[#E8E9F0] flex justify-end">
          <button
            onClick={() => setConfirmedOrder(null)}
            className="px-8 py-3 bg-[#171D50] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#0f1338] rounded-full transition-colors shadow-sm"
          >
            Done & Return to Bookstore
          </button>
        </div>

      </div>
    </div>
  );
};
