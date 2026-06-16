'use client';
import { useState, useEffect } from 'react';
import { getPortalSupabase, supabase } from '@/lib/supabase';
import { ChefHat, ShoppingBag, Calendar, CheckCircle, Clock, MapPin, Phone, User, AlertCircle, RefreshCw } from 'lucide-react';
import StaffAuthGuard from '@/components/StaffAuthGuard';

// Isolated portal-specific Supabase client
const portalClient = getPortalSupabase('kitchen');

type OrderItemProduct = {
  name: string;
  category: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  price_at_time: number;
  products: OrderItemProduct | null;
};

type UserProfile = {
  full_name: string | null;
  phone: string | null;
};

type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  delivery_address: string;
  phone_number: string;
  status: 'pending' | 'accepted' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: string;
  payment_method: string;
  created_at: string;
  users: UserProfile | null;
  order_items: OrderItem[];
};

function KitchenDashboardContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'meals' | 'tiffins'>('meals');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Query orders with user profiles and products inner-join
      const { data, error } = await portalClient
        .from('orders')
        .select(`
          *,
          users (
            full_name,
            phone
          ),
          order_items (
            id,
            quantity,
            price_at_time,
            products (
              name,
              category
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setOrders(data as unknown as Order[]);
      }
    } catch (err) {
      console.error("Error fetching kitchen orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, currentStatus: Order['status']) => {
    setUpdatingId(orderId);
    let nextStatus: Order['status'] = 'accepted';
    if (currentStatus === 'pending') nextStatus = 'accepted';
    else if (currentStatus === 'accepted') nextStatus = 'packing';
    else if (currentStatus === 'packing') nextStatus = 'out_for_delivery';
    else if (currentStatus === 'out_for_delivery') nextStatus = 'delivered';
    else return;

    try {
      const { error } = await portalClient
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state directly
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter Cloud Kitchen meal orders
  const mealOrders = orders.filter(order => 
    order.order_items?.some(item => item.products?.category?.toLowerCase() === 'cloud kitchen')
  );

  // Filter Tiffin Service subscription orders
  const tiffinSubscriptions = orders.filter(order => 
    order.order_items?.some(item => item.products?.category?.toLowerCase() === 'tiffin service')
  );

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'accepted': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'packing': return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
      case 'out_for_delivery': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      default: return 'bg-muted/15 text-muted-foreground border border-border/50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Title Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 uppercase tracking-widest text-white/90">
              🍳 Live Kitchen Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
              <ChefHat size={36} /> Chef's Console
            </h1>
            <p className="text-sm font-medium text-amber-50/80 max-w-xl">
              Real-time monitoring of hot gourmet meals and home-cooked recurring tiffin subscription orders.
            </p>
          </div>
          <button 
            onClick={fetchOrders}
            className="bg-white text-orange-600 hover:bg-amber-50 transition-all font-extrabold text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <RefreshCw size={16} /> Refresh Feed
          </button>
        </div>
      </div>

      {/* Tabs Split Navigation */}
      <div className="flex gap-4 border-b border-border/60 pb-1">
        <button 
          onClick={() => setActiveTab('meals')}
          className={`pb-3 text-sm font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'meals' 
              ? 'border-amber-500 text-amber-500' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ChefHat size={16} /> Meal Orders ({mealOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('tiffins')}
          className={`pb-3 text-sm font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'tiffins' 
              ? 'border-amber-500 text-amber-500' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar size={16} /> Tiffin Services ({tiffinSubscriptions.length})
        </button>
      </div>

      {/* Operational Dashboard */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-accent/40 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : activeTab === 'meals' ? (
        mealOrders.length === 0 ? (
          <div className="text-center p-16 border border-dashed border-border/80 bg-card rounded-2xl space-y-3">
            <span className="text-4xl">🍳</span>
            <h3 className="font-extrabold text-lg">No Active Meal Orders</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Any one-time Cloud Kitchen orders placed by customers will show up here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mealOrders.map(order => (
              <div key={order.id} className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-accent px-2.5 py-1 rounded-md">
                      ID: {order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 border-t border-b border-border/40 py-3.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kitchen Items</h4>
                    <ul className="space-y-1.5">
                      {order.order_items
                        .filter(item => item.products?.category?.toLowerCase() === 'cloud kitchen')
                        .map(item => (
                          <li key={item.id} className="flex justify-between text-sm font-semibold">
                            <span className="text-foreground">{item.products?.name}</span>
                            <span className="text-muted-foreground">Qty: {item.quantity}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <User size={14} className="text-amber-500" />
                      <span className="text-foreground font-semibold">{order.users?.full_name || 'Customer'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Phone size={14} className="text-amber-500" />
                      <span>{order.phone_number}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground font-medium">
                      <MapPin size={14} className="text-amber-500 mt-0.5" />
                      <span className="leading-relaxed">{order.delivery_address}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Control Actions */}
                <div className="mt-6 border-t border-border/40 pt-4 flex items-center justify-between gap-4">
                  <div className="text-xs">
                    <p className="text-muted-foreground font-medium">Order Total</p>
                    <p className="text-lg font-black text-foreground">₹{order.total_amount}</p>
                  </div>

                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, order.status)}
                      disabled={updatingId === order.id}
                      className="bg-amber-500 hover:bg-amber-600 active:translate-y-0 hover:-translate-y-0.5 text-white font-extrabold text-xs px-4.5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      {updatingId === order.id ? (
                        'Updating...'
                      ) : (
                        <>
                          <CheckCircle size={14} /> 
                          {order.status === 'pending' && 'Accept Order'}
                          {order.status === 'accepted' && 'Start Packing'}
                          {order.status === 'packing' && 'Dispatch Order'}
                          {order.status === 'out_for_delivery' && 'Deliver Order'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        tiffinSubscriptions.length === 0 ? (
          <div className="text-center p-16 border border-dashed border-border/80 bg-card rounded-2xl space-y-3">
            <span className="text-4xl">🍱</span>
            <h3 className="font-extrabold text-lg">No Active Tiffin Services</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Any recurring Tiffin Service subscriptions started by customers will display here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tiffinSubscriptions.map(order => (
              <div key={order.id} className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-accent px-2.5 py-1 rounded-md">
                      ID: {order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      ACTIVE PLAN
                    </span>
                  </div>

                  {/* Plan Information */}
                  <div className="space-y-2 border-t border-b border-border/40 py-3.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tiffin Plan</h4>
                    <ul className="space-y-1.5">
                      {order.order_items
                        .filter(item => item.products?.category?.toLowerCase() === 'tiffin service')
                        .map(item => (
                          <li key={item.id} className="flex justify-between text-sm font-semibold">
                            <span className="text-foreground">{item.products?.name}</span>
                            <span className="text-muted-foreground">Subscribed: {item.quantity} plan</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <User size={14} className="text-orange-500" />
                      <span className="text-foreground font-semibold">{order.users?.full_name || 'Customer'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Phone size={14} className="text-orange-500" />
                      <span>{order.phone_number}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground font-medium">
                      <MapPin size={14} className="text-orange-500 mt-0.5" />
                      <span className="leading-relaxed">{order.delivery_address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-border/40 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Subscription Price</p>
                    <p className="text-lg font-black text-foreground">₹{order.total_amount}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    <Clock size={12} /> Starts Immediately
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default function KitchenDashboard() {
  return (
    <StaffAuthGuard 
      allowedRoles={['admin', 'kitchen']}
      portalId="kitchen"
      portalName="Velto Kitchen Hub"
      portalIcon={<ChefHat className="w-6 h-6" />}
    >
      <div className="min-h-screen bg-background/95 py-10 px-4">
        <KitchenDashboardContent />
      </div>
    </StaffAuthGuard>
  );
}
