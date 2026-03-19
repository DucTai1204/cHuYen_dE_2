import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const VerifyCertificate = () => {
    const { uuid } = useParams();
    const [certData, setCertData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/certificates/verify/${uuid}/`)
            .then(res => { if (res.data.hop_le) setCertData(res.data.chung_chi); else setError(res.data.error || 'Chứng chỉ không hợp lệ.'); })
            .catch(() => setError('Mã UUID không tồn tại hoặc đã bị thu hồi.'))
            .finally(() => setLoading(false));
    }, [uuid]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Đang xác thực Blockchain Hash...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 0' }}>
            <div className="glass-panel fade-up" style={{ maxWidth: 600, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '.5rem', display: 'flex', justifyContent: 'center' }}>
                        <MI name={error ? 'cancel' : 'verified'} style={{ fontSize: '3rem', color: error ? '#ef4444' : '#10b981' }} />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Xác Thực Chứng Chỉ Số</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginTop: '.3rem' }}>Hệ thống EduChain Blockchain Verification</p>
                </div>

                {error ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <MI name="report_problem" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }} />
                        <h3 style={{ color: '#ef4444', fontWeight: 700 }}>Không hợp lệ!</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Visual Certificate Card */}
                        <div style={{ 
                            background: 'white', 
                            padding: '2.5rem', 
                            borderRadius: '16px', 
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            marginBottom: '2rem',
                            position: 'relative',
                            overflow: 'hidden',
                            color: '#1e293b'
                        }}>
                            {/* Decorative elements */}
                            <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(16, 185, 129, 0.05)', borderRadius: '50%' }} />
                            
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '.5rem' }}>
                                    Chứng Chỉ Hoàn Thành
                                </div>
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, fontFamily: "'EB Garamond', serif" }}>
                                    CERTIFICATE
                                </h1>
                                <div style={{ width: 60, height: 2, background: '#3b82f6', margin: '.75rem auto' }} />
                                <div style={{ fontSize: '.85rem', color: '#64748b' }}>Hệ thống đào tạo trực tuyến EduChain</div>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                <div style={{ fontSize: '.9rem', color: '#64748b', marginBottom: '.5rem' }}>Chứng nhận rằng</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e293b', marginBottom: '.5rem' }}>
                                    {certData.ho_va_ten_hoc_vien}
                                </div>
                                <div style={{ fontSize: '.9rem', color: '#64748b' }}>đã hoàn thành xuất sắc khóa học</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2563eb', marginTop: '.75rem' }}>
                                    {certData.ten_khoa_hoc}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>Ngày cấp</div>
                                    <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{new Date(certData.ngay_cap).toLocaleDateString('vi-VN')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: 64, height: 64, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e2e8f0', color: '#3b82f6', fontSize: '2rem' }}>
                                        <MI name="verified" style={{ fontSize: '2rem' }} />
                                    </div>
                                    <div style={{ fontSize: '.6rem', fontWeight: 800, color: '#94a3b8', marginTop: '.4rem', textTransform: 'uppercase' }}>Xác minh blockchain</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>Tổ chức cấp</div>
                                    <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{certData.ten_to_chuc_cap || 'EduChain Academy'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                            <MI name="verified" style={{ fontSize: '1.25rem', color: '#059669', marginRight: '.75rem' }} />
                            <span><strong>Chứng chỉ hợp lệ</strong> — Đã được xác minh và lưu trữ trên hệ thống Blockchain.</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.1rem', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '.8rem', color: '#64748b', fontWeight: 700, marginLeft: '.5rem', marginBottom: '.5rem', textTransform: 'uppercase' }}>Thông tin kỹ thuật</p>
                            {[
                                { label: 'Mã định danh (UUID)', value: certData.ma_uuid_chung_chi, small: true },
                                { label: 'Blockchain Hash', value: certData.chuoi_hash_blockchain || 'Đang đồng bộ...', small: true },
                                { label: 'Tổ chức cấp chuyển môn', value: certData.ten_to_chuc_cap || 'EduChain / ' + (certData.id_dang_ky?.id_khoa_hoc?.id_giang_vien?.ho_va_ten || 'Giảng viên hệ thống') },
                                { label: 'Trạng thái hiệu lực', value: certData.trang_thai === 'HieuLuc' ? 'Đang có hiệu lực' : 'Đã thu hồi' },
                            ].map(({ label, value, small }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b', fontSize: '.8rem' }}>{label}</span>
                                    <span style={{ fontFamily: small ? 'monospace' : 'inherit', fontSize: small ? '.7rem' : '.85rem', wordBreak: 'break-all', textAlign: 'right', fontWeight: 500, color: '#1e293b' }}>{value}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="btn-primary" 
                            style={{ 
                                width: '100%', 
                                justifyContent: 'center', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '.6rem',
                                padding: '1rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                border: 'none',
                                color: 'white',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }} 
                            onClick={() => window.print()}
                        >
                            <MI name="print" style={{ fontSize: '1.2rem' }} /> In chứng chỉ / Tải về PDF
                        </button>
                    </>
                )}


                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '.85rem', textDecoration: 'none' }}>← Về trang chủ</Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyCertificate;
