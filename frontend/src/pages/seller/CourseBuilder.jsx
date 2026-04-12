import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

/* ══════════════════════════════════════════════════════════════
   ICONS & HELPERS
══════════════════════════════════════════════════════════════ */
const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1rem', ...style }}>{name}</span>;

const typeIcon = (t) => ({ Video: 'play_circle', Quiz: 'quiz', TaiLieu: 'description', VanBan: 'article' }[t] || 'play_circle');
const typeLabel = (t) => ({ Video: 'Video', Quiz: 'Quiz', TaiLieu: 'Tài liệu', VanBan: 'Văn bản' }[t] || 'Video');

const SELLER_ORANGE = '#d97706';
const SELLER_ORANGE_LIGHT = '#fef3c7';
const SELLER_ORANGE_DARK = '#b45309';

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════════
   TAB: NỘI DUNG KHÓA HỌC
   Left: Chapter Tree   |   Right: Lesson Editor
══════════════════════════════════════════════════════════════ */

/* ── Lesson Row ── */
const LessonRow = ({ lesson, isSelected, onClick, onDelete }) => (
    <div
        onClick={() => onClick(lesson)}
        style={{
            display: 'flex', alignItems: 'center', gap: '.5rem',
            padding: '.4rem .75rem .4rem 2.25rem',
            borderRadius: '6px', cursor: 'pointer',
            background: isSelected ? SELLER_ORANGE_LIGHT : 'transparent',
            border: isSelected ? `1px solid #fcd34d` : '1px solid transparent',
            transition: 'all .15s', marginBottom: '.15rem',
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
    >
        <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', width: 16, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <MI name={typeIcon(lesson.loai_bai)} style={{ fontSize: '.9rem' }} />
        </span>
        <span style={{
            flex: 1, fontSize: '.82rem',
            fontWeight: isSelected ? 600 : 400,
            color: isSelected ? SELLER_ORANGE_DARK : 'var(--text-primary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
            {lesson.ten_bai_giang || 'Bài chưa đặt tên'}
        </span>
        {lesson.la_xem_truoc && (
            <span style={{ fontSize: '.65rem', background: '#ecfdf5', color: '#059669', padding: '.1rem .4rem', borderRadius: '99px', fontWeight: 600 }}>FREE</span>
        )}
        <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
            {lesson.thoi_luong_phut > 0 ? `${lesson.thoi_luong_phut}p` : ''}
        </span>
        <button
            onClick={e => { e.stopPropagation(); onDelete(lesson.id_bai_giang); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', opacity: 0, fontSize: '.75rem', padding: '.15rem', borderRadius: '4px', transition: 'opacity .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >✕</button>
    </div>
);

/* ── Chapter Block ── */
const ChapterBlock = ({ chapter, selectedLesson, onSelectLesson, onDeleteLesson, onAddLesson, onDeleteChapter, onRenameChapter }) => {
    const [open, setOpen] = useState(true);
    const [renaming, setRenaming] = useState(false);
    const [name, setName] = useState(chapter.ten_chuong);

    const saveRename = () => { if (name.trim()) { onRenameChapter(chapter.id_chuong, name); } setRenaming(false); };

    return (
        <div style={{ marginBottom: '.35rem' }}>
            {/* Chapter Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '.3rem',
                padding: '.5rem .6rem', background: 'var(--bg-app)',
                borderRadius: '6px', userSelect: 'none',
            }}>
                <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '.7rem', padding: '.1rem', width: 16, flexShrink: 0 }}>
                    {open ? '▼' : '▶'}
                </button>
                {renaming ? (
                    <input
                        autoFocus value={name} onChange={e => setName(e.target.value)}
                        onBlur={saveRename} onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setRenaming(false); }}
                        style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '4px', padding: '.2rem .4rem', fontSize: '.82rem', outline: 'none', fontFamily: 'inherit' }}
                    />
                ) : (
                    <span
                        onDoubleClick={() => setRenaming(true)}
                        title="Double-click để đổi tên"
                        style={{ flex: 1, fontWeight: 600, fontSize: '.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                    >
                        <MI name="folder" style={{ fontSize: '.9rem', color: '#d97706', marginRight: '.2rem' }} /> {chapter.ten_chuong}
                    </span>
                )}
                <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {(chapter.bai_giang || []).length} bài
                </span>
                <button onClick={() => onAddLesson(chapter.id_chuong)} title="Thêm bài" style={{ background: 'none', border: 'none', cursor: 'pointer', color: SELLER_ORANGE, fontSize: '.9rem', padding: '.1rem .2rem' }}>＋</button>
                <button onClick={() => onDeleteChapter(chapter.id_chuong)} title="Xóa chương" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '.75rem', opacity: .5, padding: '.1rem', display: 'flex', alignItems: 'center' }}><MI name="delete" style={{ fontSize: '1rem' }} /></button>
            </div>
            {/* Lessons */}
            {open && (
                <div style={{ paddingTop: '.15rem' }}>
                    {(chapter.bai_giang || []).length === 0 ? (
                        <div style={{ paddingLeft: '2.25rem', paddingTop: '.25rem', fontSize: '.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Chưa có bài giảng — nhấn ＋ để thêm
                        </div>
                    ) : (
                        (chapter.bai_giang || []).map(l => (
                            <LessonRow
                                key={l.id_bai_giang} lesson={l}
                                isSelected={selectedLesson?.id_bai_giang === l.id_bai_giang}
                                onClick={onSelectLesson} onDelete={onDeleteLesson}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

/* ── Quiz Editor ── */
const QuizEditor = ({ lesson, onUpdate }) => {
    const [questions, setQuestions] = useState(lesson.cau_hoi || []);
    const [loading, setLoading] = useState(false);

    // Đồng bộ khi lesson thay đổi
    useEffect(() => { setQuestions(lesson.cau_hoi || []); }, [lesson.id_bai_giang]);

    const addQuestion = async () => {
        try {
            const res = await api.post('/lms/cau-hoi/', {
                id_bai_giang: lesson.id_bai_giang,
                noi_dung: 'Tên câu hỏi mới?',
                diem: 1,
                thu_tu: questions.length + 1
            });
            const newQs = [...questions, { ...res.data, lua_chon: [] }];
            setQuestions(newQs);
            onUpdate(newQs);
        } catch (e) { alert('Lỗi thêm câu hỏi'); }
    };

    const deleteQuestion = async (qId) => {
        if (!window.confirm('Xóa câu hỏi này?')) return;
        try {
            await api.delete(`/lms/cau-hoi/${qId}/`);
            const newQs = questions.filter(q => q.id_cau_hoi !== qId);
            setQuestions(newQs);
            onUpdate(newQs);
        } catch (e) { alert('Lỗi xóa câu hỏi'); }
    };

    const updateQuestion = async (qId, data) => {
        try {
            const res = await api.patch(`/lms/cau-hoi/${qId}/`, data);
            const newQs = questions.map(q => q.id_cau_hoi === qId ? { ...q, ...res.data } : q);
            setQuestions(newQs);
            onUpdate(newQs);
        } catch (e) { }
    };

    const addChoice = async (qId) => {
        try {
            const res = await api.post('/lms/lua-chon/', {
                id_cau_hoi: qId,
                noi_dung: 'Lựa chọn mới',
                la_dap_an_dung: false
            });
            const newQs = questions.map(q => {
                if (q.id_cau_hoi === qId) {
                    return { ...q, lua_chon: [...(q.lua_chon || []), res.data] };
                }
                return q;
            });
            setQuestions(newQs);
            onUpdate(newQs);
        } catch (e) { }
    };

    const deleteChoice = async (qId, cId) => {
        try {
            await api.delete(`/lms/lua-chon/${cId}/`);
            const newQs = questions.map(q => {
                if (q.id_cau_hoi === qId) {
                    return { ...q, lua_chon: q.lua_chon.filter(c => c.id_lua_chon !== cId) };
                }
                return q;
            });
            setQuestions(newQs);
            onUpdate(newQs);
        } catch (e) { }
    };

    const setCorrectChoice = async (qId, cId) => {
        // Một câu hỏi chỉ có 1 đáp án đúng (tạm thời)
        const q = questions.find(x => x.id_cau_hoi === qId);
        if (!q) return;

        try {
            // Backend update cho tất cả các choices của câu hỏi này
            // Nhưng để đơn giản, ta lặp qua update từng cái hoặc check logic
            // Ở đây ta đơn giản là patch cái được chọn thành true, những cái khác thành false
            await Promise.all(q.lua_chon.map(c => {
                return api.patch(`/lms/lua-chon/${c.id_lua_chon}/`, { la_dap_an_dung: c.id_lua_chon === cId });
            }));

            const newQs = questions.map(x => {
                if (x.id_cau_hoi === qId) {
                    return {
                        ...x,
                        lua_chon: x.lua_chon.map(c => ({ ...c, la_dap_an_dung: c.id_lua_chon === cId }))
                    };
                }
                return x;
            });
            setQuestions(newQs);
            onUpdate(newQs);
        } catch (e) { }
    };

    const updateChoiceContent = async (qId, cId, text) => {
        try {
            await api.patch(`/lms/lua-chon/${cId}/`, { noi_dung: text });
            const newQs = questions.map(q => {
                if (q.id_cau_hoi === qId) {
                    return { ...q, lua_chon: q.lua_chon.map(c => c.id_lua_chon === cId ? { ...c, noi_dung: text } : c) };
                }
                return q;
            });
            setQuestions(newQs);
            onUpdate(newQs);
        } catch (e) { }
    }

    return (
        <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                <h4 style={{ fontSize: '.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                    <MI name="quiz" style={{ color: SELLER_ORANGE }} /> Danh sách câu hỏi ({questions.length})
                </h4>
                <button onClick={addQuestion} style={{ padding: '.3rem .6rem', background: SELLER_ORANGE_LIGHT, color: SELLER_ORANGE_DARK, border: `1px solid ${SELLER_ORANGE}`, borderRadius: '6px', fontSize: '.7rem', fontWeight: 700, cursor: 'pointer' }}>
                    + Thêm câu hỏi
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {questions.map((q, idx) => (
                    <div key={q.id_cau_hoi} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '.75rem' }}>
                        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem' }}>
                            <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-muted)', paddingTop: '.4rem' }}>#{idx+1}</span>
                            <div style={{flex: 1}}>
                                <textarea 
                                    className="form-input" 
                                    rows={2} 
                                    value={q.noi_dung} 
                                    onChange={e => updateQuestion(q.id_cau_hoi, { noi_dung: e.target.value })}
                                    style={{ fontSize: '.82rem', padding: '.4rem', marginBottom: '.4rem' }}
                                    placeholder="Nội dung câu hỏi..."
                                />
                                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                    <div style={{fontSize: '.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '.2rem'}}>
                                        Điểm: <input type="number" value={q.diem} onChange={e => updateQuestion(q.id_cau_hoi, {diem: parseInt(e.target.value)||0})} style={{width: 40, border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'center', fontSize: '.75rem'}} />
                                    </div>
                                    <button onClick={() => deleteQuestion(q.id_cau_hoi)} style={{marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--danger)', fontSize: '.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.1rem'}}>
                                        <MI name="delete" style={{fontSize: '.9rem'}} /> Xóa câu hỏi
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Choices list */}
                        <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                            {(q.lua_chon || []).map((c, cidx) => (
                                <div key={c.id_lua_chon} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <input 
                                        type="radio" 
                                        name={`q-${q.id_cau_hoi}`} 
                                        checked={c.la_dap_an_dung} 
                                        onChange={() => setCorrectChoice(q.id_cau_hoi, c.id_lua_chon)}
                                        style={{ accentColor: '#10b981', cursor: 'pointer' }}
                                    />
                                    <input 
                                        className="form-input"
                                        value={c.noi_dung}
                                        onChange={e => updateChoiceContent(q.id_cau_hoi, c.id_lua_chon, e.target.value)}
                                        style={{ fontSize: '.78rem', padding: '.3rem .5rem', flex: 1 }}
                                        placeholder="Nội dung lựa chọn..."
                                    />
                                    <button onClick={() => deleteChoice(q.id_cau_hoi, c.id_lua_chon)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>✕</button>
                                </div>
                            ))}
                            <button onClick={() => addChoice(q.id_cau_hoi)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: SELLER_ORANGE, fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', marginTop: '.2rem' }}>+ Thêm phương án</button>
                        </div>
                    </div>
                ))}
                {questions.length === 0 && <div style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '.75rem', padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px dashed var(--border)'}}>Chưa có câu hỏi nào.</div>}
            </div>
        </div>
    );
};

/* ── Lesson Editor Panel ── */
const LessonEditor = ({ lesson, onSave, onClose }) => {
    const [form, setForm] = useState({ ...lesson });
    const [saving, setSaving] = useState(false);

    useEffect(() => { setForm({ ...lesson }); }, [lesson?.id_bai_giang]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const save = async () => {
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Editor Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: '.2rem' }}>Đang chỉnh sửa</div>
                    <h3 style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text-primary)' }}>
                        <MI name={typeIcon(form.loai_bai)} style={{ fontSize: '1.1rem' }} /> {typeLabel(form.loai_bai)}
                    </h3>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '.5rem' }}>
                {/* Tên bài */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tên bài giảng *</label>
                    <input className="form-input" value={form.ten_bai_giang || ''} onChange={e => set('ten_bai_giang', e.target.value)} placeholder="VD: Bài 1: Giới thiệu React Hooks" />
                </div>

                {/* Loại bài */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Loại nội dung</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.5rem' }}>
                        {[
                            { val: 'Video', icon: 'play_circle', label: 'Video' },
                            { val: 'Quiz', icon: 'quiz', label: 'Quiz' },
                            { val: 'TaiLieu', icon: 'description', label: 'Tài liệu' },
                            { val: 'VanBan', icon: 'article', label: 'Văn bản' },
                        ].map(t => (
                            <button
                                key={t.val}
                                onClick={() => set('loai_bai', t.val)}
                                style={{
                                    padding: '.5rem .25rem', border: `2px solid ${form.loai_bai === t.val ? SELLER_ORANGE : 'var(--border)'}`,
                                    borderRadius: '8px', background: form.loai_bai === t.val ? SELLER_ORANGE_LIGHT : 'transparent',
                                    cursor: 'pointer', fontSize: '.75rem', fontWeight: form.loai_bai === t.val ? 700 : 400,
                                    color: form.loai_bai === t.val ? SELLER_ORANGE_DARK : 'var(--text-secondary)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.2rem', transition: 'all .15s',
                                }}
                            >
                                <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center' }}><MI name={t.icon} style={{ fontSize: '1.1rem' }} /></span>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* URL */}
                {(form.loai_bai === 'Video' || form.loai_bai === 'TaiLieu') && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                            {form.loai_bai === 'Video' ? 'URL Video (YouTube / Drive / Vimeo)' : 'URL Tài liệu (PDF / Drive)'}
                        </label>
                        <input className="form-input" value={form.noi_dung_url || ''} onChange={e => set('noi_dung_url', e.target.value)}
                            placeholder={form.loai_bai === 'Video' ? 'https://youtube.com/watch?v=...' : 'https://drive.google.com/...'} />
                    </div>
                )}

                {/* Nội dung văn bản */}
                {form.loai_bai === 'VanBan' && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Nội dung văn bản</label>
                        <textarea className="form-input" rows={6} value={form.noi_dung_url || ''} onChange={e => set('noi_dung_url', e.target.value)}
                            placeholder="Nhập nội dung bài học tại đây..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                )}

                {/* Quiz Editor */}
                {form.loai_bai === 'Quiz' && (
                    <QuizEditor lesson={form} onUpdate={(newQs) => set('cau_hoi', newQs)} />
                )}

                {/* Thời lượng & Thứ tự */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Thời lượng (phút)</label>
                        <input type="number" className="form-input" value={form.thoi_luong_phut || 0} onChange={e => set('thoi_luong_phut', parseInt(e.target.value) || 0)} min={0} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Thứ tự</label>
                        <input type="number" className="form-input" value={form.thu_tu || 1} onChange={e => set('thu_tu', parseInt(e.target.value) || 1)} min={1} />
                    </div>
                </div>

                {/* Xem trước & Điều kiện hoàn thành */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <input type="checkbox" id="preview-check" checked={!!form.la_xem_truoc} onChange={e => set('la_xem_truoc', e.target.checked)} style={{ width: 16, height: 16, accentColor: SELLER_ORANGE, cursor: 'pointer' }} />
                        <div>
                            <label htmlFor="preview-check" style={{ fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                                <MI name="visibility" style={{ fontSize: '1rem', color: '#059669' }} /> Cho phép xem trước miễn phí
                            </label>
                            <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Học viên có thể xem bài này khi chưa đăng ký</span>
                        </div>
                    </div>

                    {form.loai_bai === 'Video' && (
                        <div style={{ padding: '.75rem', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <label className="form-label" style={{ marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}><MI name="flag" style={{ fontSize: '1rem', color: SELLER_ORANGE }} /> Điều kiện hoàn thành Video</label>
                            <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '.5rem' }}>Phần trăm thời lượng bắt buộc phải xem để đánh dấu hoàn thành</span>
                            <div style={{ display: 'flex', gap: '.5rem' }}>
                                {[33, 66, 100].map(pct => (
                                    <button
                                        key={pct}
                                        onClick={() => set('video_watch_percentage', pct)}
                                        style={{
                                            flex: 1, padding: '.4rem', border: `1px solid ${form.video_watch_percentage === pct || (!form.video_watch_percentage && pct === 100) ? SELLER_ORANGE : 'var(--border)'}`,
                                            background: form.video_watch_percentage === pct || (!form.video_watch_percentage && pct === 100) ? SELLER_ORANGE_LIGHT : '#fff', borderRadius: '6px',
                                            cursor: 'pointer', fontSize: '.82rem', fontWeight: 600, color: form.video_watch_percentage === pct || (!form.video_watch_percentage && pct === 100) ? SELLER_ORANGE_DARK : 'var(--text-secondary)'
                                        }}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: '1rem' }}>
                <button
                    onClick={save} disabled={saving}
                    style={{
                        width: '100%', padding: '.7rem', background: SELLER_ORANGE, color: '#fff',
                        border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                        fontSize: '.9rem', opacity: saving ? .7 : 1, transition: 'all .18s',
                    }}
                >
                    {saving ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="hourglass_empty" style={{ fontSize: '1rem' }} /> Đang lưu...</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="save" style={{ fontSize: '1rem' }} /> Lưu bài giảng</span>}
                </button>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   TAB: THIẾT LẬP KHÓA HỌC
══════════════════════════════════════════════════════════════ */
const SettingsTab = ({ course, onUpdate, showToast }) => {
    const [form, setForm] = useState({
        ten_khoa_hoc: course.ten_khoa_hoc || '',
        mo_ta_ngan: course.mo_ta_ngan || '',
        mo_ta_chi_tiet: course.mo_ta_chi_tiet || '',
        danh_muc: course.danh_muc || '',
        trinh_do: course.trinh_do || 'CoSo',
        gia_tien: course.gia_tien || '',
        gia_goc: course.gia_goc || '',
        hinh_anh_thumbnail: course.hinh_anh_thumbnail || '',
        url_video_preview: course.url_video_preview || '',
        is_sequential: course.is_sequential || false,
    });
    const [saving, setSaving] = useState(false);
    const [previewingVideo, setPreviewingVideo] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    /* Helper: trích xuất embed URL */
    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('/embed/')) return url.split('?')[0] + '?autoplay=1&rel=0';
        const watchMatch = url.match(/[?&]v=([^&#]+)/);
        if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
        const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
        if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
        return null;
    };

    /* Reset preview khi URL thay đổi */
    const handleVideoUrlChange = (val) => {
        setPreviewingVideo(false);
        set('url_video_preview', val);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.patch(`/lms/khoa-hoc/${course.id_khoa_hoc}/`, {
                ...form,
                gia_tien: parseFloat(form.gia_tien) || 0,
                gia_goc: parseFloat(form.gia_goc) || 0,
            });
            onUpdate(res.data);
            showToast('✅ Đã lưu thông tin khóa học');
        } catch {
            showToast('❌ Lỗi khi lưu', 'error');
        } finally {
            setSaving(false);
        }
    };

    const DANH_MUC = ['Lập trình', 'Thiết kế', 'Marketing', 'Kinh doanh', 'Ngoại ngữ', 'Khoa học dữ liệu', 'Khác'];

    return (
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {/* Section: Thông tin cơ bản */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <MI name="list_alt" style={{ fontSize: '1.1rem', color: 'var(--primary)' }} /> Thông tin cơ bản
                </h3>

                <div className="form-group">
                    <label className="form-label">Tên khóa học *</label>
                    <input className="form-input" value={form.ten_khoa_hoc} onChange={e => set('ten_khoa_hoc', e.target.value)} placeholder="Tên khóa học..." />
                </div>

                <div className="form-group">
                    <label className="form-label">Mô tả ngắn <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({form.mo_ta_ngan.length}/200)</span></label>
                    <input className="form-input" value={form.mo_ta_ngan} onChange={e => set('mo_ta_ngan', e.target.value)} maxLength={200} placeholder="Hiển thị ở trang giới thiệu..." />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Mô tả chi tiết</label>
                    <textarea className="form-input" rows={5} value={form.mo_ta_chi_tiet} onChange={e => set('mo_ta_chi_tiet', e.target.value)}
                        placeholder="Mô tả đầy đủ về khóa học: nội dung, đối tượng, kết quả đạt được..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
            </div>

            {/* Section: Phân loại & Giá */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <MI name="label" style={{ fontSize: '1.1rem', color: SELLER_ORANGE }} /> Phân loại &amp; Giá bán
                </h3>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Danh mục</label>
                        <select className="form-input" value={form.danh_muc} onChange={e => set('danh_muc', e.target.value)}>
                            {DANH_MUC.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Trình độ</label>
                        <select className="form-input" value={form.trinh_do} onChange={e => set('trinh_do', e.target.value)}>
                            <option value="CoSo">Cơ sở (Beginner)</option>
                            <option value="TrungCap">Trung cấp (Intermediate)</option>
                            <option value="NangCao">Nâng cao (Advanced)</option>
                        </select>
                    </div>
                </div>

                <div className="grid-2" style={{ marginBottom: 0 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Giá bán (₫)</label>
                        <input type="number" className="form-input" value={form.gia_tien} onChange={e => set('gia_tien', e.target.value)} placeholder="0" min={0} />
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>Nhập 0 để miễn phí</div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Giá gốc / So sánh (₫)</label>
                        <input type="number" className="form-input" value={form.gia_goc} onChange={e => set('gia_goc', e.target.value)} placeholder="0" min={0} />
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>Dùng để hiển thị % giảm giá</div>
                    </div>
                </div>
            </div>

            {/* Section: Quy tắc học tập */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <MI name="settings" style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }} /> Quy tắc học tập
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', padding: '1rem', background: form.is_sequential ? '#eff6ff' : 'var(--bg-app)', borderRadius: '8px', border: `1px solid ${form.is_sequential ? '#bfdbfe' : 'var(--border)'}`, transition: 'all .2s' }}>
                    <input type="checkbox" id="seq-check" checked={form.is_sequential} onChange={e => set('is_sequential', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: 'pointer', marginTop: '.15rem' }} />
                    <div>
                        <label htmlFor="seq-check" style={{ fontSize: '.9rem', fontWeight: 600, color: form.is_sequential ? '#1e40af' : 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.3rem', marginBottom: '.25rem' }}>
                            <MI name="link" style={{ fontSize: '1rem' }} /> Bật chế độ Học tuần tự
                        </label>
                        <p style={{ fontSize: '.8rem', color: form.is_sequential ? '#3b82f6' : 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                            Khi bật, học viên bắt buộc phải <strong>hoàn thành bài học trước</strong> thì mới được phép mở khóa bài học tiếp theo. Đây là tính năng hữu ích để đảm bảo học viên không bỏ sót kiến thức.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section: Hình ảnh */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <MI name="image" style={{ fontSize: '1.1rem', color: 'var(--primary)' }} /> Hình ảnh Thumbnail
                </h3>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">URL Ảnh bìa</label>
                    <input className="form-input" value={form.hinh_anh_thumbnail} onChange={e => set('hinh_anh_thumbnail', e.target.value)} placeholder="https://images.unsplash.com/..." />
                </div>

                {form.hinh_anh_thumbnail && (
                    <div style={{ width: '100%', maxWidth: 320, aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={form.hinh_anh_thumbnail} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                )}
            </div>

            {/* Section: Video Preview */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <MI name="play_circle" style={{ fontSize: '1.1rem', color: '#dc2626' }} /> Video Preview khóa học
                </h3>
                <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Video giới thiệu ngắn (~2-5 phút) được hiển thị ở trang chi tiết khóa học. Hỗ trợ link YouTube dạng <code>watch?v=</code>, <code>youtu.be/</code> hoặc <code>/embed/</code>.
                </p>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">URL Video Preview (YouTube)</label>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                        <input
                            className="form-input"
                            value={form.url_video_preview}
                            onChange={e => handleVideoUrlChange(e.target.value)}
                            placeholder="https://youtube.com/watch?v=... hoặc https://youtu.be/..."
                            style={{ flex: 1 }}
                        />
                        {form.url_video_preview && getEmbedUrl(form.url_video_preview) && (
                            <button
                                type="button"
                                onClick={() => setPreviewingVideo(v => !v)}
                                style={{
                                    padding: '.4rem .9rem', flexShrink: 0,
                                    background: previewingVideo ? '#fef2f2' : SELLER_ORANGE_LIGHT,
                                    color: previewingVideo ? '#dc2626' : SELLER_ORANGE_DARK,
                                    border: `1px solid ${previewingVideo ? '#fecaca' : '#fcd34d'}`,
                                    borderRadius: '7px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: '.3rem',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <MI name={previewingVideo ? 'stop' : 'play_arrow'} style={{ fontSize: '1rem' }} />
                                {previewingVideo ? 'Dừng xem' : 'Xem thử'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Video Player Preview */}
                {form.url_video_preview && getEmbedUrl(form.url_video_preview) && (
                    <div style={{ maxWidth: 560, borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--border)', background: '#0f172a', aspectRatio: '16/9', position: 'relative' }}>
                        {previewingVideo ? (
                            <iframe
                                src={getEmbedUrl(form.url_video_preview)}
                                title="Preview video"
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div
                                onClick={() => setPreviewingVideo(true)}
                                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.6rem', cursor: 'pointer', color: '#fff' }}
                            >
                                {form.hinh_anh_thumbnail && (
                                    <img src={form.hinh_anh_thumbnail?.replace('maxresdefault.jpg', 'hqdefault.jpg')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .4 }} onError={e => e.target.style.display = 'none'} />
                                )}
                                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                                    <div style={{ width: 56, height: 56, background: 'rgba(220,38,38,.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 4px 16px rgba(220,38,38,.5)' }}>
                                        ▶
                                    </div>
                                    <span style={{ fontSize: '.8rem', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,.7)' }}>Nhấn để xem trước</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {form.url_video_preview && !getEmbedUrl(form.url_video_preview) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.6rem .75rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                        <MI name="error" style={{ color: '#dc2626', fontSize: '1rem' }} />
                        <span style={{ fontSize: '.8rem', color: '#dc2626', fontWeight: 500 }}>URL không hợp lệ. Vui lòng dùng link YouTube.</span>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave} disabled={saving}
                style={{
                    padding: '.75rem 2rem', background: SELLER_ORANGE, color: '#fff',
                    border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                    fontSize: '.95rem', opacity: saving ? .7 : 1,
                }}
            >
                {saving ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="hourglass_empty" style={{ fontSize: '1rem' }} /> Đang lưu...</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="save" style={{ fontSize: '1rem' }} /> Lưu thay đổi</span>}
            </button>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   TAB: HỌC VIÊN
══════════════════════════════════════════════════════════════ */
const StudentsTab = ({ courseId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/lms/dang-ky-hoc/?khoa_hoc=${courseId}`)
            .then(res => setStudents(res.data || []))
            .catch(() => setStudents([]))
            .finally(() => setLoading(false));
    }, [courseId]);

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Đang tải...</div>;

    if (students.length === 0) return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <MI name="groups" style={{ fontSize: '3rem', color: '#cbd5e1' }} />
            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '.5rem', marginTop: '1rem' }}>Chưa có học viên</div>
            <div style={{ fontSize: '.875rem' }}>Hãy đăng bán khóa học để thu hút học viên!</div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '1rem', fontSize: '.875rem', color: 'var(--text-secondary)' }}>
                Tổng cộng <strong>{students.length}</strong> học viên đã đăng ký
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-app)' }}>
                            {['Học viên', 'Tiến độ', 'Trạng thái', 'Ngày đăng ký'].map((h, i) => (
                                <th key={i} style={{ padding: '.6rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id_dang_ky} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '.75rem 1rem', fontSize: '.875rem', fontWeight: 500 }}>
                                    {s.ho_va_ten || s.ten_hoc_vien || `HV #${s.id_nguoi_dung}`}
                                </td>
                                <td style={{ padding: '.75rem 1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                        <div style={{ flex: 1, height: 6, background: 'var(--bg-app)', borderRadius: '99px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${s.phan_tram_hoan_thanh || 0}%`, background: SELLER_ORANGE, borderRadius: '99px' }} />
                                        </div>
                                        <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>{Math.round(s.phan_tram_hoan_thanh || 0)}%</span>
                                    </div>
                                </td>
                                <td style={{ padding: '.75rem 1rem' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.2rem .6rem',
                                        borderRadius: '99px', fontSize: '.72rem', fontWeight: 600,
                                        background: s.trang_thai_hoc === 'DaXong' ? '#ecfdf5' : s.trang_thai_hoc === 'Huy' ? '#fef2f2' : '#eff6ff',
                                        color: s.trang_thai_hoc === 'DaXong' ? '#059669' : s.trang_thai_hoc === 'Huy' ? '#dc2626' : '#2563eb',
                                    }}>
                                        {s.trang_thai_hoc === 'DaXong' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.2rem' }}><MI name="check_circle" style={{ fontSize: '1rem', color: '#059669' }} /> Hoàn thành</span> : s.trang_thai_hoc === 'Huy' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.2rem' }}><MI name="cancel" style={{ fontSize: '1rem', color: '#dc2626' }} /> Đã hủy</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.2rem' }}><MI name="menu_book" style={{ fontSize: '1rem', color: '#2563eb' }} /> Đang học</span>}
                                    </span>
                                </td>
                                <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                                    {new Date(s.ngay_dang_ky).toLocaleDateString('vi-VN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PreviewTab = ({ course, chapters }) => {
    const totalLessons = chapters.reduce((s, c) => s + (c.bai_giang?.length || 0), 0);
    const totalMinutes = chapters.reduce((s, c) => s + (c.bai_giang || []).reduce((ss, l) => ss + (l.thoi_luong_phut || 0), 0), 0);
    const freeLessons = chapters.reduce((s, c) => s + (c.bai_giang || []).filter(l => l.la_xem_truoc).length, 0);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    const TRINH_DO_LABEL = { CoSo: 'Cơ sở', TrungCap: 'Trung cấp', NangCao: 'Nâng cao' };

    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('/embed/')) return url.split('?')[0] + '?autoplay=1&rel=0';
        const watchMatch = url.match(/[?&]v=([^&#]+)/);
        if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
        const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
        if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
        return null;
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* ── Video Preview Section ── */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
                    <MI name="play_circle" style={{ color: '#dc2626', fontSize: '1.2rem' }} />
                    <h3 style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text-primary)' }}>Video Preview (như học viên thấy)</h3>
                    {course.url_video_preview
                        ? <span style={{ fontSize: '.7rem', background: '#ecfdf5', color: '#059669', padding: '.15rem .5rem', borderRadius: '99px', fontWeight: 700 }}>✓ Đã cấu hình</span>
                        : <span style={{ fontSize: '.7rem', background: '#fef3c7', color: '#d97706', padding: '.15rem .5rem', borderRadius: '99px', fontWeight: 700 }}>Chưa có video</span>
                    }
                </div>
                <div style={{ background: '#0f172a', borderRadius: '14px', aspectRatio: '16/9', overflow: 'hidden', position: 'relative', cursor: (!isPlayingPreview && course.url_video_preview) ? 'pointer' : 'default' }}
                    onClick={() => { if (!isPlayingPreview && course.url_video_preview) setIsPlayingPreview(true); }}
                >
                    {isPlayingPreview && course.url_video_preview ? (
                        <iframe
                            src={getEmbedUrl(course.url_video_preview)}
                            title="Video preview"
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <>
                            {course.hinh_anh_thumbnail && (
                                <img src={course.hinh_anh_thumbnail?.replace('maxresdefault.jpg', 'hqdefault.jpg')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: course.url_video_preview ? .5 : .3 }} onError={e => e.target.style.display = 'none'} />
                            )}
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.6rem', color: '#fff' }}>
                                <div style={{ width: 68, height: 68, background: course.url_video_preview ? 'rgba(220,38,38,.9)' : 'rgba(255,255,255,.15)', border: course.url_video_preview ? 'none' : '3px solid rgba(255,255,255,.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', boxShadow: course.url_video_preview ? '0 4px 20px rgba(220,38,38,.5)' : 'none' }}>
                                    ▶
                                </div>
                                <span style={{ fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,.6)', fontSize: '.9rem' }}>
                                    {course.url_video_preview ? 'Nhấn để xem video preview' : 'Chưa có video preview — Cấu hình trong tab Thiết lập'}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: '14px', padding: '2rem', marginBottom: '1.5rem', color: '#fff' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    {/* Thumbnail */}
                    <div style={{ width: 200, aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,.1)', flexShrink: 0 }}>
                        {course.hinh_anh_thumbnail
                            ? <img src={course.hinh_anh_thumbnail} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MI name="menu_book" style={{ fontSize: '2.5rem', color: '#d97706' }} /></div>
                        }
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
                            {course.danh_muc && <span style={{ background: 'rgba(255,255,255,.15)', padding: '.2rem .6rem', borderRadius: '99px', fontSize: '.72rem' }}>{course.danh_muc}</span>}
                            <span style={{ background: 'rgba(255,255,255,.15)', padding: '.2rem .6rem', borderRadius: '99px', fontSize: '.72rem' }}>{TRINH_DO_LABEL[course.trinh_do] || course.trinh_do}</span>
                        </div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '.5rem', lineHeight: 1.3 }}>{course.ten_khoa_hoc}</h1>
                        {course.mo_ta_ngan && <p style={{ opacity: .85, fontSize: '.9rem', marginBottom: '1rem' }}>{course.mo_ta_ngan}</p>}
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '.82rem', opacity: .8 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="layers" style={{ fontSize: '1rem' }} /> {chapters.length} chương</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="play_circle" style={{ fontSize: '1rem' }} /> {totalLessons} bài giảng</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="schedule" style={{ fontSize: '1rem' }} /> {Math.floor(totalMinutes / 60)}h{totalMinutes % 60}p</span>
                            {freeLessons > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="visibility" style={{ fontSize: '1rem' }} /> {freeLessons} bài xem trước</span>}
                        </div>
                    </div>
                    {/* Price */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {course.gia_goc > course.gia_tien && (
                            <div style={{ textDecoration: 'line-through', opacity: .5, fontSize: '.85rem' }}>
                                {Number(course.gia_goc).toLocaleString('vi-VN')}₫
                            </div>
                        )}
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fcd34d' }}>
                            {Number(course.gia_tien) === 0 ? 'Miễn phí' : `${Number(course.gia_tien).toLocaleString('vi-VN')}₫`}
                        </div>
                        {course.gia_goc > course.gia_tien && (
                            <div style={{ background: '#ef4444', padding: '.2rem .5rem', borderRadius: '4px', fontSize: '.72rem', fontWeight: 700, marginTop: '.25rem' }}>
                                -{Math.round((1 - course.gia_tien / course.gia_goc) * 100)}% OFF
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Curriculum Preview */}
            <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}><MI name="list_alt" style={{ fontSize: '1.1rem', color: 'var(--primary)' }} /> Chương trình học</h3>
                {chapters.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '.875rem' }}>
                        Chưa có nội dung — hãy thêm chương và bài giảng
                    </div>
                ) : (
                    chapters.map(ch => (
                        <div key={ch.id_chuong} style={{ marginBottom: '.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem .75rem', background: 'var(--bg-app)', borderRadius: '8px', marginBottom: '.3rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}><MI name="folder" style={{ fontSize: '1rem', color: '#d97706' }} /> {ch.ten_chuong}</span>
                                <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{(ch.bai_giang || []).length} bài</span>
                            </div>
                            {(ch.bai_giang || []).map(l => (
                                <div key={l.id_bai_giang} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .75rem .4rem 1.25rem', fontSize: '.82rem' }}>
                                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}><MI name={typeIcon(l.loai_bai)} style={{ fontSize: '.9rem' }} /></span>
                                    <span style={{ flex: 1 }}>{l.ten_bai_giang}</span>
                                    {l.la_xem_truoc && <span style={{ background: '#ecfdf5', color: '#059669', padding: '.1rem .4rem', borderRadius: '99px', fontSize: '.65rem', fontWeight: 700 }}>Xem trước</span>}
                                    <span style={{ color: 'var(--text-muted)' }}>{l.thoi_luong_phut > 0 ? `${l.thoi_luong_phut}p` : ''}</span>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


/* ══════════════════════════════════════════════════════════════
   MAIN: COURSE BUILDER
══════════════════════════════════════════════════════════════ */
const CourseBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [activeTab, setActiveTab] = useState('content');
    const [publishing, setPublishing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2800);
    };

    const fetchData = async () => {
        try {
            const [cRes, chRes] = await Promise.all([
                api.get(`/lms/khoa-hoc/${id}/`),
                api.get(`/lms/chuong/?khoa_hoc=${id}`),
            ]);
            setCourse(cRes.data);
            setChapters(chRes.data || []);
        } catch { showToast('Lỗi tải dữ liệu', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [id]);

    /* ── CRUD Chapter ── */
    const addChapter = async () => {
        try {
            const res = await api.post('/lms/chuong/', {
                id_khoa_hoc: id,
                ten_chuong: `Chương ${chapters.length + 1}: Tiêu đề chương`,
                thu_tu: chapters.length + 1,
            });
            setChapters(prev => [...prev, { ...res.data, bai_giang: [] }]);
            showToast('Đã thêm chương mới');
        } catch { showToast('Lỗi thêm chương', 'error'); }
    };

    const deleteChapter = async (chId) => {
        if (!window.confirm('Xóa chương này và tất cả bài giảng bên trong?')) return;
        try {
            await api.delete(`/lms/chuong/${chId}/`);
            setChapters(prev => prev.filter(c => c.id_chuong !== chId));
            if (selectedLesson?.id_chuong === chId) setSelectedLesson(null);
            showToast('Đã xóa chương');
        } catch { showToast('Lỗi xóa chương', 'error'); }
    };

    const renameChapter = async (chId, name) => {
        try {
            await api.patch(`/lms/chuong/${chId}/`, { ten_chuong: name });
            setChapters(prev => prev.map(c => c.id_chuong === chId ? { ...c, ten_chuong: name } : c));
        } catch { showToast('Lỗi đổi tên', 'error'); }
    };

    /* ── CRUD Lesson ── */
    const addLesson = async (chId) => {
        try {
            const ch = chapters.find(c => c.id_chuong === chId);
            const res = await api.post('/lms/bai-giang/', {
                id_khoa_hoc: id,
                id_chuong: chId,
                ten_bai_giang: `Bài ${(ch?.bai_giang?.length || 0) + 1}: Tiêu đề bài`,
                thu_tu: (ch?.bai_giang?.length || 0) + 1,
                loai_bai: 'Video',
            });
            const newLesson = res.data;
            setChapters(prev => prev.map(c => c.id_chuong === chId
                ? { ...c, bai_giang: [...(c.bai_giang || []), newLesson] }
                : c
            ));
            setSelectedLesson(newLesson);
            showToast('Đã thêm bài giảng mới');
        } catch { showToast('Lỗi thêm bài', 'error'); }
    };

    const deleteLesson = async (lId) => {
        try {
            await api.delete(`/lms/bai-giang/${lId}/`);
            setChapters(prev => prev.map(c => ({ ...c, bai_giang: (c.bai_giang || []).filter(l => l.id_bai_giang !== lId) })));
            if (selectedLesson?.id_bai_giang === lId) setSelectedLesson(null);
            showToast('Đã xóa bài giảng');
        } catch { showToast('Lỗi xóa bài', 'error'); }
    };

    const saveLesson = async (form) => {
        try {
            const res = await api.patch(`/lms/bai-giang/${form.id_bai_giang}/`, form);
            setChapters(prev => prev.map(c => ({ ...c, bai_giang: (c.bai_giang || []).map(l => l.id_bai_giang === form.id_bai_giang ? res.data : l) })));
            setSelectedLesson(res.data);
            showToast('Đã lưu bài giảng');
        } catch { showToast('Lỗi lưu bài', 'error'); }
    };

    /* ── Publish ── */
    const handlePublish = async () => {
        setPublishing(true);
        try {
            await api.post(`/lms/khoa-hoc/${id}/publish/`);
            setCourse(c => ({ ...c, cong_khai: true }));
            showToast('🚀 Khóa học đã được đăng lên Marketplace!');
        } catch { showToast('Lỗi khi đăng', 'error'); }
        finally { setPublishing(false); }
    };

    const handleUnpublish = async () => {
        try {
            await api.post(`/lms/khoa-hoc/${id}/unpublish/`);
            setCourse(c => ({ ...c, cong_khai: false }));
            showToast('Khóa học đã ẩn khỏi Marketplace');
        } catch { showToast('Lỗi', 'error'); }
    };

    const totalLessons = chapters.reduce((s, c) => s + (c.bai_giang?.length || 0), 0);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 3rem)', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${SELLER_ORANGE_LIGHT}`, borderTopColor: SELLER_ORANGE, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '.875rem' }}>Đang tải khóa học...</span>
        </div>
    );

    const TABS = [
        { id: 'content', icon: 'video_library', label: 'Nội dung' },
        { id: 'settings', icon: 'tune', label: 'Thiết lập' },
        { id: 'students', icon: 'groups', label: 'Học viên' },
        { id: 'preview', icon: 'preview', label: 'Xem trước' },
    ];

    return (
        <div className="fade-up" style={{ height: 'calc(100vh - 3rem)', display: 'flex', flexDirection: 'column' }}>
            {/* ── TOP BAR ── */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap',
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '.75rem 1.25rem',
                boxShadow: 'var(--shadow-sm)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                    <button
                        onClick={() => navigate('/seller/courses')}
                        style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '8px', padding: '.4rem .75rem', cursor: 'pointer', fontSize: '.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '.3rem', flexShrink: 0 }}
                    >
                        ← Quay lại
                    </button>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>Course Builder</div>
                        <div style={{ fontWeight: 700, fontSize: '.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                            {course?.ten_khoa_hoc}
                        </div>
                    </div>
                    {/* Stats pills */}
                    <div style={{ display: 'flex', gap: '.4rem', flexShrink: 0 }}>
                        <span style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', padding: '.2rem .6rem', borderRadius: '99px', fontSize: '.72rem', color: 'var(--text-secondary)' }}>
                            {chapters.length} chương
                        </span>
                        <span style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', padding: '.2rem .6rem', borderRadius: '99px', fontSize: '.72rem', color: 'var(--text-secondary)' }}>
                            {totalLessons} bài
                        </span>
                        {course?.cong_khai
                            ? <span style={{ background: '#ecfdf5', border: '1px solid #d1fae5', padding: '.2rem .6rem', borderRadius: '99px', fontSize: '.72rem', color: '#059669', fontWeight: 600 }}>● Đang bán</span>
                            : <span style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', padding: '.2rem .6rem', borderRadius: '99px', fontSize: '.72rem', color: 'var(--text-muted)' }}>○ Bản nháp</span>
                        }
                    </div>
                </div>

                {/* Publish button */}
                {course?.cong_khai ? (
                    <button
                        onClick={handleUnpublish}
                        style={{ padding: '.5rem 1.25rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '.875rem', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}
                    >
                        <MI name="visibility_off" style={{ fontSize: '1rem' }} /> Ẩn khóa học
                    </button>
                ) : (
                    <button
                        onClick={handlePublish} disabled={publishing}
                        style={{ padding: '.55rem 1.4rem', background: SELLER_ORANGE, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '.875rem', opacity: publishing ? .7 : 1, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '.4rem' }}
                    >
                        {publishing ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="hourglass_empty" style={{ fontSize: '1rem' }} /> Đang đăng...</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="publish" style={{ fontSize: '1rem' }} /> Đăng bán</span>}
                    </button>
                )}
            </div>

            {/* ── TABS ── */}
            <div style={{ display: 'flex', gap: '.25rem', marginBottom: '1rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '.35rem', boxShadow: 'var(--shadow-sm)' }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1, padding: '.5rem .75rem', border: 'none', borderRadius: '7px', cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            background: activeTab === tab.id ? SELLER_ORANGE_LIGHT : 'transparent',
                            color: activeTab === tab.id ? SELLER_ORANGE_DARK : 'var(--text-secondary)',
                            fontSize: '.82rem', transition: 'all .18s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem',
                        }}
                    >
                        <MI name={tab.icon} style={{ fontSize: '1rem' }} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ── CONTENT AREA ── */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* TAB: Nội dung khóa học */}
                {activeTab === 'content' && (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedLesson ? '300px 1fr' : '1fr', gap: '1rem', flex: 1, overflow: 'hidden', transition: 'grid-template-columns .2s' }}>
                        {/* LEFT: Chapter Tree */}
                        <div className="card" style={{ overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '.875rem' }}>🗂 Chương trình học</h3>
                                <button
                                    onClick={addChapter}
                                    style={{ padding: '.35rem .75rem', background: SELLER_ORANGE, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600 }}
                                >
                                    + Thêm chương
                                </button>
                            </div>

                            {chapters.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                                    <div style={{ fontSize: '3rem' }}>📭</div>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>Chưa có chương nào</div>
                                        <div style={{ fontSize: '.8rem' }}>Bắt đầu xây dựng nội dung khóa học</div>
                                    </div>
                                    <button onClick={addChapter} style={{ padding: '.5rem 1rem', background: SELLER_ORANGE, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '.82rem' }}>
                                        + Thêm chương đầu tiên
                                    </button>
                                </div>
                            ) : (
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {chapters.map(ch => (
                                        <ChapterBlock
                                            key={ch.id_chuong} chapter={ch}
                                            selectedLesson={selectedLesson}
                                            onSelectLesson={setSelectedLesson}
                                            onDeleteLesson={deleteLesson}
                                            onAddLesson={addLesson}
                                            onDeleteChapter={deleteChapter}
                                            onRenameChapter={renameChapter}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Lesson Editor */}
                        {selectedLesson ? (
                            <div className="card" style={{ overflow: 'auto', padding: '1.25rem' }}>
                                <LessonEditor
                                    lesson={selectedLesson}
                                    onSave={saveLesson}
                                    onClose={() => setSelectedLesson(null)}
                                />
                            </div>
                        ) : null}

                        {/* Placeholder khi chưa chọn bài (chỉ hiện khi không có bài được chọn nhưng đã có chương) */}
                        {!selectedLesson && chapters.length > 0 && (
                            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', overflow: 'hidden' }}>
                                <div style={{ fontSize: '3rem' }}>✏️</div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '.3rem', color: 'var(--text-primary)' }}>Chọn bài giảng để chỉnh sửa</div>
                                    <div style={{ fontSize: '.82rem' }}>hoặc nhấn ＋ trong tiêu đề chương để thêm bài mới</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Thiết lập */}
                {activeTab === 'settings' && (
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        <SettingsTab course={course} onUpdate={setCourse} showToast={showToast} />
                    </div>
                )}

                {/* TAB: Học viên */}
                {activeTab === 'students' && (
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        <StudentsTab courseId={id} />
                    </div>
                )}

                {/* TAB: Xem trước */}
                {activeTab === 'preview' && (
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        <PreviewTab course={course} chapters={chapters} />
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} />}

            {/* Spin animation */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default CourseBuilder;
