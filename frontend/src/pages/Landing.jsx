import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './Landing.css';

gsap.registerPlugin(ScrollTrigger);

const MI = ({ name, style }) => <span className="material-icons" style={style}>{name}</span>;

/* ── Counter Animation ── */
const AnimatedCounter = ({ end, suffix = '', duration = 2 }) => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        gsap.fromTo(el, { innerText: 0 }, {
            innerText: end,
            duration,
            snap: { innerText: 1 },
            scrollTrigger: { trigger: el, start: 'top 85%' },
            onUpdate() { el.textContent = Math.floor(el.innerText || 0) + suffix; },
        });
    }, [end, suffix, duration]);
    return <span ref={ref}>0{suffix}</span>;
};

const Landing = () => {
    const { openAuthModal } = useAuth();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            /* ── Hero entrance ── */
            const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            heroTl
                .from('.landing-hero-badge', { y: 30, opacity: 0, duration: 0.6 })
                .from('.landing-hero-title', { y: 50, opacity: 0, duration: 0.8 }, '-=0.3')
                .from('.landing-hero-desc', { y: 30, opacity: 0, duration: 0.6 }, '-=0.4')
                .from('.landing-hero-actions', { y: 30, opacity: 0, duration: 0.6 }, '-=0.3')
                .from('.landing-hero-visual', { scale: 0.85, opacity: 0, duration: 1 }, '-=0.5');

            /* ── Hero parallax on scroll ── */
            gsap.to('.landing-hero-visual', {
                y: -80,
                scrollTrigger: { trigger: '.landing-hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
            });
            gsap.to('.landing-hero-content', {
                y: 60, opacity: 0,
                scrollTrigger: { trigger: '.landing-hero', start: '30% top', end: 'bottom top', scrub: 1 },
            });

            /* ── Features section ── */
            gsap.fromTo('.landing-features .landing-section-header', 
                { y: 60, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.8, scrollTrigger: { trigger: '.landing-features', start: 'top 85%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' } }
            );
            gsap.fromTo('.landing-feature-card',
                { y: 80, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.15, scrollTrigger: { trigger: '.landing-features', start: 'top 70%', end: 'bottom 20%', toggleActions: 'play reverse play reverse' } }
            );

            /* ── Showcase section ── */
            gsap.fromTo('.showcase-step',
                { y: 80, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: '.landing-showcase', start: 'top 75%', end: 'bottom 25%', toggleActions: 'play reverse play reverse' } }
            );

            /* ── Stats section ── */
            gsap.fromTo('.landing-stats .landing-section-header', 
                { y: 60, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.8, scrollTrigger: { trigger: '.landing-stats', start: 'top 85%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' } }
            );
            gsap.fromTo('.landing-stat-item',
                { y: 60, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.12, scrollTrigger: { trigger: '.landing-stats', start: 'top 70%', end: 'bottom 20%', toggleActions: 'play reverse play reverse' } }
            );

            /* ── Testimonials ── */
            gsap.fromTo('.landing-testimonials .landing-section-header', 
                { y: 60, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.8, scrollTrigger: { trigger: '.landing-testimonials', start: 'top 85%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' } }
            );
            gsap.fromTo('.landing-testimonial-card',
                { y: 50, autoAlpha: 0, rotation: 2 },
                { y: 0, autoAlpha: 1, rotation: 0, duration: 0.6, stagger: 0.2, scrollTrigger: { trigger: '.landing-testimonials', start: 'top 70%', end: 'bottom 20%', toggleActions: 'play reverse play reverse' } }
            );

            /* ── CTA final ── */
            gsap.fromTo('.landing-cta-inner',
                { scale: 0.9, autoAlpha: 0 },
                { scale: 1, autoAlpha: 1, duration: 0.8, scrollTrigger: { trigger: '.landing-cta', start: 'top 85%', end: 'bottom 15%', toggleActions: 'play reverse play reverse' } }
            );

            /* ── Floating shapes parallax ── */
            document.querySelectorAll('.landing-float-shape').forEach((el, i) => {
                gsap.to(el, {
                    y: (i % 2 === 0 ? -120 : 120),
                    rotation: (i % 2 === 0 ? 15 : -15),
                    scrollTrigger: { trigger: el.closest('section') || containerRef.current, start: 'top bottom', end: 'bottom top', scrub: 2 },
                });
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="landing-page">
            {/* ═══ Navbar ═══ */}
            <header className="landing-nav">
                <div className="landing-nav-inner">
                    <Link to="/" className="landing-brand">
                        <div className="landing-brand-icon"><MI name="school" style={{ fontSize: '1.2rem', color: '#fff' }} /></div>
                        <strong>EduHKT</strong>
                    </Link>
                    <nav className="landing-nav-links">
                        <a href="#features">Tính năng</a>
                        <a href="#showcase">Khám phá</a>
                        <a href="#stats">Thành tựu</a>
                    </nav>
                    <div className="landing-nav-actions">
                        <button className="btn btn-secondary" onClick={() => openAuthModal('login')}>Đăng nhập</button>
                        <button className="btn btn-primary" onClick={() => openAuthModal('register')}>Đăng ký miễn phí</button>
                    </div>
                </div>
            </header>

            {/* ═══ Hero Section ═══ */}
            <section className="landing-hero">
                {/* Floating decorations */}
                <div className="landing-float-shape shape-1" />
                <div className="landing-float-shape shape-2" />
                <div className="landing-float-shape shape-3" />

                <div className="landing-hero-content">
                    <div className="landing-hero-badge">
                        <MI name="auto_awesome" style={{ fontSize: '1rem' }} /> Nền tảng Học tập Trực tuyến
                    </div>
                    <h1 className="landing-hero-title">
                        Trải nghiệm Học tập<br />
                        <span className="text-gradient">Hiện đại & Linh hoạt</span>
                    </h1>
                    <p className="landing-hero-desc">
                        EduHKT kết nối Giảng viên và Học viên trên nền tảng LMS chuyên nghiệp.<br />
                        Tạo khóa học, quản lý nội dung, thi trực tuyến và cấp chứng chỉ — tất cả trong một.
                    </p>
                    <div className="landing-hero-actions">
                        <button className="btn btn-primary btn-lg landing-cta-btn" onClick={() => openAuthModal('register')}>
                            <MI name="rocket_launch" style={{ fontSize: '1.1rem' }} /> Bắt đầu miễn phí
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={() => openAuthModal('login')}>Đăng nhập →</button>
                    </div>
                </div>
                <div className="landing-hero-visual">
                    <div className="hero-mockup">
                        <div className="mockup-header">
                            <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                            <span className="mockup-title">EduHKT Dashboard</span>
                        </div>
                        <div className="mockup-body">
                            <div className="mockup-sidebar">
                                <div className="mockup-nav-item active"><MI name="dashboard" style={{ fontSize: '.9rem' }} /></div>
                                <div className="mockup-nav-item"><MI name="menu_book" style={{ fontSize: '.9rem' }} /></div>
                                <div className="mockup-nav-item"><MI name="quiz" style={{ fontSize: '.9rem' }} /></div>
                                <div className="mockup-nav-item"><MI name="workspace_premium" style={{ fontSize: '.9rem' }} /></div>
                            </div>
                            <div className="mockup-content">
                                <div className="mockup-card-row">
                                    <div className="mockup-stat-card"><span className="mockup-stat-num">12</span><span className="mockup-stat-label">Khóa học</span></div>
                                    <div className="mockup-stat-card"><span className="mockup-stat-num">89%</span><span className="mockup-stat-label">Hoàn thành</span></div>
                                    <div className="mockup-stat-card"><span className="mockup-stat-num">4.8</span><span className="mockup-stat-label">Đánh giá</span></div>
                                </div>
                                <div className="mockup-progress-area">
                                    <div className="mockup-progress-bar"><div className="mockup-progress-fill" style={{ width: '72%' }} /></div>
                                    <div className="mockup-progress-bar"><div className="mockup-progress-fill" style={{ width: '45%' }} /></div>
                                    <div className="mockup-progress-bar"><div className="mockup-progress-fill" style={{ width: '90%' }} /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Features Section ═══ */}
            <section id="features" className="landing-features">
                <div className="landing-section-header">
                    <span className="section-label"><MI name="stars" style={{ fontSize: '.9rem' }} /> Tính năng nổi bật</span>
                    <h2>Mọi thứ bạn cần cho việc<br /><span className="text-gradient">Dạy & Học Trực tuyến</span></h2>
                    <p>Nền tảng LMS toàn diện với đầy đủ công cụ cho giảng viên và học viên</p>
                </div>
                <div className="landing-features-grid">
                    {[
                        { icon: 'school', title: 'Khóa học Trực tuyến', desc: 'Tạo và quản lý khóa học với video, tài liệu, bài kiểm tra — giao diện trực quan, dễ sử dụng cho mọi giảng viên.' },
                        { icon: 'play_circle', title: 'Học liệu Đa phương tiện', desc: 'Hỗ trợ video bài giảng, tài liệu PDF, slides trình chiếu và nội dung tương tác phong phú.' },
                        { icon: 'quiz', title: 'Thi & Kiểm tra', desc: 'Hệ thống thi trắc nghiệm với bộ đếm thời gian, giám sát camera thời gian thực và tự động chấm điểm.' },
                        { icon: 'workspace_premium', title: 'Chứng chỉ Hoàn thành', desc: 'Cấp chứng chỉ số tự động khi học viên hoàn thành khóa học, có mã xác minh và tra cứu online.' },
                        { icon: 'storefront', title: 'Marketplace Khóa học', desc: 'Giảng viên kinh doanh khóa học trực tiếp trên nền tảng, quản lý doanh thu và học viên dễ dàng.' },
                        { icon: 'chat', title: 'Trò chuyện & Hỗ trợ', desc: 'Hệ thống tin nhắn tích hợp giúp học viên và giảng viên trao đổi, giải đáp thắc mắc nhanh chóng.' },
                    ].map(f => (
                        <div key={f.title} className="landing-feature-card">
                            <div className="feature-icon-wrap">
                                <MI name={f.icon} style={{ fontSize: '1.6rem', color: 'var(--primary)' }} />
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Pinned Showcase Section ═══ */}
            <section id="showcase" className="landing-showcase">
                <div className="showcase-bg-gradient" />
                <div className="showcase-container">
                    {/* Step 1 */}
                    <div className="showcase-step showcase-step-1">
                        <div className="showcase-icon"><MI name="edit_note" style={{ fontSize: '3rem', color: '#fff' }} /></div>
                        <h2>Tạo Khóa học Dễ dàng</h2>
                        <p>Giao diện Course Builder kéo-thả trực quan. Thêm chương, bài giảng, quiz chỉ trong vài phút. Không cần kỹ năng kỹ thuật.</p>
                        <div className="showcase-visual">
                            <div className="sv-item"><MI name="add_circle" style={{ fontSize: '1.2rem', color: 'var(--primary)' }} /><span>Thêm Chương mới</span></div>
                            <div className="sv-item"><MI name="videocam" style={{ fontSize: '1.2rem', color: 'var(--primary)' }} /><span>Upload Video bài giảng</span></div>
                            <div className="sv-item"><MI name="quiz" style={{ fontSize: '1.2rem', color: 'var(--primary)' }} /><span>Tạo bài kiểm tra</span></div>
                        </div>
                    </div>
                    {/* Step 2 */}
                    <div className="showcase-step showcase-step-2">
                        <div className="showcase-icon"><MI name="groups" style={{ fontSize: '3rem', color: '#fff' }} /></div>
                        <h2>Học Mọi lúc, Mọi nơi</h2>
                        <p>Học viên truy cập khóa học trên mọi thiết bị. Theo dõi tiến độ, xem lại bài giảng và hoàn thành bài tập theo nhịp độ riêng.</p>
                        <div className="showcase-visual">
                            <div className="sv-device"><MI name="laptop" style={{ fontSize: '2rem', color: '#fff' }} /><span>Desktop</span></div>
                            <div className="sv-device"><MI name="tablet_mac" style={{ fontSize: '2rem', color: '#fff' }} /><span>Tablet</span></div>
                            <div className="sv-device"><MI name="phone_iphone" style={{ fontSize: '2rem', color: '#fff' }} /><span>Mobile</span></div>
                        </div>
                    </div>
                    {/* Step 3 */}
                    <div className="showcase-step showcase-step-3">
                        <div className="showcase-icon"><MI name="trending_up" style={{ fontSize: '3rem', color: '#fff' }} /></div>
                        <h2>Quản lý & Phân tích</h2>
                        <p>Dashboard tổng quan cho giảng viên: doanh thu, số học viên, đánh giá, tỉ lệ hoàn thành — tất cả trong tầm tay.</p>
                        <div className="showcase-visual">
                            <div className="sv-metric"><span className="sv-metric-num">₫2.4M</span><span className="sv-metric-label">Doanh thu tháng</span></div>
                            <div className="sv-metric"><span className="sv-metric-num">156</span><span className="sv-metric-label">Học viên</span></div>
                            <div className="sv-metric"><span className="sv-metric-num">4.9★</span><span className="sv-metric-label">Đánh giá</span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Stats Section ═══ */}
            <section id="stats" className="landing-stats">
                <div className="landing-float-shape shape-4" />
                <div className="landing-section-header">
                    <span className="section-label"><MI name="insights" style={{ fontSize: '.9rem' }} /> Con số ấn tượng</span>
                    <h2>Cộng đồng EduHKT<br /><span className="text-gradient">Đang không ngừng lớn mạnh</span></h2>
                </div>
                <div className="landing-stats-grid">
                    {[
                        { icon: 'person', num: 5000, suffix: '+', label: 'Học viên đã đăng ký' },
                        { icon: 'menu_book', num: 200, suffix: '+', label: 'Khóa học đa dạng' },
                        { icon: 'school', num: 50, suffix: '+', label: 'Giảng viên chất lượng' },
                        { icon: 'verified', num: 3000, suffix: '+', label: 'Chứng chỉ đã cấp' },
                    ].map(s => (
                        <div key={s.label} className="landing-stat-item">
                            <div className="stat-icon-circle">
                                <MI name={s.icon} style={{ fontSize: '1.5rem', color: '#fff' }} />
                            </div>
                            <div className="stat-number"><AnimatedCounter end={s.num} suffix={s.suffix} /></div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Testimonials ═══ */}
            <section className="landing-testimonials">
                <div className="landing-section-header">
                    <span className="section-label"><MI name="format_quote" style={{ fontSize: '.9rem' }} /> Đánh giá từ người dùng</span>
                    <h2>Được yêu thích bởi<br /><span className="text-gradient">Hàng nghìn người dùng</span></h2>
                </div>
                <div className="landing-testimonials-grid">
                    {[
                        { name: 'Nguyễn Văn A', role: 'Học viên', text: 'Giao diện rất trực quan, nội dung khóa học chất lượng. Mình đã hoàn thành 5 khóa học và nhận được chứng chỉ rất nhanh!', avatar: 'N' },
                        { name: 'Trần Thị B', role: 'Giảng viên', text: 'Course Builder rất dễ sử dụng, tôi có thể tạo và quản lý khóa học chỉ trong vài phút. Doanh thu đã tăng đáng kể!', avatar: 'T' },
                        { name: 'Lê Minh C', role: 'Học viên', text: 'Tính năng thi trực tuyến rất chuyên nghiệp với giám sát camera. Chứng chỉ có thể tra cứu online, rất tiện lợi.', avatar: 'L' },
                    ].map(t => (
                        <div key={t.name} className="landing-testimonial-card">
                            <div className="testimonial-quote"><MI name="format_quote" style={{ fontSize: '1.5rem', color: 'var(--primary)', opacity: 0.4 }} /></div>
                            <p>{t.text}</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">{t.avatar}</div>
                                <div>
                                    <strong>{t.name}</strong>
                                    <span>{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Final CTA ═══ */}
            <section className="landing-cta">
                <div className="landing-cta-inner">
                    <h2>Sẵn sàng bắt đầu hành trình<br />học tập của bạn?</h2>
                    <p>Tham gia EduHKT ngay hôm nay — hoàn toàn miễn phí cho học viên.</p>
                    <div className="landing-cta-actions">
                        <button className="btn btn-lg landing-cta-white-btn" onClick={() => openAuthModal('register')}>
                            <MI name="rocket_launch" style={{ fontSize: '1.1rem' }} /> Đăng ký miễn phí
                        </button>
                        <button className="btn btn-lg landing-cta-outline-btn" onClick={() => openAuthModal('login')}>
                            Đăng nhập →
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══ Footer ═══ */}
            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="footer-brand">
                        <div className="landing-brand">
                            <div className="landing-brand-icon"><MI name="school" style={{ fontSize: '1.2rem', color: '#fff' }} /></div>
                            <strong>EduHKT</strong>
                        </div>
                        <p>Nền tảng Học tập Trực tuyến thế hệ mới.<br />Kết nối Tri thức — Nâng tầm Năng lực.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Nền tảng</h4>
                        <a href="#features">Tính năng</a>
                        <a href="#showcase">Khám phá</a>
                        <a href="#stats">Thành tựu</a>
                    </div>
                    <div className="footer-links">
                        <h4>Tài khoản</h4>
                        <span style={{ cursor: 'pointer', display: 'block', marginBottom: '.5rem' }} onClick={() => openAuthModal('login')}>Đăng nhập</span>
                        <span style={{ cursor: 'pointer', display: 'block' }} onClick={() => openAuthModal('register')}>Đăng ký</span>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© 2026 EduHKT. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
