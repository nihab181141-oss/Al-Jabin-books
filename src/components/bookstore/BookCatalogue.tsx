import React, { useState, useMemo } from 'react';
import { BookCategory } from '../../types';
import { useStore } from '../../context/StoreContext';
import { BookCard } from './BookCard';
import { Search, BookMarked, ArrowRight } from 'lucide-react';

const CATEGORIES: BookCategory[] = [
  'All Books',
  'Personal Growth',
  'Mindset',
  'Productivity',
  'Fiction',
];

interface BookCatalogueProps {
  onOpenReadingStudio?: () => void;
}

export const BookCatalogue: React.FC<BookCatalogueProps> = ({ onOpenReadingStudio }) => {
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
    <section id="bookstore" className="w-full bg-white py-20 md:py-24 rounded-t-[36px] border-t border-black/[0.04] relative">
      <div id="featured-collection" className="absolute -top-20" />
      {/* Centered Content Container */}
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2 max-w-xl">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#686B78] font-semibold">
              The Digital Publishing Shelf
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#171923]">
              Editorial Catalogue
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#686B78] font-normal max-w-md leading-relaxed">
            Every edition is published in DRM-free universal formats for instant download and permanent ownership.
          </p>
        </div>

        {/* Filter Segmented Bar & Search Controls */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Segmented Category Pill Track (Apple/Dribbble style) */}
          <div className="inline-flex flex-wrap items-center gap-1 p-1.5 bg-[#F5F4EF] rounded-full">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold tracking-tight transition-all cursor-pointer rounded-full ${
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
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-[#686B78] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search titles, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-xs text-[#171923] bg-[#F5F4EF] border border-transparent focus:bg-white focus:border-[#171D50]/30 focus:outline-none transition-all rounded-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#686B78] hover:text-[#171923] cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 text-xs font-medium text-[#171923] bg-[#F5F4EF] border border-transparent focus:border-[#171D50]/30 focus:outline-none cursor-pointer rounded-full"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Editions</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between text-xs text-[#686B78] mb-6">
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
          /* Clean Tactile Curation Card (Zero Fake Books) */
          <div className="bg-[#F5F4EF] rounded-[30px] p-10 sm:p-14 text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-2xs flex items-center justify-center mx-auto mb-5 text-[#171D50]">
              <BookMarked className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold tracking-[-0.02em] text-[#171923] mb-2">
              Catalogue Curation in Progress
            </h3>
            <p className="text-xs sm:text-sm text-[#575A66] font-normal leading-relaxed max-w-md mx-auto mb-7">
              Our inaugural publications are undergoing final editorial typesetting. Experience our digital reading architecture live in the Reading Studio while titles prepare for release.
            </p>
            {onOpenReadingStudio && (
              <button
                onClick={onOpenReadingStudio}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-all cursor-pointer shadow-sm"
              >
                <span>Open Reading Specimen Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          /* Filter Mismatch State */
          <div className="text-center py-16 px-6 bg-[#F5F4EF] rounded-[30px] max-w-xl mx-auto">
            <BookMarked className="w-10 h-10 text-[#686B78]/40 mx-auto mb-3" />
            <h3 className="text-xl font-bold tracking-tight text-[#171923] mb-1">
              No matching publications found
            </h3>
            <p className="text-xs text-[#686B78] max-w-sm mx-auto mb-5">
              We couldn't find any books matching your current filters. Try resetting the category or search keyword.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Books');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-[#171D50] text-white text-xs font-semibold hover:bg-[#0f1338] transition-colors rounded-full cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
