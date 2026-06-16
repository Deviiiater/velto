'use client';
import { useState, useEffect } from 'react';
import { getPortalSupabase } from '@/lib/supabase';
import { Package, CheckCircle, Play, AlertCircle } from 'lucide-react';
import StaffAuthGuard from '@/components/StaffAuthGuard';

const supabase = getPortalSupabase('warehouse');

type OrderItem = {
  id: string;
  quantity: number;
  price_at_time: number;
  products: {
    name: string;
    category: string;
  } | null;
};

type Order = {
  id: string;
  total_amount: number;
  status: 'pending' | 'accepted' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: string;
  payment_method: string;
  delivery_address: string;
  phone_number: string;
  created_at: string;
  order_items: OrderItem[];
};

export default function StorePanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Local storage shift completed orders
  const [packedStats, setPackedStats] = useState<{ date: string; count: number }[]>([]);
  const [totalPacked, setTotalPacked] = useState(0);

  const loadPackedStats = () => {
    try {
      const history = JSON.parse(localStorage.getItem('warehouse_packed_orders') || '[]');
      setTotalPacked(history.length);
      
      const stats: Record<string, number> = {};
      history.forEach((h: any) => {
        const date = new Date(h.timestamp).toLocaleDateString(undefined, { dateStyle: 'medium' });
        stats[date] = (stats[date] || 0) + 1;
      });
      setPackedStats(Object.entries(stats).map(([date, count]) => ({ date, count })));
    } catch (e) {
      console.warn("Failed to load packed warehouse stats:", e);
    }
  };

  useEffect(() => {
    loadPackedStats();
  }, [orders]);

  const fetchOrders = async () => {
    try {
      // Query orders with status not equal to delivered or cancelled, sorting by oldest first
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
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
        .in('status', ['pending', 'packing', 'accepted', 'out_for_delivery'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time changes to keep warehouse updated
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    // Fallback polling interval in case the WebSocket is restricted, RLS filters block update streams, or Supabase Replication is disabled!
    const fallbackPolling = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(fallbackPolling);
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Save order fulfillment record in local shift history
      if (newStatus === 'accepted' || newStatus === 'packing') {
        try {
          const history = JSON.parse(localStorage.getItem('warehouse_packed_orders') || '[]');
          // Avoid duplicate log entries for the same order
          if (!history.some((h: any) => h.id === orderId)) {
            history.push({
              id: orderId,
              timestamp: new Date().toISOString()
            });
            localStorage.setItem('warehouse_packed_orders', JSON.stringify(history));
          }
        } catch (err) {
          console.warn("Failed to write warehouse stats to localStorage:", err);
        }
      }

      fetchOrders();
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'packing': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'accepted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'out_for_delivery': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <StaffAuthGuard
      allowedRoles={['admin', 'warehouse']}
      portalName="Warehouse Operations Portal"
      portalIcon={<Package size={24} />}
      portalId="warehouse"
    >
      <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Dark Store Warehouse</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Fulfill, pack, and prepare incoming grocery orders in real time.</p>
        </div>
        <div className="flex gap-3 justify-start sm:justify-end">
          <div className="bg-card border border-border px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-center shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-amber-500">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold">Pending</div>
          </div>
          <div className="bg-card border border-border px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-center shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-indigo-500">
              {orders.filter(o => o.status === 'packing').length}
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold">Packing</div>
          </div>
        </div>
      </div>

      {/* Warehouse Performance Stats */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            🏪 Storekeeper Fulfillment & Packing Volume (Day-Wise)
          </h3>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
            Total Packed: {totalPacked}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {packedStats.map((stat, idx) => (
            <div key={idx} className="bg-accent/40 border border-border/80 rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{stat.date}</span>
              <span className="text-lg font-black text-primary mt-1">{stat.count} {stat.count === 1 ? 'Order' : 'Orders'}</span>
            </div>
          ))}
          {packedStats.length === 0 && (
            <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic">
              No orders packed in this shift yet.
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
          Loading active orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-2xl bg-card">
          <Package className="w-12 h-12 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg">No active orders</h3>
          <p className="text-muted-foreground text-sm">All set! Waiting for new customers to place orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">Order ID: #{order.id.slice(0, 8)}</span>
                    <h3 className="font-bold text-lg mt-0.5">₹{order.total_amount} Total</h3>
                    <p className="text-xs text-muted-foreground mt-1">Placed at: {new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {/* Items Checklist */}
                <div className="bg-accent/40 rounded-xl p-4 space-y-2 border border-border/50">
                  <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Pick List</span>
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm items-center py-1 border-b border-border/20 last:border-0">
                      <span className="font-medium text-foreground">
                        {item.products?.name || 'Unknown Product'} <span className="text-muted-foreground font-normal">({item.products?.category || 'General'})</span>
                      </span>
                      <span className="font-bold bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground border-t border-border pt-4">
                  <div className="flex justify-between"><span>Payment Method:</span> <span className="font-medium text-foreground uppercase">{order.payment_method}</span></div>
                  <div className="flex justify-between"><span>Phone Number:</span> <span className="font-medium text-foreground">{order.phone_number}</span></div>
                  <div className="flex justify-between gap-4"><span>Address:</span> <span className="font-medium text-foreground text-right line-clamp-1">{order.delivery_address}</span></div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'packing')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors flex items-center gap-2"
                  >
                    <Play size={16} /> Accept & Start Packing
                  </button>
                )}
                {order.status === 'packing' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'accepted')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Mark as Packed (Ready)
                  </button>
                )}
                {order.status === 'accepted' && (
                  <span className="text-xs text-blue-500 font-medium flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
                    <AlertCircle size={14} /> Packed & Waiting for Rider
                  </span>
                )}
                {order.status === 'out_for_delivery' && (
                  <span className="text-xs text-emerald-500 font-medium flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    ⚡ Rider Delivering
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </StaffAuthGuard>
  );
}
