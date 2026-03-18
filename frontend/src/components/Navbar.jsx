import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <span className="logo-dot" />
                <span>EduChain</span>
            </Link>

            <div className="navbar-menu">
                {user ? (
                    <>
                        <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '.9rem', fontWeight: 500 }}>Dashboard</Link>
                        <Link to="/exam" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '.9rem', fontWeight: 500 }}>Bài Thi</Link>
                        <div className="navbar-user">
                            <div className="user-avatar">{getInitials(user.username)}</div>
                            <span style={{ fontSize: '.85rem', fontWeight: 500 }}>{user.username}</span>
                        </div>
                        <button className="btn-primary btn-danger" onClick={handleLogout} style={{ padding: '.45rem 1rem', fontSize: '.85rem' }}>
                            Đăng xuất
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login"><button className="btn-secondary" style={{ padding: '.5rem 1.1rem', fontSize: '.9rem' }}>Đăng nhập</button></Link>
                        <Link to="/register"><button className="btn-primary" style={{ padding: '.5rem 1.1rem', fontSize: '.9rem' }}>Đăng ký</button></Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
