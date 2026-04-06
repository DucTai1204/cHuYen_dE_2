import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MI = ({ name, style, onClick }) => (
    <span className="material-icons" style={{ fontSize: '1.2rem', ...style }} onClick={onClick}>
        {name}
    </span>
);

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const ok = await login(username, password);
        setLoading(false);
        if (ok) {
            try {
                const token = localStorage.getItem('access_token');
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.vai_tro === 'GiangVien') {
                    navigate('/seller/dashboard');
                } else if (payload.vai_tro === 'NhaTuyenDung') {
                    navigate('/employer/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } catch {
                navigate('/dashboard');
            }
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-up">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: 48, height: 48, background: 'var(--primary)',
                        borderRadius: 'var(--r-md)', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#fff', marginBottom: '.75rem'
                    }}>
                        <MI name="lock" style={{ fontSize: '1.4rem' }} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '.25rem' }}>Chào mừng trở lại</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>Đăng nhập để vào hệ thống EduHKT</p>
                </div>

                {error && <div className="alert alert-danger" style={{ padding: '.65rem', fontSize: '.8rem', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tên đăng nhập</label>
                        <input type="text" className="form-input" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ paddingRight: '2.5rem' }}
                                required
                            />
                            <MI
                                name={showPassword ? 'visibility_off' : 'visibility'}
                                style={{ position: 'absolute', right: '.8rem', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '.75rem 2.5rem', marginTop: '.75rem', display: 'block', margin: '0 auto' }} disabled={loading}>
                        {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="divider" style={{ margin: '1.25rem 0' }} />

                <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--text-secondary)' }}>
                    Chưa có tài khoản?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Tham gia ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
