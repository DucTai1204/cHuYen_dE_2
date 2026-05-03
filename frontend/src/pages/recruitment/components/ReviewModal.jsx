import React, { useState } from 'react';
import api from '../../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;
const EMP_BLUE = 'var(--secondary)';

const ReviewModal = ({ talent, onClose, onReviewed }) => {
    const [star, setStar] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/lms/danh-gia-ntd/', {
                id_khoa_hoc: talent.id_khoa_hoc,
                so_sao_phu_hop: star,
                nhan_xet_chuyen_mon: comment
            });
            alert('Cảm ơn bạn đã đóng góp ý kiến chuyên môn!');
            onReviewed();
            onClose();
        } catch (err) {
            alert(err.response?.data?.detail || err.response?.data?.[0] || 'Lỗi khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="fade-up" style={{ background: '#fff', padding: '2.5rem', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: 800, color: 'var(--secondary)' }}>Đánh giá chất lượng đào tạo</h3>
                <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>Khóa học: <strong style={{ color: 'var(--primary)' }}>{talent.ten_khoa_hoc}</strong> - Bạn thấy nội dung này có sát với thực tế tuyển dụng không?</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginBottom: '1.5rem' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <MI key={s} name={s <= star ? 'star' : 'star_outline'}
                                style={{ fontSize: '2.5rem', color: '#f59e0b', cursor: 'pointer' }}
                                onClick={() => setStar(s)}
                            />
                        ))}
                    </div>

                    <textarea
                        className="form-input"
                        placeholder="Nhận xét về yêu cầu kỹ năng, tính thực tế (ví dụ: kiến thức rất sát với thực tế dự án...)"
                        style={{ height: 120, marginBottom: '1.5rem', resize: 'vertical' }}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        required
                    ></textarea>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: '.8rem', borderRadius: '10px', fontWeight: 700 }}>Hủy</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1, padding: '.8rem', borderRadius: '10px', fontWeight: 700 }}>{submitting ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
