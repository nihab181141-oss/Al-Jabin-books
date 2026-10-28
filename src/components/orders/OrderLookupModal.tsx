import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  X,
  BookOpen,
  Download,
  AlertCircle,
  CheckCircle2,
  User,
  Key,
  LogOut,
  Mail,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Order, EntitledDownload } from '../../types';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({ isOpen, onClose }) => {
  const {
    lookupOrder,
    currentUser,
    userProfile,
    loginWithEmail,
    registerWithEmail,
    resetUserPassword,
    logoutUser,
    userLibrary,
    refreshUserLibrary,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'lookup' | 'library' | 'auth'>('lookup');

  // Lookup state
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Auth form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.email) {
      refreshUserLibrary();
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    if (!query.trim()) {
      setLookupError('Please enter an Order ID or email.');
      return;
    }

    setIsSearching(true);
    try {
      const found = await lookupOrder(query.trim());
      if (found) {
        setSearchedOrder(found);
      } else {
        setSearchedOrder(null);
        setLookupError(`No order record found for "${query.trim()}". Check your confirmation email.`);
      }
    } catch {
      setLookupError('Error querying order database.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isReset) {
        if (!authEmail.trim()) throw new Error('Enter your email to receive a password reset link.');
        await resetUserPassword(authEmail.trim());
        setIsReset(false);
      } else if (isSignUp) {
        if (!authEmail.trim() || !authPassword) throw new Error('Email and password required.');
        if (authPassword.length < 6) throw new Error('Password must be at least 6 characters.');
        await registerWithEmail(authEmail.trim(), authPassword, authName.trim() || undefined);
        setActiveTab('library');
      } else {
        if (!authEmail.trim() || !authPassword) throw new Error('Email and password required.');
        await loginWithEmail(authEmail.trim(), authPassword);
        setActiveTab('library');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl shadow-2xl border border-[#E8E9F0] rounded-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E9F0] bg-[#FAF7F0]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#686B78] font-semibold">
              Al Jabin Publications · Reader Services
            </div>
            <h3 className="font-editorial text-lg text-[#171923] font-normal">
              Order Lookup & Customer Library
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#686B78] hover:text-[#171923] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8E9F0] px-6 bg-[#FAFAFC] text-xs">
          <button
            onClick={() => setActiveTab('lookup')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'lookup'
                ? 'border-[#171D50] text-[#171D50]'
                : 'border-transparent text-[#686B78] hover:text-[#171923]'
            }`}
          >
            Quick Order Lookup
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'border-[#171D50] text-[#171D50]'
                : 'border-transparent text-[#686B78] hover:text-[#171923]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Digital Library</span>
            {userLibrary.length > 0 && (
              <span className="bg-[#171D50] text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {userLibrary.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors cursor-pointer ml-auto flex items-center gap-1.5 ${
              activeTab === 'auth'
                ? 'border-[#171D50] text-[#171D50]'
                : 'border-transparent text-[#686B78] hover:text-[#171923]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{currentUser ? 'Account Profile' : 'Sign In / Register'}</span>
          </button>
        </div>

        {/* Tab 1: Order Lookup */}
        {activeTab === 'lookup' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-left">
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="block text-xs font-medium text-[#171923]">
                Enter Order ID (e.g. AJP-123456)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="AJP-... or order_..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (lookupError) setLookupError(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-mono uppercase bg-white border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-full"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-2.5 bg-[#171D50] text-white text-xs font-medium uppercase tracking-wider hover:bg-[#0f1338] transition-colors rounded-full cursor-pointer shadow-xs"
                >
                  {isSearching ? 'Searching...' : 'Lookup'}
                </button>
              </div>
              <p className="text-[11px] text-[#686B78] font-light">
                Find orders verified through SSLCOMMERZ or mobile banking. Instant access to download links.
              </p>
            </form>

            {lookupError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {searchedOrder && (
              <div className="p-6 bg-[#FAF7F0] border border-[#EBE6DF] rounded-2xl space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#686B78]">Order Record</div>
                    <div className="font-bold text-[#171D50] font-mono text-sm">{searchedOrder.orderNumber || searchedOrder.id}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        searchedOrder.paymentStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {searchedOrder.paymentStatus === 'verified' ? '✓ Paid & Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#686B78]">Customer: </span>
                    <span className="font-medium text-[#171923]">{searchedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[#686B78]">Total: </span>
                    <span className="font-semibold text-[#171D50]">৳{searchedOrder.total}</span>
                  </div>
                </div>

                {/* Purchased items list */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
                  <div className="text-xs font-medium text-[#171923]">Purchased Publications:</div>
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-[#E8E9F0] flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-medium text-[#171923]">{item.title}</div>
                        <div className="text-[11px] text-[#686B78] font-light">Quantity: {item.quantity} · DRM-Free PDF/EPUB</div>
                      </div>

                      {searchedOrder.paymentStatus === 'verified' ? (
                        <a
                          href={`/api/downloads/${searchedOrder.downloadAccessCode || 'specimen'}`}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171D50] text-white text-[11px] font-medium rounded-full hover:bg-[#0f1338] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-amber-700">Awaiting Verification</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Customer Library */}
        {activeTab === 'library' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-left">
            {!currentUser ? (
              <div className="text-center py-10 space-y-4">
                <BookOpen className="w-10 h-10 text-[#171D50]/40 mx-auto" />
                <h4 className="font-editorial text-xl text-[#171923]">Sign in to access your digital library</h4>
                <p className="text-xs text-[#686B78] max-w-sm mx-auto font-light">
                  All your purchased DRM-free ebooks are safely stored and permanently accessible under your verified customer account.
                </p>
                <button
                  onClick={() => setActiveTab('auth')}
                  className="px-6 py-2.5 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer"
                >
                  Sign In / Create Account
                </button>
              </div>
            ) : userLibrary.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-[#FAF7F0] border border-[#EBE6DF] rounded-2xl">
                <BookOpen className="w-8 h-8 text-[#171D50]/40 mx-auto" />
                <h4 className="font-editorial text-lg text-[#171923]">No Ebooks in Library Yet</h4>
                <p className="text-xs text-[#686B78] font-light max-w-sm mx-auto">
                  When you complete a purchase, your DRM-free editions will instantly appear here with permanent download access.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#686B78]">
                  <span>{userLibrary.length} Active Digital Entitlements</span>
                  <button onClick={refreshUserLibrary} className="text-[#171D50] hover:underline cursor-pointer">
                    ↻ Refresh Library
                  </button>
                </div>

                <div className="space-y-3">
                  {userLibrary.map((item) => (
                    <div
                      key={item.downloadId}
                      className="p-4 bg-white border border-[#E8E9F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div>
                        <div className="font-editorial text-base text-[#171923] font-medium">{item.productTitle}</div>
                        <div className="text-[11px] text-[#686B78] flex items-center gap-2 mt-1">
                          <span>Order: {item.orderNumber}</span>
                          <span>·</span>
                          <span>Downloads used: {item.downloadCount} of {item.maxDownloads}</span>
                        </div>
                      </div>

                      <a
                        href={item.downloadUrl}
                        download
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#171D50] text-white text-xs font-medium rounded-full hover:bg-[#0f1338] transition-colors shrink-0 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download DRM-Free PDF</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Account Profile & Firebase Auth */}
        {activeTab === 'auth' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-left">
            {currentUser ? (
              /* Signed in profile view */
              <div className="space-y-6">
                <div className="p-6 bg-[#FAF7F0] border border-[#EBE6DF] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#171D50] text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-editorial text-lg text-[#171923]">
                        {currentUser.displayName || 'Reader Account'}
                      </h4>
                      <div className="text-xs text-[#686B78]">{currentUser.email}</div>
                      <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        Role: {userProfile?.role || 'customer'} · Verified Session
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={logoutUser}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#E8E9F0] hover:border-rose-300 text-rose-700 text-xs font-medium rounded-full transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                <div className="p-4 border border-[#E8E9F0] rounded-2xl text-xs space-y-2">
                  <div className="font-semibold text-[#171923]">Account Privileges</div>
                  <p className="text-[#686B78] font-light leading-relaxed">
                    Your account grants synchronized digital library access across devices. DRM-free downloads remain bound to your verified reader credentials.
                  </p>
                </div>
              </div>
            ) : (
              /* Sign In / Sign Up Form */
              <div className="max-w-md mx-auto space-y-5">
                <div className="text-center space-y-1">
                  <h4 className="font-editorial text-2xl text-[#171923]">
                    {isReset ? 'Reset Your Password' : isSignUp ? 'Create Reader Account' : 'Welcome Back'}
                  </h4>
                  <p className="text-xs text-[#686B78]">
                    {isReset
                      ? 'Enter your email to receive a password reset link.'
                      : isSignUp
                      ? 'Register for lifetime access to your purchased digital editions.'
                      : 'Sign in to access your purchased publications and library.'}
                  </p>
                </div>

                {authError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-medium text-[#171923] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Farhan Mahmud"
                        className="w-full px-4 py-2.5 text-xs border border-[#E8E9F0] rounded-xl focus:border-[#171D50] focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#171923] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 text-xs border border-[#E8E9F0] rounded-xl focus:border-[#171D50] focus:outline-none"
                    />
                  </div>

                  {!isReset && (
                    <div>
                      <label className="block text-xs font-medium text-[#171923] mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 text-xs border border-[#E8E9F0] rounded-xl focus:border-[#171D50] focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-[#171D50] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer shadow-xs"
                  >
                    {authLoading
                      ? 'Processing...'
                      : isReset
                      ? 'Send Reset Link'
                      : isSignUp
                      ? 'Register Account'
                      : 'Sign In to Account'}
                  </button>
                </form>

                <div className="flex items-center justify-between text-xs text-[#686B78] pt-2">
                  {!isReset ? (
                    <>
                      <button
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setAuthError(null);
                        }}
                        className="hover:text-[#171D50] underline cursor-pointer"
                      >
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                      </button>
                      <button
                        onClick={() => {
                          setIsReset(true);
                          setAuthError(null);
                        }}
                        className="hover:text-[#171D50] underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsReset(false);
                        setAuthError(null);
                      }}
                      className="hover:text-[#171D50] underline cursor-pointer mx-auto"
                    >
                      ← Back to Sign In
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
