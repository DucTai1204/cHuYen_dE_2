import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const VerifyCertificate = () => {
    const { uuid } = useParams();
    const [certData, setCertData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showTechInfo, setShowTechInfo] = useState(false);

    useEffect(() => {
        api.get(`/certificates/verify/${uuid}/`)
            .then(res => { if (res.data.hop_le) setCertData(res.data.chung_chi); else setError(res.data.error || 'Chứng chỉ không hợp lệ.'); })
            .catch(() => setError('Mã UUID không tồn tại hoặc đã bị thu hồi.'))
            .finally(() => setLoading(false));
    }, [uuid]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Đang xác thực thông tin...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem', background: '#f0f2f5' }}>
            <div style={{ maxWidth: 1000, width: '100%', position: 'relative' }}>
                
                {/* Header Actions */}
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#64748b', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>
                        <MI name="arrow_back" /> Về trang chủ
                    </Link>
                    <div style={{ display: 'flex', gap: '.75rem' }}>
                        <button 
                            onClick={() => setShowTechInfo(!showTechInfo)}
                            style={{ background: showTechInfo ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', padding: '.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <MI name="info" style={{ fontSize: '1.1rem', color: '#64748b' }} /> {showTechInfo ? 'Ẩn chi tiết' : 'Thông số xác thực'}
                        </button>
                        <button 
                            onClick={() => {
                                const originalTitle = document.title;
                                document.title = `Chứng chỉ ${certData.ten_khoa_hoc} - ${certData.ho_va_ten_hoc_vien}`;
                                window.print();
                                document.title = originalTitle;
                            }}
                            style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <MI name="download" style={{ fontSize: '1.1rem' }} /> Tải PDF
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <MI name="report_problem" style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1rem' }} />
                        <h2 style={{ color: '#ef4444', fontWeight: 800 }}>Không tìm thấy chứng chỉ</h2>
                        <p style={{ color: '#64748b' }}>{error}</p>
                    </div>
                ) : (
                    <div style={{ position: 'relative' }}>
                        
                        {/* THE CERTIFICATE - A4 LANDSCAPE RATIO (1.414:1) */}
                        <div id="certificate-print-area" style={{
                            width: '100%',
                            aspectRatio: '1.414 / 1',
                            background: '#fff',
                            position: 'relative',
                            padding: '40px',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            border: '1px solid #d1d5db',
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#1e293b'
                        }}>
                            {/* Ornamental Frame */}
                            <div style={{ position: 'absolute', inset: '15px', border: '2px solid #e2e8f0', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', inset: '25px', border: '1px solid #f1f5f9', pointerEvents: 'none' }} />
                            
                            {/* Decorative Corners */}
                            <div style={{ position: 'absolute', top: 20, left: 20, width: 60, height: 60, borderTop: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6' }} />
                            <div style={{ position: 'absolute', top: 20, right: 20, width: 60, height: 60, borderTop: '4px solid #3b82f6', borderRight: '4px solid #3b82f6' }} />
                            <div style={{ position: 'absolute', bottom: 20, left: 20, width: 60, height: 60, borderBottom: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6' }} />
                            <div style={{ position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderBottom: '4px solid #3b82f6', borderRight: '4px solid #3b82f6' }} />

                            {/* Background Watermark */}
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, zIndex: 0, pointerEvents: 'none' }}>
                                <MI name="school" style={{ fontSize: '30rem' }} />
                            </div>

                            {/* Header Section */}
                            <div style={{ textAlign: 'center', zIndex: 1, marginTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <div style={{ background: '#3b82f6', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                        <MI name="verified" style={{ fontSize: '1.8rem' }} />
                                    </div>
                                </div>
                                <h4 style={{ margin: 0, letterSpacing: '0.3em', color: '#3b82f6', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>Chứng Chỉ Hoàn Thành</h4>
                                <h1 style={{ margin: '10px 0', fontSize: '3.5rem', fontWeight: 900, fontFamily: "'Times New Roman', serif", color: '#1e293b' }}>CERTIFICATE</h1>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                                    <div style={{ height: '1px', background: '#e2e8f0', width: '80px' }} />
                                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Cấp bởi Hệ thống Đào tạo EduHKT</span>
                                    <div style={{ height: '1px', background: '#e2e8f0', width: '80px' }} />
                                </div>
                            </div>

                            {/* Body Section */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', zIndex: 1, padding: '0 60px' }}>
                                <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '5px', fontStyle: 'italic' }}>Chứng nhận rằng</p>
                                <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#1e3a8a', margin: '5px 0', fontFamily: "'EB Garamond', serif" }}>{certData.ho_va_ten_hoc_vien}</h2>
                                <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, #3b82f6, transparent)', margin: '15px auto' }} />
                                <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '10px' }}>Đã hoàn thành xuất sắc khóa học chuyên môn</p>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2563eb', margin: '5px 0' }}>{certData.ten_khoa_hoc}</h3>
                            </div>

                            {/* Footer Section */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1, padding: '0 20px 20px 20px' }}>
                                <div style={{ textAlign: 'center', width: '180px' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700, marginBottom: '10px' }}>
                                        {(() => {
                                            const d = new Date(certData.ngay_cap);
                                            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                        })()}
                                    </div>
                                    <div style={{ height: '1px', background: '#1e293b', width: '100%', marginBottom: '5px' }} />
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Ngày cấp chứng nhận</div>
                                </div>

                                <div style={{ textAlign: 'center', position: 'relative' }}>
                                    {/* Mock Seal */}
                                    <div style={{ width: 100, height: 100, border: '4px double #3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', position: 'absolute', top: -110, left: '50%', transform: 'translateX(-50%) rotate(-15deg)', opacity: 0.8 }}>
                                        <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '0.6rem' }}>
                                            EDUKHT<br/>VERIFIED<br/>{new Date().getFullYear()}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>ID: {certData.ma_uuid_chung_chi.slice(0, 18).toUpperCase()}</div>
                                </div>

                                <div style={{ textAlign: 'center', width: '180px' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 800, marginBottom: '10px', minHeight: '20px' }}>{certData.ten_to_chuc_cap || 'Tập đoàn EduHKT'}</div>
                                    <div style={{ height: '1px', background: '#1e293b', width: '100%', marginBottom: '5px' }} />
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Đơn vị xác thực đào tạo</div>
                                </div>
                            </div>
                        </div>

                        {/* Technical Information - Toggleable Panel */}
                        {showTechInfo && (
                            <div className="fade-up no-print" style={{ marginTop: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <MI name="settings_ethernet" style={{ color: '#3b82f6' }} />
                                    <span style={{ fontWeight: 700, fontSize: '.85rem', color: '#475569', textTransform: 'uppercase' }}>Thông số kỹ thuật xác thực</span>
                                </div>
                                <div style={{ padding: '1rem 1.25rem' }}>
                                    {[
                                        { label: 'Mã định danh (UUID)', value: certData.ma_uuid_chung_chi, mono: true },
                                        { label: 'Mã băm bảo mật (Hash)', value: certData.chuoi_hash_blockchain, mono: true },
                                        { label: 'Trạng thái hệ thống', value: certData.trang_thai === 'HieuLuc' ? 'Đang có hiệu lực' : 'Đã thu hồi', color: '#10b981' },
                                        { label: 'Tổ chức cấp chuyển môn', value: certData.ten_to_chuc_cap || 'Hệ thống EduHKT' },
                                    ].map(({ label, value, mono, color }) => (
                                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '.6rem 0', borderBottom: '1px solid #f8fafc' }}>
                                            <span style={{ fontSize: '.8rem', color: '#64748b' }}>{label}</span>
                                            <span style={{ fontSize: '.8rem', fontWeight: 600, color: color || '#1e293b', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all', textAlign: 'right', marginLeft: '2rem' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Banner */}
                        {!showTechInfo && (
                            <div className="fade-up no-print" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', padding: '1rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #bbf7d0', color: '#065f46', fontSize: '.9rem', fontWeight: 600 }}>
                                <MI name="verified" style={{ color: '#059669' }} />
                                <span>Chứng chỉ này là hợp lệ và được xác thực bởi hệ thống EduHKT</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    @page { 
                        size: landscape;
                        margin: 0;
                    }
                    
                    /* Bước 1: Triệt tiêu toàn bộ nội dung trang */
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        height: 100% !important;
                        width: 100% !important;
                        background: white !important;
                    }
                    body > *:not(#root),
                    nav, header, footer, .no-print {
                        display: none !important;
                    }
                    
                    /* Bước 2: Xóa sạch không gian của mọi phần tử cha */
                    #root, #root > *, #root > * > *, #root > * > * > * {
                        display: contents !important;
                    }
                    
                    /* Bước 3: Chỉ hiển thị duy nhất tấm bằng */
                    #certificate-print-area {
                        display: flex !important;
                        flex-direction: column;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        margin: 0 !important;
                        padding: 15mm !important;
                        z-index: 99999;
                        border: none !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        background: white !important;
                        box-sizing: border-box !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        aspect-ratio: unset !important;
                    }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default VerifyCertificate;
