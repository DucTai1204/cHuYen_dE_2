import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [certs, setCerts] = useState([]);
    const fileInputRef = useRef(null);
    
    // Form states
    const [hoVaTen, setHoVaTen] = useState('');
    const [bio, setBio] = useState('');
    const [hinhAnhLogo, setHinhAnhLogo] = useState('');
    const [kyNang, setKyNang] = useState('');
    const [readyToWork, setReadyToWork] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile/');
                setProfile(res.data);
                setHoVaTen(res.data.ho_va_ten || '');
                setBio(res.data.bio || '');
                setHinhAnhLogo(res.data.hinh_anh_logo || '');
                setKyNang(res.data.ky_nang || '');
                setReadyToWork(res.data.ready_to_work ?? true);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Kích thước ảnh tối đa là 2MB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setHinhAnhLogo(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.patch('/auth/profile/', {
                ho_va_ten: hoVaTen,
                bio: bio,
                hinh_anh_logo: hinhAnhLogo,
                ky_nang: kyNang,
                ready_to_work: readyToWork
            });
            setProfile(res.data);
            if (setUser) setUser({ ...user, ...res.data });
            alert('Cập nhật hồ sơ thành công!');
        } catch (err) {
            console.error('Lỗi API:', err);
            let msg = 'Lỗi cập nhật hồ sơ';
            if (err.response?.data) {
                if (typeof err.response.data === 'object') {
                    // Xử lý lỗi theo từng trường (DRF default)
                    msg = Object.entries(err.response.data)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join('\n');
                } else if (typeof err.response.data === 'string') {
                    msg = err.response.data;
                }
            }
            alert(msg || 'Lỗi không xác định');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--primary)', fontWeight: 700 }}>Đang tải...</div>;

    const isEmployer = user?.vai_tro === 'NhaTuyenDung';
    const isSeller = user?.vai_tro === 'GiangVien';

    return (
        <div className="fade-up" style={{ maxWidth: 840, margin: '0 auto', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Cài đặt hồ sơ</h1>
                    <p style={{ color: '#64748b', fontSize: '.8rem' }}>Quản lý thông tin hiển thị và thương hiệu cá nhân của bạn trên hệ thống.</p>
                </div>
                <div style={{ 
                    background: readyToWork ? '#ecfdf5' : '#fef2f2', 
                    color: readyToWork ? '#059669' : '#b91c1c',
                    padding: '.35rem .75rem', borderRadius: '20px', fontSize: '.7rem', 
                    fontWeight: 800, display: 'flex', alignItems: 'center', gap: '.3rem', border: '1px solid currentColor'
                }}>
                    <MI name={readyToWork ? 'check_circle' : 'pause_circle'} style={{ fontSize: '.9rem' }} />
                    {readyToWork ? 'ĐANG HIỂN THỊ' : 'ĐANG TẠM ẨN'}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: Avatar & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ 
                        background: '#fff', padding: '2rem 1.5rem', borderRadius: '20px', 
                        border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: 'var(--shadow-sm)',
                        position: 'relative'
                    }}>
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            style={{ 
                                width: 120, height: 120, margin: '0 auto 1.25rem', position: 'relative', cursor: 'pointer',
                                background: hinhAnhLogo ? 'transparent' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                color: '#fff', borderRadius: '24px', display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', fontSize: '3rem', fontWeight: 900, overflow: 'hidden',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.1)', border: '4px solid #fff'
                            }}
                        >
                            {hinhAnhLogo ? (
                                <img src={hinhAnhLogo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                hoVaTen ? hoVaTen[0].toUpperCase() : user?.username[0].toUpperCase()
                            )}
                            <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all .25s' }}>
                                <MI name="photo_camera" style={{ fontSize: '1.8rem', marginBottom: '.25rem' }} />
                                <span style={{ fontSize: '.65rem', fontWeight: 700 }}>ĐỔI ẢNH</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                        
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '.1rem', color: '#1e293b' }}>{hoVaTen || user?.username}</h2>
                        <p style={{ color: '#64748b', fontSize: '.75rem', marginBottom: '1.25rem' }}>@{user?.username}</p>
                        
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current.click()}
                            style={{ background: '#f1f5f9', border: 'none', width: '100%', padding: '.6rem', borderRadius: '10px', fontSize: '.75rem', fontWeight: 700, color: '#475569', cursor: 'pointer', transition: 'all .2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                        >
                            <MI name="upload" style={{ fontSize: '.9rem', verticalAlign: 'middle', marginRight: '.3rem' }} /> Tải ảnh từ máy
                        </button>
                    </div>

                    {!isSeller && (
                        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '.85rem', fontWeight: 800, marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.4rem', color: '#1e293b' }}>
                                <MI name="workspace_premium" style={{ color: '#f59e0b', fontSize: '1.1rem' }} /> Chứng chỉ ({certs.length})
                            </h3>
                            {certs.length === 0 ? (
                                <p style={{ fontSize: '.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có chứng chỉ.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                    {certs.slice(0, 3).map(c => (
                                        <div key={c.id_dang_ky} style={{ padding: '.6rem .75rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '.7rem', fontWeight: 700, color: '#475569' }}>
                                            {c.khoa_hoc?.ten_khoa_hoc}
                                        </div>
                                    ))}
                                    {certs.length > 3 && <div style={{ fontSize: '.65rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 700 }}>Và {certs.length - 3} chứng chỉ khác</div>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Modern Form */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)' }}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 800, color: '#475569', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.02em' }}>
                                    {isEmployer ? 'Tên Doanh nghiệp' : 'Họ và tên'}
                                </label>
                                <input value={hoVaTen} onChange={e => setHoVaTen(e.target.value)} style={{ width: '100%', padding: '.75rem 1rem', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '.9rem', background: '#fcfcfc', transition: 'all .25s' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 800, color: '#475569', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.02em' }}>Kỹ năng sở hữu</label>
                                <input value={kyNang} onChange={e => setKyNang(e.target.value)} placeholder="ReactJS, Python..." style={{ width: '100%', padding: '.75rem 1rem', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '.9rem', background: '#fcfcfc', transition: 'all .25s' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 800, color: '#475569', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.02em' }}>
                                {isEmployer ? 'Mô tả Doanh nghiệp' : 'Giới thiệu bản thân (Bio)'}
                            </label>
                            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Hãy chia sẻ một chút về bạn..." style={{ width: '100%', padding: '.75rem 1rem', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', minHeight: 100, fontSize: '.9rem', background: '#fcfcfc', transition: 'all .25s', resize: 'vertical' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 1.25rem', background: 'var(--primary-light)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--secondary-dark)' }}>Trạng thái kết nối</div>
                                <div style={{ fontSize: '.7rem', color: 'var(--secondary)', opacity: 0.8 }}>Cho phép người khác tìm thấy bạn qua kỹ năng.</div>
                            </div>
                            <button 
                                type="button" onClick={() => setReadyToWork(!readyToWork)}
                                style={{ width: 48, height: 24, borderRadius: '99px', background: readyToWork ? 'var(--primary)' : '#cbd5e1', border: 'none', position: 'relative', cursor: 'pointer', transition: 'all .3s ease' }}
                            >
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: readyToWork ? 27 : 3, transition: 'all .3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                            </button>
                        </div>

                        <button 
                            type="submit" disabled={saving} 
                            style={{ 
                                marginTop: '.5rem', padding: '1rem', background: 'var(--primary)', color: '#fff', 
                                border: 'none', borderRadius: '14px', fontWeight: 900, cursor: 'pointer',
                                transition: 'all .25s', boxShadow: '0 8px 20px rgba(200,162,122,0.3)',
                                letterSpacing: '.05rem', fontSize: '.9rem'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(200,162,122,0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(200,162,122,0.3)'; }}
                        >
                            {saving ? 'ĐANG XỬ LÝ...' : 'LƯU THAY ĐỔI NGAY'}
                        </button>
                    </form>
                </div>
            </div>
            
            <style>{`
                .avatar-overlay:hover { opacity: 1 !important; }
                input:focus, textarea:focus { background: #fff !important; }
            `}</style>
        </div>
    );
};

export default ProfilePage;
