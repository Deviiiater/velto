'use client';
import { useState, useEffect } from 'react';
import { getPortalSupabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { 
  PlusCircle, Users, ShoppingBag, ShieldCheck, CheckCircle, 
  UserPlus, Key, ClipboardList, DollarSign, Calendar, 
  Headphones, Trash2, Edit3, Save, X, Search, Image, Megaphone, CheckSquare
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import StaffAuthGuard from '@/components/StaffAuthGuard';
import Link from 'next/link';

const supabase = getPortalSupabase('admin');

type UserProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'rider' | 'admin' | 'kitchen' | 'warehouse';
  address: string | null;
};

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

type ComplaintAdmin = {
  id: string;
  order_id: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  admin_reply: string | null;
  created_at: string;
  users?: {
    full_name: string | null;
    phone: string | null;
  } | null;
};

type OrderAdmin = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string;
};

export default function AdminDashboard() {
  // Tabs for administrative functions
  const [activeTab, setActiveTab] = useState<'catalog' | 'staff' | 'tickets' | 'announcements' | 'approvals'>('catalog');

  // Product form state
  const [productForm, setProductForm] = useState<ProductInput>({
    name: '',
    description: '',
    price: 0,
    stock: 10,
    category: 'Vegetables',
    image_url: ''
  });
  const [productLoading, setProductLoading] = useState(false);
  const [productSuccess, setProductSuccess] = useState(false);

  // Staff account provisioning state
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffFullName, setStaffFullName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<'customer' | 'rider' | 'admin' | 'kitchen' | 'warehouse' | 'vendor'>('rider');
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSuccess, setStaffSuccess] = useState(false);

  // Global app data states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [orders, setOrders] = useState<OrderAdmin[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [complaints, setComplaints] = useState<ComplaintAdmin[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Product Catalog management states
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  type Announcement = {
    id: string;
    title: string;
    content: string;
    type: 'announcement' | 'diet' | 'promo' | 'sos' | 'offer';
    created_at: string;
  };
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'announcement' | 'diet' | 'promo' | 'sos' | 'offer'>('announcement');
  const [annSubmitting, setAnnSubmitting] = useState(false);

  // Vendor Approval states
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [pendingProductsLoading, setPendingProductsLoading] = useState(true);
  const [approvingProductId, setApprovingProductId] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setAnnouncements(data);
        localStorage.setItem('velto_announcements', JSON.stringify(data));
      } else {
        loadLocalAnnouncements();
      }
    } catch (e) {
      console.warn("Supabase admin fetch announcements failed, falling back to localStorage:", e);
      loadLocalAnnouncements();
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const loadLocalAnnouncements = () => {
    const local = localStorage.getItem('velto_announcements');
    if (local) {
      try {
        setAnnouncements(JSON.parse(local));
      } catch (err) {
        console.error("Failed parsing admin local announcements:", err);
      }
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert("Please enter title and content.");
      return;
    }
    setAnnSubmitting(true);
    const newAnn = {
      title: annTitle.trim(),
      content: annContent.trim(),
      type: annType
    };

    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert(newAnn)
        .select();

      if (error) throw error;
      alert("Announcement created successfully on database!");
      
      // Update localStorage
      const local = localStorage.getItem('velto_announcements');
      const list = local ? JSON.parse(local) : [];
      if (data && data[0]) {
        list.unshift(data[0]);
      } else {
        list.unshift({ ...newAnn, id: 'local-' + Date.now(), created_at: new Date().toISOString() });
      }
      localStorage.setItem('velto_announcements', JSON.stringify(list));
      
      setAnnTitle('');
      setAnnContent('');
      setAnnType('announcement');
      fetchAnnouncements();
    } catch (err: any) {
      console.warn("Database insert failed, writing to localStorage only:", err.message);
      const list = localStorage.getItem('velto_announcements') ? JSON.parse(localStorage.getItem('velto_announcements')!) : [];
      const mockNew = {
        id: 'local-' + Date.now(),
        title: annTitle.trim(),
        content: annContent.trim(),
        type: annType,
        created_at: new Date().toISOString()
      };
      list.unshift(mockNew);
      localStorage.setItem('velto_announcements', JSON.stringify(list));
      setAnnTitle('');
      setAnnContent('');
      setAnnType('announcement');
      setAnnouncements(list);
      alert("Database offline. Announcement saved locally!");
    } finally {
      setAnnSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this broadcast?")) return;
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert("Broadcast deleted from database!");
    } catch (e: any) {
      console.warn("Database delete failed, removing from local storage only:", e.message);
    }
    
    // Always remove from local storage
    const local = localStorage.getItem('velto_announcements');
    if (local) {
      const list = JSON.parse(local).filter((ann: any) => ann.id !== id);
      localStorage.setItem('velto_announcements', JSON.stringify(list));
      setAnnouncements(list);
    }
    fetchAnnouncements();
  };

  const fetchPendingProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPendingProducts(data || []);
    } catch (e) {
      console.warn("Error fetching pending products:", e);
    } finally {
      setPendingProductsLoading(false);
    }
  };

  const handleApproveProduct = async (productId: string) => {
    setApprovingProductId(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_approved: true })
        .eq('id', productId);
      if (error) throw error;
      alert("Product approved successfully!");
      fetchPendingProducts();
      fetchProducts();
    } catch (e: any) {
      alert(`Approval failed: ${e.message}`);
    } finally {
      setApprovingProductId(null);
    }
  };

  const handleRejectProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to reject and delete this product upload request?")) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) throw error;
      alert("Product upload request rejected and deleted.");
      fetchPendingProducts();
    } catch (e: any) {
      alert(`Rejection failed: ${e.message}`);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, user_id')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      console.warn('Error fetching admin orders:', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          users (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (e) {
      console.error('Error fetching complaints:', e);
    } finally {
      setComplaintsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const approved = (data || []).filter((p: any) => p.is_approved !== false);
      setProducts(approved);
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail || !staffPassword) {
      alert("Email and password are required.");
      return;
    }

    setStaffLoading(true);
    setStaffSuccess(false);

    try {
      // 1. Create a temporary Supabase client that does not persist session
      const tempClient = createClient(
        supabaseUrl,
        supabaseAnonKey,
        { auth: { persistSession: false } }
      );

      // 2. Sign up user via the isolated client with role and full_name stored in user_metadata
      const { data, error } = await tempClient.auth.signUp({
        email: staffEmail,
        password: staffPassword,
        options: {
          data: {
            role: staffRole,
            full_name: staffFullName || 'New Staff'
          }
        }
      });

      if (error) throw error;
      const newUser = data.user;
      if (!newUser) throw new Error("Could not create authentication profile.");

      // Establish authenticated session to satisfy RLS "Users can insert their own profile" check
      try {
        await tempClient.auth.signInWithPassword({
          email: staffEmail,
          password: staffPassword,
        });
      } catch (signInErr) {
        console.warn("Auto-signin on tempClient failed:", signInErr);
      }

      // 3. Insert public profile under the newly registered session
      const { error: profileError } = await tempClient
        .from('users')
        .insert({
          id: newUser.id,
          full_name: staffFullName || 'New Staff',
          phone: staffPhone || '',
          role: staffRole
        });

      if (profileError) throw profileError;

      setStaffSuccess(true);
      setStaffEmail('');
      setStaffPassword('');
      setStaffFullName('');
      setStaffPhone('');
      setStaffRole('rider');

      alert(`Successfully provisioned account for ${staffEmail} with role ${staffRole.toUpperCase()}!`);
      
      // Re-fetch users table to show new staff member
      fetchUsers();
      
      setTimeout(() => setStaffSuccess(false), 3000);
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('rate limit')) {
        alert(
          `⚠️ Supabase SMTP Rate Limit Hit!\n\n` +
          `By default, Supabase limits new email sign-ups to 3 per hour on the free tier to prevent spam.\n\n` +
          `To bypass this restriction instantly:\n` +
          `1️⃣ Open your Supabase Dashboard (https://supabase.com/dashboard)\n` +
          `2️⃣ Go to Project Settings -> Auth settings -> Rate Limits\n` +
          `3️⃣ Change "Email Rate Limit" from 3 to 100 or 1000 per hour (or disable it)\n` +
          `4️⃣ (Optional) Under "Auth Providers" -> Email, toggle OFF "Confirm Email" so accounts are instantly active!`
        );
      } else {
        alert(`Provisioning failed: ${err.message}`);
      }
    } finally {
      setStaffLoading(false);
    }
  };

  const handleReplyComplaint = async (complaintId: string, autoResolve = false) => {
    if (!replyText.trim() && !autoResolve) {
      alert("Please type a response before sending.");
      return;
    }

    setSubmittingReply(true);
    try {
      const finalReply = replyText.trim() || "This issue has been reviewed and successfully resolved by the Velto Care team.";
      const { error } = await supabase
        .from('complaints')
        .update({
          admin_reply: finalReply,
          status: 'resolved'
        })
        .eq('id', complaintId);

      if (error) throw error;
      alert("Support response saved and case successfully resolved!");
      setReplyText('');
      setActiveReplyId(null);
      fetchComplaints();
    } catch (err: any) {
      alert(`Failed to save reply: ${err.message}`);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleRefundAction = async (complaintId: string, action: 'approve' | 'reject') => {
    setSubmittingReply(true);
    try {
      const finalReply = action === 'approve' 
        ? "Refund Request APPROVED: ₹120 has been credited back to your Velto Wallet. Verification status: Fraud check passed." 
        : "Refund Request REJECTED: Denied due to lack of verified photo proof, mismatch in claims, or potential policy violation. User flagged for review.";

      const { error } = await supabase
        .from('complaints')
        .update({
          admin_reply: finalReply,
          status: 'resolved'
        })
        .eq('id', complaintId);

      if (error) throw error;
      alert(action === 'approve' ? "Refund approved and resolved!" : "Refund request rejected and user flagged!");
      fetchComplaints();
    } catch (err: any) {
      alert(`Failed to complete refund action: ${err.message}`);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || productForm.price <= 0) {
      alert('Please fill out all required fields.');
      return;
    }

    setProductLoading(true);
    setProductSuccess(false);

    try {
      const { error } = await supabase.from('products').insert({
        name: productForm.name,
        description: productForm.description,
        price: productForm.price,
        stock: productForm.stock,
        category: productForm.category,
        image_url: productForm.image_url || null
      });

      if (error) throw error;

      setProductSuccess(true);
      setProductForm({
        name: '',
        description: '',
        price: 0,
        stock: 10,
        category: 'Vegetables',
        image_url: ''
      });
      
      // Refresh local catalog
      fetchProducts();
      
      // Auto-hide success checkmark after 3 seconds
      setTimeout(() => setProductSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to add product: ${err.message}`);
    } finally {
      setProductLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'customer' | 'rider' | 'admin' | 'kitchen' | 'warehouse' | 'vendor') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      alert(`Role successfully updated to ${newRole.toUpperCase()}!`);
      fetchUsers();
    } catch (err: any) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  // Product Catalog modification functions
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to permanently delete this product? It will immediately disappear from client dashboards.")) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
      if (error) throw error;
      alert("Product successfully deleted from database!");
      fetchProducts();
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    }
  };

  const handleSaveProductEdit = async (productId: string) => {
    if (editPrice <= 0) {
      alert("Price must be a positive number.");
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          price: editPrice,
          stock: editStock
        })
        .eq('id', productId);

      if (error) throw error;
      alert("Product details updated successfully!");
      setEditingProductId(null);
      fetchProducts();
    } catch (e: any) {
      alert(`Update failed: ${e.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchComplaints();
    fetchOrders();
    fetchProducts();
    fetchAnnouncements();
    fetchPendingProducts();

    // Listen for real-time complaints updates in Admin
    const compChannel = supabase
      .channel('admin-complaints-db')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        () => { fetchComplaints(); }
      )
      .subscribe();

    // Listen for real-time orders updates in Admin
    const orderChannel = supabase
      .channel('admin-orders-db')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => { fetchOrders(); }
      )
      .subscribe();

    // Listen for real-time product updates in Admin
    const prodChannel = supabase
      .channel('admin-products-db')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => { fetchProducts(); fetchPendingProducts(); }
      )
      .subscribe();

    // Fallback polling interval in case the WebSockets are restricted or RLS filters block streams!
    const fallbackPolling = setInterval(() => {
      fetchUsers();
      fetchComplaints();
      fetchOrders();
      fetchProducts();
      fetchAnnouncements();
      fetchPendingProducts();
    }, 4000);

    return () => {
      supabase.removeChannel(compChannel);
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(prodChannel);
      clearInterval(fallbackPolling);
    };
  }, []);

  const getPlatformStats = () => {
    const stats: Record<string, number> = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' });
      stats[date] = (stats[date] || 0) + 1;
    });
    return Object.entries(stats).map(([date, count]) => ({ date, count }));
  };
  const platformDayWiseStats = getPlatformStats();
  const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  // Filter products catalog
  const filteredProducts = products.filter(p => {
    const term = productSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      (p.category?.toLowerCase().includes(term) ?? false) ||
      (p.description?.toLowerCase().includes(term) ?? false)
    );
  });

  return (
    <StaffAuthGuard
      allowedRoles={['admin']}
      portalName="Admin Security Portal"
      portalIcon={<ShieldCheck size={24} />}
      portalId="admin"
    >
      <div className="space-y-10 mt-6">
        {/* Title Header */}
        <div className="border-b border-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-primary" size={32} /> Velto Admin Panel
            </h1>
            <p className="text-muted-foreground text-sm">Control inventory, add products, configure staff roles, and oversee support.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/support-panel"
              className="bg-accent hover:bg-accent/80 text-foreground border border-border px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Headphones size={14} /> Customer Care Desk
            </Link>
          </div>
        </div>

        {/* Global Operations Terminal */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3">
            📊 Velto Global Operations Terminal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-accent/40 border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="p-3.5 bg-primary/10 text-primary rounded-xl">
                <ClipboardList size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Orders</span>
                <h3 className="text-2xl font-black text-foreground mt-0.5">{orders.length}</h3>
              </div>
            </div>

            <div className="bg-accent/40 border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <DollarSign size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Sales</span>
                <h3 className="text-2xl font-black text-foreground mt-0.5">₹{totalSales.toFixed(2)}</h3>
              </div>
            </div>

            <div className="bg-accent/40 border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <ShoppingBag size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Active Catalog Items</span>
                <h3 className="text-2xl font-black text-foreground mt-0.5">{products.length}</h3>
              </div>
            </div>

            <div className="bg-accent/40 border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Platform Users</span>
                <h3 className="text-2xl font-black text-foreground mt-0.5">{users.length}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Forms Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Add Product Form Column */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3">
                <PlusCircle size={20} className="text-primary" /> Add New Item / Service
              </h2>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Name *</label>
                  <input 
                    type="text" 
                    value={productForm.name}
                    onChange={e => setProductForm({...productForm, name: e.target.value})}
                    placeholder="e.g. Alphonso Mangoes"
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Category / Service Module</label>
                  <select 
                    value={productForm.category}
                    onChange={e => setProductForm({...productForm, category: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
                  >
                    {/* Grocery categories */}
                    <optgroup label="Grocery Module (Instamart)">
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fresh Fruits">Fresh Fruits</option>
                      <option value="Dairy & Bread">Dairy & Bread</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Meat & Fish">Meat & Fish</option>
                    </optgroup>
                    
                    {/* Food & Kitchen */}
                    <optgroup label="Food & Kitchen Module">
                      <option value="Cloud Kitchen">Cloud Kitchen Meal</option>
                      <option value="Tiffin Service">Tiffin Subscription</option>
                    </optgroup>

                    {/* Pharmacy */}
                    <optgroup label="Pharmacy Module">
                      <option value="Pharmacy">Pharmacy Medicine</option>
                    </optgroup>

                    {/* Courier */}
                    <optgroup label="Courier Module">
                      <option value="Courier">Courier Delivery Service</option>
                    </optgroup>

                    {/* Bills */}
                    <optgroup label="Bills & Utilities Module">
                      <option value="Bills & Recharge">Bills & Recharge Plan</option>
                    </optgroup>

                    {/* Home Services */}
                    <optgroup label="Home Services Module">
                      <option value="Home Services">Home Cleaning/Repair Service</option>
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Price (₹) *</label>
                    <input 
                      type="number" 
                      value={productForm.price || ''}
                      onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                      placeholder="99"
                      className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Stock Qty *</label>
                    <input 
                      type="number" 
                      value={productForm.stock}
                      onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                      placeholder="50"
                      className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Image URL</label>
                  <input 
                    type="url" 
                    value={productForm.image_url}
                    onChange={e => setProductForm({...productForm, image_url: e.target.value})}
                    placeholder="https://images.unsplash.com/... (optional)"
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description</label>
                  <textarea 
                    value={productForm.description}
                    onChange={e => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Brief description of the product or service details..."
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none h-20"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={productLoading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {productLoading ? 'Adding...' : productSuccess ? (
                    <span className="flex items-center gap-1.5"><CheckCircle size={18} /> Added to Dashboard!</span>
                  ) : (
                    'Add to Client Dashboard'
                  )}
                </button>
              </form>
            </div>

            {/* Create Staff Account Form */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3">
                <UserPlus size={20} className="text-primary" /> Provision Staff / User Account
              </h2>

              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    value={staffEmail}
                    onChange={e => setStaffEmail(e.target.value)}
                    placeholder="staff@velto.com"
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Password *</label>
                  <input 
                    type="password" 
                    value={staffPassword}
                    onChange={e => setStaffPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={staffFullName}
                    onChange={e => setStaffFullName(e.target.value)}
                    placeholder="Ravi Kumar"
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={staffPhone}
                    onChange={e => setStaffPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Assigned Role</label>
                  <select 
                    value={staffRole}
                    onChange={e => setStaffRole(e.target.value as any)}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
                  >
                    <option value="warehouse">Warehouse Storekeeper (Warehouse Access)</option>
                    <option value="kitchen">Cloud Kitchen Operator (Kitchen Panel Access)</option>
                    <option value="rider">Delivery Rider (Rider Panel Access)</option>
                    <option value="vendor">Vendor / Partner (Vendor Panel Access)</option>
                    <option value="admin">Administrator (Admin & Warehouse Access)</option>
                    <option value="customer">Standard Customer (Regular User)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={staffLoading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {staffLoading ? 'Registering...' : staffSuccess ? (
                    <span className="flex items-center gap-1.5"><CheckCircle size={18} /> Account Provisioned!</span>
                  ) : (
                    'Provision New Account'
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Right tabbed console Column (spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Console Tab Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-5 p-1 bg-accent/40 rounded-2xl border border-border/50 w-full gap-1">
              {[
                { id: 'catalog', name: 'Catalog', icon: <ShoppingBag size={14} /> },
                { id: 'staff', name: 'Staff', icon: <Users size={14} /> },
                { id: 'tickets', name: 'Tickets', icon: <Headphones size={14} /> },
                { id: 'announcements', name: 'Broadcasts', icon: <Megaphone size={14} /> },
                { id: 'approvals', name: 'Approvals', icon: <CheckSquare size={14} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: PRODUCT CATALOG MANAGER */}
            {activeTab === 'catalog' && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-3">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      📁 Dashboard Product Catalog
                    </h2>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">Edit price, stock, or remove items in real-time.</p>
                  </div>
                  
                  {/* Catalog search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                    <input 
                      type="text" 
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search items by name, category..."
                      className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                    />
                  </div>
                </div>

                {productsLoading ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
                    Syncing catalog details...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">No products found. Start by adding one in the left panel!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Product Info</th>
                          <th className="pb-3 font-semibold">Category</th>
                          <th className="pb-3 font-semibold">Price</th>
                          <th className="pb-3 font-semibold">Stock</th>
                          <th className="pb-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {filteredProducts.map((prod) => {
                          const isEditing = editingProductId === prod.id;
                          return (
                            <tr key={prod.id} className="hover:bg-accent/20 transition-colors">
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-border/60 bg-muted/40 flex items-center justify-center flex-shrink-0">
                                    {prod.image_url ? (
                                      <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Image size={18} className="text-muted-foreground" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-foreground block leading-tight">{prod.name}</span>
                                    <span className="text-[10px] text-muted-foreground block max-w-xs truncate">{prod.description || 'No description provided.'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-xs font-semibold text-muted-foreground">
                                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px]">
                                  {prod.category}
                                </span>
                              </td>
                              <td className="py-3">
                                {isEditing ? (
                                  <div className="flex items-center bg-background border border-border rounded px-1.5 py-0.5 w-20">
                                    <span className="text-xs text-muted-foreground">₹</span>
                                    <input 
                                      type="number" 
                                      value={editPrice}
                                      onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                                      className="w-full bg-transparent border-none focus:outline-none text-xs font-bold text-primary pl-0.5"
                                    />
                                  </div>
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
                                    className="w-16 p-1 bg-background border border-border rounded text-xs font-bold text-center"
                                  />
                                ) : (
                                  <span className={`text-xs font-bold ${prod.stock <= 5 ? 'text-rose-500 animate-pulse' : 'text-muted-foreground'}`}>
                                    {prod.stock} units
                                  </span>
                                )}
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {isEditing ? (
                                    <>
                                      <button 
                                        onClick={() => handleSaveProductEdit(prod.id)}
                                        className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded border border-emerald-500/20 transition-all"
                                        title="Save Changes"
                                      >
                                        <Save size={14} />
                                      </button>
                                      <button 
                                        onClick={() => setEditingProductId(null)}
                                        className="p-1.5 bg-accent text-muted-foreground hover:text-foreground rounded border border-border transition-all"
                                        title="Cancel Edit"
                                      >
                                        <X size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button 
                                        onClick={() => {
                                          setEditingProductId(prod.id);
                                          setEditPrice(prod.price);
                                          setEditStock(prod.stock);
                                        }}
                                        className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded border border-primary/20 transition-all"
                                        title="Quick Edit Price/Stock"
                                      >
                                        <Edit3 size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteProduct(prod.id)}
                                        className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded border border-rose-500/20 transition-all"
                                        title="Delete Product"
                                      >
                                        <Trash2 size={14} />
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
            )}

            {/* TAB 2: STAFF MANAGER */}
            {activeTab === 'staff' && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3">
                  <Users size={20} className="text-primary" /> Delivery Partner & Staff Manager
                </h2>

                {usersLoading ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
                    Syncing user roles...
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">No registered profiles found in database.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                          <th className="pb-3 font-semibold">User Details</th>
                          <th className="pb-3 font-semibold">Current Role</th>
                          <th className="pb-3 font-semibold text-right">Assign Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {users.map((profile) => {
                          const userOrders = orders.filter(o => o.user_id === profile.id);
                          const stats: Record<string, number> = {};
                          userOrders.forEach(order => {
                            const date = new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' });
                            stats[date] = (stats[date] || 0) + 1;
                          });
                          const userStats = {
                            total: userOrders.length,
                            days: Object.entries(stats).map(([date, count]) => ({ date, count }))
                          };

                          return (
                            <tr key={profile.id} className="hover:bg-accent/20 transition-colors">
                              <td className="py-4">
                                <div className="font-semibold text-foreground flex items-center gap-2">
                                  {profile.full_name || 'Anonymous User'}
                                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                                    {userStats.total} {userStats.total === 1 ? 'Order' : 'Orders'}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                  ID: {profile.id.slice(0, 8)}... | Tel: {profile.phone || 'N/A'}
                                </div>

                                {userStats.total > 0 && (
                                  <div className="mt-2">
                                    <button 
                                      onClick={() => setExpandedUserId(expandedUserId === profile.id ? null : profile.id)}
                                      className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-1"
                                    >
                                      {expandedUserId === profile.id ? 'Hide Daily Stats 📊' : 'View Daily Breakdown 📊'}
                                    </button>
                                    
                                    {expandedUserId === profile.id && (
                                      <div className="mt-2 p-2 bg-accent/40 rounded-lg border border-border/50 max-w-xs space-y-1">
                                        <span className="block text-[8px] font-black uppercase text-muted-foreground tracking-wider border-b border-border/30 pb-0.5 mb-1">
                                          Day-Wise Order Volumes:
                                        </span>
                                        {userStats.days.map((day, dIdx) => (
                                          <div key={dIdx} className="flex justify-between text-[10px] font-semibold">
                                            <span className="text-muted-foreground">{day.date}</span>
                                            <span className="text-primary">{day.count} {day.count === 1 ? 'order' : 'orders'}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded border uppercase ${
                                  profile.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                  profile.role === 'rider' ? 'bg-primary/10 text-primary border-primary/20' : 
                                  'bg-muted text-muted-foreground border-border'
                                }`}>
                                  {profile.role}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <select 
                                  value={profile.role}
                                  onChange={(e) => handleUpdateRole(profile.id, e.target.value as any)}
                                  className="bg-background border border-border rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                >
                                  <option value="customer">Customer</option>
                                  <option value="rider">Delivery Rider</option>
                                  <option value="kitchen">Cloud Kitchen</option>
                                  <option value="warehouse">Warehouse</option>
                                  <option value="vendor">Vendor</option>
                                  <option value="admin">Administrator</option>
                                </select>
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

            {/* TAB 3: SUPPORT TICKETS */}
            {activeTab === 'tickets' && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-3">
                  <Headphones size={20} className="text-primary" /> Support Center & Live Complaints
                </h2>

                {complaintsLoading ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
                    Syncing ticket queries...
                  </div>
                ) : complaints.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">No active customer complaints reported. Great job! 🚀</p>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((comp) => (
                      <div key={comp.id} className="border border-border bg-card rounded-2xl p-5 space-y-4 shadow-sm hover:border-primary/20 transition-all">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 border-b border-border pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase">{comp.subject}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                comp.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              }`}>
                                {comp.status}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground mt-1.5">
                              Ticket ID: {comp.id.slice(0, 8)}... | Order ID: {comp.order_id.slice(0, 8)}...
                            </div>
                          </div>
                          <div className="text-left sm:text-right text-[11px] text-muted-foreground">
                            <span className="block font-bold text-foreground">{comp.users?.full_name || 'Anonymous User'}</span>
                            <span>Tel: {comp.users?.phone || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[9px] font-black uppercase tracking-wider text-muted-foreground">Customer Description</span>
                          <p className="text-xs text-foreground bg-accent/40 border border-border/40 p-3 rounded-xl leading-relaxed italic">
                            "{comp.description}"
                          </p>
                        </div>

                        {comp.admin_reply ? (
                          <div className="space-y-1 bg-green-500/5 border border-green-500/10 p-3 rounded-xl">
                            <span className="block text-[9px] font-black uppercase tracking-wider text-green-500">Official Support Response</span>
                            <p className="text-xs font-semibold text-foreground leading-relaxed">
                              {comp.admin_reply}
                            </p>
                          </div>
                        ) : activeReplyId === comp.id ? (
                          <div className="space-y-3 pt-2">
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Type support response and resolve issue..."
                              rows={2}
                              className="w-full p-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs font-medium"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReplyComplaint(comp.id)}
                                disabled={submittingReply}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/95 transition-all disabled:opacity-50"
                              >
                                Send Reply & Resolve
                              </button>
                              <button
                                onClick={() => setActiveReplyId(null)}
                                className="bg-accent text-accent-foreground px-4 py-2 rounded-xl text-xs font-semibold hover:bg-accent/80 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 pt-1.5">
                            {comp.subject?.toLowerCase() === 'refund request' ? (
                              <>
                                <button
                                  onClick={() => handleRefundAction(comp.id, 'approve')}
                                  disabled={submittingReply}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                  ✅ Approve Refund
                                </button>
                                <button
                                  onClick={() => handleRefundAction(comp.id, 'reject')}
                                  disabled={submittingReply}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                  ❌ Reject & Flag Fraud
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setActiveReplyId(comp.id);
                                    setReplyText('');
                                  }}
                                  className="bg-primary text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1"
                                >
                                  Write Official Reply
                                </button>
                                <button
                                  onClick={() => handleReplyComplaint(comp.id, true)}
                                  className="bg-green-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition-all flex items-center gap-1"
                                >
                                  Auto-Resolve Case
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ANNOUNCEMENTS & DIETS */}
            {activeTab === 'announcements' && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="border-b border-border pb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    📢 Broadcast Announcements & Diet Plans
                  </h2>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    Post platform-wide alerts, promos, and nutritional program recommendations.
                  </p>
                </div>

                {/* Announcement Creation Form */}
                <form onSubmit={handleCreateAnnouncement} className="space-y-4 bg-accent/20 border border-border/50 p-5 rounded-2xl">
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Create New Broadcast</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Broadcast Title</label>
                      <input 
                        type="text" 
                        value={annTitle}
                        onChange={e => setAnnTitle(e.target.value)}
                        placeholder="e.g. 🚨 Summer Hydra-Alert!"
                        className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Broadcast Type</label>
                      <select 
                        value={annType}
                        onChange={e => setAnnType(e.target.value as any)}
                        className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
                      >
                        <option value="announcement">📢 General Announcement</option>
                        <option value="diet">🥗 Diet Program/Plan</option>
                        <option value="promo">🎉 Promotional Discount</option>
                        <option value="sos">🚨 Emergency SOS Notice</option>
                        <option value="offer">🎁 Special Offer / Deals</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Content / Message</label>
                    <textarea 
                      value={annContent}
                      onChange={e => setAnnContent(e.target.value)}
                      placeholder="Write your broadcast text detail here... (e.g. free ORS packs with orders, healthy food recommendations, etc.)"
                      className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none h-24"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={annSubmitting}
                    className="bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {annSubmitting ? 'Publishing...' : 'Publish Broadcast'}
                  </button>
                </form>

                {/* Announcements Feed */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Active Broadcasts ({announcements.length})</h3>
                  {announcementsLoading ? (
                    <div className="h-32 flex items-center justify-center text-muted-foreground animate-pulse">
                      Loading broadcasts...
                    </div>
                  ) : announcements.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">No active broadcasts. Create one above!</p>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="border border-border bg-background/50 rounded-xl p-4 flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-foreground">{ann.title}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                                ann.type === 'sos' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                ann.type === 'diet' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                ann.type === 'promo' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                ann.type === 'offer' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' :
                                'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                              }`}>
                                {ann.type}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{ann.content}</p>
                            <span className="block text-[9px] text-muted-foreground font-mono">
                              Posted: {new Date(ann.created_at).toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="text-red-500 hover:text-red-600 p-1 bg-red-500/10 rounded border border-red-500/20 transition-all"
                            title="Delete Announcement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: VENDOR APPROVALS */}
            {activeTab === 'approvals' && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="border-b border-border pb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    ✔️ Vendor Product Listings Pending Approval
                  </h2>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    Review, approve, or reject products uploaded by restaurants, cloud kitchens, and other vendor partners.
                  </p>
                </div>

                {pendingProductsLoading ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
                    Checking pending list...
                  </div>
                ) : pendingProducts.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-border/80 bg-background/30 rounded-2xl space-y-3">
                    <span className="text-4xl">✨</span>
                    <h3 className="font-extrabold text-sm text-foreground">All Clear! No Pending Approvals</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      All vendor products are processed. New uploads will show up here for moderation.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Product Info</th>
                          <th className="pb-3 font-semibold">Category</th>
                          <th className="pb-3 font-semibold">Price</th>
                          <th className="pb-3 font-semibold">Stock</th>
                          <th className="pb-3 font-semibold text-right">Moderation Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {pendingProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-accent/20 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-border/60 bg-muted/40 flex items-center justify-center flex-shrink-0">
                                  {prod.image_url ? (
                                    <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Image size={18} className="text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold text-foreground block leading-tight">{prod.name}</span>
                                  <span className="text-[10px] text-muted-foreground block max-w-xs truncate">{prod.description || 'No description provided.'}</span>
                                  <span className="block text-[8px] font-mono text-primary mt-0.5">Vendor: {prod.vendor_id?.slice(0, 8) || 'Unknown'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-xs font-semibold text-muted-foreground">
                              <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px]">
                                {prod.category}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="font-bold text-foreground">₹{prod.price}</span>
                            </td>
                            <td className="py-3">
                              <span className="text-xs font-semibold text-muted-foreground">
                                {prod.stock} units
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleApproveProduct(prod.id)}
                                  disabled={approvingProductId === prod.id}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                  {approvingProductId === prod.id ? 'Approving...' : '✔️ Approve'}
                                </button>
                                <button 
                                  onClick={() => handleRejectProduct(prod.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
                                >
                                  ❌ Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </StaffAuthGuard>
  );
}
