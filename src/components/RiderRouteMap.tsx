'use client';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Terminal } from 'lucide-react';

type Coordinate = [number, number];

type GraphNode = {
  id: string;
  name: string;
  coords: Coordinate;
};

type Edge = {
  from: string;
  to: string;
  weight: number;
  traffic: 'low' | 'moderate' | 'heavy';
};

type DijkstraResult = {
  path: Coordinate[];
  pathIds: string[];
  logs: string[];
  totalDistance: number;
};

// Fix Leaflet marker icon asset paths
const createIcon = (color: string, emoji: string) => {
  return new L.DivIcon({
    html: `<div style="background-color: ${color}; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);" class="relative flex h-7 w-7 rounded-full items-center justify-center"><span class="text-xs">${emoji}</span><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-30"></span></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const storeIcon = createIcon('#9333ea', '🏪'); // Purple Dark Store / GPS Marker
const customerIcon = createIcon('#06b6d4', '🏠'); // Cyan Customer
const riderIcon = new L.DivIcon({
  html: `<div class="relative flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 border-2 border-white shadow-xl animate-bounce" style="animation-duration: 1.2s;"><span class="text-sm">🏍️</span><span class="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40 animate-ping"></span></div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Component to dynamically pan map view during transit simulation
function MapAutoCenter({ center }: { center: Coordinate }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(center, { animate: true, duration: 0.8 });
  }, [center, map]);
  return null;
}

export default function RiderRouteMap({ 
  deliveryAddress, 
  onLogsCalculated,
  isSimulating = false,
  onSimulationProgress,
  onSimulationComplete
}: { 
  deliveryAddress: string;
  onLogsCalculated?: (logs: string[]) => void;
  isSimulating?: boolean;
  onSimulationProgress?: (remainingDist: number, nextNodeName: string, etaMinutes: number) => void;
  onSimulationComplete?: () => void;
}) {
  const [customerCoords, setCustomerCoords] = useState<Coordinate | null>(null);
  const [routeResult, setRouteResult] = useState<DijkstraResult | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Simulation Position State
  const [riderIndex, setRiderIndex] = useState<number>(0);
  const [riderCoords, setRiderCoords] = useState<Coordinate | null>(null);

  // Dynamic Rider Start Coordinates (Defaults to Warehouse Store, updates with Geolocation GPS)
  const [riderStartCoords, setRiderStartCoords] = useState<Coordinate>([28.6139, 77.2090]);
  const [isGpsEnabled, setIsGpsEnabled] = useState(false);

  // Fetch actual rider device browser location coordinates
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setRiderStartCoords([lat, lng]);
          setIsGpsEnabled(true);
          console.log(`Live Rider GPS Enabled: Lat ${lat}, Lng ${lng}`);
        },
        (error) => {
          console.warn("Rider blocked GPS/Geolocation permission or failed. Defaulting to warehouse.", error);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Helper to compute Euclidean distance weight in km
  const getDistance = (c1: Coordinate, c2: Coordinate) => {
    const R = 6371; // Earth's radius in km
    const dLat = (c2[0] - c1[0]) * Math.PI / 180;
    const dLon = (c2[1] - c1[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(c1[0] * Math.PI / 180) * Math.cos(c2[0] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    // 1. Parse customer coordinates
    let parsedCoords: Coordinate = [28.6250, 77.2200]; // Delhi fallback
    const match = deliveryAddress.match(/Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        parsedCoords = [lat, lng];
      }
    }
    setCustomerCoords(parsedCoords);

    // 2. Generate intermediate nodes dynamically relative to the solved vector
    const [x1, y1] = riderStartCoords;
    const [x2, y2] = parsedCoords;

    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Perpendicular vector for layout variety
    const px = -dy;
    const py = dx;

    const nodeA_coords: Coordinate = [x1 + 0.3 * dx + 0.15 * px, y1 + 0.3 * dy + 0.15 * py];
    const nodeB_coords: Coordinate = [x1 + 0.35 * dx - 0.15 * px, y1 + 0.35 * dy - 0.15 * py];
    const nodeC_coords: Coordinate = [x1 + 0.65 * dx + 0.15 * px, y1 + 0.65 * dy + 0.15 * py];
    const nodeD_coords: Coordinate = [x1 + 0.7 * dx - 0.15 * px, y1 + 0.7 * dy - 0.15 * py];

    const graphNodes: GraphNode[] = [
      { id: 'store', name: isGpsEnabled ? 'Rider GPS Start' : 'Dark Store (Warehouse)', coords: riderStartCoords },
      { id: 'node_a', name: 'Intersection A', coords: nodeA_coords },
      { id: 'node_b', name: 'Intersection B', coords: nodeB_coords },
      { id: 'node_c', name: 'Ring Road C', coords: nodeC_coords },
      { id: 'node_d', name: 'Sector Gate D', coords: nodeD_coords },
      { id: 'customer', name: 'Customer Target', coords: parsedCoords }
    ];
    setNodes(graphNodes);

    // 3. Create edges with varying traffic weights based on actual distances
    const graphEdges: Edge[] = [
      { from: 'store', to: 'node_a', weight: getDistance(riderStartCoords, nodeA_coords) * 1.1, traffic: 'moderate' },
      { from: 'store', to: 'node_b', weight: getDistance(riderStartCoords, nodeB_coords) * 1.5, traffic: 'heavy' },
      { from: 'node_a', to: 'node_c', weight: getDistance(nodeA_coords, nodeC_coords) * 1.0, traffic: 'low' },
      { from: 'node_b', to: 'node_d', weight: getDistance(nodeB_coords, nodeD_coords) * 1.2, traffic: 'moderate' },
      { from: 'node_a', to: 'node_d', weight: getDistance(nodeA_coords, nodeD_coords) * 2.0, traffic: 'heavy' },
      { from: 'node_b', to: 'node_c', weight: getDistance(nodeB_coords, nodeC_coords) * 1.1, traffic: 'low' },
      { from: 'node_c', to: 'customer', weight: getDistance(nodeC_coords, parsedCoords) * 1.0, traffic: 'low' },
      { from: 'node_d', to: 'customer', weight: getDistance(nodeD_coords, parsedCoords) * 1.2, traffic: 'moderate' }
    ];
    setEdges(graphEdges);

    // 4. Dijkstra Shortest Path Engine
    const solveDijkstra = (): DijkstraResult => {
      const logsList: string[] = [];
      logsList.push('⚡ Dijkstra Router Initialized.');
      logsList.push(isGpsEnabled ? `📍 Live GPS registered starting coordinates: [${x1.toFixed(4)}, ${y1.toFixed(4)}]` : '📡 Using dark store warehouse fallback coordinates.');
      logsList.push('Graph constructed containing 6 vertices, 8 edges.');

      const adj: { [key: string]: { node: string; weight: number }[] } = {};
      graphNodes.forEach(n => adj[n.id] = []);
      graphEdges.forEach(e => {
        adj[e.from].push({ node: e.to, weight: e.weight });
        adj[e.to].push({ node: e.from, weight: e.weight });
      });

      const dist: { [key: string]: number } = {};
      const prev: { [key: string]: string | null } = {};
      const queue: string[] = [];

      graphNodes.forEach(node => {
        dist[node.id] = Infinity;
        prev[node.id] = null;
        queue.push(node.id);
      });

      dist['store'] = 0;
      logsList.push(`Set cost to starting node [STORE] as 0.00km.`);

      while (queue.length > 0) {
        queue.sort((a, b) => dist[a] - dist[b]);
        const u = queue.shift()!;

        logsList.push(`Evaluating node: [${u.toUpperCase()}] current cost: ${dist[u] === Infinity ? 'Infinity' : dist[u].toFixed(2) + 'km'}`);

        if (u === 'customer') {
          logsList.push('🏆 Dijkstra successfully resolved the shortest path to Customer Target!');
          break;
        }

        if (dist[u] === Infinity) {
          logsList.push('⚠️ Unreachable nodes encountered.');
          break;
        }

        const neighbors = adj[u];
        neighbors.forEach(neighbor => {
          if (queue.includes(neighbor.node)) {
            const alt = dist[u] + neighbor.weight;
            if (alt < dist[neighbor.node]) {
              logsList.push(`  → Relaxing edge: ${u.toUpperCase()} ➔ ${neighbor.node.toUpperCase()} (${neighbor.weight.toFixed(2)}km) - New dist: ${alt.toFixed(2)}km`);
              dist[neighbor.node] = alt;
              prev[neighbor.node] = u;
            }
          }
        });
      }

      const pathIds: string[] = [];
      let curr: string | null = 'customer';
      while (curr !== null) {
        pathIds.unshift(curr);
        curr = prev[curr];
      }

      const pathCoords = pathIds.map(id => graphNodes.find(n => n.id === id)!.coords);
      logsList.push(`Optimal path completed: [${pathIds.map(id => id.toUpperCase()).join(' ➔ ')}]`);

      return {
        path: pathCoords,
        pathIds,
        logs: logsList,
        totalDistance: dist['customer']
      };
    };

    const result = solveDijkstra();
    setRouteResult(result);
    setRiderCoords(riderStartCoords);
    setRiderIndex(0);

    if (onLogsCalculated) {
      onLogsCalculated(result.logs);
    }
  }, [deliveryAddress, riderStartCoords]);

  // Reset index when simulation starts
  useEffect(() => {
    if (isSimulating) {
      setRiderIndex(0);
      setRiderCoords(riderStartCoords);
    }
  }, [isSimulating, riderStartCoords]);

  // Handle active transit simulator loop (simply steps riderIndex forward)
  useEffect(() => {
    if (!isSimulating || !routeResult) return;

    const interval = setInterval(() => {
      setRiderIndex(prevIndex => {
        if (prevIndex >= routeResult.path.length - 1) {
          clearInterval(interval);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 2000); // Shift position every 2 seconds

    return () => clearInterval(interval);
  }, [isSimulating, routeResult]);

  // Handle side-effects: calculate distance countdowns and trigger parent notifications cleanly
  useEffect(() => {
    if (!routeResult) return;

    // Update rider coords
    const newCoords = routeResult.path[riderIndex];
    setRiderCoords(newCoords);

    // Skip parent callbacks if we are at start or not simulating
    if (!isSimulating || riderIndex === 0) return;

    // Compute remaining segment distances
    let remainingDistance = 0;
    for (let i = riderIndex; i < routeResult.path.length - 1; i++) {
      remainingDistance += getDistance(routeResult.path[i], routeResult.path[i+1]);
    }

    const nextNodeId = routeResult.pathIds[riderIndex];
    const nextNode = nodes.find(n => n.id === nextNodeId);
    const nextNodeName = nextNode ? nextNode.name : 'Destination';

    // Scale realistically: average bike speed of 30 km/h -> 2 minutes per km
    const etaMinutes = Math.ceil(remainingDistance * 2);

    if (onSimulationProgress) {
      onSimulationProgress(remainingDistance, nextNodeName, etaMinutes);
    }

    // Output trace statement to core terminal log callback
    if (onLogsCalculated) {
      const transitLog = `🏍️ Rider passed [${nextNodeName.toUpperCase()}] - Remaining distance: ${remainingDistance.toFixed(2)}km (ETA: ${etaMinutes} mins)`;
      onLogsCalculated([...routeResult.logs, transitLog]);
    }

    if (riderIndex === routeResult.path.length - 1) {
      if (onSimulationComplete) onSimulationComplete();
    }
  }, [riderIndex, isSimulating, routeResult]);

  if (!customerCoords || !routeResult || !riderCoords) return null;

  // Split paths into Covered vs Remaining
  const coveredPath = routeResult.path.slice(0, riderIndex + 1);
  const remainingPath = routeResult.path.slice(riderIndex);

  return (
    <div className="space-y-4">
      {/* Map display */}
      <div className="relative border border-primary/20 rounded-2xl overflow-hidden h-[320px] shadow-inner">
        <MapContainer 
          center={riderStartCoords} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Autocenter map to track rider coordinate */}
          {isSimulating && <MapAutoCenter center={riderCoords} />}

          {/* Draw possible edge topologies */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            
            const isTrafficHeavy = edge.traffic === 'heavy';
            const isTrafficModerate = edge.traffic === 'moderate';
            const edgeColor = isTrafficHeavy ? '#ef4444' : isTrafficModerate ? '#f59e0b' : '#3b82f6';

            return (
              <Polyline 
                key={idx} 
                positions={[fromNode.coords, toNode.coords]} 
                pathOptions={{ 
                  color: edgeColor, 
                  weight: 1.5, 
                  dashArray: '4, 8',
                  opacity: 0.5 
                }} 
              />
            );
          })}

          {/* Render Covered path (Dashed Gray) */}
          {coveredPath.length > 1 && (
            <Polyline 
              positions={coveredPath} 
              pathOptions={{ 
                color: '#6b7280', 
                weight: 4, 
                opacity: 0.5,
                dashArray: '3, 6'
              }} 
            />
          )}

          {/* Render Remaining Path (Solid Glowing Purple) */}
          {remainingPath.length > 1 && (
            <Polyline 
              positions={remainingPath} 
              pathOptions={{ 
                color: '#9333ea', 
                weight: 6, 
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round'
              }} 
            />
          )}

          {/* Intermediate Circle Nodes */}
          {nodes.map((node) => {
            const isAnchor = node.id === 'store' || node.id === 'customer';
            if (isAnchor) return null;

            return (
              <CircleMarker 
                key={node.id} 
                center={node.coords} 
                radius={5} 
                pathOptions={{ 
                  color: '#4b5563', 
                  fillColor: '#9ca3af', 
                  fillOpacity: 1, 
                  weight: 1 
                }}
              >
                <Popup>
                  <div className="text-xs font-semibold">{node.name}</div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Dynamic Starting Point Pin (GPS vs Store) */}
          <Marker position={riderStartCoords} icon={storeIcon}>
            <Popup>
              <div className="text-xs font-bold text-primary">
                {isGpsEnabled ? '📍 Rider Active Start (GPS Live)' : '🏪 Dark Store Warehouse (Default Start)'}
              </div>
            </Popup>
          </Marker>

          {/* Customer Destination Pin */}
          <Marker position={customerCoords} icon={customerIcon}>
            <Popup>
              <div className="text-xs font-bold text-cyan-600">🏠 Customer Target</div>
            </Popup>
          </Marker>

          {/* Active Rider Bike Marker */}
          <Marker position={riderCoords} icon={riderIcon}>
            <Popup>
              <div className="text-xs font-bold text-amber-600">🏍️ Rider in Transit</div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Dynamic Legend / Simulation Stats Overlay */}
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-border p-3 rounded-2xl shadow-lg z-[1000] text-[10px] space-y-2 font-semibold">
          <div className="text-xs text-primary font-extrabold flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping inline-block"></span> Transit Details
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block"></span> 
              {isGpsEnabled ? 'Rider GPS Position' : 'Dark Store (Default)'}
            </div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-500 inline-block"></span> Customer Home</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block"></span> 🏍️ Rider Position</div>
            <div className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-primary inline-block"></span> Remaining Route</div>
            <div className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-gray-400 inline-block"></span> Covered Path</div>
          </div>
        </div>

        {/* GPS Live Tracking Info Pill */}
        <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm border border-primary/30 p-2.5 rounded-xl shadow-lg z-[1000] text-[10px] font-mono flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isGpsEnabled ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
          <span className="text-white">
            {isGpsEnabled ? '📍 LIVE RIDER GPS ACTIVE' : '📡 USING DEFAULT WAREHOUSE GPS'}
          </span>
        </div>
      </div>
    </div>
  );
}
