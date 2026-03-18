import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

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
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,.2)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#10b981' : '#2563eb', transition: 'width .5s' }} />
                    </div>
                    {pct >= 100 && (
                        <div style={{ position: 'absolute', top: '.5rem', right: '.5rem', background: '#10b981', color: '#fff', padding: '.2rem .5rem', borderRadius: '99px', fontSize: '.68rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '.2rem' }}>
                            <MI name="check_circle" style={{ fontSize: '.9rem' }} /> Hoàn thành
                        </div>
                    )}
                </div>

                <div style={{ padding: '.875rem' }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: '.3rem' }}>{TRINH_DO[course.trinh_do] || ''} · {course.danh_muc || ''}</div>
                    <div style={{ fontWeight: 600, fontSize: '.875rem', marginBottom: '.5rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-primary)' }}>
                        {course.ten_khoa_hoc}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.4rem' }}>
                        <span>Tiến độ</span>
                        <span style={{ color: pct >= 100 ? '#10b981' : '#2563eb', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#10b981' : '#2563eb', borderRadius: '99px', transition: 'width .5s' }} />
                    </div>
                    <div style={{ marginTop: '.75rem', padding: '.4rem .75rem', background: '#2563eb', color: '#fff', borderRadius: '7px', textAlign: 'center', fontSize: '.8rem', fontWeight: 600 }}>
                        {pct >= 100 ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.2rem' }}><MI name="workspace_premium" style={{ fontSize: '.95rem' }} /> Xem chứng chỉ</span> : pct > 0 ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.2rem' }}><MI name="play_circle" style={{ fontSize: '.95rem' }} /> Học tiếp</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.2rem' }}><MI name="play_circle" style={{ fontSize: '.95rem' }} /> Bắt đầu học</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
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
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: '.3rem' }}>{course.danh_muc || 'Khóa học'}</div>
                    <div style={{ fontWeight: 600, fontSize: '.875rem', marginBottom: '.4rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-primary)' }}>
                        {course.ten_khoa_hoc}
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.6rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                        <MI name="person" style={{ fontSize: '1rem' }} /> {course.ten_giang_vien || 'Giảng viên'} · {course.tong_bai || 0} bài
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ fontWeight: 700, color: '#d97706', fontSize: '.9rem' }}>
                            {Number(course.gia_tien) === 0 ? 'Miễn phí' : `${Number(course.gia_tien).toLocaleString('vi-VN')}₫`}
                        </span>
                        {discount > 0 && (
                            <span style={{ fontSize: '.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                                {Number(course.gia_goc).toLocaleString('vi-VN')}₫
                            </span>
                        )}
                    </div>
                    <div style={{ marginTop: '.65rem', padding: '.4rem .75rem', background: '#fef3c7', color: '#92400e', borderRadius: '7px', textAlign: 'center', fontSize: '.8rem', fontWeight: 600, border: '1px solid #fcd34d' }}>
                        Xem chi tiết & Đăng ký →
                    </div>
                </div>
            </div>
        </Link>
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
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('exploring'); // 'learning' | 'exploring'

    useEffect(() => {
        // Lấy khóa học đã đăng ký
        const p1 = api.get('/lms/dang-ky-hoc/')
            .then(res => {
                const data = res.data || [];
                console.log('[Dashboard] Enrollments:', data.length, data);
                setMyEnrollments(data);
            })
            .catch(err => {
                console.error('[Dashboard] Enrollments error:', err?.response?.status, err?.response?.data);
                setMyEnrollments([]);
            });

        // Lấy tất cả khóa học public (cong_khai=True)
        const p2 = api.get('/lms/khoa-hoc/')
            .then(res => {
                const data = res.data || [];
                console.log('[Dashboard] All courses:', data.length, data);
                setAllCourses(data);
            })
            .catch(err => {
                console.error('[Dashboard] Courses error:', err?.response?.status, err?.response?.data);
                setAllCourses([]);
            });

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
            {/* ── WELCOME HEADER ── */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '.25rem' }}>
                    Chào mừng trở lại, {user?.ho_va_ten?.split(' ').pop() || user?.username} <MI name="waving_hand" style={{ fontSize: '1.2rem', verticalAlign: 'middle' }} />
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.875rem' }}>
                    {myEnrollments.length > 0
                        ? `Bạn đang học ${myEnrollments.length} khóa học · Tiến độ trung bình ${avgProgress}%`
                        : 'Khám phá và đăng ký khóa học phù hợp với bạn'
                    }
                </p>
            </div>

            {/* ── STATS ── */}
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                {[
                    { icon: 'menu_book', label: 'Đang học', value: myEnrollments.length, color: '#2563eb', bg: '#eff6ff' },
                    { icon: 'check_circle', label: 'Hoàn thành', value: totalDone, color: '#10b981', bg: '#ecfdf5' },
                    { icon: 'explore', label: 'Khóa học mới', value: exploreCourses.length, color: '#d97706', bg: '#fef3c7' },
                ].map((s, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ width: 44, height: 44, background: s.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MI name={s.icon} style={{ fontSize: '1.4rem', color: s.color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '.2rem' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── SEARCH ── */}
            <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><MI name="search" style={{ fontSize: '1.1rem' }} /></span>
                <input
                    className="search-input"
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm khóa học..."
                    style={{ paddingLeft: '2.4rem' }}
                />
            </div>

            {/* ── TABS ── */}
            <div style={{ display: 'flex', gap: '.25rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '.3rem', marginBottom: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                {[
                    { id: 'learning', label: `Khóa học của tôi (${myEnrollments.length})` },
                    { id: 'exploring', label: `Khám phá (${exploreCourses.length})` },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        flex: 1, padding: '.5rem .75rem', border: 'none', borderRadius: '7px', cursor: 'pointer',
                        background: activeTab === tab.id ? '#eff6ff' : 'transparent',
                        color: activeTab === tab.id ? '#2563eb' : 'var(--text-secondary)',
                        fontWeight: activeTab === tab.id ? 700 : 400, fontSize: '.85rem', transition: 'all .18s',
                    }}>
                        {tab.label}
                    </button>
                ))}
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
        </div>
    );
};

export default Dashboard;
