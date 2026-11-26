import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Sun,
  Moon,
  Coffee,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { OpenCodexSpecimen } from '../ui/BookcraftIllustrations';
import { Book } from '../../types';

interface ReadingStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RealSampleEntry {
  book: Book;
  chapterTitle: string;
  excerpt: string;
}

export const ReadingStudioModal: React.FC<ReadingStudioModalProps> = ({ isOpen, onClose }) => {
  const { books, addToCart } = useStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState<number>(17);
  const [theme, setTheme] = useState<'parchment' | 'white' | 'midnight'>('parchment');
  const [sandboxText, setSandboxText] = useState(
    'Type or paste any passage here to preview serif, sans, or monospace typography across parchment, white, and midnight reading themes.'
  );

  const realSamples = useMemo<RealSampleEntry[]>(() => {
    const entries: RealSampleEntry[] = [];
    for (const book of books) {
      if (book.sampleChapters && book.sampleChapters.length > 0) {
        entries.push({
          book,
          chapterTitle: book.sampleChapters[0].title,
          excerpt: book.sampleChapters[0].excerpt,
        });
      } else if (book.description) {
        entries.push({
          book,
          chapterTitle: 'Edition Synopsis',
          excerpt: book.description,
        });
      }
    }
    return entries;
  }, [books]);

  if (!isOpen) return null;

  const safeIndex = Math.min(activeIndex, Math.max(0, realSamples.length - 1));
  const currentSample = realSamples[safeIndex] || null;

  const themeStyles = {
    parchment: {
      bg: 'bg-[#FBF9F5]',
      border: 'border-[#EBE6DF]',
      card: 'bg-[#F4F0E8]',
      text: 'text-[#1C1917]',
      muted: 'text-[#78716C]',
      accent: 'text-[#171D50]',
      toolbar: 'bg-[#F3EFE7] border-[#E8E2D8]',
      dropCap: 'text-[#171D50]',
    },
    white: {
      bg: 'bg-[#FFFFFF]',
      border: 'border-[#E8E9F0]',
      card: 'bg-[#FAFAFC]',
      text: 'text-[#171923]',
      muted: 'text-[#686B78]',
      accent: 'text-[#171D50]',
      toolbar: 'bg-[#FAFAFC] border-[#E8E9F0]',
      dropCap: 'text-[#171D50]',
    },
    midnight: {
      bg: 'bg-[#0E132B]',
      border: 'border-[#222B52]',
      card: 'bg-[#151C3E]',
      text: 'text-[#F1F5F9]',
      muted: 'text-[#94A3B8]',
      accent: 'text-[#CBD5E1]',
      toolbar: 'bg-[#171F44] border-[#252F5A]',
      dropCap: 'text-amber-200',
    },
  }[theme];

  const fontClass = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono tracking-tight',
  }[fontFamily];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div
        className={`relative w-full max-w-5xl shadow-2xl rounded-3xl overflow-hidden border ${themeStyles.border} ${themeStyles.bg} flex flex-col max-h-[94vh] transition-colors duration-300`}
      >
        {/* Top Control Bar: Typography & Reading Experience Customization */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b ${themeStyles.border} ${themeStyles.toolbar} transition-colors`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#171D50] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#686B78] font-semibold">
                Al Jabin Reading Studio
              </div>
              <h3 className={`font-editorial text-sm font-medium ${themeStyles.text}`}>
                Live Typography & Reader Environment
              </h3>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex items-center p-1 bg-white/70 rounded-full border border-black/10">
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-3 py-1 font-serif rounded-full transition-all cursor-pointer ${
                  fontFamily === 'serif' ? 'bg-[#171D50] text-white shadow-xs' : 'text-[#686B78] hover:text-[#171923]'
                }`}
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-3 py-1 font-sans rounded-full transition-all cursor-pointer ${
                  fontFamily === 'sans' ? 'bg-[#171D50] text-white shadow-xs' : 'text-[#686B78] hover:text-[#171923]'
                }`}
              >
                Sans
              </button>
              <button
                onClick={() => setFontFamily('mono')}
                className={`px-3 py-1 font-mono text-[11px] rounded-full transition-all cursor-pointer ${
                  fontFamily === 'mono' ? 'bg-[#171D50] text-white shadow-xs' : 'text-[#686B78] hover:text-[#171923]'
                }`}
              >
                Mono
              </button>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-white/70 rounded-full border border-black/10">
              <button
                onClick={() => setFontSize((prev) => Math.max(14, prev - 1))}
                className="w-6 h-6 flex items-center justify-center text-[#686B78] hover:text-[#171923] rounded-full cursor-pointer"
                title="Decrease font size"
              >
                A-
              </button>
              <span className="text-[11px] font-mono tabular-nums px-1 text-[#686B78] min-w-5 text-center">
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize((prev) => Math.min(22, prev + 1))}
                className="w-6 h-6 flex items-center justify-center text-[#686B78] hover:text-[#171923] rounded-full cursor-pointer"
                title="Increase font size"
              >
                A+
              </button>
            </div>

            <div className="flex items-center p-1 bg-white/70 rounded-full border border-black/10">
              <button
                onClick={() => setTheme('parchment')}
                className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  theme === 'parchment' ? 'bg-[#EFE9DC] text-[#171D50] font-medium shadow-xs' : 'text-[#686B78]'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Parchment</span>
              </button>

              <button
                onClick={() => setTheme('white')}
                className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  theme === 'white' ? 'bg-white text-[#171D50] font-medium shadow-xs' : 'text-[#686B78]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">White</span>
              </button>

              <button
                onClick={() => setTheme('midnight')}
                className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  theme === 'midnight' ? 'bg-[#1F274E] text-white font-medium shadow-xs' : 'text-[#686B78]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Midnight</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#686B78] hover:text-[#171923] transition-colors ml-1 cursor-pointer"
              aria-label="Close Reading Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 md:p-12">
          <div className="mx-auto max-w-[680px]">
            {currentSample ? (
              <>
                <div className="flex items-center justify-between text-xs tracking-widest uppercase mb-8 pb-4 border-b border-black/10">
                  <span className={`font-semibold ${themeStyles.accent}`}>
                    {currentSample.book.category}
                  </span>
                  <div className={`font-mono text-[11px] ${themeStyles.muted}`}>
                    Edition {safeIndex + 1} of {realSamples.length}
                  </div>
                </div>

                <div className="space-y-3 mb-10 text-left">
                  <h1
                    className={`font-editorial text-2xl sm:text-3xl md:text-4xl font-normal leading-tight tracking-tight ${themeStyles.text}`}
                  >
                    {currentSample.book.title}
                  </h1>
                  <p className={`text-sm font-medium ${themeStyles.muted}`}>
                    {currentSample.chapterTitle}
                  </p>
                  <div className={`text-xs ${themeStyles.muted} pt-1`}>
                    By <span className={`font-medium ${themeStyles.text}`}>{currentSample.book.author}</span>
                  </div>
                </div>

                <div className="my-8 flex justify-center opacity-40">
                  <div className="w-32 h-16">
                    <OpenCodexSpecimen strokeColor={theme === 'midnight' ? '#94A3B8' : '#171D50'} />
                  </div>
                </div>

                <article
                  className={`space-y-6 text-left transition-all duration-200 leading-[1.8] ${fontClass}`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <p className={`font-normal ${themeStyles.text}`}>
                    {currentSample.excerpt}
                  </p>
                </article>

                <div className="mt-14 pt-6 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className={`text-xs italic ${themeStyles.muted}`}>
                    Al Jabin Publications · {currentSample.book.format}
                  </div>

                  <button
                    onClick={() => {
                      addToCart(currentSample.book, 1);
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-all shadow-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add Full Edition (৳{currentSample.book.price})</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-8 text-left">
                <div className="flex justify-center">
                  <div className="w-44 h-44 bg-[#EAE6FF] rounded-3xl p-3 flex items-center justify-center shadow-2xs">
                    <img
                      src="/assets/aistudio/Ebook-rafiki_016c9ebe.svg"
                      alt="Ebook reading studio illustration"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h2 className={`font-editorial text-2xl sm:text-3xl font-normal ${themeStyles.text}`}>
                    No Published Volumes Yet
                  </h2>
                  <p className={`text-xs sm:text-sm ${themeStyles.muted} max-w-md mx-auto`}>
                    When books are published to the catalogue, their sample chapters will open here. You can test the reader typography settings below using your own text.
                  </p>
                </div>

                <textarea
                  value={sandboxText}
                  onChange={(e) => setSandboxText(e.target.value)}
                  rows={5}
                  aria-label="Reader typography preview text"
                  className={`w-full p-5 rounded-2xl border ${themeStyles.border} ${themeStyles.card} ${themeStyles.text} ${fontClass} leading-[1.8] focus:outline-none focus:ring-2 focus:ring-[#171D50]/20 resize-none`}
                  style={{ fontSize: `${fontSize}px` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Paging Strip (only when real books exist) */}
        {realSamples.length > 1 && (
          <div
            className={`flex items-center justify-between px-6 py-4 border-t ${themeStyles.border} ${themeStyles.card} transition-colors`}
          >
            <button
              onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
              disabled={safeIndex === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
                safeIndex === 0
                  ? 'opacity-40 cursor-not-allowed text-[#686B78]'
                  : `${themeStyles.text} hover:bg-black/5`
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Book</span>
            </button>

            <div className="flex items-center gap-2">
              {realSamples.map((entry, idx) => (
                <button
                  key={entry.book.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`transition-all rounded-full cursor-pointer ${
                    safeIndex === idx
                      ? 'w-6 h-2 bg-[#171D50]'
                      : 'w-2 h-2 bg-black/20 hover:bg-black/40'
                  }`}
                  title={entry.book.title}
                  aria-label={`Jump to ${entry.book.title}`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveIndex((prev) => Math.min(realSamples.length - 1, prev + 1))}
              disabled={safeIndex === realSamples.length - 1}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
                safeIndex === realSamples.length - 1
                  ? 'opacity-40 cursor-not-allowed text-[#686B78]'
                  : `${themeStyles.text} hover:bg-black/5`
              }`}
            >
              <span>Next Book</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
