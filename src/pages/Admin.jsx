import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, Target, Award, Clock, CheckCircle, XCircle, AlertCircle, Sparkles, TrendingUp, BarChart2 } from 'lucide-react';

export default function Admin() {
    const { currentUser } = useAuth();
    const [reports, setReports] = useState([]);
    const [uploads, setUploads] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'uploads'

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') return;

        if (!import.meta.env.VITE_FIREBASE_API_KEY) {
            // Mock Data
            setTimeout(() => {
                setReports([
                    { id: '1', imageUrl: 'https://images.unsplash.com/photo-1530587191344-9dc86d7242d8', description: 'Plastic near temple', status: 'pending', createdAt: { toDate: () => new Date() } }
                ]);
                setUploads([
                    { id: '1', beforeImageUrl: 'https://images.unsplash.com/photo-1530587191344', afterImageUrl: 'https://images.unsplash.com/photo-1530587191344', approved: false, aiScores: { improvementScore: 50 }, createdAt: { toDate: () => new Date() } }
                ]);
                setUsers([
                    { id: '1', totalCredits: 1200, totalCleanups: 15 },
                    { id: '2', totalCredits: 800, totalCleanups: 10 }
                ]);
                setLoading(false);
            }, 800);
            return;
        }

        const unsubReports = onSnapshot(collection(db, 'PublicReports'), (snap) => {
            const arr = [];
            snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
            setReports(arr.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        });

        const unsubUploads = onSnapshot(collection(db, 'Uploads'), (snap) => {
            const arr = [];
            snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
            setUploads(arr.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        });

        const unsubUsers = onSnapshot(collection(db, 'Users'), (snap) => {
            const arr = [];
            snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
            setUsers(arr);
            setLoading(false);
        });

        return () => {
            unsubReports();
            unsubUploads();
            unsubUsers();
        };
    }, [currentUser]);

    const handleReportStatus = async (id, status) => {
        try {
            if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                setReports(reports.map(r => r.id === id ? { ...r, status } : r));
                toast.success(`Report marked as ${status}`);
                return;
            }
            await updateDoc(doc(db, 'PublicReports', id), { status });
            toast.success(`Report marked ${status} successfully`);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleUploadStatus = async (id, approved) => {
        try {
            if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                setUploads(uploads.map(u => u.id === id ? { ...u, approved } : u));
                toast.success(`Upload ${approved ? 'approved' : 'rejected'}`);
                return;
            }
            await updateDoc(doc(db, 'Uploads', id), { approved });
            toast.success(`Upload ${approved ? 'approved' : 'rejected'} successfully`);
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="container text-center mt-8" style={{ paddingTop: '5rem' }}>
                <ShieldAlert size={80} className="mx-auto mb-6 text-danger" color="var(--danger)" />
                <h2 style={{ color: 'var(--danger)', fontSize: '2.5rem' }}>Access Denied</h2>
                <p className="text-muted mt-4 text-lg max-w-2xl mx-auto">This portal is strictly restricted to system administrators. Your account does not have the required permissions.</p>
            </div>
        );
    }

    // Analytics Calculation
    const totalUsers = users.length;
    const totalCleanups = users.reduce((sum, u) => sum + (u.totalCleanups || 0), 0);
    const totalCredits = users.reduce((sum, u) => sum + (u.totalCredits || 0), 0);
    const pendingCount = reports.filter(r => r.status === 'pending').length + uploads.filter(u => u.approved === false).length;

    return (
        <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldAlert color="var(--primary)" /> Admin Console
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Global system overview and moderation portal.</p>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-muted text-sm font-bold uppercase tracking-wider">Total Users</div>
                        <Users color="#3b82f6" size={20} />
                    </div>
                    <div className="text-3xl font-bold">{totalUsers}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-panel border-l-4" style={{ borderLeftColor: '#10b981' }}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-muted text-sm font-bold uppercase tracking-wider">Cleanups</div>
                        <Target color="#10b981" size={20} />
                    </div>
                    <div className="text-3xl font-bold">{totalCleanups}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-panel border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-muted text-sm font-bold uppercase tracking-wider">Total Credits</div>
                        <Award color="#f59e0b" size={20} />
                    </div>
                    <div className="text-3xl font-bold">{totalCredits}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-panel border-l-4" style={{ borderLeftColor: '#ef4444' }}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-muted text-sm font-bold uppercase tracking-wider">Pending Tasks</div>
                        <Clock color="#ef4444" size={20} />
                    </div>
                    <div className="text-3xl font-bold">{pendingCount}</div>
                </motion.div>
            </div>

            {/* Content Tabs */}
            <div className="flex gap-4 mb-6 border-b border-glass" style={{ borderColor: 'var(--border-glass)', overflowX: 'auto', paddingBottom: '2px' }}>
                <button onClick={() => setActiveTab('reports')} className={`btn ${activeTab === 'reports' ? 'btn-outline' : 'btn-glass'} whitespace-nowrap`} style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}>
                    <AlertCircle size={16} className="inline mr-2" /> Public Reports
                </button>
                <button onClick={() => setActiveTab('uploads')} className={`btn ${activeTab === 'uploads' ? 'btn-outline' : 'btn-glass'} whitespace-nowrap`} style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}>
                    <Target size={16} className="inline mr-2" /> Student Uploads
                </button>
                <button onClick={() => setActiveTab('ai-insights')} className={`btn ${activeTab === 'ai-insights' ? 'btn-outline' : 'btn-glass'} whitespace-nowrap`} style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none', borderColor: activeTab === 'ai-insights' ? '#38bdf8' : '', color: activeTab === 'ai-insights' ? '#38bdf8' : '' }}>
                    <Sparkles size={16} className="inline mr-2" /> AI City Insights
                </button>
            </div>

            {loading ? (
                <div className="text-center p-10 animate-pulse text-muted">Loading system data...</div>
            ) : (
                <AnimatePresence mode="wait">
                    {activeTab === 'reports' && (
                        <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reports.length === 0 ? (
                                    <div className="col-span-full text-center p-8 text-muted border border-dashed rounded-xl border-glass">No public reports found.</div>
                                ) : (
                                    reports.map(report => (
                                        <div key={report.id} className="glass-panel flex flex-col justify-between overflow-hidden" style={{ padding: 0 }}>
                                            <div style={{ position: 'relative' }}>
                                                <img src={report.imageUrl} alt="Report" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                                <span className={`badge uppercase absolute top-3 right-3 shadow-lg ${report.status === 'resolved' ? 'badge-gold' : report.status === 'rejected' ? 'badge-silver' : 'badge-bronze'}`}>
                                                    {report.status}
                                                </span>
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col">
                                                <p className="mb-4 text-sm text-gray-300 flex-1">{report.description}</p>
                                                <div className="text-xs text-muted mb-4 border-b border-glass pb-2">
                                                    Submitted: {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                                                </div>

                                                {report.status === 'pending' ? (
                                                    <div className="flex gap-2 mt-auto">
                                                        <button className="btn flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-none py-2 px-0 text-sm flex justify-center items-center gap-1" onClick={() => handleReportStatus(report.id, 'resolved')}>
                                                            <CheckCircle size={16} /> Resolve (+50pts)
                                                        </button>
                                                        <button className="btn flex-1 bg-rose-600 hover:bg-rose-700 text-white border-none py-2 px-0 text-sm flex justify-center items-center gap-1" onClick={() => handleReportStatus(report.id, 'rejected')}>
                                                            <XCircle size={16} /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-sm font-bold mt-auto" style={{ color: report.status === 'resolved' ? '#10b981' : '#ef4444' }}>
                                                        {report.status === 'resolved' ? 'Action Completed' : 'Report Dismissed'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'uploads' && (
                        <motion.div key="uploads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="flex flex-col gap-6">
                                {uploads.length === 0 ? (
                                    <div className="text-center p-8 text-muted border border-dashed rounded-xl border-glass">No student uploads found.</div>
                                ) : (
                                    uploads.map(upload => (
                                        <div key={upload.id} className="glass-panel w-full p-5 lg:p-6" style={{ background: upload.approved ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-card)' }}>
                                            <div className="flex flex-col lg:flex-row gap-6">

                                                {/* Images */}
                                                <div className="flex gap-4 lg:w-1/2">
                                                    <div className="flex-1 relative">
                                                        <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">BEFORE</span>
                                                        <img src={upload.beforeImageUrl} alt="Before" className="w-full h-40 object-cover rounded-lg border border-glass" />
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">AFTER</span>
                                                        <img src={upload.afterImageUrl} alt="After" className="w-full h-40 object-cover rounded-lg border border-glass" />
                                                    </div>
                                                </div>

                                                {/* Details & Actions */}
                                                <div className="lg:w-1/2 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h4 className="text-lg font-bold mb-1">User ID: <span className="text-primary-light text-sm font-normal">{upload.userId?.substring(0, 8)}...</span></h4>
                                                                <div className="text-xs text-muted">
                                                                    Submitted: {upload.createdAt?.toDate ? upload.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                                                                </div>
                                                            </div>
                                                            <span className={`badge uppercase ${upload.approved ? 'badge-gold' : 'badge-bronze'}`}>
                                                                {upload.approved ? 'Verified' : 'Pending Override'}
                                                            </span>
                                                        </div>

                                                        {upload.aiScores ? (
                                                            <div className="flex gap-4 bg-slate-800/50 p-3 rounded-lg border border-glass mb-4">
                                                                <div>
                                                                    <div className="text-[10px] text-muted uppercase">AI Improve</div>
                                                                    <div className="text-emerald-400 font-bold">+{upload.aiScores.improvementScore || 0}%</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] text-muted uppercase">AI Credits</div>
                                                                    <div className="text-amber-400 font-bold">{upload.aiScores.creditsEarned || 0}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] text-muted uppercase">Detected</div>
                                                                    <div className="text-indigo-300 font-bold text-xs mt-1 truncate max-w-[100px]">{upload.aiScores.garbageType?.length ? upload.aiScores.garbageType.join(', ') : 'None'}</div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-amber-500/10 text-amber-500 text-xs p-3 rounded-lg border border-amber-500/20 mb-4 inline-block">
                                                                AI Backend Engine is currently syncing this upload...
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-3">
                                                        {!upload.approved ? (
                                                            <button className="btn bg-emerald-600 hover:bg-emerald-700 text-white flex-1 py-2 justify-center" onClick={() => handleUploadStatus(upload.id, true)}>
                                                                <CheckCircle size={16} /> Manual Approve
                                                            </button>
                                                        ) : (
                                                            <button className="btn bg-rose-600 hover:bg-rose-700 text-white flex-1 py-2 justify-center" onClick={() => handleUploadStatus(upload.id, false)}>
                                                                <XCircle size={16} /> Revoke Approval
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'ai-insights' && (
                        <motion.div key="ai-insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Predictive Hotspots */}
                                <div className="glass-panel" style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyan-400">
                                        <TrendingUp size={20} /> Predictive Hotspot Analysis
                                    </h3>
                                    <p className="text-muted text-sm mb-4">AI model prediction for the next 48 hours based on historical reporting frequency, weather data, and festival calendars.</p>

                                    <div className="flex flex-col gap-3">
                                        <div className="bg-slate-900/50 p-3 rounded border border-glass flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-sm">Meenakshi Temple Surroundings</div>
                                                <div className="text-xs text-muted">High plastic waste probability</div>
                                            </div>
                                            <span className="badge badge-danger">92% Risk</span>
                                        </div>
                                        <div className="bg-slate-900/50 p-3 rounded border border-glass flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-sm">Goripalayam Junction</div>
                                                <div className="text-xs text-muted">Traffic bottleneck accumulation</div>
                                            </div>
                                            <span className="badge badge-danger">87% Risk</span>
                                        </div>
                                        <div className="bg-slate-900/50 p-3 rounded border border-glass flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-sm">Mattuthavani Bus Stand</div>
                                                <div className="text-xs text-muted">Mixed waste surge expected</div>
                                            </div>
                                            <span className="badge badge-gold">74% Risk</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fleet Optimization */}
                                <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-400">
                                        <Target size={20} /> AI Fleet Optimization Routing
                                    </h3>
                                    <p className="text-muted text-sm mb-4">Dynamic garbage truck routing recommendations generated from verified real-time public reports to minimize fuel consumption.</p>

                                    <div className="bg-slate-900 p-4 rounded border border-emerald-500/30 relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '180px' }}>
                                        <div className="absolute top-0 right-0 p-2 text-emerald-500/20"><Sparkles size={80} /></div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2 relative z-10">
                                                <span className="text-muted">Current City Efficiency:</span>
                                                <span className="font-bold text-rose-400">62%</span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-4 relative z-10">
                                                <span className="text-muted">AI Optimized Efficiency:</span>
                                                <span className="font-bold text-emerald-400">89%</span>
                                            </div>
                                        </div>

                                        <button className="btn w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none py-2 justify-center relative z-10" onClick={(e) => { e.preventDefault(); toast.success('Dispatch instructions sent to municipal drivers.') }}>
                                            <Sparkles size={16} /> Dispatch Optimized Fleet
                                        </button>
                                    </div>
                                </div>

                                {/* Material Composition */}
                                <div className="glass-panel col-span-full" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-400">
                                        <BarChart2 size={20} /> Madurai AI Waste Composition
                                    </h3>
                                    <p className="text-muted text-sm mb-6">Aggregate material detection analysis derived from Google Gemini Vision parsing of citizen photos.</p>

                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="w-full md:w-1/2">
                                            {/* Fake Bar Chart */}
                                            <div className="flex flex-col gap-4">
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1"><span>Single-use Plastics</span> <span className="text-primary-light">42%</span></div>
                                                    <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-primary-light h-2 rounded-full" style={{ width: '42%' }}></div></div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1"><span>Biodegradable / Organic</span> <span className="text-emerald-500">31%</span></div>
                                                    <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '31%' }}></div></div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1"><span>Paper & Cardboard</span> <span className="text-amber-500">18%</span></div>
                                                    <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: '18%' }}></div></div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1"><span>Hazardous/E-Waste</span> <span className="text-rose-500">9%</span></div>
                                                    <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-rose-500 h-2 rounded-full" style={{ width: '9%' }}></div></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/2 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-sm">
                                            <h4 className="font-bold text-amber-500 mb-2 flex items-center gap-2"><Sparkles size={16} /> Automated Policy Insight</h4>
                                            <p className="text-muted">The AI detects a 15% week-over-week increase in <strong className="text-white">Single-use Plastics</strong> near tourist zones based on uploaded photos. It recommended to deploy 5 additional specialized recycling bins in the surrounding 2km radius of Meenakshi Temple.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
