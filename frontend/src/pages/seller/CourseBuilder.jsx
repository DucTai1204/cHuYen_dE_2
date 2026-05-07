import React, { useState, useEffect, useRef } from 'react';
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
const LessonRow = ({ lesson, isSelected, onClick, onDelete, onDragStart, onDragOver, onDrop, onDragEnd }) => (
    <div
        onClick={() => onClick(lesson)}
        draggable
        onDragStart={e => onDragStart && onDragStart(e, lesson)}
        onDragOver={e => { e.preventDefault(); if (onDragOver) onDragOver(e, lesson); }}
        onDrop={e => onDrop && onDrop(e, lesson)}
        onDragEnd={e => onDragEnd && onDragEnd(e)}
        style={{
            display: 'flex', alignItems: 'center', gap: '.5rem',
            padding: '.4rem .75rem .4rem 1.5rem',
            borderRadius: '6px', cursor: 'pointer',
            background: isSelected ? SELLER_ORANGE_LIGHT : 'transparent',
            border: isSelected ? `1px solid #fcd34d` : '1px solid transparent',
            marginBottom: '.15rem',
        }}
    >
        <span style={{ cursor: 'grab', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }} title="Kéo để sắp xếp">
            <MI name="drag_indicator" style={{ fontSize: '.85rem' }} />
        </span>
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
const ChapterBlock = ({ chapter, selectedLesson, onSelectLesson, onDeleteLesson, onAddLesson, onDeleteChapter, onRenameChapter, onReorderLesson }) => {
    const [open, setOpen] = useState(true);
    const [renaming, setRenaming] = useState(false);
    const [name, setName] = useState(chapter.ten_chuong);
    const dragItem = useRef(null);

    const saveRename = () => { if (name.trim()) { onRenameChapter(chapter.id_chuong, name); } setRenaming(false); };

    const handleDragStart = (e, lesson) => {
        dragItem.current = lesson;
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.4';
    };
    const handleDragOver = (e, lesson) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    const handleDrop = (e, targetLesson) => {
        e.preventDefault();
        if (dragItem.current && dragItem.current.id_bai_giang !== targetLesson.id_bai_giang) {
            onReorderLesson(chapter.id_chuong, dragItem.current.id_bai_giang, targetLesson.id_bai_giang);
        }
        dragItem.current = null;
    };
    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
        dragItem.current = null;
    };

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
                                onDragStart={handleDragStart} onDragOver={handleDragOver}
                                onDrop={handleDrop} onDragEnd={handleDragEnd}
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
    const [expandedQ, setExpandedQ] = useState(null);
    const [selectedQs, setSelectedQs] = useState([]);
    const [bulkScore, setBulkScore] = useState(1);

    useEffect(() => { 
        setQuestions(lesson.cau_hoi || []); 
        setSelectedQs([]); // Reset selection when lesson changes
    }, [lesson.id_bai_giang]);

    const toggleSelectAll = () => {
        if (selectedQs.length === questions.length && questions.length > 0) {
            setSelectedQs([]);
        } else {
            setSelectedQs(questions.map(q => q.id_cau_hoi));
        }
    };

    const toggleSelectQuestion = (qId) => {
        setSelectedQs(prev => prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]);
    };

    const handleBulkDelete = async () => {
        if (selectedQs.length === 0) return;
        if (!window.confirm(`Xóa ${selectedQs.length} câu hỏi đã chọn?`)) return;
        try {
            await Promise.all(selectedQs.map(id => api.delete(`/lms/cau-hoi/${id}/`)));
            const newQs = questions.filter(q => !selectedQs.includes(q.id_cau_hoi));
            setQuestions(newQs);
            onUpdate(newQs);
            setSelectedQs([]);
        } catch (e) {
            alert('Lỗi khi xóa hàng loạt');
        }
    };

    const handleBulkUpdateScore = async () => {
        if (selectedQs.length === 0) return;
        try {
            await Promise.all(selectedQs.map(id => api.patch(`/lms/cau-hoi/${id}/`, { diem: bulkScore })));
            const newQs = questions.map(q => selectedQs.includes(q.id_cau_hoi) ? { ...q, diem: bulkScore } : q);
            setQuestions(newQs);
            onUpdate(newQs);
            setSelectedQs([]);
        } catch (e) {
            alert('Lỗi khi cập nhật điểm hàng loạt');
        }
    };

    const addQuestion = async () => {
        try {
            if (!lesson.id_bai_giang) {
                alert('Không tìm thấy ID bài giảng. Vui lòng lưu bài giảng trước.');
                return;
            }
            const res = await api.post('/lms/cau-hoi/', {
                id_bai_giang: lesson.id_bai_giang,
                noi_dung: 'Tên câu hỏi mới?',
                diem: 1,
                thu_tu: questions.length + 1
            });
            const newQ = { ...res.data, lua_chon: [] };
            const newQs = [...questions, newQ];
            setQuestions(newQs);
            onUpdate(newQs);

            // Set mở sẵn câu hỏi mới
            setExpandedQ(newQ.id_cau_hoi);

            // Tự động cuộn xuống cuối sau khi DOM render
            setTimeout(() => {
                const el = document.getElementById(`q-${newQ.id_cau_hoi}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } catch (e) {
            console.error('Add question error:', e);
            alert('Lỗi thêm câu hỏi: ' + (e.response?.data?.detail || e.message || 'Lỗi không xác định'));
        }
    };

    const updateQuestion = async (qId, data) => {
        try {
            const res = await api.patch(`/lms/cau-hoi/${qId}/`, data);
            const newQs = questions.map(q => q.id_cau_hoi === qId ? { ...q, ...res.data } : q);
            setQuestions(newQs);
            onUpdate(newQs);
        } catch (e) {
            console.error('Update question error:', e);
        }
    };

    const deleteQuestion = async (qId) => {
        if (!window.confirm('Xóa câu hỏi này?')) return;
        try {
            await api.delete(`/lms/cau-hoi/${qId}/`);
            const newQs = questions.filter(q => q.id_cau_hoi !== qId);
            setQuestions(newQs);
            onUpdate(newQs);
        } catch (e) {
            alert('Lỗi xóa câu hỏi');
        }
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
        } catch (e) {
            alert('Lỗi thêm lựa chọn');
        }
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
        } catch (e) {
            alert('Lỗi xóa lựa chọn');
        }
    };

    const setCorrectChoice = async (qId, cId) => {
        const q = questions.find(x => x.id_cau_hoi === qId);
        if (!q) return;

        try {
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
        } catch (e) {
            console.error('Set correct choice error:', e);
            alert('Lỗi khi cập nhật đáp án đúng. Vui lòng thử lại.');
        }
    };

    const duplicateQuestion = async (qId) => {
        const q = questions.find(x => x.id_cau_hoi === qId);
        if (!q) return;
        try {
            const res = await api.post('/lms/cau-hoi/', {
                id_bai_giang: lesson.id_bai_giang,
                noi_dung: q.noi_dung + ' (Bản sao)',
                diem: q.diem,
                thu_tu: questions.length + 1
            });
            const newQ = { ...res.data, lua_chon: [] };

            // Sao chép các lựa chọn
            if (q.lua_chon && q.lua_chon.length > 0) {
                const choicesRes = await Promise.all(q.lua_chon.map(c =>
                    api.post('/lms/lua-chon/', {
                        id_cau_hoi: newQ.id_cau_hoi,
                        noi_dung: c.noi_dung,
                        la_dap_an_dung: c.la_dap_an_dung
                    })
                ));
                newQ.lua_chon = choicesRes.map(r => r.data);
            }

            const newQs = [...questions, newQ];
            setQuestions(newQs);
            onUpdate(newQs);
        } catch (e) {
            alert('Lỗi khi sao chép câu hỏi');
        }
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
        <div style={{ marginTop: '.75rem', borderTop: '1px dashed var(--border)', paddingTop: '.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem', gap: '.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <span style={{ fontSize: '.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                        <MI name="quiz" style={{ color: SELLER_ORANGE, fontSize: '1rem' }} /> {questions.length} câu hỏi
                    </span>
                    {questions.length > 0 && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.75rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input type="checkbox" checked={selectedQs.length === questions.length && questions.length > 0} onChange={toggleSelectAll} style={{ accentColor: SELLER_ORANGE }} />
                            Chọn tất cả
                        </label>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    {selectedQs.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: '#fff7ed', padding: '.25rem .5rem', borderRadius: '6px', border: '1px solid #ffedd5' }}>
                            <span style={{ fontSize: '.72rem', fontWeight: 700, color: SELLER_ORANGE_DARK }}>{selectedQs.length} đã chọn:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                                <input type="number" value={bulkScore} onChange={e => setBulkScore(parseInt(e.target.value) || 0)} style={{ width: 35, border: '1px solid #fcd34d', borderRadius: '4px', textAlign: 'center', fontSize: '.72rem', padding: '.15rem' }} title="Điểm áp dụng cho các mục đã chọn" />
                                <button onClick={handleBulkUpdateScore} style={{ background: SELLER_ORANGE, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '.68rem', fontWeight: 700, padding: '.25rem .4rem', cursor: 'pointer' }}>Gán điểm</button>
                            </div>
                            <div style={{ width: 1, height: 14, background: '#ffedd5' }} />
                            <button onClick={handleBulkDelete} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', fontSize: '.68rem', fontWeight: 700, padding: '.25rem .4rem', cursor: 'pointer' }}>Xóa hết</button>
                        </div>
                    )}
                    <button onClick={addQuestion} style={{ padding: '.35rem .75rem', background: SELLER_ORANGE, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.2rem' }}>
                        <MI name="add" style={{ fontSize: '1rem', color: '#fff' }} /> Thêm câu hỏi
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {questions.map((q, idx) => {
                    const isOpen = expandedQ === q.id_cau_hoi;
                    const correctCount = (q.lua_chon || []).filter(c => c.la_dap_an_dung).length;
                    return (
                        <div
                            key={q.id_cau_hoi}
                            id={`q-${q.id_cau_hoi}`}
                            style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', background: '#fff' }}
                        >
                            {/* Collapsed header */}
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .6rem', cursor: 'pointer', background: isOpen ? SELLER_ORANGE_LIGHT : '#fafafa', transition: 'background .15s' }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedQs.includes(q.id_cau_hoi)}
                                    onChange={(e) => { e.stopPropagation(); toggleSelectQuestion(q.id_cau_hoi); }}
                                    style={{ width: 15, height: 15, accentColor: SELLER_ORANGE, cursor: 'pointer' }}
                                />
                                <div onClick={() => setExpandedQ(isOpen ? null : q.id_cau_hoi)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 0 }}>
                                    <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', width: 14 }}>{isOpen ? '▼' : '▶'}</span>
                                    <span style={{ fontSize: '.75rem', fontWeight: 600, color: SELLER_ORANGE_DARK, flexShrink: 0 }}>C{idx + 1}</span>
                                    <span style={{ flex: 1, fontSize: '.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{q.noi_dung}</span>
                                    <span style={{ fontSize: '.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>{(q.lua_chon || []).length} đáp án{correctCount > 0 ? ' ✓' : ''}</span>
                                    <span style={{ fontSize: '.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>{q.diem}đ</span>
                                </div>
                                <button onClick={e => { e.stopPropagation(); duplicateQuestion(q.id_cau_hoi); }} title="Nhân bản" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', fontSize: 0 }}><MI name="content_copy" style={{ fontSize: '.85rem' }} /></button>
                                <button onClick={e => { e.stopPropagation(); deleteQuestion(q.id_cau_hoi); }} title="Xóa" style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px', fontSize: 0 }}><MI name="close" style={{ fontSize: '.85rem' }} /></button>
                            </div>
                            {/* Expanded body */}
                            {isOpen && (
                                <div style={{ padding: '.5rem .6rem', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem', alignItems: 'center' }}>
                                        <input
                                            className="form-input" value={q.noi_dung}
                                            onChange={e => updateQuestion(q.id_cau_hoi, { noi_dung: e.target.value })}
                                            style={{ flex: 1, fontSize: '.8rem', padding: '.35rem .5rem' }}
                                            placeholder="Nội dung câu hỏi..."
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.2rem', fontSize: '.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                                            <MI name="stars" style={{ color: '#f59e0b', fontSize: '.85rem' }} />
                                            <input type="number" value={q.diem} onChange={e => updateQuestion(q.id_cau_hoi, { diem: parseInt(e.target.value) || 0 })} style={{ width: 32, border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'center', fontSize: '.75rem', padding: '.15rem' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        {(q.lua_chon || []).map(c => (
                                            <div key={c.id_lua_chon} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.25rem .4rem', borderRadius: '4px', background: c.la_dap_an_dung ? '#f0fdf4' : '#f8fafc', border: `1px solid ${c.la_dap_an_dung ? '#86efac' : '#e2e8f0'}` }}>
                                                <div onClick={() => setCorrectChoice(q.id_cau_hoi, c.id_lua_chon)} style={{ cursor: 'pointer', color: c.la_dap_an_dung ? '#10b981' : '#cbd5e1', display: 'flex', flexShrink: 0 }} title={c.la_dap_an_dung ? 'Đáp án đúng' : 'Chọn đúng'}>
                                                    <MI name={c.la_dap_an_dung ? 'check_circle' : 'radio_button_unchecked'} style={{ fontSize: '1.1rem' }} />
                                                </div>
                                                <input value={c.noi_dung} onChange={e => updateChoiceContent(q.id_cau_hoi, c.id_lua_chon, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChoice(q.id_cau_hoi); } }} autoFocus={c.noi_dung === 'Lựa chọn mới'} style={{ flex: 1, fontSize: '.8rem', padding: '.15rem', border: 'none', background: 'transparent', outline: 'none', fontWeight: c.la_dap_an_dung ? 600 : 400 }} placeholder="Phương án..." />
                                                <button onClick={() => deleteChoice(q.id_cau_hoi, c.id_lua_chon)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '1px', fontSize: 0 }}><MI name="close" style={{ fontSize: '.9rem' }} /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => addChoice(q.id_cau_hoi)} style={{ background: 'none', border: 'none', color: SELLER_ORANGE, fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', marginTop: '.3rem', display: 'flex', alignItems: 'center', gap: '.2rem', padding: '.2rem .3rem' }}>
                                        <MI name="add" style={{ fontSize: '.9rem' }} /> Thêm phương án
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {questions.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '.75rem', padding: '.75rem', background: '#fafafa', borderRadius: '6px', border: '1px dashed var(--border)' }}>Chưa có câu hỏi nào.</div>}
            </div>
        </div>
    );
};

/* ── Lesson Editor Panel ── */
const LessonEditor = ({ lesson, onSave, onClose, isExpanded, setIsExpanded }) => {
    const [form, setForm] = useState({ ...lesson });
    const [saving, setSaving] = useState(false);

    useEffect(() => { setForm({ ...lesson }); }, [lesson?.id_bai_giang]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const hasChanges = React.useMemo(() => {
        if (!lesson) return false;

        // Tạo bản sao sạch để so sánh
        const cleanForm = { ...form };
        const cleanLesson = { ...lesson };

        // Loại bỏ các trường không cần thiết hoặc gây nhiễu
        const ignoreFields = ['ngay_tao', 'ngay_cap_nhat'];
        ignoreFields.forEach(f => {
            delete cleanForm[f];
            delete cleanLesson[f];
        });

        // Đảm bảo cau_hoi là mảng để so sánh JSON chính xác
        if (!cleanForm.cau_hoi) cleanForm.cau_hoi = [];
        if (!cleanLesson.cau_hoi) cleanLesson.cau_hoi = [];

        return JSON.stringify(cleanForm) !== JSON.stringify(cleanLesson);
    }, [form, lesson]);

    const save = async () => {
        if (!hasChanges) return;
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Compact Header: type tabs + close + expand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border)' }}>
                <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Thu nhỏ" : "Phóng to"} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '4px', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                    <MI name={isExpanded ? 'fullscreen_exit' : 'fullscreen'} style={{ fontSize: '1rem' }} />
                </button>
                {[
                    { val: 'Video', icon: 'play_circle' },
                    { val: 'Quiz', icon: 'quiz' },
                    { val: 'TaiLieu', icon: 'description' },
                    { val: 'VanBan', icon: 'article' },
                ].map(t => (
                    <button key={t.val} onClick={() => set('loai_bai', t.val)} style={{
                        padding: '.2rem .5rem', border: 'none', borderRadius: '4px', cursor: 'pointer',
                        fontSize: '.72rem', fontWeight: form.loai_bai === t.val ? 700 : 400,
                        background: form.loai_bai === t.val ? SELLER_ORANGE : 'transparent',
                        color: form.loai_bai === t.val ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '.2rem', transition: 'all .15s',
                    }}>
                        <MI name={t.icon} style={{ fontSize: '.9rem' }} /> {typeLabel(t.val)}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 0, padding: '2px' }}><MI name="close" style={{ fontSize: '1.1rem' }} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '.6rem', paddingRight: '.25rem' }}>
                {/* Tên bài — inline */}
                <input className="form-input" value={form.ten_bai_giang || ''} onChange={e => set('ten_bai_giang', e.target.value)} placeholder="Tên bài giảng *" style={{ fontSize: '.85rem', padding: '.4rem .6rem' }} />

                {/* URL hoặc nội dung tuỳ loại */}
                {(form.loai_bai === 'Video' || form.loai_bai === 'TaiLieu') && (
                    <input className="form-input" value={form.noi_dung_url || ''} onChange={e => set('noi_dung_url', e.target.value)}
                        placeholder={form.loai_bai === 'Video' ? 'URL Video (YouTube / Drive)' : 'URL Tài liệu (PDF / Drive)'}
                        style={{ fontSize: '.8rem', padding: '.35rem .6rem' }} />
                )}
                {form.loai_bai === 'VanBan' && (
                    <textarea className="form-input" rows={4} value={form.noi_dung_url || ''} onChange={e => set('noi_dung_url', e.target.value)}
                        placeholder="Nhập nội dung văn bản..." style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '.8rem', padding: '.35rem .6rem' }} />
                )}

                {/* Metadata row: thời lượng + thứ tự + toggles */}
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap', padding: '.4rem .5rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', fontSize: '.75rem', color: 'var(--text-secondary)' }}>
                        <MI name="schedule" style={{ fontSize: '.85rem' }} />
                        <input type="number" value={form.thoi_luong_phut || 0} onChange={e => set('thoi_luong_phut', parseInt(e.target.value) || 0)} min={0} style={{ width: 40, border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'center', fontSize: '.75rem', padding: '.15rem' }} />
                        <span>phút</span>
                    </div>
                    <div style={{ width: 1, height: 16, background: '#e2e8f0' }} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '.25rem', fontSize: '.72rem', cursor: 'pointer', color: form.la_xem_truoc ? '#059669' : 'var(--text-muted)' }}>
                        <input type="checkbox" checked={!!form.la_xem_truoc} onChange={e => set('la_xem_truoc', e.target.checked)} style={{ width: 13, height: 13, accentColor: '#059669' }} />
                        <MI name="visibility" style={{ fontSize: '.85rem' }} /> Free
                    </label>
                    {form.loai_bai === 'Quiz' && (
                        <>
                            <div style={{ width: 1, height: 16, background: '#e2e8f0' }} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '.25rem', fontSize: '.72rem', cursor: 'pointer', color: form.is_proctored ? '#dc2626' : 'var(--text-muted)' }}>
                                <input type="checkbox" checked={!!form.is_proctored} onChange={e => set('is_proctored', e.target.checked)} style={{ width: 13, height: 13, accentColor: '#ef4444' }} />
                                <MI name="security" style={{ fontSize: '.85rem' }} /> Giám sát
                            </label>
                        </>
                    )}
                    {form.loai_bai === 'Video' && (
                        <>
                            <div style={{ width: 1, height: 16, background: '#e2e8f0' }} />
                            <div style={{ display: 'flex', gap: '2px', fontSize: '.7rem' }}>
                                {[33, 66, 100].map(pct => (
                                    <button key={pct} onClick={() => set('video_watch_percentage', pct)} style={{
                                        padding: '.15rem .35rem', border: 'none', borderRadius: '3px', cursor: 'pointer',
                                        background: (form.video_watch_percentage === pct || (!form.video_watch_percentage && pct === 100)) ? SELLER_ORANGE : '#e2e8f0',
                                        color: (form.video_watch_percentage === pct || (!form.video_watch_percentage && pct === 100)) ? '#fff' : 'var(--text-muted)',
                                        fontWeight: 600, fontSize: '.68rem',
                                    }}>{pct}%</button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Quiz Editor */}
                {form.loai_bai === 'Quiz' && (
                    <QuizEditor lesson={form} onUpdate={(newQs) => set('cau_hoi', newQs)} />
                )}
            </div>

            {/* Save bar — sticky compact */}
            <div style={{ paddingTop: '.5rem', borderTop: '1px solid var(--border)', marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                {hasChanges && <span style={{ fontSize: '.68rem', color: SELLER_ORANGE, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.2rem' }}><MI name="error_outline" style={{ fontSize: '.8rem' }} /> Chưa lưu</span>}
                <div style={{ flex: 1 }} />
                <button
                    onClick={save} disabled={saving || !hasChanges}
                    style={{
                        padding: '.4rem 1.25rem',
                        background: (saving || !hasChanges) ? '#e2e8f0' : SELLER_ORANGE,
                        color: (saving || !hasChanges) ? '#94a3b8' : '#fff',
                        border: 'none', borderRadius: '6px', fontWeight: 600,
                        cursor: (saving || !hasChanges) ? 'not-allowed' : 'pointer',
                        fontSize: '.8rem', transition: 'all .2s',
                        display: 'flex', alignItems: 'center', gap: '.3rem',
                    }}
                >
                    <MI name={saving ? 'hourglass_empty' : 'save'} style={{ fontSize: '.95rem' }} /> {saving ? 'Đang lưu...' : 'Lưu'}
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

    const hasChanges =
        form.ten_khoa_hoc !== (course.ten_khoa_hoc || '') ||
        form.mo_ta_ngan !== (course.mo_ta_ngan || '') ||
        form.mo_ta_chi_tiet !== (course.mo_ta_chi_tiet || '') ||
        form.danh_muc !== (course.danh_muc || '') ||
        form.trinh_do !== (course.trinh_do || 'CoSo') ||
        Number(form.gia_tien) !== (course.gia_tien || 0) ||
        Number(form.gia_goc) !== (course.gia_goc || 0) ||
        form.hinh_anh_thumbnail !== (course.hinh_anh_thumbnail || '') ||
        form.url_video_preview !== (course.url_video_preview || '') ||
        form.is_sequential !== (course.is_sequential || false);

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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', padding: '1rem', background: form.is_sequential ? 'var(--primary-light)' : 'var(--bg-app)', borderRadius: '8px', border: `1px solid ${form.is_sequential ? 'var(--primary)' : 'var(--border)'}`, transition: 'all .2s' }}>
                    <input type="checkbox" id="seq-check" checked={form.is_sequential} onChange={e => set('is_sequential', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer', marginTop: '.15rem' }} />
                    <div>
                        <label htmlFor="seq-check" style={{ fontSize: '.9rem', fontWeight: 600, color: form.is_sequential ? '#1e40af' : 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.3rem', marginBottom: '.25rem' }}>
                            <MI name="link" style={{ fontSize: '1rem' }} /> Bật chế độ Học tuần tự
                        </label>
                        <p style={{ fontSize: '.8rem', color: form.is_sequential ? 'var(--primary)' : 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
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
                onClick={handleSave} disabled={saving || !hasChanges}
                style={{
                    padding: '.75rem 2rem',
                    background: (saving || !hasChanges) ? '#e2e8f0' : SELLER_ORANGE,
                    color: (saving || !hasChanges) ? '#94a3b8' : '#fff',
                    border: 'none', borderRadius: '8px', fontWeight: 600,
                    cursor: (saving || !hasChanges) ? 'not-allowed' : 'pointer',
                    fontSize: '.95rem', opacity: saving ? .7 : 1, transition: 'all .18s',
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

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: 40, width: '60%', margin: '0 auto 1rem' }} />
            <div className="skeleton" style={{ height: 120, borderRadius: '12px' }} />
        </div>
    );

    if (students.length === 0) return (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <MI name="group_off" style={{ fontSize: '2rem', color: '#94a3b8' }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '.5rem' }}>Chưa có học viên nào</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', maxWidth: 300, margin: '0 auto' }}>
                Khóa học của bạn hiện chưa có lượt đăng ký nào. Hãy đảm bảo khóa học đã được đăng bán!
            </p>
        </div>
    );

    return (
        <div className="fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--secondary)' }}>Danh sách học viên</h3>
                    <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Tổng cộng {students.length} người đang theo học</p>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Học viên</th>
                            <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tiến độ</th>
                            <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trạng thái</th>
                            <th style={{ padding: '1rem 1.25rem', textAlign: 'right', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ngày tham gia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s, idx) => {
                            const name = s.ho_va_ten || s.ten_hoc_vien || `Học viên #${s.id_nguoi_dung}`;
                            const avatar = s.hinh_anh_hoc_vien;
                            const pct = Math.round(s.phan_tram_hoan_thanh || 0);

                            return (
                                <tr key={s.id_dang_ky} style={{ borderBottom: idx === students.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background .2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '.85rem 1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                                                background: avatar ? 'transparent' : 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800, fontSize: '.85rem', color: SELLER_ORANGE, overflow: 'hidden',
                                                border: '1px solid #fde68a'
                                            }}>
                                                {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#1e293b' }}>{name}</div>
                                                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>ID: #{s.id_nguoi_dung}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '.85rem 1.25rem', minWidth: 150 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#059669' : SELLER_ORANGE, borderRadius: '99px', transition: 'width .6s ease' }} />
                                            </div>
                                            <span style={{ fontSize: '.75rem', fontWeight: 700, color: pct >= 100 ? '#059669' : '#1e293b', width: 35, textAlign: 'right' }}>{pct}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '.85rem 1.25rem' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.2rem .65rem',
                                            borderRadius: '99px', fontSize: '.68rem', fontWeight: 700,
                                            background: s.trang_thai_hoc === 'DaXong' ? '#ecfdf5' : s.trang_thai_hoc === 'Huy' ? '#fef2f2' : '#eff6ff',
                                            color: s.trang_thai_hoc === 'DaXong' ? '#059669' : s.trang_thai_hoc === 'Huy' ? '#dc2626' : 'var(--primary)',
                                        }}>
                                            <MI name={s.trang_thai_hoc === 'DaXong' ? 'check_circle' : s.trang_thai_hoc === 'Huy' ? 'cancel' : 'auto_stories'} style={{ fontSize: '.9rem' }} />
                                            {s.trang_thai_hoc === 'DaXong' ? 'Hoàn thành' : s.trang_thai_hoc === 'Huy' ? 'Đã hủy' : 'Đang học'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '.85rem 1.25rem', textAlign: 'right', fontSize: '.8rem', color: 'var(--text-muted)' }}>
                                        {new Date(s.ngay_dang_ky).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </td>
                                </tr>
                            );
                        })}
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
    const [isEditorExpanded, setIsEditorExpanded] = useState(false);
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

    /* ── Reorder Lessons (drag & drop) ── */
    const reorderLesson = async (chId, draggedId, targetId) => {
        const ch = chapters.find(c => c.id_chuong === chId);
        if (!ch) return;
        const lessons = [...(ch.bai_giang || [])];
        const dragIdx = lessons.findIndex(l => l.id_bai_giang === draggedId);
        const targetIdx = lessons.findIndex(l => l.id_bai_giang === targetId);
        if (dragIdx === -1 || targetIdx === -1) return;

        // Swap positions
        const [moved] = lessons.splice(dragIdx, 1);
        lessons.splice(targetIdx, 0, moved);

        // Update local state immediately
        const updatedLessons = lessons.map((l, i) => ({ ...l, thu_tu: i + 1 }));
        setChapters(prev => prev.map(c => c.id_chuong === chId ? { ...c, bai_giang: updatedLessons } : c));

        // Persist to API
        try {
            await Promise.all(updatedLessons.map(l =>
                api.patch(`/lms/bai-giang/${l.id_bai_giang}/`, { thu_tu: l.thu_tu })
            ));
        } catch { showToast('Lỗi cập nhật thứ tự', 'error'); }
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
            {/* ── COMPACT TOP BAR: back + name + stats + tabs + publish ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                marginBottom: '.5rem', background: '#fff', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '.4rem .75rem', boxShadow: 'var(--shadow-sm)',
            }}>
                <button onClick={() => navigate('/seller/courses')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', fontSize: 0, flexShrink: 0 }}>
                    <MI name="arrow_back" style={{ fontSize: '1.1rem' }} />
                </button>
                <div style={{ minWidth: 0, flexShrink: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                        {course?.ten_khoa_hoc}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '.25rem', flexShrink: 0 }}>
                    <span style={{ background: 'var(--bg-app)', padding: '.1rem .4rem', borderRadius: '99px', fontSize: '.65rem', color: 'var(--text-muted)' }}>{chapters.length} chương</span>
                    <span style={{ background: 'var(--bg-app)', padding: '.1rem .4rem', borderRadius: '99px', fontSize: '.65rem', color: 'var(--text-muted)' }}>{totalLessons} bài</span>
                    {course?.cong_khai
                        ? <span style={{ background: '#ecfdf5', padding: '.1rem .4rem', borderRadius: '99px', fontSize: '.65rem', color: '#059669', fontWeight: 600 }}>● Đang bán</span>
                        : <span style={{ background: '#fef3c7', padding: '.1rem .4rem', borderRadius: '99px', fontSize: '.65rem', color: '#d97706' }}>○ Nháp</span>
                    }
                </div>

                {/* Separator */}
                <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 .25rem' }} />

                {/* Inline tabs */}
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '.3rem .6rem', border: 'none', borderRadius: '5px', cursor: 'pointer',
                        fontWeight: activeTab === tab.id ? 600 : 400,
                        background: activeTab === tab.id ? SELLER_ORANGE_LIGHT : 'transparent',
                        color: activeTab === tab.id ? SELLER_ORANGE_DARK : 'var(--text-muted)',
                        fontSize: '.75rem', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: '.25rem',
                    }}>
                        <MI name={tab.icon} style={{ fontSize: '.9rem' }} /> {tab.label}
                    </button>
                ))}

                <div style={{ flex: 1 }} />

                {/* Publish button */}
                {course?.cong_khai ? (
                    <button onClick={handleUnpublish} style={{ padding: '.25rem .6rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '5px', fontWeight: 600, cursor: 'pointer', fontSize: '.72rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '.2rem' }}>
                        <MI name="visibility_off" style={{ fontSize: '.85rem' }} /> Ẩn
                    </button>
                ) : (
                    <button onClick={handlePublish} disabled={publishing} style={{ padding: '.25rem .6rem', background: SELLER_ORANGE, color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 600, cursor: 'pointer', fontSize: '.72rem', opacity: publishing ? .7 : 1, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '.2rem' }}>
                        <MI name="publish" style={{ fontSize: '.85rem' }} /> {publishing ? 'Đang...' : 'Đăng bán'}
                    </button>
                )}
            </div>

            {/* ── CONTENT AREA ── */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* TAB: Nội dung khóa học */}
                {activeTab === 'content' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: (selectedLesson && isEditorExpanded) ? '0fr 1fr' : (selectedLesson ? '240px 1fr' : '1fr'),
                        gap: (selectedLesson && isEditorExpanded) ? '0' : '.5rem',
                        flex: 1, overflow: 'hidden', transition: 'all .3s ease-in-out'
                    }}>
                        {/* LEFT: Chapter Tree */}
                        <div className="card" style={{
                            overflow: 'auto',
                            padding: (selectedLesson && isEditorExpanded) ? '0' : '.6rem',
                            display: 'flex', flexDirection: 'column',
                            opacity: (selectedLesson && isEditorExpanded) ? 0 : 1,
                            visibility: (selectedLesson && isEditorExpanded) ? 'hidden' : 'visible',
                            width: (selectedLesson && isEditorExpanded) ? 0 : 'auto',
                            transition: 'all .3s ease-in-out',
                            border: (selectedLesson && isEditorExpanded) ? 'none' : '1px solid var(--border)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '.78rem' }}>🗂 Chương trình học</span>
                                <button onClick={addChapter} style={{ padding: '.2rem .5rem', background: SELLER_ORANGE, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '.7rem', fontWeight: 600 }}>+ Thêm</button>
                            </div>

                            {chapters.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                                    <div style={{ fontSize: '2rem' }}>📭</div>
                                    <div style={{ fontSize: '.78rem' }}>Chưa có chương nào</div>
                                    <button onClick={addChapter} style={{ padding: '.35rem .75rem', background: SELLER_ORANGE, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '.75rem' }}>+ Thêm chương đầu tiên</button>
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
                                            onReorderLesson={reorderLesson}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Lesson Editor */}
                        {selectedLesson ? (
                            <div className="card" style={{ overflow: 'auto', padding: '.75rem' }}>
                                <LessonEditor
                                    lesson={selectedLesson}
                                    onSave={saveLesson}
                                    onClose={() => setSelectedLesson(null)}
                                    isExpanded={isEditorExpanded}
                                    setIsExpanded={setIsEditorExpanded}
                                />
                            </div>
                        ) : null}
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

