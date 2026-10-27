import React from 'react';

interface IllustrationProps {
  className?: string;
  strokeColor?: string;
}

/**
 * Handcrafted Letterpress & Movable Type Printing Press Engraving
 * Symbolic of editorial discipline, ink-on-paper heritage, and printing rigor.
 */
export const PrintingPressEngraving: React.FC<IllustrationProps> = ({
  className = 'w-full h-full',
  strokeColor = '#171D50',
}) => {
  return (
    <svg
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Base Foundation / Floor Line */}
      <line x1="20" y1="184" x2="260" y2="184" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="188" x2="240" y2="188" stroke={strokeColor} strokeWidth="1" opacity="0.4" />

      {/* Heavy Cast-Iron Timber Frame Columns */}
      <rect x="52" y="44" width="16" height="136" rx="2" stroke={strokeColor} strokeWidth="1.5" fill="none" />
      <rect x="212" y="44" width="16" height="136" rx="2" stroke={strokeColor} strokeWidth="1.5" fill="none" />
      
      {/* Column base pediments */}
      <path d="M46 180H74V184H46V180Z" stroke={strokeColor} strokeWidth="1.5" />
      <path d="M206 180H234V184H206V180Z" stroke={strokeColor} strokeWidth="1.5" />
      
      {/* Top Crossbeam / Cap Beam */}
      <rect x="42" y="34" width="196" height="18" rx="2" stroke={strokeColor} strokeWidth="1.5" fill="none" />
      <line x1="42" y1="42" x2="238" y2="42" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      
      {/* Central Acorn Finial on top */}
      <path d="M140 20C134 26 135 34 140 34C145 34 146 26 140 20Z" stroke={strokeColor} strokeWidth="1.5" />
      <line x1="140" y1="14" x2="140" y2="20" stroke={strokeColor} strokeWidth="1.5" />

      {/* Main Threaded Screw Spindle */}
      <rect x="134" y="52" width="12" height="54" stroke={strokeColor} strokeWidth="1.5" fill="none" />
      {/* Helical screw threads */}
      <line x1="134" y1="60" x2="146" y2="64" stroke={strokeColor} strokeWidth="1.5" />
      <line x1="134" y1="68" x2="146" y2="72" stroke={strokeColor} strokeWidth="1.5" />
      <line x1="134" y1="76" x2="146" y2="80" stroke={strokeColor} strokeWidth="1.5" />
      <line x1="134" y1="84" x2="146" y2="88" stroke={strokeColor} strokeWidth="1.5" />
      <line x1="134" y1="92" x2="146" y2="96" stroke={strokeColor} strokeWidth="1.5" />

      {/* Press Lever Arm with Weighted Counter-Balls */}
      <path d="M78 68H202" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <circle cx="74" cy="68" r="6" stroke={strokeColor} strokeWidth="1.5" />
      <circle cx="206" cy="68" r="6" stroke={strokeColor} strokeWidth="1.5" />
      <circle cx="140" cy="68" r="3" fill={strokeColor} />

      {/* Upper Platen (Pressure Plate) */}
      <rect x="80" y="106" width="120" height="12" rx="1.5" stroke={strokeColor} strokeWidth="1.5" fill="none" />
      <line x1="84" y1="112" x2="196" y2="112" stroke={strokeColor} strokeWidth="1" opacity="0.5" />

      {/* Tympan & Bed (Lower Type Form Carrier) */}
      <rect x="68" y="128" width="144" height="14" rx="2" stroke={strokeColor} strokeWidth="1.5" fill="none" />
      
      {/* Typesetting Chase (Movable Type Grid) */}
      <rect x="94" y="132" width="92" height="6" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" fill="none" />
      
      {/* Rounce / Carriage Crank Wheel */}
      <circle cx="220" cy="142" r="14" stroke={strokeColor} strokeWidth="1.5" fill="none" />
      <circle cx="220" cy="142" r="3" fill={strokeColor} />
      <line x1="220" y1="142" x2="232" y2="134" stroke={strokeColor} strokeWidth="1.5" />
      <circle cx="234" cy="132" r="2.5" fill={strokeColor} />

      {/* Diagonal Frame Braces */}
      <line x1="68" y1="90" x2="80" y2="106" stroke={strokeColor} strokeWidth="1.2" opacity="0.6" />
      <line x1="212" y1="90" x2="200" y2="106" stroke={strokeColor} strokeWidth="1.2" opacity="0.6" />

      {/* Floating Printed Folio Sheet Resting on Table */}
      <path d="M106 142H174L168 174H100L106 142Z" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="3 2" fill="none" opacity="0.7" />
      <line x1="112" y1="150" x2="160" y2="150" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
      <line x1="110" y1="156" x2="156" y2="156" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
      <line x1="108" y1="162" x2="152" y2="162" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
    </svg>
  );
};

/**
 * Handcrafted Writing Desk & Sanctuary Inkwell Vignette
 * Symbolic of deliberate thought, author focus, and mental clarity.
 */
export const WritingDeskSanctuary: React.FC<IllustrationProps> = ({
  className = 'w-full h-full',
  strokeColor = '#171D50',
}) => {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Horizon / Desk Edge Line */}
      <line x1="16" y1="146" x2="224" y2="146" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="152" x2="210" y2="152" stroke={strokeColor} strokeWidth="1" opacity="0.3" />

      {/* Slanted Editorial Writing Lectern / Slope */}
      <polygon points="54,142 186,142 178,92 62,92" stroke={strokeColor} strokeWidth="1.5" fill="none" />
      
      {/* Bound Notebook with Spine on Lectern */}
      <polygon points="76,134 164,134 158,102 70,102" stroke={strokeColor} strokeWidth="1.25" fill="none" />
      <line x1="117" y1="102" x2="120" y2="134" stroke={strokeColor} strokeWidth="1.25" />
      {/* Left and right lined notebook leaves */}
      <line x1="82" y1="110" x2="110" y2="110" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />
      <line x1="82" y1="116" x2="112" y2="116" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />
      <line x1="82" y1="122" x2="108" y2="122" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />

      <line x1="125" y1="110" x2="152" y2="110" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />
      <line x1="126" y1="116" x2="150" y2="116" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />
      <line x1="127" y1="122" x2="148" y2="122" stroke={strokeColor} strokeWidth="0.8" opacity="0.5" />

      {/* Classic Glass Inkpot & Brass Stopper */}
      <path d="M194 146H212V132C212 130 210 128 207 128H199C196 128 194 130 194 132V146Z" stroke={strokeColor} strokeWidth="1.5" />
      <rect x="199" y="122" width="8" height="6" rx="1" stroke={strokeColor} strokeWidth="1.25" />
      <circle cx="203" cy="120" r="2" fill={strokeColor} />
      <line x1="196" y1="138" x2="210" y2="138" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />

      {/* Dipped Quill / Calligraphic Pen Resting in Inkwell */}
      <line x1="203" y1="126" x2="178" y2="54" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M178 54C184 50 196 46 200 36C198 48 188 56 182 60" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="184" y1="48" x2="188" y2="52" stroke={strokeColor} strokeWidth="0.8" opacity="0.6" />
      <line x1="188" y1="44" x2="192" y2="48" stroke={strokeColor} strokeWidth="0.8" opacity="0.6" />

      {/* Desk Reading Candle / Chamberstick */}
      <ellipse cx="38" cy="144" rx="14" ry="4" stroke={strokeColor} strokeWidth="1.25" fill="none" />
      <rect x="35" y="112" width="6" height="32" rx="1" stroke={strokeColor} strokeWidth="1.25" fill="none" />
      {/* Candle Wick & Teardrop Flame */}
      <line x1="38" y1="112" x2="38" y2="106" stroke={strokeColor} strokeWidth="1" />
      <path d="M38 94C35 100 34 104 38 106C42 104 41 100 38 94Z" stroke={strokeColor} strokeWidth="1.25" fill="none" />
      <circle cx="38" cy="101" r="1.5" fill={strokeColor} />

      {/* Radiant Halo around flame */}
      <circle cx="38" cy="100" r="12" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.4" />
    </svg>
  );
};

/**
 * Hand Bookbinding & Stitching Awl Vignette
 * Symbolic of enduring physical craft, DRM-free permanent ownership, and durability.
 */
export const BookbindingCraftVignette: React.FC<IllustrationProps> = ({
  className = 'w-full h-full',
  strokeColor = '#171D50',
}) => {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Worktable surface */}
      <line x1="20" y1="150" x2="220" y2="150" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />

      {/* Heavy Bound Codex Resting on Spine Angle */}
      <g transform="translate(10, 0)">
        {/* Book Boards (Front & Back Covers) */}
        <path d="M60 144L140 144L170 80L90 80L60 144Z" stroke={strokeColor} strokeWidth="1.5" fill="none" />
        <path d="M60 144L52 144L82 80L90 80L60 144Z" stroke={strokeColor} strokeWidth="1.5" fill="none" />

        {/* Paper Quire Signatures / Page Gilt Edges */}
        <path d="M90 80L170 80L164 92L84 92L90 80Z" stroke={strokeColor} strokeWidth="1.2" fill="none" />
        <line x1="94" y1="84" x2="168" y2="84" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />
        <line x1="92" y1="88" x2="166" y2="88" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />

        {/* Decorative Spine Raised Ribs / Hubs */}
        <line x1="56" y1="126" x2="86" y2="62" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="58" y1="112" x2="88" y2="48" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="60" y1="98" x2="90" y2="34" stroke={strokeColor} strokeWidth="1.5" />

        {/* Handcrafted Stitching Thread with Loop */}
        <path d="M86 62C100 50 115 54 118 68C120 78 110 86 102 96" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="102" cy="96" r="2" fill={strokeColor} />

        {/* Bookbinder's Awl / Piercing Tool */}
        <path d="M182 146L210 100" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        <path d="M210 100L222 80C224 76 222 72 218 74L208 84L210 100Z" stroke={strokeColor} strokeWidth="1.5" fill="none" />
        <line x1="182" y1="146" x2="176" y2="156" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};

/**
 * Open Codex & Reading Specimen Vignette
 * Symbolic of deep reading, typography specimen, and intellectual focus.
 */
export const OpenCodexSpecimen: React.FC<IllustrationProps> = ({
  className = 'w-full h-full',
  strokeColor = '#171D50',
}) => {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Table Baseline */}
      <line x1="16" y1="154" x2="224" y2="154" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />

      {/* Symmetrical Open Book Wings */}
      <path
        d="M120 134C96 138 52 142 32 136L42 66C62 70 96 66 120 74C144 66 178 70 198 66L208 136C188 142 144 138 120 134Z"
        stroke={strokeColor}
        strokeWidth="1.5"
        fill="none"
      />

      {/* Central Spine Valley */}
      <line x1="120" y1="74" x2="120" y2="134" stroke={strokeColor} strokeWidth="1.5" />

      {/* Underneath Paper Leaves Thickness */}
      <path d="M32 136C40 144 76 146 120 142C164 146 200 144 208 136" stroke={strokeColor} strokeWidth="1.2" opacity="0.6" />
      <path d="M36 142C48 148 80 150 120 146C160 150 192 148 204 142" stroke={strokeColor} strokeWidth="1" opacity="0.3" />

      {/* Left Page Form: Elegant Drop Cap & Prose Lines */}
      <rect x="52" y="82" width="16" height="18" rx="1.5" stroke={strokeColor} strokeWidth="1.2" fill="none" />
      <text x="56" y="96" fill={strokeColor} fontSize="13" fontFamily="serif" fontWeight="bold">A</text>
      <line x1="74" y1="86" x2="108" y2="86" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
      <line x1="74" y1="94" x2="108" y2="94" stroke={strokeColor} strokeWidth="1" opacity="0.5" />

      <line x1="52" y1="106" x2="108" y2="106" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
      <line x1="52" y1="114" x2="108" y2="114" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
      <line x1="52" y1="122" x2="96" y2="122" stroke={strokeColor} strokeWidth="1" opacity="0.5" />

      {/* Right Page Form: Chapter Header & Prose Lines */}
      <line x1="132" y1="84" x2="164" y2="84" stroke={strokeColor} strokeWidth="1.2" />
      <line x1="132" y1="94" x2="188" y2="94" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
      <line x1="132" y1="102" x2="188" y2="102" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
      <line x1="132" y1="110" x2="188" y2="110" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
      <line x1="132" y1="118" x2="188" y2="118" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
      <line x1="132" y1="126" x2="170" y2="126" stroke={strokeColor} strokeWidth="1" opacity="0.5" />

      {/* Silk Ribbon Bookmark hanging down */}
      <path d="M120 74C124 94 116 114 122 158L126 150L130 158C124 124 128 100 120 74Z" stroke={strokeColor} strokeWidth="1.2" fill={strokeColor} fillOpacity="0.15" />
    </svg>
  );
};
