import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const MessagesPage = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [reply, setReply] = useState('');

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000); // Tự động làm mới mỗi 10s
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/lms/tin-nhan/');
            setMessages(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Nhóm tin nhắn theo người hội thoại
    const conversations = messages.reduce((acc, m) => {
        const otherId = m.id_nguoi_gui === user?.id_nguoi_dung ? m.id_nguoi_nhan : m.id_nguoi_gui;
        const otherName = m.id_nguoi_gui === user?.id_nguoi_dung ? m.ten_nguoi_nhan : m.ten_nguoi_gui;
        
        if (!acc[otherId]) {
            acc[otherId] = { id: otherId, name: otherName, lastMessage: m.noi_dung, time: m.ngay_gui };
        }
        return acc;
    }, {});

    const chatList = Object.values(conversations);

    const currentChat = messages.filter(m => 
        (m.id_nguoi_gui === user?.id_nguoi_dung && m.id_nguoi_nhan === selectedUser?.id) ||
        (m.id_nguoi_nhan === user?.id_nguoi_dung && m.id_nguoi_gui === selectedUser?.id)
    ).reverse();

    const handleSend = async (e) => {
        e.preventDefault();
        if (!reply.trim() || !selectedUser) return;
        try {
            await api.post('/lms/tin-nhan/', {
                id_nguoi_nhan: selectedUser.id,
                noi_dung: reply
            });
            setReply('');
            fetchMessages();
        } catch (err) { alert('Không thể gửi tin nhắn'); }
    };

    return (
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '0', background: '#fff', borderRadius: '15px', border: '1px solid var(--border)', overflow: 'hidden', height: 'calc(100vh - 120px)' }}>
            
            {/* Sidebar Cuộc hội thoại */}
            <div style={{ borderRight: '1px solid var(--border)', background: '#f8fafc', overflowY: 'auto' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <MI name="chat" /> Tin nhắn
                </div>
                {chatList.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>Chưa có cuộc hội thoại nào.</div>
                ) : (
                    chatList.map(c => (
                        <div key={c.id} onClick={() => setSelectedUser(c)} style={{ padding: '1rem 1.25rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', background: selectedUser?.id === c.id ? '#fff' : 'transparent', transition: 'all .2s' }}>
                            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                                <div style={{ width: 40, height: 40, background: 'var(--primary)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{c.name[0]}</div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{c.name}</div>
                                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Cửa sổ Chat */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {selectedUser ? (
                    <>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                            <div style={{ width: 32, height: 32, background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem' }}>{selectedUser.name[0]}</div>
                            <span style={{ fontWeight: 700 }}>{selectedUser.name}</span>
                        </div>
                        
                        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {currentChat.map((m, i) => (
                                <div key={i} style={{ 
                                    alignSelf: m.id_nguoi_gui === user?.id_nguoi_dung ? 'flex-end' : 'flex-start',
                                    background: m.id_nguoi_gui === user?.id_nguoi_dung ? 'var(--primary)' : '#f1f5f9',
                                    color: m.id_nguoi_gui === user?.id_nguoi_dung ? '#fff' : 'var(--text-primary)',
                                    padding: '.75rem 1rem', borderRadius: '12px', maxWidth: '75%', fontSize: '.9rem'
                                }}>
                                    {m.noi_dung}
                                    <div style={{ fontSize: '.65rem', opacity: .7, marginTop: '.25rem', textAlign: 'right' }}>{new Date(m.ngay_gui).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                            <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Nhập tin nhắn phản hồi..." style={{ flex: 1, padding: '.75rem', borderRadius: '10px', border: '1px solid var(--border)', outline: 'none' }} />
                            <button type="submit" style={{ padding: '0 1.5rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Gửi</button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <MI name="chat_bubble_outline" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: .3 }} />
                        <p>Chọn một cuộc hội thoại để bắt đầu nhắn tin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
