import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MI = ({ name, style, className = '' }) => {
    const isSymbol = ['celebration', 'business', 'work_outline'].includes(name);
    const iconClass = isSymbol ? 'material-symbols-rounded' : 'material-icons';
    
    return (
        <span 
            className={`${iconClass} ${className}`} 
            style={{ 
                fontSize: '1.25rem',
                width: '1em',
                height: '1em',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...style 
            }}
        >
            {name}
        </span>
    );
};

const StudentCareer = () => {
    const [hiredData, setHiredData] = useState([]);
    const [streamingHired, setStreamingHired] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchHired = (active = { current: true }) => {
        setLoading(true);
        api.get('/lms/tuyen-dung/')
            .then(res => {
                if (!active.current) return;
                const data = res.data || [];
                setHiredData(data);
                
                setStreamingHired([]);
                data.forEach((item, index) => {
                    setTimeout(() => {
                        if (!active.current) return;
                        setStreamingHired(prev => {
                            if (prev.some(h => h.id_tuyen_dung === item.id_tuyen_dung)) return prev;
                            return [...prev, item];
                        });
                    }, index * 150);
                });
            })
            .catch(err => console.error(err))
            .finally(() => {
                if (active.current) setLoading(false);
            });
    };

    useEffect(() => {
        const active = { current: true };
        fetchHired(active);
        return () => { active.current = false; };
    }, []);

    const handleUpdateStatus = async (id, status) => {
        const msg = status === 'DaDongY' ? 'chấp nhận lời mời làm việc' : 'từ chối lời mời này';
        if(!window.confirm(`Bạn có chắc muốn ${msg}?`)) return;
        try {
            await api.patch(`/lms/tuyen-dung/${id}/`, { trang_thai: status });
            alert('Cập nhật trạng thái thành công!');
            setStreamingHired([]);
            fetchHired();
        } catch (err) {
            alert('Lỗi cập nhật trạng thái');
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem' }}>
            <div className="skeleton" style={{ height: 100, marginBottom: '2rem' }} />
            <div className="skeleton" style={{ height: 80, marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: 80, marginBottom: '1rem' }} />
        </div>
    );

    return (
        <div className="fade-up">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '.5rem' }}>Cơ hội sự nghiệp</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Theo dõi các lời mời tuyển dụng và kết nối với các doanh nghiệp uy tín.</p>
            </div>

            {hiredData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: '#fff', borderRadius: '15px', border: '1px solid var(--border)' }}>
                    <MI name="work_outline" style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: 700, color: '#64748b' }}>Chưa có lời mời tuyển dụng nào</h3>
                    <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', maxWidth: 400, margin: '0.5rem auto 1.5rem' }}>
                        Hãy tích cực hoàn thành các khóa học và đạt kết quả tốt để tăng khả năng được các doanh nghiệp săn đón!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="stagger-item" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', padding: '1.75rem', borderRadius: '15px', color: '#fff', boxShadow: '0 10px 25px rgba(139, 107, 79, .2)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.6rem', fontWeight: 800 }}>
                            <MI name="celebration" style={{ fontSize: '1.8rem' }} /> Xin chúc mừng!
                        </h2>
                        <p style={{ fontSize: '1rem', opacity: .95 }}>Bạn đang có <strong>{hiredData.length} lời mời tuyển dụng</strong> từ các doanh nghiệp đối tác.</p>
                    </div>

                    {streamingHired.map((h, i) => (
                        <div key={h.id_tuyen_dung} className="stagger-item" style={{ 
                            animationDelay: '0s',
                            background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', 
                            padding: '1.5rem', display: 'flex', justifyContent: 'space-between', 
                            alignItems: 'center', boxShadow: 'var(--shadow-sm)', transition: 'transform .2s'
                        }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: 56, height: 56, background: 'var(--primary-light)', color: 'var(--secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MI name="business" style={{ fontSize: '2rem' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '.25rem' }}>{h.ho_va_ten_ntd || h.ten_nha_tuyen_dung}</div>
                                    <div style={{ fontSize: '.875rem', color: 'var(--text-secondary)' }}>
                                        Dành cho học viên khóa: <strong style={{ color: 'var(--primary-dark)' }}>{h.ten_khoa_hoc}</strong>
                                    </div>
                                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.4rem' }}>
                                        <MI name="event" style={{ fontSize: '.8rem', verticalAlign: 'middle' }} /> Ngày gửi: {new Date(h.ngay_tuyen).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ textAlign: 'right' }}>
                                {h.trang_thai === 'ChoXacNhan' ? (
                                    <div style={{ display: 'flex', gap: '.75rem' }}>
                                        <button onClick={() => handleUpdateStatus(h.id_tuyen_dung, 'TuChoi')} style={{ padding: '.6rem 1.25rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: '9px', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer' }}>Từ chối</button>
                                        <button onClick={() => handleUpdateStatus(h.id_tuyen_dung, 'DaDongY')} style={{ padding: '.6rem 1.25rem', background: '#ecfdf5', color: '#16a34a', border: '1px solid #dcfce7', borderRadius: '9px', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer' }}>Đồng ý kết nối</button>
                                    </div>
                                ) : (
                                    <div style={{ 
                                        background: h.trang_thai === 'DaDongY' ? '#ecfdf5' : '#fef2f2', 
                                        color: h.trang_thai === 'DaDongY' ? '#059669' : '#dc2626', 
                                        padding: '.4rem 1rem', borderRadius: '99px', fontSize: '.8rem', fontWeight: 800,
                                        display: 'inline-flex', alignItems: 'center', gap: '.3rem'
                                    }}>
                                        <MI name={h.trang_thai === 'DaDongY' ? 'check_circle' : 'cancel'} style={{ fontSize: '1rem' }} />
                                        {h.trang_thai === 'DaDongY' ? 'ĐÃ ĐỒNG Ý' : 'ĐÃ TỪ CHỐI'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentCareer;
