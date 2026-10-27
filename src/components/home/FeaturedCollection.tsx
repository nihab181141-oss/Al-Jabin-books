import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

export const FeaturedCollection: React.FC = () => {
  const { books, setSelectedBook, addToCart } = useStore();
  const collectionBooks = books.filter((b) => b.category === 'Mindset' || b.isFeatured).slice(0, 3);

  const scrollToBookstore = () => {
    const el = document.getElementById('bookstore');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="featured-collection" className="w-full bg-[#171D50] text-white py-24 border-y border-white/10 selection:bg-white selection:text-[#171D50]">
      {/* Centered Container — 1120-1200px max width */}
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Introduction */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs uppercase tracking-[0.25em] text-white/60 font-semibold mb-3">
            Curated Collection · Autumn Selection
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl text-white font-normal tracking-tight mb-4">
            The High-Agency & Clarity Series
          </h2>
          <p className="text-sm text-white/70 font-light leading-relaxed">
            Essential readings curated for decision-makers, writers, and independent builders who value deep thinking over superficial trends.
          </p>
        </div>

        {/* Collection Spotlight Grid with rounded cards */}
        {collectionBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
            {collectionBooks.map((book) => (
              <div
                key={book.id}
                className="group bg-white/5 border border-white/10 hover:border-white/30 transition-all p-6 flex flex-col justify-between rounded-3xl backdrop-blur-xs"
              >
                <div>
                  {/* Book Cover Visual with 3D shadow */}
                  <div
                    onClick={() => setSelectedBook(book)}
                    className="cursor-pointer mb-6 flex justify-center"
                  >
                    <div className="w-36 sm:w-40 aspect-[3/4.4] relative shadow-2xl overflow-hidden bg-black/40 border-r-2 border-black/30 rounded-lg group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-[11px] uppercase tracking-wider text-white/50 mb-1">
                    {book.category} · {book.pages} Pages
                  </div>

                  <h3
                    onClick={() => setSelectedBook(book)}
                    className="font-editorial text-xl text-white group-hover:text-white/90 transition-colors cursor-pointer mb-2 line-clamp-1"
                  >
                    {book.title}
                  </h3>

                  <p className="text-xs text-white/60 font-light mb-4">
                    By {book.author}
                  </p>

                  <p className="text-xs text-white/70 leading-relaxed line-clamp-2 mb-4 font-light">
                    {book.description}
                  </p>
                </div>

                {/* Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-base font-semibold text-white">৳{book.price}</span>
                    {book.originalPrice && (
                      <span className="ml-2 text-xs text-white/40 line-through">
                        ৳{book.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBook(book)}
                      className="px-3 py-1 text-xs text-white/80 hover:text-white border border-white/20 hover:border-white/60 rounded-full transition-colors cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => addToCart(book, 1)}
                      className="px-4 py-1.5 bg-white text-[#171D50] text-xs font-semibold hover:bg-white/90 rounded-full transition-colors cursor-pointer shadow-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-12 px-6 bg-white/5 border border-white/10 rounded-3xl mb-14 backdrop-blur-xs">
            <p className="text-sm text-white/90 font-light leading-relaxed mb-3">
              The inaugural High-Agency & Clarity Series volumes are presently undergoing editorial preparation.
            </p>
            <p className="text-xs text-white/50 font-light">
              Official publications will be catalogued here as soon as released.
            </p>
          </div>
        )}

        {/* Collection Footer CTA */}
        <div className="text-center">
          <button
            onClick={scrollToBookstore}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-[#171D50] text-xs font-semibold tracking-widest uppercase hover:bg-white/90 transition-all cursor-pointer shadow-lg rounded-full"
          >
            <span>Explore All Publications</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
