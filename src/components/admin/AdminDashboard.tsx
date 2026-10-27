import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Book, Coupon, Order, PaymentMethod } from '../../types';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Ticket,
  Mail,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Image,
  Key,
  X,
  Search,
  Check
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const {
    books,
    addBook,
    updateBook,
    deleteBook,
    clearAllBooks,
    resetBooksToDefault,
    orders,
    updateOrderStatus,
    clearAllOrders,
    coupons,
    addCoupon,
    toggleCoupon,
    subscribers,
    clearAllSubscribers,
    logoNavyOnWhite,
    logoWhiteOnNavy,
    setLogoNavyOnWhite,
    setLogoWhiteOnNavy,
    resetLogosToDefault,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'books' | 'orders' | 'coupons' | 'subscribers' | 'brand' | 'production'>('books');
  
  // Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Book Editing Modal State
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newBook, setNewBook] = useState<Partial<Book>>({
    title: '',
    subtitle: '',
    author: 'Al Jabin Publications',
    category: 'Mindset',
    price: 350,
    originalPrice: 450,
    discountPercentage: 20,
    isFeatured: false,
    isNewRelease: true,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    format: 'PDF & EPUB (DRM-Free)',
    fileSize: '7.5 MB',
    pages: 240,
    language: 'English',
    isbn: `978-984-09-${Math.floor(1000 + Math.random() * 9000)}-1`,
    publishedYear: 2026,
    description: '',
    keyTakeaways: ['Foundational mental clarity model', 'Practical operational daily review'],
    sampleChapters: [
      {
        title: 'Chapter 1: The First Principle',
        pageCount: 16,
        excerpt: 'Clarity begins where passive consensus concludes...',
      },
    ],
    downloadFileKey: 'ebook_release.pdf',
  });

  // Coupon Creation State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponMin, setNewCouponMin] = useState(500);

  // Logo edit state
  const [tempNavyLogo, setTempNavyLogo] = useState(logoNavyOnWhite);
  const [tempWhiteLogo, setTempWhiteLogo] = useState(logoWhiteOnNavy);

  if (!isOpen) return null;

  // Handle Demo Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      setAuthError('Please enter an administrator email.');
      return;
    }
    // Authenticate
    setIsAdminAuthenticated(true);
    showToast('Publisher session authenticated.');
  };

  const handleExportSubscribersCSV = () => {
    if (subscribers.length === 0) {
      showToast('No subscribers to export.');
      return;
    }
    const headers = 'ID,Email,SubscribedAt,Source\n';
    const rows = subscribers
      .map((s) => `"${s.id}","${s.email}","${s.subscribedAt}","${s.source}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aljabin_subscribers_${Date.now()}.csv`;
    a.click();
    showToast('Subscribers CSV exported.');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountPercentage: Number(newCouponDiscount),
      minSpend: Number(newCouponMin),
      description: `${newCouponDiscount}% discount on orders above ৳${newCouponMin}`,
      isActive: true,
    });
    setNewCouponCode('');
    showToast(`Created promo code ${newCouponCode.toUpperCase()}.`);
  };

  const totalRevenueBDT = orders.reduce((sum, o) => sum + (o.paymentStatus === 'verified' ? o.total : 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="relative bg-white w-full max-w-6xl shadow-2xl border border-[#E8E9F0] rounded-3xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#171D50] text-white">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-white/80" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/60">Publisher Backoffice</div>
              <h2 className="font-editorial text-lg text-white font-normal">
                Al Jabin Publications · Admin Console
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close admin dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If not authenticated, show secure authentication dialog */}
        {!isAdminAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto my-auto text-center space-y-6">
            <div className="w-12 h-12 bg-[#171D50]/10 text-[#171D50] rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="font-editorial text-2xl text-[#171923]">Publisher Authentication</h3>
              <p className="text-xs text-[#686B78] mt-1">
                Enter your administrative credentials to manage catalogue, orders, and digital delivery.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              {authError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-xs border border-rose-200 rounded-xl">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#171923] mb-1">
                  Administrator Email
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-xl"
                  placeholder="admin@aljabinpublications.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171923] mb-1">
                  Security Passkey / Password
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 text-xs border border-[#E8E9F0] focus:border-[#171D50] focus:outline-none rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#171D50] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0f1338] transition-colors cursor-pointer shadow-sm rounded-full"
              >
                Sign In to Dashboard
              </button>

              <div className="text-[11px] text-[#686B78] bg-gray-50 p-3 text-center border border-[#E8E9F0] rounded-xl">
                <span>Architecture Note: In production, configure server-side JWT or OAuth in </span>
                <span className="font-mono text-[10px]">server.ts</span>. Click sign in above for instant demonstration access.
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard Interface */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-56 bg-[#FAFAFC] border-b md:border-b-0 md:border-r border-[#E8E9F0] p-4 flex md:flex-col justify-between overflow-x-auto">
              <nav className="flex md:flex-col gap-1.5 text-xs">
                <button
                  onClick={() => setActiveTab('books')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-left transition-colors font-medium rounded-xl ${
                    activeTab === 'books'
                      ? 'bg-[#171D50] text-white shadow-xs'
                      : 'text-[#686B78] hover:text-[#171923] hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Books ({books.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-left transition-colors font-medium rounded-xl ${
                    activeTab === 'orders'
                      ? 'bg-[#171D50] text-white shadow-xs'
                      : 'text-[#686B78] hover:text-[#171923] hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-left transition-colors font-medium rounded-xl ${
                    activeTab === 'coupons'
                      ? 'bg-[#171D50] text-white shadow-xs'
                      : 'text-[#686B78] hover:text-[#171923] hover:bg-gray-100'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Coupons ({coupons.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('subscribers')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-left transition-colors font-medium rounded-xl ${
                    activeTab === 'subscribers'
                      ? 'bg-[#171D50] text-white shadow-xs'
                      : 'text-[#686B78] hover:text-[#171923] hover:bg-gray-100'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Subscribers ({subscribers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('brand')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-left transition-colors font-medium rounded-xl ${
                    activeTab === 'brand'
                      ? 'bg-[#171D50] text-white shadow-xs'
                      : 'text-[#686B78] hover:text-[#171923] hover:bg-gray-100'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span>Brand & Logos</span>
                </button>

                <button
                  onClick={() => setActiveTab('production')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-left transition-colors font-medium rounded-xl ${
                    activeTab === 'production'
                      ? 'bg-[#171D50] text-white shadow-xs'
                      : 'text-[#686B78] hover:text-[#171923] hover:bg-gray-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Production Setup</span>
                </button>
              </nav>

              <div className="hidden md:block pt-4 border-t border-[#E8E9F0] text-[11px] text-[#686B78]">
                <div>Logged in as:</div>
                <div className="font-semibold text-[#171923] truncate">{authEmail}</div>
                <button
                  onClick={() => setIsAdminAuthenticated(false)}
                  className="mt-2 text-rose-600 hover:underline text-[10px] block"
                >
                  Sign Out
                </button>
              </div>
            </aside>

            {/* Main Admin Workspace */}
            <main className="flex-1 overflow-y-auto p-6 bg-white">
              
              {/* TAB 1: BOOKS MANAGEMENT */}
              {activeTab === 'books' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E9F0]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#171923]">Catalogue Management</h3>
                      <p className="text-xs text-[#686B78]">
                        Add, edit, or adjust prices and digital files for publications.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {books.length > 0 && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to remove all books from the catalogue?')) {
                              clearAllBooks();
                            }
                          }}
                          className="px-4 py-2.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors self-start cursor-pointer rounded-full"
                        >
                          <span>Clear All Books</span>
                        </button>
                      )}
                      <button
                        onClick={() => setIsAddingBook(true)}
                        className="px-5 py-2.5 bg-[#171D50] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#0f1338] transition-colors flex items-center gap-1.5 self-start cursor-pointer rounded-full shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Publication</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Publication Form Modal with rounded-3xl */}
                  {isAddingBook && (
                    <div className="p-6 bg-[#FAFAFC] border border-[#171D50] rounded-3xl space-y-4 shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E9F0]">
                        <h4 className="font-editorial text-base text-[#171923] font-medium">
                          Add New Publication
                        </h4>
                        <button
                          onClick={() => setIsAddingBook(false)}
                          className="text-[#686B78] hover:text-[#171923] p-1 rounded-full hover:bg-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-[11px] font-medium mb-1">Book Title *</label>
                          <input
                            type="text"
                            value={newBook.title}
                            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                            className="w-full px-3.5 py-2 border border-[#E8E9F0] bg-white rounded-xl"
                            placeholder="e.g. The Focus Architecture"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium mb-1">Author Name *</label>
                          <input
                            type="text"
                            value={newBook.author}
                            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                            className="w-full px-3.5 py-2 border border-[#E8E9F0] bg-white rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium mb-1">Category *</label>
                          <select
                            value={newBook.category}
                            onChange={(e) => setNewBook({ ...newBook, category: e.target.value as any })}
                            className="w-full px-3.5 py-2 border border-[#E8E9F0] bg-white rounded-xl"
                          >
                            <option value="Mindset">Mindset</option>
                            <option value="Productivity">Productivity</option>
                            <option value="Personal Growth">Personal Growth</option>
                            <option value="Fiction">Fiction</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium mb-1">Price (BDT) *</label>
                          <input
                            type="number"
                            value={newBook.price}
                            onChange={(e) => setNewBook({ ...newBook, price: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 border border-[#E8E9F0] bg-white rounded-xl"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium mb-1">Cover Image URL *</label>
                          <input
                            type="url"
                            value={newBook.coverImage}
                            onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.value })}
                            className="w-full px-3.5 py-2 border border-[#E8E9F0] bg-white rounded-xl"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium mb-1">Description *</label>
                          <textarea
                            rows={3}
                            value={newBook.description}
                            onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                            className="w-full px-3.5 py-2 border border-[#E8E9F0] bg-white rounded-xl"
                            placeholder="Editorial synopsis of the volume..."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setIsAddingBook(false)}
                          className="px-5 py-2 border border-[#E8E9F0] text-xs rounded-full hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (!newBook.title || !newBook.author || !newBook.description) {
                              showToast('Please fill all required book fields.');
                              return;
                            }
                            addBook(newBook as any);
                            setIsAddingBook(false);
                          }}
                          className="px-6 py-2 bg-[#171D50] text-white text-xs font-semibold rounded-full shadow-xs hover:bg-[#0f1338]"
                        >
                          Save & Publish to Catalogue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Books List Table */}
                  <div className="border border-[#E8E9F0] overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAFAFC] border-b border-[#E8E9F0] text-[#686B78] uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Cover</th>
                          <th className="p-3">Title & Author</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Format</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E9F0]">
                        {books.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="p-3">
                              <img
                                src={b.coverImage}
                                alt={b.title}
                                className="w-9 h-12 object-cover bg-[#171D50] shadow-xs"
                              />
                            </td>
                            <td className="p-3">
                              <div className="font-editorial text-sm font-medium text-[#171923]">{b.title}</div>
                              <div className="text-[11px] text-[#686B78]">{b.author}</div>
                            </td>
                            <td className="p-3 text-[#686B78]">{b.category}</td>
                            <td className="p-3">
                              <span className="font-semibold text-[#171D50]">৳{b.price}</span>
                              {b.originalPrice && (
                                <span className="ml-1 text-[11px] text-[#686B78] line-through">
                                  ৳{b.originalPrice}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-[11px] text-[#686B78]">{b.format}</td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => setEditingBook(b)}
                                className="p-1.5 text-[#686B78] hover:text-[#171D50] border border-transparent hover:border-[#E8E9F0]"
                                title="Edit book"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove "${b.title}" from catalogue?`)) {
                                    deleteBook(b.id);
                                  }
                                }}
                                className="p-1.5 text-[#686B78] hover:text-rose-600 border border-transparent hover:border-[#E8E9F0]"
                                title="Delete book"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {books.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-xs text-[#686B78]">
                              No publications in catalogue. Click "Add Publication" to list your first title.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Edit Book Modal with rounded-3xl */}
                  {editingBook && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
                      <div className="bg-white p-6 max-w-lg w-full space-y-4 shadow-xl border border-[#E8E9F0] rounded-3xl">
                        <div className="flex items-center justify-between pb-2 border-b border-[#E8E9F0]">
                          <h4 className="font-editorial text-lg text-[#171923]">
                            Edit Publication: {editingBook.title}
                          </h4>
                          <button
                            onClick={() => setEditingBook(null)}
                            className="p-1 text-[#686B78] hover:text-[#171923] rounded-full hover:bg-gray-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block font-medium mb-1">Title</label>
                            <input
                              type="text"
                              value={editingBook.title}
                              onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                              className="w-full px-3.5 py-2 border border-[#E8E9F0] rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block font-medium mb-1">Price in BDT</label>
                            <input
                              type="number"
                              value={editingBook.price}
                              onChange={(e) => setEditingBook({ ...editingBook, price: Number(e.target.value) })}
                              className="w-full px-3.5 py-2 border border-[#E8E9F0] rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block font-medium mb-1">Cover Image URL</label>
                            <input
                              type="text"
                              value={editingBook.coverImage}
                              onChange={(e) => setEditingBook({ ...editingBook, coverImage: e.target.value })}
                              className="w-full px-3.5 py-2 border border-[#E8E9F0] rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block font-medium mb-1">Description</label>
                            <textarea
                              rows={3}
                              value={editingBook.description}
                              onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                              className="w-full px-3.5 py-2 border border-[#E8E9F0] rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditingBook(null)}
                            className="px-5 py-2 border border-[#E8E9F0] text-xs rounded-full hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              updateBook(editingBook);
                              setEditingBook(null);
                            }}
                            className="px-6 py-2 bg-[#171D50] text-white text-xs font-semibold rounded-full shadow-xs hover:bg-[#0f1338]"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E9F0]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#171923]">Order Records & Verification</h3>
                      <p className="text-xs text-[#686B78]">
                        Monitor incoming customer purchases, Bangladesh MFS payments (bKash/Nagad), and digital access tokens.
                      </p>
                    </div>
                    {orders.length > 0 && (
                      <button
                        onClick={clearAllOrders}
                        className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors self-start cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All Orders</span>
                      </button>
                    )}
                  </div>

                  {/* Metrics Banner with rounded-2xl cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl shadow-2xs">
                      <div className="text-[11px] uppercase tracking-wider text-[#686B78]">Total Verified Revenue</div>
                      <div className="text-2xl font-bold text-[#171D50] mt-1">৳{totalRevenueBDT} BDT</div>
                    </div>
                    <div className="p-5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl shadow-2xs">
                      <div className="text-[11px] uppercase tracking-wider text-[#686B78]">Total Digital Orders</div>
                      <div className="text-2xl font-bold text-[#171923] mt-1">{orders.length}</div>
                    </div>
                    <div className="p-5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl shadow-2xs">
                      <div className="text-[11px] uppercase tracking-wider text-[#686B78]">Digital Delivery Status</div>
                      <div className="text-2xl font-bold text-emerald-700 mt-1">100% Automated</div>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="border border-[#E8E9F0] rounded-2xl overflow-hidden shadow-2xs">
                    {orders.length === 0 ? (
                      <div className="text-center py-12 text-xs text-[#686B78]">
                        No orders recorded yet. Place a test order from the bookstore to inspect live records.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAFAFC] border-b border-[#E8E9F0] text-[#686B78] uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Items</th>
                            <th className="p-3">Total (BDT)</th>
                            <th className="p-3">MFS / Gateway</th>
                            <th className="p-3">TrxID / Token</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E9F0]">
                          {orders.map((o) => (
                            <tr key={o.id} className="hover:bg-gray-50/80">
                              <td className="p-3 font-mono font-bold text-[#171D50]">{o.id}</td>
                              <td className="p-3">
                                <div className="font-medium text-[#171923]">{o.customerName}</div>
                                <div className="text-[11px] text-[#686B78]">{o.customerEmail}</div>
                                <div className="text-[10px] text-[#686B78]">{o.customerPhone}</div>
                              </td>
                              <td className="p-3 text-[11px] text-[#686B78]">
                                {o.items.map((it) => it.title).join(', ')}
                              </td>
                              <td className="p-3 font-bold text-[#171923]">৳{o.total}</td>
                              <td className="p-3 uppercase text-[11px] font-medium">{o.paymentMethod}</td>
                              <td className="p-3 font-mono text-[10px] text-[#686B78]">
                                {o.transactionId || o.downloadAccessCode.substring(0, 10) + '...'}
                              </td>
                              <td className="p-3">
                                <select
                                  value={o.paymentStatus}
                                  onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                                  className={`px-2.5 py-1 text-[11px] font-semibold border rounded-full ${
                                    o.paymentStatus === 'verified'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : 'bg-amber-50 text-amber-800 border-amber-300'
                                  }`}
                                >
                                  <option value="verified">VERIFIED</option>
                                  <option value="pending">PENDING</option>
                                  <option value="failed">FAILED</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: COUPONS */}
              {activeTab === 'coupons' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-editorial text-2xl text-[#171923]">Promotional Coupon Codes</h3>
                    <p className="text-xs text-[#686B78]">
                      Create discount codes for marketing campaigns, reader launch events, and bundle deals.
                    </p>
                  </div>

                  {/* Create Coupon Form */}
                  <form onSubmit={handleCreateCoupon} className="p-5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl flex flex-wrap gap-3 items-end text-xs">
                    <div>
                      <label className="block text-[11px] font-medium mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. SUMMER25"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="px-3.5 py-2 uppercase font-mono border border-[#E8E9F0] bg-white rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1">Discount % *</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                        className="w-24 px-3.5 py-2 border border-[#E8E9F0] bg-white rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1">Min Spend (BDT)</label>
                      <input
                        type="number"
                        value={newCouponMin}
                        onChange={(e) => setNewCouponMin(Number(e.target.value))}
                        className="w-28 px-3.5 py-2 border border-[#E8E9F0] bg-white rounded-xl"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#171D50] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#0f1338] transition-colors"
                    >
                      Add Promo Code
                    </button>
                  </form>

                  {/* Coupons Table */}
                  <div className="border border-[#E8E9F0] rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAFAFC] border-b border-[#E8E9F0] text-[#686B78] uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Code</th>
                          <th className="p-3">Discount</th>
                          <th className="p-3">Min Spend</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E9F0]">
                        {coupons.map((c) => (
                          <tr key={c.code} className="hover:bg-gray-50/80">
                            <td className="p-3 font-mono font-bold text-[#171D50]">{c.code}</td>
                            <td className="p-3 font-semibold text-emerald-800">{c.discountPercentage}% OFF</td>
                            <td className="p-3 text-[#686B78]">৳{c.minSpend || 0} BDT</td>
                            <td className="p-3 text-[#686B78]">{c.description}</td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {c.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => toggleCoupon(c.code)}
                                className="text-xs text-[#171D50] hover:underline"
                              >
                                {c.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: SUBSCRIBERS */}
              {activeTab === 'subscribers' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E9F0]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#171923]">The Reader Dispatch List</h3>
                      <p className="text-xs text-[#686B78]">
                        List of verified reader email signups from the website newsletter module.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {subscribers.length > 0 && (
                        <button
                          onClick={clearAllSubscribers}
                          className="px-4 py-2.5 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear Subscribers</span>
                        </button>
                      )}
                      <button
                        onClick={handleExportSubscribersCSV}
                        className="px-5 py-2.5 border border-[#171D50] text-[#171D50] hover:bg-[#171D50] hover:text-white text-xs font-semibold rounded-full flex items-center gap-2 transition-colors self-start cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Subscribers (.CSV)</span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-[#E8E9F0] rounded-2xl overflow-hidden">
                    {subscribers.length === 0 ? (
                      <div className="text-center py-12 text-xs text-[#686B78]">
                        No newsletter subscribers recorded yet. Test the subscription form in the website footer.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAFAFC] border-b border-[#E8E9F0] text-[#686B78] uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3">Subscriber Email</th>
                            <th className="p-3">Date Subscribed</th>
                            <th className="p-3">Source Channel</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E9F0]">
                          {subscribers.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50/80">
                              <td className="p-3 font-medium text-[#171923]">{s.email}</td>
                              <td className="p-3 text-[#686B78]">
                                {new Date(s.subscribedAt).toLocaleString()}
                              </td>
                              <td className="p-3 text-[11px] text-[#686B78]">{s.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: BRAND & LOGOS */}
              {activeTab === 'brand' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-editorial text-2xl text-[#171923]">Official Brand Assets & Logos</h3>
                    <p className="text-xs text-[#686B78]">
                      Strict requirement compliance: Manage official logo assets. The desktop header uses a text-only wordmark, while the footer renders the original white-on-navy logo image.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dark Footer Logo Showcase */}
                    <div className="p-6 bg-[#171D50] text-white border border-white/10 rounded-3xl space-y-4">
                      <div className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                        Official Footer Asset (White on Deep Navy)
                      </div>
                      <div className="p-4 bg-[#171D50] border border-white/20 rounded-2xl flex items-center justify-center min-h-[140px]">
                        <img
                          src={logoWhiteOnNavy}
                          alt="White on Navy Logo Preview"
                          className="max-w-[300px] w-full h-auto object-contain"
                        />
                      </div>
                      <div className="text-xs text-white/70 space-y-1">
                        <div>Path: <span className="font-mono text-[11px]">{logoWhiteOnNavy}</span></div>
                        <div className="text-[11px] text-white/50">
                          Requirement: Centered, object-fit contain, max-width 320-380px, original proportions preserved.
                        </div>
                      </div>
                    </div>

                    {/* Light Background Logo Showcase */}
                    <div className="p-6 bg-white border border-[#E8E9F0] rounded-3xl space-y-4">
                      <div className="text-xs uppercase tracking-wider text-[#686B78] font-semibold">
                        Official Light Asset (Navy Blue on White)
                      </div>
                      <div className="p-4 bg-white border border-[#E8E9F0] rounded-2xl flex items-center justify-center min-h-[140px]">
                        <img
                          src={logoNavyOnWhite}
                          alt="Navy on White Logo Preview"
                          className="max-w-[300px] w-full h-auto object-contain"
                        />
                      </div>
                      <div className="text-xs text-[#686B78] space-y-1">
                        <div>Path: <span className="font-mono text-[11px]">{logoNavyOnWhite}</span></div>
                        <div className="text-[11px] text-[#686B78]">
                          Used in About Al Jabin Publications and official publisher seals.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo replacement utility */}
                  <div className="p-6 bg-[#FAFAFC] border border-[#E8E9F0] rounded-3xl space-y-4">
                    <h4 className="font-editorial text-base text-[#171923]">
                      Replace or Drop-in Custom Brand Assets
                    </h4>
                    <p className="text-xs text-[#686B78]">
                      If you have provided exact PNG or SVG files (e.g. into <code className="font-mono bg-white px-1 border border-gray-200 rounded">/public/assets/logos/logo.png</code>), enter their file paths below or revert to standard brand assets anytime.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-medium mb-1">White-on-Navy Logo Path/URL</label>
                        <input
                          type="text"
                          value={tempWhiteLogo}
                          onChange={(e) => setTempWhiteLogo(e.target.value)}
                          className="w-full px-3.5 py-2 border border-[#E8E9F0] bg-white font-mono rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Navy-on-White Logo Path/URL</label>
                        <input
                          type="text"
                          value={tempNavyLogo}
                          onChange={(e) => setTempNavyLogo(e.target.value)}
                          className="w-full px-3.5 py-2 border border-[#E8E9F0] bg-white font-mono rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setLogoWhiteOnNavy(tempWhiteLogo);
                          setLogoNavyOnWhite(tempNavyLogo);
                          showToast('Updated brand logo asset paths.');
                        }}
                        className="px-5 py-2.5 bg-[#171D50] text-white text-xs font-semibold rounded-full hover:bg-[#0f1338] transition-colors"
                      >
                        Apply Asset Paths
                      </button>
                      <button
                        onClick={() => {
                          resetLogosToDefault();
                          setTempNavyLogo('/assets/logos/al-jabin-logo-navy-on-white.svg');
                          setTempWhiteLogo('/assets/logos/al-jabin-logo-white-on-navy.svg');
                          showToast('Reset brand logos to official defaults.');
                        }}
                        className="px-5 py-2.5 border border-[#E8E9F0] text-xs hover:bg-gray-100 rounded-full transition-colors"
                      >
                        Reset to Official Defaults
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PRODUCTION READINESS */}
              {activeTab === 'production' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-editorial text-2xl text-[#171923]">Production Deployment Checklist</h3>
                    <p className="text-xs text-[#686B78]">
                      Complete architectural blueprint for real merchant credentials, automated email delivery, and cloud storage.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Item 1: Bangladesh Payment Gateways */}
                    <div className="p-5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-xs text-[#171923] flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>1. Bangladesh Payment Gateway Integration (SSLCommerz / bKash Checkout)</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 border border-amber-200 rounded-full">
                          Requires Merchant Account
                        </span>
                      </div>
                      <p className="text-xs text-[#686B78] leading-relaxed">
                        To accept automated live payments via bKash, Nagad, Visa, Mastercard, and Rocket, configure <code className="font-mono bg-white px-1">SSLCOMMERZ_STORE_ID</code> and <code className="font-mono bg-white px-1">SSLCOMMERZ_STORE_PASSWORD</code> or bKash Direct Checkout credentials in your environment variables.
                      </p>
                    </div>

                    {/* Item 2: International Card Gateway (Stripe) */}
                    <div className="p-5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-xs text-[#171923] flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>2. International Credit Cards (Stripe API)</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 border border-amber-200 rounded-full">
                          Requires Stripe Keys
                        </span>
                      </div>
                      <p className="text-xs text-[#686B78] leading-relaxed">
                        Configure <code className="font-mono bg-white px-1">STRIPE_SECRET_KEY</code> and webhook endpoints to verify USD purchases from international readers worldwide.
                      </p>
                    </div>

                    {/* Item 3: Automated Digital Delivery & Storage */}
                    <div className="p-5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-xs text-[#171923] flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>3. Protected Digital Ebook Storage (AWS S3 / Google Cloud Storage)</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 border border-emerald-200 rounded-full">
                          Architecture Ready
                        </span>
                      </div>
                      <p className="text-xs text-[#686B78] leading-relaxed">
                        Store full PDF/EPUB binary manuscripts in private Cloud Storage buckets. Issue time-limited signed download URLs (e.g. 24-hour expiry) to customers only after server-side payment verification.
                      </p>
                    </div>

                    {/* Item 4: Transactional Email Delivery */}
                    <div className="p-5 bg-[#FAFAFC] border border-[#E8E9F0] rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-xs text-[#171923] flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>4. Automated Order Confirmation Emails (Resend / SendGrid)</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 border border-amber-200 rounded-full">
                          Requires SMTP / API Key
                        </span>
                      </div>
                      <p className="text-xs text-[#686B78] leading-relaxed">
                        Configure <code className="font-mono bg-white px-1">RESEND_API_KEY</code> or SMTP to automatically dispatch receipt emails with download tokens to customers upon checkout.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        )}

      </div>
    </div>
  );
};
