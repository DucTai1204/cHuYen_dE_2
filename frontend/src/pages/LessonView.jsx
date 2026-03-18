import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/* ─── Constants ─── */
const TYPE_ICON = { Video: 'play_circle', Quiz: 'assignment_turned_in', TaiLieu: 'description', VanBan: 'article' };
const TYPE_LABEL = { Video: 'Video', Quiz: 'Bài kiểm tra', TaiLieu: 'Tài liệu', VanBan: 'Văn bản' };

/* ─── Helpers ─── */
const buildFlatLessons = (chapters) => {
    const flat = [];
    chapters.forEach(ch =>
        (ch.bai_giang || []).forEach(l => flat.push({ ...l, _chapter: ch.ten_chuong }))
    );
    return flat;
};

/* ════════════════════════════════════════════════════
   VIDEO PLAYER — tự động ghi nhận % đã xem
════════════════════════════════════════════════════ */
const VideoPlayer = ({ lesson, onComplete }) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const [watchedPct, setWatchedPct] = useState(0);
    const threshold = lesson.video_watch_percentage ?? 100;
    const [hasError, setHasError] = useState(false);
    const completedRef = useRef(false);

    // Hàm lấy ID Video YouTube
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(lesson.noi_dung_url);

    useEffect(() => {
        if (!videoId) return;

        let interval;
        const scripts = document.getElementsByTagName('script');
        let loaded = false;
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src === "https://www.youtube.com/iframe_api") loaded = true;
        }

        if (!loaded) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        const onPlayerReady = (event) => {
            interval = setInterval(() => {
                const duration = event.target.getDuration();
                const currentTime = event.target.getCurrentTime();
                if (duration > 0) {
                    const pct = Math.round((currentTime / duration) * 100);
                    setWatchedPct(prev => {
                        const next = Math.max(prev, pct);
                        if (next >= threshold && !completedRef.current) {
                            completedRef.current = true;
                            onComplete();
                        }
                        return next;
                    });
                }
            }, 1000);
        };

        const createPlayer = () => {
            playerRef.current = new window.YT.Player(containerRef.current, {
                videoId: videoId,
                playerVars: {
                    'rel': 0,
                    'origin': window.location.origin,
                    'enablejsapi': 1
                },
                events: {
                    'onReady': onPlayerReady,
                    'onError': () => setHasError(true)
                }
            });
        };

        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            window.onYouTubeIframeAPIReady = createPlayer;
        }

        return () => {
            if (interval) clearInterval(interval);
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
        };
    }, [videoId, threshold, onComplete]);

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
                background: '#000',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                border: '1px solid rgba(0,0,0,0.1)'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>
                </div>

                <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    color: '#fff', padding: '.4rem .8rem', borderRadius: '8px',
                    fontSize: '.75rem', fontWeight: 700, pointerEvents: 'none',
                    border: '1px solid rgba(255,255,255,0.3)', zIndex: 10,
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-icons" style={{ fontSize: '.9rem' }}>track_changes</span> Mục tiêu: {threshold}%
                    </div>
                    <div style={{ color: watchedPct >= threshold ? '#10b981' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-icons" style={{ fontSize: '.9rem' }}>trending_up</span> Đã xem: {watchedPct}% {watchedPct >= threshold && <span className="material-icons" style={{ fontSize: '1rem' }}>check_circle</span>}
                    </div>
                </div>

                {!videoId && !hasError && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#111' }}>
                        URL Video không hợp lệ
                    </div>
                )}

                {hasError && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '2rem', textAlign: 'center', zIndex: 20 }}>
                        <p style={{ marginBottom: '1rem' }}>YouTube từ chối trình phát nhúng.</p>
                        <a href={lesson.noi_dung_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Xem trên YouTube ↗</a>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '.75rem', padding: '.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', marginBottom: '.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tiến độ ghi nhận: <strong>{watchedPct}%</strong></span>
                    <span style={{ color: watchedPct >= threshold ? '#059669' : '#d97706', fontWeight: 700 }}>
                        {watchedPct >= threshold ? 'ĐÃ ĐẠT YÊU CẦU' : `Cần xem thêm ${threshold - watchedPct}%`}
                    </span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                        style={{
                            height: '100%',
                            width: `${Math.min(watchedPct, 100)}%`,
                            background: watchedPct >= threshold ? '#10b981' : '#f59e0b',
                            transition: 'width 0.3s ease'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════
   TEXT/DOC VIEWER — hoàn thành khi cuộn tới cuối
════════════════════════════════════════════════════ */
const TextViewer = ({ lesson, onComplete }) => {
    const containerRef = useRef(null);
    const completedRef = useRef(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const check = () => {
            if (completedRef.current) return;
            const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
            if (reachedBottom) {
                completedRef.current = true;
                onComplete();
            }
        };
        el.addEventListener('scroll', check);
        return () => el.removeEventListener('scroll', check);
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            style={{ height: '68vh', overflowY: 'auto', padding: '1.5rem 2rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', lineHeight: 1.8, fontSize: '.95rem', color: 'var(--text-primary)', position: 'relative' }}
        >
            <div style={{ position: 'sticky', top: 0, background: 'linear-gradient(to bottom, #fff 80%, transparent)', paddingBottom: '.5rem', marginBottom: '1rem', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-icons" style={{ fontSize: '1.1rem', color: '#60a5fa' }}>info</span>
                <p style={{ fontSize: '.78rem', color: '#60a5fa', fontWeight: 600, margin: 0 }}>Cuộn xuống đến cuối để hoàn thành bài học</p>
            </div>
            {lesson.loai_bai === 'TaiLieu' && lesson.noi_dung_url ? (
                <iframe
                    src={lesson.noi_dung_url}
                    style={{ width: '100%', minHeight: '500px', border: 'none' }}
                    title={lesson.ten_bai_giang}
                />
            ) : lesson.loai_bai === 'VanBan' ? (
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>{lesson.ten_bai_giang}</h2>
                    {lesson.noi_dung_url || 'Chưa có nội dung văn bản cho bài giảng này.'}
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
                        ✅ Bạn đã đọc đến cuối nội dung!
                    </div>
                </div>
            ) : (
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>{lesson.ten_bai_giang}</h2>
                    {Array.from({ length: 10 }).map((_, i) => (
                        <p key={i} style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            Nội dung bài giảng đang được cập nhật. Đây là đoạn văn thứ {i + 1} của phần nội dung học tập. Vui lòng cuộn xuống cuối để hoàn thành bài học này và mở khóa các bài tiếp theo.
                        </p>
                    ))}
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
                        ✅ Bạn đã đọc đến cuối nội dung!
                    </div>
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════════
   QUIZ VIEWER — hoàn thành khi nộp bài
════════════════════════════════════════════════════ */
const QuizViewer = ({ lesson, onComplete }) => {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    // Mock câu hỏi — trong thực tế lấy từ API bài giảng
    const mockQuestions = [
        { id: 1, q: 'Câu hỏi kiểm tra 1 — Bạn đã hiểu nội dung bài chưa?', opts: ['Rồi', 'Chưa', 'Cần xem lại', 'Sẽ xem lại sau'] },
        { id: 2, q: 'Câu hỏi 2 — Bài học này giúp ích cho bạn như thế nào?', opts: ['Rất hữu ích', 'Hữu ích', 'Bình thường', 'Chưa hữu ích'] },
    ];
    const allAnswered = mockQuestions.every(q => answers[q.id] !== undefined);

    const handleSubmit = () => {
        setSubmitted(true);
        onComplete();
    };

    if (submitted) return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#065f46' }}>Nộp bài thành công!</div>
            <div style={{ color: '#059669', fontSize: '.875rem', marginTop: '.5rem' }}>Bài kiểm tra đã được ghi nhận.</div>
        </div>
    );

    return (
        <div>
            <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons">assignment</span> {lesson.ten_bai_giang}
                </div>
                <div style={{ fontSize: '.85rem', opacity: .85, marginTop: '.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="material-icons" style={{ fontSize: '1rem' }}>help_outline</span> {mockQuestions.length} câu hỏi · Làm hết để hoàn thành
                </div>
            </div>
            {mockQuestions.map((q, qi) => (
                <div key={q.id} className="card" style={{ marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Câu {qi + 1}: {q.q}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                        {q.opts.map((opt, oi) => {
                            const sel = answers[q.id] === oi;
                            return (
                                <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.65rem 1rem', borderRadius: '8px', cursor: 'pointer', border: `1px solid ${sel ? '#3b82f6' : 'var(--border)'}`, background: sel ? '#eff6ff' : '#fff', transition: 'all .15s' }}>
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${sel ? '#3b82f6' : '#cbd5e1'}`, background: sel ? '#3b82f6' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                                    </div>
                                    <input type="radio" name={`q${q.id}`} style={{ display: 'none' }} onChange={() => setAnswers(a => ({ ...a, [q.id]: oi }))} />
                                    <span style={{ fontSize: '.875rem' }}>{opt}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
            <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                style={{ width: '100%', padding: '.875rem', background: allAnswered ? '#2563eb' : '#94a3b8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: allAnswered ? 'pointer' : 'not-allowed', fontSize: '1rem', transition: 'all .2s' }}
            >
                {allAnswered ? '✅ Nộp bài và hoàn thành' : `Vui lòng trả lời đủ ${mockQuestions.length} câu`}
            </button>
        </div>
    );
};

/* ════════════════════════════════════════════════════
   MAIN: LESSON VIEW PAGE
════════════════════════════════════════════════════ */
const LessonView = () => {
    const { id: courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [flatLessons, setFlatLessons] = useState([]);
    const [enrollment, setEnrollment] = useState(null);
    const [completedIds, setCompletedIds] = useState(new Set());
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [toast, setToast] = useState(null);
    const [completing, setCompleting] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    /* ── Fetch tất cả dữ liệu ── */
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [cRes, chRes, eRes, tdRes] = await Promise.all([
                    api.get(`/lms/khoa-hoc/${courseId}/`),
                    api.get(`/lms/chuong/?khoa_hoc=${courseId}`),
                    api.get('/lms/dang-ky-hoc/'),
                    api.get(`/lms/tien-do-bai/?khoa_hoc=${courseId}`),
                ]);

                setCourse(cRes.data);
                const chs = chRes.data || [];
                setChapters(chs);
                const flat = buildFlatLessons(chs);
                setFlatLessons(flat);

                const myEnroll = (eRes.data || []).find(e => {
                    const eid = e.khoa_hoc?.id_khoa_hoc ?? e.id_khoa_hoc;
                    return String(eid) === String(courseId);
                });
                setEnrollment(myEnroll || null);

                const done = new Set(tdRes.data?.completed_lesson_ids || []);
                setCompletedIds(done);

                // Điều hướng đến bài đang học dở hoặc bài đầu tiên
                if (flat.length > 0) {
                    const lastDoneIdx = [...flat].reverse().findIndex(l => done.has(l.id_bai_giang));
                    const resumeIdx = lastDoneIdx >= 0 ? flat.length - 1 - lastDoneIdx + 1 : 0;
                    setCurrentLesson(flat[Math.min(resumeIdx, flat.length - 1)]);
                }
            } catch (err) {
                console.error('[LessonView] fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [courseId]);

    /* ── Gọi API hoàn thành bài học ── */
    const handleComplete = useCallback(async () => {
        if (!currentLesson || completing) return;
        if (completedIds.has(currentLesson.id_bai_giang)) {
            showToast('✅ Bài học này đã được ghi nhận hoàn thành trước đó.', 'info');
            return;
        }
        setCompleting(true);
        try {
            const res = await api.post('/lms/tien-do-bai/hoan_thanh/', {
                id_bai_giang: currentLesson.id_bai_giang,
                id_khoa_hoc: courseId,
            });
            setCompletedIds(prev => new Set([...prev, currentLesson.id_bai_giang]));
            showToast(`🎉 Hoàn thành "${currentLesson.ten_bai_giang}"! Tiến độ: ${res.data.phan_tram_hoan_thanh}%`);

            // Kiểm tra xem đã hoàn thành toàn bộ chưa
            const idx = flatLessons.findIndex(l => l.id_bai_giang === currentLesson.id_bai_giang);
            if (idx === flatLessons.length - 1) {
                showToast('🏆 Bạn đã hoàn thành toàn bộ khóa học!');
            }
        } catch (err) {
            const msg = err?.response?.data?.error || 'Không thể đánh dấu hoàn thành';
            showToast(msg, 'error');
        } finally {
            setCompleting(false);
        }
    }, [currentLesson, completing, completedIds, courseId, flatLessons]);

    /* ── Kiểm tra bài có bị khóa không ── */
    const isLocked = useCallback((lesson) => {
        if (!course?.is_sequential) return false;
        const idx = flatLessons.findIndex(l => l.id_bai_giang === lesson.id_bai_giang);
        if (idx <= 0) return false;
        const prevId = flatLessons[idx - 1].id_bai_giang;
        return !completedIds.has(prevId);
    }, [course, flatLessons, completedIds]);

    const handleSelectLesson = (lesson) => {
        if (isLocked(lesson)) {
            showToast('🔒 Hãy hoàn thành bài trước để mở khóa bài này.', 'error');
            return;
        }
        setCurrentLesson(lesson);
    };

    /* ── Tính chỉ số bài hiện tại ── */
    const currentIdx = flatLessons.findIndex(l => l.id_bai_giang === currentLesson?.id_bai_giang);
    const pct = enrollment?.phan_tram_hoan_thanh || 0;

    /* ── Loading ── */
    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 4rem)', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #eff6ff', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span>Đang tải bài học...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!enrollment) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
            <div style={{ fontWeight: 600, marginBottom: '.5rem' }}>Bạn chưa đăng ký khóa học này</div>
            <Link to={`/courses/${courseId}`}>
                <button style={{ padding: '.6rem 1.4rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '.75rem', fontWeight: 600 }}>
                    ← Về trang khóa học
                </button>
            </Link>
        </div>
    );

    return (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3.5rem)', overflow: 'hidden' }}>

            {/* ── TOP BAR ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.6rem 1rem', background: '#1e293b', color: '#fff', flexShrink: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <button
                        onClick={() => setSidebarOpen(o => !o)}
                        style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
                        title="Ẩn/Hiện danh sách bài"
                    >
                        <span className="material-icons" style={{ fontSize: '1.25rem' }}>{sidebarOpen ? 'menu_open' : 'menu'}</span>
                    </button>
                    <Link to={`/courses/${courseId}`} style={{ color: 'rgba(255,255,255,.7)', fontSize: '.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-icons" style={{ fontSize: '1.1rem' }}>arrow_back</span>
                        <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course?.ten_khoa_hoc}</span>
                    </Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '.82rem' }}>
                    {course?.is_sequential && (
                        <span style={{ background: 'rgba(251,191,36,.2)', color: '#fbbf24', padding: '.2rem .6rem', borderRadius: '99px', fontSize: '.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span className="material-icons" style={{ fontSize: '.9rem' }}>lock_clock</span> Học tuần tự
                        </span>
                    )}
                    <span style={{ color: 'rgba(255,255,255,.7)' }}>Tiến độ: <strong style={{ color: '#34d399' }}>{Math.round(pct)}%</strong></span>
                    <div style={{ width: 80, height: 5, background: 'rgba(255,255,255,.2)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#34d399', borderRadius: '99px', transition: 'width .5s' }} />
                    </div>
                </div>
            </div>

            {/* ── BODY (Sidebar + Content) ── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ── Sidebar (danh sách bài học) ── */}
                <div style={{
                    width: sidebarOpen ? 320 : 0,
                    flexShrink: 0,
                    background: '#0f172a',
                    color: '#e2e8f0',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRight: sidebarOpen ? '1px solid rgba(255,255,255,.1)' : 'none',
                    opacity: sidebarOpen ? 1 : 0,
                    visibility: sidebarOpen ? 'visible' : 'hidden'
                }}>
                    <div style={{ padding: '1rem', fontSize: '.75rem', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.08)', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>
                        Nội dung khóa học
                    </div>
                    {chapters.map((ch, ci) => (
                        <div key={ch.id_chuong} style={{ whiteSpace: 'nowrap' }}>
                            <div style={{ padding: '.75rem 1rem', fontSize: '.8rem', fontWeight: 700, color: '#64748b', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-icons" style={{ fontSize: '1.2rem' }}>folder</span> {ci + 1}. {ch.ten_chuong}
                            </div>
                            {(ch.bai_giang || []).map((l) => {
                                const locked = isLocked(l);
                                const done = completedIds.has(l.id_bai_giang);
                                const active = currentLesson?.id_bai_giang === l.id_bai_giang;
                                return (
                                    <button
                                        key={l.id_bai_giang}
                                        onClick={() => handleSelectLesson(l)}
                                        style={{
                                            width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '.75rem',
                                            padding: '.75rem 1rem .75rem 1.5rem', border: 'none', cursor: locked ? 'not-allowed' : 'pointer',
                                            background: active ? 'rgba(59,130,246,.18)' : 'transparent',
                                            borderLeft: active ? '4px solid #3b82f6' : '4px solid transparent',
                                            color: locked ? '#475569' : active ? '#fff' : '#cbd5e1', fontSize: '.85rem',
                                            transition: 'all .2s',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <span className="material-icons" style={{
                                            fontSize: '1.2rem',
                                            color: done ? '#10b981' : locked ? '#475569' : active ? '#3b82f6' : '#64748b'
                                        }}>
                                            {done ? 'check_circle' : locked ? 'lock' : TYPE_ICON[l.loai_bai] || 'play_circle'}
                                        </span>
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.ten_bai_giang}</span>
                                        {l.thoi_luong_phut > 0 && (
                                            <span style={{ color: '#475569', fontSize: '.7rem' }}>{l.thoi_luong_phut}p</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* ── Vùng nội dung bài học ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
                    {!currentLesson ? (
                        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
                            <div style={{ fontWeight: 600 }}>Chọn một bài học để bắt đầu</div>
                        </div>
                    ) : (
                        <div style={{ maxWidth: 820, margin: '0 auto' }}>
                            {/* Lesson header */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.78rem', color: 'var(--text-muted)', marginBottom: '.35rem' }}>
                                    <span>{currentLesson._chapter}</span>
                                    <span>›</span>
                                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '.1rem .4rem', borderRadius: '4px', fontWeight: 600 }}>
                                        {TYPE_LABEL[currentLesson.loai_bai] || currentLesson.loai_bai}
                                    </span>
                                    {completedIds.has(currentLesson.id_bai_giang) && (
                                        <span style={{ background: '#f0fdf4', color: '#059669', padding: '.1rem .5rem', borderRadius: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <span className="material-icons" style={{ fontSize: '.9rem' }}>check_circle</span> Đã hoàn thành
                                        </span>
                                    )}
                                </div>
                                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                                    {currentLesson.ten_bai_giang}
                                </h1>
                            </div>

                            {/* Content by type */}
                            {currentLesson.loai_bai === 'Video' && (
                                <VideoPlayer lesson={currentLesson} onComplete={handleComplete} />
                            )}
                            {(currentLesson.loai_bai === 'TaiLieu' || currentLesson.loai_bai === 'VanBan') && (
                                <TextViewer lesson={currentLesson} onComplete={handleComplete} />
                            )}
                            {currentLesson.loai_bai === 'Quiz' && (
                                <QuizViewer lesson={currentLesson} onComplete={handleComplete} />
                            )}

                            {/* Navigation buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
                                <button
                                    onClick={() => currentIdx > 0 && handleSelectLesson(flatLessons[currentIdx - 1])}
                                    disabled={currentIdx <= 0}
                                    style={{ padding: '.65rem 1.2rem', background: currentIdx > 0 ? '#fff' : '#f1f5f9', color: currentIdx > 0 ? 'var(--text-primary)' : '#94a3b8', border: '1px solid var(--border)', borderRadius: '10px', cursor: currentIdx > 0 ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>navigate_before</span> Bài trước
                                </button>

                                {!completedIds.has(currentLesson.id_bai_giang) && currentLesson.loai_bai !== 'Video' && currentLesson.loai_bai !== 'Quiz' && (
                                    <button
                                        onClick={handleComplete}
                                        disabled={completing}
                                        style={{ padding: '.65rem 1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', cursor: completing ? 'wait' : 'pointer', fontWeight: 700, fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>{completing ? 'sync' : 'check_circle'}</span>
                                        {completing ? 'Đang lưu...' : 'Hoàn thành bài học'}
                                    </button>
                                )}

                                <button
                                    onClick={() => currentIdx < flatLessons.length - 1 && handleSelectLesson(flatLessons[currentIdx + 1])}
                                    disabled={currentIdx >= flatLessons.length - 1}
                                    style={{ padding: '.65rem 1.2rem', background: currentIdx < flatLessons.length - 1 ? '#2563eb' : '#fff', color: currentIdx < flatLessons.length - 1 ? '#fff' : '#cbd1d8', border: '1px solid var(--border)', borderRadius: '10px', cursor: currentIdx < flatLessons.length - 1 ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    Bài tiếp <span className="material-icons" style={{ fontSize: '1.2rem' }}>navigate_next</span>
                                </button>
                            </div>

                            {/* ── BẢNG DEBUG CONSOLE (Sẽ ẩn sau này) ── 
                            <div style={{ marginTop: '3rem', padding: '1rem', background: '#1e293b', color: '#34d399', borderRadius: '10px', fontFamily: 'monospace', fontSize: '.75rem', border: '2px solid #334155' }}>
                                <div style={{ borderBottom: '1px solid #334155', paddingBottom: '.5rem', marginBottom: '.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>💻 SYSTEM DEBUG CONSOLE</span>
                                    <span style={{ color: '#94a3b8' }}>{new Date().toLocaleTimeString()}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '.5rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Lesson ID:</span> <span>{currentLesson.id_bai_giang}</span>
                                    <span style={{ color: '#94a3b8' }}>Type:</span> <span>{currentLesson.loai_bai}</span>
                                    <span style={{ color: '#94a3b8' }}>Source URL:</span> <span style={{ color: '#fbbf24', wordBreak: 'break-all' }}>{currentLesson.noi_dung_url}</span>
                                    <span style={{ color: '#94a3b8' }}>Course ID:</span> <span>{courseId}</span>
                                    <span style={{ color: '#94a3b8' }}>Chapters:</span> <span>{chapters.length} loaded</span>
                                    <span style={{ color: '#94a3b8' }}>Enrollment:</span> <span>{enrollment ? '✅ OK' : '❌ Null'}</span>
                                </div>
                            </div>*/}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Toast ── */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
                    background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#1e293b',
                    color: '#fff', padding: '.75rem 1.25rem', borderRadius: '10px', fontSize: '.875rem',
                    zIndex: 9999, boxShadow: '0 10px 30px rgba(0,0,0,.2)',
                    maxWidth: 360, animation: 'fadeUp .25s ease both',
                }}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default LessonView;
