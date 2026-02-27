import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, MapPin, Users, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
    const [activeTab, setActiveTab] = useState('students'); // 'students' | 'public'
    const [studentLeaders, setStudentLeaders] = useState([]);
    const [publicLeaders, setPublicLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    // Mock Data if Firebase isn't configured
    const mockStudents = [
        { id: '1', name: 'Sanjay', totalCleanups: 42, totalCredits: 1250, college: 'Thiagarajar College', photoURL: 'https://ui-avatars.com/api/?name=Sanjay&background=10b981&color=fff', badges: ['Eco Starter', 'Green Warrior', 'Madurai Hero'] },
        { id: '2', name: 'Priya', totalCleanups: 35, totalCredits: 1100, college: 'Lady Doak College', photoURL: 'https://ui-avatars.com/api/?name=Priya&background=f59e0b&color=fff', badges: ['Eco Starter', 'Green Warrior', 'Madurai Hero'] },
        { id: '3', name: 'Rahul', totalCleanups: 15, totalCredits: 950, college: 'Madura College', photoURL: 'https://ui-avatars.com/api/?name=Rahul&background=3b82f6&color=fff', badges: ['Eco Starter', 'Green Warrior'] },
        { id: '4', name: 'Anita', totalCleanups: 8, totalCredits: 600, photoURL: 'https://ui-avatars.com/api/?name=Anita&background=ef4444&color=fff', badges: ['Eco Starter'] },
        { id: '5', name: 'Karthik', totalCleanups: 2, totalCredits: 450, photoURL: 'https://ui-avatars.com/api/?name=Karthik&background=8b5cf6&color=fff', badges: [] },
    ];

    const mockPublic = [
        { id: 'p1', name: 'Muthu', rewardPoints: 850, photoURL: 'https://ui-avatars.com/api/?name=Muthu&background=ef4444&color=fff' },
        { id: 'p2', name: 'Kavitha', rewardPoints: 600, photoURL: 'https://ui-avatars.com/api/?name=Kavitha&background=3b82f6&color=fff' },
        { id: 'p3', name: 'Ramesh', rewardPoints: 450, photoURL: 'https://ui-avatars.com/api/?name=Ramesh&background=10b981&color=fff' },
        { id: 'p4', name: 'Meena', rewardPoints: 200, photoURL: 'https://ui-avatars.com/api/?name=Meena&background=f59e0b&color=fff' },
    ];

    useEffect(() => {
        if (!import.meta.env.VITE_FIREBASE_API_KEY) {
            setTimeout(() => {
                let mergedStudents = [...mockStudents];
                if (currentUser && currentUser.role === 'student' && !mergedStudents.find(m => m.id === currentUser.uid)) {
                    mergedStudents.push({
                        id: currentUser.uid,
                        name: currentUser.name,
                        college: currentUser.college,
                        totalCleanups: currentUser.totalCleanups || 0,
                        totalCredits: currentUser.totalCredits || 0,
                        photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=10b981&color=fff`,
                        badges: currentUser.badges || []
                    });
                }
                mergedStudents.sort((a, b) => b.totalCredits - a.totalCredits);
                setStudentLeaders(mergedStudents.slice(0, 10));

                let mergedPublic = [...mockPublic];
                if (currentUser && currentUser.role === 'public' && !mergedPublic.find(m => m.id === currentUser.uid)) {
                    mergedPublic.push({
                        id: currentUser.uid,
                        name: currentUser.name,
                        rewardPoints: currentUser.rewardPoints || 0,
                        photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=ef4444&color=fff`,
                    });
                }
                mergedPublic.sort((a, b) => b.rewardPoints - a.rewardPoints);
                setPublicLeaders(mergedPublic.slice(0, 10));

                setLoading(false);
            }, 800);
            return;
        }

        // Live Firestore listener for Students
        const qStudents = query(
            collection(db, 'Users'),
            where('role', '==', 'student'),
            orderBy('totalCredits', 'desc'),
            limit(20)
        );

        const unsubStudents = onSnapshot(qStudents, (snapshot) => {
            const fetched = [];
            snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
            setStudentLeaders(fetched);
            setLoading(false);
        });

        // Live Firestore listener for Public
        const qPublic = query(
            collection(db, 'Users'),
            where('role', '==', 'public'),
            orderBy('rewardPoints', 'desc'),
            limit(20)
        );

        const unsubPublic = onSnapshot(qPublic, (snapshot) => {
            const fetched = [];
            snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
            setPublicLeaders(fetched);
        });

        return () => {
            unsubStudents();
            unsubPublic();
        };

    }, [currentUser]);

    const getBadgeDisplay = (badges) => {
        if (!badges || badges.length === 0) return null;
        if (badges.includes("Madurai Hero")) return <span className="badge badge-gold" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>🥇 Hero</span>;
        if (badges.includes("Green Warrior")) return <span className="badge badge-silver" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>🥈 Warrior</span>;
        if (badges.includes("Eco Starter")) return <span className="badge badge-bronze" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>🥉 Starter</span>;
        return null;
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    const getRankStyle = (index) => {
        if (index === 0) return { color: '#facc15', border: '2px solid #facc15', textShadow: '0 0 10px rgba(250, 204, 21, 0.5)', icon: <Trophy size={16} /> }; // Gold
        if (index === 1) return { color: '#e2e8f0', border: '2px solid #e2e8f0', textShadow: '0 0 10px rgba(226, 232, 240, 0.5)', icon: <Medal size={16} /> }; // Silver
        if (index === 2) return { color: '#cd7f32', border: '2px solid #cd7f32', textShadow: '0 0 10px rgba(205, 127, 50, 0.5)', icon: <Medal size={16} /> }; // Bronze
        return { color: 'var(--text-muted)', border: '1px solid var(--border-glass)', icon: null };
    };

    const currentList = activeTab === 'students' ? studentLeaders : publicLeaders;

    return (
        <div className="container" style={{ paddingBottom: '3rem', paddingTop: '3rem', maxWidth: '900px' }}>
            <div className="text-center mb-8">
                <Trophy size={64} className="mx-auto mb-4" style={{ color: '#facc15', filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.4))' }} />
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Top Contributors</h2>
                <p style={{ color: 'var(--text-muted)' }}>The heroes actively transforming Madurai into a cleaner, greener city.</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-4">
                <button
                    onClick={() => setActiveTab('students')}
                    className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ minWidth: '150px' }}
                >
                    <Users size={18} className="inline mr-2" /> Students
                </button>
                <button
                    onClick={() => setActiveTab('public')}
                    className={`btn ${activeTab === 'public' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ minWidth: '150px' }}
                >
                    <Building2 size={18} className="inline mr-2" /> Citizens
                </button>
            </div>

            {/* Motivational Headers */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center mb-8"
                >
                    {activeTab === 'students' ? (
                        <div className="badge badge-silver mt-2 mb-2 p-3 font-semibold text-emerald-300" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            🎯 Goal: Accumulate Credits to unlock Official PDF Certificates for Academic Resumes
                        </div>
                    ) : (
                        <div className="badge badge-gold mt-2 mb-2 p-3 font-semibold text-amber-500" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                            🎁 Goal: Top Scorers unlock Amazon Vouchers, Bluetooth Earbuds, and Premium Headsets
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {loading ? (
                <div className="text-center mt-8">
                    <div className="animate-pulse text-muted">Compiling Rankings...</div>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial="hidden" animate="visible" exit="hidden" variants={containerVariants} className="flex-col gap-4" style={{ display: 'flex' }}>

                        {currentList.length === 0 ? (
                            <div className="text-center text-muted p-8 border border-dashed border-glass rounded-xl">No contributors found in this category yet.</div>
                        ) : (
                            currentList.map((user, index) => {
                                const rankStyle = getRankStyle(index);
                                const isCurrentUser = user.id === currentUser?.uid;

                                return (
                                    <motion.div
                                        key={user.id}
                                        variants={itemVariants}
                                        className="glass-panel flex justify-between items-center relative overflow-hidden"
                                        style={{
                                            padding: '1.25rem 2rem',
                                            background: isCurrentUser ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                                            border: isCurrentUser ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                                        }}
                                    >
                                        {/* Top 3 Glow Background Effect */}
                                        {index < 3 && (
                                            <div className="absolute top-0 left-0 w-1 bg-gradient-to-b h-full" style={{ from: 'transparent', to: 'transparent', width: '4px', background: rankStyle.color }}></div>
                                        )}

                                        <div className="flex items-center gap-6">

                                            {/* Rank Circle */}
                                            <div className="flex justify-center items-center flex-col shrink-0" style={{
                                                width: '50px', height: '50px',
                                                borderRadius: '50%',
                                                border: rankStyle.border,
                                                color: rankStyle.color,
                                                background: index < 3 ? 'rgba(0,0,0,0.3)' : 'transparent'
                                            }}>
                                                {rankStyle.icon}
                                                <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{index + 1}</span>
                                            </div>

                                            {/* Avatar */}
                                            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=10b981&color=fff`} alt={user.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />

                                            {/* Info */}
                                            <div>
                                                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {user.name || user.displayName || 'Anonymous'}
                                                    {isCurrentUser && <span className="text-xs font-normal text-primary bg-primary/20 px-2 py-0.5 rounded-full">You</span>}
                                                </h4>

                                                <div className="flex gap-3 items-center" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    {activeTab === 'students' && user.college && (
                                                        <span className="flex items-center gap-1"><Building2 size={12} /> {user.college}</span>
                                                    )}

                                                    {activeTab === 'students' ? (
                                                        <span className="flex items-center gap-1"><Trophy size={12} /> {user.totalCleanups || 0} Cleanups</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1"><MapPin size={12} /> Active Reporter</span>
                                                    )}
                                                </div>

                                                {/* Badges */}
                                                {activeTab === 'students' && getBadgeDisplay(user.badges) && (
                                                    <div className="mt-2 text-xs">
                                                        {getBadgeDisplay(user.badges)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Score Container */}
                                        <div className="text-right shrink-0">
                                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: activeTab === 'students' ? 'var(--primary-light)' : '#f59e0b' }}>
                                                {activeTab === 'students' ? (user.totalCredits || 0) : (user.rewardPoints || 0)}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1.5px', fontWeight: 'bold' }}>
                                                {activeTab === 'students' ? 'Credits' : 'Reward Points'}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
