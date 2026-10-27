import React from 'react';
import { Book } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Eye, BookOpen } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart, setSelectedBook, setPreviewSampleBook } = useStore();

  return (
    <article className="group bg-white flex flex-col justify-between border border-[#E8E9F0] hover:border-[#171D50]/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
      
      {/* Top Media Container */}
      <div className="relative p-6 pb-2 bg-[#FAFAFC] flex items-center justify-center overflow-hidden rounded-t-2xl">
        {/* Editorial flags */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {book.isNewRelease && (
            <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#171D50] bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#E8E9F0] shadow-2xs">
              New Release
            </span>
          )}
          {book.discountPercentage && (
            <span className="text-[10px] uppercase tracking-[0.16em] font-medium text-emerald-800 bg-emerald-50/95 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
              {book.discountPercentage}% Off
            </span>
          )}
        </div>

        {/* Book Cover Mockup with rounded spine */}
        <div
          onClick={() => setSelectedBook(book)}
          className="cursor-pointer py-4 transition-transform duration-300 group-hover:-translate-y-1"
        >
          <div className="w-40 sm:w-44 aspect-[3/4.4] relative shadow-md group-hover:shadow-xl transition-shadow bg-[#171D50] border-r-2 border-black/20 rounded-lg overflow-hidden">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Book spine lighting overlay */}
            <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Book Metadata & Title */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[#686B78] uppercase tracking-wider">
            <span>{book.category}</span>
            <span aria-hidden="true" className="text-gray-300">·</span>
            <span>{book.pages} pp</span>
            <span aria-hidden="true" className="text-gray-300">·</span>
            <span>{book.format.split(' ')[0]}</span>
          </div>

          <h3
            onClick={() => setSelectedBook(book)}
            className="font-editorial text-lg text-[#171923] group-hover:text-[#171D50] transition-colors leading-snug cursor-pointer font-medium line-clamp-1"
            title={book.title}
          >
            {book.title}
          </h3>

          <p className="text-xs text-[#686B78] font-light">
            {book.author}
          </p>
        </div>

        {/* Pricing & Circular Buttons */}
        <div className="pt-3 border-t border-[#F0F1F5] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-[#171D50]">
              ৳{book.price}
            </span>
            {book.originalPrice && (
              <span className="text-xs text-[#686B78] line-through font-light">
                ৳{book.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPreviewSampleBook(book)}
              title="Read sample excerpt"
              className="p-2 text-[#686B78] hover:text-[#171D50] hover:bg-gray-100 rounded-full border border-transparent hover:border-[#E8E9F0] transition-all cursor-pointer"
              aria-label={`Read sample for ${book.title}`}
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedBook(book)}
              title="Inspect details"
              className="p-2 text-[#686B78] hover:text-[#171D50] hover:bg-gray-100 rounded-full border border-transparent hover:border-[#E8E9F0] transition-all cursor-pointer"
              aria-label={`View details for ${book.title}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => addToCart(book, 1)}
              className="px-3.5 py-1.5 bg-[#171D50] text-white text-xs font-medium tracking-wide hover:bg-[#0f1338] rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
              aria-label={`Add ${book.title} to bag`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

      </div>
    </article>
  );
};
