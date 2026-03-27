import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.25rem', ...style }}>{name}</span>;
const SELLER_ORANGE = '#d97706';

const Toggle = ({ checked, onChange }) => (
    <div 
        onClick={() => onChange(!checked)}
        style={{
            width: '45px', height: '24px', borderRadius: '15px', cursor: 'pointer',
            position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: checked ? `linear-gradient(to right, #f59e0b, #d97706)` : '#cbd5e1',
            boxShadow: checked ? '0 4px 10px -2px rgba(217,119,6,0.5)' : 'none'
        }}
    >
        <div style={{
            width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
            position: 'absolute', top: '3px', left: checked ? '24px' : '3px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }} />
    </div>
);

const SellerSettings = () => {
    const { user } = useAuth();
    const [courseCount, setCourseCount] = useState(0);
    const [settings, setSettings] = useState({
        enrollNotify: true, reviewEmail: true, publicProfile: false
    });

    useEffect(() => {
        api.get('/lms/khoa-hoc/my-courses/')
            .then(res => setCourseCount((res.data || []).length))
            .catch(() => setCourseCount(0));
    }, []);

    const getExpertLevel = (count) => {
        if (count >= 10) return "Chuyên gia cao cấp (Lvl 5)";
        if (count >= 5) return "Giảng viên uy tín (Lvl 4)";
        if (count >= 2) return "Giảng viên tiềm năng (Lvl 2)";
        return "Người mới (Lvl 1)";
    };

    return (
        <div className="fade-up" style={{ paddingBottom: '3rem', maxWidth: '900px' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>Thiết lập kênh</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Cá nhân hóa trải nghiệm giảng dạy và cấu hình quyền riêng tư</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                
                {/* Profile Card */}
                <div style={{ 
                    background: '#fff', border: '1px solid var(--border)', borderRadius: '24px', 
                    padding: '2rem', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ 
                        position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', 
                        background: 'linear-gradient(135deg, rgba(217,119,6,0.05), transparent)', borderRadius: '0 0 0 100%' 
                    }} />
                    
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                        <MI name="contact_page" style={{ color: SELLER_ORANGE }} /> Hồ sơ Giảng viên
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        {[
                            { label: 'Tên hiển thị', value: user?.ho_va_ten || user?.username || '—', icon: 'person' },
                            { label: 'Tài khoản', value: user?.username || '—', icon: 'alternate_email' },
                            { label: 'Email liên hệ', value: user?.email || '—', icon: 'mail_outline' },
                            { label: 'Hạng Giảng viên', value: getExpertLevel(courseCount), icon: 'workspace_premium' },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                                    <MI name={item.icon} style={{ fontSize: '.8rem' }} /> {item.label}
                                </div>
                                <div style={{ fontSize: '.95rem', fontWeight: 700, color: '#1e293b' }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preferences */}
                <div style={{ 
                    background: '#fff', border: '1px solid var(--border)', borderRadius: '24px', 
                    padding: '2rem', boxShadow: 'var(--shadow-sm)'
                }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                        <MI name="tune" style={{ color: SELLER_ORANGE }} /> Tùy chọn thông báo & Hiển thị
                    </h3>
                    
                    {[
                        { key: 'enrollNotify', icon: 'notifications_active', label: 'Thông báo học viên mới', sub: 'Nhận tin nhắn hệ thống khi có người đăng ký khóa học' },
                        { key: 'reviewEmail', icon: 'mail', label: 'Email phản hồi định kỳ', sub: 'Nhận báo cáo tổng hợp đánh giá hàng tuần' },
                        { key: 'publicProfile', icon: 'visibility', label: 'Hồ sơ người dạy công khai', sub: 'Cho phép học viên tìm kiếm thông tin chuyên gia của bạn' },
                    ].map((item, i) => (
                        <div key={i} style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                            padding: '1.25rem 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' 
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '42px', height: '42px', background: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                                    <MI name={item.icon} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#1e293b' }}>{item.label}</div>
                                    <div style={{ fontSize: '.75rem', color: '#64748b' }}>{item.sub}</div>
                                </div>
                            </div>
                            <Toggle checked={settings[item.key]} onChange={(val) => setSettings({...settings, [item.key]: val})} />
                        </div>
                    ))}
                </div>

                {/* Security Zone */}
                <div style={{ 
                    background: '#fff5f5', border: '1px dashed #feb2b2', borderRadius: '24px', 
                    padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem'
                }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ width: '50px', height: '50px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <MI name="security" style={{ fontSize: '1.8rem' }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '.25rem' }}>Bảo mật tài khoản</div>
                            <div style={{ fontSize: '.8rem', color: '#c53030' }}>Khuyên dùng: Đổi mật khẩu định kỳ để bảo vệ doanh thu của bạn.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerSettings;
