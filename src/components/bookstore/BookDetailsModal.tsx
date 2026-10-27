import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, ShoppingBag, BookOpen, Check, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { Book } from '../../types';

export const BookDetailsModal: React.FC = () => {
  const { selectedBook, setSelectedBook, addToCart, setPreviewSampleBook, books } = useStore();

  if (!selectedBook) return null;

  const relatedBooks = books
    .filter((b) => b.category === selectedBook.category && b.id !== selectedBook.id)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-4xl shadow-2xl border border-[#E8E9F0] rounded-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E9F0] bg-[#FAFAFC]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#686B78] font-medium">
            <span>Catalogue ID: {selectedBook.isbn}</span>
            <span aria-hidden="true">·</span>
            <span>{selectedBook.category}</span>
          </div>
          <button
            onClick={() => setSelectedBook(null)}
            className="p-1.5 text-[#686B78] hover:text-[#171923] hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Book Cover Showcase */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-48 sm:w-56 aspect-[3/4.4] relative shadow-2xl overflow-hidden bg-[#171D50] border-r-4 border-black/20 rounded-xl">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
              </div>

              {/* Sample excerpt button with circular pill styling */}
              <button
                onClick={() => setPreviewSampleBook(selectedBook)}
                className="mt-5 w-full max-w-[224px] py-2.5 px-4 text-xs font-semibold text-[#171D50] border border-[#171D50] hover:bg-[#171D50] hover:text-white rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Free Sample</span>
              </button>

              <div className="mt-4 text-[11px] text-[#686B78] text-center space-y-1">
                <div>Format: <span className="font-medium text-[#171923]">{selectedBook.format}</span></div>
                <div>Size: <span className="font-medium text-[#171923]">{selectedBook.fileSize}</span> · {selectedBook.pages} Pages</div>
                <div>Language: <span className="font-medium text-[#171923]">{selectedBook.language}</span></div>
              </div>
            </div>

            {/* Book Info & Purchase Column */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h2 className="font-editorial text-2xl sm:text-3xl text-[#171923] font-normal leading-snug">
                  {selectedBook.title}
                </h2>
                {selectedBook.subtitle && (
                  <p className="text-sm text-[#686B78] mt-1 italic font-editorial">
                    {selectedBook.subtitle}
                  </p>
                )}
                <div className="mt-2 text-xs text-[#686B78]">
                  Authored by <span className="font-semibold text-[#171923]">{selectedBook.author}</span> · Published by Al Jabin Publications
                </div>
              </div>

              {/* Price Block with rounded corners */}
              <div className="p-4 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl flex items-center justify-between shadow-2xs">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#686B78]">Digital Edition Price</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#171D50]">৳{selectedBook.price}</span>
                    {selectedBook.originalPrice && (
                      <span className="text-sm text-[#686B78] line-through">৳{selectedBook.originalPrice}</span>
                    )}
                    {selectedBook.discountPercentage && (
                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Save {selectedBook.discountPercentage}%
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedBook, 1);
                  }}
                  className="px-6 py-3 bg-[#171D50] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#0f1338] rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#171923]">
                  About This Volume
                </h4>
                <p className="text-sm text-[#686B78] leading-relaxed font-light">
                  {selectedBook.description}
                </p>
              </div>

              {/* Key Takeaways */}
              {selectedBook.keyTakeaways && selectedBook.keyTakeaways.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#171923]">
                    What You Will Master
                  </h4>
                  <ul className="space-y-2 text-xs text-[#171923]">
                    {selectedBook.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-[#171D50] shrink-0 mt-0.5" />
                        <span className="leading-normal text-[#686B78]">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Immediate Digital Delivery Note */}
              <div className="p-3.5 bg-gray-50 border border-[#E8E9F0] rounded-xl flex items-center gap-3 text-xs text-[#686B78]">
                <Download className="w-4 h-4 text-[#171D50] shrink-0" />
                <span>Instant download link & DRM-free files issued immediately upon checkout confirmation.</span>
              </div>
            </div>
          </div>

          {/* Related Publications with rounded cards */}
          {relatedBooks.length > 0 && (
            <div className="pt-6 border-t border-[#E8E9F0]">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-[#171923] mb-4">
                More in {selectedBook.category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedBooks.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => setSelectedBook(rel)}
                    className="p-3 bg-[#FAFAFC] border border-[#E8E9F0] hover:border-[#171D50] rounded-2xl transition-colors cursor-pointer flex gap-3 items-center shadow-2xs"
                  >
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-10 h-14 object-cover bg-[#171D50] rounded-md shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <div className="font-editorial text-xs font-medium text-[#171923] truncate">
                        {rel.title}
                      </div>
                      <div className="text-[11px] text-[#686B78] truncate">{rel.author}</div>
                      <div className="text-xs font-semibold text-[#171D50] mt-0.5">৳{rel.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guarantee and Instant Delivery Note */}
          <div className="p-4 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl flex items-center justify-between text-xs text-[#686B78]">
            <div className="flex items-center gap-2 text-[#171D50] font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Publication · 100% Guaranteed Digital Delivery</span>
            </div>
            <span className="text-[11px] text-[#686B78]">Al Jabin Publications</span>
          </div>

        </div>

      </div>
    </div>
  );
};
