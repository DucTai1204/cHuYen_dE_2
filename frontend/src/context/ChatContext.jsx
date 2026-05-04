import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({}); // { userId: bool }
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const fetchInitialMessages = async () => {
        try {
            const res = await api.get('/lms/tin-nhan/');
            setMessages(res.data || []);
        } catch (err) {
            console.error('[ChatContext] Fetch error:', err);
        }
    };

    const connectSocket = () => {
        // Chỉ connect khi đã có id_nguoi_dung (sau khi refreshUser hoàn tất)
        // Tránh trường hợp user = decoded JWT (chưa có id_nguoi_dung) → URL = ws/chat/undefined/
        if (!user || !user.id_nguoi_dung || socketRef.current) return;

        const backendUrl = import.meta.env.VITE_API_BASE_URL || '';
        const wsUrl = backendUrl.replace('http', 'ws') + `/ws/chat/${user.id_nguoi_dung}/`;
        
        console.log('[ChatContext] Connecting Socket...');
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('[ChatContext] Connected');
            clearTimeout(reconnectTimeoutRef.current);
        };

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            
            if (data.type === 'chat_message') {
                setMessages(prev => {
                    // Deduplication logic
                    const isDuplicate = prev.some(m => 
                        (m.isOptimistic && m.id_nguoi_gui === parseInt(data.sender_id) && m.noi_dung === data.message) ||
                        (m.id_tin_nhan === data.id_tin_nhan)
                    );

                    if (isDuplicate) {
                        return prev.map(m => 
                            ((m.isOptimistic && m.id_nguoi_gui === parseInt(data.sender_id) && m.noi_dung === data.message) || m.id_tin_nhan === data.id_tin_nhan)
                            ? { ...m, isOptimistic: false, id_tin_nhan: data.id_tin_nhan, ngay_gui: data.ngay_gui }
                            : m
                        );
                    }

                    return [{
                        id_tin_nhan: data.id_tin_nhan,
                        id_nguoi_gui: parseInt(data.sender_id),
                        id_nguoi_nhan: parseInt(data.receiver_id),
                        noi_dung: data.message,
                        ngay_gui: data.ngay_gui,
                        ten_nguoi_gui: data.sender_name,
                        isOptimistic: false,
                        is_recalled: false,
                        da_xem: false,  // Tin mới đến = chưa xem
                    }, ...prev];
                });
            } else if (data.type === 'recall_message') {
                setMessages(prev => prev.map(m => 
                    m.id_tin_nhan === data.message_id 
                    ? { ...m, is_recalled: true, noi_dung: '' } 
                    : m
                ));
            } else if (data.type === 'message_seen') {
                // Người nhận đã xem tin của mình → cập nhật da_xem cho tất cả tin mình gửi cho họ
                const viewerId = data.viewer_id;
                setMessages(prev => prev.map(m =>
                    (m.id_nguoi_gui === parseInt(data.sender_id) &&
                     m.id_nguoi_nhan === viewerId &&
                     !m.da_xem)
                    ? { ...m, da_xem: true }
                    : m
                ));
            } else if (data.type === 'typing') {
                setTypingUsers(prev => ({ ...prev, [data.sender_id]: true }));
            } else if (data.type === 'stop_typing') {
                setTypingUsers(prev => ({ ...prev, [data.sender_id]: false }));
            }
        };

        socket.onclose = () => {
            console.log('[ChatContext] Socket closed. Retrying in 3s...');
            socketRef.current = null;
            reconnectTimeoutRef.current = setTimeout(connectSocket, 3000);
        };

        socketRef.current = socket;
    };

    useEffect(() => {
        if (user) {
            fetchInitialMessages();
            connectSocket();
        } else {
            if (socketRef.current) socketRef.current.close();
            setMessages([]);
        }

        return () => {
            if (socketRef.current) socketRef.current.close();
            clearTimeout(reconnectTimeoutRef.current);
        };
    }, [user]);

    const sendMessage = (receiverId, content) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        // Optimistic Update
        const optimisticMsg = {
            id_nguoi_gui: user.id_nguoi_dung,
            id_nguoi_nhan: parseInt(receiverId),
            noi_dung: content,
            ngay_gui: new Date().toISOString(),
            ten_nguoi_gui: user.ho_va_ten || user.username,
            isOptimistic: true
        };
        setMessages(prev => [optimisticMsg, ...prev]);

        socketRef.current.send(JSON.stringify({
            type: 'chat_message',
            sender_id: user.id_nguoi_dung,
            receiver_id: parseInt(receiverId),
            message: content
        }));
    };

    const sendTypingStatus = (receiverId, isTyping) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        socketRef.current.send(JSON.stringify({
            type: isTyping ? 'typing' : 'stop_typing',
            sender_id: user.id_nguoi_dung,
            receiver_id: parseInt(receiverId)
        }));
    };

    const recallMessage = (messageId, receiverId) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        socketRef.current.send(JSON.stringify({
            type: 'recall_message',
            message_id: messageId,
            sender_id: user.id_nguoi_dung,
            receiver_id: parseInt(receiverId)
        }));
    };

    // Gọi API đánh dấu đã xem - backend sẽ push WS event cho người gửi
    const markAsRead = async (senderId) => {
        if (!senderId) return;
        try {
            await api.post('/lms/tin-nhan/doc-tin-nhan/', { sender_id: senderId });
            // Cập nhật local state ngay (optimistic) - tránh chờ WS
            setMessages(prev => prev.map(m =>
                (m.id_nguoi_gui === parseInt(senderId) &&
                 m.id_nguoi_nhan === user.id_nguoi_dung &&
                 !m.da_xem)
                ? { ...m, da_xem: true }
                : m
            ));
        } catch (err) {
            console.error('[ChatContext] markAsRead error:', err);
        }
    };

    return (
        <ChatContext.Provider value={{ messages, setMessages, typingUsers, sendMessage, sendTypingStatus, recallMessage, markAsRead }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
