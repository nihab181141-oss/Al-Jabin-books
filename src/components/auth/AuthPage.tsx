import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  Feather,
  LogOut,
  Mail,
  PenTool,
  Save,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from 'lucide-react';

interface AuthPageProps {
  onBackToStore: () => void;
  onOpenPublish: () => void;
  redirectReason?: string | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onBackToStore,
  onOpenPublish,
  redirectReason,
}) => {
  const {
    currentUser,
    userProfile,
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    updateUserProfile,
    resetUserPassword,
    logoutUser,
    userLibrary,
    myPublishedBooks,
    setSelectedBook,
    deletePublishedBook,
    logoStackedColor,
    logoIconColor,
  } = useStore();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Optional profile record fields on registration & profile editing
  const [displayName, setDisplayName] = useState('');
  const [penName, setPenName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPenName(userProfile.penName || '');
      setPhone(userProfile.phone || '');
      setLocation(userProfile.location || '');
      setBio(userProfile.bio || '');
      setWebsite(userProfile.website || '');
    }
  }, [userProfile]);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/operation-not-allowed') {
      return 'Email/Password sign-in is currently disabled in Firebase Console. Use "Continue with Google" below, or enable Email/Password under Firebase Console → Authentication → Sign-in method.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists. Switch to Sign In instead.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'Invalid email or password. Please verify and try again.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in window closed before completing authentication.';
    }
    return err?.message || 'Unable to complete authentication.';
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'reset') {
        if (!email.trim()) throw new Error('Please enter your account email address.');
        await resetUserPassword(email.trim());
        setStatusMsg('Password reset instructions have been sent to your email.');
        setMode('signin');
      } else if (mode === 'signup') {
        if (!email.trim() || !password) {
          throw new Error('Please enter an email address and a password (min 6 characters).');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await registerWithEmail(email.trim(), password, {
          displayName,
          penName,
          phone,
          location,
          bio,
          website,
        });
      } else {
        if (!email.trim() || !password) {
          throw new Error('Please enter both your email address and password.');
        }
        await loginWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);
    setSubmitting(true);
    try {
      await updateUserProfile({
        displayName,
        penName,
        phone,
        location,
        bio,
        website,
      });
      setStatusMsg('Your profile records have been updated.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] bg-[#F5F4EF] py-10 sm:py-14 lg:py-16 overflow-hidden">
      {/* Subtle Brand Icon Watermark */}
      <img
        src={logoIconColor}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none fixed -right-16 bottom-6 w-80 h-80 opacity-[0.035] hidden md:block"
      />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Back Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-xs font-semibold text-[#171D50] hover:bg-white rounded-full border border-black/[0.08] bg-white/70 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bookstore</span>
          </button>

          {currentUser && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenPublish}
                className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer shadow-xs"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Publish an Ebook</span>
              </button>
              <button
                type="button"
                onClick={logoutUser}
                className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 bg-white text-rose-700 border border-black/[0.08] hover:border-rose-300 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Split View */}
        {!currentUser ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* LEFT COLUMN: Official Crest & Author / Reader Benefits */}
            <div className="lg:col-span-5 space-y-7 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <img
                  src={logoStackedColor}
                  alt="Al Jabin Publications"
                  className="w-36 sm:w-44 h-auto object-contain select-none"
                />
              </div>

              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-[0.22em] text-[#686B78] font-semibold">
                  Reader & Author Sanctuary
                </div>
                <h1
                  className="font-editorial text-3xl sm:text-4xl text-[#171923] font-normal leading-[1.18]"
                  style={{ textWrap: 'balance' }}
                >
                  Read Permanently.{' '}
                  <span className="italic text-[#171D50]">Publish Independently.</span>
                </h1>
                <p className="text-sm text-[#575A66] leading-relaxed">
                  Create your free Al Jabin Publications account to store your digital library across devices or publish your own ebooks directly to the storefront.
                </p>
              </div>

              <div className="pt-4 border-t border-black/[0.08] space-y-3.5 text-left max-w-md mx-auto lg:mx-0">
                <div className="flex items-start gap-3">
                  <Feather className="w-4 h-4 text-[#171D50] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#575A66] leading-relaxed">
                    <span className="font-semibold text-[#171923]">Self-Publish Your Ebooks:</span>{' '}
                    Upload your own manuscript or write chapters directly, set your price (or offer it free), and reach readers right away.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#171D50] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#575A66] leading-relaxed">
                    <span className="font-semibold text-[#171923]">Optional Profile Records:</span>{' '}
                    Name, pen name, phone number, city, and author bio are completely optional and editable anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Dedicated Auth Form Card */}
            <div className="lg:col-span-7 bg-white border border-black/[0.07] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
              {redirectReason && (
                <div className="p-3.5 bg-[#FAF7F0] border border-[#E6DFCF] text-[#171D50] text-xs rounded-2xl flex items-center gap-2.5">
                  <PenTool className="w-4 h-4 shrink-0" />
                  <span>{redirectReason}</span>
                </div>
              )}

              {/* Switcher Tabs */}
              {mode !== 'reset' && (
                <div className="flex p-1 bg-[#F5F4EF] rounded-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                      setStatusMsg(null);
                    }}
                    className={`flex-1 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                      mode === 'signup'
                        ? 'bg-[#171D50] text-white shadow-xs'
                        : 'text-[#686B78] hover:text-[#171923]'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                      setStatusMsg(null);
                    }}
                    className={`flex-1 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                      mode === 'signin'
                        ? 'bg-[#171D50] text-white shadow-xs'
                        : 'text-[#686B78] hover:text-[#171923]'
                    }`}
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div className="space-y-1">
                <h2 className="font-editorial text-2xl sm:text-3xl text-[#171923]">
                  {mode === 'reset'
                    ? 'Reset Your Password'
                    : mode === 'signup'
                    ? 'Open Your Author & Reader Account'
                    : 'Welcome Back'}
                </h2>
                <p className="text-xs text-[#686B78]">
                  {mode === 'reset'
                    ? 'Enter your email address to receive a password recovery link.'
                    : mode === 'signup'
                    ? 'Enter your credentials below. All additional profile records are optional.'
                    : 'Sign in with Google or your registered email and password.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {statusMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{statusMsg}</span>
                </div>
              )}

              {/* Quick Google Auth */}
              {mode !== 'reset' && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={googleLoading}
                    className="w-full min-h-[46px] px-5 py-3 bg-white border border-black/[0.12] hover:border-[#171D50] text-[#171923] text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer flex items-center justify-center gap-3 shadow-2xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                    <span>
                      {googleLoading
                        ? 'Connecting to Google...'
                        : mode === 'signup'
                        ? 'Sign Up Instantly with Google'
                        : 'Continue with Google'}
                    </span>
                  </button>

                  <div className="relative flex items-center py-1">
                    <div className="flex-1 border-t border-black/[0.08]" />
                    <span className="px-3 text-[11px] uppercase tracking-wider text-[#686B78]">
                      or with email
                    </span>
                    <div className="flex-1 border-t border-black/[0.08]" />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={mode === 'reset' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-[#171923] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                    />
                  </div>

                  {mode !== 'reset' && (
                    <div>
                      <label className="block text-xs font-medium text-[#171923] mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Optional Account & Author Profile Fields */}
                {mode === 'signup' && (
                  <div className="pt-3 border-t border-black/[0.07] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-[#686B78] font-semibold">
                        Author & Reader Details (All Optional)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#171923] mb-1">
                          Full Name <span className="text-[#686B78] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g., Abdullah Al Jabin"
                          maxLength={120}
                          className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#171923] mb-1">
                          Pen / Author Name <span className="text-[#686B78] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={penName}
                          onChange={(e) => setPenName(e.target.value)}
                          placeholder="Name shown on published ebooks"
                          maxLength={120}
                          className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#171923] mb-1">
                          Phone / WhatsApp <span className="text-[#686B78] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g., +880 1XXX-XXXXXX"
                          maxLength={40}
                          className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#171923] mb-1">
                          City / Country <span className="text-[#686B78] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g., Dhaka, Bangladesh"
                          maxLength={120}
                          className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-[#171923] mb-1">
                          Website or Social Link <span className="text-[#686B78] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://..."
                          maxLength={256}
                          className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-[#171923] mb-1">
                          Short Bio <span className="text-[#686B78] font-normal">(Optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Share a brief note about your reading interests or writing focus..."
                          maxLength={500}
                          className="w-full px-4 py-2.5 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[46px] px-6 py-3 bg-[#171D50] text-white text-xs sm:text-sm font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>
                    {submitting
                      ? 'Processing...'
                      : mode === 'reset'
                      ? 'Send Password Reset Link'
                      : mode === 'signup'
                      ? 'Create Account & Continue'
                      : 'Sign In to Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#686B78] pt-2 border-t border-black/[0.06]">
                {mode !== 'reset' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'signup' ? 'signin' : 'signup');
                        setErrorMsg(null);
                      }}
                      className="hover:text-[#171D50] underline cursor-pointer"
                    >
                      {mode === 'signup'
                        ? 'Already have an account? Sign in'
                        : 'Need an account? Create one'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setErrorMsg(null);
                      }}
                      className="hover:text-[#171D50] underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                    }}
                    className="hover:text-[#171D50] underline cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* SIGNED-IN ACCOUNT PROFILE, SELF-PUBLISHING STUDIO SHORTCUT & LIBRARY */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Account Summary + Profile Editor */}
            <div className="lg:col-span-7 bg-white border border-black/[0.07] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/[0.07]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#171D50] text-white flex items-center justify-center font-editorial text-xl">
                    {(userProfile?.displayName || currentUser.displayName || currentUser.email || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <h1 className="font-editorial text-2xl text-[#171923] leading-tight">
                      {userProfile?.displayName || currentUser.displayName || 'Al Jabin Member'}
                    </h1>
                    <div className="text-xs text-[#686B78] flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{currentUser.email}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenPublish}
                  className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2.5 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Publish New Ebook</span>
                </button>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#171923] flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-[#171D50]" />
                    <span>Author & Reader Profile Records</span>
                  </h2>
                  <span className="text-[11px] text-[#686B78]">All fields optional</span>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    {errorMsg}
                  </div>
                )}
                {statusMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{statusMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#171923] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your full name"
                      maxLength={120}
                      className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171923] mb-1">Pen / Author Name</label>
                    <input
                      type="text"
                      value={penName}
                      onChange={(e) => setPenName(e.target.value)}
                      placeholder="Public author name"
                      maxLength={120}
                      className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171923] mb-1">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880..."
                      maxLength={40}
                      className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171923] mb-1">City / Country</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      maxLength={120}
                      className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#171923] mb-1">Website / Portfolio</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      maxLength={256}
                      className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#171923] mb-1">Short Author Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell readers about your work..."
                      maxLength={500}
                      className="w-full px-4 py-2.5 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 min-h-[42px] px-6 py-2.5 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </form>
            </div>

            {/* Right Column: User's Published Ebooks + Purchased Library */}
            <div className="lg:col-span-5 space-y-6">
              {/* Self-Published Books Card */}
              <div className="bg-white border border-black/[0.07] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-editorial text-xl text-[#171923]">My Published Ebooks</h2>
                  <span className="text-xs font-semibold text-[#686B78] tabular-nums">
                    {myPublishedBooks.length}
                  </span>
                </div>

                {myPublishedBooks.length === 0 ? (
                  <div className="space-y-3 py-2">
                    <p className="text-xs text-[#686B78] leading-relaxed">
                      You have not published any ebooks yet. Upload your manuscript or write chapters in the Publishing Studio.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenPublish}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F4EF] hover:bg-[#171D50] text-[#171D50] hover:text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Write or Upload Ebook</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myPublishedBooks.map((book) => (
                      <div
                        key={book.id}
                        className="p-3.5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div
                          onClick={() => {
                            onBackToStore();
                            setSelectedBook(book);
                          }}
                          className="flex items-center gap-3 min-w-0 cursor-pointer"
                        >
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded-md shrink-0 bg-[#171D50]"
                          />
                          <div className="min-w-0">
                            <div className="font-editorial text-sm font-medium text-[#171923] truncate">
                              {book.title}
                            </div>
                            <div className="text-[11px] text-[#686B78] tabular-nums">
                              {book.category} · {book.price === 0 ? 'Free' : `৳${book.price}`}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => deletePublishedBook(book.id)}
                          title="Unpublish ebook"
                          aria-label={`Remove ${book.title}`}
                          className="p-2 text-[#686B78] hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchased Library Card */}
              <div className="bg-white border border-black/[0.07] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-editorial text-xl text-[#171923] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#171D50]" />
                    <span>Purchased Digital Library</span>
                  </h2>
                  <span className="text-xs font-semibold text-[#686B78] tabular-nums">
                    {userLibrary.length}
                  </span>
                </div>

                {userLibrary.length === 0 ? (
                  <p className="text-xs text-[#686B78] leading-relaxed">
                    Ebooks you acquire from the catalogue appear here with DRM-free downloads.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {userLibrary.map((dl) => (
                      <div
                        key={dl.downloadId}
                        className="p-3.5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-editorial text-sm text-[#171923] truncate">
                            {dl.productTitle}
                          </div>
                          <div className="text-[11px] text-[#686B78] tabular-nums">
                            {dl.orderNumber} · {dl.downloadCount}/{dl.maxDownloads} downloads
                          </div>
                        </div>
                        <a
                          href={dl.downloadUrl}
                          download
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#171D50] text-white text-[11px] font-semibold rounded-full hover:bg-[#0f1338] transition-colors shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
