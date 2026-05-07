import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MI = ({ name, style, onClick, className = '' }) => (
    <span 
        className={`material-icons ${className}`} 
        style={{ fontSize: '1.2rem', verticalAlign: 'middle', ...style }} 
        onClick={onClick}
    >
        {name}
    </span>
);

const AuthModal = () => {
    const { authModal, closeAuthModal, login } = useAuth();
    const [type, setType] = useState(authModal.type || 'login'); // 'login' | 'register'
    const navigate = useNavigate();

    // Login states
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    
    // Register states
    const [registerData, setRegisterData] = useState({ 
        username: '', password: '', ho_va_ten: '', email: '', vai_tro: 'HocVien' 
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authModal.type) {
            setType(authModal.type);
            setError('');
        }
    }, [authModal.type, authModal.isOpen]);

    if (!authModal.isOpen) return null;

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const ok = await login(loginData.username, loginData.password);
        setLoading(false);
        if (ok) {
            closeAuthModal();
            // Redirect based on role (logic from Login.jsx)
            const token = localStorage.getItem('access_token');
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.vai_tro === 'GiangVien') navigate('/seller/dashboard');
            else if (payload.vai_tro === 'NhaTuyenDung') navigate('/employer/dashboard');
            else navigate('/dashboard');
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/register/', registerData);
            setType('login');
            setError('Đăng ký thành công! Vui lòng đăng nhập.');
        } catch (err) {
            setError(err.response?.data?.username?.[0] || 'Đăng ký thất bại, kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target.className === 'modal-overlay') closeAuthModal();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-close" onClick={closeAuthModal}>
                    <MI name="close" />
                </div>

                <div className="modal-body">
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: type === 'login' ? '2rem' : '1.25rem' }}>
                        <div style={{
                            width: type === 'login' ? 56 : 44, 
                            height: type === 'login' ? 56 : 44, 
                            background: 'var(--primary)',
                            borderRadius: 'var(--r-lg)', display: 'inline-flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: '#fff', marginBottom: '.75rem',
                            boxShadow: '0 8px 16px rgba(200, 162, 122, 0.2)'
                        }}>
                            <MI name={type === 'login' ? 'lock' : 'person_add'} style={{ fontSize: type === 'login' ? '1.6rem' : '1.3rem' }} />
                        </div>
                        <h2 style={{ fontSize: type === 'login' ? '1.5rem' : '1.35rem', marginBottom: '.25rem', color: 'var(--secondary)' }}>
                            {type === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                        </h2>
                        {type === 'login' && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
                                Đăng nhập để tiếp tục học tập cùng EduHKT
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className={`alert ${error.includes('thành công') ? 'alert-success' : 'alert-danger'}`} 
                             style={{ padding: '.75rem 1rem', fontSize: '.85rem', marginBottom: '1.5rem' }}>
                            <MI name={error.includes('thành công') ? 'check_circle' : 'error_outline'} style={{ fontSize: '1rem' }} />
                            {error}
                        </div>
                    )}

                    {type === 'login' ? (
                        <form onSubmit={handleLoginSubmit}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label" style={{ fontSize: '.75rem' }}>Tên đăng nhập</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Nhập tên đăng nhập" 
                                    value={loginData.username} 
                                    onChange={e => setLoginData({ ...loginData, username: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label" style={{ fontSize: '.75rem' }}>Mật khẩu</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={loginData.password}
                                        onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                        style={{ paddingRight: '3rem' }}
                                        required
                                    />
                                    <MI
                                        name={showPassword ? 'visibility_off' : 'visibility'}
                                        style={{ 
                                            position: 'absolute', right: '1rem', 
                                            color: 'var(--text-muted)', cursor: 'pointer',
                                            padding: '.25rem'
                                        }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '.85rem' }} disabled={loading}>
                                {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: '.75rem', marginBottom: '.35rem' }}>Tên đăng nhập</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="username" 
                                        style={{ padding: '.65rem .9rem' }}
                                        value={registerData.username} 
                                        onChange={e => setRegisterData({ ...registerData, username: e.target.value })} 
                                        required 
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: '.75rem', marginBottom: '.35rem' }}>Mật khẩu</label>
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="••••••••" 
                                        style={{ padding: '.65rem .9rem' }}
                                        value={registerData.password} 
                                        onChange={e => setRegisterData({ ...registerData, password: e.target.value })} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                <label className="form-label" style={{ fontSize: '.75rem', marginBottom: '.35rem' }}>Họ và tên</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Nguyễn Văn A" 
                                    style={{ padding: '.65rem .9rem' }}
                                    value={registerData.ho_va_ten} 
                                    onChange={e => setRegisterData({ ...registerData, ho_va_ten: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                <label className="form-label" style={{ fontSize: '.75rem', marginBottom: '.35rem' }}>Email</label>
                                <input 
                                    type="email" 
                                    className="form-input" 
                                    placeholder="example@gmail.com" 
                                    style={{ padding: '.65rem .9rem' }}
                                    value={registerData.email} 
                                    onChange={e => setRegisterData({ ...registerData, email: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label" style={{ fontSize: '.75rem', marginBottom: '.35rem' }}>Vai trò của bạn</label>
                                <div style={{ display: 'flex', gap: '.5rem' }}>
                                    {[
                                        { val: 'HocVien', label: 'Học viên', icon: 'school' },
                                        { val: 'GiangVien', label: 'Giảng viên', icon: 'person_outline' },
                                        { val: 'NhaTuyenDung', label: 'Tuyển dụng', icon: 'business_center' }
                                    ].map(role => (
                                        <div 
                                            key={role.val}
                                            onClick={() => setRegisterData({ ...registerData, vai_tro: role.val })}
                                            style={{
                                                flex: 1, padding: '.6rem .25rem', textAlign: 'center',
                                                border: `2px solid ${registerData.vai_tro === role.val ? 'var(--primary)' : 'var(--border)'}`,
                                                borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'var(--t)',
                                                background: registerData.vai_tro === role.val ? 'var(--primary-light)' : 'transparent',
                                                color: registerData.vai_tro === role.val ? 'var(--primary-dark)' : 'var(--text-secondary)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.25rem'
                                            }}
                                        >
                                            <MI name={role.icon} style={{ fontSize: '1.1rem', color: 'inherit' }} />
                                            <span style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase' }}>{role.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '.85rem' }} disabled={loading}>
                                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
                            </button>
                        </form>
                    )}

                    <div className="divider" style={{ margin: '1.5rem 0', opacity: 0.5 }} />

                    <p style={{ textAlign: 'center', fontSize: '.9rem', color: 'var(--text-secondary)' }}>
                        {type === 'login' ? (
                            <>
                                Chưa có tài khoản?{' '}
                                <span 
                                    style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                                    onClick={() => setType('register')}
                                >
                                    Đăng ký ngay
                                </span>
                            </>
                        ) : (
                            <>
                                Đã có tài khoản?{' '}
                                <span 
                                    style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                                    onClick={() => setType('login')}
                                >
                                    Đăng nhập
                                </span>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
