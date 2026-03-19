import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const TalentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [talent, setTalent] = useState(location.state?.talent || null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState([]);
    const [certs, setCerts] = useState([]);

    useEffect(() => {
        // Fetch talent info if not passed via state
        if (!talent) {
            // In a real app we'd fetch by ID, but since all-talent has everything, we could just filter
            // Let's assume talent is passed or we re-fetch all-talent and find this ID
            api.get('/lms/dang-ky-hoc/all-talent/')
                .then(res => {
                    const found = res.data.find(t => t.id_user === parseInt(id));
                    setTalent(found);
                });
        }

        // Fetch Certificates
        api.get(`/certificates/chung-chi-so/?id_user=${id}`)
            .then(res => setCerts(res.data || []))
            .catch(err => console.error('Lỗi tải chứng chỉ:', err));

        // Fetch message history
        fetchMessages();
    }, [id]);

    const fetchMessages = () => {
        api.get('/lms/tin-nhan/')
            .then(res => {
                // Filter messages between current employer and this talent
                const chat = res.data.filter(m => 
                    (m.id_nguoi_nhan === parseInt(id)) || (m.id_nguoi_gui === parseInt(id))
                );
                setHistory(chat.reverse()); // Show oldest first for chat flow
            });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSending(true);
        try {
            await api.post('/lms/tin-nhan/', {
                id_nguoi_nhan: talent.id_user,
                noi_dung: message
            });
            setMessage('');
            fetchMessages(); // Refresh chat
        } catch (err) {
            alert('Lỗi gửi tin nhắn');
        } finally {
            setSending(false);
        }
    };

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
                        <div style={{ width: 100, height: 100, background: '#1e3a8a', color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                            {talent.ho_va_ten[0]}
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{talent.ho_va_ten}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>@{talent.username}</p>
                        
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.9rem' }}><MI name="email" style={{ color: '#1e3a8a' }} /> {talent.email}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.9rem' }}><MI name="verified" style={{ color: '#059669' }} /> Chứng chỉ gần nhất: {talent.ten_khoa_hoc}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.9rem' }}><MI name="event" style={{ color: '#1e3a8a' }} /> Hoàn thành: {new Date(talent.ngay_hoan_thanh).toLocaleDateString('vi-VN')}</div>
                        </div>

                        <button 
                            onClick={async () => {
                                if (!window.confirm(`Bạn có chắc chắn muốn tuyển dụng ${talent.ho_va_ten} dựa trên chứng chỉ ${talent.ten_khoa_hoc}?`)) return;
                                try {
                                    await api.post('/lms/tuyen-dung/', {
                                        id_hoc_vien: talent.id_user,
                                        id_khoa_hoc: talent.id_khoa_hoc,
                                        ghi_chu: `Tuyển dụng qua hệ thống dựa trên khóa học ${talent.ten_khoa_hoc}`
                                    });
                                    alert('Chúc mừng! Bạn đã ghi nhận tuyển dụng thành công. Lời mời đã được gửi tới học viên để xác nhận.');
                                } catch (err) {
                                    alert(err.response?.data?.detail || 'Lỗi khi ghi nhận tuyển dụng');
                                }
                            }}
                            style={{ width: '100%', marginTop: '2rem', padding: '.85rem', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', boxShadow: '0 4px 12px rgba(30,58,138,.3)' }}
                        >
                            <MI name="work" /> Tuyển dụng nhân tài
                        </button>
                    </div>

                    {/* CERTIFICATES LIST SECTION */}
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
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
                                            Bên cấp: <strong style={{ color: 'var(--text-primary)' }}>{c.ten_to_chuc_cap || 'Hệ thống EduChain'}</strong>
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
                </div>

                {/* Right Side: Chat Interface */}
                <div style={{ background: '#fff', borderRadius: '15px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '600px', boxShadow: 'var(--shadow-sm)' }}>
                    {/* Chat Header */}
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div style={{ width: 32, height: 32, background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', fontWeight: 700 }}>{talent.ho_va_ten[0]}</div>
                        <span style={{ fontWeight: 700 }}>Trò chuyện với {talent.ho_va_ten}</span>
                    </div>

                    {/* Chat Messages */}
                    <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                        {history.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '.85rem' }}>Chưa có tin nhắn nào. Hãy gửi tin tuyển dụng ngay!</div>
                        ) : (
                            history.map((m, idx) => (
                                <div key={idx} style={{ 
                                    alignSelf: m.id_nguoi_nhan === talent.id_user ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    padding: '.75rem 1rem',
                                    borderRadius: '12px',
                                    background: m.id_nguoi_nhan === talent.id_user ? '#1e3a8a' : '#fff',
                                    color: m.id_nguoi_nhan === talent.id_user ? '#fff' : 'var(--text-primary)',
                                    boxShadow: '0 1px 2px rgba(0,0,0,.05)',
                                    border: m.id_nguoi_nhan === talent.id_user ? 'none' : '1px solid #e2e8f0',
                                    fontSize: '.9rem'
                                }}>
                                    {m.noi_dung}
                                    <div style={{ fontSize: '.65rem', opacity: .7, marginTop: '.25rem', textAlign: 'right' }}>
                                        {new Date(m.ngay_gui).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.75rem' }}>
                        <input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập nội dung tin nhắn tuyển dụng..." 
                            style={{ flex: 1, padding: '.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                        <button type="submit" disabled={sending} style={{ width: 45, height: 45, background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MI name="send" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TalentProfile;
