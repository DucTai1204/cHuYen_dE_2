import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;
const EMP_BLUE = 'var(--secondary)';
const EMP_BLUE_LIGHT = 'var(--secondary-light)';

const EmployerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ talents: 0, courses: 0, hired: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [rTalents, rCourses, rHired] = await Promise.all([
                    api.get('/lms/dang-ky-hoc/all-talent/'),
                    api.get('/lms/khoa-hoc/'),
                    api.get('/lms/tuyen-dung/')
                ]);
                setStats({
                    talents: rTalents.data?.length || 0,
                    courses: rCourses.data?.length || 0,
                    hired: rHired.data?.length || 0
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="fade-up">
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: EMP_BLUE }}>Tổng Quan Kênh Nhà Tuyển Dụng</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Theo dõi hiệu quả tuyển dụng và thông tin nhân sự trên hệ thống EduHKT.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Đang tải dữ liệu tổng quan...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        {/* THỐNG KÊ 1 */}
                        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '15px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: 60, height: 60, background: EMP_BLUE_LIGHT, color: EMP_BLUE, borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MI name="person_search" style={{ fontSize: '2rem' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '.3rem' }}>ỨNG VIÊN SẴN SÀNG</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.talents}</div>
                            </div>
                        </div>

                        {/* THỐNG KÊ 2 */}
                        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '15px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: 60, height: 60, background: '#fef3c7', color: '#d97706', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MI name="explore" style={{ fontSize: '2rem' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '.3rem' }}>KHÓA ĐÀO TẠO</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.courses}</div>
                            </div>
                        </div>

                        {/* THỐNG KÊ 3 */}
                        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '15px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: 60, height: 60, background: '#ecfdf5', color: '#059669', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MI name="badge" style={{ fontSize: '2rem' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '.3rem' }}>ĐÃ TUYỂN DỤNG</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.hired}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '15px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem', color: EMP_BLUE, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                <MI name="flash_on" /> Thao tác nhanh
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                                <button onClick={() => navigate('/employer/talents')} className="btn" style={{ textAlign: 'left', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                    <div style={{ background: EMP_BLUE, color: '#fff', borderRadius: '50%', padding: '.4rem', display: 'flex' }}><MI name="person_search" style={{ fontSize: '1rem' }} /></div>
                                    <div style={{ flex: 1 }}>Tìm kiếm Nhân tài mới</div>
                                    <MI name="chevron_right" style={{ color: 'var(--text-muted)' }} />
                                </button>
                                <button onClick={() => navigate('/employer/courses')} className="btn" style={{ textAlign: 'left', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                    <div style={{ background: '#d97706', color: '#fff', borderRadius: '50%', padding: '.4rem', display: 'flex' }}><MI name="menu_book" style={{ fontSize: '1rem' }} /></div>
                                    <div style={{ flex: 1 }}>Khám phá Lộ trình Đào tạo</div>
                                    <MI name="chevron_right" style={{ color: 'var(--text-muted)' }} />
                                </button>
                                <button onClick={() => navigate('/employer/jobs')} className="btn" style={{ textAlign: 'left', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                    <div style={{ background: '#059669', color: '#fff', borderRadius: '50%', padding: '.4rem', display: 'flex' }}><MI name="work" style={{ fontSize: '1rem' }} /></div>
                                    <div style={{ flex: 1 }}>Theo dõi Quản lý Tuyển dụng</div>
                                    <MI name="chevron_right" style={{ color: 'var(--text-muted)' }} />
                                </button>
                            </div>
                        </div>

                        <div style={{ background: '#8a6a4fbb', border: 'none', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(30,58,138,.3)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👋</div>
                            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '.75rem' }}>Chào mừng trở lại!</h3>
                            <p style={{ fontSize: '.9rem', opacity: .8, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                EduHKT cung cấp nền tảng kết nối nhân sự chất lượng cao, được đánh giá minh bạch thông qua chứng chỉ và kỹ năng thực tế. Hãy bắt đầu chọn lọc những ứng viên xuất sắc nhất cho doanh nghiệp của bạn!
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EmployerDashboard;
