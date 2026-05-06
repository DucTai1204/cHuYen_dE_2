import React, { useState, useEffect, useCallback } from 'react';

const questions = [
    {
        id: 1, q: 'Trong React, Hook nào được sử dụng để quản lý state trong functional component?',
        opts: [
            { l: 'A', text: 'this.state', sub: 'State được quản lý qua thuộc tính this.state trong class component' },
            { l: 'B', text: 'useState()', sub: 'Hook cho phép thêm state vào functional component', correct: true },
            { l: 'C', text: 'componentDidMount()', sub: 'Lifecycle method được gọi sau khi component được mount' },
            { l: 'D', text: 'props', sub: 'Dữ liệu được truyền từ component cha xuống component con' },
        ]
    },
    {
        id: 2, q: 'HTTP Status Code nào thể hiện yêu cầu thành công?', opts: [
            { l: 'A', text: '404', sub: 'Not Found' },
            { l: 'B', text: '200', sub: 'OK — Yêu cầu thành công', correct: true },
            { l: 'C', text: '500', sub: 'Internal Server Error' },
            { l: 'D', text: '301', sub: 'Moved Permanently' },
        ]
    },
    {
        id: 3, q: 'JWT là viết tắt của?', opts: [
            { l: 'A', text: 'Java Web Token', sub: '' },
            { l: 'B', text: 'JSON Web Token', sub: 'Chuẩn mã thông báo mã hóa JSON', correct: true },
            { l: 'C', text: 'JavaScript Website Transfer', sub: '' },
            { l: 'D', text: 'JSON Website Tokens', sub: '' },
        ]
    },
];

const TOTAL = 16;
const EXAM_SECONDS = 105 * 60 + 32;

const ExamProctoring = () => {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState({});
    const [bookmarks, setBookmarks] = useState(new Set());
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
    const [warnings, setWarnings] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);


    // Timer
    useEffect(() => {
        if (submitted) return;
        const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
        return () => clearInterval(t);
    }, [submitted]);

    // Anti-cheating logic
    useEffect(() => {
        if (submitted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarnings(prev => prev + 1);
                alert("Cảnh báo: Bạn vừa rời khỏi màn hình bài thi. Vi phạm đã được ghi nhận!");
            }
        };

        const handleBlur = () => {
            setWarnings(prev => prev + 1);
            console.warn("User blurred the window");
        };

        const preventActions = (e) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e) => {
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
                e.keyCode === 123 || 
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
                (e.ctrlKey && e.keyCode === 85) ||
                (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 88)) // Ctrl C, V, X
            ) {
                e.preventDefault();
                alert("Hành động bị cấm trong lúc thi!");
                return false;
            }
        };

        // Add listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', preventActions);
        document.addEventListener('copy', preventActions);
        document.addEventListener('paste', preventActions);
        document.addEventListener('cut', preventActions);
        document.addEventListener('keydown', handleKeyDown);

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', preventActions);
            document.removeEventListener('copy', preventActions);
            document.removeEventListener('paste', preventActions);
            document.removeEventListener('cut', preventActions);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [submitted]);


    const fmt = s => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const q = questions[current % questions.length];
    const done = Object.keys(selected).length;
    const undone = TOTAL - done;

    const navColor = (i) => {
        const n = i + 1;
        if (bookmarks.has(n)) return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
        if (selected[n]) return { background: 'var(--secondary)', color: '#fff', border: 'none' };
        return { background: '#f1f5f9', color: 'var(--text-primary)', border: '1px solid var(--border)' };
    };

    if (submitted) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="card" style={{ textAlign: 'center', maxWidth: 480, width: '100%', padding: '3rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ marginBottom: '.5rem' }}>Nộp bài thành công!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Hệ thống đang chấm điểm và phát hành Chứng chỉ số Blockchain...</p>
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', color: 'var(--secondary)', fontWeight: 500 }}>
                    ✅ Kết quả sẽ gửi qua email trong vài phút
                </div>
            </div>
        </div>
    );

    return (
        <div className="fade-up">
            {/* Exam Header */}
            <div className="exam-header" style={{ marginBottom: '1.5rem', background: 'var(--secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.75rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '.65rem' }}>MÔI TRƯỜNG MÔ PHỎNG AI</span>
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '.25rem' }}>Kỳ thi cuối kỳ – Lập trình Web Fullstack</h2>
                        <div style={{ fontSize: '.82rem', opacity: .85 }}>Thời gian: 120 phút &nbsp;|&nbsp; Số câu: {TOTAL} câu</div>
                    </div>
                    <div className="exam-timer" style={{ background: 'rgba(0,0,0,0.2)' }}>⏱ {fmt(timeLeft)}</div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', opacity: .9, marginBottom: '.5rem' }}>
                        <span>Tiến độ bài làm: {done}/{TOTAL} câu</span>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <span style={{ fontWeight: 700 }}>{Math.round((done / TOTAL) * 100)}%</span>
                        </div>
                    </div>
                    <div className="progress-wrap" style={{ background: 'rgba(255,255,255,0.15)', height: 8, borderRadius: 'var(--r-full)' }}>
                        <div className="progress-bar" style={{ background: '#fff', width: `${(done / TOTAL) * 100}%`, borderRadius: 'var(--r-full)' }} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
                {/* Question */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '.9rem' }}>Câu hỏi {current + 1}</span>
                            <button
                                className="badge"
                                style={{ ...(bookmarks.has(current + 1) ? { background: '#fef3c7', color: '#92400e' } : { background: '#f1f5f9', color: 'var(--text-secondary)' }), cursor: 'pointer', border: 'none' }}
                                onClick={() => setBookmarks(b => { const nb = new Set(b); nb.has(current + 1) ? nb.delete(current + 1) : nb.add(current + 1); return nb; })}
                            >⭐ {bookmarks.has(current + 1) ? 'Đã đánh dấu' : 'Đánh dấu'}</button>
                        </div>
                        <p style={{ fontWeight: 500, marginBottom: '1.25rem', lineHeight: 1.6 }}>{q.q}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                            {q.opts.map(opt => {
                                const sel = selected[current + 1] === opt.l;
                                return (
                                    <label key={opt.l} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '.75rem',
                                        padding: '.75rem 1rem', borderRadius: 'var(--r-md)', cursor: 'pointer',
                                        border: `1px solid ${sel ? 'var(--primary)' : 'var(--border)'}`,
                                        background: sel ? 'var(--primary-light)' : 'var(--bg-white)',
                                        transition: 'var(--t)'
                                    }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sel ? 'var(--primary)' : 'var(--border)'}`,
                                            background: sel ? 'var(--primary)' : '#fff',
                                            flexShrink: 0, marginTop: 2,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                                        </div>
                                        <input type="radio" name={`q${current}`} style={{ display: 'none' }}
                                            onChange={() => setSelected(s => ({ ...s, [current + 1]: opt.l }))} />
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '.875rem' }}>{opt.l}. {opt.text}</div>
                                            {opt.sub && <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '.15rem' }}>{opt.sub}</div>}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '.85rem' }}>Điều hướng câu hỏi</span>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '.72rem', color: 'var(--text-muted)' }}>
                                <span>🟩 Đã làm</span><span>⬜ Chưa làm</span><span>🟨 Đánh dấu</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1rem' }}>
                            {Array.from({ length: TOTAL }, (_, i) => (
                                <button key={i} onClick={() => setCurrent(i)}
                                    style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', fontWeight: 600, cursor: 'pointer', fontSize: '.8rem', ...navColor(i), outline: current === i ? '2px solid var(--primary)' : 'none' }}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-secondary" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>‹ Câu trước</button>
                            <div style={{ display: 'flex', gap: '.5rem' }}>
                                <button className="btn btn-secondary"
                                    onClick={() => setBookmarks(b => { const nb = new Set(b); nb.has(current + 1) ? nb.delete(current + 1) : nb.add(current + 1); return nb; })}>
                                    ⭐ Đánh dấu
                                </button>
                                {current < TOTAL - 1
                                    ? <button className="btn btn-primary" onClick={() => setCurrent(c => Math.min(TOTAL - 1, c + 1))}>Câu tiếp ›</button>
                                    : <button className="btn btn-primary" onClick={() => setSubmitted(true)}>✅ Nộp bài</button>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Monitor Panel */}
                <div style={{ position: 'sticky', top: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: .75 + 'rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '.875rem' }}>🛡️ AI Giám sát</span>
                            <span className="badge badge-green">● Hoạt động</span>
                        </div>
                        <p style={{ fontSize: '.78rem', color: 'var(--text-secondary)', marginBottom: '.75rem' }}>Hệ thống đang giám sát trực tiếp bài thi của bạn</p>

                        <div className="camera-mock" style={{ marginBottom: '1rem' }}>
                            <div className="cam-icon">📷</div>
                            <span>Camera đang hoạt động</span>
                            <span style={{ fontSize: '.72rem' }}>Đảm bảo khuôn mặt bạn luôn hiện rõ</span>
                        </div>

                        {[
                            { label: 'Phát hiện khuôn mặt', sub: '1 khuôn mặt · An toàn', status: '✅' },
                            { label: 'Theo dõi ánh mắt', sub: 'Nhìn vào màn hình', status: '✅' },
                            { label: 'Kiểm tra âm thanh', sub: 'Không phát hiện tiếng nói', status: '✅' },
                            { label: 'Cửa sổ trình duyệt', sub: isFullscreen ? 'Đang ở chế độ toàn màn hình' : 'CẢNH BÁO: Không ở toàn màn hình', status: isFullscreen ? '✅' : '⚠️' },
                        ].map((it, i) => (
                            <div key={i} className="check-item" style={{ marginBottom: '.4rem' }}>
                                <span className="check-icon">{it.status}</span>
                                <div>
                                    <div className="check-item-title" style={{ color: it.status === '⚠️' ? 'var(--danger)' : 'inherit' }}>{it.label}</div>
                                    <div className="check-item-sub">{it.sub}</div>
                                </div>
                            </div>
                        ))}
                        {!isFullscreen && (
                            <button 
                                className="btn btn-secondary btn-full" 
                                style={{ marginTop: '.5rem', fontSize: '.75rem', padding: '.5rem', background: '#fff', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                                onClick={() => document.documentElement.requestFullscreen().catch(e => console.error(e))}
                            >
                                🖥️ Bật chế độ toàn màn hình
                            </button>
                        )}
                    </div>

                    <div className="card">
                        <h4 style={{ fontWeight: 700, fontSize: '.875rem', marginBottom: .75 + 'rem' }}>Thống kê bài thi</h4>
                        <div className="grid-2" style={{ gap: '.5rem' }}>
                            {[
                                { l: 'Số câu đã làm', v: `${done}/40`, vc: 'var(--primary)' },
                                { l: 'Thời gian còn lại', v: fmt(timeLeft), vc: 'var(--primary)' },
                                { l: 'Vi phạm', v: `${warnings}`, vc: 'var(--danger)' },
                                { l: 'Cảnh báo', v: '0', vc: 'var(--warning)' },
                            ].map((s, i) => (
                                <div key={i} style={{ background: 'var(--bg-app)', borderRadius: 'var(--r-sm)', padding: '.5rem .75rem' }}>
                                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{s.l}</div>
                                    <div style={{ fontWeight: 700, fontSize: '.95rem', color: s.vc }}>{s.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="btn btn-primary btn-full btn-lg" onClick={() => setSubmitted(true)}>
                        ✈️ Nộp bài và nhận chứng chỉ
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--text-muted)' }}>
                        Bạn có thể nộp bài bất kỳ lúc nào. Hệ thống sẽ tự động chấm điểm và cấp chứng chỉ nếu đạt yêu cầu.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExamProctoring;
