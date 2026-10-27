import React, { useState, useMemo } from 'react';
import { BookCategory } from '../../types';
import { useStore } from '../../context/StoreContext';
import { BookCard } from './BookCard';
import { Search, BookMarked } from 'lucide-react';

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
    <section id="bookstore" className="w-full bg-[#FFFFFF] py-20 border-b border-[#E8E9F0] relative">
      <div id="featured-collection" className="absolute -top-20" />
      {/* Centered Content Container */}
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-[0.25em] text-[#686B78] font-semibold mb-3">
            The Digital Publishing Shelf
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#171923] font-normal tracking-tight mb-4">
            Editorial Catalogue
          </h2>
          <p className="text-sm text-[#686B78] font-light leading-relaxed">
            Every edition is published in DRM-free universal formats. Instant download access, permanent ownership, and elegant reading across all screens.
          </p>
        </div>

        {/* Filter Bar & Search Controls */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E9F0]">
          
          {/* Functional Category Filter (Circular pill buttons) */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs tracking-wide transition-all cursor-pointer font-medium rounded-full ${
                    active
                      ? 'bg-[#171D50] text-white shadow-xs'
                      : 'bg-[#FAFAFC] text-[#686B78] hover:text-[#171923] hover:bg-gray-100 border border-[#E8E9F0]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input with circular pill corners */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-[#686B78] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search titles, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-xs text-[#171923] bg-white border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none transition-colors rounded-full shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#686B78] hover:text-[#171923]"
                >
                  ×
                </button>
              )}
            </div>

            {/* Sort Select with circular corners */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 text-xs text-[#171923] bg-white border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none cursor-pointer rounded-full shadow-2xs"
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
          <div>
            Showing <span className="font-semibold text-[#171923]">{filteredBooks.length}</span> active {filteredBooks.length === 1 ? 'title' : 'titles'}
            {selectedCategory !== 'All Books' && ` in ${selectedCategory}`}
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
          <div className="text-center py-16 px-6 bg-[#FAF7F0] border border-[#EBE6DF] rounded-3xl max-w-xl mx-auto shadow-2xs">
            <BookMarked className="w-10 h-10 text-[#171D50]/60 mx-auto mb-3" />
            <h3 className="font-editorial text-2xl text-[#171923] mb-2 font-normal">
              Catalogue Curation in Progress
            </h3>
            <p className="text-xs sm:text-sm text-[#686B78] font-light leading-relaxed mb-6">
              Our inaugural editorial publications are currently undergoing curation and typography typesetting. In the meantime, experience our digital typesetting standards in the Reading Studio.
            </p>
            {onOpenReadingStudio && (
              <button
                onClick={onOpenReadingStudio}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer shadow-sm"
              >
                <span>Preview Reading Specimen Studio →</span>
              </button>
            )}
          </div>
        ) : (
          /* Filter Mismatch State */
          <div className="text-center py-20 bg-[#FAFAFC] border border-[#E8E9F0] rounded-3xl">
            <BookMarked className="w-10 h-10 text-[#686B78]/40 mx-auto mb-3" />
            <h3 className="font-editorial text-xl text-[#171923] mb-1">
              No matching publications found
            </h3>
            <p className="text-xs text-[#686B78] max-w-sm mx-auto mb-4 font-light">
              We couldn't find any books matching your current filters. Try resetting the category or search keyword.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Books');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-[#171D50] text-white text-xs font-medium tracking-wide hover:bg-[#0f1338] transition-colors rounded-full cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
