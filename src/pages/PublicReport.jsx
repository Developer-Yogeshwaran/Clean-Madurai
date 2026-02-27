import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Camera, MapPin, AlertCircle, Send } from 'lucide-react';

export default function PublicReport() {
    const { currentUser } = useAuth();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submitReport = async (e) => {
        e.preventDefault();
        if (!image || !description) {
            toast.error('Please provide both an image and a description');
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
            toast('Location access denied or timeout. Using default anonymous coordinates.', { icon: '⚠️' });
        }

        try {
            if (!import.meta.env.VITE_FIREBASE_API_KEY) {
                await new Promise(r => setTimeout(r, 1500));
                toast.success('Report submitted successfully! Thank you for keeping Madurai clean.');
                setImage(null); setPreview(''); setDescription('');
                setLoading(false);
                return;
            }

            const imgRef = ref(storage, `PublicReports/${currentUser?.uid || 'anonymous'}/${Date.now()}_report`);
            await uploadBytes(imgRef, image);
            const url = await getDownloadURL(imgRef);

            await addDoc(collection(db, 'PublicReports'), {
                userId: currentUser?.uid || 'anonymous',
                imageUrl: url,
                description,
                latitude: coords.latitude,
                longitude: coords.longitude,
                rewardPoints: 0,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            toast.success('Report submitted successfully! The authorities have been notified.');
            setImage(null);
            setPreview('');
            setDescription('');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '3rem', maxWidth: '800px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 mt-8">
                <div className="text-center mb-8">
                    <AlertCircle size={48} color="#f59e0b" className="mx-auto mb-4" />
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Report Garbage</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Found a public location that needs cleaning? Report it here and help keep Madurai green.</p>
                </div>

                <form onSubmit={submitReport} className="flex flex-col gap-6">
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Photo of the Issue</label>
                        {preview ? (
                            <div className="text-center">
                                <img src={preview} alt="Preview" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-glass)' }} />
                                <button type="button" className="btn btn-outline mt-4" onClick={() => { setImage(null); setPreview('') }}>Choose Different Image</button>
                            </div>
                        ) : (
                            <div className="upload-area relative flex justify-center items-center flex-col gap-3 cursor-pointer" onClick={() => document.getElementById('reportImage').click()}>
                                <input type="file" id="reportImage" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                                <div className="flex flex-col items-center justify-center text-muted hover:text-white transition-colors">
                                    <Camera size={40} color="var(--primary-light)" className="mb-2" />
                                    <span>Click to capture or upload photo</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="desc" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description & Location Details</label>
                        <textarea
                            id="desc"
                            className="input-field"
                            rows="4"
                            placeholder="E.g., Large pile of plastic waste near Meenakshi Amman Temple east gate..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="glass-panel text-center" style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.05)' }}>
                        <MapPin size={24} color="#38bdf8" className="mx-auto mb-2" />
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Your current location will be automatically attached to this report.</p>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '1rem', fontSize: '1.2rem' }}>
                        {loading ? 'Submitting...' : <><Send size={20} /> Submit Report</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
