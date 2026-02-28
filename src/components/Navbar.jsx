import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Map as MapIcon, Trophy, User, PlusCircle, LayoutDashboard, LogOut, Image as ImageIcon, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="container flex justify-between items-center" style={{ width: '100%' }}>
                <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
                    <Leaf color="#10b981" size={32} />
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', background: 'linear-gradient(to right, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
                        CleanMadurai
                    </span>
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                    {currentUser ? (
                        <>
                            {currentUser.role === 'student' && (
                                <Link to="/student-dashboard" onClick={closeMenu} className={`nav-link flex items-center gap-1 ${isActive('/student-dashboard')}`}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                            )}
                            {currentUser.role === 'public' && (
                                <Link to="/public-dashboard" onClick={closeMenu} className={`nav-link flex items-center gap-1 ${isActive('/public-dashboard')}`}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                            )}
                            {currentUser.role === 'admin' && (
                                <Link to="/admin" onClick={closeMenu} className={`nav-link flex items-center gap-1 ${isActive('/admin')}`}>
                                    Admin
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <a href="/#features" onClick={closeMenu} className="nav-link whitespace-nowrap">Features</a>
                            <a href="/#how-it-works" onClick={closeMenu} className="nav-link whitespace-nowrap">How it works</a>
                        </>
                    )}

                    <Link to="/report" onClick={closeMenu} className={`nav-link flex items-center gap-1 whitespace-nowrap ${isActive('/report')}`}>
                        <PlusCircle size={18} /> Report
                    </Link>

                    <Link to="/gallery" onClick={closeMenu} className={`nav-link flex items-center gap-1 whitespace-nowrap ${isActive('/gallery')}`}>
                        <ImageIcon size={18} /> Gallery
                    </Link>
                    <Link to="/heatmap" onClick={closeMenu} className={`nav-link flex items-center gap-1 whitespace-nowrap ${isActive('/heatmap')}`}>
                        <MapIcon size={18} /> Heatmap
                    </Link>
                    <Link to="/leaderboard" onClick={closeMenu} className={`nav-link flex items-center gap-1 whitespace-nowrap ${isActive('/leaderboard')}`}>
                        <Trophy size={18} /> Top Heroes
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
                            <button className="btn btn-outline" onClick={() => { closeMenu(); logout(); }} style={{ padding: '0.5rem 1rem' }}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" onClick={closeMenu} className="btn btn-primary ml-0 lg:ml-4 whitespace-nowrap">
                            <User size={18} /> Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
