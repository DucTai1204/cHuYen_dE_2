import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const MI = ({ name, style, onClick }) => (
    <span className="material-icons" style={{ fontSize: '1.2rem', ...style }} onClick={onClick}>
        {name}
    </span>
);

const Register = () => {
    const [form, setForm] = useState({ username: '', password: '', ho_va_ten: '', email: '', vai_tro: 'HocVien' });
    const [showPassword, setShowPassword] = useState(false);
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
            <div className="auth-card fade-up" style={{ maxWidth: 520, padding: '1.75rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{
                        width: 48, height: 48, background: 'var(--primary)',
                        borderRadius: 'var(--r-md)', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#fff', marginBottom: '.75rem'
                    }}>
                        <MI name="person_add" style={{ fontSize: '1.4rem' }} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '.25rem' }}>Tạo tài khoản</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>Tham gia hệ sinh thái giáo dục số EduHKT</p>
                </div>

                {error && <div className="alert alert-danger" style={{ padding: '.65rem', fontSize: '.8rem', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid-2" style={{ gap: '.75rem' }}>
                        <div className="form-group">
                            <label className="form-label">Tên đăng nhập</label>
                            <input type="text" name="username" className="form-input" placeholder="username" value={form.username} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mật khẩu</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
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
                    </div>

                    <div className="grid-2" style={{ gap: '.75rem' }}>
                        <div className="form-group">
                            <label className="form-label">Họ và tên đầy đủ</label>
                            <input type="text" name="ho_va_ten" className="form-input" placeholder="Nguyễn Văn A" value={form.ho_va_ten} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Địa chỉ Email</label>
                            <input type="email" name="email" className="form-input" placeholder="email@demo.com" value={form.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Bạn là ai?</label>
                        <select name="vai_tro" className="form-input" value={form.vai_tro} onChange={handleChange}>
                            <option value="HocVien">Học viên (Học trực tuyến)</option>
                            <option value="GiangVien">Người bán (Kinh doanh khóa học)</option>
                            <option value="NhaTuyenDung">Nhà tuyển dụng (Tìm nhân sự)</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '.75rem 2.5rem', marginTop: '1rem', display: 'block', margin: '0 auto' }} disabled={loading}>
                        {loading ? 'Đang khởi tạo...' : 'Đăng ký'}
                    </button>
                </form>

                <div className="divider" style={{ margin: '1rem 0' }} />
                <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--text-secondary)' }}>
                    Đã có tài khoản?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
