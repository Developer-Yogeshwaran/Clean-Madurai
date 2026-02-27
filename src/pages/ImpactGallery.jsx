import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, MapPin, Award } from 'lucide-react';

// Custom Slider Component
const BeforeAfterSlider = ({ beforeImage, afterImage, location, credits, improvement }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const position = Math.max(0, Math.min(100, (x / width) * 100));
        setSliderPosition(position);
    };

    const handleTouchMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const width = rect.width;
        const position = Math.max(0, Math.min(100, (x / width) * 100));
        setSliderPosition(position);
    };

    return (
        <div className="glass-panel overflow-hidden p-0 flex flex-col h-full rounded-2xl w-full mx-auto" style={{ border: '1px solid var(--border-glass)', maxWidth: '100%' }}>

            {/* Slider Area */}
            <div
                ref={containerRef}
                className="relative w-full cursor-col-resize select-none pointer-events-auto"
                style={{ height: '350px' }}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
            >
                {/* After Image (Background) */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${afterImage})` }}
                ></div>

                {/* Before Image (Foreground, Clipped) */}
                <div
                    className="absolute inset-0 bg-cover bg-center border-r-[4px] border-white/80"
                    style={{
                        backgroundImage: `url(${beforeImage})`,
                        clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                        boxShadow: '4px 0 15px rgba(0,0,0,0.5)'
                    }}
                ></div>

                {/* Slider Handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                    style={{
                        left: `${sliderPosition}%`,
                        transform: 'translateX(-50%)',
                        background: 'rgba(255, 255, 255, 0.9)'
                    }}
                >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-primary-light">
                        <div className="flex gap-1">
                            <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Labels */}
                <span className="absolute bottom-4 left-4 badge badge-danger font-bold uppercase tracking-wider text-xs shadow-md z-10 pointer-events-none">Before</span>
                <span className="absolute bottom-4 right-4 badge badge-primary font-bold uppercase tracking-wider text-xs shadow-md z-10 pointer-events-none">After</span>
            </div>

            {/* Meta Data */}
            <div className="p-4 bg-slate-900 flex justify-between items-center" style={{ background: 'rgba(15, 23, 42, 0.9)' }}>
                <div className="flex items-center gap-2 text-muted text-sm">
                    <MapPin size={16} color="var(--primary)" /> Madurai Verified
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold bg-emerald-900/40 px-2 py-1 rounded">
                        +{improvement}% <Award size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ImpactGallery() {
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                // Mock Data
                setTimeout(() => {
                    setUploads([
                        {
                            id: 'mock1',
                            beforeImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop', // Trash
                            afterImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop', // Clean nature
                            aiScores: { improvementScore: 92, creditsEarned: 150 }
                        },
                        {
                            id: 'mock2',
                            beforeImageUrl: 'https://images.unsplash.com/photo-1605370213797-15c4d32a8ba7?q=80&w=600&auto=format&fit=crop', // Mess
                            afterImageUrl: 'https://images.unsplash.com/photo-1517742131238-bd9d2ea03cb1?q=80&w=600&auto=format&fit=crop', // Clean street
                            aiScores: { improvementScore: 85, creditsEarned: 130 }
                        }
                    ]);
                    setLoading(false);
                }, 800);
                return;
            }

            try {
                // Fetch ONLY approved uploads
                const q = query(collection(db, 'Uploads'), where('approved', '==', true), orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                const fetched = [];
                snap.forEach(doc => {
                    const data = doc.data();
                    if (data.beforeImageUrl && data.afterImageUrl) {
                        fetched.push({ id: doc.id, ...data });
                    }
                });
                setUploads(fetched);
            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
            <div className="text-center mb-12">
                <Camera size={56} className="mx-auto mb-4" style={{ color: 'var(--primary-light)' }} />
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #34d399, #10b981)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    Impact Gallery
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Drag the sliders to witness the real-world transformations driven by the Clean Madurai community. Every pixel represents hard work verified by our AI.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="loader"></div>
                </div>
            ) : uploads.length === 0 ? (
                <div className="text-center glass-panel p-12 text-muted max-w-2xl mx-auto">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl mb-2">No Verified Transformations Yet</h3>
                    <p>When student cleanups are approved by the AI, their before & after photos will appear here.</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {uploads.map((upload) => (
                        <motion.div key={upload.id} variants={itemVariants}>
                            <BeforeAfterSlider
                                beforeImage={upload.beforeImageUrl}
                                afterImage={upload.afterImageUrl}
                                improvement={upload.aiScores?.improvementScore || 0}
                                credits={upload.aiScores?.creditsEarned || 0}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
