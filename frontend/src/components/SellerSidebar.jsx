import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const sellerMenu = [
    { icon: 'bar_chart', label: 'Tổng quan', path: '/seller/dashboard' },
    { icon: 'menu_book', label: 'Khóa học của tôi', path: '/seller/courses' },
    { icon: 'payments', label: 'Doanh thu', path: '/seller/revenue' },
    { icon: 'groups', label: 'Học viên', path: '/seller/students' },
    { icon: 'star_rate', label: 'Đánh giá', path: '/seller/reviews' },
    { icon: 'tune', label: 'Cài đặt trang', path: '/seller/settings' },
];

const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const SellerSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <aside className="sidebar">
            {/* Logo - Clickable to Profile */}
            <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div className="sidebar-logo" style={{ cursor: 'pointer' }}>
                    <div className="logo-icon" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '1.3rem' }}>
                        <MI name="storefront" style={{ fontSize: '1.4rem' }} />
                    </div>
                    <h2 style={{ color: '#fff' }}>EduHKT Seller</h2>
                    <span>Kênh người bán</span>
                </div>
            </Link>

            {/* User - Clickable to Profile */}
            <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div className="sidebar-user" style={{ cursor: 'pointer', transition: 'var(--t)' }}>
                    <div className="user-avatar-lg" style={{
                        background: 'var(--primary)',
                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {user?.hinh_anh_logo ? (
                            <img src={user.hinh_anh_logo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            getInitials(user?.ho_va_ten || user?.username)
                        )}
                    </div>
                    <p style={{ color: '#fff' }}>{user?.ho_va_ten || user?.username}</p>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '.75rem', fontWeight: 600 }}>
                        <MI name="auto_awesome" style={{ fontSize: '.9rem', verticalAlign: 'middle' }} /> Người bán
                    </span>
                </div>
            </Link>

            {/* Nav */}
            <nav className="sidebar-nav">
                {sellerMenu.map(item => (
                    <Link key={item.path} to={item.path}>
                        <button className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}>
                            <span className="nav-icon"><MI name={item.icon} /></span>
                            {item.label}
                        </button>
                    </Link>
                ))}
            </nav>

            {/* CTA Tạo mới */}
            <div style={{ padding: '1rem 1.25rem' }}>
                <Link to="/seller/courses/new">
                    <button className="btn btn-primary btn-full" style={{ padding: '.75rem' }}>
                        + Tạo khóa học mới
                    </button>
                </Link>
            </div>

            {/* Bottom */}
            <div className="sidebar-bottom">
                <button className="nav-item" style={{ color: '#ff6b6b', width: '100%' }}
                    onClick={() => { logout(); navigate('/login'); }}>
                    <span className="nav-icon"><MI name="logout" /></span> Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default SellerSidebar;
