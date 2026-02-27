import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, User, Lock, Mail, Building, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        college: ''
    });

    const { signupWithEmail, loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            return toast.error('Please fill in all required fields');
        }

        setLoading(true);
        try {
            await signupWithEmail(formData.email, formData.password, formData.name, formData.role, formData.college);
            toast.success('Account created successfully!');
            navigate(formData.role === 'student' ? '/student-dashboard' : '/public-dashboard');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            await loginWithGoogle(formData.role, formData.college);
            navigate(formData.role === 'student' ? '/student-dashboard' : '/public-dashboard');
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '3rem', paddingTop: '4rem', maxWidth: '500px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8">
                <div className="text-center mb-6">
                    <UserPlus size={48} className="mx-auto mb-4" color="var(--primary-light)" />
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Join the movement to keep Madurai clean.</p>
                </div>

                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                    <div className="flex gap-2 mb-2 p-1" style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px' }}>
                        <button
                            type="button"
                            className={`btn ${formData.role === 'student' ? 'btn-primary' : 'btn-glass'}`}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '8px' }}
                            onClick={() => setFormData({ ...formData, role: 'student' })}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            className={`btn ${formData.role === 'public' ? 'btn-primary' : 'btn-glass'}`}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '8px' }}
                            onClick={() => setFormData({ ...formData, role: 'public', college: '' })}
                        >
                            Public
                        </button>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name *</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text" name="name" className="input-field" style={{ paddingLeft: '2.5rem' }}
                                placeholder="John Doe" value={formData.name} onChange={handleChange}
                            />
                        </div>
                    </div>

                    {formData.role === 'student' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>College / University (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <Building size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text" name="college" className="input-field" style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Madurai Kamaraj University" value={formData.college} onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email" name="email" className="input-field" style={{ paddingLeft: '2.5rem' }}
                                placeholder="you@example.com" value={formData.email} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password *</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password" name="password" className="input-field" style={{ paddingLeft: '2.5rem' }}
                                placeholder="••••••••" value={formData.password} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary mt-2" disabled={loading} style={{ padding: '1rem' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="text-center mt-6 mb-6" style={{ position: 'relative' }}>
                    <hr style={{ borderColor: 'var(--border-glass)' }} />
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-card)', padding: '0 0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        or signup with
                    </span>
                </div>

                <button className="btn btn-outline" style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={handleGoogleSignup}>
                    <svg style={{ width: "20px", height: "20px" }} viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    Google
                </button>

                <p className="text-center mt-6 text-muted" style={{ fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link>
                </p>

            </motion.div>
        </div>
    );
}
