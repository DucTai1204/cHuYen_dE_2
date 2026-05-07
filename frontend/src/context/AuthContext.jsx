import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' }); // 'login' | 'register'

    // Parse JWT token cơ bản để lấy roles (trong thực tế có thể gọi /api/auth/me)
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    // Hàm cập nhật user từ API để lấy đủ logo/avatar (vì JWT không chứa cái này)
    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/profile/');
            setUser(prev => ({ ...prev, ...res.data }));
        } catch (error) {
            console.error('Không thể làm mới thông tin người dùng:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            const decoded = parseJwt(token);
            setUser({ ...decoded, token });
            refreshUser(); // Gọi thêm để lấy logo, bio...
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await api.post('/auth/login/', { username, password });
            const { access, refresh } = res.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            const decoded = parseJwt(access);
            setUser({ ...decoded, token: access });
            await refreshUser(); // Lấy đủ profile ngay sau khi login
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const openAuthModal = useCallback((type = 'login') => setAuthModal({ isOpen: true, type }), []);
    const closeAuthModal = useCallback(() => setAuthModal({ isOpen: false, type: 'login' }), []);

    return (
        <AuthContext.Provider value={{
            user, setUser, login, logout, loading, refreshUser,
            authModal, openAuthModal, closeAuthModal
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
