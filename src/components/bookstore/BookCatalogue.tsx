import React, { useState, useMemo } from 'react';
import { BookCategory } from '../../types';
import { useStore } from '../../context/StoreContext';
import { BookCard } from './BookCard';
import { Search, ArrowRight, PenTool } from 'lucide-react';

const CATEGORIES: BookCategory[] = [
  'All Books',
  'Personal Growth',
  'Mindset',
  'Productivity',
  'Fiction',
];

interface BookCatalogueProps {
  onOpenReadingStudio?: () => void;
  onOpenPublish?: () => void;
}

export const BookCatalogue: React.FC<BookCatalogueProps> = ({
  onOpenReadingStudio,
  onOpenPublish,
}) => {
  const { books } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<BookCategory>('All Books');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');

  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        const matchesCategory =
          selectedCategory === 'All Books' || b.category === selectedCategory;
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.publishedYear || 0) - (a.publishedYear || 0);
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [books, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="bookstore" className="w-full bg-white py-16 sm:py-20 lg:py-24 border-t border-black/[0.06] relative">
      <div id="featured-collection" className="absolute -top-20" />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="space-y-2 max-w-xl">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-bold">
              The Digital Publishing Shelf
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.035em] leading-[1.06] text-[#171923]">
              Editorial{' '}
              <span className="font-editorial italic font-bold text-[#171D50]">Catalogue</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#575A66] font-normal max-w-md leading-relaxed">
            Every edition is published in DRM-free universal formats for instant download and permanent ownership.
          </p>
        </div>

        {/* Filter Segmented Bar & Search Controls */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Horizontal Scrollable Category Track on Mobile, Inline on Desktop */}
          <div className="flex items-center gap-1 p-1 bg-[#F5F4EF] rounded-full overflow-x-auto max-w-full">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 min-h-[38px] text-xs font-semibold tracking-tight transition-all cursor-pointer rounded-full whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#171D50] text-white shadow-xs'
                      : 'text-[#686B78] hover:text-[#171923]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-[#686B78] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search titles, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[42px] pl-10 pr-8 py-2 text-xs text-[#171923] bg-[#F5F4EF] border border-transparent focus:bg-white focus:border-[#171D50]/30 focus:outline-none transition-all rounded-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#686B78] hover:text-[#171923] cursor-pointer"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort books"
              className="min-h-[42px] px-4 py-2 text-xs font-medium text-[#171923] bg-[#F5F4EF] border border-transparent focus:border-[#171D50]/30 focus:outline-none cursor-pointer rounded-full"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Editions</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#686B78] mb-6 pb-4 border-b border-black/[0.06]">
          <div className="tabular-nums">
            Showing <span className="font-semibold text-[#171923]">{filteredBooks.length}</span> active {filteredBooks.length === 1 ? 'title' : 'titles'}
            {selectedCategory !== 'All Books' && ` · ${selectedCategory}`}
          </div>
          {searchQuery && (
            <div>
              Filter: <span className="italic">"{searchQuery}"</span>
            </div>
          )}
        </div>

        {/* Product Grid (When live publications exist) */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : books.length === 0 ? (
          /* Open Side-by-Side Curation Spread (Illustration sits freely without nested box) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center py-6 sm:py-10">
            <div className="md:col-span-6 flex justify-center">
              <img
                src="/assets/aistudio/Bookshop-cuate_9a8c56b6.svg"
                alt="Curated digital bookshop shelves illustration"
                className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] h-auto object-contain select-none"
              />
            </div>
            <div className="md:col-span-6 text-center md:text-left space-y-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-bold">
                Curated Release Queue
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.035em] leading-[1.1] text-[#171923]">
                Catalogue Curation{' '}
                <span className="font-editorial italic font-bold text-[#171D50]">in Progress</span>
              </h3>
              <p className="text-sm sm:text-base text-[#575A66] font-normal leading-relaxed max-w-lg mx-auto md:mx-0">
                Our inaugural publications are undergoing final editorial typesetting. Experience our digital reading architecture live in the Reading Studio while titles prepare for release.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                {onOpenPublish && (
                  <button
                    onClick={onOpenPublish}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 bg-[#171D50] text-white text-xs sm:text-sm font-semibold rounded-full hover:bg-[#0f1338] transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Publish Your Ebook</span>
                  </button>
                )}
                {onOpenReadingStudio && (
                  <button
                    onClick={onOpenReadingStudio}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 bg-[#F5F4EF] text-[#171923] border border-black/[0.08] text-xs sm:text-sm font-semibold rounded-full hover:bg-[#EAE8E0] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Open Reading Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Filter Mismatch State (Side-by-Side & Unboxed) */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-8 max-w-4xl mx-auto">
            <div className="md:col-span-5 flex justify-center">
              <img
                src="/assets/aistudio/Bookshop-cuate_9a8c56b6.svg"
                alt="Bookshop shelves illustration"
                className="w-full max-w-[280px] h-auto object-contain select-none"
              />
            </div>
            <div className="md:col-span-7 text-center md:text-left space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171923]">
                No matching publications found
              </h3>
              <p className="text-xs sm:text-sm text-[#686B78] max-w-md mx-auto md:mx-0 leading-relaxed">
                We couldn't find any books matching your current filters. Try resetting the category or search keyword.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All Books');
                  setSearchQuery('');
                }}
                className="min-h-[42px] px-6 py-2.5 bg-[#171D50] text-white text-xs font-semibold hover:bg-[#0f1338] transition-colors rounded-full cursor-pointer whitespace-nowrap"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
