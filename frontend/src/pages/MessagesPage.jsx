import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const MessagesPage = () => {
    const { user } = useAuth();
    const { messages, typingUsers, sendMessage, sendTypingStatus, recallMessage, markAsRead } = useChat();
    const [selectedUser, setSelectedUser] = useState(null);
    const [recallHoverId, setRecallHoverId] = useState(null);
    const [reply, setReply] = useState('');
    const messagesEndRef = useRef(null);
    const chatBodyRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Cuộn xuống khi chuyển người chat
    useEffect(() => {
        if (selectedUser) {
            setTimeout(() => scrollToBottom(), 50);
        }
    }, [selectedUser]);

    // Cuộn xuống khi có tin mới, nếu đang gần cuối
    useEffect(() => {
        if (!chatBodyRef.current) return;
        const el = chatBodyRef.current;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (isNearBottom) {
            setTimeout(() => scrollToBottom(), 50);
        }
    }, [messages]);

    // Cuộn xuống khi đối phương bắt đầu gõ (để typing indicator không bị ẩn)
    useEffect(() => {
        if (!selectedUser || !typingUsers[selectedUser.id]) return;
        if (!chatBodyRef.current) return;
        const el = chatBodyRef.current;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
        if (isNearBottom) {
            setTimeout(() => scrollToBottom(), 50);
        }
    }, [typingUsers, selectedUser]);

    // Đánh dấu đã xem khi mở conversation: gọi API để lưu vào DB
    const handleSelectUser = (conv) => {
        setSelectedUser(conv);
        // Gọi API đánh dấu các tin nhắn của conv.id gửi cho mình là đã xem
        markAsRead(conv.id);
    };

    // Khi đang trong conversation và có tin nhắn mới từ người đó đến, auto mark as read
    useEffect(() => {
        if (!selectedUser) return;
        // Kiểm tra có tin chưa xem từ người đang chat không
        const hasUnread = messages.some(
            m => m.id_nguoi_gui === selectedUser.id &&
                 m.id_nguoi_nhan === user?.id_nguoi_dung &&
                 !m.da_xem
        );
        if (hasUnread) {
            markAsRead(selectedUser.id);
        }
    }, [messages, selectedUser]);

    // ── Tính conversations (sidebar trái) ──
    // messages sắp xếp mới nhất trước (từ API), nhóm theo người đối thoại
    const conversationMap = messages.reduce((acc, m) => {
        const isFromMe = m.id_nguoi_gui === user?.id_nguoi_dung;
        const otherId   = isFromMe ? m.id_nguoi_nhan : m.id_nguoi_gui;
        const otherName = isFromMe ? m.ten_nguoi_nhan : m.ten_nguoi_gui;

        if (!otherId) return acc;

        if (!acc[otherId]) {
            // Tin nhắn đầu tiên gặp (= mới nhất) → dùng làm preview
            acc[otherId] = {
                id: otherId,
                name: otherName || `User #${otherId}`,
                lastMessage: m.is_recalled ? 'Tin nhắn đã được thu hồi' : m.noi_dung,
                time: m.ngay_gui,
                unread: 0,
            };
        }

        // Đếm tin CHƯA xem: phải là tin người kia GỬI CHO mình, da_xem=false
        if (!isFromMe && otherId === acc[otherId].id && !m.da_xem) {
            acc[otherId].unread += 1;
        }

        return acc;
    }, {});

    // Sắp xếp sidebar: conversation có tin mới nhất lên đầu
    const chatList = Object.values(conversationMap).sort(
        (a, b) => new Date(b.time) - new Date(a.time)
    );

    // ── Lấy tin nhắn cuộc hội thoại hiện tại (cũ → mới) ──
    const currentChat = messages
        .filter(m =>
            (m.id_nguoi_gui === user?.id_nguoi_dung && m.id_nguoi_nhan === selectedUser?.id) ||
            (m.id_nguoi_nhan === user?.id_nguoi_dung && m.id_nguoi_gui === selectedUser?.id)
        )
        .sort((a, b) => new Date(a.ngay_gui) - new Date(b.ngay_gui));

    // ── Handlers ──
    const handleSend = (e) => {
        e.preventDefault();
        const msgText = reply.trim();
        if (!msgText || !selectedUser) return;
        sendMessage(selectedUser.id, msgText);
        setReply('');
        sendTypingStatus(selectedUser.id, false);
        setTimeout(() => scrollToBottom(), 100);
    };

    const handleInputChange = (e) => {
        setReply(e.target.value);
        if (!selectedUser) return;
        sendTypingStatus(selectedUser.id, true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(selectedUser.id, false);
        }, 3000);
    };

    const handleRecall = (messageId) => {
        if (window.confirm('Bạn có chắc muốn thu hồi tin nhắn này?')) {
            recallMessage(messageId, selectedUser.id);
        }
    };

    const isPartnerTyping = selectedUser && typingUsers[selectedUser.id];

    // Badge: 9+ nếu > 9
    const getBadge = (count) => {
        if (!count || count === 0) return null;
        return count > 9 ? '9+' : String(count);
    };

    // "Đã xem": tìm id_tin_nhan cuối cùng mình gửi mà người kia đã xem (da_xem=true)
    // Duyệt từ cuối lên để lấy tin gần nhất
    const lastSeenMsgId = (() => {
        if (!selectedUser || !currentChat.length) return null;
        for (let i = currentChat.length - 1; i >= 0; i--) {
            const m = currentChat[i];
            if (
                m.id_nguoi_gui === user?.id_nguoi_dung &&
                m.da_xem === true &&
                !m.is_recalled &&
                m.id_tin_nhan  // chỉ tin đã lưu DB (có id thật)
            ) {
                return m.id_tin_nhan;
            }
        }
        return null;
    })();

    return (
        <div className="fade-up" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 320px) 1fr',
            background: '#fff',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            height: 'calc(100vh - 100px)',
            boxShadow: 'var(--shadow-md)'
        }}>

            {/* ── LEFT SIDEBAR: danh sách hội thoại ── */}
            <div style={{ borderRight: '1px solid var(--border)', background: '#FDFCF9', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Header sidebar */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 }}>
                        <MI name="chat" style={{ color: 'var(--primary)' }} />
                        Trò chuyện
                    </h2>
                    <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {chatList.length} hội thoại
                    </span>
                </div>

                {/* Danh sách conversations */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '.5rem' }}>
                    {chatList.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>
                            <MI name="forum" style={{ fontSize: '2rem', color: '#e2e8f0', display: 'block', marginBottom: '.75rem' }} />
                            Chưa có cuộc trò chuyện nào.
                        </div>
                    ) : (
                        chatList.map(c => {
                            const badge = getBadge(selectedUser?.id === c.id ? 0 : c.unread);
                            const isActive = selectedUser?.id === c.id;
                            return (
                                <div
                                    key={c.id}
                                    onClick={() => handleSelectUser(c)}
                                    style={{
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        borderRadius: '16px',
                                        marginBottom: '.25rem',
                                        background: isActive ? 'var(--primary-light)' : 'transparent',
                                        transition: 'background .15s',
                                        display: 'flex',
                                        gap: '.75rem',
                                        alignItems: 'center',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F0EDE8'; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {/* Avatar + badge */}
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{
                                            width: 44, height: 44,
                                            background: isActive ? 'var(--primary)' : 'var(--secondary)',
                                            color: '#fff',
                                            borderRadius: '14px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '1rem',
                                            boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                                            transition: 'all .15s'
                                        }}>
                                            {c.name ? c.name[0].toUpperCase() : '?'}
                                        </div>
                                        {badge && !isActive && (
                                            <span style={{
                                                position: 'absolute', top: -6, right: -6,
                                                background: '#ef4444', color: '#fff',
                                                borderRadius: '99px', fontSize: '.6rem', fontWeight: 800,
                                                minWidth: 18, height: 18,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                padding: '0 4px', border: '2px solid #FDFCF9', lineHeight: 1
                                            }}>
                                                {badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tên + preview tin */}
                                    <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: badge && !isActive ? 800 : 700,
                                            fontSize: '.9rem', color: 'var(--secondary)',
                                            marginBottom: '.1rem',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {c.name}
                                        </div>
                                        <div style={{
                                            fontSize: '.75rem',
                                            color: badge && !isActive ? 'var(--secondary)' : 'var(--text-muted)',
                                            fontWeight: badge && !isActive ? 600 : 400,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {c.lastMessage || 'Chưa có tin nhắn'}
                                        </div>
                                    </div>

                                    {/* Thời gian */}
                                    <div style={{
                                        fontSize: '.65rem',
                                        color: badge && !isActive ? '#ef4444' : '#94a3b8',
                                        fontWeight: 600, flexShrink: 0
                                    }}>
                                        {new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── RIGHT: CỬA SỔ CHAT ── */}
            <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', minWidth: 0, overflow: 'hidden' }}>
                {selectedUser ? (
                    <>
                        {/* Header chat */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', gap: '.75rem',
                            background: '#fff', flexShrink: 0,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                        }}>
                            <div style={{
                                width: 38, height: 38,
                                background: 'var(--primary)', color: '#fff',
                                borderRadius: '11px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: '1rem'
                            }}>
                                {selectedUser.name ? selectedUser.name[0].toUpperCase() : '?'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--secondary)' }}>{selectedUser.name}</div>
                                <div style={{ fontSize: '.65rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                                    <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                                    Đang trực tuyến
                                </div>
                            </div>
                        </div>

                        {/* Vùng tin nhắn - cuộn được */}
                        <div
                            ref={chatBodyRef}
                            style={{
                                flex: 1, padding: '1rem 1.5rem',
                                overflowY: 'auto', overflowX: 'hidden',
                                background: '#F9F7F4',
                                display: 'flex', flexDirection: 'column',
                                gap: '.1rem', minHeight: 0
                            }}
                        >
                            {currentChat.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '.5rem', color: 'var(--text-muted)', fontSize: '.85rem' }}>
                                    <MI name="chat_bubble_outline" style={{ fontSize: '2.5rem', color: '#e2e8f0' }} />
                                    Hãy bắt đầu cuộc trò chuyện!
                                </div>
                            ) : (
                                currentChat.map((m, i) => {
                                    const isMe = m.id_nguoi_gui === user?.id_nguoi_dung;
                                    const prevMsg = currentChat[i - 1];
                                    const nextMsg = currentChat[i + 1];
                                    const groupStart = !prevMsg || prevMsg.id_nguoi_gui !== m.id_nguoi_gui;
                                    const groupEnd   = !nextMsg || nextMsg.id_nguoi_gui !== m.id_nguoi_gui;

                                    // Bo góc theo nhóm bubble (giống Messenger)
                                    const br = isMe
                                        ? `${groupStart ? 18 : 6}px ${groupStart ? 18 : 18}px ${groupEnd ? 4 : 6}px ${groupEnd ? 18 : 18}px`
                                        : `${groupStart ? 18 : 18}px ${groupStart ? 18 : 6}px ${groupEnd ? 18 : 6}px ${groupEnd ? 4 : 18}px`;

                                    // "Đã xem": chỉ hiện dưới tin CUỐI CÙNG đã được xem
                                    const showSeen = isMe && m.id_tin_nhan === lastSeenMsgId && groupEnd;

                                    return (
                                        <div
                                            key={m.id_tin_nhan || i}
                                            onMouseEnter={() => setRecallHoverId(m.id_tin_nhan)}
                                            onMouseLeave={() => setRecallHoverId(null)}
                                            style={{
                                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                marginTop: groupStart ? '.75rem' : '.1rem',
                                                maxWidth: '70%',
                                                display: 'flex', flexDirection: 'column',
                                                alignItems: isMe ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            {/* Tên người kia (chỉ hiện đầu nhóm, conversation 1-1 thường ẩn) */}
                                            {!isMe && groupStart && (
                                                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '.2rem', paddingLeft: '.25rem' }}>
                                                    {m.ten_nguoi_gui || selectedUser.name}
                                                </div>
                                            )}

                                            {/* Bubble + nút thu hồi */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexDirection: isMe ? 'row' : 'row-reverse' }}>
                                                {/* Nút thu hồi - chỉ hiện khi hover vào tin của mình, chưa thu hồi */}
                                                {isMe && !m.is_recalled && (
                                                    <button
                                                        onClick={() => handleRecall(m.id_tin_nhan)}
                                                        style={{
                                                            background: 'none', border: 'none', padding: 0, flexShrink: 0,
                                                            cursor: 'pointer', color: '#94a3b8',
                                                            opacity: recallHoverId === m.id_tin_nhan ? 1 : 0,
                                                            transition: 'opacity .15s',
                                                            display: 'flex', alignItems: 'center'
                                                        }}
                                                        title="Thu hồi tin nhắn"
                                                    >
                                                        <MI name="settings_backup_restore" style={{ fontSize: '1rem' }} />
                                                    </button>
                                                )}

                                                {/* Bubble */}
                                                <div style={{
                                                    background: m.is_recalled
                                                        ? '#f1f5f9'
                                                        : (isMe ? 'var(--secondary)' : '#fff'),
                                                    color: m.is_recalled
                                                        ? '#94a3b8'
                                                        : (isMe ? '#fff' : 'var(--text-primary)'),
                                                    padding: '.65rem 1rem',
                                                    borderRadius: br,
                                                    fontSize: '.875rem', fontWeight: m.is_recalled ? 400 : 500,
                                                    fontStyle: m.is_recalled ? 'italic' : 'normal',
                                                    boxShadow: m.is_recalled ? 'none' : (isMe ? '0 2px 8px rgba(139,107,79,.15)' : '0 1px 4px rgba(0,0,0,.05)'),
                                                    border: m.is_recalled ? '1px dashed #cbd5e1' : 'none',
                                                    wordBreak: 'break-word', lineHeight: 1.5,
                                                    transition: 'background .2s'
                                                }}>
                                                    {m.is_recalled ? 'Tin nhắn đã được thu hồi' : m.noi_dung}
                                                </div>
                                            </div>

                                            {/* Thời gian (chỉ hiện cuối nhóm) */}
                                            {groupEnd && (
                                                <div style={{ fontSize: '.6rem', opacity: .45, marginTop: '.2rem', fontWeight: 600 }}>
                                                    {new Date(m.ngay_gui).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}

                                            {/* Trạng thái "Đã xem" - chỉ hiện dưới tin nhắn cuối đã được xem */}
                                            {isMe && m.id_tin_nhan === lastSeenMsgId && (
                                                <div style={{
                                                    fontSize: '.6rem', color: 'var(--primary)',
                                                    fontWeight: 700, marginTop: '.15rem',
                                                    display: 'flex', alignItems: 'center', gap: '.2rem'
                                                }}>
                                                    <MI name="done_all" style={{ fontSize: '.8rem', color: 'var(--primary)' }} />
                                                    Đã xem
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}

                            {/* Typing indicator - nằm trong scroll, trên messagesEndRef để tự cuộn xuống */}
                            {isPartnerTyping && (
                                <div style={{
                                    alignSelf: 'flex-start',
                                    marginTop: '.5rem',
                                    fontSize: '.78rem',
                                    color: 'var(--text-muted)',
                                    fontWeight: 500,
                                    fontStyle: 'italic',
                                    paddingLeft: '.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '.4rem'
                                }}>
                                    <span style={{ letterSpacing: '.05em', color: 'var(--primary)', fontWeight: 700, fontStyle: 'normal' }}>•••</span>
                                    {selectedUser.name} đang soạn tin...
                                </div>
                            )}

                            {/* Anchor cuộn - luôn đặt SAU typing để cuộn cover cả indicator */}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input nhập tin nhắn */}
                        <form
                            onSubmit={handleSend}
                            style={{
                                padding: '1rem 1.25rem', borderTop: '1px solid var(--border)',
                                display: 'flex', gap: '.75rem', background: '#fff',
                                flexShrink: 0, alignItems: 'center'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <input
                                    value={reply}
                                    onChange={handleInputChange}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                                    placeholder="Nhập tin nhắn..."
                                    style={{
                                        width: '100%', padding: '.85rem 1.25rem',
                                        borderRadius: '16px', border: '1.5px solid var(--border)',
                                        background: '#F8FAF9', outline: 'none',
                                        fontSize: '.9rem', fontWeight: 500,
                                        transition: 'border-color .2s', boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!reply.trim()}
                                style={{
                                    width: 46, height: 46,
                                    background: reply.trim() ? 'var(--primary)' : '#e2e8f0',
                                    color: reply.trim() ? '#fff' : '#94a3b8',
                                    border: 'none', borderRadius: '14px', cursor: reply.trim() ? 'pointer' : 'default',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all .2s', flexShrink: 0,
                                    boxShadow: reply.trim() ? '0 4px 12px rgba(200,162,122,.3)' : 'none'
                                }}
                            >
                                <MI name="send" style={{ fontSize: '1.25rem' }} />
                            </button>
                        </form>
                    </>
                ) : (
                    /* Placeholder khi chưa chọn cuộc hội thoại */
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FDFCF9' }}>
                        <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                            <MI name="forum" style={{ fontSize: '2.5rem', color: '#e2e8f0' }} />
                        </div>
                        <h3 style={{ color: 'var(--secondary)', fontWeight: 800, marginBottom: '.25rem' }}>EduHKT Messenger</h3>
                        <p style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Chọn một cuộc trò chuyện ở bên trái để bắt đầu.</p>
                    </div>
                )}
            </div>

            {/* CSS nội bộ */}
            <style>{`
                .fade-up ::-webkit-scrollbar { width: 4px; }
                .fade-up ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
                .fade-up ::-webkit-scrollbar-track { background: transparent; }
                @keyframes blink {
                    0%, 80%, 100% { opacity: 0; transform: scale(0.8); }
                    40% { opacity: 1; transform: scale(1); }
                }
                @media (max-width: 900px) {
                    .fade-up { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default MessagesPage;
