import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                if (import.meta.env.VITE_FIREBASE_API_KEY) {
                    try {
                        const userDoc = await getDoc(doc(db, 'Users', user.uid));
                        if (userDoc.exists()) {
                            setCurrentUser({ ...user, ...userDoc.data() });
                        } else {
                            // Fallback for user who somehow didn't go through proper signup
                            const newData = {
                                uid: user.uid,
                                name: user.displayName || 'User',
                                email: user.email,
                                role: 'student',
                                college: '',
                                totalCredits: 0,
                                totalCleanups: 0,
                                badges: [],
                                rewardPoints: 0,
                                createdAt: new Date().toISOString()
                            };
                            await setDoc(doc(db, 'Users', user.uid), newData);
                            setCurrentUser({ ...user, ...newData });
                        }
                    } catch (err) {
                        console.error(err);
                        setCurrentUser(user);
                    }
                } else {
                    setCurrentUser({
                        ...user,
                        uid: '12345',
                        name: 'Demo User',
                        role: 'student',
                        totalCredits: 150,
                        totalCleanups: 5,
                        badges: ['Eco Starter'],
                        rewardPoints: 0
                    });
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signupWithEmail = async (email, password, name, role, college) => {
        try {
            if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                setCurrentUser({ uid: 'mock', email, name, role, college, totalCredits: 0, totalCleanups: 0, badges: [], rewardPoints: 0 });
                return;
            }
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const user = res.user;
            const userData = {
                uid: user.uid,
                name: name,
                email: email,
                role: role,
                college: college || '',
                totalCredits: 0,
                totalCleanups: 0,
                badges: [],
                rewardPoints: 0,
                createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'Users', user.uid), userData);
            setCurrentUser({ ...user, ...userData });
        } catch (error) {
            toast.error(error.message || 'Error signing up');
            throw error;
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                setCurrentUser({ uid: '12345', email, name: 'Demo User', role: 'student', totalCredits: 150, totalCleanups: 5, badges: ['Eco Starter'], rewardPoints: 0 });
                return;
            }
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            toast.error(`Login Failed: ${error.code || error.message}`);
            throw error;
        }
    };

    const loginWithGoogle = async (role = 'student', college = '') => {
        try {
            if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                setCurrentUser({
                    uid: '12345',
                    email: 'demo@google.com',
                    name: 'Demo Google User',
                    role,
                    college,
                    totalCredits: 150,
                    totalCleanups: 5,
                    badges: ['Eco Starter'],
                    rewardPoints: 0
                });
                return;
            }
            const res = await signInWithPopup(auth, googleProvider);
            const user = res.user;

            const userDoc = await getDoc(doc(db, 'Users', user.uid));
            if (!userDoc.exists()) {
                const userData = {
                    uid: user.uid,
                    name: user.displayName || 'User',
                    email: user.email,
                    role: role,
                    college: college,
                    totalCredits: 0,
                    totalCleanups: 0,
                    badges: [],
                    rewardPoints: 0,
                    createdAt: new Date().toISOString()
                };
                await setDoc(doc(db, 'Users', user.uid), userData);
                setCurrentUser({ ...user, ...userData });
            } else {
                setCurrentUser({ ...user, ...userDoc.data() });
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                setCurrentUser(null);
                toast.success('Logged out successfully');
                return;
            }
            await signOut(auth);
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, signupWithEmail, loginWithEmail, loginWithGoogle, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
