import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, CheckCircle, XCircle, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

export const SSLCommerzSimulator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'cards' | 'bkash' | 'nagad'>('bkash');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('gateway_simulation') === '1') {
      setOrderId(params.get('order_id') || '');
      setOrderNumber(params.get('tran_id') || '');
      setAmount(params.get('amount') || '');
      setIsOpen(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleSimulateSuccess = async () => {
    setIsProcessing(true);
    try {
      // Simulate SSLCOMMERZ Success POST callback to backend
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/api/payment/sslcommerz/success?order_id=${encodeURIComponent(orderId)}`;

      const addField = (name: string, value: string) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      addField('val_id', `SANDBOX_VAL_${Date.now()}`);
      addField('tran_id', orderNumber);
      addField('amount', amount);
      addField('currency', 'BDT');
      addField('card_type', selectedChannel.toUpperCase());
      addField('bank_tran_id', `BANK_${Date.now()}`);

      document.body.appendChild(form);
      form.submit();
    } catch {
      setIsProcessing(false);
    }
  };

  const handleSimulateCancel = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/api/payment/sslcommerz/cancel?order_id=${encodeURIComponent(orderId)}`;
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-lg shadow-2xl border border-gray-300 rounded-3xl overflow-hidden my-auto text-left">
        
        {/* Gateway Header */}
        <div className="bg-[#171D50] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">
                SSLCOMMERZ Payment Gateway
              </div>
              <h3 className="text-base font-semibold text-white">
                Sandbox Environment Simulator
              </h3>
            </div>
          </div>
          <button
            onClick={handleSimulateCancel}
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            title="Cancel transaction"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 p-3 px-5 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Testing mode: Demonstrates end-to-end payment verification and automatic digital entitlement delivery.
          </span>
        </div>

        {/* Payment Summary */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <div className="text-gray-500 text-[10px] uppercase tracking-wider">Merchant</div>
              <div className="font-semibold text-gray-900 text-sm">Al Jabin Publications</div>
              <div className="text-gray-500 text-[11px]">TrxID: {orderNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider">Amount Due</div>
              <div className="text-2xl font-bold text-[#171D50]">৳{amount}</div>
              <div className="text-emerald-700 text-[11px] font-medium">Currency: BDT</div>
            </div>
          </div>

          {/* Channels Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-800">
              Select Test Payment Instrument:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedChannel('bkash')}
                className={`p-3 border rounded-xl text-center transition-all cursor-pointer ${
                  selectedChannel === 'bkash'
                    ? 'border-[#E2136E] bg-pink-50 text-[#E2136E] font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">bKash</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('nagad')}
                className={`p-3 border rounded-xl text-center transition-all cursor-pointer ${
                  selectedChannel === 'nagad'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">Nagad</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('cards')}
                className={`p-3 border rounded-xl text-center transition-all cursor-pointer ${
                  selectedChannel === 'cards'
                    ? 'border-[#171D50] bg-blue-50 text-[#171D50] font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">Card / Visa</span>
              </button>
            </div>
          </div>

          {/* Simulation CTAs */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSimulateSuccess}
              disabled={isProcessing}
              className="w-full py-3.5 bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isProcessing ? 'Verifying Transaction with Gateway...' : `Simulate Successful Payment (৳${amount})`}
              </span>
            </button>

            <button
              onClick={handleSimulateCancel}
              disabled={isProcessing}
              className="w-full py-2.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel / Decline Payment
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
