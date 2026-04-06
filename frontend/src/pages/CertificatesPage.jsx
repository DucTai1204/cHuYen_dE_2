import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const CertificatesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch enrollments that are completed
        api.get('/lms/dang-ky-hoc/')
            .then(res => {
                const completed = (res.data || []).filter(e => e.trang_thai_hoc === 'DaXong');
                setCertificates(completed);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="fade-up" style={{ padding: '1.5rem 0' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '.5rem' }}>Kho Chứng Chỉ Số</h1>
                <p style={{ color: '#64748b', fontSize: '.9rem' }}>Nơi lưu trữ các chứng chỉ đã được xác thực bằng công nghệ Blockchain của bạn.</p>
            </div>

            {certificates.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '5rem 2rem', 
                    background: '#fff', 
                    borderRadius: '20px', 
                    border: '1px dashed #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{ 
                        width: 80, height: 80, background: '#f8fafc', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' 
                    }}>
                        <MI name="workspace_premium" style={{ fontSize: '3rem', color: '#cbd5e1' }} />
                    </div>
                    <h3 style={{ fontWeight: 700, color: '#475569', marginBottom: '.75rem' }}>Chưa có chứng chỉ nào</h3>
                    <p style={{ color: '#64748b', fontSize: '.9rem', maxWidth: 400, marginBottom: '2rem' }}>
                        Hãy hoàn thành khóa học để nhận được những chứng chỉ danh giá được xác thực trên Blockchain.
                    </p>
                    <Link to="/dashboard">
                        <button style={{ 
                            padding: '.75rem 1.5rem', background: '#2563eb', color: '#fff', 
                            border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '.5rem'
                        }}>
                            <MI name="school" /> Vào trang học tập
                        </button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {certificates.map(item => {
                        const course = item.khoa_hoc || item.id_khoa_hoc;
                        const cert = item.chung_chi?.[0];


                        return (
                            <div key={item.id_dang_ky} style={{ 
                                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', 
                                overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s', position: 'relative'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {/* Decorative background */}
                                <div style={{ 
                                    height: '80px', 
                                    background: 'linear-gradient(135deg, var(--secondary), var(--primary))', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    padding: '0 1.25rem' 
                                }}>
                                    <MI name="verified" style={{ fontSize: '2.4rem', color: '#fff' }} />
                                </div>

                                <div style={{ padding: '1.25rem' }}>
                                    <div style={{ fontSize: '.7rem', color: '#3b82f6', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.5rem' }}>
                                        Blockchain EdunChain
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', lineHeight: 1.4 }}>
                                        {course?.ten_khoa_hoc}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem' }}>
                                            <span style={{ color: '#64748b' }}>Ngày cấp:</span>
                                            <span style={{ color: '#1e293b', fontWeight: 600 }}>{new Date(item.ngay_dang_ky).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem' }}>
                                            <span style={{ color: '#64748b' }}>Trình độ:</span>
                                            <span style={{ color: '#1e293b', fontWeight: 600 }}>{course?.trinh_do || 'Hoàn thành'}</span>
                                        </div>
                                        {cert && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem' }}>
                                                <span style={{ color: '#64748b' }}>Mã định danh:</span>
                                                <span style={{ color: '#3b82f6', fontWeight: 700, fontFamily: 'monospace' }}>
                                                    {cert.ma_uuid_chung_chi.slice(0, 8)}...
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '.75rem' }}>
                                        <button 
                                            onClick={() => {
                                                if (cert) navigate(`/verify/${cert.ma_uuid_chung_chi}`);
                                                else alert('Thông tin chứng chỉ đang được cập nhật...');
                                            }}
                                            style={{ 
                                                flex: 1, padding: '.6rem', background: 'var(--primary)', color: '#fff', 
                                                border: 'none', borderRadius: '8px', fontSize: '.85rem', fontWeight: 700, 
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' 
                                            }}
                                        >
                                            <MI name="visibility" style={{ fontSize: '1rem' }} /> XEM
                                        </button>
                                        <button 
                                            style={{ 
                                                width: 42, background: '#f1f5f9', color: '#475569', 
                                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            onClick={() => {
                                                if (cert) navigate(`/verify/${cert.ma_uuid_chung_chi}`);
                                            }}
                                        >
                                            <MI name="download" style={{ fontSize: '1.2rem' }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CertificatesPage;
