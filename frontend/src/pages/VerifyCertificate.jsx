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
                    <div className="alert alert-danger" style={{ textAlign: 'center' }}>
                        <strong>Không hợp lệ!</strong><br />{error}
                    </div>
                ) : (
                    <>
                        <div className="alert alert-success">
                            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="verified" style={{ fontSize: '1rem', color: '#059669' }} /> Chứng chỉ hợp lệ</strong> — Đã được xác minh và lưu trữ trên hệ thống Blockchain.
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '2rem' }}>
                            {[
                                { label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="fingerprint" style={{ fontSize: '1rem' }} /> Mã UUID</span>, value: certData.ma_uuid_chung_chi, small: true },
                                { label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="link" style={{ fontSize: '1rem' }} /> Hash Blockchain</span>, value: certData.chuoi_hash_blockchain || 'Đang đồng bộ...', small: true },
                                { label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="calendar_today" style={{ fontSize: '1rem' }} /> Ngày cấp</span>, value: new Date(certData.ngay_cap).toLocaleDateString('vi-VN', { dateStyle: 'long' }) },
                                { label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="event_busy" style={{ fontSize: '1rem' }} /> Hết hạn</span>, value: certData.ngay_het_han ? new Date(certData.ngay_het_han).toLocaleDateString('vi-VN', { dateStyle: 'long' }) : 'Vĩnh viễn' },
                                { label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="fact_check" style={{ fontSize: '1rem' }} /> Trạng thái</span>, value: certData.trang_thai === 'HieuLuc' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', color: '#059669' }}><MI name="check_circle" style={{ fontSize: '1rem' }} /> Có hiệu lực</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', color: '#ef4444' }}><MI name="cancel" style={{ fontSize: '1rem' }} /> Đã thu hồi</span> },
                            ].map(({ label, value, small }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '.75rem 1rem', background: 'rgba(255,255,255,.03)', borderRadius: 'var(--radius-sm)', gap: '1rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '.85rem', whiteSpace: 'nowrap' }}>{label}</span>
                                    <span style={{ fontFamily: small ? 'monospace' : 'inherit', fontSize: small ? '.78rem' : '.9rem', wordBreak: 'break-all', textAlign: 'right', color: 'var(--text-primary)' }}>{value}</span>
                                </div>
                            ))}
                        </div>

                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }} onClick={() => window.print()}>
                            <MI name="print" style={{ fontSize: '1.1rem' }} /> In chứng chỉ / Tải về
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
