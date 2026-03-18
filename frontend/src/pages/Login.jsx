import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
            // Đọc vai trò từ token vừa lưu
            try {
                const token = localStorage.getItem('access_token');
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.vai_tro === 'GiangVien') {
                    navigate('/seller/dashboard');
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
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{ width: 52, height: 52, background: 'var(--primary)', borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#fff', marginBottom: '1rem' }}>🎓</div>
                    <h2 style={{ fontWeight: 700, fontSize: '1.3rem' }}>Đăng nhập</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.875rem', marginTop: '.3rem' }}>Chào mừng trở lại EduChain</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tên đăng nhập</label>
                        <input type="text" className="form-input" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '.5rem', padding: '.75rem', fontSize: '.95rem' }} disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Vào hệ thống'}
                    </button>
                </form>

                <div className="divider" />

                <p style={{ textAlign: 'center', fontSize: '.875rem', color: 'var(--text-secondary)' }}>
                    Chưa có tài khoản?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng ký ngay</Link>
                </p>

                {/* Demo hint */}
                <div style={{ marginTop: '1rem', padding: '.75rem 1rem', background: 'var(--primary-light)', borderRadius: 'var(--r-sm)', fontSize: '.78rem', color: 'var(--primary)' }}>
                    <strong>Tài khoản demo</strong> (mật khẩu: 123456)<br />
                    🏪 <code>giangvien1</code> = Người bán &nbsp;·&nbsp; 🎒 Học viên thường
                </div>
            </div>
        </div>
    );
};

export default Login;
