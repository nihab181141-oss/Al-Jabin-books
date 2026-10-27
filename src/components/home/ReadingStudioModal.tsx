import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Type,
  Sun,
  Moon,
  Coffee,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  Bookmark
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { OpenCodexSpecimen } from '../ui/BookcraftIllustrations';

interface ReadingStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SpecimenChapter {
  id: string;
  volumeNumber: string;
  title: string;
  subtitle: string;
  author: string;
  readTime: string;
  pages: number;
  body: string[];
}

const SPECIMEN_CHAPTERS: SpecimenChapter[] = [
  {
    id: 'ch-1',
    volumeNumber: 'Specimen Vol. 01 · Epistemology',
    title: 'On the Architecture of Solitude & Clear Thought',
    subtitle: 'Structuring cognitive signal in an age of ambient digital cacophony',
    author: 'Al Jabin Publications Editorial Board',
    readTime: '6 min read',
    pages: 14,
    body: [
      'Clarity begins where passive consensus concludes. In an era dominated by instantaneous digital reaction, modern minds are systematically trained to prioritize velocity over density. The result is a perpetual low-grade cognitive restlessness—a state in which one encounters infinite opinions yet produces remarkably few enduring thoughts.',
      'To build an enduring perspective, an intellect must possess its own quiet territory. True reading is not the mere ingestion of textual data; it is an intimate, rigorous architectural dialog between reader and author. When you open a printed volume or its authentic digital codex, you cross an unhurried threshold where time slows to the cadence of the sentence.',
      'The purpose of Al Jabin Publications is to protect and restore this deliberate cadence. We believe that a single well-constructed sentence, arrived at through rigorous editing and patient contemplation, possesses more asymmetric leverage than ten thousand transient social dispatches.',
      'Consider the deliberate discipline of the printer’s workshop: every letter cast in lead, every galley inked by hand, every leaf inspected for balance. Digital publications deserve no less dignity. In removing invasive digital DRM lock-ins, intrusive telemetry, and superficial filler, we hand readers a permanent volume—one designed to be pondered, annotated, and revisited across decades.',
    ],
  },
  {
    id: 'ch-2',
    volumeNumber: 'Specimen Vol. 02 · Systems & Craft',
    title: 'The Quiet Physics of Asymmetric Leverage',
    subtitle: 'Craftsmanship, deliberate focus, and non-linear intellectual output',
    author: 'Farhan Mahmud · Senior Editorial Fellow',
    readTime: '8 min read',
    pages: 18,
    body: [
      'The world rewards those who build quiet leverage while the crowd exhausts its energy in superficial motion. Most human toil is linear: one hour of effort yields one unit of output. But deep intellectual systems and enduring literature operate on exponential principles.',
      'When an author distills twenty years of hard-won discernment into two hundred disciplined pages, time collapses for the reader. In a single evening of undistracted reading, one absorbs the structural insights that cost someone else a lifetime of trial, error, and solitary revision.',
      'To unlock this quiet leverage, one must first learn the art of subtraction. You cannot cultivate deep work while leaving every notification channel ajar. Deep work demands a physical and cognitive sanctum: a desk clear of distractions, a notebook bound for permanent thought, and a commitment to seeing a single complex argument through to its logical completion.',
    ],
  },
  {
    id: 'ch-3',
    volumeNumber: 'Specimen Vol. 03 · Delta Literature',
    title: 'Riverine Solitude: Notes Along the Shifting Waters',
    subtitle: 'Meditations on memory, silt, and delta resilience across generations',
    author: 'Tahsin Rahman · Contributing Essayist',
    readTime: '5 min read',
    pages: 12,
    body: [
      'Along the great river systems of Bengal, impermanence is not an abstract philosophical proposition; it is the physical law of daily existence. The waters give life to the alluvial plains, and with equal grace, claim back the banks during the monsoon swells.',
      'Those raised beside the river carry an inherent respect for fluid resilience. They understand that to resist the current with rigid brute force is folly. Instead, one learns the hydrodynamic geometry of the boatman’s oar—yielding to the deep eddies while using the river’s own momentum to cross safely to the far shore.',
      'Literature born of this delta reflects that quiet poise. It does not shout; it flows with subterranean patience, bearing witness to both the enduring memory of the soil and the swift passage of time.',
    ],
  },
];

export const ReadingStudioModal: React.FC<ReadingStudioModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useStore();

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState<number>(17);
  const [lineHeight, setLineHeight] = useState<'relaxed' | 'loose' | 'normal'>('relaxed');
  const [theme, setTheme] = useState<'parchment' | 'white' | 'midnight'>('parchment');
  const [measureWidth, setMeasureWidth] = useState<'standard' | 'broad'>('standard');

  if (!isOpen) return null;

  const currentChapter = SPECIMEN_CHAPTERS[activeChapterIndex];

  // Theme Color Configurations
  const themeStyles = {
    parchment: {
      bg: 'bg-[#FBF9F5]',
      border: 'border-[#EBE6DF]',
      card: 'bg-[#F4F0E8]',
      text: 'text-[#1C1917]',
      muted: 'text-[#78716C]',
      accent: 'text-[#171D50]',
      toolbar: 'bg-[#F3EFE7] border-[#E8E2D8]',
      highlight: 'border-[#171D50]',
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
      highlight: 'border-[#171D50]',
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
      highlight: 'border-white',
      dropCap: 'text-amber-200',
    },
  }[theme];

  // Font family mappings
  const fontClass = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono tracking-tight',
  }[fontFamily];

  // Line height mappings
  const leadingClass = {
    relaxed: 'leading-[1.8]',
    loose: 'leading-[2.05]',
    normal: 'leading-[1.65]',
  }[lineHeight];

  const handleDownloadSpecimen = () => {
    showToast(`Downloading "${currentChapter.title}" DRM-Free Sample PDF.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div
        className={`relative w-full max-w-5xl shadow-2xl rounded-3xl overflow-hidden border ${themeStyles.border} ${themeStyles.bg} flex flex-col max-h-[94vh] transition-colors duration-300`}
      >
        {/* Top Control Bar: Typography & Reading Experience Customization */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b ${themeStyles.border} ${themeStyles.toolbar} transition-colors`}
        >
          {/* Brand & Chapter Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#171D50] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#686B78] font-semibold">
                Al Jabin Reading Studio · Digital Specimen
              </div>
              <h3 className={`font-editorial text-sm font-medium ${themeStyles.text}`}>
                Live Typography & Reader Environment
              </h3>
            </div>
          </div>

          {/* Interactive Controls Pill Ribbon */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Font Family Switcher */}
            <div className="flex items-center p-1 bg-white/70 dark:bg-black/20 rounded-full border border-black/10">
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

            {/* Font Size Adjuster */}
            <div className="flex items-center gap-1.5 p-1 bg-white/70 dark:bg-black/20 rounded-full border border-black/10">
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

            {/* Theme Atmosphere Switcher */}
            <div className="flex items-center p-1 bg-white/70 dark:bg-black/20 rounded-full border border-black/10">
              <button
                onClick={() => setTheme('parchment')}
                className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  theme === 'parchment' ? 'bg-[#EFE9DC] text-[#171D50] font-medium shadow-xs' : 'text-[#686B78]'
                }`}
                title="Parchment warm reading atmosphere"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Parchment</span>
              </button>

              <button
                onClick={() => setTheme('white')}
                className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  theme === 'white' ? 'bg-white text-[#171D50] font-medium shadow-xs' : 'text-[#686B78]'
                }`}
                title="Crisp white daylight reading mode"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">White</span>
              </button>

              <button
                onClick={() => setTheme('midnight')}
                className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  theme === 'midnight' ? 'bg-[#1F274E] text-white font-medium shadow-xs' : 'text-[#686B78]'
                }`}
                title="Deep midnight study mode"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Midnight</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#686B78] hover:text-[#171923] transition-colors ml-1 cursor-pointer"
              aria-label="Close Reading Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Content Area: Split Navigation & Reading Broadside */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 md:p-12">
          <div
            className={`mx-auto transition-all duration-300 ${
              measureWidth === 'standard' ? 'max-w-[680px]' : 'max-w-[820px]'
            }`}
          >
            {/* Top Curatorial Kicker & Folio Metadata */}
            <div className="flex items-center justify-between text-xs tracking-widest uppercase mb-8 pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${themeStyles.accent}`}>
                  {currentChapter.volumeNumber}
                </span>
                <span aria-hidden="true" className="text-black/30 dark:text-white/30">·</span>
                <span className={themeStyles.muted}>{currentChapter.readTime}</span>
              </div>
              <div className={`font-mono text-[11px] ${themeStyles.muted}`}>
                Folio {activeChapterIndex + 1} of {SPECIMEN_CHAPTERS.length}
              </div>
            </div>

            {/* Chapter Headline */}
            <div className="space-y-3 mb-10 text-left">
              <h1
                className={`font-editorial text-2xl sm:text-3xl md:text-4xl font-normal leading-tight tracking-tight ${themeStyles.text}`}
              >
                {currentChapter.title}
              </h1>
              <p className={`text-sm sm:text-base font-light italic ${themeStyles.muted}`}>
                {currentChapter.subtitle}
              </p>
              <div className={`text-xs ${themeStyles.muted} pt-1`}>
                By <span className={`font-medium ${themeStyles.text}`}>{currentChapter.author}</span>
              </div>
            </div>

            {/* Atmospheric Bookcraft Codex Watermark Accent */}
            <div className="my-8 flex justify-center opacity-40 hover:opacity-70 transition-opacity">
              <div className="w-32 h-16">
                <OpenCodexSpecimen strokeColor={theme === 'midnight' ? '#94A3B8' : '#171D50'} />
              </div>
            </div>

            {/* Main Reading Prose with Dynamic Typography & Drop Cap */}
            <article
              className={`space-y-6 text-left transition-all duration-200 ${fontClass} ${leadingClass}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {currentChapter.body.map((paragraph, index) => {
                if (index === 0) {
                  const firstChar = paragraph.charAt(0);
                  const remainder = paragraph.slice(1);
                  return (
                    <p key={index} className={`font-normal ${themeStyles.text}`}>
                      <span
                        className={`text-5xl sm:text-6xl font-editorial font-bold float-left mr-3 mt-1 leading-none ${themeStyles.dropCap}`}
                      >
                        {firstChar}
                      </span>
                      {remainder}
                    </p>
                  );
                }
                return (
                  <p key={index} className={`font-light ${themeStyles.text}`}>
                    {paragraph}
                  </p>
                );
              })}
            </article>

            {/* Chapter End Signature & Footnote Rule */}
            <div className="mt-14 pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className={`text-xs italic ${themeStyles.muted}`}>
                Typeset by Al Jabin Publications · Dhaka Studio · DRM-Free Universal Specimen
              </div>

              <button
                onClick={handleDownloadSpecimen}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Specimen Leaflet (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Paging Strip */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t ${themeStyles.border} ${themeStyles.card} transition-colors`}
        >
          <button
            onClick={() => setActiveChapterIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeChapterIndex === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeChapterIndex === 0
                ? 'opacity-40 cursor-not-allowed text-[#686B78]'
                : `${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/10`
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Specimen</span>
          </button>

          {/* Chapter Quick Switcher Dots */}
          <div className="flex items-center gap-2">
            {SPECIMEN_CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapterIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  activeChapterIndex === idx
                    ? 'w-6 h-2 bg-[#171D50]'
                    : 'w-2 h-2 bg-black/20 dark:bg-white/30 hover:bg-black/40'
                }`}
                title={ch.title}
                aria-label={`Jump to ${ch.title}`}
              />
            ))}
          </div>

          <button
            onClick={() =>
              setActiveChapterIndex((prev) =>
                Math.min(SPECIMEN_CHAPTERS.length - 1, prev + 1)
              )
            }
            disabled={activeChapterIndex === SPECIMEN_CHAPTERS.length - 1}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeChapterIndex === SPECIMEN_CHAPTERS.length - 1
                ? 'opacity-40 cursor-not-allowed text-[#686B78]'
                : `${themeStyles.text} hover:bg-black/5 dark:hover:bg-white/10`
            }`}
          >
            <span>Next Specimen</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
