import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod } from '../../types';
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Globe,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    activeCoupon,
    createOrder,
    currentUser,
  } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('sslcommerz');
  const [transactionId, setTransactionId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const discountAmount = activeCoupon
    ? Math.round((cartSubtotal * activeCoupon.discountPercentage) / 100)
    : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
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
      setErrorMsg('Please enter your contact phone number.');
      return;
    }

    if (['bkash', 'nagad', 'rocket'].includes(paymentMethod) && !transactionId.trim()) {
      setErrorMsg(`Please enter the ${paymentMethod.toUpperCase()} transaction ID (TrxID) from your payment receipt.`);
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('Please agree to the digital licensing terms.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod,
        transactionId: transactionId.trim() || undefined,
      });

      if (result.gatewayUrl) {
        // Redirect to SSLCOMMERZ Gateway
        window.location.href = result.gatewayUrl;
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during order initialization. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
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
            className="p-1.5 text-[#686B78] hover:text-[#171923] hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Order Summary Strip */}
          <div className="p-4 bg-[#FAF7F0] border border-[#EBE6DF] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#686B78]">Items in Order: </span>
              <span className="font-semibold text-[#171923]">
                {cart.map((c) => `${c.book.title} (x${c.quantity})`).join(', ')}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[#686B78]">Server-Calculated Total: </span>
              <span className="font-semibold text-base text-[#171D50] ml-1">৳{finalTotal}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Customer Details */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider text-[#686B78] font-semibold">
                1. Delivery & Buyer Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#171923] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Farhan Mahmud"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#171923] mb-1">
                    Email for Digital Download Delivery *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-xl bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#171923] mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-xl bg-white"
                  />
                  <p className="text-[11px] text-[#686B78] mt-1 font-light">
                    Required for payment gateway verification and transactional receipts.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4 pt-4 border-t border-[#E8E9F0]">
              <h4 className="text-xs uppercase tracking-wider text-[#686B78] font-semibold">
                2. Select Payment Method
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* SSLCOMMERZ Official Gateway */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('sslcommerz')}
                  className={`p-4 border text-left rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'sslcommerz'
                      ? 'border-[#171D50] bg-[#171D50]/5 shadow-xs'
                      : 'border-[#E8E9F0] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#171D50]" />
                      <span className="font-semibold text-xs text-[#171923]">SSLCOMMERZ Gateway</span>
                    </div>
                    {paymentMethod === 'sslcommerz' && <CheckCircle2 className="w-4 h-4 text-[#171D50]" />}
                  </div>
                  <p className="text-[11px] text-[#686B78] font-light leading-relaxed">
                    Visa, Mastercard, Amex, bKash, Nagad, Rocket, Upay & Bangladesh NetBanking.
                  </p>
                  <div className="mt-2 text-[10px] text-emerald-700 font-medium">
                    ✓ Instant Automated Verification
                  </div>
                </button>

                {/* Direct bKash MFS */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-4 border text-left rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'bkash'
                      ? 'border-[#171D50] bg-[#171D50]/5 shadow-xs'
                      : 'border-[#E8E9F0] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#E2136E]" />
                      <span className="font-semibold text-xs text-[#171923]">Direct bKash Transfer</span>
                    </div>
                    {paymentMethod === 'bkash' && <CheckCircle2 className="w-4 h-4 text-[#171D50]" />}
                  </div>
                  <p className="text-[11px] text-[#686B78] font-light leading-relaxed">
                    Merchant Send Money / Counter Payment with Transaction ID (TrxID).
                  </p>
                  <div className="mt-2 text-[10px] text-[#686B78]">
                    Number: 01700-000000
                  </div>
                </button>
              </div>

              {/* Direct MFS Transaction ID Input */}
              {['bkash', 'nagad', 'rocket'].includes(paymentMethod) && (
                <div className="p-4 bg-gray-50 border border-[#E8E9F0] rounded-2xl space-y-2 mt-3 animate-fade-in">
                  <label className="block text-xs font-medium text-[#171923]">
                    Enter {paymentMethod.toUpperCase()} Transaction ID (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9K72B8XQ"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-2 text-xs font-mono uppercase bg-white border border-[#E8E9F0] rounded-xl focus:border-[#171D50] focus:outline-none"
                  />
                  <p className="text-[11px] text-[#686B78]">
                    Send ৳{finalTotal} to our official merchant account (01700-000000) and paste the confirmation TrxID.
                  </p>
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="pt-4 border-t border-[#E8E9F0] space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#686B78]">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#171D50] focus:ring-[#171D50]"
                />
                <span>
                  I understand that this purchase is for personal, DRM-free digital editions (PDF & EPUB). Downloads are instant upon payment verification.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 bg-[#171D50] text-white text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-[#0f1338] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isSubmitting ? (
                <span>Initializing Secure Session...</span>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'sslcommerz' ? `Pay ৳${finalTotal} via SSLCOMMERZ` : `Confirm Order (৳${finalTotal})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
