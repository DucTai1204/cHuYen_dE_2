import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const EMP_BLUE = 'var(--secondary)'; 
const EMP_BLUE_LIGHT = 'var(--secondary-light)';

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
            alert(err.response?.data?.detail || 'Lỗi khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '15px', width: '100%', maxWidth: 450, boxShadow: 'var(--shadow-lg)' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Đánh giá chất lượng đào tạo</h3>
                <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Khóa học: <strong>{talent.ten_khoa_hoc}</strong> - Bạn thấy nội dung này có sát với thực tế tuyển dụng không?</p>
                
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
                        style={{ height: 120, padding: '1rem', marginBottom: '1.5rem' }} 
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    ></textarea>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '.8rem', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Hủy</button>
                        <button type="submit" disabled={submitting} style={{ flex: 1, padding: '.8rem', background: EMP_BLUE, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Gửi đánh giá</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TalentCard = ({ talent, onReviewClick }) => {
    const navigate = useNavigate();

    const onViewProfile = () => {
        navigate(`/employer/talents/${talent.id_user}`, { state: { talent } });
    };

    return (
        <div style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '1.25rem', transition: 'all .25s', boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', gap: '1rem'
        }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, background: EMP_BLUE_LIGHT, color: EMP_BLUE, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, overflow: 'hidden' }}>
                    {talent.hinh_anh_logo ? (
                        <img src={talent.hinh_anh_logo} alt={talent.ho_va_ten} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        talent.ho_va_ten?.charAt(0).toUpperCase()
                    )}
                </div>
                <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '.95rem' }}>{talent.ho_va_ten}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>Ứng viên từ khóa: {talent.ten_khoa_hoc}</div>
                </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '.75rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Uy tín Doanh nghiệp</div>
                        <div style={{ fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                            <MI name="verified" style={{ fontSize: '1rem' }} /> {talent.trung_binh_sao_ntd || '—'}/5.0 
                            <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '.75rem' }}>({talent.tong_so_danh_gia_ntd || 0} nhận xét)</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onReviewClick(talent)}
                        style={{ background: 'none', border: 'none', color: EMP_BLUE, fontWeight: 700, fontSize: '.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Viết đánh giá
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {talent.ready_to_work && (
                    <div style={{ background: '#ecfdf5', color: '#059669', padding: '.2rem .5rem', borderRadius: '5px', fontSize: '.65rem', fontWeight: 800 }}>SẴN SÀNG ĐI LÀM</div>
                )}
                {talent.ky_nang && talent.ky_nang.split(',').slice(0, 3).map((s, i) => (
                    <div key={i} style={{ background: '#f1f5f9', color: '#475569', padding: '.2rem .5rem', borderRadius: '5px', fontSize: '.65rem', fontWeight: 600 }}>{s.trim()}</div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '.5rem' }}>
                <button 
                    onClick={onViewProfile}
                    style={{ flex: 1, padding: '.65rem', border: '1px solid #cbd5e1', borderRadius: '7px', background: '#fff', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                    Săn nhân tài & Chat
                </button>
            </div>
        </div>
    );
};

const HiredList = () => {
    const [hired, setHired] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/lms/tuyen-dung/')
            .then(res => setHired(res.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Đang tải danh sách đã tuyển...</div>;
    if (hired.length === 0) return (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '15px', border: '1px solid var(--border)' }}>
            <MI name="work_off" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Bạn chưa tuyển dụng nhân sự nào</h3>
            <p style={{ fontSize: '.9rem', color: 'var(--text-muted)' }}>Hãy khám phá các hồ sơ ưu tú tại tab "Tìm nhân tài".</p>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {hired.map(h => (
                <div key={h.id_tuyen_dung} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '15px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ width: 50, height: 50, background: EMP_BLUE, color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', overflow: 'hidden' }}>
                            {h.hinh_anh_hoc_vien ? (
                                <img src={h.hinh_anh_hoc_vien} alt={h.ho_va_ten_hoc_vien} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                (h.ho_va_ten_hoc_vien || h.ten_hoc_vien)?.[0]
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{h.ho_va_ten_hoc_vien || h.ten_hoc_vien}</div>
                            <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.2rem' }}>
                                Chứng chỉ căn cứ: <strong style={{ color: EMP_BLUE }}>{h.ten_khoa_hoc}</strong>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.6rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '.3rem' }}>
                            <MI name="event" style={{ fontSize: '1rem', color: EMP_BLUE }} /> {new Date(h.ngay_tuyen).toLocaleDateString('vi-VN')}
                        </div>
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
            ))}
        </div>
    );
};

const EmployerDashboard = () => {
    const [talents, setTalents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('find'); // 'find' | 'hired'
    const [reviewingTalent, setReviewingTalent] = useState(null);
    
    // Filters
    const [filters, setFilters] = useState({
        search: '',
        id_khoa_hoc: '',
        skill: '',
        level: '',
        ready: ''
    });

    const loadTalents = () => {
        setLoading(true);
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.id_khoa_hoc) params.id_khoa_hoc = filters.id_khoa_hoc;
        if (filters.skill) params.skill = filters.skill;
        if (filters.level) params.level = filters.level;
        if (filters.ready) params.ready = filters.ready;

        api.get('/lms/dang-ky-hoc/all-talent/', { params })
            .then(res => setTalents(res.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        // Load courses for filter select
        api.get('/lms/khoa-hoc/')
            .then(res => setCourses(res.data || []))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (activeTab === 'find') loadTalents();
    }, [filters, activeTab]);

    return (
        <div className="fade-up">
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: EMP_BLUE }}>Kênh Nhà Tuyển Dụng</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Đánh giá chất lượng đào tạo và kết nối với nguồn lực chất lượng cao.</p>
            </div>

            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem', gap: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('find')}
                    style={{ 
                        padding: '1rem .5rem', background: 'none', border: 'none', 
                        borderBottom: activeTab === 'find' ? `3px solid ${EMP_BLUE}` : '3px solid transparent',
                        color: activeTab === 'find' ? EMP_BLUE : 'var(--text-muted)',
                        fontWeight: activeTab === 'find' ? 800 : 500, fontSize: '.95rem', cursor: 'pointer', transition: 'all .2s'
                    }}
                >
                    <MI name="person_search" style={{ verticalAlign: 'middle', marginRight: '.4rem' }} /> Tìm nhân tài
                </button>
                <button 
                    onClick={() => setActiveTab('hired')}
                    style={{ 
                        padding: '1rem .5rem', background: 'none', border: 'none', 
                        borderBottom: activeTab === 'hired' ? `3px solid ${EMP_BLUE}` : '3px solid transparent',
                        color: activeTab === 'hired' ? EMP_BLUE : 'var(--text-muted)',
                        fontWeight: activeTab === 'hired' ? 800 : 500, fontSize: '.95rem', cursor: 'pointer', transition: 'all .2s'
                    }}
                >
                    <MI name="badge" style={{ verticalAlign: 'middle', marginRight: '.4rem' }} /> Nhân sự đã tuyển
                </button>
            </div>

            {activeTab === 'find' ? (
                <>
                    {/* ADVANCED FILTER BAR */}
                    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '15px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 2, minWidth: 250, position: 'relative' }}>
                                <MI name="search" style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    className="form-input" 
                                    placeholder="Tìm tên ứng viên..." 
                                    style={{ paddingLeft: '2.5rem' }} 
                                    value={filters.search} 
                                    onChange={e => setFilters({...filters, search: e.target.value})} 
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 150 }}>
                                <select 
                                    className="form-input" 
                                    value={filters.id_khoa_hoc} 
                                    onChange={e => setFilters({...filters, id_khoa_hoc: e.target.value})}
                                >
                                    <option value="">Tất cả chứng chỉ</option>
                                    {courses.map(c => <option key={c.id_khoa_hoc} value={c.id_khoa_hoc}>{c.ten_khoa_hoc}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                            <div style={{ flex: 1, minWidth: 150, position: 'relative' }}>
                                <MI name="psychology" style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    className="form-input" 
                                    placeholder="Lọc kỹ năng (Java, SQL...)" 
                                    style={{ paddingLeft: '2.5rem' }} 
                                    value={filters.skill} 
                                    onChange={e => setFilters({...filters, skill: e.target.value})} 
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 150 }}>
                                <select className="form-input" value={filters.level} onChange={e => setFilters({...filters, level: e.target.value})}>
                                    <option value="">Mọi trình độ</option>
                                    <option value="Starter">Starter</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: 150 }}>
                                <select className="form-input" value={filters.ready} onChange={e => setFilters({...filters, ready: e.target.value})}>
                                    <option value="">Mọi trạng thái</option>
                                    <option value="true">Sẵn sàng đi làm</option>
                                    <option value="false">Đang bận</option>
                                </select>
                            </div>
                            <button 
                                onClick={() => setFilters({ search: '', id_khoa_hoc: '', skill: '', level: '', ready: '' })}
                                style={{ background: '#f1f5f9', border: 'none', padding: '0 1rem', borderRadius: '10px', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Xóa lọc
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>Đang tìm kiếm nhân tài phù hợp...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                            {talents.map((t, idx) => (
                                <TalentCard key={idx} talent={t} onReviewClick={setReviewingTalent} />
                            ))}
                        </div>
                    )}
                    
                    {!loading && talents.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <MI name="search_off" style={{ fontSize: '3rem', display: 'block', margin: '0 auto 1rem' }} />
                            <p>Không tìm thấy ứng viên nào phù hợp với bộ lọc hiện tại.</p>
                        </div>
                    )}
                </>
            ) : (
                <HiredList />
            )}

            {reviewingTalent && (
                <ReviewModal 
                    talent={reviewingTalent} 
                    onClose={() => setReviewingTalent(null)} 
                    onReviewed={loadTalents}
                />
            )}
        </div>
    );
};

export default EmployerDashboard;
