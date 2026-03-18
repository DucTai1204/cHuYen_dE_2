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
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon" style={{ background: '#fef3c7', color: '#d97706', fontSize: '1.3rem' }}><MI name="storefront" style={{ fontSize: '1.3rem' }} /></div>
                <h2 style={{ color: '#d97706' }}>EduChain Seller</h2>
                <span>Kênh người bán</span>
            </div>

            {/* User */}
            <div className="sidebar-user">
                <div className="user-avatar-lg" style={{ background: '#d97706' }}>
                    {getInitials(user?.ho_va_ten || user?.username)}
                </div>
                <p>{user?.ho_va_ten || user?.username}</p>
                <span style={{ color: '#d97706', fontSize: '.75rem', fontWeight: 600 }}><MI name="auto_awesome" style={{ fontSize: '.9rem', verticalAlign: 'middle' }} /> Người bán</span>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {sellerMenu.map(item => (
                    <Link key={item.path} to={item.path}>
                        <button className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                            style={location.pathname.startsWith(item.path) ? { background: '#fef3c7', color: '#92400e' } : {}}>
                            <span className="nav-icon"><MI name={item.icon} /></span>
                            {item.label}
                        </button>
                    </Link>
                ))}
            </nav>

            {/* CTA Tạo mới */}
            <div style={{ padding: '.75rem' }}>
                <Link to="/seller/courses/new">
                    <button className="btn btn-full" style={{ background: '#d97706', color: '#fff', borderRadius: 'var(--r-sm)', padding: '.6rem', fontSize: '.875rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                        + Tạo khóa học mới
                    </button>
                </Link>
            </div>

            {/* Bottom */}
            <div className="sidebar-bottom">
                <button className="nav-item" style={{ color: 'var(--danger)', width: '100%' }}
                    onClick={() => { logout(); navigate('/login'); }}>
                    <span className="nav-icon"><MI name="logout" /></span> Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default SellerSidebar;
