import React from 'react';
import { Link } from 'react-router-dom';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;
const EMP_BLUE = 'var(--secondary)';

const CourseCardNTD = ({ course }) => {
    return (
        <Link to={`/courses/${course.id_khoa_hoc}`} style={{ textDecoration: 'none' }}>
            <div 
                className="stagger-item"
                style={{
                background: '#fff', border: '1px solid var(--border)', borderRadius: '15px',
                overflow: 'hidden', transition: 'all .25s', cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column'
            }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                {/* Thumbnail Container với tỉ lệ 16:9 cố định */}
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
                                <MI name="auto_stories" style={{ fontSize: '3rem', color: '#fcd34d' }} />
                              </div>
                        }
                    </div>
                    {/* Badge Trình độ */}
                    <div style={{ position: 'absolute', bottom: '.75rem', left: '.75rem', background: 'rgba(255,255,255,0.95)', padding: '.3rem .6rem', borderRadius: '6px', fontSize: '.65rem', fontWeight: 800, color: EMP_BLUE, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 2 }}>
                        {course.trinh_do === 'CoSo' ? 'CƠ SỞ' : course.trinh_do === 'TrungCap' ? 'TRUNG CẤP' : 'NÂNG CAO'}
                    </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--text-primary)', marginBottom: '.5rem', lineHeight: 1.4, height: '2.6rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.ten_khoa_hoc}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#f8fafc', padding: '.5rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '.62rem', color: 'var(--text-muted)' }}>TỈ LỆ VIỆC LÀM</div>
                            <div style={{ fontWeight: 800, color: '#059669', fontSize: '.9rem' }}>
                                {Math.round((Number(course.so_nguoi_co_viec_lam) / (Number(course.so_nguoi_da_hoan_thanh) || 1)) * 100)}%
                            </div>
                        </div>
                        <div style={{ background: '#f1f5f9', padding: '.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '.62rem', color: 'var(--text-muted)' }}>ỨNG VIÊN XONG</div>
                            <div style={{ fontWeight: 800, color: EMP_BLUE, fontSize: '.9rem' }}>{course.so_nguoi_da_hoan_thanh || 0} hồ sơ</div>
                        </div>
                    </div>


                    <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                             {(course.ky_nang_dau_ra || '').split(',').slice(0, 2).map((s, i) => (
                                 <span key={i} style={{ background: '#eff6ff', color: '#1e40af', padding: '.2rem .4rem', borderRadius: '4px', fontSize: '.6rem', fontWeight: 700 }}>{s.trim()}</span>
                             ))}
                        </div>
                        <div style={{ color: EMP_BLUE, fontSize: '.75rem', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                            CHI TIẾT <MI name="chevron_right" style={{ fontSize: '1rem' }} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CourseCardNTD;
