import React from 'react';
import { Link } from 'react-router-dom';

const MI = ({ name, style }) => <span className="material-icons" style={style}>{name}</span>;

const features = [
    { icon: 'school', title: 'LMS & Marketplace', desc: 'Giảng viên tạo và kinh doanh khóa học; học viên học trực tuyến linh hoạt mọi nơi.' },
    { icon: 'security', title: 'AI Proctoring', desc: 'Trí tuệ nhân tạo giám sát Camera thời gian thực, phát hiện gian lận tức thì.' },
    { icon: 'verified', title: 'Chứng chỉ Blockchain', desc: 'Văn bằng số mã UUID · Hash Blockchain · chống làm giả · tra cứu dễ dàng.' },
    { icon: 'work', title: 'Cổng Tuyển dụng', desc: 'Doanh nghiệp xác thực bằng cấp ngay qua QR Code và tra cứu ứng viên theo kỹ năng.' },
];

const Landing = () => (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
        {/* Top nav */}
        <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <div style={{ width: 34, height: 34, background: 'var(--primary)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem' }}><MI name="school" style={{ fontSize: '1.2rem' }} /></div>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>EduHKT</strong>
            </div>
            <div style={{ display: 'flex', gap: '.75rem' }}>
                <Link to="/login"><button className="btn btn-secondary">Đăng nhập</button></Link>
                <Link to="/register"><button className="btn btn-primary">Đăng ký miễn phí</button></Link>
            </div>
        </header>

        {/* Hero */}
        <section style={{ maxWidth: 840, margin: '0 auto', padding: '5rem 2rem 4rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '.35rem 1rem', borderRadius: 'var(--r-full)', fontSize: '.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                    <MI name="auto_awesome" style={{ fontSize: '1rem' }} /> Hệ sinh thái Giáo dục Số thế hệ mới
                </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Học tập &amp; Cấp Chứng Chỉ<br />
                <span style={{ color: 'var(--primary)' }}>Phục vụ Xác thực Năng lực</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem' }}>
                Nền tảng kết nối Người học — Đơn vị đào tạo — Nhà tuyển dụng<br />thông qua văn bằng số Blockchain không thể làm giả.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register"><button className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}><MI name="rocket_launch" style={{ fontSize: '1.1rem' }} /> Bắt đầu miễn phí</button></Link>
                <Link to="/login"><button className="btn btn-secondary btn-lg">Đăng nhập →</button></Link>
            </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 5rem' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>Tính năng nổi bật</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {features.map(f => (
                    <div key={f.title} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'var(--primary-light)', borderRadius: '14px' }}>
                            <MI name={f.icon} style={{ fontSize: '1.8rem', color: 'var(--primary)' }} />
                        </div>
                        <h3 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.5rem' }}>{f.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem', lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'var(--primary)', padding: '3rem 2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '.75rem' }}>Thử ngay Xác minh Chứng chỉ số</h2>
            <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: '1.5rem', fontSize: '.95rem' }}>
                Bất kỳ ai cũng có thể tra cứu tính hợp lệ — không cần đăng nhập.
            </p>
            <Link to="/register">
                <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                    <MI name="verified" style={{ fontSize: '1.1rem' }} /> Bắt đầu xác thực ngay
                </button>
            </Link>
        </section>
    </div>
);

export default Landing;
