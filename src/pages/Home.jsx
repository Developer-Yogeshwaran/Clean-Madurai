import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Leaf, Award, Map as MapIcon, ShieldCheck, ArrowRight, BrainCircuit, Gift, Headphones, GraduationCap, Star, ChevronsLeftRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Home() {
    const { currentUser } = useAuth();
    const [sliderPos, setSliderPos] = useState(50);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
    };

    const chartData = {
        labels: ['Epoch 10', 'Epoch 20', 'Epoch 30', 'Epoch 40', 'Epoch 50', 'Epoch 60', 'Epoch 70', 'Epoch 80'],
        datasets: [
            {
                label: 'Training Accuracy',
                data: [45, 58, 72, 85, 89, 93, 96, 98.5],
                fill: true,
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                borderColor: '#38bdf8',
                tension: 0.4,
                pointBackgroundColor: '#38bdf8',
            },
            {
                label: 'Validation Accuracy',
                data: [42, 55, 68, 81, 86, 90, 93, 95.2],
                fill: false,
                borderColor: '#10b981',
                borderDash: [5, 5],
                tension: 0.4,
                pointBackgroundColor: '#10b981',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#38bdf8',
                bodyColor: '#fff',
                borderColor: 'rgba(56, 189, 248, 0.3)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 40,
                max: 100,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8', callback: value => value + '%' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        },
        animation: {
            duration: 2500,
            easing: 'easeInOutQuart'
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '5rem' }}>
            {/* Hero Section */}
            <motion.div
                className="text-center"
                style={{ marginTop: '4rem', marginBottom: '6rem' }}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div variants={itemVariants} className="inline-block mb-4">
                    <span className="badge" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
                        <Leaf size={16} className="mr-2 inline" /> Empowering a Greener Madurai
                    </span>
                </motion.div>
                <motion.h1 variants={itemVariants} className="hero-title">
                    Clean Madurai AI
                </motion.h1>
                <motion.p variants={itemVariants} style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                    Upload proof of cleaning public spaces, let our AI verify the impact, earn credits, and compete on the leaderboard to become a Madurai Hero.
                </motion.p>
                <motion.div variants={itemVariants} className="flex justify-center gap-4">
                    {currentUser ? (
                        <Link to={currentUser.role === 'public' ? "/public-dashboard" : currentUser.role === 'admin' ? "/admin" : "/student-dashboard"} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Go to Dashboard <ArrowRight size={20} />
                        </Link>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Start Cleaning Now <ArrowRight size={20} />
                        </Link>
                    )}
                    <Link to="/heatmap" className="btn btn-glass" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        View Action Heatmap
                    </Link>
                </motion.div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
                className="glass-panel mb-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex justify-between items-center flex-wrap gap-8 text-center" style={{ padding: '1rem 2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '2.5rem', color: 'var(--primary-light)', marginBottom: '0.5rem' }}>1,240+</h3>
                        <p className="text-muted text-transform-uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>Kg Waste Removed</p>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2.5rem', color: '#f59e0b', marginBottom: '0.5rem' }}>450+</h3>
                        <p className="text-muted text-transform-uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>Active Volunteers</p>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2.5rem', color: '#3b82f6', marginBottom: '0.5rem' }}>85</h3>
                        <p className="text-muted text-transform-uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>Hotspots Cleaned</p>
                    </div>
                </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '6rem' }}
            >
                <motion.div variants={itemVariants} className="glass-panel flex-col gap-4 text-center items-center">
                    <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <ShieldCheck size={32} color="var(--primary-light)" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>AI Verification</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Advanced Gemini AI analyzes your before and after photos, calculates improvement scores, and prevents fraud.</p>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel flex-col gap-4 text-center items-center">
                    <div style={{ width: '64px', height: '64px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Award size={32} color="#f59e0b" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Gamified Rewards</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Earn credits for impactful cleanups. Climb the leaderboard and unlock exclusive badges and certificates.</p>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel flex-col gap-4 text-center items-center">
                    <div style={{ width: '64px', height: '64px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <MapIcon size={32} color="#38bdf8" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Live Heatmaps</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Spot high-intensity garbage zones mapped across Madurai and track their transformation live.</p>
                </motion.div>
            </motion.div>

            {/* AI Scanner Demo Section */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="mt-24 mb-12"
            >
                <div className="text-center mb-10 px-4">
                    <h2 className="font-heading font-extrabold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem', background: 'linear-gradient(to right, #38bdf8, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                        Experience the AI Engine
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        Our custom vision model instantly detects and categorizes waste from your photos to calculate accurate impact scores.
                    </p>
                </div>

                <div className="glass-panel mx-auto p-0 overflow-hidden relative" style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid var(--border-glass)' }}>
                    <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-glass" style={{ borderColor: 'var(--border-glass)' }}>
                        <div className="flex gap-2">
                            <h3 className="text-primary-light font-bold flex items-center gap-2"><BrainCircuit size={18} /> Model Performance Metrics</h3>
                        </div>
                        <span className="text-muted text-xs font-mono flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live Training Feed</span>
                    </div>

                    <div className="relative p-6" style={{ height: '400px', background: 'var(--bg-card)' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>

                    <div className="bg-slate-900 p-4 grid grid-cols-3 text-center divide-x" style={{ borderColor: 'var(--border-glass)', divideColor: 'var(--border-glass)' }}>
                        <div>
                            <div className="text-emerald-400 font-bold text-2xl">98.5%</div>
                            <div className="text-[10px] text-muted uppercase font-bold tracking-wider mt-1">Final Accuracy</div>
                        </div>
                        <div>
                            <div className="text-cyan-400 font-bold text-2xl">24ms</div>
                            <div className="text-[10px] text-muted uppercase font-bold tracking-wider mt-1">Inference Time</div>
                        </div>
                        <div>
                            <div className="text-amber-400 font-bold text-2xl">5.2M</div>
                            <div className="text-[10px] text-muted uppercase font-bold tracking-wider mt-1">Parameters</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Elite Rewards Arsenal Showcase */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="mt-32 mb-20"
            >
                <div className="flex flex-col items-center text-center mb-16 px-4 max-w-4xl mx-auto">
                    <span className="badge badge-gold mb-6 inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                        <Star size={18} fill="currentColor" /> Earn Real Rewards
                    </span>
                    <h2 className="font-heading font-black tracking-tight mb-6 leading-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#f8fafc' }}>
                        The <span style={{ background: 'linear-gradient(to right, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>Rewards Vault</span> is Open.
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.8' }}>
                        We believe that cleaning the city shouldn't just be an act of charity. It should be rewarded. Trade your AI-verified cleanup points for tangible gear and academic recognition.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 mb-10 pl-4 pr-4">
                    {/* Academic Cert Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className="glass-panel flex-1 w-full min-w-[280px] max-w-[350px] relative overflow-hidden group"
                        style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(15, 23, 42, 0.4))', borderColor: 'rgba(56, 189, 248, 0.2)' }}
                    >
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-400/30 transition-all duration-500"></div>
                        <div className="text-cyan-400 mb-6 relative z-10 p-3 bg-cyan-950/50 inline-block rounded-2xl border border-cyan-500/30">
                            <GraduationCap size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Academic Excellence</h3>
                        <p className="text-muted text-sm mb-6 relative z-10">For Students: Earn Verified certificates and actual College Credits authorized by your university.</p>
                        <div className="flex gap-2">
                            <span className="badge badge-bronze text-xs">Bronze</span>
                            <span className="badge badge-silver text-xs">Silver</span>
                            <span className="badge badge-gold text-xs">Gold</span>
                        </div>
                    </motion.div>

                    {/* Tech Prizes Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className="glass-panel flex-1 w-full min-w-[280px] max-w-[350px] relative overflow-hidden group"
                        style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.4))', borderColor: 'rgba(245, 158, 11, 0.2)' }}
                    >
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-400/30 transition-all duration-500"></div>
                        <div className="text-amber-400 mb-6 relative z-10 p-3 bg-amber-950/50 inline-block rounded-2xl border border-amber-500/30">
                            <Headphones size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Elite Tech Gear</h3>
                        <p className="text-muted text-sm mb-6 relative z-10">For Citizens: Exchange points for high-tier tech like ANC Wireless Headphones and Bluetooth Earbuds.</p>
                        <div className="text-xs font-bold text-amber-500 border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 rounded-lg inline-block">
                            500-3000 PT Thresholds
                        </div>
                    </motion.div>

                    {/* Vouchers Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className="glass-panel flex-1 w-full min-w-[280px] max-w-[350px] relative overflow-hidden group"
                        style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.4))', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                    >
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-400/30 transition-all duration-500"></div>
                        <div className="text-emerald-400 mb-6 relative z-10 p-3 bg-emerald-950/50 inline-block rounded-2xl border border-emerald-500/30">
                            <Gift size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Daily Bounties</h3>
                        <p className="text-muted text-sm mb-6 relative z-10">Complete "Eco-Missions" like Early Bird or Local Explorer to grab fast ₹500 Amazon Gift Vouchers.</p>
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Star size={12} fill="currentColor" /> Instant unlocks
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Neon Call To Action */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mb-10 p-1 relative overflow-hidden rounded-3xl mt-16 mx-4 max-w-5xl mx-auto"
                style={{ background: 'linear-gradient(90deg, #10b981, #38bdf8)' }}
            >
                {/* The inner black card that leaves a 1px colored border from the wrapper */}
                <div className="bg-[#020617] rounded-[22px] p-10 md:p-16 text-center relative z-10 flex flex-col items-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-[22px] pointer-events-none"></div>

                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-heading">
                        Ready to clean the future?
                    </h2>
                    <p className="text-lg text-muted max-w-2xl mx-auto mb-10">
                        Join over 450+ active volunteers currently transforming Madurai. Every piece of plastic removed brings us one step closer to a sustainable city.
                    </p>

                    <Link to="/signup" className="group relative inline-flex items-center justify-center font-bold text-white bg-emerald-500 px-8 py-4 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600"></span>
                        <span className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-teal-500 rounded-full opacity-30 group-hover:rotate-90 ease"></span>
                        <span className="relative flex items-center gap-2 text-lg">
                            Create Your Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
