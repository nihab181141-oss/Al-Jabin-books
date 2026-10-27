import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, BookOpen, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({ isOpen, onClose }) => {
  const { lookupOrder, setConfirmedOrder, showToast } = useStore();
  const [query, setQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!query.trim()) {
      setErrorMsg('Please enter an Order ID or Access Code.');
      return;
    }
    const found = lookupOrder(query.trim());
    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchedOrder(null);
      setErrorMsg(`No active order found matching "${query.trim()}". Try checking your confirmation email or order reference.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-xl shadow-2xl border border-[#E8E9F0] rounded-3xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E9F0] bg-[#FAFAFC]">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#171D50]" />
            <h3 className="font-editorial text-lg text-[#171923] font-medium">
              Find Purchased Order & Downloads
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#686B78] hover:text-[#171923] hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-medium text-[#171923]">
              Enter Order ID (e.g. AJP-123456) or Download Access Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="AJP-... or DL-..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="flex-1 px-4 py-2 text-xs font-mono uppercase bg-white border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-full"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[#171D50] text-white text-xs font-medium uppercase tracking-wider hover:bg-[#0f1338] transition-colors rounded-full"
              >
                Lookup
              </button>
            </div>
            <p className="text-[11px] text-[#686B78]">
              Your order confirmation and download token are provided right after checkout.
            </p>
          </form>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result view */}
          {searchedOrder && (
            <div className="p-5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E9F0]">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#686B78]">Order Found</div>
                  <div className="font-bold text-[#171D50] font-mono text-sm">{searchedOrder.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#686B78]">Total</div>
                  <div className="font-semibold text-[#171923] text-sm">৳{searchedOrder.total} BDT</div>
                </div>
              </div>

              <div className="text-xs text-[#686B78] space-y-1">
                <div>Customer: <strong className="text-[#171923]">{searchedOrder.customerName}</strong></div>
                <div>Email: <strong className="text-[#171923]">{searchedOrder.customerEmail}</strong></div>
                <div>Status: <span className="font-semibold text-emerald-700 uppercase">{searchedOrder.paymentStatus}</span></div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-[#171923]">Purchased Volumes:</div>
                {searchedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-white border border-[#E8E9F0] rounded-xl">
                    <span className="font-medium text-[#171923]">{item.title}</span>
                    <span className="text-[#686B78]">৳{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setConfirmedOrder(searchedOrder);
                    onClose();
                  }}
                  className="w-full py-3 bg-[#171D50] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0f1338] transition-colors rounded-full"
                >
                  Open Download Center for This Order
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
