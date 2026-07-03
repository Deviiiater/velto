'use client';
import { useState, useEffect } from 'react';
import { getPortalSupabase } from '@/lib/supabase';
import { Store, PlusCircle, CheckCircle, Clock, Trash2, Tag, ShoppingBag, Edit3, Save, X, Image, RefreshCw } from 'lucide-react';
import StaffAuthGuard from '@/components/StaffAuthGuard';
import DashboardInstallBanner from '@/components/DashboardInstallBanner';
import Link from 'next/link';

const client = getPortalSupabase('vendor');

type ProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  image_url: string | null;
  created_at: string;
  is_approved?: boolean;
  vendor_id?: string | null;
};

function VendorDashboardContent() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Product upload form state
  const [form, setForm] = useState<ProductInput>({
    name: '',
    description: '',
    price: 0,
    stock: 10,
    category: 'Cloud Kitchen',
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Editing product state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  const fetchVendorProducts = async (vId: string) => {
    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('vendor_id', vId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
      localStorage.setItem(`velto_vendor_products_${vId}`, JSON.stringify(data || []));
    } catch (err) {
      console.warn("Supabase fetch products failed, loading from local fallback:", err);
      const cached = localStorage.getItem(`velto_vendor_products_${vId}`);
      if (cached) {
        setProducts(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadVendorInfo() {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        setVendorId(user.id);
        fetchVendorProducts(user.id);
      } else {
        setLoading(false);
      }
    }
    loadVendorInfo();
  }, []);

  const handleUploadProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.price <= 0 || !vendorId) {
      alert("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setSuccess(false);

    const newProd = {
      name: form.name,
      description: form.description,
      price: form.price,
      stock: form.stock,
      category: form.category,
      image_url: form.image_url || null,
      is_approved: false, // requires admin approval
      vendor_id: vendorId
    };

    try {
      const { error } = await client
        .from('products')
        .insert(newProd);

      if (error) throw error;

      setSuccess(true);
      setForm({
        name: '',
        description: '',
        price: 0,
        stock: 10,
        category: 'Cloud Kitchen',
        image_url: ''
      });
      fetchVendorProducts(vendorId);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.warn("Failed inserting product, caching listing request locally:", err.message);
      
      // Save local mock
      const cached = localStorage.getItem(`velto_vendor_products_${vendorId}`) 
        ? JSON.parse(localStorage.getItem(`velto_vendor_products_${vendorId}`)!) 
        : [];
      
      const localMock: Product = {
        id: 'temp-' + Date.now(),
        ...newProd,
        created_at: new Date().toISOString()
      };
      cached.unshift(localMock);
      localStorage.setItem(`velto_vendor_products_${vendorId}`, JSON.stringify(cached));
      
      setProducts(cached);
      setSuccess(true);
      setForm({
        name: '',
        description: '',
        price: 0,
        stock: 10,
        category: 'Cloud Kitchen',
        image_url: ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const { error } = await client
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert("Listing deleted successfully!");
    } catch (err: any) {
      console.warn("Database deletion failed, removing locally:", err.message);
    }

    // Always filter out locally
    const filtered = products.filter(p => p.id !== id);
    setProducts(filtered);
    if (vendorId) {
      localStorage.setItem(`velto_vendor_products_${vendorId}`, JSON.stringify(filtered));
      fetchVendorProducts(vendorId);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (editPrice <= 0) {
      alert("Price must be greater than zero.");
      return;
    }
    try {
      const { error } = await client
        .from('products')
        .update({ price: editPrice, stock: editStock })
        .eq('id', id);
      if (error) throw error;
      alert("Product details updated!");
      setEditingId(null);
      if (vendorId) fetchVendorProducts(vendorId);
    } catch (err: any) {
      alert(`Edit failed: ${err.message}`);
    }
  };

  const pendingListings = products.filter(p => p.is_approved === false);
  const activeListings = products.filter(p => p.is_approved !== false);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Title Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 uppercase tracking-widest text-white/90">
              🏪 Partner Console
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
              <Store size={36} /> Velto Vendor Hub
            </h1>
            <p className="text-sm font-medium text-emerald-50/80 max-w-xl">
              Add products, cloud kitchen specials, and track admin moderation status in real-time.
            </p>
          </div>
          <button 
            onClick={() => vendorId && fetchVendorProducts(vendorId)}
            className="bg-white text-teal-600 hover:bg-emerald-50 transition-all font-extrabold text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <RefreshCw size={16} /> Refresh Listings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form (Left Column) */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3 text-foreground">
              <PlusCircle size={20} className="text-emerald-500" /> Upload New Item
            </h2>

            <form onSubmit={handleUploadProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Product Name *</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Garlic Naan & Dal Combo"
                  className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Category / Module</label>
                <select 
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm cursor-pointer"
                >
                  <option value="Cloud Kitchen">Cloud Kitchen Meal</option>
                  <option value="Tiffin Service">Tiffin Subscription</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fresh Fruits">Fresh Fruits</option>
                  <option value="Dairy & Bread">Dairy & Bread</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Price (₹) *</label>
                  <input 
                    type="number" 
                    value={form.price || ''}
                    onChange={e => setForm({...form, price: parseFloat(e.target.value) || 0})}
                    placeholder="150"
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Stock Qty *</label>
                  <input 
                    type="number" 
                    value={form.stock}
                    onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Image URL</label>
                <input 
                  type="url" 
                  value={form.image_url}
                  onChange={e => setForm({...form, image_url: e.target.value})}
                  placeholder="https://images.unsplash.com/... (optional)"
                  className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description</label>
                <textarea 
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Tell clients about ingredients, prep, or subscription durations..."
                  className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none h-20"
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {submitting ? 'Uploading...' : success ? (
                  <span className="flex items-center gap-1.5"><CheckCircle size={18} /> Uploaded & Awaiting Approval!</span>
                ) : (
                  'Upload for Approval'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Listings Display (Right Column - Spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approval Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5 border-b border-border pb-3">
              <Clock className="animate-spin text-amber-500" size={18} /> Pending Admin Approval ({pendingListings.length})
            </h2>

            {loading ? (
              <div className="h-24 bg-accent/30 animate-pulse rounded-xl"></div>
            ) : pendingListings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No products currently pending approval.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingListings.map(prod => (
                  <div key={prod.id} className="border border-amber-500/20 bg-amber-500/5 p-4 rounded-xl flex gap-3 relative justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-accent rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-border">
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <Image size={18} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-foreground block">{prod.name}</span>
                        <span className="text-[10px] text-muted-foreground block max-w-[150px] truncate">{prod.description || 'No description.'}</span>
                        <span className="text-[10px] text-amber-500 font-bold block">₹{prod.price} | {prod.stock} units</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-500/10 transition-colors"
                      title="Cancel Upload Request"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Listings Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 border-b border-border pb-3">
              <CheckCircle size={18} /> Active on Storefront ({activeListings.length})
            </h2>

            {loading ? (
              <div className="h-32 bg-accent/30 animate-pulse rounded-xl"></div>
            ) : activeListings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Your approved products will list here.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Stock</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {activeListings.map(prod => {
                      const isEditing = editingId === prod.id;
                      return (
                        <tr key={prod.id} className="hover:bg-accent/10 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded border bg-accent flex items-center justify-center overflow-hidden flex-shrink-0">
                                {prod.image_url ? (
                                  <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Image size={14} className="text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-foreground block leading-tight">{prod.name}</span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-extrabold border border-emerald-500/10 mt-0.5 inline-block uppercase">{prod.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            {isEditing ? (
                              <input 
                                type="number" 
                                value={editPrice}
                                onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                                className="w-14 p-1 bg-background border border-border rounded text-xs font-bold text-center"
                              />
                            ) : (
                              <span className="font-bold text-foreground">₹{prod.price}</span>
                            )}
                          </td>
                          <td className="py-3">
                            {isEditing ? (
                              <input 
                                type="number" 
                                value={editStock}
                                onChange={e => setEditStock(parseInt(e.target.value) || 0)}
                                className="w-14 p-1 bg-background border border-border rounded text-xs font-bold text-center"
                              />
                            ) : (
                              <span className="font-semibold text-muted-foreground">{prod.stock} units</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {isEditing ? (
                                <>
                                  <button 
                                    onClick={() => handleSaveEdit(prod.id)}
                                    className="p-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded border border-emerald-500/20 transition-all"
                                  >
                                    <Save size={12} />
                                  </button>
                                  <button 
                                    onClick={() => setEditingId(null)}
                                    className="p-1 bg-accent text-muted-foreground hover:text-foreground rounded border border-border transition-all"
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => {
                                      setEditingId(prod.id);
                                      setEditPrice(prod.price);
                                      setEditStock(prod.stock);
                                    }}
                                    className="p-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded border border-primary/20 transition-all"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded border border-red-500/20 transition-all"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorDashboard() {
  return (
    <StaffAuthGuard 
      allowedRoles={['admin', 'kitchen', 'vendor']}
      portalId="vendor"
      portalName="Velto Vendor Hub"
      portalIcon={<Store className="w-6 h-6" />}
    >
      <div className="min-h-screen bg-background/95 py-10 px-4">
        <DashboardInstallBanner portalName="Vendor" logoUrl="/logo-vendor.png" />
        <VendorDashboardContent />
      </div>
    </StaffAuthGuard>
  );
}
