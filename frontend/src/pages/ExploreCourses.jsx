import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MI = ({ name, style, className = '' }) => {
    const isSymbol = [
        'waving_hand', 'celebration', 'workspace_premium', 'verified', 
        'auto_stories', 'trending_up', 'work_outline'
    ].includes(name);
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

const calculateTrustScore = (course) => {
    const reviewFactor = (Number(course.trung_binh_sao || 0) / 5) * 10 * 0.3;
    const total = (Number(course.so_nguoi_dang_hoc || 0) + Number(course.so_nguoi_da_hoan_thanh || 0)) || 1;
    const completionRate = (Number(course.so_nguoi_da_hoan_thanh || 0) / total);
    const completionFactor = completionRate * 10 * 0.25;
    const passRate = course.ty_le_dau || 0; 
    const passFactor = passRate * 10 * 0.20;
    const hiringRate = Number(course.so_nguoi_da_hoan_thanh) > 0 
        ? Math.min(Number(course.so_nguoi_co_viec_lam) / Number(course.so_nguoi_da_hoan_thanh), 1)
        : 0;
    const hiringFactor = hiringRate * 10 * 0.25;
    
    const score = reviewFactor + completionFactor + passFactor + hiringFactor;
    return (score || 0).toFixed(1);
};

const ExploreCard = ({ course }) => {
    const discount = course.gia_goc > course.gia_tien && course.gia_goc > 0
        ? Math.round((1 - course.gia_tien / course.gia_goc) * 100) : 0;

    return (
        <Link to={`/courses/${course.id_khoa_hoc}`} style={{ textDecoration: 'none' }}>
            <div style={{
                background: '#fff', border: '1px solid var(--border)', borderRadius: '12px',
                overflow: 'hidden', transition: 'all .2s', cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
            }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                <div style={{ width: '100%', position: 'relative', paddingBottom: '56.25%', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        {course.hinh_anh_thumbnail
                            ? <img 
                                src={course.hinh_anh_thumbnail?.replace('maxresdefault.jpg', 'hqdefault.jpg')} 
                                alt={course.ten_khoa_hoc} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                onError={e => e.target.style.display = 'none'}
                            />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MI name="auto_stories" style={{ fontSize: '2.5rem', color: '#fcd34d' }} />
                              </div>
                        }
                    </div>
                </div>

                <div style={{ padding: '.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.4rem' }}>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{course.danh_muc || 'CHUYÊN NGÀNH'}</div>
                        {Number(course.tong_so_danh_gia_ntd) > 0 && (
                            <div style={{ background: '#ecfdf5', color: '#059669', padding: '.15rem .45rem', borderRadius: '4px', fontSize: '.62rem', fontWeight: 800, border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '.1rem' }}>
                                <MI name="verified" style={{ fontSize: '.8rem' }} /> VERIFIED
                            </div>
                        )}
                    </div>
                    
                    <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.5rem', lineHeight: 1.3, height: '2.6rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-primary)' }}>
                        {course.ten_khoa_hoc}
                    </div>

                    <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--r-md)', padding: '.75rem 1rem', marginBottom: '.75rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '.05em' }}>Trust Score</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--secondary)', lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>
                                {calculateTrustScore(course)}<span style={{ fontSize: '.85rem', opacity: .5 }}>/10</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '.3rem', justifyContent: 'flex-end' }}>
                                <MI name="trending_up" style={{ fontSize: '1.1rem' }} /> {Math.round((Number(course.so_nguoi_co_viec_lam) / (Number(course.so_nguoi_da_hoan_thanh) || 1)) * 100)}%
                            </div>
                            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tỉ lệ việc làm</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '.875rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '1.2rem', fontFamily: 'Inter, sans-serif' }}>
                            {Number(course.gia_tien) === 0 ? 'MIỄN PHÍ' : `${Number(course.gia_tien).toLocaleString('vi-VN')}₫`}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', color: 'var(--primary)', fontSize: '.850rem', fontWeight: 700 }}>
                             Chi tiết <MI name="chevron_right" style={{ fontSize: '1.1rem' }} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const ExploreCourses = () => {
    const [courses, setCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [streamingCourses, setStreamingCourses] = useState([]);

    useEffect(() => {
        let active = true;
        const fetchAll = async () => {
            try {
                const [cRes, eRes] = await Promise.all([
                    api.get('/lms/khoa-hoc/'),
                    api.get('/lms/dang-ky-hoc/')
                ]);
                if (!active) return;
                
                const all = cRes.data || [];
                const enrolled = new Set((eRes.data || []).map(e => {
                    const kh = e.khoa_hoc || e.id_khoa_hoc;
                    return typeof kh === 'object' ? kh?.id_khoa_hoc : kh;
                }));
                setCourses(all);
                setEnrolledIds(enrolled);
                
                const filteredList = all.filter(c => !enrolled.has(c.id_khoa_hoc));
                setStreamingCourses([]);
                
                filteredList.forEach((course, index) => {
                    setTimeout(() => {
                        if (!active) return;
                        setStreamingCourses(prev => {
                            if (prev.some(c => c.id_khoa_hoc === course.id_khoa_hoc)) return prev;
                            return [...prev, course];
                        });
                    }, index * 100);
                });
                
            } catch (err) {
                console.error(err);
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchAll();
        return () => { active = false; };
    }, []);

    const filtered = (search ? courses.filter(c => !enrolledIds.has(c.id_khoa_hoc)) : streamingCourses).filter(c => 
        (!search || c.ten_khoa_hoc?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="fade-up">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '.5rem' }}>Khám phá khóa học</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Tìm kiếm những kỹ năng mới để phát triển sự nghiệp của bạn.</p>
                </div>
                <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
                    <MI name="search" style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="form-input"
                        style={{ paddingLeft: '2.5rem', width: '100%' }}
                        placeholder="Tìm tên khóa học..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton" style={{ height: 320 }} />
                    ))}
                </div>
            ) : filtered.length === 0 && streamingCourses.length >= courses.filter(c => !enrolledIds.has(c.id_khoa_hoc)).length ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '15px', border: '1px solid var(--border)' }}>
                    <MI name="search_off" style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Không tìm thấy khóa học nào phù hợp</h3>
                    <button onClick={() => setSearch('')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Xóa tìm kiếm</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {filtered.map((c, i) => (
                        <div key={c.id_khoa_hoc} className="stagger-item" style={{ animationDelay: '0s' }}>
                            <ExploreCard course={c} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExploreCourses;
