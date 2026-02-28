import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Certificate from '../components/Certificate';
import { UploadCloud, CheckCircle, Target, Award, Leaf, TrendingUp, History, Lock } from 'lucide-react';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const [beforeImage, setBeforeImage] = useState(null);
    const [afterImage, setAfterImage] = useState(null);
    const [previewBefore, setPreviewBefore] = useState('');
    const [previewAfter, setPreviewAfter] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'upload' | 'cert'
    const [uploads, setUploads] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        if (!import.meta.env.VITE_FIREBASE_API_KEY) {
            // Mock real-time data if demo
            setUploads([
                { id: '1', aiScores: { improvementScore: 60, creditsEarned: 120 }, approved: true, createdAt: { toDate: () => new Date(Date.now() - 100000000) } },
                { id: '2', aiScores: { improvementScore: 80, creditsEarned: 160 }, approved: true, createdAt: { toDate: () => new Date(Date.now() - 50000000) } },
                { id: '3', aiScores: { improvementScore: 75, creditsEarned: 150 }, approved: true, createdAt: { toDate: () => new Date() } }
            ]);
            return;
        }

        const q = query(
            collection(db, 'Uploads'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = [];
            snapshot.forEach(doc => {
                fetched.push({ id: doc.id, ...doc.data() });
            });
            setUploads(fetched);
        });

        return () => unsubscribe();
    }, [currentUser]);

    if (!currentUser) {
        return (
            <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--danger)' }}>Please log in to access your dashboard.</h2>
            </div>
        );
    }

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'before') {
                setBeforeImage(file);
                setPreviewBefore(URL.createObjectURL(file));
            } else {
                setAfterImage(file);
                setPreviewAfter(URL.createObjectURL(file));
            }
        }
    };

    const processUpload = async () => {
        if (!beforeImage || !afterImage) {
            toast.error('Please upload both before and after images');
            return;
        }

        setLoading(true);
        let coords = { latitude: 9.9252, longitude: 78.1198 }; // Default to Madurai Center

        try {
            if (navigator.geolocation) {
                const pos = await Promise.race([
                    new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true })),
                    new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout")), 4000))
                ]);
                coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            }
        } catch (err) {
            // Silently use default coordinates (Madurai Center) on error, timeout, or denial
            console.warn("Location error/timeout, using default coordinates.", err.message);
        }

        try {
            if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                setUploadProgress(100);
                setTimeout(() => {
                    toast.success(`Success! Mock upload complete.`);
                    setUploadProgress(0);
                    setLoading(false);
                    setBeforeImage(null); setAfterImage(null);
                    setPreviewBefore(''); setPreviewAfter('');
                }, 1000);
                return;
            }

            toast('Uploading cleanup... Our Cloud AI will verify it shortly.', { icon: '☁️' });

            const bRef = ref(storage, `Uploads/${currentUser.uid}/${Date.now()}_before`);
            const aRef = ref(storage, `Uploads/${currentUser.uid}/${Date.now()}_after`);

            const bUploadContext = uploadBytesResumable(bRef, beforeImage);
            bUploadContext.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
                setUploadProgress(progress);
            });
            await bUploadContext;

            const aUploadContext = uploadBytesResumable(aRef, afterImage);
            aUploadContext.on('state_changed', (snapshot) => {
                const progress = 50 + (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
                setUploadProgress(progress);
            });
            await aUploadContext;

            const bUrl = await getDownloadURL(bRef);
            const aUrl = await getDownloadURL(aRef);

            await addDoc(collection(db, 'Uploads'), {
                userId: currentUser.uid,
                beforeImageUrl: bUrl,
                afterImageUrl: aUrl,
                latitude: coords.latitude,
                longitude: coords.longitude,
                createdAt: serverTimestamp(),
                approved: false
            });

            setUploadProgress(100);
            toast.success('Upload submitted successfully! AI is evaluating it in the background.');

            setTimeout(() => {
                setUploadProgress(0); setLoading(false);
                setBeforeImage(null); setAfterImage(null);
                setPreviewBefore(''); setPreviewAfter('');
                setActiveTab('overview');
            }, 1000);

        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const getNextMilestone = (cleanups) => {
        if (cleanups < 5) return { target: 5, name: 'Bronze', remaining: 5 - cleanups };
        if (cleanups < 10) return { target: 10, name: 'Silver', remaining: 10 - cleanups };
        if (cleanups < 20) return { target: 20, name: 'Gold', remaining: 20 - cleanups };
        return { target: 20, name: 'Max Level Reached', remaining: 0 };
    };

    const nextMilestone = getNextMilestone(currentUser.totalCleanups || 0);
    const progressPercent = Math.min(100, ((currentUser.totalCleanups || 0) / nextMilestone.target) * 100);

    const chartData = {
        labels: [...uploads].reverse().map((u, i) => `Entry ${i + 1}`),
        datasets: [
            {
                label: 'AI Improvement Score',
                data: [...uploads].reverse().map(u => u.aiScores?.improvementScore || 0),
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: '#10b981',
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#10b981'
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#10b981',
                bodyColor: '#fff',
                borderColor: '#10b981',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'var(--text-muted)' }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'var(--text-muted)' }
            }
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>

            {/* Header Section */}
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Leaf color="var(--primary)" /> Student Dashboard
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Welcome back, <span className="text-secondary font-bold">{currentUser.name}</span>! Track your impact.</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel text-center" style={{ borderTop: '4px solid var(--primary)' }}>
                    <div className="flex justify-center mb-2"><Award color="var(--primary)" size={32} /></div>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-light)' }}>{currentUser.totalCredits || 0}</h3>
                    <p className="text-muted tracking-wide max-uppercase" style={{ fontSize: '0.875rem' }}>Total Credits Earned</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel text-center" style={{ borderTop: '4px solid #f59e0b' }}>
                    <div className="flex justify-center mb-2"><Target color="#f59e0b" size={32} /></div>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{currentUser.totalCleanups || 0}</h3>
                    <p className="text-muted tracking-wide max-uppercase" style={{ fontSize: '0.875rem' }}>Verified Cleanups</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ borderTop: '4px solid #3b82f6' }}>
                    <h4 className="mb-3 text-center" style={{ fontSize: '1.2rem' }}>Your Badges</h4>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {(currentUser.badges || []).includes('Eco Starter') ? <span className="badge badge-bronze padding-4 text-xs">🥉 Eco</span> : <span className="badge opacity-50 text-xs"><Lock size={12} className="inline mr-1" /> Eco</span>}
                        {(currentUser.badges || []).includes('Green Warrior') ? <span className="badge badge-silver text-xs">🥈 Warrior</span> : <span className="badge opacity-50 text-xs"><Lock size={12} className="inline mr-1" /> Warrior</span>}
                        {(currentUser.badges || []).includes('Madurai Hero') ? <span className="badge badge-gold text-xs">🥇 Hero</span> : <span className="badge opacity-50 text-xs"><Lock size={12} className="inline mr-1" /> Hero</span>}
                    </div>
                </motion.div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-6 border-b border-glass" style={{ borderColor: 'var(--border-glass)' }}>
                <button onClick={() => setActiveTab('overview')} className={`btn ${activeTab === 'overview' ? 'btn-outline' : 'btn-glass'}`} style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}>
                    Overview
                </button>
                <button onClick={() => setActiveTab('upload')} className={`btn ${activeTab === 'upload' ? 'btn-outline' : 'btn-glass'}`} style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}>
                    <UploadCloud size={16} className="inline mr-2" /> Submit Cleanup
                </button>
                {(currentUser.totalCredits || 0) >= 500 && (
                    <button onClick={() => setActiveTab('cert')} className={`btn ${activeTab === 'cert' ? 'btn-outline' : 'btn-glass'}`} style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}>
                        Certificates
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Chart & Progress */}
                        <div className="lg:col-span-2 space-y-6">

                            <div className="glass-panel">
                                <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: '1.3rem' }}><TrendingUp color="var(--primary)" /> AI Improvement Graph</h3>
                                {uploads.filter(u => u.aiScores).length > 0 ? (
                                    <div style={{ height: '300px' }}>
                                        <Line data={chartData} options={chartOptions} />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center p-8 text-muted border border-dashed rounded-xl" style={{ borderColor: 'var(--border-glass)' }}>
                                        <p>No verified cleanups yet to construct graph.</p>
                                    </div>
                                )}
                            </div>

                            <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                                <h3 className="mb-2 flex items-center gap-2" style={{ fontSize: '1.3rem' }}><CheckCircle color="#f59e0b" /> Certificate Eligibility Progress</h3>
                                <p className="text-muted text-sm mb-4">You need {nextMilestone.remaining} more cleanups to unlock the {nextMilestone.name} certificate tier.</p>

                                <div style={{ width: '100%', height: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '999px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #34d399)', borderRadius: '999px' }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-muted font-bold">
                                    <span>{currentUser.totalCleanups || 0} Cleanups</span>
                                    <span>Target: {nextMilestone.target}</span>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Recent Uploads */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-panel" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                <h3 className="mb-4 flex items-center gap-2 sticky top-0" style={{ fontSize: '1.3rem', background: 'var(--bg-card)', paddingBottom: '0.5rem', zIndex: 10 }}><History color="var(--primary-light)" /> Recent Submissions</h3>

                                <div className="space-y-4">
                                    {uploads.length === 0 ? (
                                        <p className="text-center text-muted text-sm py-4">No submissions yet.</p>
                                    ) : (
                                        uploads.map(upload => (
                                            <div key={upload.id} className="p-3 rounded-xl border border-glass" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className={`badge text-xs ${upload.approved ? 'badge-bronze' : ''}`} style={{ padding: '2px 8px', opacity: upload.approved ? 1 : 0.6 }}>
                                                        {upload.approved ? 'AI Verified' : 'Pending AI Sync'}
                                                    </span>
                                                    <span className="text-xs text-muted">
                                                        {upload.createdAt?.toDate ? upload.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                                    </span>
                                                </div>

                                                {upload.aiScores && (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                                            <div className="text-center bg-slate-800 rounded p-2" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                                                                <span className="block text-xl font-bold text-primary-light">+{upload.aiScores.improvementScore}%</span>
                                                                <span className="text-[10px] text-muted uppercase">Improvement</span>
                                                            </div>
                                                            <div className="text-center bg-slate-800 rounded p-2" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                                                                <span className="block text-xl font-bold text-amber-500">{upload.aiScores.creditsEarned || 0}</span>
                                                                <span className="text-[10px] text-muted uppercase">Credits</span>
                                                            </div>
                                                        </div>

                                                        {upload.aiScores.garbageType && (
                                                            <div className="mt-2 text-center bg-slate-800 rounded p-1.5" style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
                                                                <span className="text-[11px] text-sky-400 font-medium">
                                                                    Type: {Array.isArray(upload.aiScores.garbageType)
                                                                        ? upload.aiScores.garbageType.join(', ')
                                                                        : upload.aiScores.garbageType}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'upload' && (
                    <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass-panel p-6 md:p-10 max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold mb-2 flex justify-center items-center gap-2"><UploadCloud color="var(--primary)" size={32} /> Submit Cleanup Proof</h3>
                            <p className="text-muted">Upload clear before and after photos. The AI model checks improvement to assign appropriate credits.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="text-center">
                                <h4 className="mb-3 font-semibold text-danger">BEFORE CLEANING</h4>
                                {previewBefore ? (
                                    <div className="relative group">
                                        <img src={previewBefore} alt="Before" className="img-preview" style={{ height: '250px' }} />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity rounded-xl">
                                            <button className="btn btn-danger btn-sm" onClick={() => { setBeforeImage(null); setPreviewBefore('') }}>Remove</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="upload-area relative flex justify-center items-center flex-col gap-3 cursor-pointer" style={{ height: '250px', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => document.getElementById('before').click()}>
                                        <input type="file" id="before" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageChange(e, 'before')} />
                                        <div className="flex flex-col items-center justify-center text-muted hover:text-white transition-colors">
                                            <UploadCloud size={40} className="mb-2 opacity-50" />
                                            <span>Click to browse</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-center">
                                <h4 className="mb-3 font-semibold text-primary">AFTER CLEANING</h4>
                                {previewAfter ? (
                                    <div className="relative group">
                                        <img src={previewAfter} alt="After" className="img-preview" style={{ height: '250px' }} />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity rounded-xl">
                                            <button className="btn btn-danger btn-sm" onClick={() => { setAfterImage(null); setPreviewAfter('') }}>Remove</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="upload-area relative flex justify-center items-center flex-col gap-3 cursor-pointer" style={{ height: '250px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)' }} onClick={() => document.getElementById('after').click()}>
                                        <input type="file" id="after" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageChange(e, 'after')} />
                                        <div className="flex flex-col items-center justify-center text-muted hover:text-white transition-colors">
                                            <UploadCloud size={40} className="mb-2 opacity-50" />
                                            <span>Click to browse</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center">
                            <button className="btn btn-primary w-full md:w-1/2 mx-auto py-3 text-lg font-bold" disabled={loading || !beforeImage || !afterImage} onClick={processUpload}>
                                {loading ? 'Transmitting To AI Engine...' : 'Submit Evidence'}
                            </button>

                            {loading && uploadProgress > 0 && (
                                <div className="mt-6 mx-auto" style={{ maxWidth: '400px' }}>
                                    <div className="flex justify-between text-xs text-muted mb-1 font-bold">
                                        <span>UPLOADING</span> <span>{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ width: `${uploadProgress}%`, background: 'var(--primary)', height: '100%', borderRadius: '999px', transition: 'width 0.3s' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'cert' && (
                    <motion.div key="cert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel p-8">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Award color="#facc15" /> Your Verified Certificates</h3>
                        <p className="text-muted mb-8">Download your official verified PDF certificates generated by the Cloud.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['Bronze', 'Silver', 'Gold'].map(level => {
                                const required = level === 'Bronze' ? 500 : level === 'Silver' ? 1000 : 2000;
                                const isEligible = (currentUser.totalCredits || 0) >= required;
                                const url = currentUser.certificates?.[level];

                                return (
                                    <div key={level} className="glass-panel text-center flex flex-col justify-between" style={{ borderTop: `4px solid ${level === 'Gold' ? '#facc15' : level === 'Silver' ? '#cbd5e1' : '#cd7f32'}`, minHeight: '200px' }}>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{level} Level</h4>
                                            <p className="text-muted text-sm mb-6">Requires {required} Credits</p>
                                        </div>

                                        {!isEligible ? (
                                            <button className="btn w-full justify-center" disabled style={{ opacity: 0.5 }}>Locked <Lock size={14} className="inline ml-1" /></button>
                                        ) : url ? (
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full shadow-lg flex justify-center py-3">Download PDF</a>
                                        ) : (
                                            <button className="btn btn-outline w-full justify-center" disabled>Generating...</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
