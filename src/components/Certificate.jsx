import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Certificate({ milestone }) {
    const { currentUser } = useAuth();
    const certRef = useRef(null);

    const downloadPDF = async () => {
        const canvas = await html2canvas(certRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
        pdf.save(`${currentUser?.displayName || 'Student'}_${milestone}_Certificate.pdf`);
    };

    const getStyle = () => {
        switch (milestone) {
            case 'Gold': return { color: '#facc15', border: '#facc15' };
            case 'Silver': return { color: '#cbd5e1', border: '#cbd5e1' };
            case 'Bronze': default: return { color: '#f59e0b', border: '#f59e0b' };
        }
    };

    const theme = getStyle();

    return (
        <div className="flex flex-col items-center gap-4 mt-8">
            <div
                ref={certRef}
                className="glass-panel"
                style={{
                    width: '800px',
                    height: '565px',
                    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                    border: `4px solid ${theme.border}`,
                    position: 'relative',
                    padding: '4rem',
                    textAlign: 'center',
                    color: 'white'
                }}
            >
                <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: `2px dashed ${theme.border}`, opacity: 0.5 }}></div>

                <h1 style={{ fontSize: '3rem', color: theme.color, textTransform: 'uppercase', marginBottom: '2rem', fontFamily: 'var(--font-heading)', marginTop: '2rem' }}>
                    Certificate of Achievement
                </h1>

                <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '1rem' }}>This certifies that</p>

                <h2 style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: '1rem', borderBottom: '2px solid rgba(16, 185, 129, 0.3)', display: 'inline-block', paddingBottom: '0.5rem' }}>
                    {currentUser?.displayName || 'Outstanding Student'}
                </h2>

                <p style={{ fontSize: '1.25rem', color: '#94a3b8', margin: '1rem 0 2rem', maxWidth: '600px', marginInline: 'auto' }}>
                    has successfully reached the <strong style={{ color: theme.color }}>{milestone} Milestone</strong> in the Clean Madurai initiative, demonstrating exceptional commitment to environmental sustainability.
                </p>

                <div className="flex justify-between" style={{ marginTop: '3rem', padding: '0 4rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid white', width: '200px', marginBottom: '0.5rem' }}></div>
                        <p style={{ color: '#94a3b8' }}>Clean Madurai AI</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '1.5rem', color: theme.color, marginTop: '-0.5rem' }}>APPROVED</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid white', width: '200px', marginBottom: '0.5rem' }}></div>
                        <p style={{ color: '#94a3b8' }}>{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <button className="btn btn-primary mt-4" onClick={downloadPDF}>
                <Download size={18} /> Download Certificate
            </button>
        </div>
    );
}
