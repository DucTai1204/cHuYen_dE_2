import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const ORANGE_GRADIENT = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
const BLUE_GRADIENT = 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%)';
const GREEN_GRADIENT = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

const SellerRevenue = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/lms/khoa-hoc/my-courses/')
            .then(res => setCourses(res.data || []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, []);

    const published = courses.filter(c => c.cong_khai);
    const totalRevenue = published.reduce((s, c) => s + (c.gia_tien || 0) * (c.tong_hoc_vien || 0), 0);
    const maxRev = Math.max(...published.map(c => (c.gia_tien || 0) * (c.tong_hoc_vien || 0)), 1);

    const totalEnrollments = courses.reduce((s, c) => s + (c.tong_hoc_vien || 0), 0);
    const avgRating = published.length > 0 
        ? (published.reduce((s, c) => s + Number(c.trung_binh_sao), 0) / published.length).toFixed(1)
        : 0;
    const satisfactionRate = (avgRating / 5 * 100).toFixed(0);

    return (
        <div className="fade-up" style={{ paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(to right, #1e293b, #64748b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '.4rem' }}>
                        Phân tích Doanh thu
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <MI name="trending_up" style={{ fontSize: '1rem', color: '#059669' }} /> 
                        Thống kê dựa trên dữ liệu khóa học hiện tại
                    </p>
                </div>
                <button style={{ padding: '.6rem 1.2rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    <MI name="download" /> Xuất báo cáo
                </button>
            </div>

            {/* Top Stats Cards */}
            <div className="grid-3" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
                {[
                    { label: 'Tổng doanh thu', value: totalRevenue, icon: 'payments', grad: ORANGE_GRADIENT, sub: 'VND' },
                    { label: 'Số dư khả dụng', value: totalRevenue * 0.9, icon: 'account_balance_wallet', grad: BLUE_GRADIENT, sub: 'Sau thuế & phí' },
                    { label: 'Khóa học đang bán', value: published.length, icon: 'stars', grad: GREEN_GRADIENT, sub: 'Khóa học' },
                ].map((s, i) => (
                    <div key={i} style={{ 
                        background: s.grad, padding: '1.5rem', borderRadius: '20px', color: '#fff', 
                        boxShadow: '0 10px 20px -5px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' 
                    }}>
                        <div style={{ position: 'absolute', right: '-10%', top: '-10%', opacity: 0.15 }}>
                            <MI name={s.icon} style={{ fontSize: '6rem' }} />
                        </div>
                        <div style={{ fontSize: '.9rem', fontWeight: 500, opacity: 0.9, marginBottom: '.75rem' }}>{s.label}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '.25rem' }}>
                            {typeof s.value === 'number' && i < 2 ? s.value.toLocaleString('vi-VN') : s.value}
                            <span style={{ fontSize: '1rem', marginLeft: '.4rem', fontWeight: 400 }}>{s.sub}</span>
                        </div>
                        <div style={{ fontSize: '.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                            <MI name="check_circle" style={{ fontSize: '.9rem' }} /> Dữ liệu đã cập nhật
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
                {/* Doanh thu biểu đồ */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Top doanh thu theo khóa học</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {published.slice(0, 5).map((c, i) => {
                            const rev = (c.gia_tien || 0) * (c.tong_hoc_vien || 0);
                            const perc = (rev / maxRev) * 100;
                            return (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: '.5rem', fontWeight: 600 }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{c.ten_khoa_hoc}</span>
                                        <span style={{ color: '#d97706' }}>{rev.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${perc}%`, height: '100%', background: ORANGE_GRADIENT, 
                                            borderRadius: '10px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Phân bổ đăng ký */}
                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Tỷ lệ hài lòng</h3>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ 
                            width: '140px', height: '140px', borderRadius: '50%', 
                            border: '12px solid #fef3c7', borderTopColor: '#d97706',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', fontWeight: 800, color: '#d97706',
                            transform: `rotate(${(satisfactionRate / 100 * 360) - 90}deg)`
                        }}>
                            <span style={{ transform: `rotate(${-((satisfactionRate / 100 * 360) - 90)}deg)` }}>{satisfactionRate}%</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '.85rem', fontWeight: 700 }}>Chất lượng đào tạo</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>Dựa trên {totalEnrollments} đăng ký</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chi tiết Table - Premium version */}
            <div style={{ marginTop: '1.5rem', background: '#fff', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>KHÓA HỌC</th>
                            <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>HỌC VIÊN</th>
                            <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>GIÁ NIÊM YẾT</th>
                            <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>DOANH THU TẠM TÍNH</th>
                        </tr>
                    </thead>
                    <tbody>
                        {published.map((c, i) => (
                            <tr key={i} className="table-row-hover" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.25rem', fontWeight: 600, color: '#1e293b' }}>{c.ten_khoa_hoc}</td>
                                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                    <span style={{ background: 'var(--primary-light)', color: 'var(--secondary)', padding: '.3rem .7rem', borderRadius: '8px', fontWeight: 700, fontSize: '.8rem' }}>
                                        {c.tong_hoc_vien}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b' }}>{Number(c.gia_tien).toLocaleString('vi-VN')}₫</td>
                                <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                                    {((c.gia_tien || 0) * (c.tong_hoc_vien || 0)).toLocaleString('vi-VN')}₫
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .table-row-hover:hover { background: #fffbeb !important; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default SellerRevenue;
