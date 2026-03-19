import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [form, setForm] = useState({ username: '', password: '', ho_va_ten: '', email: '', vai_tro: 'HocVien' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            await api.post('/auth/register/', form);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.username?.[0] || 'Đăng ký thất bại, kiểm tra lại thông tin.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-up" style={{ maxWidth: 480 }}>
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{ width: 52, height: 52, background: 'var(--secondary)', borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#fff', marginBottom: '1rem' }}>✨</div>
                    <h2 style={{ fontWeight: 700, fontSize: '1.3rem' }}>Tạo tài khoản</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.875rem', marginTop: '.3rem' }}>Tham gia hệ sinh thái giáo dục số</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Tên đăng nhập</label>
                            <input type="text" name="username" className="form-input" placeholder="username" value={form.username} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mật khẩu</label>
                            <input type="password" name="password" className="form-input" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Họ và tên đầy đủ</label>
                        <input type="text" name="ho_va_ten" className="form-input" placeholder="Nguyễn Văn A" value={form.ho_va_ten} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Địa chỉ Email</label>
                        <input type="email" name="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Vai trò</label>
                        <select name="vai_tro" className="form-input" value={form.vai_tro} onChange={handleChange}>
                            <option value="HocVien">🎒 Học viên</option>
                            <option value="GiangVien">🏪 Người bán khóa học</option>
                            <option value="NhaTuyenDung">🏢 Nhà tuyển dụng</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" style={{ padding: '.75rem' }} disabled={loading}>
                        {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
                    </button>
                </form>

                <div className="divider" />
                <p style={{ textAlign: 'center', fontSize: '.875rem', color: 'var(--text-secondary)' }}>
                    Đã có tài khoản?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
