import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { AuthorSalesData, Book } from '../../types';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  Lock,
  LogOut,
  Mail,
  PenTool,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';

interface AuthorDashboardProps {
  onBackToStore: () => void;
  onOpenPublish: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup', reason?: string) => void;
}

type DashboardTab = 'books' | 'sales' | 'profile';

export const AuthorDashboard: React.FC<AuthorDashboardProps> = ({
  onBackToStore,
  onOpenPublish,
  onOpenAuth,
}) => {
  const {
    currentUser,
    userProfile,
    authLoading,
    myPublishedBooks,
    setSelectedBook,
    updatePublishedBook,
    deletePublishedBook,
    fetchAuthorSalesStats,
    updateUserProfile,
    logoutUser,
    logoIconColor,
  } = useStore();

  const [activeTab, setActiveTab] = useState<DashboardTab>('books');
  const [salesData, setSalesData] = useState<AuthorSalesData>({
    summary: {
      totalBooks: 0,
      totalUnitsSold: 0,
      totalRevenueBDT: 0,
      totalDownloads: 0,
    },
    perBookStats: [],
    recentSales: [],
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Uploaded books filters & inline actions
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Quick edit state
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState<'Personal Growth' | 'Mindset' | 'Productivity' | 'Fiction'>('Personal Growth');
  const [editPricingMode, setEditPricingMode] = useState<'free' | 'paid'>('free');
  const [editPrice, setEditPrice] = useState('0');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [penName, setPenName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPenName(userProfile.penName || '');
      setPhone(userProfile.phone || '');
      setLocation(userProfile.location || '');
      setWebsite(userProfile.website || '');
      setBio(userProfile.bio || '');
    } else if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
  }, [userProfile, currentUser]);

  const loadStats = useCallback(async () => {
    if (!currentUser) return;
    setLoadingStats(true);
    setStatsError(null);
    try {
      const data = await fetchAuthorSalesStats();
      setSalesData(data);
    } catch (err: any) {
      setStatsError(err?.message || 'Could not load sales statistics.');
    } finally {
      setLoadingStats(false);
    }
  }, [currentUser, fetchAuthorSalesStats]);

  useEffect(() => {
    if (currentUser) {
      loadStats();
    }
  }, [currentUser, myPublishedBooks.length, loadStats]);

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setEditTitle(book.title);
    setEditSubtitle(book.subtitle || '');
    setEditCategory(book.category);
    setEditPricingMode(book.price === 0 ? 'free' : 'paid');
    setEditPrice(String(book.price));
    setEditDescription(book.description);
  };

  const handleSaveBookEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    setSavingEdit(true);
    try {
      const nextPrice =
        editPricingMode === 'free' ? 0 : Math.max(1, Math.round(Number(editPrice) || 1));
      await updatePublishedBook(editingBook.id, {
        title: editTitle,
        subtitle: editSubtitle,
        category: editCategory,
        pricingMode: editPricingMode,
        price: nextPrice,
        description: editDescription,
      });
      setEditingBook(null);
      await loadStats();
    } catch {
      // handled cleanly in context or inline
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async (bookId: string) => {
    setDeletingId(bookId);
    try {
      await deletePublishedBook(bookId);
      setConfirmDeleteId(null);
      await loadStats();
    } finally {
      setDeletingId(null);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);
    setProfileError(null);
    setSavingProfile(true);
    try {
      await updateUserProfile({
        displayName,
        penName,
        phone,
        location,
        website,
        bio,
      });
      setProfileStatus('Your author profile settings have been saved.');
    } catch (err: any) {
      setProfileError(err?.message || 'Unable to save profile settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Auth Loading State
  if (authLoading) {
    return (
      <section className="w-full min-h-[calc(100vh-80px)] bg-[#F5F4EF] py-16 px-4 sm:px-6">
        <div className="max-w-[1160px] mx-auto space-y-6">
          <div className="h-8 w-56 bg-black/[0.06] rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white border border-black/[0.08] rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-72 bg-white border border-black/[0.08] rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  // Strict Private Access Gate when logged out
  if (!currentUser) {
    return (
      <section className="w-full min-h-[calc(100vh-80px)] bg-[#F5F4EF] py-14 sm:py-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white border border-black/[0.08] rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F5F4EF] border border-black/[0.08] flex items-center justify-center text-[#171D50]">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#D97706] font-extrabold">
              Private Author Workspace
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#171923] leading-[1.1]">
              Sign In to Access Your{' '}
              <span className="font-editorial italic font-bold text-[#171D50]">
                Author Dashboard
              </span>
            </h1>
            <p className="text-sm text-[#575A66] leading-relaxed">
              Manage your uploaded ebooks, track verified reader sales and downloads, and update your author profile once signed in.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                onOpenAuth('signin', 'Sign in to open your private Author Dashboard.')
              }
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#171D50] text-white text-xs sm:text-sm font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() =>
                onOpenAuth('signup', 'Create an account to publish and track your ebooks.')
              }
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-white text-[#171923] border border-black/[0.12] hover:border-[#171D50] text-xs sm:text-sm font-semibold rounded-full transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 text-xs text-[#686B78] hover:text-[#171D50] underline cursor-pointer pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Bookstore</span>
          </button>
        </div>
      </section>
    );
  }

  const authorDisplay =
    userProfile?.penName ||
    userProfile?.displayName ||
    currentUser.displayName ||
    currentUser.email?.split('@')[0] ||
    'Independent Author';

  const statsMap = new Map(salesData.perBookStats.map((s) => [s.bookId, s]));

  const filteredBooks = myPublishedBooks.filter((book) => {
    const matchesCategory = categoryFilter === 'All' || book.category === categoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.category.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const maxBookRevenue = Math.max(
    1,
    ...salesData.perBookStats.map((item) => item.revenueBDT)
  );

  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] bg-[#F5F4EF] py-8 sm:py-12 overflow-hidden">
      {/* Subtle Brand Crest Watermark */}
      <img
        src={logoIconColor}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none fixed -right-16 bottom-6 w-80 h-80 opacity-[0.03] hidden lg:block"
      />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Utility Navigation & Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#575A66] hover:text-[#171D50] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Bookstore</span>
            </button>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171923] tracking-[-0.035em]">
                Author <span className="font-editorial italic font-bold text-[#171D50]">Dashboard</span>
              </h1>
              <span className="text-xs sm:text-sm text-[#686B78]">
                Signed in as <strong className="text-[#171923] font-medium">{authorDisplay}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadStats}
              disabled={loadingStats}
              className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 bg-white text-[#171923] border border-black/[0.08] hover:border-[#171D50] text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
              <span>{loadingStats ? 'Syncing...' : 'Refresh Stats'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenPublish}
              className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer shadow-2xs"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Publish New Ebook</span>
            </button>
          </div>
        </div>

        {/* 4-Metric Real Telemetry KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-black/[0.08] rounded-2xl p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] font-semibold text-[#686B78]">
              <span>Uploaded Books</span>
              <BookOpen className="w-3.5 h-3.5 text-[#171D50]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171923] tabular-nums">
              {myPublishedBooks.length}
            </div>
            <p className="text-[11px] text-[#686B78]">Live in public catalogue</p>
          </div>

          <div className="bg-white border border-black/[0.08] rounded-2xl p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] font-semibold text-[#686B78]">
              <span>Units Sold</span>
              <ShoppingBag className="w-3.5 h-3.5 text-[#171D50]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171923] tabular-nums">
              {salesData.summary.totalUnitsSold.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#686B78]">Verified reader orders</p>
          </div>

          <div className="bg-white border border-black/[0.08] rounded-2xl p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] font-semibold text-[#686B78]">
              <span>Gross Revenue</span>
              <BarChart3 className="w-3.5 h-3.5 text-[#171D50]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171923] tabular-nums">
              ৳{salesData.summary.totalRevenueBDT.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#686B78]">Total BDT sales value</p>
          </div>

          <div className="bg-white border border-black/[0.08] rounded-2xl p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] font-semibold text-[#686B78]">
              <span>PDF Downloads</span>
              <Download className="w-3.5 h-3.5 text-[#171D50]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171923] tabular-nums">
              {salesData.summary.totalDownloads.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#686B78]">Fulfilled digital copies</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
          <div className="border-b border-black/[0.08] px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('books')}
              className={`min-h-[48px] px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'books'
                  ? 'border-[#171D50] text-[#171D50]'
                  : 'border-transparent text-[#686B78] hover:text-[#171923]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Uploaded Books ({myPublishedBooks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`min-h-[48px] px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'sales'
                  ? 'border-[#171D50] text-[#171D50]'
                  : 'border-transparent text-[#686B78] hover:text-[#171923]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Sales Statistics ({salesData.recentSales.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`min-h-[48px] px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-[#171D50] text-[#171D50]'
                  : 'border-transparent text-[#686B78] hover:text-[#171923]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>
          </div>

          {statsError && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {statsError}
            </div>
          )}

          {/* TAB 1: UPLOADED BOOKS */}
          {activeTab === 'books' && (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#686B78] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your uploaded books by title or ISBN..."
                    className="w-full min-h-[42px] pl-10 pr-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter books by category"
                  className="min-h-[42px] px-3.5 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none text-[#171923]"
                >
                  <option value="All">All Categories</option>
                  <option value="Personal Growth">Personal Growth</option>
                  <option value="Mindset">Mindset</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Fiction">Fiction</option>
                </select>
              </div>

              {myPublishedBooks.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-4 border border-dashed border-black/[0.12] rounded-2xl bg-[#FAFAFC]">
                  <div className="w-11 h-11 mx-auto rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-[#171D50]">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#171923]">
                      No Uploaded Ebooks Yet
                    </h2>
                    <p className="text-xs text-[#575A66] leading-relaxed">
                      Publish your first digital volume in the Publishing Studio. Once live, your ebook appears in the storefront and sales analytics begin tracking here automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenPublish}
                    className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2.5 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Publish Your First Ebook</span>
                  </button>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#686B78]">
                  No uploaded books match your current search filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/[0.08] text-[11px] uppercase tracking-[0.12em] text-[#686B78]">
                        <th className="py-3 pr-4 font-semibold">Edition</th>
                        <th className="py-3 px-3 font-semibold">Category</th>
                        <th className="py-3 px-3 font-semibold text-right">Price</th>
                        <th className="py-3 px-3 font-semibold text-right">Sold</th>
                        <th className="py-3 px-3 font-semibold text-right">Downloads</th>
                        <th className="py-3 px-3 font-semibold text-right">Revenue</th>
                        <th className="py-3 pl-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.06] text-xs">
                      {filteredBooks.map((book) => {
                        const stat = statsMap.get(book.id);
                        return (
                          <tr key={book.id} className="hover:bg-[#FAFAFC] transition-colors">
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-3 min-w-[200px]">
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  className="w-10 h-14 object-cover rounded-md border border-black/[0.08] shrink-0 bg-[#171D50]"
                                />
                                <div className="min-w-0">
                                  <div className="font-editorial text-sm font-medium text-[#171923] truncate max-w-[230px]">
                                    {book.title}
                                  </div>
                                  <div className="text-[11px] text-[#686B78] truncate">
                                    {book.pages} pages · {book.format} · {book.language}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-[#575A66] whitespace-nowrap">
                              {book.category}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                              {book.price === 0 ? (
                                <span className="font-semibold text-emerald-700">Free</span>
                              ) : (
                                <span className="font-semibold text-[#171923]">৳{book.price.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#171923]">
                              {stat?.unitsSold ?? 0}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#171923]">
                              {stat?.downloadsCount ?? 0}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono tabular-nums font-medium text-[#171923] whitespace-nowrap">
                              ৳{(stat?.revenueBDT ?? 0).toLocaleString()}
                            </td>
                            <td className="py-3.5 pl-4 text-right">
                              {confirmDeleteId === book.id ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={deletingId === book.id}
                                    onClick={() => handleConfirmDelete(book.id)}
                                    className="px-2.5 py-1.5 bg-rose-600 text-white text-[11px] font-semibold rounded-full hover:bg-rose-700 cursor-pointer"
                                  >
                                    {deletingId === book.id ? 'Deleting...' : 'Confirm'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2.5 py-1.5 bg-[#F5F4EF] text-[#171923] text-[11px] font-semibold rounded-full hover:bg-black/10 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBook(book)}
                                    title="Preview in Store"
                                    aria-label={`Inspect ${book.title}`}
                                    className="p-2 text-[#575A66] hover:text-[#171D50] hover:bg-[#F5F4EF] rounded-full transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(book)}
                                    title="Edit Ebook Details"
                                    aria-label={`Edit ${book.title}`}
                                    className="p-2 text-[#575A66] hover:text-[#171D50] hover:bg-[#F5F4EF] rounded-full transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(book.id)}
                                    title="Delete Ebook"
                                    aria-label={`Delete ${book.title}`}
                                    className="p-2 text-[#575A66] hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SALES STATISTICS */}
          {activeTab === 'sales' && (
            <div className="p-4 sm:p-6 space-y-8">
              {/* Per-Book Sales Performance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#171923]">
                    Sales Breakdown by Publication
                  </h2>
                  <span className="text-xs text-[#686B78] tabular-nums">
                    {salesData.perBookStats.length} active titles
                  </span>
                </div>

                {salesData.perBookStats.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#686B78] border border-dashed border-black/[0.1] rounded-2xl bg-[#FAFAFC]">
                    Publish an ebook to start tracking per-title sales, revenue, and download counts.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {salesData.perBookStats.map((item) => {
                      const sharePct =
                        salesData.summary.totalRevenueBDT > 0
                          ? Math.round((item.revenueBDT / maxBookRevenue) * 100)
                          : 0;
                      return (
                        <div
                          key={item.bookId}
                          className="p-4 bg-[#FAFAFC] border border-black/[0.06] rounded-xl space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="font-editorial text-base text-[#171923]">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-[#686B78]">
                                {item.category} · {item.priceBDT === 0 ? 'Free' : `৳${item.priceBDT.toLocaleString()}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-5 text-xs font-mono tabular-nums">
                              <div className="text-right">
                                <span className="block text-[10px] uppercase font-sans text-[#686B78]">
                                  Sold
                                </span>
                                <span className="font-semibold text-[#171923]">
                                  {item.unitsSold}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="block text-[10px] uppercase font-sans text-[#686B78]">
                                  Downloads
                                </span>
                                <span className="font-semibold text-[#171923]">
                                  {item.downloadsCount}
                                </span>
                              </div>
                              <div className="text-right min-w-[72px]">
                                <span className="block text-[10px] uppercase font-sans text-[#686B78]">
                                  Revenue
                                </span>
                                <span className="font-semibold text-[#171D50]">
                                  ৳{item.revenueBDT.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {salesData.summary.totalRevenueBDT > 0 && (
                            <div className="h-1.5 w-full bg-black/[0.06] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#171D50] rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(4, sharePct)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Verified Orders Ledger */}
              <div className="space-y-3 pt-4 border-t border-black/[0.08]">
                <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#171923]">
                  Recent Verified Orders
                </h2>

                {salesData.recentSales.length === 0 ? (
                  <div className="py-10 px-4 text-center border border-dashed border-black/[0.1] rounded-2xl bg-[#FAFAFC] space-y-2">
                    <p className="text-sm font-medium text-[#171923]">
                      No verified purchases recorded yet
                    </p>
                    <p className="text-xs text-[#686B78] max-w-md mx-auto leading-relaxed">
                      Real-time line items appear here automatically whenever a reader completes checkout for one of your published editions.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-black/[0.08] text-[11px] uppercase tracking-[0.12em] text-[#686B78]">
                          <th className="py-3 pr-4 font-semibold">Order #</th>
                          <th className="py-3 px-3 font-semibold">Publication</th>
                          <th className="py-3 px-3 font-semibold">Reader</th>
                          <th className="py-3 px-3 font-semibold text-right">Qty</th>
                          <th className="py-3 px-3 font-semibold text-right">Amount</th>
                          <th className="py-3 pl-4 font-semibold text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.06] text-xs">
                        {salesData.recentSales.map((sale, idx) => (
                          <tr key={`${sale.orderNumber}-${idx}`} className="hover:bg-[#FAFAFC]">
                            <td className="py-3 pr-4 font-mono tabular-nums font-medium text-[#171D50] whitespace-nowrap">
                              {sale.orderNumber}
                            </td>
                            <td className="py-3 px-3 text-[#171923] font-medium">
                              {sale.bookTitle}
                            </td>
                            <td className="py-3 px-3 text-[#575A66]">{sale.buyerName}</td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#171923]">
                              {sale.quantity}
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-[#171923] whitespace-nowrap">
                              ৳{sale.amountBDT.toLocaleString()}
                            </td>
                            <td className="py-3 pl-4 text-right font-mono tabular-nums text-[#686B78] whitespace-nowrap">
                              {new Date(sale.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="p-4 sm:p-6">
              <div className="max-w-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-black/[0.08]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#171D50] text-white flex items-center justify-center font-editorial text-lg shrink-0">
                      {authorDisplay[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#171923]">
                        {authorDisplay}
                      </div>
                      <div className="text-xs text-[#686B78] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{currentUser.email}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await logoutUser();
                      onBackToStore();
                    }}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 bg-white text-rose-700 border border-black/[0.08] hover:border-rose-300 text-xs font-semibold rounded-full transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {profileError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    {profileError}
                  </div>
                )}
                {profileStatus && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileStatus}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#171923] mb-1">
                        Full Name <span className="text-[#686B78] font-normal">(Optional)</span>
                      </label>
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
                      <label className="block text-xs font-medium text-[#171923] mb-1">
                        Pen / Author Name <span className="text-[#686B78] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={penName}
                        onChange={(e) => setPenName(e.target.value)}
                        placeholder="Name displayed on published books"
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
                        placeholder="+880..."
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
                        placeholder="Dhaka, Bangladesh"
                        maxLength={120}
                        className="w-full min-h-[42px] px-4 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#171923] mb-1">
                        Website / Portfolio URL <span className="text-[#686B78] font-normal">(Optional)</span>
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
                        Author Bio <span className="text-[#686B78] font-normal">(Optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Share a brief note about your writing..."
                        maxLength={500}
                        className="w-full px-4 py-2.5 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingProfile ? 'Saving...' : 'Save Profile Settings'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Edit Book Modal */}
      {editingBook && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.08] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
              <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#171923]">
                Edit Ebook Details
              </h2>
              <button
                type="button"
                onClick={() => setEditingBook(null)}
                aria-label="Close edit dialog"
                className="p-2 text-[#686B78] hover:text-[#171923] rounded-full hover:bg-[#F5F4EF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBookEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#171923] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={180}
                  className="w-full min-h-[42px] px-3.5 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171923] mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  maxLength={240}
                  className="w-full min-h-[42px] px-3.5 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171923] mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) =>
                    setEditCategory(
                      e.target.value as 'Personal Growth' | 'Mindset' | 'Productivity' | 'Fiction'
                    )
                  }
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none"
                >
                  <option value="Personal Growth">Personal Growth</option>
                  <option value="Mindset">Mindset</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Fiction">Fiction</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-medium text-[#171923]">
                  Edition Pricing Mode
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditPricingMode('free');
                      setEditPrice('0');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      editPricingMode === 'free'
                        ? 'border-emerald-600 bg-emerald-50/70'
                        : 'border-[#E8E9F0] bg-[#FAFAFC] hover:border-black/20'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#171923]">Free Edition</div>
                    <div className="text-[11px] font-mono text-emerald-700 font-semibold">৳0 · Instant PDF</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditPricingMode('paid');
                      if (!editPrice || Number(editPrice) <= 0) {
                        setEditPrice('199');
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      editPricingMode === 'paid'
                        ? 'border-[#171D50] bg-[#171D50]/[0.04]'
                        : 'border-[#E8E9F0] bg-[#FAFAFC] hover:border-black/20'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#171923]">Paid Edition</div>
                    <div className="text-[11px] font-mono text-[#171D50] font-semibold">
                      {editPricingMode === 'paid' ? `৳${Number(editPrice) || 0}` : 'Set BDT Price'}
                    </div>
                  </button>
                </div>

                {editPricingMode === 'paid' && (
                  <div>
                    <label className="block text-[11px] font-medium text-[#575A66] mb-1">
                      Price in BDT (min ৳1)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100000}
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full min-h-[42px] px-3.5 py-2 text-xs font-semibold bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none font-mono tabular-nums"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171923] mb-1">
                  Synopsis
                </label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  maxLength={5000}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFC] border border-[#E8E9F0] rounded-xl focus:bg-white focus:border-[#171D50] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="min-h-[40px] px-4 py-2 text-xs font-semibold text-[#575A66] hover:text-[#171923] rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="min-h-[40px] px-5 py-2 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] cursor-pointer"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
