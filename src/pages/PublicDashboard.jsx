import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlusCircle, List, Award, MapPin, Gift, Lock, Headphones, Target, Zap, CheckCircle } from 'lucide-react';

export default function PublicDashboard() {
    const { currentUser } = useAuth();
    const [userReports, setUserReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            if (!currentUser) return;

            try {
                if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                    setTimeout(() => {
                        setUserReports([
                            { id: '1', description: 'Plastic near junction', status: 'pending', imageUrl: 'https://images.unsplash.com/photo-1530587191344-9dc86d7242d8?q=80&w=200&auto=format&fit=crop' }
                        ]);
                        setLoading(false);
                    }, 800);
                    return;
                }

                const q = query(collection(db, 'PublicReports'), where('userId', '==', currentUser.uid));
                const qSnap = await getDocs(q);
                const fetched = [];
                qSnap.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
                setUserReports(fetched);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [currentUser]);

    return (
        <div className="container" style={{ paddingBottom: '3rem' }}>
            <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Public Dashboard</h2>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Hello, <span style={{ color: 'var(--primary)' }}>{currentUser?.name || 'Citizen'}</span></h3>
                    <p style={{ color: 'var(--text-muted)' }}>Track your reports and community reward points.</p>
                </div>
                <div className="glass-panel text-center" style={{ minWidth: '120px' }}>
                    <h3 style={{ color: '#f59e0b', fontSize: '2rem' }}>{currentUser?.rewardPoints || 0}</h3>
                    <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Reward Points</p>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <Link to="/report" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <PlusCircle size={20} /> File Garbage Report
                </Link>
            </div>

            {/* Daily Missions Feature */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel mb-8" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-light)' }}>
                        <Target size={20} /> Active Eco-Missions
                    </h3>
                    <span className="badge badge-silver text-xs">Resets in 11h 45m</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)' }}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm flex items-center gap-1"><Zap size={14} color="#fbbf24" /> Early Bird</h4>
                            <span className="text-amber-400 font-bold text-xs">+50 PTS</span>
                        </div>
                        <p className="text-muted text-xs mb-3">Submit your first verified report of the day to claim this bonus.</p>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1">
                            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <span className="text-[10px] text-muted font-bold">0 / 1 Reports</span>
                    </div>

                    <div className="p-4 rounded-xl relative overflow-hidden" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--primary)' }}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm flex items-center gap-1 text-primary-light"><Award size={14} /> Local Explorer</h4>
                            <span className="text-primary-light font-bold text-xs">+150 PTS</span>
                        </div>
                        <p className="text-muted text-xs mb-3">Submit a report from a pincode outside your usual area.</p>
                        <div className="flex items-center gap-2 text-xs text-primary font-bold">
                            <CheckCircle size={14} /> Completed!
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel">
                <h3 className="mb-4" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><List color="var(--primary-light)" /> Your Reports</h3>

                {loading ? (
                    <div className="text-center text-muted">Loading reports...</div>
                ) : userReports.length === 0 ? (
                    <div className="text-center text-muted" style={{ padding: '2rem' }}>
                        <p>You haven't submitted any reports yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {userReports.map(report => (
                            <div key={report.id} className="glass-panel p-4" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                                <div style={{ position: 'relative' }}>
                                    <img src={report.imageUrl} alt="Report" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                                    <span className={`badge ${report.status === 'approved' ? 'badge-gold' : report.status === 'rejected' ? 'badge-silver' : 'badge-bronze'}`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        {report.status}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.875rem' }} className="mb-2 line-clamp-2">{report.description}</p>
                                <div className="flex gap-1 items-center text-muted text-sm mt-2">
                                    <MapPin size={14} /> <span style={{ fontSize: '0.75rem' }}>Location attached</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Gift color="#f59e0b" /> Rewards Vault
                    </h3>
                    <div className="badge badge-gold font-bold">
                        {currentUser?.rewardPoints || 0} Total Points
                    </div>
                </div>

                <p className="text-muted mb-6">Accumulate reward points by hunting down and reporting unverified garbage dumps. Unlock exclusive physical prizes to support Madurai's green initiative!</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>

                    {/* Tier 1: 500 Points - Amazon Voucher */}
                    <div className="glass-panel p-6 relative overflow-hidden" style={{ border: (currentUser?.rewardPoints || 0) >= 500 ? '1px solid #10b981' : '1px solid var(--border-glass)', opacity: (currentUser?.rewardPoints || 0) >= 500 ? 1 : 0.6 }}>
                        <div className="absolute top-0 right-0 p-3">
                            {(currentUser?.rewardPoints || 0) >= 500 ? <Award color="#10b981" /> : <Lock color="var(--text-muted)" />}
                        </div>
                        <h4 className="text-xl font-bold mb-2">₹500 Amazon Voucher</h4>
                        <p className="text-muted text-sm mb-4">Perfect for grabbing some green cleaning supplies.</p>

                        <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2">
                            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${Math.min(((currentUser?.rewardPoints || 0) / 500) * 100, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-emerald-500">{currentUser?.rewardPoints || 0} PTS</span>
                            <span className="text-muted">500 PTS</span>
                        </div>
                    </div>

                    {/* Tier 2: 1500 Points - Earphones */}
                    <div className="glass-panel p-6 relative overflow-hidden" style={{ border: (currentUser?.rewardPoints || 0) >= 1500 ? '1px solid #10b981' : '1px solid var(--border-glass)', opacity: (currentUser?.rewardPoints || 0) >= 1500 ? 1 : 0.6 }}>
                        <div className="absolute top-0 right-0 p-3">
                            {(currentUser?.rewardPoints || 0) >= 1500 ? <Award color="#10b981" /> : <Lock color="var(--text-muted)" />}
                        </div>
                        <h4 className="text-xl font-bold mb-2 flex items-center gap-2">Bluetooth Earbuds <Headphones size={18} /></h4>
                        <p className="text-muted text-sm mb-4">Listen to Mother Nature (or music) clearly.</p>

                        <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2">
                            <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${Math.min(((currentUser?.rewardPoints || 0) / 1500) * 100, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-amber-500">{currentUser?.rewardPoints || 0} PTS</span>
                            <span className="text-muted">1500 PTS</span>
                        </div>
                    </div>

                    {/* Tier 3: 3000 Points - Premium Headset */}
                    <div className="glass-panel p-6 relative overflow-hidden" style={{ border: (currentUser?.rewardPoints || 0) >= 3000 ? '1px solid #10b981' : '1px solid var(--border-glass)', opacity: (currentUser?.rewardPoints || 0) >= 3000 ? 1 : 0.6 }}>
                        <div className="absolute top-0 right-0 p-3">
                            {(currentUser?.rewardPoints || 0) >= 3000 ? <Award color="#10b981" /> : <Lock color="var(--text-muted)" />}
                        </div>
                        <h4 className="text-xl font-bold mb-2">ANC Wireless Headset</h4>
                        <p className="text-muted text-sm mb-4">Block out the noise. Focus on the green.</p>

                        <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2">
                            <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${Math.min(((currentUser?.rewardPoints || 0) / 3000) * 100, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-rose-500">{currentUser?.rewardPoints || 0} PTS</span>
                            <span className="text-muted">3000 PTS</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
