import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const calculateTrustScore = (course) => {
    if (!course) return "0.0";
    const reviewFactor = (Number(course.trung_binh_sao || 0) / 5) * 10 * 0.3;
    const total = (Number(course.so_nguoi_dang_hoc || 0) + Number(course.so_nguoi_da_hoan_thanh || 0)) || 1;
    const completionRate = (Number(course.so_nguoi_da_hoan_thanh || 0) / total);
    const completionFactor = completionRate * 10 * 0.25;
    const passRate = 0.85; 
    const passFactor = passRate * 10 * 0.20;
    const hiringRate = Number(course.so_nguoi_da_hoan_thanh) > 0 
        ? Math.min(Number(course.so_nguoi_co_viec_lam) / Number(course.so_nguoi_da_hoan_thanh), 1)
        : 0;
    const hiringFactor = hiringRate * 10 * 0.25;
    
    const score = reviewFactor + completionFactor + passFactor + hiringFactor;
    return Math.max(score, 5.0).toFixed(1);
};

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const TRINH_DO = { CoSo: 'Cơ sở', TrungCap: 'Trung cấp', NangCao: 'Nâng cao' };
const typeIcon = (t) => ({ Video: 'play_circle', Quiz: 'quiz', TaiLieu: 'description', VanBan: 'article' }[t] || 'play_circle');

/* ── Stars Rating ── */
const Stars = ({ n = 5 }) => (
    <span style={{ color: '#f59e0b', letterSpacing: '-.05em' }}>
        {'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}
    </span>
);

/* ── Chapter Accordion ── */
const ChapterAccordion = ({ chapter, defaultOpen = false, isEnrolled, courseId, completedIds = new Set(), isSequential = false, flatLessons = [], isRecruiter = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    const lessons = chapter.bai_giang || [];
    const totalMin = lessons.reduce((s, l) => s + (l.thoi_luong_phut || 0), 0);

    return (
        <div style={{ border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '.5rem', overflow: 'hidden' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.85rem 1rem', background: open ? '#f8fafc' : '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '.875rem', color: 'var(--text-primary)' }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <MI name={open ? 'expand_more' : 'chevron_right'} style={{ fontSize: '1.2rem' }} />
                    <MI name="folder" style={{ fontSize: '1rem', color: '#d97706' }} /> {chapter.ten_chuong}
                </span>
                <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '1rem' }}>
                    {lessons.length} bài · {totalMin > 0 ? `${totalMin}p` : ''}
                </span>
            </button>

            {open && (
                <div>
                    {lessons.map((l, i) => {
                        const accessible = isEnrolled || l.la_xem_truoc || isRecruiter;
                        const done = completedIds.has(l.id_bai_giang);
                        // Kiểm tra khóa tuần tự
                        const idx = flatLessons.findIndex(fl => fl.id_bai_giang === l.id_bai_giang);
                        const locked = isSequential && isEnrolled && idx > 0 && !completedIds.has(flatLessons[idx - 1]?.id_bai_giang);
                        return (
                            <div
                                key={l.id_bai_giang || i}
                                onClick={() => {
                                    if (!accessible || locked) return;
                                    window.location.href = `/courses/${courseId}/learn?lesson=${l.id_bai_giang}`;
                                }}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 1rem .6rem 2rem', borderTop: '1px solid var(--border)', fontSize: '.82rem', background: '#fafafa', cursor: accessible && !locked ? 'pointer' : 'default', transition: 'background .15s' }}
                                onMouseEnter={e => { if (accessible && !locked) e.currentTarget.style.background = '#f0f9ff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; }}
                            >
                                <span style={{ display: 'flex', gap: '.5rem', alignItems: 'center', color: locked ? 'var(--text-muted)' : accessible ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                    <span style={{ color: done ? '#10b981' : locked ? 'var(--text-muted)' : accessible ? '#2563eb' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                        {done ? <MI name="check_circle" style={{ color: '#10b981', fontSize: '1rem' }} /> : locked ? <MI name="lock" style={{ fontSize: '1rem' }} /> : accessible ? <MI name={typeIcon(l.loai_bai)} style={{ fontSize: '1rem' }} /> : <MI name="lock" style={{ fontSize: '1rem' }} />}
                                    </span>
                                    <span>{l.ten_bai_giang}</span>
                                    {l.la_xem_truoc && !isEnrolled && (
                                        <span style={{ background: '#ecfdf5', color: '#059669', padding: '.1rem .35rem', borderRadius: '99px', fontSize: '.65rem', fontWeight: 700 }}>Xem trước</span>
                                    )}
                                </span>
                                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                                    {l.thoi_luong_phut > 0 ? `${l.thoi_luong_phut}p` : ''}
                                </span>
                            </div>
                        );
                    })}
                    {lessons.length === 0 && (
                        <div style={{ padding: '.75rem 1rem 1rem 2rem', fontSize: '.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có bài giảng</div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   MAIN: COURSE DETAIL PAGE
══════════════════════════════════════════════════════════════ */
const CourseDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [enrollment, setEnrollment] = useState(null); // null = chưa đăng ký
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [toast, setToast] = useState(null);
    const [completedIds, setCompletedIds] = useState(new Set());
    const [reviews, setReviews] = useState([]);
    const [ntdReviews, setNtdReviews] = useState([]);
    const [hiringCompanies, setHiringCompanies] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [myReview, setMyReview] = useState({ so_sao: 5, nhan_xet: '' });
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    /* ── Helper: trích xuất embed URL từ nhiều định dạng YouTube ── */
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        // Đã là embed URL
        if (url.includes('/embed/')) return url.split('?')[0] + '?autoplay=1&rel=0';
        // Dạng youtube.com/watch?v=xxx
        const watchMatch = url.match(/[?&]v=([^&#]+)/);
        if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
        // Dạng youtu.be/xxx
        const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
        if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
        return null;
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2800);
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Lấy thông tin khóa học + chapters
                const [cRes, chRes] = await Promise.all([
                    api.get(`/lms/khoa-hoc/${id}/`),
                    api.get(`/lms/chuong/?khoa_hoc=${id}`),
                ]);
                setCourse(cRes.data);
                setChapters(chRes.data || []);

                // Kiểm tra đã đăng ký chưa
                const eRes = await api.get('/lms/dang-ky-hoc/');
                const myEnroll = (eRes.data || []).find(e => {
                    const eid = e.khoa_hoc?.id_khoa_hoc ?? e.id_khoa_hoc;
                    return String(eid) === String(id);
                });
                setEnrollment(myEnroll || null);

                // Lấy tiến độ bài đã hoàn thành
                if (myEnroll) {
                    try {
                        const tdRes = await api.get(`/lms/tien-do-bai/?khoa_hoc=${id}`);
                        setCompletedIds(new Set(tdRes.data?.completed_lesson_ids || []));
                    } catch (_) {/* bỏ qua nếu lỗi */ }
                }

                // Lấy danh sách đánh giá học viên
                const rRes = await api.get(`/lms/danh-gia/?khoa_hoc=${id}`);
                setReviews(rRes.data || []);

                // Lấy danh sách đánh giá nhà tuyển dụng
                const ntdRes = await api.get(`/lms/danh-gia-ntd/?khoa_hoc=${id}`);
                setNtdReviews(ntdRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                const resHires = await api.get(`/lms/tuyen-dung/`, { params: { khoa_hoc: id } });
            // Lấy danh sách tên công ty duy nhất
            const uniqueNames = [...new Set(resHires.data.map(h => h.ten_nha_tuyen_dung))];
            setHiringCompanies(uniqueNames);
            
            setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    const handleEnroll = async () => {
        if (!user) { navigate('/login'); return; }
        setEnrolling(true);
        try {
            const res = await api.post('/lms/dang-ky-hoc/', {
                id_khoa_hoc: id,
            });
            setEnrollment(res.data);
            showToast('Đăng ký thành công! Chúc bạn học tốt!');
            // Reload course stats
            const cRes = await api.get(`/lms/khoa-hoc/${id}/`);
            setCourse(cRes.data);
        } catch (err) {
            const msg = err?.response?.data?.detail || err?.response?.data?.non_field_errors?.[0] || 'Đăng ký thất bại';
            showToast(msg, 'error');
        } finally {
            setEnrolling(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) return;
        setReviewLoading(true);
        try {
            await api.post('/lms/danh-gia/', {
                id_khoa_hoc: id,
                so_sao: myReview.so_sao,
                nhan_xet: myReview.nhan_xet
            });
            showToast('Cảm ơn bạn đã đánh giá khóa học!');
            // Refresh data
            const [cRes, rRes] = await Promise.all([
                api.get(`/lms/khoa-hoc/${id}/`),
                api.get(`/lms/danh-gia/?khoa_hoc=${id}`)
            ]);
            setCourse(cRes.data);
            setReviews(rRes.data || []);
            setMyReview({ so_sao: 5, nhan_xet: '' });
        } catch (err) {
            const msg = err?.response?.data?.detail || 'Gửi đánh giá thất bại';
            showToast(msg, 'error');
        } finally {
            setReviewLoading(false);
        }
    };

    /* ── Tính tổng ── */
    const totalLessons = chapters.reduce((s, c) => s + (c.bai_giang?.length || 0), 0);
    const totalMinutes = chapters.reduce((s, c) => s + (c.bai_giang || []).reduce((ss, l) => ss + (l.thoi_luong_phut || 0), 0), 0);
    const freeLessons = chapters.reduce((s, c) => s + (c.bai_giang || []).filter(l => l.la_xem_truoc).length, 0);
    const discount = course?.gia_goc > course?.gia_tien && course?.gia_goc > 0
        ? Math.round((1 - course.gia_tien / course.gia_goc) * 100) : 0;
    const pct = Math.round(enrollment?.phan_tram_hoan_thanh || 0);
    const flatLessons = chapters.flatMap(ch => ch.bai_giang || []);
    const isRecruiter = user?.vai_tro === 'NhaTuyenDung';

    /* ── Loading ── */
    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 3rem)', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #eff6ff', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '.875rem' }}>Đang tải khóa học...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!course) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <MI name="search_off" style={{ fontSize: '3rem', color: '#cbd5e1' }} />
            <div style={{ fontWeight: 600, marginBottom: '.5rem' }}>Không tìm thấy khóa học</div>
            <Link to="/dashboard"><button style={{ padding: '.55rem 1.2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '.75rem' }}>← Quay lại</button></Link>
        </div>
    );

    return (
        <>
            <div className="fade-up">
                {/* ── BREADCRUMB ── */}
                <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>Trang chủ</Link> ›
                    <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>Khóa học</Link> ›
                    <span style={{ color: 'var(--text-primary)' }}>{course.ten_khoa_hoc}</span>
                </div>

            {/* ── BADGES ── */}
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-green"><MI name="verified" style={{ fontSize: '.9rem', verticalAlign: 'middle' }} /> Được kiểm định</span>
                <span className="badge badge-orange"><MI name="workspace_premium" style={{ fontSize: '.9rem', verticalAlign: 'middle' }} /> Cấp chứng chỉ số</span>
                <span className="badge badge-blue"><MI name="security" style={{ fontSize: '.9rem', verticalAlign: 'middle' }} /> Giám sát AI</span>
                {course.danh_muc && <span className="badge badge-gray">{course.danh_muc}</span>}
                <span style={{ padding: '.2rem .6rem', borderRadius: '99px', fontSize: '.72rem', fontWeight: 600, background: '#f1f5f9', color: '#64748b' }}>{TRINH_DO[course.trinh_do] || course.trinh_do}</span>
                {Number(course.tong_so_danh_gia_ntd) > 0 && (
                    <span className="badge badge-emerald"><MI name="business_center" style={{ fontSize: '.9rem', verticalAlign: 'middle' }} /> Employer Verified</span>
                )}
            </div>

            {/* ── TITLE ── */}
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '.5rem', lineHeight: 1.35 }}>{course.ten_khoa_hoc}</h1>
            {course.mo_ta_ngan && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: '.75rem' }}>{course.mo_ta_ngan}</p>
            )}

            {/* ── META ── */}
            {/* TRUST SCORE PREMIUM WIDGET */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

                <div style={{ background: '#fff', borderRadius: '15px', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div style={{ width: 40, height: 40, background: '#ecfdf5', color: '#059669', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MI name="verified_user" style={{ fontSize: '1.5rem' }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, color: '#059669', fontSize: '.9rem' }}>Chuyên gia chứng thực</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Cấp bởi nhà tuyển dụng uy tín</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div style={{ width: 40, height: 40, background: '#eff6ff', color: '#1e3a8a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MI name="work" style={{ fontSize: '1.5rem' }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '.9rem' }}>{course.so_nguoi_co_viec_lam} Học viên đã tuyển</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Mạng lưới đối tác rộng khắp</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Meta Row */}
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '.75rem 1rem', borderRadius: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                    <Stars n={course.trung_binh_sao || 0} /> <strong>{Number(course.trung_binh_sao || 0).toFixed(1)}</strong> <span style={{ color: 'var(--text-muted)' }}>({course.tong_so_danh_gia || 0} đánh giá)</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                    <MI name="groups" style={{ fontSize: '1rem' }} /> {course.so_nguoi_dang_hoc || 0} học viên đang học
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                    <MI name="person" style={{ fontSize: '1rem' }} /> GV: {course.ten_giang_vien}
                </span>
            </div>

            {/* RECRUITING PARTNERS LIST */}
            {hiringCompanies.length > 0 && (
                <div style={{ marginBottom: '2.5rem', background: '#ecfdf5', padding: '1.5rem', borderRadius: '15px', border: '1px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#059669', marginBottom: '1rem', fontWeight: 800 }}>
                        <MI name="business" /> 
                         Đã có {hiringCompanies.length} đối tác tuyển dụng từ khóa học này:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {hiringCompanies.map((name, idx) => (
                            <div key={idx} style={{ background: '#fff', padding: '.6rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #d1fae5', color: 'var(--text-primary)', fontWeight: 700, fontSize: '.9rem' }}>
                                <MI name="check_circle" style={{ color: '#059669', fontSize: '1rem' }} /> {name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── 2-COLUMN LAYOUT ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

                {/* ── LEFT COLUMN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>

                    {/* Video Preview */}
                    <div style={{ background: '#0f172a', borderRadius: '14px', aspectRatio: '16/9', overflow: 'hidden', position: 'relative', cursor: course.url_video_preview && !isPlayingPreview ? 'pointer' : 'default' }}
                        onClick={() => { if (course.url_video_preview && !isPlayingPreview) setIsPlayingPreview(true); }}
                    >
                        {/* Đang play → hiện iframe */}
                        {isPlayingPreview && course.url_video_preview ? (
                            <iframe
                                src={getYouTubeEmbedUrl(course.url_video_preview)}
                                title="Video giới thiệu khóa học"
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <>
                                {/* Thumbnail nền */}
                                {course.hinh_anh_thumbnail && (
                                    <img
                                        src={course.hinh_anh_thumbnail?.replace('maxresdefault.jpg', 'hqdefault.jpg')}
                                        alt="thumbnail"
                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: course.url_video_preview ? .6 : 1 }}
                                        onError={e => e.target.style.display = 'none'}
                                    />
                                )}
                                {/* Overlay nút play — CHỈ hiện khi có video preview */}
                                {course.url_video_preview && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.6rem', background: 'rgba(0,0,0,.15)' }}>
                                        <div style={{
                                            width: 72, height: 72,
                                            background: 'rgba(220,38,38,0.92)',
                                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.8rem', color: '#fff',
                                            boxShadow: '0 6px 24px rgba(220,38,38,.55)',
                                            transition: 'transform .18s, box-shadow .18s',
                                        }}>
                                            ▶
                                        </div>
                                        <span style={{ fontSize: '.9rem', fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.7)' }}>
                                            Xem video giới thiệu
                                        </span>
                                        <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.8)', textShadow: '0 1px 3px rgba(0,0,0,.6)' }}>
                                            Nhấn để xem ngay
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>


                    {/* If enrolled: show progress */}
                    {enrollment && (
                        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '.3rem' }}><MI name="bar_chart" style={{ fontSize: '1rem' }} /> Tiến độ học tập của bạn</span>
                                <span style={{ fontSize: '.9rem', fontWeight: 700, color: '#2563eb' }}>{pct}%</span>
                            </div>
                            <div style={{ height: 8, background: 'rgba(255,255,255,.6)', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: '#2563eb', borderRadius: '99px', transition: 'width .5s' }} />
                            </div>
                            <div style={{ fontSize: '.78rem', color: '#3b82f6', marginTop: '.4rem' }}>
                                {pct >= 100 ? <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}><MI name="celebration" style={{ fontSize: '1rem' }} /> Bạn đã hoàn thành khóa học!</span> : pct > 0 ? `Tiếp tục để hoàn thành ${100 - pct}% còn lại` : 'Bạn chưa bắt đầu — hãy học bài đầu tiên!'}
                            </div>
                        </div>
                    )}

                    {/* What you'll learn */}
                    {course.mo_ta_chi_tiet && (
                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}><MI name="menu_book" style={{ fontSize: '1.1rem', color: 'var(--primary)' }} /> Mô tả khóa học</h3>
                            <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{course.mo_ta_chi_tiet}</p>
                        </div>
                    )}

                    {/* What you'll learn - static bullets */}
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}><MI name="check_circle" style={{ fontSize: '1.1rem', color: '#10b981' }} /> Bạn sẽ học được gì?</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
                            {[
                                'Nắm vững kiến thức lý thuyết và thực hành',
                                'Hoàn thành dự án thực tế từ đầu đến cuối',
                                'Nhận chứng chỉ số có mã UUID định danh',
                                'Truy cập tài liệu trọn đời sau khi đăng ký',
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
                                    <span style={{ color: '#10b981', flexShrink: 0, marginTop: '.1rem' }}>✓</span>
                                    <span style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Curriculum */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '.3rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}><MI name="list_alt" style={{ fontSize: '1.1rem', color: 'var(--primary)' }} /> Nội dung khóa học</h3>
                                <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                                    {chapters.length} chương &nbsp;·&nbsp; {totalLessons} bài giảng &nbsp;·&nbsp;
                                    {Math.floor(totalMinutes / 60) > 0 ? `${Math.floor(totalMinutes / 60)}h ` : ''}{totalMinutes % 60 > 0 ? `${totalMinutes % 60}p` : ''}
                                    {freeLessons > 0 && ` · ${freeLessons} bài xem trước`}
                                </p>
                            </div>
                        </div>

                        {chapters.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '.875rem' }}>
                                Nội dung khóa học đang được cập nhật...
                            </div>
                        ) : (
                            chapters.map((ch, i) => (
                                <ChapterAccordion
                                    key={ch.id_chuong} chapter={ch}
                                    defaultOpen={i === 0}
                                    isEnrolled={!!enrollment}
                                    courseId={course.id_khoa_hoc}
                                    completedIds={completedIds}
                                    isSequential={course?.is_sequential}
                                    flatLessons={flatLessons}
                                    isRecruiter={isRecruiter}
                                />
                            ))
                        )}
                    </div>

                    {/* Instructor */}
                    {course.ten_giang_vien && (
                        <div className="card">
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}><MI name="person" style={{ fontSize: '1.2rem', color: '#2563eb' }} /> Về người bán khóa học</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: 56, height: 56, background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                                    {course.ten_giang_vien.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.2rem' }}>{course.ten_giang_vien}</div>
                                    <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                        <MI name="layers" style={{ fontSize: '1rem' }} /> {course.tong_chuong || 0} chương
                                        <MI name="play_circle" style={{ fontSize: '1rem' }} /> {course.tong_bai || 0} bài giảng
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REVIEWS SECTION */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                <MI name="star" style={{ fontSize: '1.2rem', color: '#f59e0b' }} /> Phản hồi từ người học
                            </h3>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                {Number(course.trung_binh_sao || 0).toFixed(1)} <span style={{ color: '#f59e0b' }}>★</span>
                            </div>
                        </div>

                        {/* Submit review */}
                        {enrollment && !reviews.find(r => r.id_nguoi_dung === user?.id_nguoi_dung) && (
                            enrollment.trang_thai_hoc === 'DaXong' ? (
                                <form onSubmit={handleSubmitReview} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,.02)' }}>
                                    <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '.75rem', color: 'var(--text-primary)' }}>Chúc mừng bạn đã hoàn thành khóa học! 🎉</div>
                                    <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Hãy chia sẻ trải nghiệm của bạn về nội dung và giảng viên:</div>
                                    <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} type="button" onClick={() => setMyReview({ ...myReview, so_sao: s })} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                                                <MI name={s <= myReview.so_sao ? 'star' : 'star_outline'} style={{ color: '#f59e0b', fontSize: '1.75rem' }} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={myReview.nhan_xet}
                                        onChange={e => setMyReview({ ...myReview, nhan_xet: e.target.value })}
                                        placeholder="Khóa học này có giúp ích cho bạn không? Hãy viết vài lời nhé..."
                                        style={{ width: '100%', padding: '.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '.875rem', marginBottom: '1rem', minHeight: 100, resize: 'vertical', outline: 'none' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                        required
                                    />
                                    <button type="submit" disabled={reviewLoading} className="btn btn-primary" style={{ padding: '.6rem 1.5rem', fontSize: '.85rem', fontWeight: 700 }}>
                                        {reviewLoading ? 'Đang gửi...' : 'Gửi đánh giá khóa học'}
                                    </button>
                                </form>
                            ) : (
                                <div style={{ padding: '1rem 1.25rem', background: '#fff7ed', borderRadius: '10px', border: '1px solid #ffedd5', marginBottom: '1.5rem', display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                                    <MI name="info" style={{ color: '#d97706', fontSize: '1.2rem' }} />
                                    <span style={{ fontSize: '.82rem', color: '#92400e', fontWeight: 500 }}>
                                        Bạn cần học xong 100% khóa học để có thể để lại đánh giá (Đang học: {pct}%).
                                    </span>
                                </div>
                            )
                        )}

                        {/* Review List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {reviews.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '.85rem', fontStyle: 'italic' }}>Chưa có đánh giá nào cho khóa học này.</div>
                            ) : (
                                reviews.map(r => (
                                    <div key={r.id_danh_gia} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.3rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{r.ten_nguoi_dung}</div>
                                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{new Date(r.ngay_tao).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                        <div style={{ marginBottom: '.4rem' }}><Stars n={r.so_sao} /></div>
                                        <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.nhan_xet}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RECRUITER REVIEWS SECTION */}
                    <div className="card" style={{ border: '1px solid #dcfce7', background: 'linear-gradient(to bottom, #f0fdf4, #fff)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '.6rem', color: '#065f46' }}>
                                <MI name="verified" style={{ fontSize: '1.4rem', color: '#059669' }} /> Góc nhìn từ Nhà tuyển dụng
                            </h3>
                            <div style={{ background: '#d1fae5', color: '#065f46', padding: '.4rem .8rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                                {Number(course.trung_binh_sao_ntd || 0).toFixed(1)} <Stars n={1} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {ntdReviews.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '.9rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px dashed #ced4da' }}>
                                    Tham gia đánh giá để giúp học viên hiểu rõ giá trị thực tế của khóa học này.
                                </div>
                            ) : (
                                ntdReviews.map(r => (
                                    <div key={r.id_danh_gia} style={{ background: '#fff', border: '1px solid #eef2f7', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {r.hinh_anh_logo ? (
                                                        <img src={r.hinh_anh_logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <MI name="business" style={{ color: '#64748b', fontSize: '1.2rem' }} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#065f46' }}>{r.ten_nha_tuyen_dung || r.ten_dang_nhap}</div>
                                                    <div style={{ fontSize: '.7rem', color: '#64748b' }}>Doanh nghiệp đối tác</div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>{new Date(r.ngay_tao).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                        <div style={{ marginBottom: '.75rem' }}><Stars n={r.so_sao_phu_hop} /></div>
                                        <p style={{ fontSize: '.9rem', color: '#334155', lineHeight: 1.6, fontStyle: 'italic', position: 'relative', paddingLeft: '1.5rem' }}>
                                            <span style={{ position: 'absolute', left: 0, top: -5, fontSize: '2rem', color: '#cbd5e1', fontFamily: 'serif' }}>“</span>
                                            {r.nhan_xet_chuyen_mon}
                                            <span style={{ fontSize: '2rem', color: '#cbd5e1', lineHeight: 0, fontFamily: 'serif', verticalAlign: 'sub' }}>”</span>
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recognized by */}
                    <div className="card" style={{ background: '#f8fafc' }}>
                        <h3 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem', color: '#334155' }}>
                            <MI name="verified_user" style={{ fontSize: '1.2rem', color: 'var(--primary)' }} /> Được chứng thực bởi
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {course.employer_endorsements && course.employer_endorsements.length > 0 ? (
                                course.employer_endorsements.map((emp, i) => (
                                    <div key={i} style={{ 
                                        display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.6rem 1rem', 
                                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        {emp.hinh_anh_logo ? (
                                            <img src={emp.hinh_anh_logo} alt="logo" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                            <MI name="business" style={{ fontSize: '1rem', color: '#94a3b8' }} />
                                        )}
                                        <span style={{ fontSize: '.85rem', fontWeight: 700, color: '#475569' }}>{emp.ten_nha_tuyen_dung}</span>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div style={{ padding: '.6rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '.82rem', fontWeight: 600, color: '#94a3b8', background: '#fff', opacity: 0.7 }}>FPT Software (Hạng A)</div>
                                    <div style={{ padding: '.6rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '.82rem', fontWeight: 600, color: '#94a3b8', background: '#fff', opacity: 0.7 }}>VNG Corp</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (sticky) ── */}
                <div style={{ position: 'sticky', top: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* ENROLL / PROGRESS CARD */}
                    <div className="card" style={{ padding: '1.25rem' }}>

                        {/* Price */}
                        {!enrollment && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '.5rem', marginBottom: '.25rem' }}>
                                    <span style={{ fontSize: '1.7rem', fontWeight: 800, color: Number(course.gia_tien) === 0 ? '#10b981' : '#d97706' }}>
                                        {Number(course.gia_tien) === 0 ? 'Miễn phí' : `${Number(course.gia_tien).toLocaleString('vi-VN')}₫`}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '.9rem' }}>
                                            {Number(course.gia_goc).toLocaleString('vi-VN')}₫
                                        </span>
                                        <span style={{ background: '#ef4444', color: '#fff', padding: '.15rem .5rem', borderRadius: '4px', fontSize: '.72rem', fontWeight: 700 }}>
                                            Giảm {discount}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Enrolled state */}
                        {isRecruiter ? (
                            <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                                <MI name="visibility" style={{ fontSize: '2rem', color: '#2563eb', marginBottom: '.5rem' }} />
                                <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '.9rem', marginBottom: '.5rem' }}>CHẾ ĐỘ NHÀ TUYỂN DỤNG</div>
                                <p style={{ fontSize: '.75rem', color: '#3b82f6', lineHeight: 1.5, margin: 0 }}>
                                    Bạn có quyền xem toàn bộ nội dung giáo trình bên dưới để đánh giá chất lượng đào tạo trước khi săn nhân tài.
                                </p>
                            </div>
                        ) : enrollment ? (
                            <div>
                                <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '10px', padding: '.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.3rem', marginBottom: '.3rem', display: 'flex', justifyContent: 'center' }}><MI name="check_circle" style={{ fontSize: '1.4rem', color: '#059669' }} /></div>
                                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '.9rem' }}>Bạn đã đăng ký khóa học này</div>
                                    <div style={{ fontSize: '.78rem', color: '#059669', marginTop: '.2rem' }}>Tiến độ: {pct}% hoàn thành</div>
                                </div>
                                {/* Progress bar */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#10b981' : '#2563eb', borderRadius: '99px' }} />
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/courses/${id}/learn`)}
                                    style={{ width: '100%', padding: '.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', marginBottom: '.6rem' }}
                                >
                                    {pct >= 100 ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="workspace_premium" style={{ fontSize: '1rem' }} /> Xem chứng chỉ</span> : pct > 0 ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="play_arrow" style={{ fontSize: '1rem' }} /> Tiếp tục học</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="play_arrow" style={{ fontSize: '1rem' }} /> Bắt đầu học ngay</span>}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={handleEnroll} disabled={enrolling}
                                    style={{ width: '100%', padding: '.85rem', background: '#d97706', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: enrolling ? 'wait' : 'pointer', fontSize: '1rem', marginBottom: '.75rem', transition: 'all .18s', opacity: enrolling ? .8 : 1, boxShadow: '0 4px 12px rgba(217,119,6,.3)' }}
                                    onMouseEnter={e => { if (!enrolling) e.currentTarget.style.background = '#b45309'; }}
                                    onMouseLeave={e => { if (!enrolling) e.currentTarget.style.background = '#d97706'; }}
                                >
                                    {enrolling ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="hourglass_empty" style={{ fontSize: '1rem' }} /> Đang đăng ký...</span> : Number(course.gia_tien) === 0 ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="check" style={{ fontSize: '1rem' }} /> Đăng ký miễn phí ngay</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="school" style={{ fontSize: '1rem' }} /> Đăng ký học ngay →</span>}
                                </button>
                                {freeLessons > 0 && (
                                    <div style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--text-muted)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}>
                                        <MI name="visibility" style={{ fontSize: '1rem' }} /> {freeLessons} bài học có thể xem trước miễn phí
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Course includes */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <p style={{ fontWeight: 600, fontSize: '.85rem', marginBottom: '.6rem', color: 'var(--text-primary)' }}>Khóa học bao gồm:</p>
                            {[
                                ['play_circle', `${Math.floor(totalMinutes / 60) > 0 ? Math.floor(totalMinutes / 60) + ' giờ ' : ''}${totalMinutes % 60 > 0 ? totalMinutes % 60 + ' phút' : ''} video học`],
                                ['menu_book', `${chapters.length} chương · ${totalLessons} bài giảng`],
                                ['workspace_premium', 'Chứng chỉ hoàn thành có UUID'],
                                ['all_inclusive', 'Truy cập trọn đời'],
                                ['devices', 'Học mọi thiết bị'],
                            ].map(([ic, txt], i) => (
                                <div key={i} style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '.82rem', marginBottom: '.35rem', color: 'var(--text-secondary)' }}>
                                    <MI name={ic} style={{ fontSize: '1rem', color: 'var(--primary)', flexShrink: 0 }} /><span>{txt}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Certificate Card */}
                    <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', borderRadius: '14px', padding: '1.25rem', color: '#fff', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '.4rem', display: 'flex', justifyContent: 'center' }}><MI name="emoji_events" style={{ fontSize: '2rem' }} /></div>
                        <div style={{ fontWeight: 800, letterSpacing: '.08em', fontSize: '.9rem', marginBottom: '.2rem' }}>CHỨNG CHỈ SỐ</div>
                        <div style={{ fontSize: '.78rem', opacity: .9, marginBottom: '.75rem' }}>Hoàn thành khóa học</div>
                        <div style={{ height: 1, background: 'rgba(255,255,255,.3)', marginBottom: '.75rem' }} />
                        <div style={{ fontSize: '.78rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                            {['✓ Mã UUID định danh duy nhất', '✓ QR Code xác thực nhanh', '✓ Lưu trữ vĩnh viễn trên hệ thống'].map(t => (
                                <div key={t}>{t}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ── TOAST ── */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
                    background: toast.type === 'error' ? '#ef4444' : '#1e293b', color: '#fff',
                    padding: '.75rem 1.25rem', borderRadius: '10px', fontSize: '.875rem',
                    zIndex: 9999, boxShadow: '0 10px 30px rgba(0,0,0,.2)',
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    animation: 'fadeUp .25s ease both',
                }}>
                    {toast.msg}
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
};

export default CourseDetail;
