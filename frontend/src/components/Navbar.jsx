import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MI = ({ name, style, className = '' }) => {
    const isSymbol = ['waving_hand', 'celebration', 'workspace_premium', 'verified', 'storefront', 'bar_chart', 'payments', 'groups', 'star_rate', 'tune', 'work', 'business'].includes(name);
    const iconClass = isSymbol ? 'material-symbols-rounded' : 'material-icons';

    return (
        <span
            className={`${iconClass} ${className}`}
            style={{
                fontSize: '1.2rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...style
            }}
        >
            {name}
        </span>
    );
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Định nghĩa menu cho từng vai trò
    const menus = {
        HocVien: [
            { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
            { icon: 'menu_book', label: 'Khóa học', path: '/courses' },
            { icon: 'chat', label: 'Tin nhắn', path: '/messages' },
            { icon: 'workspace_premium', label: 'Chứng chỉ', path: '/certificates' },
        ],
        GiangVien: [
            { icon: 'bar_chart', label: 'Tổng quan', path: '/seller/dashboard' },
            { icon: 'menu_book', label: 'Khóa học', path: '/seller/courses' },
            { icon: 'payments', label: 'Doanh thu', path: '/seller/revenue' },
            { icon: 'groups', label: 'Học viên', path: '/seller/students' },
            { icon: 'star_rate', label: 'Đánh giá', path: '/seller/reviews' },
        ],
        NhaTuyenDung: [
            { icon: 'groups', label: 'Nhân tài', path: '/employer/dashboard' },
            { icon: 'work', label: 'Tuyển dụng', path: '/employer/jobs' },
            { icon: 'chat', label: 'Tin nhắn', path: '/employer/messages' },
        ],
    };

    const currentMenu = menus[user?.vai_tro] || menus.HocVien;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand" onClick={() => navigate('/')}>
                    <div className="logo-icon">
                        <MI name={user?.vai_tro === 'GiangVien' ? 'storefront' : 'school'} style={{ color: '#fff' }} />
                    </div>
                    <div className="brand-text">
                        <h2 style={{ fontSize: '1rem', margin: 0, lineHeight: 1.2 }}>EduHKT</h2>
                        <span style={{ fontSize: '.65rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {user?.vai_tro === 'GiangVien' ? 'Kênh người bán' : 'Hệ sinh thái giáo dục'}
                        </span>
                    </div>
                </div>

                <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <nav className="navbar-nav">
                        {currentMenu.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <MI name={item.icon} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="navbar-actions">
                    <Link to="/profile" className="nav-user-btn">
                        <div className="nav-avatar-sm">
                            {user?.hinh_anh_logo ? (
                                <img src={user.hinh_anh_logo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                getInitials(user?.ho_va_ten || user?.username)
                            )}
                        </div>
                        <span className="nav-username">
                            {user?.ho_va_ten || user?.username}
                        </span>
                    </Link>

                    <div className="nav-logout-btn" onClick={handleLogout} title="Đăng xuất">
                        <MI name="logout" />
                    </div>

                    <div className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <MI name={mobileMenuOpen ? 'close' : 'menu'} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
