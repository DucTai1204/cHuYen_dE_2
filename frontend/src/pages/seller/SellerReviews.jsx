import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const SellerReviews = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/lms/khoa-hoc/my-courses/')
            .then(res => setCourses(res.data || []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, []);

    const coursesWithReviews = courses.filter(c => (c.tong_so_danh_gia || 0) > 0 || (c.tong_so_danh_gia_ntd || 0) > 0);

    const renderStars = (rating) => {
        const full = Math.floor(rating);
        return (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <MI key={i} name={i <= full ? 'star' : 'star_border'} style={{ fontSize: '1.1rem', color: i <= full ? '#f59e0b' : '#cbd5e1' }} />
                ))}
            </div>
        );
    };

    return (
        <div className="fade-up" style={{ paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>Đánh giá & Phản hồi</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Lắng nghe ý kiến từ cộng đồng Học viên và Nhà tuyển dụng</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>Đang tổng hợp đánh giá...</div>
            ) : coursesWithReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', borderRadius: '20px', border: '1px solid var(--border)' }}>
                    <MI name="rate_review" style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }} />
                    <h3 style={{ fontWeight: 700 }}>Chưa có đánh giá công khai</h3>
                    <p style={{ color: '#64748b' }}>Các đánh giá về khóa học sẽ xuất hiện tại đây sau khi học viên hoàn thành khóa học.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {coursesWithReviews.map((c, idx) => (
                        <div key={idx} style={{ 
                            background: '#fff', border: '1px solid var(--border)', borderRadius: '24px', 
                            overflow: 'hidden', boxShadow: '0 4px 15px -1px rgba(0,0,0,0.05)',
                            display: 'flex', flexWrap: 'wrap'
                        }}>
                            {/* Course Left Info */}
                            <div style={{ flex: '1 1 300px', padding: '2rem', borderRight: '1px solid #f1f5f9' }}>
                                <div style={{ 
                                    background: '#f8fafc', width: '100%', aspectRatio: '16/9', 
                                    borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' 
                                }}>
                                    <img src={c.hinh_anh_thumbnail} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '.5rem', lineHeight: 1.4 }}>{c.ten_khoa_hoc}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#64748b', fontSize: '.75rem', fontWeight: 600 }}>
                                    <MI name="group" style={{ fontSize: '1rem' }} /> {c.tong_hoc_vien} học viên tham gia
                                </div>
                            </div>

                            {/* Ratings Analysis Right */}
                            <div style={{ flex: '2 1 400px', padding: '2rem', background: '#fff' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>
                                    
                                    {/* Học viên */}
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem', color: '#2563eb' }}>
                                            <MI name="school" /> <span style={{ fontWeight: 800, fontSize: '.85rem' }}>HỌC VIÊN</span>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '.25rem' }}>
                                            {Number(c.trung_binh_sao).toFixed(1)}
                                        </div>
                                        <div style={{ marginBottom: '.5rem' }}>{renderStars(c.trung_binh_sao)}</div>
                                        <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600 }}>Dựa trên {c.tong_so_danh_gia} lượt biểu quyết</div>
                                        
                                        {/* Bar Chart calculation based on real stars from DB */}
                                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const count = c.rating_details?.[star] || 0;
                                                const total = c.tong_so_danh_gia || 1;
                                                const weight = (count / total) * 100;
                                                return (
                                                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '.7rem', fontWeight: 700, width: '10px' }}>{star}</span>
                                                        <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${weight}%`, height: '100%', background: star >= 4 ? '#f59e0b' : '#cbd5e1' }} />
                                                        </div>
                                                        <span style={{ fontSize: '.65rem', color: '#64748b', width: '15px', textAlign: 'right' }}>{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Nhà tuyển dụng */}
                                    <div style={{ background: '#ecfdf5', padding: '1.5rem', borderRadius: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem', color: '#059669' }}>
                                            <MI name="verified" /> <span style={{ fontWeight: 800, fontSize: '.85rem' }}>DOANH NGHIỆP</span>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#065f46', marginBottom: '.25rem' }}>
                                            {Number(c.trung_binh_sao_ntd).toFixed(1)}
                                        </div>
                                        <div style={{ marginBottom: '.5rem' }}>{renderStars(c.trung_binh_sao_ntd)}</div>
                                        <div style={{ fontSize: '.75rem', color: '#065f46', fontWeight: 600 }}>Dựa trên {c.tong_so_danh_gia_ntd} phản hồi thực tập</div>

                                        <div style={{ 
                                            marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.6)', 
                                            borderRadius: '12px', fontSize: '.75rem', color: '#065f46', 
                                            border: '1px dashed #10b981', fontStyle: 'italic', fontWeight: 500
                                        }}>
                                            "{c.tong_so_danh_gia_ntd > 0 ? "Chương trình đào tạo đáp ứng tốt nhu cầu tuyển dụng của doanh nghiệp." : "Đang chờ đủ dữ liệu đánh giá từ phía đối tác doanh nghiệp."}"
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerReviews;
