import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, HeatmapLayer, Marker, InfoWindow } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { MapPin, Target, Award, User, Flame } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '75vh',
    borderRadius: '16px',
    border: '1px solid var(--border-glass)'
};

const center = {
    lat: 9.9252,
    lng: 78.1198
};

// Distance calculation helper (Haversine formula) in meters
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

const libraries = ['visualization'];

export default function Heatmap() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: libraries
    });

    const [map, setMap] = useState(null);
    const [hotspots, setHotspots] = useState([]);
    const [selectedHotspot, setSelectedHotspot] = useState(null);
    const [loading, setLoading] = useState(true);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    useEffect(() => {
        const fetchMapData = async () => {
            // Mock Data generation if no DB connected
            if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                const mockHotspots = [
                    { lat: 9.9250, lng: 78.1195, count: 12, avgScore: 85, weight: 12, topContributor: 'Sanjay' },
                    { lat: 9.9280, lng: 78.1250, count: 5, avgScore: 70, weight: 5, topContributor: 'Priya' },
                    { lat: 9.9150, lng: 78.1100, count: 20, avgScore: 92, weight: 20, topContributor: 'Rahul' },
                ];
                setHotspots(mockHotspots);
                setLoading(false);
                return;
            }

            try {
                // Fetch both collections concurrently
                const [uploadsSnap, reportsSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, 'Uploads')),
                    getDocs(collection(db, 'PublicReports')),
                    getDocs(collection(db, 'Users'))
                ]);

                // user mapping for "top contributor" data
                const userMap = {};
                usersSnap.forEach(doc => { userMap[doc.id] = doc.data().name || doc.data().displayName; });

                const rawPoints = []; // Unified data array

                // Parse approved Uploads
                uploadsSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.approved && data.latitude && data.longitude) {
                        rawPoints.push({
                            type: 'upload',
                            lat: data.latitude,
                            lng: data.longitude,
                            userId: data.userId,
                            score: data.aiScores?.improvementScore || 0
                        });
                    }
                });

                // Parse Public Reports
                reportsSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.latitude && data.longitude) {
                        rawPoints.push({
                            type: 'report',
                            lat: data.latitude,
                            lng: data.longitude,
                            userId: data.userId,
                            score: 0 // Reports don't inherently have an AI score yet
                        });
                    }
                });

                // Cluster Logic: Group by 200m radius
                const clusters = [];

                rawPoints.forEach(point => {
                    let addedToCluster = false;
                    for (let cluster of clusters) {
                        const dist = getDistance(cluster.lat, cluster.lng, point.lat, point.lng);
                        if (dist <= 200) { // Within 200m radius!
                            cluster.points.push(point);
                            // Keep center slightly weighted to the average location? Not needed.
                            addedToCluster = true;
                            break;
                        }
                    }
                    if (!addedToCluster) {
                        clusters.push({ lat: point.lat, lng: point.lng, points: [point] });
                    }
                });

                // Map clusters into Heatmap Hotspot Data objects
                const processedHotspots = clusters.map(cluster => {
                    const uploads = cluster.points.filter(p => p.type === 'upload');
                    const avgScore = uploads.length ? (uploads.reduce((sum, p) => sum + p.score, 0) / uploads.length).toFixed(1) : 0;

                    // Count contributions
                    const userCounts = {};
                    cluster.points.forEach(p => {
                        if (p.userId && p.userId !== 'anonymous') {
                            userCounts[p.userId] = (userCounts[p.userId] || 0) + 1;
                        }
                    });

                    let topUserId = null;
                    let maxContributions = 0;
                    for (const [uid, count] of Object.entries(userCounts)) {
                        if (count > maxContributions) {
                            topUserId = uid;
                            maxContributions = count;
                        }
                    }

                    return {
                        lat: cluster.lat,
                        lng: cluster.lng,
                        count: cluster.points.length, // Heat intensity
                        weight: cluster.points.length,
                        avgScore,
                        topContributor: topUserId ? userMap[topUserId] : 'Community'
                    };
                });

                setHotspots(processedHotspots);

            } catch (error) {
                console.error("Error fetching map data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMapData();
    }, []);

    const heatmapData = useMemo(() => {
        if (!isLoaded || !window.google || hotspots.length === 0) return [];
        return hotspots.map(point => ({
            location: new window.google.maps.LatLng(point.lat, point.lng),
            weight: point.count // Intensity strictly equals the amount of clustered points
        }));
    }, [isLoaded, hotspots]);

    return (
        <div className="container" style={{ paddingBottom: '3rem', paddingTop: '3rem' }}>
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4"><MapPin size={48} color="#ef4444" /></div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dynamic Heatmap Engine</h2>
                <p style={{ color: 'var(--text-muted)' }}>Real-time clustering engine showing the density of community reports and certified cleanups within a 200m radius.</p>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '0.5rem', position: 'relative' }}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(5px)' }}>
                        <div className="text-center text-primary font-bold animate-pulse text-xl">Compiling Geospatial Data...</div>
                    </div>
                )}

                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={13}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        options={{ styles: darkMapStyle, disableDefaultUI: true, zoomControl: true }}
                    >
                        {heatmapData.length > 0 && (
                            <HeatmapLayer
                                data={heatmapData}
                                options={{
                                    radius: 40,
                                    opacity: 0.8,
                                    gradient: ['rgba(0, 255, 255, 0)', 'rgba(0, 255, 255, 1)', 'rgba(0, 191, 255, 1)', 'rgba(0, 127, 255, 1)', 'rgba(0, 63, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 223, 1)', 'rgba(0, 0, 191, 1)', 'rgba(0, 0, 159, 1)', 'rgba(0, 0, 127, 1)', 'rgba(63, 0, 91, 1)', 'rgba(127, 0, 63, 1)', 'rgba(191, 0, 31, 1)', 'rgba(255, 0, 0, 1)']
                                }}
                            />
                        )}

                        {hotspots.map((spot, idx) => (
                            <Marker
                                key={idx}
                                position={{ lat: spot.lat, lng: spot.lng }}
                                onClick={() => setSelectedHotspot(spot)}
                                icon={{
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    scale: 0, // Hidden marker, just listening for clicks on the hotspot epicenter
                                }}
                            />
                        ))}

                        <AnimatePresence>
                            {selectedHotspot && (
                                <InfoWindow
                                    position={{ lat: selectedHotspot.lat, lng: selectedHotspot.lng }}
                                    onCloseClick={() => setSelectedHotspot(null)}
                                    options={{ pixelOffset: new window.google.maps.Size(0, -20) }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="popup-inner p-3 rounded-lg"
                                        style={{ color: '#0f172a', minWidth: '220px' }} // Google maps requires distinct text coloring inline
                                    >
                                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2"><Flame color="#ef4444" size={18} /> Hotspot Data</h3>

                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                                <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Target size={12} /> Cleanups</span>
                                                <span className="font-bold text-md text-amber-600">{selectedHotspot.count}</span>
                                            </div>

                                            <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                                <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Award size={12} /> Avg Improve</span>
                                                <span className="font-bold text-md text-emerald-600">{selectedHotspot.avgScore > 0 ? `+${selectedHotspot.avgScore}%` : 'N/A'}</span>
                                            </div>

                                            <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                                <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><User size={12} /> Top Hero</span>
                                                <span className="font-bold text-md text-indigo-600 truncate max-w-[100px]">{selectedHotspot.topContributor}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </InfoWindow>
                            )}
                        </AnimatePresence>
                    </GoogleMap>
                ) : (
                    <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Loading Map...' : 'Google Maps API Key is missing. Connect your API key to view.'}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// Custom Premium Dark Map Theme
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];
