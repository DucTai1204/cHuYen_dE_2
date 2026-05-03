import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MI = ({ name, style, className = '' }) => {
    const isSymbol = [
        'waving_hand', 'celebration', 'workspace_premium', 'verified', 
        'auto_stories', 'trending_up'
    ].includes(name);
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

const EnrolledCard = ({ enrollment }) => {
    const course = enrollment.khoa_hoc || {};
    const pct = Math.round(enrollment.phan_tram_hoan_thanh || 0);
    const TRINH_DO = { CoSo: 'Cơ sở', TrungCap: 'Trung cấp', NangCao: 'Nâng cao' };

    return (
        <Link to={`/courses/${course.id_khoa_hoc}`} style={{ textDecoration: 'none' }}>
            <div style={{
                background: '#fff', border: '1px solid var(--border)', borderRadius: '12px',
                overflow: 'hidden', transition: 'all .2s', cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
            }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                <div style={{ width: '100%', position: 'relative', paddingBottom: '56.25%', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        {course.hinh_anh_thumbnail
                            ? <img 
                                src={course.hinh_anh_thumbnail?.replace('maxresdefault.jpg', 'hqdefault.jpg')} 
                                alt={course.ten_khoa_hoc} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                onError={e => e.target.style.display = 'none'} 
                            />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MI name="menu_book" style={{ fontSize: '2.5rem', color: '#93c5fd' }} />
                              </div>
                        }
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,.1)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#059669' : 'var(--primary)', transition: 'width .8s ease' }} />
                    </div>
                </div>

                <div style={{ padding: '.875rem' }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: '.3rem' }}>{TRINH_DO[course.trinh_do] || ''} · {course.danh_muc || ''}</div>
                    <div style={{ fontWeight: 600, fontSize: '.875rem', marginBottom: '.5rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-primary)', minHeight: '2.5rem' }}>
                        {course.ten_khoa_hoc}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.4rem' }}>
                        <span>Tiến độ</span>
                        <span style={{ color: pct >= 100 ? '#059669' : 'var(--primary)', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#059669' : 'var(--primary)', borderRadius: 'var(--r-full)', transition: 'width .8s ease' }} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [streamingEnrollments, setStreamingEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        api.get('/lms/dang-ky-hoc/')
            .then(res => {
                if (!active) return;
                const data = res.data || [];
                setMyEnrollments(data);
                
                setStreamingEnrollments([]);
                data.forEach((item, index) => {
                    setTimeout(() => {
                        if (!active) return;
                        setStreamingEnrollments(prev => {
                            if (prev.some(e => e.id_dang_ky === item.id_dang_ky)) return prev;
                            return [...prev, item];
                        });
                    }, index * 120);
                });
            })
            .catch(err => console.error(err))
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const totalDone = myEnrollments.filter(e => e.trang_thai_hoc === 'DaXong').length;
    const avgProgress = myEnrollments.length > 0
        ? Math.round(myEnrollments.reduce((s, e) => s + (e.phan_tram_hoan_thanh || 0), 0) / myEnrollments.length)
        : 0;

    return (
        <div className="fade-up">
            <div className="hero-banner">
                <div className="hero-welcome">
                    <h1>
                        Chào mừng trở lại, {user?.ho_va_ten?.split(' ').pop() || user?.username} <MI name="waving_hand" style={{ fontSize: '1.2rem', verticalAlign: 'middle' }} />
                    </h1>
                    <p>
                        {myEnrollments.length > 0
                            ? `Bạn đang học ${myEnrollments.length} khóa học · Tiến độ trung bình ${avgProgress}%`
                            : 'Bắt đầu hành trình chinh phục tri thức ngay hôm nay!'
                        }
                    </p>
                </div>

                <div className="compact-stats">
                    {[
                        { icon: 'menu_book', label: 'Đang học', value: myEnrollments.length },
                        { icon: 'check_circle', label: 'Hoàn thành', value: totalDone },
                        { icon: 'workspace_premium', label: 'Chứng chỉ', value: totalDone }
                    ].map((s, i) => (
                        <div key={i} className="stat-chip">
                            <div className="chip-icon"><MI name={s.icon} /></div>
                            <div className="chip-info">
                                <span className="chip-value">{s.value}</span>
                                <span className="chip-label">{s.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Khóa học của tôi</h2>
                <Link to="/courses/explore" style={{ fontSize: '.85rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                    Xem thêm khóa học <MI name="chevron_right" style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
                </Link>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ height: 240 }} />
                    ))}
                </div>
            ) : myEnrollments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '15px', border: '1px solid var(--border)' }}>
                    <MI name="school" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: 700 }}>Bạn chưa tham gia khóa học nào</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', marginTop: '.5rem' }}>Đăng ký ngay khóa học đầu tiên để bắt đầu lộ trình sự nghiệp.</p>
                    <Link to="/courses/explore" className="btn btn-primary">Khám phá ngay</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {streamingEnrollments.map((e, i) => (
                        <div key={e.id_dang_ky} className="stagger-item" style={{ animationDelay: '0s' }}>
                            <EnrolledCard enrollment={e} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
