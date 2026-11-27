import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, Download, BookOpen, Key, Copy, Check, X, ShieldCheck, Mail, RefreshCw } from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const { confirmedOrder, setConfirmedOrder, showToast, setPreviewSampleBook, books, lookupOrder } = useStore();
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!confirmedOrder) return null;

  const isFree = confirmedOrder.total === 0 || confirmedOrder.verificationMode === 'free';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(confirmedOrder.downloadAccessCode);
    setCopied(true);
    showToast('Download Access Code copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshDownloadLinks = async () => {
    setRefreshing(true);
    try {
      const refreshed = await lookupOrder(confirmedOrder.id);
      if (refreshed && refreshed.downloads && refreshed.downloads.length > 0) {
        setConfirmedOrder(refreshed);
        showToast('Download links synced from server.');
      } else {
        showToast('Could not locate active download token for this order.');
      }
    } finally {
      setRefreshing(false);
    }
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
              <div className="text-xs uppercase tracking-widest text-white/70 font-medium">
                {isFree ? 'Free Edition Unlocked · Instant PDF Ready' : 'Payment Automatically Verified'}
              </div>
              <h3 className="font-editorial text-2xl text-white font-normal">
                {isFree ? 'Your Free PDF Is Ready' : 'Thank You for Your Order'}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setConfirmedOrder(null)}
            className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Order Details Banner */}
          <div className="bg-[#FAFAFC] p-4 border border-[#E8E9F0] rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shadow-2xs">
            <div>
              <div className="text-[#686B78]">Order Reference</div>
              <div className="font-bold text-[#171D50] font-mono truncate">
                {confirmedOrder.orderNumber || confirmedOrder.id}
              </div>
            </div>
            <div>
              <div className="text-[#686B78]">{isFree ? 'Edition Type' : 'Amount Paid'}</div>
              <div className="font-bold text-[#171923] font-mono tabular-nums">
                {isFree ? 'Free (৳0)' : `৳${confirmedOrder.total} BDT`}
              </div>
            </div>
            <div>
              <div className="text-[#686B78]">Verification</div>
              <div className="font-semibold text-[#171923] uppercase">
                {isFree ? 'Instant Claim' : confirmedOrder.paymentMethod}
              </div>
            </div>
            <div>
              <div className="text-[#686B78]">Delivery Status</div>
              <div className="font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PDF Unlocked</span>
              </div>
            </div>
          </div>

          {/* Access Code Box */}
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
              Save this code. You can enter it in "Find Order" anytime to re-download your PDF.
            </div>
          </div>

          {/* Purchased Items & Instant Download Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#171923]">
                Your Protected PDF Downloads
              </h4>
              {(!confirmedOrder.downloads || confirmedOrder.downloads.length === 0) && (
                <button
                  type="button"
                  onClick={handleRefreshDownloadLinks}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#171D50] hover:underline cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Sync Download Link</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {confirmedOrder.items.map((item, idx) => {
                const bookMeta = books.find((b) => b.id === item.bookId);
                const dlToken =
                  confirmedOrder.downloads?.find(
                    (d) => d.productId === item.bookId || d.productTitle === item.title
                  ) || confirmedOrder.downloads?.[idx];
                return (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-[#E8E9F0] hover:border-[#171D50]/30 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div>
                      <h5 className="font-editorial text-base font-medium text-[#171923]">
                        {item.title}
                      </h5>
                      <div className="text-xs text-[#686B78] flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{item.format || 'PDF Edition'}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-medium">Licensed</span>
                        {dlToken && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[11px]">
                              {dlToken.downloadCount} of {dlToken.maxDownloads} downloads used
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {bookMeta && (
                        <button
                          onClick={() => {
                            setConfirmedOrder(null);
                            setPreviewSampleBook(bookMeta);
                          }}
                          className="px-3.5 py-2 text-xs text-[#171D50] border border-[#171D50] hover:bg-[#171D50] hover:text-white rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Sample</span>
                        </button>
                      )}

                      {dlToken?.downloadUrl ? (
                        <a
                          href={dlToken.downloadUrl}
                          download
                          onClick={() => showToast(`Downloading "${item.title}" PDF...`)}
                          className="px-5 py-2 bg-[#171D50] text-white text-xs font-semibold hover:bg-[#0f1338] rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF Now</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRefreshDownloadLinks}
                          disabled={refreshing}
                          className="px-4 py-2 bg-[#F5F4EF] text-[#171923] text-xs font-semibold hover:bg-[#EAE8E0] rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                          <span>Fetch PDF Link</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Note */}
          <div className="p-3.5 bg-gray-50 border border-[#E8E9F0] rounded-xl flex items-center gap-3 text-xs text-[#686B78]">
            <Mail className="w-4 h-4 text-[#171D50] shrink-0" />
            <span>
              Tokenized PDF access (valid 7 days, up to 5 downloads) has been issued for{' '}
              <strong className="text-[#171923]">{confirmedOrder.customerEmail}</strong>.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-[#FAFAFC] border-t border-[#E8E9F0] flex justify-end">
          <button
            onClick={() => setConfirmedOrder(null)}
            className="px-8 py-3 bg-[#171D50] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#0f1338] rounded-full transition-colors shadow-sm cursor-pointer"
          >
            Done & Return to Bookstore
          </button>
        </div>

      </div>
    </div>
  );
};
