import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod } from '../../types';
import { X, ShieldCheck, Lock, CreditCard, Smartphone, CheckCircle2, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    activeCoupon,
    createOrder,
    setIsCartOpen,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const discountAmount = activeCoupon
    ? Math.round((cartSubtotal * activeCoupon.discountPercentage) / 100)
    : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const usdEstimate = (finalTotal / 120).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      setErrorMsg('Please enter a valid email address for digital delivery.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMsg('Please enter your mobile phone number for verification.');
      return;
    }

    // If MFS method is chosen in Bangladesh, ask for transaction reference
    if (['bkash', 'nagad', 'rocket'].includes(paymentMethod) && !transactionId.trim()) {
      setErrorMsg(`Please enter the ${paymentMethod.toUpperCase()} transaction ID (TrxID) from your payment receipt.`);
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('Please agree to the digital licensing terms.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        createOrder({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          paymentMethod,
          transactionId: transactionId.trim() || undefined,
        });
        setIsSubmitting(false);
      } catch (err) {
        setErrorMsg('An error occurred during order processing. Please retry.');
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-3xl shadow-2xl border border-[#E8E9F0] rounded-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E9F0] bg-[#FAFAFC]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#171D50]" />
            <h3 className="font-editorial text-lg text-[#171923] font-medium">
              Secure Digital Checkout
            </h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-[#686B78] hover:text-[#171923] hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column: Customer & Payment Details */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Reader Info */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#171923] flex items-center gap-1.5">
                  <span>1. Reader Details & Digital Delivery</span>
                </h4>
                
                <div>
                  <label className="block text-[11px] font-medium text-[#171923] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asif Ahmed"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#171923] mb-1">
                    Email Address * (Ebook download link sent here)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#171923] mb-1">
                    Phone Number * (Required for MFS verification)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+880 1712-XXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-xl"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#171923]">
                  2. Payment Method
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-3.5 border text-left transition-all rounded-2xl ${
                      paymentMethod === 'bkash'
                        ? 'border-[#171D50] bg-[#171D50]/5 font-semibold text-[#171D50] shadow-xs'
                        : 'border-[#E8E9F0] bg-white text-[#686B78] hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-pink-700">bKash (MFS)</div>
                    <div className="text-[10px] text-[#686B78] mt-0.5">Instant Bangladesh App</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-3.5 border text-left transition-all rounded-2xl ${
                      paymentMethod === 'nagad'
                        ? 'border-[#171D50] bg-[#171D50]/5 font-semibold text-[#171D50] shadow-xs'
                        : 'border-[#E8E9F0] bg-white text-[#686B78] hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-orange-600">Nagad</div>
                    <div className="text-[10px] text-[#686B78] mt-0.5">Post Office Digital</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3.5 border text-left transition-all rounded-2xl ${
                      paymentMethod === 'card'
                        ? 'border-[#171D50] bg-[#171D50]/5 font-semibold text-[#171D50] shadow-xs'
                        : 'border-[#E8E9F0] bg-white text-[#686B78] hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-[#171923]">Visa / Mastercard</div>
                    <div className="text-[10px] text-[#686B78] mt-0.5">SSLCommerz / Local Gateway</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('international')}
                    className={`p-3.5 border text-left transition-all rounded-2xl ${
                      paymentMethod === 'international'
                        ? 'border-[#171D50] bg-[#171D50]/5 font-semibold text-[#171D50] shadow-xs'
                        : 'border-[#E8E9F0] bg-white text-[#686B78] hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-[#171923]">International Card</div>
                    <div className="text-[10px] text-[#686B78] mt-0.5">Stripe (~${usdEstimate} USD)</div>
                  </button>
                </div>

                {/* MFS instructions */}
                {['bkash', 'nagad', 'rocket'].includes(paymentMethod) && (
                  <div className="p-4 bg-gray-50 border border-[#E8E9F0] rounded-2xl space-y-2 text-xs">
                    <div className="text-[11px] text-[#171923] font-medium">
                      Payment Instructions for {paymentMethod.toUpperCase()}:
                    </div>
                    <ol className="list-decimal list-inside text-[11px] text-[#686B78] space-y-1">
                      <li>Send money / Make Payment to Merchant Account: <span className="font-mono font-bold text-[#171D50]">01700-112233</span></li>
                      <li>Amount: <span className="font-bold text-[#171D50]">৳{finalTotal} BDT</span></li>
                      <li>Enter reference: <span className="font-mono">ALJABIN</span></li>
                    </ol>
                    <div className="pt-2">
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#171923] mb-1">
                        Enter Transaction ID (TrxID) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9B7X289LA"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2 text-xs font-mono uppercase bg-white border border-[#E8E9F0] focus:outline-none focus:border-[#171D50] rounded-xl"
                      />
                      <p className="text-[10px] text-[#686B78] mt-1">
                        Enter the 8-10 digit Transaction ID received via SMS after sending payment.
                      </p>
                    </div>
                  </div>
                )}

                {/* Card instructions */}
                {paymentMethod === 'card' && (
                  <div className="p-4 bg-gray-50 border border-[#E8E9F0] rounded-2xl text-xs space-y-1.5 text-[#686B78]">
                    <div className="font-semibold text-[#171923] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#171D50]" />
                      <span>Local Debit / Credit Cards</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Secured by SSLCommerz and Bangladesh Bank 2FA protocols. Supports Visa, Mastercard, DBBL Nexus, and UnionPay with zero processing fees.
                    </p>
                  </div>
                )}

                {paymentMethod === 'international' && (
                  <div className="p-4 bg-gray-50 border border-[#E8E9F0] rounded-2xl text-xs space-y-1.5 text-[#686B78]">
                    <div className="font-semibold text-[#171923] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#171D50]" />
                      <span>International Credit Cards (USD)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Accepts Visa, Mastercard, and American Express worldwide (~${usdEstimate} USD) with instant digital delivery upon confirmation.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Order Summary */}
            <div className="md:col-span-5 bg-[#FAFAFC] p-6 border border-[#E8E9F0] rounded-3xl flex flex-col justify-between space-y-4 shadow-2xs">
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#171923] mb-3">
                  Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                </h4>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.book.id} className="flex justify-between text-xs py-1.5 border-b border-[#F0F1F5]">
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-[#171923] truncate">{item.book.title}</div>
                        <div className="text-[10px] text-[#686B78]">Qty: {item.quantity} · {item.book.format.split(' ')[0]}</div>
                      </div>
                      <div className="font-semibold text-[#171D50] shrink-0">
                        ৳{item.book.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total breakdown */}
                <div className="pt-4 space-y-2 text-xs text-[#686B78] border-t border-[#E8E9F0] mt-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#171923]">৳{cartSubtotal} BDT</span>
                  </div>
                  {activeCoupon && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Coupon ({activeCoupon.code})</span>
                      <span>-৳{discountAmount} BDT</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#171D50] pt-2 border-t border-[#E8E9F0]">
                    <span>Total Amount</span>
                    <span>৳{finalTotal} BDT</span>
                  </div>
                  <div className="text-[10px] text-right text-[#686B78]">
                    Approx. ${usdEstimate} USD
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-3 pt-2 border-t border-[#E8E9F0]">
                <label className="flex items-start gap-2 text-[11px] text-[#686B78] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 accent-[#171D50] rounded-sm"
                  />
                  <span>
                    I agree to the Digital Ebook License (personal use, DRM-free) and accept instant delivery to my email address.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#171D50] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#0f1338] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm rounded-full disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying & Generating Ebooks...</span>
                  ) : (
                    <>
                      <span>Complete Order & Get Downloads</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
