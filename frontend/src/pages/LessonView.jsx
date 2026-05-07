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
                    <div style={{ color: watchedPct >= threshold ? '#10b981' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                    <span style={{ color: watchedPct >= threshold ? '#059669' : 'var(--primary)', fontWeight: 700 }}>
                        {watchedPct >= threshold ? 'ĐÃ ĐẠT YÊU CẦU' : `Cần xem thêm ${threshold - watchedPct}%`}
                    </span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                        style={{
                            height: '100%',
                            width: `${Math.min(watchedPct, 100)}%`,
                            background: watchedPct >= threshold ? '#10b981' : 'var(--primary)',
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
                <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>info</span>
                <p style={{ fontSize: '.78rem', color: 'var(--primary)', fontWeight: 600, margin: 0 }}>Cuộn xuống đến cuối để hoàn thành bài học</p>
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

/* ── REUSABLE MODAL ── */
const ModernModal = ({ isOpen, title, children, onClose, icon = "info", type = "info" }) => {
    if (!isOpen) return null;
    const colors = {
        error: { bg: '#fee2e2', text: '#991b1b', icon: '#ef4444' },
        warning: { bg: '#fef3c7', text: '#92400e', icon: '#f59e0b' },
        info: { bg: 'var(--primary-light)', text: 'var(--secondary)', icon: 'var(--primary)' }
    };
    const c = colors[type] || colors.info;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1.5rem' }}>
            <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'modalAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: c.bg, color: c.icon, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <span className="material-icons" style={{ fontSize: '2.5rem' }}>{icon}</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>{title}</h3>
                    <div style={{ fontSize: '.95rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>
                        {children}
                    </div>
                    <button 
                        onClick={onClose}
                        style={{ width: '100%', padding: '1rem', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(30, 41, 59, 0.3)' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Tôi đã hiểu
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes modalAppear {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

/* ════════════════════════════════════════════════════
   QUIZ VIEWER — hoàn thành khi nộp bài
════════════════════════════════════════════════════ */
const QuizViewer = ({ lesson, onComplete }) => {
    const navigate = useNavigate();
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [viewMode, setViewMode] = useState('quiz'); // 'quiz' or 'review'
    const [submitting, setSubmitting] = useState(false);
    const [warnings, setWarnings] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    
    // Timer & Modal States
    const [timeLeft, setTimeLeft] = useState((lesson.thoi_luong_phut || 60) * 60);
    const [isPaused, setIsPaused] = useState(!!lesson.is_proctored);
    const [showIntro, setShowIntro] = useState(!!lesson.is_proctored);
    const [modalInfo, setModalInfo] = useState(null);

    // Timer logic
    useEffect(() => {
        if (result || isPaused || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Tự động nộp bài khi hết giờ
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isPaused, result, timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    // Proctoring Logic
    useEffect(() => {
        if (result || showIntro || !lesson.is_proctored) return;

        const triggerWarning = (msg) => {
            setIsPaused(true);
            setWarnings(prev => {
                const next = prev + 1;
                if (next >= 5) {
                    // Trục xuất học viên
                    navigate(`/courses/${lesson.id_khoa_hoc}`, { 
                        state: { kicked: true, courseId: lesson.id_khoa_hoc } 
                    });
                } else {
                    setModalInfo({
                        title: "Cảnh báo vi phạm",
                        message: msg,
                        icon: "warning",
                        type: "warning"
                    });
                }
                return next;
            });
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerWarning("Hệ thống phát hiện bạn rời khỏi màn hình bài thi. Vui lòng tập trung làm bài!");
            }
        };

        const preventActions = (e) => {
            e.preventDefault();
            triggerWarning("Hành động bị chặn (chuột phải/copy/paste) để đảm bảo tính công bằng!");
            return false;
        };

        const handleKeyDown = (e) => {
            if (
                e.keyCode === 123 || 
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
                (e.ctrlKey && e.keyCode === 85) ||
                (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 88))
            ) {
                e.preventDefault();
                triggerWarning("Bạn không được sử dụng phím tắt (F12, Ctrl+C, Ctrl+V...) trong lúc thi!");
                return false;
            }
        };

        const handleFs = () => setIsFullscreen(!!document.fullscreenElement);

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', preventActions);
        document.addEventListener('copy', preventActions);
        document.addEventListener('paste', preventActions);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFs);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', preventActions);
            document.removeEventListener('copy', preventActions);
            document.removeEventListener('paste', preventActions);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFs);
        };
    }, [result, showIntro, lesson.id_khoa_hoc]);


    const questions = lesson.cau_hoi || [];
    const allAnswered = questions.length > 0 && questions.every(q => answers[q.id_cau_hoi] !== undefined);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await api.post(`/lms/bai-giang/${lesson.id_bai_giang}/nop-bai/`, {
                answers: answers
            });
            setResult(res.data);
            if (res.data.da_dat) {
                onComplete();
            }
        } catch (err) {
            alert(err.response?.data?.detail || 'Lỗi khi nộp bài');
        } finally {
            setSubmitting(false);
        }
    };

    if (result && viewMode === 'quiz') return (
        <div style={{ textAlign: 'center', padding: '2.5rem', background: result.da_dat ? '#f0fdf4' : '#fef2f2', borderRadius: '20px', border: `1px solid ${result.da_dat ? '#bbf7d0' : '#fecaca'}`, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: 'bounce 1s infinite' }}>{result.da_dat ? '🎉' : '⚠️'}</div>
            <div style={{ fontWeight: 800, fontSize: '1.5rem', color: result.da_dat ? '#065f46' : '#991b1b', marginBottom: '.5rem' }}>
                {result.da_dat ? 'CHÚC MỪNG! BẠN ĐÃ ĐẠT' : 'CHƯA ĐẠT YÊU CẦU'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b' }}>{result.diem_so}</div>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Điểm của bạn</div>
                </div>
                <div style={{ width: '2px', height: '40px', background: 'rgba(0,0,0,0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#94a3b8' }}>{result.tong_diem}</div>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tổng điểm</div>
                </div>
            </div>
            <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 2rem' }}>
                {result.da_dat 
                    ? 'Bạn đã hoàn thành tốt bài kiểm tra và đủ điều kiện để tiếp tục bài học tiếp theo.' 
                    : 'Rất tiếc, bạn cần đạt ít nhất 80% số điểm để hoàn thành bài này. Hãy xem lại kiến thức và thử lại!'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
                <button 
                    onClick={() => setViewMode('review')}
                    style={{ padding: '1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', transition: 'all .2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <MI name="visibility" style={{ fontSize: '1.2rem' }} /> Xem lại đáp án
                </button>
                {!result.da_dat && (
                    <button 
                        onClick={() => { setResult(null); setAnswers({}); setViewMode('quiz'); }}
                        style={{ padding: '1rem', background: '#fff', color: '#1e293b', border: '2px solid #e2e8f0', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
                    >
                        Làm lại bài tập
                    </button>
                )}
            </div>
        </div>
    );

    if (questions.length === 0) return (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <span className="material-icons" style={{ fontSize: '3rem', marginBottom: '1rem' }}>info</span>
            <p>Bài kiểm tra này hiện chưa có câu hỏi.</p>
        </div>
    );

    return (
        <div>
            <div style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', color: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, fontSize: '5rem' }}>🛡️</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-icons">assignment</span> {lesson.ten_bai_giang}
                        </div>
                        <div style={{ fontSize: '.85rem', opacity: .85, marginTop: '.4rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span className="material-icons" style={{ fontSize: '1rem' }}>help_outline</span> {questions.length} câu hỏi
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: timeLeft < 300 ? '#fca5a5' : '#fff' }}>
                                <span className="material-icons" style={{ fontSize: '1rem' }}>timer</span> {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                    {lesson.is_proctored && (
                        <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.2)', padding: '.5rem .8rem', borderRadius: '10px', backdropFilter: 'blur(4px)' }}>
                            <div style={{ fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase' }}>Giám sát AI</div>
                            <div style={{ fontSize: '.9rem', fontWeight: 700 }}>Vi phạm: <span style={{ color: warnings > 0 ? '#ef4444' : '#fff' }}>{warnings}/5</span></div>
                        </div>
                    )}
                </div>
                {lesson.is_proctored && !isFullscreen && !showIntro && (
                    <button 
                        onClick={() => document.documentElement.requestFullscreen()}
                        style={{ marginTop: '1rem', width: '100%', padding: '.5rem', borderRadius: '8px', border: '1px dashed #fff', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '.75rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                        ⚠️ Nhấn để bật Toàn màn hình (Khuyến nghị)
                    </button>
                )}
            </div>

            {/* Question Navigator */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', marginBottom: '1.5rem', padding: '1rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                {questions.map((_, i) => {
                    const qId = questions[i].id_cau_hoi;
                    const isAnswered = answers[qId] !== undefined;
                    let bg = isAnswered ? 'var(--primary-light)' : '#f8fafc';
                    let text = isAnswered ? 'var(--primary)' : '#94a3b8';
                    let border = isAnswered ? 'var(--primary)' : '#e2e8f0';

                    if (viewMode === 'review' && result) {
                        const detail = result.results_detail?.find(d => d.id_cau_hoi === qId);
                        bg = detail?.is_correct ? '#f0fdf4' : '#fef2f2';
                        text = detail?.is_correct ? '#10b981' : '#ef4444';
                        border = detail?.is_correct ? '#10b981' : '#ef4444';
                    }

                    return (
                        <div 
                            key={i} 
                            style={{ 
                                width: 36, height: 36, borderRadius: '10px', 
                                background: bg, color: text, border: `2px solid ${border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '.85rem', fontWeight: 800, transition: 'all .2s'
                            }}
                        >
                            {i + 1}
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            <ModernModal 
                isOpen={showIntro} 
                title="Quy chế bài thi" 
                icon="gavel"
                onClose={() => { setShowIntro(false); setIsPaused(false); }}
            >
                <p>Chào mừng bạn đến với bài thi. Để đảm bảo tính công bằng, vui lòng tuân thủ:</p>
                <ul style={{ textAlign: 'left', marginTop: '10px', paddingLeft: '20px' }}>
                    <li>Không chuyển Tab hoặc thu nhỏ trình duyệt.</li>
                    <li>Không sử dụng chuột phải, Copy/Paste.</li>
                    <li>Không sử dụng phím tắt (F12, Ctrl+C...).</li>
                    <li><strong>Vi phạm quá 5 lần sẽ bị mời ra khỏi phòng thi.</strong></li>
                </ul>
            </ModernModal>

            <ModernModal 
                isOpen={!!modalInfo} 
                title={modalInfo?.title} 
                icon={modalInfo?.icon} 
                type={modalInfo?.type}
                onClose={() => { setModalInfo(null); setIsPaused(false); }}
            >
                {modalInfo?.message}
            </ModernModal>

            {questions.map((q, qi) => {
                const qResult = result?.results_detail?.find(d => d.id_cau_hoi === q.id_cau_hoi);
                const isReview = viewMode === 'review';

                return (
                    <div key={q.id_cau_hoi} className="card" style={{ 
                        marginBottom: '1.25rem', boxShadow: 'var(--shadow-sm)',
                        border: isReview ? `1px solid ${qResult?.is_correct ? '#10b981' : '#ef4444'}` : '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Câu {qi + 1}: {q.noi_dung}</p>
                            {isReview && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: qResult?.is_correct ? '#10b981' : '#ef4444', fontWeight: 800, fontSize: '.85rem' }}>
                                    <MI name={qResult?.is_correct ? 'check_circle' : 'cancel'} style={{ fontSize: '1.2rem' }} />
                                    {qResult?.is_correct ? 'Đúng' : 'Sai'}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                            {(q.lua_chon || []).map((opt) => {
                                const sel = answers[q.id_cau_hoi] === opt.id_lua_chon;
                                const isCorrectAnswer = isReview && opt.id_lua_chon === qResult?.correct_choice_id;
                                const isWrongSelection = isReview && sel && !qResult?.is_correct;

                                let border = sel ? 'var(--primary)' : 'var(--border)';
                                let bg = sel ? 'var(--primary-light)' : '#fff';
                                if (isReview) {
                                    if (isCorrectAnswer) {
                                        border = '#10b981';
                                        bg = '#f0fdf4';
                                    } else if (isWrongSelection) {
                                        border = '#ef4444';
                                        bg = '#fef2f2';
                                    } else {
                                        border = 'var(--border)';
                                        bg = '#fff';
                                        if (sel) bg = '#f8fafc';
                                    }
                                }

                                return (
                                    <label key={opt.id_lua_chon} style={{ 
                                        display: 'flex', alignItems: 'center', gap: '.75rem', 
                                        padding: '.8rem 1rem', borderRadius: '12px', 
                                        cursor: isReview ? 'default' : 'pointer', 
                                        border: `2px solid ${border}`, 
                                        background: bg, transition: 'all .2s' 
                                    }}>
                                        <div style={{ 
                                            width: 20, height: 20, borderRadius: '50%', 
                                            border: `2px solid ${sel || isCorrectAnswer ? border : '#cbd5e1'}`, 
                                            background: sel || isCorrectAnswer ? border : '#fff', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                                        }}>
                                            {(sel || isCorrectAnswer) && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                                        </div>
                                        <input 
                                            type="radio" 
                                            name={`q${q.id_cau_hoi}`} 
                                            style={{ display: 'none' }} 
                                            disabled={isReview}
                                            onChange={() => setAnswers(a => ({ ...a, [q.id_cau_hoi]: opt.id_lua_chon }))} 
                                        />
                                        <span style={{ fontSize: '.9rem', fontWeight: sel || isCorrectAnswer ? 700 : 400, flex: 1 }}>{opt.noi_dung}</span>
                                        {isCorrectAnswer && <MI name="check" style={{ color: '#10b981', fontSize: '1.2rem' }} />}
                                        {isWrongSelection && <MI name="close" style={{ color: '#ef4444', fontSize: '1.2rem' }} />}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {viewMode === 'quiz' ? (
                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting}
                    style={{ width: '100%', padding: '1rem', background: allAnswered ? 'var(--primary)' : '#94a3b8', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: allAnswered ? 'pointer' : 'not-allowed', fontSize: '1.1rem', transition: 'all .2s', boxShadow: allAnswered ? '0 10px 20px rgba(139, 107, 79, 0.2)' : 'none' }}
                >
                    {submitting ? 'ĐANG NỘP BÀI...' : allAnswered ? '✅ Nộp bài ngay' : `Vui lòng trả lời đủ ${questions.length} câu`}
                </button>
            ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => { setResult(null); setAnswers({}); setViewMode('quiz'); }}
                        style={{ flex: 1, padding: '1rem', background: '#fff', color: '#1e293b', border: '2px solid #e2e8f0', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Làm lại bài tập
                    </button>
                    <button
                        onClick={onComplete}
                        style={{ flex: 1, padding: '1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Tiếp tục bài học
                    </button>
                </div>
            )}
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
            // Cập nhật lại enrollment để lấy % mới và certificate mới
            const eRes = await api.get('/lms/dang-ky-hoc/');
            const updatedEnroll = (eRes.data || []).find(e => {
                const eid = e.khoa_hoc?.id_khoa_hoc ?? e.id_khoa_hoc;
                return String(eid) === String(courseId);
            });
            setEnrollment(updatedEnroll || null);

            // Kiểm tra xem đã hoàn thành toàn bộ chưa
            const idx = flatLessons.findIndex(l => l.id_bai_giang === currentLesson.id_bai_giang);
            if (idx === flatLessons.length - 1 || updatedEnroll?.phan_tram_hoan_thanh >= 100) {
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
            <div style={{ width: 36, height: 36, border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span>Đang tải bài học...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!enrollment) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
            <div style={{ fontWeight: 600, marginBottom: '.5rem' }}>Bạn chưa đăng ký khóa học này</div>
            <Link to={`/courses/${courseId}`}>
                <button style={{ padding: '.6rem 1.4rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '.75rem', fontWeight: 600 }}>
                    ← Về trang khóa học
                </button>
            </Link>
        </div>
    );

    return (
        <>
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
                        {pct >= 100 && (
                            <button
                                onClick={() => {
                                    const cert = enrollment?.chung_chi?.[0];
                                    if (cert) {
                                        navigate(`/verify/${cert.ma_uuid_chung_chi}`);
                                    } else {
                                        showToast('Chứng chỉ đang được khởi tạo, vui lòng đợi giây lát...', 'info');
                                    }
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: '#fff', border: 'none', padding: '.4rem .8rem',
                                    borderRadius: '8px', fontSize: '.75rem', fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                <span className="material-icons" style={{ fontSize: '1rem' }}>workspace_premium</span>
                                XEM CHỨNG CHỈ
                            </button>
                        )}
                    </div>
                </div>

                {/* ── BODY (Sidebar + Content) ── */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
                                                borderLeft: active ? '4px solid var(--primary)' : '4px solid transparent',
                                                color: locked ? '#475569' : active ? '#fff' : '#cbd5e1', fontSize: '.85rem',
                                                transition: 'all .2s',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <span className="material-icons" style={{
                                                fontSize: '1.2rem',
                                                color: done ? '#10b981' : locked ? '#475569' : active ? 'var(--primary)' : '#64748b'
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

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
                        {!currentLesson ? (
                            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
                                <div style={{ fontWeight: 600 }}>Chọn một bài học để bắt đầu</div>
                            </div>
                        ) : (
                            <div style={{ maxWidth: 820, margin: '0 auto' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.78rem', color: 'var(--text-muted)', marginBottom: '.35rem' }}>
                                        <span>{currentLesson._chapter}</span>
                                        <span>›</span>
                                        <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '.1rem .4rem', borderRadius: '4px', fontWeight: 600 }}>
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

                                {currentLesson.loai_bai === 'Video' && (
                                    <VideoPlayer lesson={currentLesson} onComplete={handleComplete} />
                                )}
                                {(currentLesson.loai_bai === 'TaiLieu' || currentLesson.loai_bai === 'VanBan') && (
                                    <TextViewer lesson={currentLesson} onComplete={handleComplete} />
                                )}
                                {currentLesson.loai_bai === 'Quiz' && (
                                    <QuizViewer lesson={currentLesson} onComplete={handleComplete} />
                                )}

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
                                        style={{ padding: '.65rem 1.2rem', background: currentIdx < flatLessons.length - 1 ? 'var(--primary)' : '#fff', color: currentIdx < flatLessons.length - 1 ? '#fff' : '#cbd1d8', border: '1px solid var(--border)', borderRadius: '10px', cursor: currentIdx < flatLessons.length - 1 ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        Bài tiếp <span className="material-icons" style={{ fontSize: '1.2rem' }}>navigate_next</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Toast ── */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
                    background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? 'var(--primary)' : '#1e293b',
                    color: '#fff', padding: '.75rem 1.25rem', borderRadius: '10px', fontSize: '.875rem',
                    zIndex: 9999, boxShadow: '0 10px 30px rgba(0,0,0,.2)',
                    maxWidth: 360, animation: 'fadeUp .25s ease both',
                }}>
                    {toast.msg}
                </div>
            )}
        </>
    );
};

export default LessonView;
