import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, BookOpen, ChevronLeft, ChevronRight, ShoppingBag, Download } from 'lucide-react';

export const SampleReaderModal: React.FC = () => {
  const {
    previewSampleBook,
    setPreviewSampleBook,
    addToCart,
    quickAcquireFreeBook,
    logoIconColor,
  } = useStore();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  useEffect(() => {
    setActiveChapterIndex(0);
  }, [previewSampleBook?.id]);

  if (!previewSampleBook) return null;

  const isFree = previewSampleBook.price === 0;
  const chapters = previewSampleBook.sampleChapters || [];
  const currentChapter = chapters[activeChapterIndex] || {
    title: 'Sample Excerpt',
    pageCount: previewSampleBook.pages || 0,
    excerpt: previewSampleBook.description,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-[#FAFAFC] w-full max-w-3xl shadow-2xl border border-[#E8E9F0] rounded-3xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E9F0] bg-white">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#171D50] font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>Digital Reader Preview · {previewSampleBook.title}</span>
          </div>
          <button
            onClick={() => setPreviewSampleBook(null)}
            className="p-1.5 text-[#686B78] hover:text-[#171923] hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reader Canvas with subtle watermark */}
        <div className="relative overflow-y-auto p-8 sm:p-14 bg-white flex-1 max-w-2xl mx-auto w-full shadow-xs my-4 rounded-2xl border border-[#E8E9F0]">
          <img
            src={logoIconColor}
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 opacity-[0.04]"
          />
          
          {/* Header in Reader */}
          <div className="relative text-center pb-8 border-b border-[#E8E9F0] mb-8">
            <img
              src={logoIconColor}
              alt=""
              aria-hidden="true"
              className="w-6 h-6 mx-auto mb-2.5 opacity-80"
            />
            <div className="text-xs uppercase tracking-[0.2em] text-[#686B78] mb-2">
              Al Jabin Publications · Official Excerpt
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#171923] mb-2 font-normal">
              {currentChapter.title}
            </h2>
            <div className="text-xs text-[#686B78]">
              From <span className="font-medium text-[#171923]">{previewSampleBook.title}</span> by {previewSampleBook.author}
            </div>
          </div>

          {/* Body Prose */}
          <div className="font-serif text-[#171923] text-base sm:text-lg leading-relaxed space-y-6">
            <p className="first-letter:text-5xl first-letter:font-editorial first-letter:float-left first-letter:mr-3 first-letter:text-[#171D50] first-letter:leading-none">
              {currentChapter.excerpt}
            </p>
          </div>

          {/* Chapter Selector if multiple chapters */}
          {chapters.length > 1 && (
            <div className="mt-10 pt-6 border-t border-[#E8E9F0] flex items-center justify-between text-xs text-[#686B78]">
              <button
                disabled={activeChapterIndex === 0}
                onClick={() => setActiveChapterIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1 hover:text-[#171923] px-3 py-1.5 rounded-full border border-[#E8E9F0] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Excerpt</span>
              </button>
              <span>
                Part {activeChapterIndex + 1} of {chapters.length}
              </span>
              <button
                disabled={activeChapterIndex === chapters.length - 1}
                onClick={() => setActiveChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1))}
                className="flex items-center gap-1 hover:text-[#171923] px-3 py-1.5 rounded-full border border-[#E8E9F0] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next Excerpt</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Reader Bottom Bar with circular buttons */}
        <div className="p-4 px-6 bg-[#FAFAFC] border-t border-[#E8E9F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#686B78] text-center sm:text-left">
            {isFree ? (
              <>
                <span className="font-semibold text-emerald-700">Free Edition</span>
                <span> · Instant PDF Access with zero payment steps</span>
              </>
            ) : (
              <>
                <span>Enjoying this chapter? Own the complete edition for </span>
                <span className="font-semibold text-[#171D50]">৳{previewSampleBook.price} BDT</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewSampleBook(null)}
              className="px-5 py-2 text-xs text-[#686B78] hover:text-[#171923] rounded-full border border-[#E8E9F0] transition-colors cursor-pointer"
            >
              Close Reader
            </button>
            {isFree ? (
              <button
                onClick={() => {
                  const book = previewSampleBook;
                  setPreviewSampleBook(null);
                  quickAcquireFreeBook(book);
                }}
                className="px-6 py-2.5 bg-emerald-700 text-white text-xs font-semibold tracking-wide hover:bg-emerald-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs rounded-full"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Get Free PDF Now</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  addToCart(previewSampleBook, 1);
                  setPreviewSampleBook(null);
                }}
                className="px-6 py-2.5 bg-[#171D50] text-white text-xs font-semibold tracking-wide hover:bg-[#0f1338] transition-colors flex items-center gap-2 cursor-pointer shadow-xs rounded-full"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add Full Ebook to Bag</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
