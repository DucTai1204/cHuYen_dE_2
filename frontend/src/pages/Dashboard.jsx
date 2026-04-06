import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MI = ({ name, style, className = '' }) => {
    // Các icon mới này chỉ có trong Material Symbols Rounded
    const isSymbol = [
        'waving_hand', 'celebration', 'workspace_premium', 'verified', 
        'auto_stories', 'trending_up', 'work_outline'
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

/* ══════════════════════════════
   ENROLLED COURSE CARD (đang học)
══════════════════════════════ */
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
                {/* Thumbnail */}
                <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', overflow: 'hidden', position: 'relative' }}>
                    {course.hinh_anh_thumbnail
                        ? <img src={course.hinh_anh_thumbnail} alt={course.ten_khoa_hoc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MI name="menu_book" style={{ fontSize: '2.5rem', color: '#93c5fd' }} /></div>
                    }
                    {/* Progress overlay */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,.1)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#059669' : 'var(--primary)', transition: 'width .8s ease' }} />
                    </div>
                    {pct >= 100 && (
                        <div style={{ position: 'absolute', top: '.5rem', right: '.5rem', background: '#059669', color: '#fff', padding: '.3rem .7rem', borderRadius: 'var(--r-full)', fontSize: '.65rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <MI name="check_circle" style={{ fontSize: '.9rem' }} /> Hoàn thành
                        </div>
                    )}
                </div>

                <div style={{ padding: '.875rem' }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: '.3rem' }}>{TRINH_DO[course.trinh_do] || ''} · {course.danh_muc || ''}</div>
                    <div style={{ fontWeight: 600, fontSize: '.875rem', marginBottom: '.5rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-primary)' }}>
                        {course.ten_khoa_hoc}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', marginBottom: '.3rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Tín nhiệm DN</span>
                        <span style={{ fontWeight: 800, color: '#059669' }}>
                            {Number(course.tong_so_danh_gia_ntd) > 0 ? `${course.tong_so_danh_gia_ntd} DN đánh giá` : 'Chưa có'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.4rem' }}>
                        <span>Tiến độ</span>
                        <span style={{ color: pct >= 100 ? '#059669' : 'var(--primary)', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#059669' : 'var(--primary)', borderRadius: 'var(--r-full)', transition: 'width .8s ease' }} />
                    </div>
                    <div className="btn btn-primary btn-full" style={{ marginTop: '.75rem', padding: '.5rem' }}>
                        {pct >= 100 ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="workspace_premium" style={{ fontSize: '1rem' }} /> Xem chứng chỉ</span> : pct > 0 ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="play_circle" style={{ fontSize: '1rem' }} /> Học tiếp</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="play_circle" style={{ fontSize: '1rem' }} /> Bắt đầu học</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
};

/* ══════════════════════════════
   HELPERS & TRUST SCORE
   ══════════════════════════════ */
const calculateTrustScore = (course) => {
    const reviewFactor = (Number(course.trung_binh_sao || 0) / 5) * 10 * 0.3;
    const total = (Number(course.so_nguoi_dang_hoc || 0) + Number(course.so_nguoi_da_hoan_thanh || 0)) || 1;
    const completionRate = (Number(course.so_nguoi_da_hoan_thanh || 0) / total);
    const completionFactor = completionRate * 10 * 0.25;
    const passRate = course.ty_le_dau || 0; 
    const passFactor = passRate * 10 * 0.20;
    const hiringRate = Number(course.so_nguoi_da_hoan_thanh) > 0 
        ? Math.min(Number(course.so_nguoi_co_viec_lam) / Number(course.so_nguoi_da_hoan_thanh), 1)
        : 0;
    const hiringFactor = hiringRate * 10 * 0.25;
    
    const score = reviewFactor + completionFactor + passFactor + hiringFactor;
    return (score || 0).toFixed(1);
};

/* ══════════════════════════════
   EXPLORE COURSE CARD (chưa đăng ký)
══════════════════════════════ */
const ExploreCard = ({ course }) => {
    const discount = course.gia_goc > course.gia_tien && course.gia_goc > 0
        ? Math.round((1 - course.gia_tien / course.gia_goc) * 100) : 0;

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
                {/* Thumbnail */}
                <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', overflow: 'hidden', position: 'relative' }}>
                    {course.hinh_anh_thumbnail
                        ? <img src={course.hinh_anh_thumbnail} alt={course.ten_khoa_hoc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MI name="auto_stories" style={{ fontSize: '2.5rem', color: '#fcd34d' }} /></div>
                    }
                    {discount > 0 && (
                        <div style={{ position: 'absolute', top: '.5rem', right: '.5rem', background: '#ef4444', color: '#fff', padding: '.2rem .45rem', borderRadius: '4px', fontSize: '.68rem', fontWeight: 700 }}>
                            -{discount}%
                        </div>
                    )}
                </div>

                <div style={{ padding: '.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.4rem' }}>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{course.danh_muc || 'CHUYÊN NGÀNH'}</div>
                        {Number(course.tong_so_danh_gia_ntd) > 0 && (
                            <div style={{ background: '#ecfdf5', color: '#059669', padding: '.15rem .45rem', borderRadius: '4px', fontSize: '.62rem', fontWeight: 800, border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '.1rem' }}>
                                <MI name="verified" style={{ fontSize: '.8rem' }} /> VERIFIED
                            </div>
                        )}
                    </div>
                    
                    <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.5rem', lineHeight: 1.3, height: '2.6rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-primary)' }}>
                        {course.ten_khoa_hoc}
                    </div>

                    {/* Trust Score Widget */}
                    <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--r-md)', padding: '.75rem 1rem', marginBottom: '.75rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '.05em' }}>Trust Score</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--secondary)', lineHeight: 1, fontFamily: 'Poppins, sans-serif' }}>
                                {calculateTrustScore(course)}<span style={{ fontSize: '.85rem', opacity: .5 }}>/10</span>
                            </div>
                            <div style={{ fontSize: '.65rem', color: '#059669', fontWeight: 700, marginTop: '.2rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {(course.employer_endorsements || []).slice(0, 3).map((emp, idx) => (
                                        <div key={idx} style={{ 
                                            width: 18, height: 18, borderRadius: '50%', background: '#fff', 
                                            border: '2px solid #fff', marginLeft: idx > 0 ? -6 : 0, overflow: 'hidden',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 3 - idx
                                        }}>
                                            {emp.hinh_anh_logo ? (
                                                <img src={emp.hinh_anh_logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ background: 'var(--primary)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px' }}>
                                                    {emp.ten_nha_tuyen_dung?.[0]}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <span>{Number(course.tong_so_danh_gia_ntd) > 0 ? `${course.tong_so_danh_gia_ntd} DN đánh giá` : 'Đang cập nhật'}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '.3rem', justifyContent: 'flex-end' }}>
                                <MI name="trending_up" style={{ fontSize: '1.1rem' }} /> {Math.round((Number(course.so_nguoi_co_viec_lam) / (Number(course.so_nguoi_da_hoan_thanh) || 1)) * 100)}%
                            </div>
                            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tỉ lệ việc làm</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.2rem', color: '#f59e0b', fontSize: '.78rem', fontWeight: 700 }}>
                            <MI name="star" style={{ fontSize: '.9rem' }} /> {Number(course.trung_binh_sao || 0).toFixed(1)}
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '.3rem', fontWeight: 600 }}>
                            <MI name="work" style={{ fontSize: '.9rem', color: '#1e3a8a' }} /> {course.so_nguoi_co_viec_lam || 0} đã tuyển
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '.875rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '1.2rem', fontFamily: 'Poppins, sans-serif' }}>
                            {Number(course.gia_tien) === 0 ? 'MIỄN PHÍ' : `${Number(course.gia_tien).toLocaleString('vi-VN')}₫`}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', color: 'var(--primary)', fontSize: '.850rem', fontWeight: 700 }}>
                             Chi tiết <MI name="chevron_right" style={{ fontSize: '1.1rem' }} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

/* ══════════════════════════════
   CAREER LIST (Danh sách được tuyển)
   ══════════════════════════════ */
const CareerList = ({ data, loading, onRefresh }) => {
    const handleUpdateStatus = async (id, status) => {
        const msg = status === 'DaDongY' ? 'chấp nhận lời mời làm việc' : 'từ chối lời mời này';
        if(!window.confirm(`Bạn có chắc muốn ${msg}?`)) return;
        try {
            await api.patch(`/lms/tuyen-dung/${id}/`, { trang_thai: status });
            alert('Cập nhật trạng thái thành công!');
            onRefresh();
        } catch (err) {
            alert('Lỗi cập nhật trạng thái');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Đang kiểm tra thông tin tuyển dụng...</div>;
    
    if (data.length === 0) return (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '15px', border: '1px solid var(--border)' }}>
            <MI name="work_outline" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Chưa có lời mời tuyển dụng chính thức</h3>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)' }}>Hãy hoàn thành thêm nhiều khóa học để được các doanh nghiệp chú ý nhé!</p>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', padding: '1.5rem', borderRadius: '15px', color: '#fff', marginBottom: '.5rem', boxShadow: '0 10px 20px rgba(30,58,138,.2)' }}>
                <h3 style={{ marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800 }}><MI name="celebration" /> Chào mừng bạn!</h3>
                <p style={{ fontSize: '.95rem', opacity: .9 }}>Bạn nhận được <strong>{data.length} lời mời tuyển dụng</strong> dựa trên kết quả học tập xuất sắc của mình.</p>
            </div>
            {data.map(h => (
                <div key={h.id_tuyen_dung} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ width: 48, height: 48, background: '#eff6ff', color: '#1e3a8a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MI name="business" style={{ fontSize: '1.8rem' }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{h.ten_nha_tuyen_dung}</div>
                            <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>
                                Đã gửi lời mời dựa trên: <strong style={{ color: '#2563eb' }}>{h.ten_khoa_hoc}</strong>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {h.trang_thai === 'ChoXacNhan' ? (
                            <div style={{ display: 'flex', gap: '.5rem' }}>
                                <button onClick={() => handleUpdateStatus(h.id_tuyen_dung, 'TuChoi')} style={{ padding: '.5rem .8rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>Từ chối</button>
                                <button onClick={() => handleUpdateStatus(h.id_tuyen_dung, 'DaDongY')} style={{ padding: '.5rem .8rem', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '8px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>Chấp nhận</button>
                            </div>
                        ) : (
                            <div style={{ background: h.trang_thai === 'DaDongY' ? '#ecfdf5' : '#fef2f2', color: h.trang_thai === 'DaDongY' ? '#059669' : '#b91c1c', padding: '.25rem .75rem', borderRadius: '99px', fontSize: '.75rem', fontWeight: 800, border: '1px solid transparent' }}>
                                {h.trang_thai === 'DaDongY' ? 'ĐÃ ĐỒNG Ý' : 'ĐÃ TỪ CHỐI'}
                            </div>
                        )}
                        <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.5rem' }}>{new Date(h.ngay_tuyen).toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ══════════════════════════════
   MAIN DASHBOARD
══════════════════════════════ */
const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [myEnrollments, setMyEnrollments] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [hiredData, setHiredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hiringLoading, setHiringLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('exploring'); // 'learning' | 'exploring' | 'career'

    const fetchHired = () => {
        setHiringLoading(true);
        api.get('/lms/tuyen-dung/')
            .then(res => setHiredData(res.data || []))
            .catch(err => console.error(err))
            .finally(() => setHiringLoading(false));
    };

    useEffect(() => {
        // Lấy khóa học đã đăng ký
        const p1 = api.get('/lms/dang-ky-hoc/')
            .then(res => {
                const data = res.data || [];
                setMyEnrollments(data);
            })
            .catch(err => {
                console.error('[Dashboard] Enrollments error:', err);
                setMyEnrollments([]);
            });

        // Lấy tất cả khóa học public
        const p2 = api.get('/lms/khoa-hoc/')
            .then(res => {
                const data = res.data || [];
                setAllCourses(data);
            })
            .catch(err => {
                console.error('[Dashboard] Courses error:', err);
                setAllCourses([]);
            });

        // Lấy dữ liệu tuyển dụng
        fetchHired();

        Promise.all([p1, p2]).finally(() => setLoading(false));
    }, []);


    // Khóa học chưa đăng ký
    const enrolledCourseIds = new Set(myEnrollments.map(e => {
        const khoa_hoc = e.khoa_hoc || e.id_khoa_hoc;
        return typeof khoa_hoc === 'object' ? khoa_hoc?.id_khoa_hoc : khoa_hoc;
    }));

    const exploreCourses = allCourses.filter(c => !enrolledCourseIds.has(c.id_khoa_hoc));

    // Search filter
    const filteredEnrollments = myEnrollments.filter(e => {
        const name = (e.khoa_hoc?.ten_khoa_hoc || '').toLowerCase();
        return !search || name.includes(search.toLowerCase());
    });
    const filteredExplore = exploreCourses.filter(c =>
        !search || c.ten_khoa_hoc?.toLowerCase().includes(search.toLowerCase())
    );

    const totalDone = myEnrollments.filter(e => e.trang_thai_hoc === 'DaXong').length;
    const avgProgress = myEnrollments.length > 0
        ? Math.round(myEnrollments.reduce((s, e) => s + (e.phan_tram_hoan_thanh || 0), 0) / myEnrollments.length)
        : 0;

    return (
        <div className="fade-up">
            {/* ── HERO BANNER (DASHBOARD) ── */}
            <div className="hero-banner">
                <div className="hero-welcome">
                    <h1>
                        Chào mừng trở lại, {user?.ho_va_ten?.split(' ').pop() || user?.username} <MI name="waving_hand" style={{ fontSize: '1.2rem', verticalAlign: 'middle' }} />
                    </h1>
                    <p>
                        {myEnrollments.length > 0
                            ? `Bạn đang học ${myEnrollments.length} khóa học · Tiến độ trung bình ${avgProgress}%`
                            : 'Khám phá và đăng ký khóa học phù hợp với bạn'
                        }
                    </p>
                </div>

                <div className="compact-stats">
                    {[
                        { icon: 'menu_book', label: 'Đang học', value: myEnrollments.length },
                        { icon: 'check_circle', label: 'Hoàn thành', value: totalDone },
                        { icon: 'trending_up', label: 'Tín nhiệm', value: user?.trust_score || '—' },
                    ].map((s, i) => (
                        <div key={i} className="stat-chip">
                            <div className="chip-icon">
                                <MI name={s.icon} />
                            </div>
                            <div className="chip-info">
                                <span className="chip-value">{s.value}</span>
                                <span className="chip-label">{s.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── INTEGRATED NAV BAR (TABS + SEARCH) ── */}
            <div className="nav-integrated-bar">
                <div className="tabs-minimal">
                    {[
                        { id: 'learning', label: `Đang học (${myEnrollments.length})` },
                        { id: 'exploring', label: `Khám phá (${exploreCourses.length})` },
                        { id: 'career', label: `Tuyển dụng (${hiredData.length})` },
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)} 
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="search-compact">
                    <span className="search-icon"><MI name="search" /></span>
                    <input
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm kiếm khóa học..."
                    />
                </div>
            </div>

            {/* ── TAB: KHÓA HỌC CỦA TÔI ── */}
            {activeTab === 'learning' && (
                loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                        {[1, 2, 3].map(i => <div key={i} style={{ height: 240, background: '#f1f5f9', borderRadius: '12px' }} />)}
                    </div>
                ) : filteredEnrollments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MI name="school" style={{ fontSize: '3.5rem', color: '#cbd5e1' }} />
                        </div>
                        <h3 style={{ fontWeight: 700, marginBottom: '.5rem' }}>
                            {search ? `Không tìm thấy khóa học "${search}"` : 'Bạn chưa đăng ký khóa học nào'}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '.9rem' }}>
                            Khám phá các khóa học chất lượng và bắt đầu hành trình học tập!
                        </p>
                        <button onClick={() => setActiveTab('exploring')} style={{ padding: '.65rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 600, cursor: 'pointer', fontSize: '.9rem', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                            <MI name="explore" style={{ fontSize: '1.1rem' }} /> Khám phá khóa học ngay
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        {filteredEnrollments.map(e => <EnrolledCard key={e.id_dang_ky} enrollment={e} />)}
                    </div>
                )
            )}

            {/* ── TAB: KHÁM PHÁ ── */}
            {activeTab === 'exploring' && (
                loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                        {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 260, background: '#f1f5f9', borderRadius: '12px' }} />)}
                    </div>
                ) : filteredExplore.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MI name="celebration" style={{ fontSize: '3rem', color: '#cbd5e1' }} />
                        </div>
                        <h3 style={{ fontWeight: 700, marginBottom: '.5rem' }}>
                            {search ? `Không tìm thấy kết quả cho "${search}"` : 'Bạn đã đăng ký hết tất cả khóa học!'}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Chờ thêm khóa học mới sớm ra mắt nhé.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        {filteredExplore.map(c => <ExploreCard key={c.id_khoa_hoc} course={c} />)}
                    </div>
                )
            )}

            {/* ── TAB: TUYỂN DỤNG ── */}
            {activeTab === 'career' && (
                <CareerList data={hiredData} loading={hiringLoading} onRefresh={fetchHired} />
            )}
        </div>
    );
};

export default Dashboard;
