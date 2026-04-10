import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ReviewModal from './components/ReviewModal';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;
const EMP_BLUE = 'var(--secondary)';

const HiringManagement = () => {
    const [hired, setHired] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewingCourse, setReviewingCourse] = useState(null);

    const loadHired = () => {
        setLoading(true);
        api.get('/lms/tuyen-dung/')
            .then(res => setHired(res.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadHired();
    }, []);

    return (
        <div className="fade-up">
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: EMP_BLUE }}>Quản lý Tuyển dụng</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Theo dõi trạng thái của các ứng viên bạn đã mời làm việc và đánh giá chất lượng nhân sự theo từng khóa học.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Đang tải danh sách đã tuyển...</div>
            ) : hired.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '15px', border: '1px solid var(--border)' }}>
                    <MI name="work_off" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Bạn chưa tuyển dụng nhân sự nào</h3>
                    <p style={{ fontSize: '.9rem', color: 'var(--text-muted)' }}>Hãy khám phá các hồ sơ ưu tú tại mục "Nhân tài".</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {hired.map(h => (
                        <div key={h.id_tuyen_dung} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '15px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                <div style={{ width: 50, height: 50, background: EMP_BLUE, color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', overflow: 'hidden' }}>
                                    {h.hinh_anh_hoc_vien ? (
                                        <img src={h.hinh_anh_hoc_vien} alt={h.ho_va_ten_hoc_vien} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (h.ho_va_ten_hoc_vien || h.ten_hoc_vien)?.[0] || 'U'
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{h.ho_va_ten_hoc_vien || h.ten_hoc_vien}</div>
                                    <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.2rem' }}>
                                        Thực tập/Tuyển dụng từ khóa: <strong style={{ color: EMP_BLUE }}>{h.ten_khoa_hoc}</strong>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.6rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '.3rem' }}>
                                    <MI name="event" style={{ fontSize: '1rem', color: EMP_BLUE }} /> {new Date(h.ngay_tuyen).toLocaleDateString('vi-VN')}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end' }}>
                                    {/* Viết đánh giá nếu trạng thái DaDongY */}
                                    {h.trang_thai === 'DaDongY' && (
                                        <button 
                                            onClick={() => setReviewingCourse(h)}
                                            style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 700, fontSize: '.75rem', cursor: 'pointer', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '.2rem' }}
                                        >
                                            <MI name="rate_review" style={{ fontSize: '1rem' }} /> Đánh giá khóa học
                                        </button>
                                    )}
                                    {/* Bubble trạng thái */}
                                    {h.trang_thai === 'ChoXacNhan' ? (
                                        <span style={{ 
                                            background: '#fffbeb', color: '#b45309', padding: '.4rem .9rem', 
                                            borderRadius: '8px', fontSize: '.72rem', fontWeight: 800, 
                                            border: '1px solid #fef3c7', display: 'inline-flex', alignItems: 'center', gap: '.4rem' 
                                        }}>
                                            <span style={{ width: 8, height: 8, background: '#f59e0b', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                                            CHỜ XÁC NHẬN
                                        </span>
                                    ) : h.trang_thai === 'DaDongY' ? (
                                        <span style={{ 
                                            background: '#ecfdf5', color: '#059669', padding: '.4rem .9rem', 
                                            borderRadius: '8px', fontSize: '.72rem', fontWeight: 800, 
                                            border: '1px solid #d1fae5', display: 'inline-flex', alignItems: 'center', gap: '.4rem' 
                                        }}>
                                            <MI name="check_circle" style={{ fontSize: '1rem' }} /> ĐÃ TUYỂN DỤNG
                                        </span>
                                    ) : (
                                        <span style={{ 
                                            background: '#fef2f2', color: '#b91c1c', padding: '.4rem .9rem', 
                                            borderRadius: '8px', fontSize: '.72rem', fontWeight: 800, 
                                            border: '1px solid #fee2e2', display: 'inline-flex', alignItems: 'center', gap: '.4rem' 
                                        }}>
                                            <MI name="cancel" style={{ fontSize: '1rem' }} /> ĐÃ TỪ CHỐI
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {reviewingCourse && (
                <ReviewModal 
                    talent={{ id_khoa_hoc: reviewingCourse.id_khoa_hoc, ten_khoa_hoc: reviewingCourse.ten_khoa_hoc }} 
                    onClose={() => setReviewingCourse(null)} 
                    onReviewed={() => {}}
                />
            )}
        </div>
    );
};

export default HiringManagement;
