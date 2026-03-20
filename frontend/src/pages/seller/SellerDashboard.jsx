import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const SELLER_ORANGE = '#d97706';
const SELLER_ORANGE_LIGHT = '#fef3c7';
const SELLER_ORANGE_DARK = '#92400e';

/* ── Status Badge ── */
const StatusBadge = ({ published }) => published
    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.2rem .6rem', borderRadius: '99px', fontSize: '.72rem', fontWeight: 600, background: '#ecfdf5', color: '#059669' }}>● Đang bán</span>
    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.2rem .6rem', borderRadius: '99px', fontSize: '.72rem', fontWeight: 600, background: '#f1f5f9', color: '#64748b' }}>○ Bản nháp</span>;

/* ── Toast ── */
const Toast = ({ msg, type = 'success' }) => (
    <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        background: type === 'error' ? '#ef4444' : '#1e293b',
        color: '#fff', padding: '.75rem 1.25rem',
        borderRadius: '10px', fontSize: '.875rem',
        zIndex: 9999, boxShadow: '0 10px 30px rgba(0,0,0,.2)',
        display: 'flex', alignItems: 'center', gap: '.5rem',
        animation: 'fadeUp .25s ease both',
    }}>
        {type === 'error' ? '❌' : '✅'} {msg}
    </div>
);

/* ── Level Badge ── */
const LevelBadge = ({ level }) => {
    const map = { CoSo: { label: 'Cơ sở', color: '#059669', bg: '#ecfdf5' }, TrungCap: { label: 'Trung cấp', color: '#2563eb', bg: '#eff6ff' }, NangCao: { label: 'Nâng cao', color: '#d97706', bg: '#fef3c7' } };
    const s = map[level] || { label: level, color: '#64748b', bg: '#f1f5f9' };
    return <span style={{ display: 'inline-flex', padding: '.15rem .5rem', borderRadius: '99px', fontSize: '.68rem', fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
};

/* ── Course Card ── */
const CourseCard = ({ course, onPublish, onUnpublish }) => {
    const discount = course.gia_goc > course.gia_tien && course.gia_goc > 0
        ? Math.round((1 - course.gia_tien / course.gia_goc) * 100) : 0;

    return (
        <div style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: '12px',
            overflow: 'hidden', transition: 'all .2s', boxShadow: 'var(--shadow-sm)',
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            {/* Thumbnail */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: `linear-gradient(135deg, ${SELLER_ORANGE_LIGHT}, #fff7ed)`, position: 'relative', overflow: 'hidden' }}>
                {course.hinh_anh_thumbnail
                    ? <img src={course.hinh_anh_thumbnail} alt={course.ten_khoa_hoc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MI name="menu_book" style={{ fontSize: '2.5rem', color: '#d97706' }} /></div>
                }
                {/* Status overlay */}
                <div style={{ position: 'absolute', top: '.5rem', left: '.5rem' }}><StatusBadge published={course.cong_khai} /></div>
                {discount > 0 && (
                    <div style={{ position: 'absolute', top: '.5rem', right: '.5rem', background: '#ef4444', color: '#fff', padding: '.15rem .45rem', borderRadius: '4px', fontSize: '.68rem', fontWeight: 700 }}>
                        -{discount}%
                    </div>
                )}
            </div>

            {/* Body */}
            <div style={{ padding: '1rem' }}>
                <div style={{ marginBottom: '.5rem' }}>
                    <LevelBadge level={course.trinh_do} />
                    {course.danh_muc && <span style={{ marginLeft: '.4rem', fontSize: '.72rem', color: 'var(--text-muted)' }}>{course.danh_muc}</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: '.9rem', lineHeight: 1.4, marginBottom: '.5rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.ten_khoa_hoc}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.75rem' }}>
                    {course.tong_chuong || 0} chương · {course.tong_bai || 0} bài · {course.tong_hoc_vien || 0} học viên
                </div>

                {Number(course.tong_so_danh_gia_ntd) > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '1rem', background: '#ecfdf5', padding: '.5rem', borderRadius: '8px', border: '1px solid #10b981' }}>
                        <MI name="verified" style={{ fontSize: '1.1rem', color: '#059669' }} />
                        <div style={{ fontSize: '.75rem', color: '#065f46', fontWeight: 700 }}>
                            Hài lòng doanh nghiệp: {Number(course.trung_binh_sao_ntd).toFixed(1)}/5
                        </div>
                    </div>
                )}

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
                    <span style={{ fontWeight: 700, color: SELLER_ORANGE, fontSize: '1rem' }}>
                        {Number(course.gia_tien) === 0 ? 'Miễn phí' : `${Number(course.gia_tien).toLocaleString('vi-VN')}₫`}
                    </span>
                    {discount > 0 && (
                        <span style={{ fontSize: '.78rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                            {Number(course.gia_goc).toLocaleString('vi-VN')}₫
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '.5rem' }}>
                    <Link to={`/seller/courses/${course.id_khoa_hoc}/builder`} style={{ flex: 1 }}>
                        <button style={{ width: '100%', padding: '.45rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '7px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 500, color: 'var(--text-primary)', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-app)'}
                        >
                            <MI name="edit" style={{ fontSize: '1rem' }} /> Chỉnh sửa
                        </button>
                    </Link>
                    {course.cong_khai ? (
                        <button
                            onClick={() => onUnpublish(course.id_khoa_hoc)}
                            style={{ padding: '.45rem .75rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '7px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 500, transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}
                        >
                            <MI name="visibility_off" style={{ fontSize: '1rem' }} /> Ẩn
                        </button>
                    ) : (
                        <button
                            onClick={() => onPublish(course.id_khoa_hoc)}
                            style={{ padding: '.45rem .75rem', background: SELLER_ORANGE_LIGHT, color: SELLER_ORANGE_DARK, border: `1px solid #fcd34d`, borderRadius: '7px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}
                        >
                            <MI name="publish" style={{ fontSize: '1rem' }} /> Đăng bán
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   SELLER DASHBOARD
══════════════════════════════════════════════════════════════ */
const SellerDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'draft'
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2800);
    };

    const fetchMyCourses = () => {
        api.get('/lms/khoa-hoc/my-courses/')
            .then(res => setCourses(res.data || []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchMyCourses(); }, []);

    const handlePublish = async (id) => {
        try {
            await api.post(`/lms/khoa-hoc/${id}/publish/`);
            showToast('🚀 Khóa học đã được đăng bán thành công!');
            fetchMyCourses();
        } catch {
            showToast('Lỗi khi đăng bán', 'error');
        }
    };
    const handleUnpublish = async (id) => {
        try {
            await api.post(`/lms/khoa-hoc/${id}/unpublish/`);
            showToast('Đã ẩn khóa học khỏi Marketplace');
            fetchMyCourses();
        } catch {
            showToast('Lỗi khi ẩn khóa học', 'error');
        }
    };

    const published = courses.filter(c => c.cong_khai);
    const drafts = courses.filter(c => !c.cong_khai);
    const totalStudents = courses.reduce((s, c) => s + (c.tong_hoc_vien || 0), 0);
    const revenue = courses.filter(c => c.cong_khai).reduce((s, c) => s + (c.gia_tien || 0) * (c.tong_hoc_vien || 0), 0);

    const filtered = courses.filter(c => {
        const matchFilter = filter === 'all' || (filter === 'published' && c.cong_khai) || (filter === 'draft' && !c.cong_khai);
        const matchSearch = !search || c.ten_khoa_hoc?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="fade-up">
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '.25rem' }}>Kênh người bán</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.875rem' }}>Quản lý và phát triển khóa học của bạn</p>
                </div>
                <Link to="/seller/courses/new">
                    <button style={{ padding: '.65rem 1.4rem', background: SELLER_ORANGE, color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 600, cursor: 'pointer', fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: '.4rem', boxShadow: '0 2px 8px rgba(217,119,6,.3)', transition: 'all .18s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#b45309'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = SELLER_ORANGE; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        ＋ Tạo khóa học mới
                    </button>
                </Link>
            </div>

            {/* ── STATS ── */}
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                {[
                    { icon: 'menu_book', label: 'Tổng khóa học', value: courses.length, sub: `${published.length} đang bán · ${drafts.length} nháp`, color: '#2563eb', bg: '#eff6ff' },
                    { icon: 'groups', label: 'Tổng học viên', value: totalStudents, sub: 'Tổng đăng ký', color: '#059669', bg: '#ecfdf5' },
                    { icon: 'payments', label: 'Ước tính doanh thu', value: revenue >= 1e6 ? `${(revenue / 1e6).toFixed(1)}tr₫` : `${(revenue / 1000).toFixed(0)}k₫`, sub: 'Từ khóa học đang bán', color: SELLER_ORANGE, bg: SELLER_ORANGE_LIGHT },
                ].map((s, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ width: 48, height: 48, background: s.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MI name={s.icon} style={{ fontSize: '1.5rem', color: s.color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '.8rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '.2rem' }}>{s.label}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{s.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── FILTER & SEARCH ── */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '.35rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '9px', padding: '.3rem' }}>
                    {[
                        { val: 'all', label: `Tất cả (${courses.length})` },
                        { val: 'published', label: `Đang bán (${published.length})` },
                        { val: 'draft', label: `Bản nháp (${drafts.length})` },
                    ].map(f => (
                        <button key={f.val} onClick={() => setFilter(f.val)} style={{
                            padding: '.35rem .75rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                            background: filter === f.val ? SELLER_ORANGE_LIGHT : 'transparent',
                            color: filter === f.val ? SELLER_ORANGE_DARK : 'var(--text-secondary)',
                            fontWeight: filter === f.val ? 600 : 400, fontSize: '.8rem', transition: 'all .15s',
                        }}>
                            {f.label}
                        </button>
                    ))}
                </div>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <span style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><MI name="search" style={{ fontSize: '1rem' }} /></span>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm kiếm khóa học..."
                        style={{ width: '100%', padding: '.45rem .75rem .45rem 2.25rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.875rem', outline: 'none', fontFamily: 'inherit', background: '#fff', color: 'var(--text-primary)' }}
                    />
                </div>
            </div>

            {/* ── COURSE GRID ── */}
            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}><MI name="hourglass_empty" style={{ fontSize: '1.2rem' }} /> Đang tải...</div>
            ) : filtered.length === 0 && courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><MI name="inventory_2" style={{ fontSize: '4rem', color: '#cbd5e1' }} /></div>
                    <h3 style={{ fontWeight: 700, marginBottom: '.5rem', fontSize: '1.1rem' }}>Chưa có khóa học nào</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '.9rem' }}>Hãy tạo khóa học đầu tiên và bắt đầu chia sẻ kiến thức!</p>
                    <Link to="/seller/courses/new">
                        <button style={{ padding: '.7rem 1.75rem', background: SELLER_ORANGE, color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 600, cursor: 'pointer', fontSize: '.95rem' }}>
                            ＋ Tạo khóa học ngay
                        </button>
                    </Link>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Không tìm thấy khóa học phù hợp
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {filtered.map(c => (
                        <CourseCard key={c.id_khoa_hoc} course={c} onPublish={handlePublish} onUnpublish={handleUnpublish} />
                    ))}
                </div>
            )}

            {/* Toast Notification */}
            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    );
};

export default SellerDashboard;
