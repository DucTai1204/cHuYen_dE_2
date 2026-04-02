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
    { icon: 'business', label: 'Hồ sơ công ty', path: '/employer/profile' },
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
                <h2>EduChain</h2>
                <span>Hệ sinh thái giáo dục</span>
            </div>

            {/* User Info */}
            <div className="sidebar-user">
                <div className="user-avatar-lg" style={{ background: user?.vai_tro === 'NhaTuyenDung' ? '#1e3a8a' : 'var(--primary)' }}>
                    {getInitials(user?.ho_va_ten || user?.username)}
                </div>
                <p>{user?.ho_va_ten || user?.username}</p>
                <span style={{ fontSize: '.68rem', opacity: .8 }}>
                    {user?.vai_tro === 'NhaTuyenDung' ? 'MÃ DOANH NGHIỆP' : 'MÃ HỌC VIÊN'}: {user?.user_id || '—'}
                </span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {(user?.vai_tro === 'NhaTuyenDung' ? recruiterMenu : studentMenu).map(item => (
                    <Link key={item.path} to={item.path}>
                        <button className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
                            <span className="nav-icon" style={{ color: location.pathname === item.path ? (user?.vai_tro === 'NhaTuyenDung' ? '#1e3a8a' : 'var(--primary)') : '' }}>
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
