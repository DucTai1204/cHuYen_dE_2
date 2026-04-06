import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MI = ({ name, style, className = '' }) => {
    // Các icon mới này chỉ có trong Material Symbols Rounded
    const isSymbol = ['waving_hand', 'celebration', 'workspace_premium', 'verified'].includes(name);
    const iconClass = isSymbol ? 'material-symbols-rounded' : 'material-icons';

    return (
        <span
            className={`${iconClass} ${className}`}
            style={{
                fontSize: '1.25rem',
                width: '1em',
                height: '1em',
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

const studentMenu = [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { icon: 'menu_book', label: 'Khóa học của tôi', path: '/courses' },
    { icon: 'chat', label: 'Tin nhắn', path: '/messages' },
    { icon: 'workspace_premium', label: 'Kho chứng chỉ', path: '/certificates' },
    { icon: 'account_circle', label: 'Hồ sơ năng lực', path: '/profile' },
];

const recruiterMenu = [
    { icon: 'groups', label: 'Marketplace Nhân tài', path: '/employer/dashboard' },
    { icon: 'chat', label: 'Tin nhắn', path: '/employer/messages' },
    { icon: 'work', label: 'Tin tuyển dụng', path: '/employer/jobs' },
    { icon: 'business', label: 'Hồ sơ công ty', path: '/profile' },
];

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon"><MI name="school" style={{ fontSize: '1.3rem' }} /></div>
                <h2>EduHKT</h2>
                <span>Hệ sinh thái giáo dục</span>
            </div>

            {/* User Info - Clickable to Profile */}
            <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div className="sidebar-user" style={{ cursor: 'pointer', transition: 'var(--t)' }}>
                    <div className="user-avatar-lg" style={{
                        background: user?.vai_tro === 'NhaTuyenDung' ? 'var(--secondary-dark)' : 'var(--primary)',
                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {user?.hinh_anh_logo ? (
                            <img src={user.hinh_anh_logo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            getInitials(user?.ho_va_ten || user?.username)
                        )}
                    </div>
                    <p style={{ color: '#fff' }}>{user?.ho_va_ten || user?.username}</p>
                    <div style={{ fontSize: '.7rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                        <MI name={user?.vai_tro === 'NhaTuyenDung' ? 'verified_user' : 'school'} style={{ fontSize: '.8rem' }} />
                        {user?.vai_tro === 'NhaTuyenDung' ? 'NHÀ TUYỂN DỤNG' : 'HỌC VIÊN'}
                    </div>
                </div>
            </Link>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {(user?.vai_tro === 'NhaTuyenDung' ? recruiterMenu : studentMenu).map(item => (
                    <Link key={item.path} to={item.path}>
                        <button className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
                            <span className="nav-icon" style={{ color: location.pathname === item.path ? (user?.vai_tro === 'NhaTuyenDung' ? 'var(--secondary-dark)' : '#fff') : '' }}>
                                <MI name={item.icon} />
                            </span>
                            {item.label}
                        </button>
                    </Link>
                ))}
            </nav>

            {/* Bottom Logout */}
            <div className="sidebar-bottom">
                <button className="nav-item" style={{ color: 'var(--danger)', width: '100%' }} onClick={() => { logout(); navigate('/login'); }}>
                    <span className="nav-icon"><MI name="logout" /></span>
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
