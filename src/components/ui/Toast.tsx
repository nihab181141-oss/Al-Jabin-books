import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in transition-all">
      <div className="flex items-center gap-3 bg-[#171D50] text-white px-6 py-3.5 rounded-full shadow-2xl border border-white/10 text-sm font-sans tracking-wide">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
