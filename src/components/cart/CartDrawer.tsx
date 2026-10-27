import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
    setIsCheckoutOpen,
    activeCoupon,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({ success: res.success, msg: res.message });
    if (res.success) {
      setCouponInput('');
    }
  };

  const discountAmount = activeCoupon
    ? Math.round((cartSubtotal * activeCoupon.discountPercentage) / 100)
    : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#E8E9F0]">
          
          {/* Header */}
          <div className="p-6 border-b border-[#E8E9F0] flex items-center justify-between bg-[#FAFAFC]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#171D50]" />
              <h3 className="font-editorial text-xl text-[#171923] font-medium">
                Your Reading Bag
              </h3>
              <span className="text-xs text-[#686B78] font-sans">
                ({cartCount} {cartCount === 1 ? 'volume' : 'volumes'})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#686B78] hover:text-[#171923] hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#686B78]/30 mx-auto" />
                <h4 className="font-editorial text-lg text-[#171923]">
                  Your bag is currently empty
                </h4>
                <p className="text-xs text-[#686B78] max-w-xs mx-auto leading-relaxed font-light">
                  Explore our bookstore catalogue to discover thoughtful publications and practical manuals.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-[#171D50] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#0f1338] rounded-full transition-colors"
                >
                  Browse Books
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.book.id}
                  className="p-4 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl flex gap-4 items-start shadow-2xs"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.book.coverImage}
                    alt={item.book.title}
                    className="w-14 aspect-[3/4.4] object-cover bg-[#171D50] shadow-2xs border-r border-black/20 rounded-md shrink-0"
                  />

                  {/* Title & Quantity */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="font-editorial text-sm font-medium text-[#171923] line-clamp-1">
                        {item.book.title}
                      </h4>
                      <div className="text-[11px] text-[#686B78]">{item.book.author}</div>
                      <div className="text-[10px] text-[#686B78]">{item.book.format.split(' ')[0]} Format</div>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Modifier with circular pill borders */}
                      <div className="flex items-center border border-[#E8E9F0] bg-white rounded-full px-1.5 py-0.5 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          className="p-1 text-[#686B78] hover:text-[#171923] hover:bg-gray-100 rounded-full"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-[#171923]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          className="p-1 text-[#686B78] hover:text-[#171923] hover:bg-gray-100 rounded-full"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Price & Remove */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[#171D50]">
                          ৳{item.book.price * item.quantity}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.book.id)}
                          className="text-[#686B78] hover:text-rose-600 transition-colors p-1.5 rounded-full hover:bg-rose-50"
                          aria-label={`Remove ${item.book.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#FAFAFC] border-t border-[#E8E9F0] space-y-4">
              
              {/* Coupon Form with rounded styling */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#686B78] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Coupon (e.g. BENGALREADS)"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        if (couponFeedback) setCouponFeedback(null);
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8E9F0] uppercase font-mono tracking-wider focus:outline-none focus:border-[#171D50] rounded-full"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-xs text-[#171923] font-medium transition-colors rounded-full"
                  >
                    Apply
                  </button>
                </div>

                {couponFeedback && (
                  <div
                    className={`text-[11px] px-3 py-1 rounded-full ${
                      couponFeedback.success ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                    }`}
                  >
                    {couponFeedback.msg}
                  </div>
                )}

                {activeCoupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{activeCoupon.code} ({activeCoupon.discountPercentage}% OFF)</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-emerald-900 underline text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </form>

              {/* Subtotal Calculation */}
              <div className="space-y-1.5 text-xs text-[#686B78] pt-2 border-t border-[#E8E9F0]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#171923]">৳{cartSubtotal}</span>
                </div>
                {activeCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({activeCoupon.discountPercentage}%)</span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-[#171D50] pt-1 border-t border-[#E8E9F0]">
                  <span>Total Due</span>
                  <span>৳{finalTotal} BDT</span>
                </div>
              </div>

              {/* Proceed Button with circular pill */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 bg-[#171D50] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#0f1338] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm rounded-full"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[10px] text-center text-[#686B78]">
                Instant digital delivery via download link & email confirmation.
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
