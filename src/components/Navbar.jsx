import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Map as MapIcon, Trophy, User, PlusCircle, LayoutDashboard, LogOut, Image as ImageIcon } from 'lucide-react';

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="container flex justify-between items-center" style={{ width: '100%' }}>
                <Link to="/" className="flex items-center gap-2">
                    <Leaf color="#10b981" size={32} />
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', background: 'linear-gradient(to right, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        CleanMadurai AI
                    </span>
                </Link>

                <div className="nav-links">
                    {currentUser ? (
                        <>
                            {currentUser.role === 'student' && (
                                <Link to="/student-dashboard" className={`nav-link flex items-center gap-1 ${isActive('/student-dashboard')}`}>
                                    <LayoutDashboard size={18} /> Student Dashboard
                                </Link>
                            )}
                            {currentUser.role === 'public' && (
                                <Link to="/public-dashboard" className={`nav-link flex items-center gap-1 ${isActive('/public-dashboard')}`}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                            )}
                            {currentUser.role === 'admin' && (
                                <Link to="/admin" className={`nav-link flex items-center gap-1 ${isActive('/admin')}`}>
                                    Admin
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <a href="/#features" className="nav-link">Features</a>
                            <a href="/#how-it-works" className="nav-link">How it works</a>
                        </>
                    )}

                    <Link to="/report" className={`nav-link flex items-center gap-1 ${isActive('/report')}`}>
                        <PlusCircle size={18} /> Report
                    </Link>

                    <Link to="/gallery" className={`nav-link flex items-center gap-1 ${isActive('/gallery')}`}>
                        <ImageIcon size={18} /> Gallery
                    </Link>
                    <Link to="/heatmap" className={`nav-link flex items-center gap-1 ${isActive('/heatmap')}`}>
                        <MapIcon size={18} /> Heatmap
                    </Link>
                    <Link to="/leaderboard" className={`nav-link flex items-center gap-1 ${isActive('/leaderboard')}`}>
                        <Trophy size={18} /> Leaderboard
                    </Link>

                    {currentUser ? (
                        <div className="flex items-center gap-4 user-profile-block">
                            <div className="flex items-center gap-2">
                                <img
                                    src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.email)}&background=10b981&color=fff`}
                                    alt="Avatar"
                                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--primary)' }}
                                />
                                <div className="flex flex-col">
                                    <span style={{ fontSize: '0.875rem', fontWeight: '600', lineHeight: '1' }}>{currentUser.name || currentUser.displayName || 'User'}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)', lineHeight: '1', marginTop: '4px' }}>
                                        {currentUser.role === 'public' ? `${currentUser.rewardPoints || 0} Points` : `${currentUser.totalCredits || 0} Credits`}
                                    </span>
                                </div>
                            </div>
                            <button className="btn btn-outline" onClick={logout} style={{ padding: '0.5rem 1rem' }}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary ml-4">
                            <User size={18} /> Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
