import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useChat } from '../../context/ChatContext';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const TalentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { messages, sendMessage, sendTypingStatus, typingUsers, recallMessage } = useChat();
    const [talent, setTalent] = useState(location.state?.talent || null);
    const [recallHoverId, setRecallHoverId] = useState(null);
    const [message, setMessage] = useState('');
    const [certs, setCerts] = useState([]);
    const [courseHistory, setCourseHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Fetch talent info if not passed via state
        if (!talent) {
            api.get('/lms/dang-ky-hoc/all-talent/')
                .then(res => {
                    const found = res.data.find(t => t.id_user === parseInt(id));
                    setTalent(found);
                });
        }


        // Fetch Course History (All finished courses)
        setLoadingHistory(true);
        api.get(`/lms/dang-ky-hoc/talent-courses/${id}/`)
            .then(res => setCourseHistory(res.data || []))
            .catch(err => console.error('Lỗi tải lịch sử học tập:', err))
            .finally(() => setLoadingHistory(false));

        // Fetch Certificates
        api.get(`/certificates/chung-chi-so/?id_user=${id}`)
            .then(res => setCerts(res.data || []))
            .catch(err => console.error('Lỗi tải chứng chỉ:', err));
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        sendMessage(id, message);
        setMessage('');
        sendTypingStatus(id, false);
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        sendTypingStatus(id, true);

        const typingTimeout = setTimeout(() => {
            sendTypingStatus(id, false);
        }, 3000);
        return () => clearTimeout(typingTimeout);
    };

    const handleRecall = (messageId) => {
        if (window.confirm('Bạn có chắc muốn thu hồi tin nhắn này?')) {
            recallMessage(messageId, id);
        }
    };

    // Lọc tin nhắn cục bộ cho ứng viên này
    const chatHistory = messages.filter(m =>
        (m.id_nguoi_nhan === parseInt(id)) || (m.id_nguoi_gui === parseInt(id))
    ).reverse();

    const isTyping = typingUsers[id];

    if (!talent) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải thông tin ứng viên...</div>;

    return (
        <div className="fade-up" style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Back Button */}
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
                <MI name="arrow_back" /> Quay lại danh sách nhân tài
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Left Side: Profile Info */}
                <div>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '15px', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
                        <div style={{ width: 100, height: 100, background: '#1e3a8a', color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', overflow: 'hidden' }}>
                            {talent.hinh_anh_logo ? (
                                <img src={talent.hinh_anh_logo} alt={talent.ho_va_ten} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                talent.ho_va_ten[0]
                            )}
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{talent.ho_va_ten}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>@{talent.username}</p>

                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.9rem' }}><MI name="email" style={{ color: '#1e3a8a' }} /> {talent.email}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.9rem' }}>
                                <MI name="verified" style={{ color: '#059669' }} /> 
                                <span>Đã tốt nghiệp <strong>{talent.completed_courses?.length || 1}</strong> khóa học</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.9rem' }}><MI name="star" style={{ color: '#f59e0b' }} /> Uy tín: {talent.trung_binh_sao_ntd || '—'}/5.0</div>
                        </div>

                        {(() => {
                            const isHiredAny = talent.completed_courses?.some(c => c.recruitment_status === 'DaDongY');
                            const isPendingAny = talent.completed_courses?.some(c => c.recruitment_status === 'ChoXacNhan');
                            
                            // Trạng thái cụ thể cho khóa học này
                            const currentHired = talent.completed_courses?.some(c => c.id_khoa_hoc == talent.id_khoa_hoc && c.recruitment_status === 'DaDongY');
                            const currentPending = talent.completed_courses?.some(c => c.id_khoa_hoc == talent.id_khoa_hoc && c.recruitment_status === 'ChoXacNhan');

                            const displayHired = isHiredAny || currentHired;
                            const displayPending = isPendingAny || currentPending;

                            return (
                                <button
                                    disabled={displayHired || displayPending}
                                    onClick={async () => {
                                        if (!window.confirm(`Bạn có chắc chắn muốn tuyển dụng ${talent.ho_va_ten} dựa trên chứng chỉ ${talent.ten_khoa_hoc}?`)) return;
                                        try {
                                            await api.post('/lms/tuyen-dung/', {
                                                id_hoc_vien: talent.id_user,
                                                id_khoa_hoc: talent.id_khoa_hoc,
                                                ghi_chu: `Tuyển dụng qua hệ thống dựa trên khóa học ${talent.ten_khoa_hoc}`
                                            });
                                            alert('Chúc mừng! Bạn đã ghi nhận tuyển dụng thành công. Lời mời đã được gửi tới học viên để xác nhận.');
                                            // Cập nhật state local để đổi màu nút ngay lập tức
                                            setTalent(prev => ({
                                                ...prev,
                                                completed_courses: prev.completed_courses.map(c => 
                                                    c.id_khoa_hoc === talent.id_khoa_hoc ? { ...c, recruitment_status: 'ChoXacNhan' } : c
                                                )
                                            }));
                                        } catch (err) {
                                            alert(err.response?.data?.detail || 'Lỗi khi ghi nhận tuyển dụng');
                                        }
                                    }}
                                    style={{ 
                                        width: '100%', marginTop: '2rem', padding: '.85rem', 
                                        background: displayHired ? '#059669' : (displayPending ? '#d97706' : '#1e3a8a'), 
                                        color: '#fff', border: 'none', borderRadius: '10px', 
                                        fontWeight: 800, cursor: (displayHired || displayPending) ? 'default' : 'pointer', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', 
                                        boxShadow: '0 4px 12px rgba(30,58,138,.3)',
                                        opacity: (displayHired || displayPending) ? 0.8 : 1,
                                        transition: 'all .25s'
                                    }}
                                >
                                    <MI name={displayHired ? 'verified' : (displayPending ? 'hourglass_empty' : 'work')} /> 
                                    {displayHired ? 'Đã tuyển dụng thành công' : (displayPending ? 'Đang chờ xác nhận...' : 'Tuyển dụng nhân tài')}
                                </button>
                            );
                        })()}
                    </div>

                    {/* CERTIFICATES LIST SECTION */}
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <MI name="workspace_premium" style={{ color: '#f59e0b' }} /> Chứng chỉ & Bằng cấp ({certs.length})
                        </h3>

                        {certs.length === 0 ? (
                            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Chưa có chứng chỉ chính thức được cấp.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {certs.map(c => (
                                    <div key={c.ma_uuid_chung_chi} style={{ padding: '1rem', border: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '10px', transition: 'all .2s' }}>
                                        <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#1e3a8a', marginBottom: '.25rem' }}>{c.ten_khoa_hoc}</div>
                                        <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>
                                            Bên cấp: <strong style={{ color: 'var(--text-primary)' }}>{c.ten_to_chuc_cap || 'Hệ thống EduHKT'}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.7rem' }}>
                                            <span style={{ color: '#059669', fontWeight: 700 }}>Ngày cấp: {new Date(c.ngay_cap).toLocaleDateString('vi-VN')}</span>
                                            <a href={`/verify/${c.ma_uuid_chung_chi}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.2rem' }}>
                                                Xác thực <MI name="open_in_new" style={{ fontSize: '.8rem' }} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COURSE HISTORY SECTION */}
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <MI name="history" style={{ color: '#1e3a8a' }} /> Các khóa học đã học ({courseHistory.length})
                        </h3>

                        {loadingHistory ? (
                            <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>Đang tải lịch sử...</div>
                        ) : courseHistory.length === 0 ? (
                            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>Chưa có lịch sử học tập khác.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                                {courseHistory.map((h, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                                            {h.hinh_anh_thumbnail ? <img 
                                                src={h.hinh_anh_thumbnail?.replace('maxresdefault.jpg', 'hqdefault.jpg')} 
                                                alt="" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                onError={e => e.target.style.display = 'none'}
                                            /> : <MI name="school" style={{ color: '#cbd5e1', margin: '10px' }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                {h.ten_khoa_hoc}
                                                {h.recruitment_status === 'DaDongY' && <span style={{ color: '#059669', fontSize: '.65rem', fontWeight: 800, background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>ĐÃ TUYỂN</span>}
                                                {h.recruitment_status === 'ChoXacNhan' && <span style={{ color: '#d97706', fontSize: '.65rem', fontWeight: 800, background: '#fffbeb', padding: '1px 6px', borderRadius: '4px' }}>ĐANG CHỜ</span>}
                                            </div>
                                            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>Xong ngày: {new Date(h.ngay_hoan_thanh).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Syllabus & Chat */}
                {/* Right Side: Chat & Skills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Chat Interface (Moved to Top) */}
                    <div style={{ background: '#fff', borderRadius: '15px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '450px', boxShadow: 'var(--shadow-sm)' }}>
                        {/* Chat Header */}
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 }}>
                            <div style={{ width: 32, height: 32, background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', fontWeight: 700 }}>{talent.ho_va_ten[0]}</div>
                            <span style={{ fontWeight: 700 }}>Nhắn tin tuyển dụng cho {talent.ho_va_ten}</span>
                        </div>

                        {/* Chat Messages */}
                        <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                            {chatHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '.85rem' }}>Hãy gửi tin nhắn đầu tiên để bắt đầu quá trình tuyển dụng.</div>
                            ) : (
                                chatHistory.map((m, idx) => {
                                    const isMe = m.id_nguoi_nhan === parseInt(id);
                                    return (
                                        <div
                                            key={idx}
                                            onMouseEnter={() => setRecallHoverId(m.id_tin_nhan)}
                                            onMouseLeave={() => setRecallHoverId(null)}
                                            style={{
                                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                maxWidth: '80%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isMe ? 'flex-end' : 'flex-start',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexDirection: isMe ? 'row' : 'row-reverse' }}>
                                                {isMe && !m.is_recalled && (
                                                    <button
                                                        onClick={() => handleRecall(m.id_tin_nhan)}
                                                        style={{
                                                            background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8',
                                                            opacity: recallHoverId === m.id_tin_nhan ? 1 : 0, transition: 'var(--t)', display: 'flex', alignItems: 'center'
                                                        }}
                                                        title="Thu hồi tin nhắn"
                                                    >
                                                        <MI name="settings_backup_restore" style={{ fontSize: '1rem' }} />
                                                    </button>
                                                )}
                                                <div style={{
                                                    padding: '.75rem 1rem',
                                                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                    background: m.is_recalled ? '#f1f5f9' : (isMe ? '#1e3a8a' : '#fff'),
                                                    color: m.is_recalled ? '#94a3b8' : (isMe ? '#fff' : 'var(--text-primary)'),
                                                    boxShadow: m.is_recalled ? 'none' : '0 1px 2px rgba(0,0,0,.05)',
                                                    border: m.is_recalled ? '1px dashed #cbd5e1' : (isMe ? 'none' : '1px solid #e2e8f0'),
                                                    fontSize: '.9rem',
                                                    fontStyle: m.is_recalled ? 'italic' : 'normal'
                                                }}>
                                                    {m.is_recalled ? 'Tin nhắn đã được thu hồi' : m.noi_dung}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '.65rem', opacity: .7, marginTop: '.25rem', textAlign: 'right' }}>
                                                {new Date(m.ngay_gui).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.75rem', color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        <span style={{ width: 4, height: 4, background: '#cbd5e1', borderRadius: '50%', animation: 'blink 1.4s infinite' }}></span>
                                        <span style={{ width: 4, height: 4, background: '#cbd5e1', borderRadius: '50%', animation: 'blink 1.4s infinite .2s' }}></span>
                                        <span style={{ width: 4, height: 4, background: '#cbd5e1', borderRadius: '50%', animation: 'blink 1.4s infinite .4s' }}></span>
                                    </div>
                                    <span>{talent.ho_va_ten} đang soạn tin...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.75rem', flexShrink: 0 }}>
                            <input
                                value={message}
                                onChange={handleInputChange}
                                placeholder="Nhập nội dung trao đổi tuyển dụng..."
                                style={{ flex: 1, padding: '.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                            />
                            <button type="submit" style={{ width: 45, height: 45, background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MI name="send" />
                            </button>
                        </form>
                    </div>

                    {/* SKILLS ACHIEVED (Compact) */}
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem', color: '#1e3a8a' }}>
                            <MI name="stars" style={{ color: '#f59e0b' }} /> Kỹ năng thực tế đạt được
                        </h3>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
                            {talent.ky_nang_khoa_hoc && talent.ky_nang_khoa_hoc.length > 0 ? (
                                talent.ky_nang_khoa_hoc.map((kn, i) => (
                                    <div key={i} title={kn.mo_ta} style={{ padding: '.5rem .75rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                        <MI name="check_circle" style={{ color: '#0369a1', fontSize: '1rem' }} />
                                        <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#0369a1' }}>{kn.ten_ky_nang}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '.85rem', fontStyle: 'italic' }}>Chưa có kỹ năng xác thực từ khóa học.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TalentProfile;
