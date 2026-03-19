import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [certs, setCerts] = useState([]);
    
    // Form states
    const [hoVaTen, setHoVaTen] = useState('');
    const [bio, setBio] = useState('');
    const [kyNang, setKyNang] = useState('');
    const [readyToWork, setReadyToWork] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/core/profile/');
                setProfile(res.data);
                setHoVaTen(res.data.ho_va_ten || '');
                setBio(res.data.bio || '');
                setKyNang(res.data.ky_nang || '');
                setReadyToWork(res.data.ready_to_work ?? true);

                // Also fetch certificates for the profile view
                const eRes = await api.get('/lms/dang-ky-hoc/');
                const completed = (eRes.data || []).filter(e => e.trang_thai_hoc === 'DaXong');
                setCerts(completed);
            } catch (err) {
                console.error('Lỗi tải hồ sơ:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.patch('/core/profile/', {
                ho_va_ten: hoVaTen,
                bio: bio,
                ky_nang: kyNang,
                ready_to_work: readyToWork
            });
            setProfile(res.data);
            // Cập nhật user trong context nếu cần
            if (setUser) setUser({ ...user, ...res.data });
            alert('Cập nhật hồ sơ thành công!');
        } catch (err) {
            alert('Lỗi cập nhật hồ sơ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Đang tải hồ sơ năng lực...</div>;

    return (
        <div className="fade-up" style={{ maxWidth: 1000, margin: '0 auto', padding: '1rem 0' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '.5rem' }}>Hồ Sơ Năng Lực</h1>
                <p style={{ color: '#64748b', fontSize: '.9rem' }}>Quản lý thông tin cá nhân và kỹ năng của bạn để kết nối với nhà tuyển dụng.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
                {/* Left: Info Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ 
                        background: '#fff', padding: '2rem', borderRadius: '16px', 
                        border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: 'var(--shadow-sm)' 
                    }}>
                        <div style={{ 
                            width: 110, height: 110, background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', 
                            color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', 
                            justifyContent: 'center', fontSize: '2.8rem', fontWeight: 800, marginBottom: '1.25rem',
                            boxShadow: '0 8px 16px rgba(30,58,138,0.2)'
                        }}>
                            {hoVaTen ? hoVaTen[0].toUpperCase() : user?.username[0].toUpperCase()}
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '.25rem' }}>{hoVaTen || user?.username}</h2>
                        <p style={{ color: '#64748b', fontSize: '.85rem', marginBottom: '1.5rem' }}>@{user?.username}</p>
                        
                        <div style={{ 
                            background: readyToWork ? '#ecfdf5' : '#fef2f2', 
                            color: readyToWork ? '#059669' : '#b91c1c',
                            padding: '.5rem', borderRadius: '8px', fontSize: '.75rem', 
                            fontWeight: 800, display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', gap: '.4rem', border: '1px solid currentColor'
                        }}>
                            <MI name={readyToWork ? 'check_circle' : 'pause_circle'} style={{ fontSize: '1.1rem' }} />
                            {readyToWork ? 'SẴN SÀNG LÀM VIỆC' : 'ĐANG TẠM NGƯNG'}
                        </div>
                    </div>

                    <div style={{ 
                        background: '#fff', padding: '1.5rem', borderRadius: '16px', 
                        border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' 
                    }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <MI name="workspace_premium" style={{ color: '#f59e0b' }} /> Chứng chỉ của tôi ({certs.length})
                        </h3>
                        {certs.length === 0 ? (
                            <p style={{ fontSize: '.85rem', color: '#64748b', textAlign: 'center', padding: '1rem' }}>Chưa có chứng chỉ.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                                {certs.map(c => (
                                    <div key={c.id_dang_ky} style={{ padding: '.75rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontWeight: 700, fontSize: '.85rem', color: '#1e293b' }}>{c.khoa_hoc?.ten_khoa_hoc}</div>
                                        <div style={{ fontSize: '.7rem', color: '#64748b' }}>{new Date(c.ngay_dang_ky).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Edit Form */}
                <div style={{ 
                    background: '#fff', padding: '2rem', borderRadius: '16px', 
                    border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' 
                }}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, color: '#475569', marginBottom: '.5rem' }}>Họ và tên</label>
                            <input 
                                value={hoVaTen} 
                                onChange={e => setHoVaTen(e.target.value)} 
                                style={{ width: '100%', padding: '.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                placeholder="Nhập họ và tên đầy đủ"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, color: '#475569', marginBottom: '.5rem' }}>Giới thiệu bản thân (Bio)</label>
                            <textarea 
                                value={bio} 
                                onChange={e => setBio(e.target.value)} 
                                style={{ width: '100%', padding: '.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', minHeight: 120, resize: 'vertical' }}
                                placeholder="Chia sẻ đôi chút về thế mạnh của bạn..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 700, color: '#475569', marginBottom: '.5rem' }}>Kỹ năng chuyên môn</label>
                            <input 
                                value={kyNang} 
                                onChange={e => setKyNang(e.target.value)} 
                                style={{ width: '100%', padding: '.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                placeholder="Ví dụ: ReactJS, Python, SQL, Design Thinking (cách nhau bằng dấu phẩy)"
                            />
                            <p style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: '.4rem' }}>Nhà tuyển dụng sẽ tìm kiếm bạn dựa trên các từ khóa kỹ năng này.</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#1e293b' }}>Sẵn sàng nhận việc thực tế</div>
                                <div style={{ fontSize: '.75rem', color: '#64748b' }}>Cho phép nhà tuyển dụng tìm thấy và liên hệ trực tiếp với bạn.</div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setReadyToWork(!readyToWork)}
                                style={{ 
                                    width: 50, height: 26, borderRadius: '99px', background: readyToWork ? '#10b981' : '#cbd5e1', 
                                    border: 'none', position: 'relative', cursor: 'pointer', transition: 'all .2s' 
                                }}
                            >
                                <div style={{ 
                                    width: 20, height: 20, borderRadius: '50%', background: '#fff', 
                                    position: 'absolute', top: 3, left: readyToWork ? 27 : 3, transition: 'all .2s' 
                                }} />
                            </button>
                        </div>

                        <button 
                            type="submit" 
                            disabled={saving}
                            style={{ 
                                padding: '1rem', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', 
                                color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, 
                                cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 12px rgba(30,58,138,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem'
                            }}
                        >
                            {saving ? <MI name="sync" style={{ animation: 'spin 2s linear infinite' }} /> : <MI name="save" />}
                            {saving ? 'ĐANG LƯU HỒ SƠ...' : 'CẬP NHẬT HỒ SƠ NĂNG LỰC'}
                        </button>
                    </form>
                </div>
            </div>
            <style>{`@keyframes spin { from {transform: rotate(0deg)} to {transform: rotate(360deg)} }`}</style>
        </div>
    );
};

export default ProfilePage;
