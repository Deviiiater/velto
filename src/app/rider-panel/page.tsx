'use client';
import { useState, useEffect } from 'react';
import { getPortalSupabase } from '@/lib/supabase';
import { Bike, Navigation, CheckSquare, Phone, MapPin, DollarSign, Package, Terminal, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import StaffAuthGuard from '@/components/StaffAuthGuard';

const supabase = getPortalSupabase('rider');

const RiderRouteMapNoSSR = dynamic(() => import('@/components/RiderRouteMap'), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full bg-accent animate-pulse rounded-2xl flex items-center justify-center">Initializing Router...</div>
});

type OrderItem = {
  id: string;
  quantity: number;
  products: {
    name: string;
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
  users?: {
    full_name: string | null;
    phone: string | null;
  } | null;
};

// Address parsing helper to decode transit situations & rider info encoded in delivery_address
const parseDeliveryAddress = (fullAddress: string) => {
  if (!fullAddress) return { address: '', eta: '10 mins', situation: 'Clear Skies / Smooth Sailing', riderInfo: '' };
  const parts = fullAddress.split(" || ");
  const address = parts[0];
  if (parts.length < 2) {
    return { address, eta: '10 mins', situation: 'Clear Skies / Smooth Sailing', riderInfo: '' };
  }
  
  const detailsStr = parts[1];
  const detailsParts = detailsStr.split(" | ");
  
  let eta = '10 mins';
  let situation = 'Clear Skies / Smooth Sailing';
  let riderInfo = '';
  
  detailsParts.forEach(part => {
    if (part.startsWith("ETA: ")) {
      eta = part.replace("ETA: ", "");
    } else if (part.startsWith("Situation: ")) {
      situation = part.replace("Situation: ", "");
    } else if (part.startsWith("Rider: ")) {
      riderInfo = part;
    }
  });
  
  return { address, eta, situation, riderInfo };
};

export default function RiderPanel() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [dijkstraLogs, setDijkstraLogs] = useState<string[]>([]);

  // Transit states
  const [transitSituation, setTransitSituation] = useState('Clear Skies / Smooth Sailing');
  const [transitEta, setTransitEta] = useState('10 mins');

  // Local storage shift completed orders
  const [completedStats, setCompletedStats] = useState<{ date: string; count: number }[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);

  // Simulator Transit States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simDistance, setSimDistance] = useState<number | null>(null);
  const [simNextNode, setSimNextNode] = useState("");
  const [simEta, setSimEta] = useState(10);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (activeDelivery) {
      const parsed = parseDeliveryAddress(activeDelivery.delivery_address);
      setTransitSituation(parsed.situation);
      setTransitEta(parsed.eta);
    }
  }, [activeDelivery]);

  const loadCompletedStats = () => {
    try {
      const history = JSON.parse(localStorage.getItem('rider_completed_orders') || '[]');
      setTotalCompleted(history.length);
      
      const stats: Record<string, number> = {};
      history.forEach((h: any) => {
        const date = new Date(h.timestamp).toLocaleDateString(undefined, { dateStyle: 'medium' });
        stats[date] = (stats[date] || 0) + 1;
      });
      setCompletedStats(Object.entries(stats).map(([date, count]) => ({ date, count })));
    } catch (e) {
      console.warn("Failed to load completed rider stats:", e);
    }
  };

  useEffect(() => {
    loadCompletedStats();
  }, [activeDelivery]);

  const fetchRiderData = async () => {
    try {
      // Fetch available packed orders
      const { data: available, error: avError } = await supabase
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
            products (
              name
            )
          )
        `)
        .eq('status', 'accepted')
        .order('created_at', { ascending: true });

      if (avError) throw avError;

      // Fetch active delivery (if any order is out_for_delivery)
      const { data: active, error: acError } = await supabase
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
            products (
              name
            )
          )
        `)
        .eq('status', 'out_for_delivery')
        .limit(1);

      if (acError) throw acError;

      setOrders(available || []);
      const currentActive = active && active.length > 0 ? active[0] : null;
      setActiveDelivery(currentActive);
      
      // Reset simulation states if there is no active delivery
      if (!currentActive) {
        setIsSimulating(false);
        setArrived(false);
        setSimDistance(null);
        setSimNextNode("");
      }
    } catch (e) {
      console.error('Error fetching rider data:', e);
    } finally {
      setLoading(false);
    }
  };

  // 1. Initial portal auth session loader
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    }).catch(() => {
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load rider data & listen for changes when user is logged in
  useEffect(() => {
    if (!user) return;
    
    fetchRiderData();

    // Subscribe to real-time order changes
    const channel = supabase
      .channel('rider-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchRiderData();
        }
      )
      .subscribe();

    // Fallback polling interval in case the WebSocket is restricted, RLS filters block update streams, or Supabase Replication is disabled!
    const fallbackPolling = setInterval(() => {
      fetchRiderData();
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(fallbackPolling);
    };
  }, [user]);

  const acceptOrder = async (orderId: string) => {
    try {
      // Fetch current order to extract raw address
      const { data: orderData, error: fetchErr } = await supabase
        .from('orders')
        .select('delivery_address')
        .eq('id', orderId)
        .single();
      
      if (fetchErr) throw fetchErr;

      const rawAddress = orderData.delivery_address.split(" || ")[0];
      
      // Rider details
      const riderName = user?.email?.split('@')[0] || 'Rider Partner';
      const riderInfo = `Rider: ${riderName} (${user?.email || 'N/A'}) | Tel: 9876543210`;
      
      // Format new address with transit details appended
      const updatedAddress = `${rawAddress} || ETA: 10 mins | Situation: Clear Skies / Smooth Sailing | ${riderInfo}`;

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'out_for_delivery',
          delivery_address: updatedAddress
        })
        .eq('id', orderId);

      if (error) throw error;
      fetchRiderData();
    } catch (e) {
      alert('Failed to accept order.');
    }
  };

  const handleUpdateTransit = async () => {
    if (!activeDelivery) return;
    try {
      const parsed = parseDeliveryAddress(activeDelivery.delivery_address);
      const riderName = user?.email?.split('@')[0] || 'Rider Partner';
      const riderInfo = `Rider: ${riderName} (${user?.email || 'N/A'}) | Tel: 9876543210`;
      const updatedAddress = `${parsed.address} || ETA: ${transitEta} | Situation: ${transitSituation} | ${riderInfo}`;
      
      const { error } = await supabase
        .from('orders')
        .update({ delivery_address: updatedAddress })
        .eq('id', activeDelivery.id);
        
      if (error) throw error;
      alert("Transit status broadcasted successfully! Customer will see it in real-time. ⚡");
      fetchRiderData();
    } catch (e) {
      alert("Failed to update transit conditions.");
    }
  };

  const completeOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'delivered', payment_status: 'paid' })
        .eq('id', orderId);

      if (error) throw error;
      alert('Order successfully marked as DELIVERED! ⚡');
      
      // Save order delivery stats in local shift history
      try {
        const history = JSON.parse(localStorage.getItem('rider_completed_orders') || '[]');
        history.push({
          id: orderId,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('rider_completed_orders', JSON.stringify(history));
      } catch (err) {
        console.warn("Failed to write rider stats to localStorage:", err);
      }

      // Reset simulation states
      setIsSimulating(false);
      setArrived(false);
      setSimDistance(null);
      setSimNextNode("");
      
      fetchRiderData();
    } catch (e) {
      alert('Failed to complete order.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Initializing Velto Rider Panel...</p>
      </div>
    );
  }

  if (!user) {
    return <RiderLoginForm onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Rider Delivery Panel</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Logged in as: <strong className="text-foreground">{user.email}</strong></p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive/25 transition-all"
          >
            Sign Out
          </button>
          <Bike className="w-10 h-10 text-primary animate-bounce hidden sm:block" style={{ animationDuration: '2s' }} />
        </div>
      </div>

      {/* Rider Performance Stats */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            🚴‍♂️ Rider Performance & Shift Deliveries (Day-Wise)
          </h3>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
            Total Deliveries: {totalCompleted}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {completedStats.map((stat, idx) => (
            <div key={idx} className="bg-accent/40 border border-border/80 rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{stat.date}</span>
              <span className="text-lg font-black text-primary mt-1">{stat.count} {stat.count === 1 ? 'Delivery' : 'Deliveries'}</span>
            </div>
          ))}
          {completedStats.length === 0 && (
            <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic">
              No deliveries tracked in this shift yet.
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
          Syncing delivery routes...
        </div>
      ) : activeDelivery ? (
        /* Active Delivery Layout with Map & Monospace Dijkstra Terminal logs */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
          {/* Map Column */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-5 space-y-6">
            <div>
              <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-1 rounded-full">
                🗺️ Dijkstra Shortest Path Router
              </span>
              <p className="text-xs text-muted-foreground mt-2">
                Real-time topological grid resolving optimal path from Dark Store warehouse directly to customer coordinates.
              </p>
            </div>
            
            <RiderRouteMapNoSSR 
              deliveryAddress={activeDelivery.delivery_address} 
              onLogsCalculated={setDijkstraLogs} 
              isSimulating={isSimulating}
              onSimulationProgress={(remainingDist, nextNodeName, etaMinutes) => {
                setSimDistance(remainingDist);
                setSimNextNode(nextNodeName);
                setSimEta(etaMinutes);
              }}
              onSimulationComplete={() => {
                setIsSimulating(false);
                setArrived(true);
                setSimDistance(0);
                setSimNextNode("Arrived at Destination");
                setSimEta(0);
              }}
            />

            {/* Dijkstra Monospace Engine terminal */}
            <div className="bg-[#09090b] border border-border rounded-2xl p-4 font-mono text-[10px] text-green-400 space-y-1 h-[150px] overflow-y-auto shadow-inner">
              <div className="text-muted-foreground border-b border-border/20 pb-1 mb-2 font-sans font-bold flex justify-between items-center text-[10px]">
                <span className="flex items-center gap-1.5"><Terminal size={12} /> SYSTEM DIJKSTRA SOLVER CORE LOGS</span>
                <span className="text-green-500 animate-pulse">● ENGINE ONLINE</span>
              </div>
              {dijkstraLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-muted-foreground mr-1.5">&gt;</span>{log}
                </div>
              ))}
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-1 bg-card border border-primary/20 rounded-2xl shadow-lg p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-1 rounded-full">
                  ⚡ Active Delivery Route
                </span>
                <h2 className="text-xl font-bold mt-3">Order #{activeDelivery.id.slice(0, 8)}</h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {new Date(activeDelivery.created_at).toLocaleTimeString()}
              </span>
            </div>

            {/* Dynamic Simulated Transit Countdown Card */}
            {simDistance !== null && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-xs space-y-2.5 animate-pulse shadow-sm">
                <div className="font-extrabold text-amber-600 flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping inline-block"></span>
                    {arrived ? '🏍️ ARRIVED AT CUSTOMER' : 'RIDER IN TRANSIT 🏍️'}
                  </span>
                  <span className="bg-amber-500/20 px-2 py-0.5 rounded-full font-mono">ETA: {simEta} mins</span>
                </div>
                <div className="text-muted-foreground flex justify-between items-center font-medium">
                  <span>Next point: <strong className="text-foreground">{simNextNode}</strong></span>
                  <span className="text-sm font-black text-foreground">{simDistance.toFixed(2)} km remaining</span>
                </div>
              </div>
            )}

            {(() => {
              const parsedAddress = parseDeliveryAddress(activeDelivery.delivery_address);
              return (
                <div className="border-y border-border py-4 space-y-4">
                  {/* Customer Full Name */}
                  <div className="flex items-center gap-3">
                    <div className="bg-accent p-2 rounded-lg text-muted-foreground"><Users size={18} /></div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Customer Name</div>
                      <div className="font-extrabold text-foreground">
                        {activeDelivery.users?.full_name || 'Anonymous Customer'}
                      </div>
                    </div>
                  </div>

                  {/* Customer Contact */}
                  <div className="flex items-center gap-3">
                    <div className="bg-accent p-2 rounded-lg text-muted-foreground"><Phone size={18} /></div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Customer Phone</div>
                      <a href={`tel:${activeDelivery.phone_number}`} className="font-bold hover:underline text-foreground">
                        {activeDelivery.phone_number}
                      </a>
                    </div>
                  </div>

                  {/* Delivery Location */}
                  <div className="flex items-start gap-3">
                    <div className="bg-accent p-2 rounded-lg text-muted-foreground mt-1"><MapPin size={18} /></div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Delivery Address</div>
                      <div className="font-semibold text-sm text-foreground leading-relaxed mt-0.5">
                        {parsedAddress.address}
                      </div>
                    </div>
                  </div>

                  {/* Collect Amount (COD vs Online) */}
                  <div className="flex items-center gap-3">
                    <div className="bg-accent p-2 rounded-lg text-muted-foreground"><DollarSign size={18} /></div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Collect Payment</div>
                      <div className="font-extrabold text-foreground flex items-center gap-1.5 mt-0.5">
                        ₹{activeDelivery.total_amount}{' '}
                        {activeDelivery.payment_method === 'cod' ? (
                          <span className="text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
                            CASH ON DELIVERY (COD)
                          </span>
                        ) : (
                          <span className="text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded">
                            PAID ONLINE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transit Conditions Adjustment Panel */}
                  <div className="bg-[#9333ea]/5 border border-[#9333ea]/20 rounded-2xl p-4 space-y-3">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider flex items-center gap-1">
                      🌧️ Adjust Transit Situation & ETA
                    </span>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-muted-foreground mb-1">Transit Situation</label>
                        <select 
                          value={transitSituation}
                          onChange={e => setTransitSituation(e.target.value)}
                          className="w-full p-2 bg-background border border-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground animate-none"
                        >
                          <option value="Clear Skies / Smooth Sailing">Clear Skies / Smooth Sailing ☀️</option>
                          <option value="Heavy Rain / Monsoon 🌧️">Heavy Rain / Monsoon 🌧️</option>
                          <option value="Traffic Congestion / Rush Hour 🚗">Traffic Congestion / Rush Hour 🚗</option>
                          <option value="Flat Tire / Bike Repair 🛠️">Flat Tire / Bike Repair 🛠️</option>
                          <option value="Road Closure / Detour 🚧">Road Closure / Detour 🚧</option>
                          <option value="Custom Delay / Incident ⚠️">Custom Delay / Incident ⚠️</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-muted-foreground mb-1">Delivery ETA</label>
                        <select 
                          value={transitEta}
                          onChange={e => setTransitEta(e.target.value)}
                          className="w-full p-2 bg-background border border-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground animate-none"
                        >
                          <option value="5 mins">5 mins ⚡</option>
                          <option value="10 mins">10 mins ⚡</option>
                          <option value="15 mins">15 mins ⏰</option>
                          <option value="20 mins">20 mins ⏰</option>
                          <option value="30 mins">30 mins 🚨</option>
                          <option value="45 mins">45 mins 🚨</option>
                          <option value="60 mins">60 mins 🛑</option>
                        </select>
                      </div>
                      <button 
                        onClick={handleUpdateTransit}
                        className="w-full mt-1 bg-primary text-primary-foreground py-2 rounded-lg font-bold text-xs hover:bg-primary/95 transition-all shadow-sm flex justify-center items-center gap-1.5"
                      >
                        Broadcast Transit Update ⚡
                      </button>
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* Itemized Deliverables */}
            <div className="bg-accent/40 rounded-xl p-4 border border-border/50">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Items in Bag</span>
              <div className="mt-2 space-y-2">
                {activeDelivery.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm items-center py-1">
                    <span className="font-medium">{item.products?.name || 'Item'}</span>
                    <span className="font-bold text-primary">x {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Simulator vs Complete Order */}
            <div className="space-y-3">
              {!arrived && !isSimulating && (
                <button 
                  onClick={() => setIsSimulating(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors shadow-md flex justify-center items-center gap-2"
                >
                  🏍️ Start Transit Simulation
                </button>
              )}

              {isSimulating && (
                <button 
                  disabled
                  className="w-full bg-amber-500/30 text-amber-700 py-3 rounded-xl font-bold cursor-not-allowed flex justify-center items-center gap-2 animate-pulse"
                >
                  ⚡ Transit Simulator Active...
                </button>
              )}

              {arrived && (
                <button 
                  onClick={() => completeOrder(activeDelivery.id)}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md flex justify-center items-center gap-2"
                >
                  <CheckSquare size={20} /> Complete Delivery (Arrived)
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Available Orders List */
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Available Pickups</h2>
          
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-2xl bg-card">
              <Package className="w-12 h-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold text-lg">No orders ready for pickup</h3>
              <p className="text-muted-foreground text-sm">Once the warehouse packs an order, it will show up here instantly!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/50 transition-colors flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}</span>
                        <h3 className="font-bold text-lg mt-0.5">₹{order.total_amount}</h3>
                      </div>
                      <span className="text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded">
                        PACKED • READY
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-1">
                        <MapPin size={14} className="text-muted-foreground/75 mt-0.5" />
                        <span className="line-clamp-1">{order.delivery_address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bike size={14} className="text-muted-foreground/75" />
                        <span>Payment: <strong className="text-foreground uppercase">{order.payment_method}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => acceptOrder(order.id)}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 text-sm shadow-sm mt-2"
                  >
                    <Navigation size={16} /> Accept Delivery
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RiderLoginForm({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (loginError) throw loginError;
      if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-card border border-border rounded-2xl shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-primary/10 text-primary rounded-2xl mb-2">
          <Bike size={32} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Velto Rider Portal</h1>
        <p className="text-muted-foreground text-sm">Sign in to start zooming deliveries to doors!</p>
      </div>

      {error && (
        <div className="p-3.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-semibold text-center">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Rider Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="rider@velto.com"
            className="w-full p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/95 transition-all shadow-[0_4px_12px_rgba(147,51,234,0.15)] flex justify-center items-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Start Delivering 🚴'}
        </button>
      </form>
    </div>
  );
}
