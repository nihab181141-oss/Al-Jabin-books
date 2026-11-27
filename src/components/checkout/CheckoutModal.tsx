import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod } from '../../types';
import {
  X,
  Lock,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

const PROGRESS_LABELS: Record<'creating' | 'initiating' | 'verifying' | 'unlocking', string> = {
  creating: 'Initializing Secure Order...',
  initiating: 'Connecting Automated Payment Gateway...',
  verifying: 'Verifying Payment Automatically...',
  unlocking: 'Unlocking Instant PDF Download...',
};

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    activeCoupon,
    createOrder,
    currentUser,
    userProfile,
  } = useStore();

  const [customerName, setCustomerName] = useState(
    userProfile?.displayName || currentUser?.displayName || ''
  );
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStage, setProgressStage] = useState<
    'creating' | 'initiating' | 'verifying' | 'unlocking' | null
  >(null);

  useEffect(() => {
    if (!isCheckoutOpen) {
      setIsSubmitting(false);
      setProgressStage(null);
      setErrorMsg(null);
      return;
    }
    const defaultName = userProfile?.displayName || currentUser?.displayName || '';
    const defaultEmail = currentUser?.email || '';
    const defaultPhone = userProfile?.phone || '';
    if (!customerName && defaultName) setCustomerName(defaultName);
    if (!customerEmail && defaultEmail) setCustomerEmail(defaultEmail);
    if (!customerPhone && defaultPhone) setCustomerPhone(defaultPhone);
  }, [isCheckoutOpen, currentUser, userProfile]);

  if (!isCheckoutOpen) return null;

  const discountAmount = activeCoupon
    ? Math.round((cartSubtotal * activeCoupon.discountPercentage) / 100)
    : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const isFreeOrder = finalTotal === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      setErrorMsg('Please enter a valid email address for PDF delivery.');
      return;
    }

    if (!isFreeOrder && !customerPhone.trim()) {
      setErrorMsg('Please enter your contact phone number for automated gateway verification.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('Please agree to the digital licensing terms.');
      return;
    }

    setIsSubmitting(true);
    setProgressStage('creating');

    try {
      const result = await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod: isFreeOrder ? 'free' : paymentMethod,
        onProgress: (stage) => setProgressStage(stage),
      });

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred while processing your order. Please retry.');
      setIsSubmitting(false);
      setProgressStage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-3xl shadow-2xl border border-[#E8E9F0] rounded-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E9F0] bg-[#FAFAFC]">
          <div className="flex items-center gap-2">
            {isFreeOrder ? (
              <Download className="w-4 h-4 text-emerald-700" />
            ) : (
              <Lock className="w-4 h-4 text-[#171D50]" />
            )}
            <h3 className="font-editorial text-lg text-[#171923] font-medium">
              {isFreeOrder ? 'Instant Free Edition Claim' : 'Automated Digital Checkout'}
            </h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            disabled={isSubmitting}
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
              <span className="text-[#686B78]">Edition{cart.length > 1 ? 's' : ''}: </span>
              <span className="font-semibold text-[#171923]">
                {cart.map((c) => `${c.book.title}${c.quantity > 1 ? ` (x${c.quantity})` : ''}`).join(', ')}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[#686B78]">Verified Total: </span>
              <span className={`font-semibold text-base ml-1 font-mono tabular-nums ${isFreeOrder ? 'text-emerald-700' : 'text-[#171D50]'}`}>
                {isFreeOrder ? 'Free (৳0)' : `৳${finalTotal}`}
              </span>
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
                {isFreeOrder ? '1. Reader Details for Instant PDF Delivery' : '1. Delivery & Buyer Details'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#171923] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
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
                {!isFreeOrder && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#171923] mb-1">
                      Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+880 1XXX-XXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-xl bg-white"
                    />
                    <p className="text-[11px] text-[#686B78] mt-1 font-light">
                      Used by the automated payment gateway for verification and digital receipts.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Free Claim Info Banner */}
            {isFreeOrder ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Zero Payment Required · Instant PDF Access</div>
                  <p className="text-emerald-800/85 mt-0.5 leading-relaxed">
                    This publication is a Free Edition. Your secure PDF download token is generated automatically the moment you submit.
                  </p>
                </div>
              </div>
            ) : (
              /* Payment Method Selection (Automated Gateway Verification) */
              <div className="space-y-4 pt-4 border-t border-[#E8E9F0]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs uppercase tracking-wider text-[#686B78] font-semibold">
                    2. Select Payment Channel (Automated Verification)
                  </h4>
                  <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Auto-verified instant PDF unlock</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* bKash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-4 border text-left rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'bkash'
                        ? 'border-[#171D50] bg-[#171D50]/5 shadow-xs'
                        : 'border-[#E8E9F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#E2136E]" />
                        <span className="font-semibold text-xs text-[#171923]">bKash Gateway</span>
                      </div>
                      {paymentMethod === 'bkash' && <CheckCircle2 className="w-4 h-4 text-[#171D50]" />}
                    </div>
                    <p className="text-[11px] text-[#686B78] font-light leading-relaxed">
                      Automatic bKash verification with instant PDF delivery.
                    </p>
                  </button>

                  {/* Nagad */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-4 border text-left rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'nagad'
                        ? 'border-[#171D50] bg-[#171D50]/5 shadow-xs'
                        : 'border-[#E8E9F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#F15A22]" />
                        <span className="font-semibold text-xs text-[#171923]">Nagad Gateway</span>
                      </div>
                      {paymentMethod === 'nagad' && <CheckCircle2 className="w-4 h-4 text-[#171D50]" />}
                    </div>
                    <p className="text-[11px] text-[#686B78] font-light leading-relaxed">
                      Automatic Nagad verification with instant PDF delivery.
                    </p>
                  </button>

                  {/* Rocket */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('rocket')}
                    className={`p-4 border text-left rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'rocket'
                        ? 'border-[#171D50] bg-[#171D50]/5 shadow-xs'
                        : 'border-[#E8E9F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#8C3494]" />
                        <span className="font-semibold text-xs text-[#171923]">Rocket Mobile Banking</span>
                      </div>
                      {paymentMethod === 'rocket' && <CheckCircle2 className="w-4 h-4 text-[#171D50]" />}
                    </div>
                    <p className="text-[11px] text-[#686B78] font-light leading-relaxed">
                      DBBL Rocket gateway checkout with automatic verification.
                    </p>
                  </button>

                  {/* Card / International */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border text-left rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'card'
                        ? 'border-[#171D50] bg-[#171D50]/5 shadow-xs'
                        : 'border-[#E8E9F0] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#171D50]" />
                        <span className="font-semibold text-xs text-[#171923]">Card & International</span>
                      </div>
                      {paymentMethod === 'card' && <CheckCircle2 className="w-4 h-4 text-[#171D50]" />}
                    </div>
                    <p className="text-[11px] text-[#686B78] font-light leading-relaxed">
                      Visa, Mastercard & Amex automated payment verification.
                    </p>
                  </button>
                </div>
              </div>
            )}

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
                  I understand this edition is licensed for personal, DRM-free reading. {isFreeOrder ? 'Your PDF unlocks immediately.' : 'Your PDF unlocks automatically upon gateway payment verification.'}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 text-white text-xs font-semibold tracking-wider uppercase rounded-full transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                isFreeOrder
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-[#171D50] hover:bg-[#0f1338]'
              } ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressStage ? PROGRESS_LABELS[progressStage] : 'Processing...'}</span>
                </>
              ) : isFreeOrder ? (
                <>
                  <Download className="w-4 h-4" />
                  <span>Get Free PDF Now</span>
                </>
              ) : (
                <>
                  <span>Pay & Verify Automatically (৳{finalTotal})</span>
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
