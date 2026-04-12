import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const ORANGE = '#d97706';
const ORANGE_LIGHT = '#fef3c7';
const ORANGE_DARK = '#92400e';
const PAGE_SIZE = 10;

// Màu cho Pie Chart (mảng tự nhiên, không AI)
const PIE_COLORS = ['#d97706','#b45309','#92400e','#78716c','#a8a29e','#57534e','#f59e0b','#ca8a04','#854d0e','#713f12'];

/* ─────────── SVG PIE CHART ─────────── */
const PieChart = ({ data, size = 260, hoveredIdx, onHover }) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Không có dữ liệu</div>;

    const DEPTH = 16;
    const RADIUS_X = 110;
    const RADIUS_Y = 60;
    const CX = size / 2;
    const CY = size / 2 - 5;

    let cumulative = -Math.PI / 2; // Bắt đầu từ hướng 12h cho thuận mắt

    const slices = data.map((d, i) => {
        const pct = d.value / total;
        const startAngle = cumulative;
        cumulative += pct * 2 * Math.PI;
        const endAngle = cumulative;
        const midAngle = (startAngle + endAngle) / 2;

        const x1 = CX + RADIUS_X * Math.cos(startAngle);
        const y1 = CY + RADIUS_Y * Math.sin(startAngle);
        const x2 = CX + RADIUS_X * Math.cos(endAngle);
        const y2 = CY + RADIUS_Y * Math.sin(endAngle);

        const largeArc = pct > 0.5 ? 1 : 0;
        const baseColor = PIE_COLORS[i % PIE_COLORS.length];

        return {
            id: i,
            label: d.label,
            value: d.value,
            pctLabel: (pct * 100).toFixed(1),
            color: baseColor,
            startAngle, endAngle, midAngle,
            x1, y1, x2, y2, largeArc,
            lx: CX + (RADIUS_X * 0.75) * Math.cos(midAngle),
            ly: CY + (RADIUS_Y * 0.75) * Math.sin(midAngle)
        };
    });

    // Sắp xếp thứ tự vẽ: Vẽ những phần ở xa (phía trên) trước, phần ở gần (phía dưới) sau
    // Đặc biệt: Miếng đang được Hover phải vẽ sau cùng để nó đè lên tất cả.
    const sortedSlices = [...slices].sort((a, b) => {
        if (a.id === hoveredIdx) return 1;
        if (b.id === hoveredIdx) return -1;
        // Phần nào có Sin(midAngle) lớn hơn thì ở gần người xem hơn -> vẽ sau
        return Math.sin(a.midAngle) - Math.sin(b.midAngle);
    });

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
                <defs>
                    {slices.map((s, i) => (
                        <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={s.color} />
                            <stop offset="100%" stopColor={s.color} stopOpacity={0.8} />
                        </linearGradient>
                    ))}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* --- HIT AREAS (Vùng bắt sự kiện cố định - KHÔNG DI CHUYỂN - Vẽ trước để không chắn các khối) --- */}
                {slices.map((s, i) => (
                    <path
                        key={`hit-${i}`}
                        d={`M ${CX} ${CY} L ${s.x1} ${s.y1} A ${RADIUS_X} ${RADIUS_Y} 0 ${s.largeArc} 1 ${s.x2} ${s.y2} Z`}
                        fill="transparent"
                        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                        onMouseEnter={() => onHover && onHover(i)}
                        onMouseLeave={() => onHover && onHover(null)}
                    />
                ))}

                {/* --- LỚP 1: CẠNH BÊN (SIDES) --- */}
                {sortedSlices.map((s) => {
                    const isHovered = hoveredIdx === s.id;
                    const hoverY = isHovered ? -12 : 0;
                    const sidePath = `M ${s.x1} ${s.y1} A ${RADIUS_X} ${RADIUS_Y} 0 ${s.largeArc} 1 ${s.x2} ${s.y2} L ${s.x2} ${s.y2 + DEPTH} A ${RADIUS_X} ${RADIUS_Y} 0 ${s.largeArc} 0 ${s.x1} ${s.y1 + DEPTH} Z`;
                    
                    return (
                        <g key={`side-${s.id}`} transform={`translate(0, ${hoverY})`} style={{ transition: 'transform .3s cubic-bezier(0.34, 1.56, 0.64, 1)', pointerEvents: 'none' }}>
                            <path d={sidePath} fill={s.color} filter="brightness(0.65)" />
                            <path d={`M ${CX} ${CY} L ${s.x1} ${s.y1} L ${s.x1} ${s.y1 + DEPTH} L ${CX} ${CY + DEPTH} Z`} fill={s.color} filter="brightness(0.55)" />
                            <path d={`M ${CX} ${CY} L ${s.x2} ${s.y2} L ${s.x2} ${s.y2 + DEPTH} L ${CX} ${CY + DEPTH} Z`} fill={s.color} filter="brightness(0.75)" />
                        </g>
                    );
                })}

                {/* --- LỚP 2: MẶT TRÊN (TOP FACES) --- */}
                {sortedSlices.map((s) => {
                    const isHovered = hoveredIdx === s.id;
                    const hoverY = isHovered ? -12 : 0;
                    const path = `M ${CX} ${CY} L ${s.x1} ${s.y1} A ${RADIUS_X} ${RADIUS_Y} 0 ${s.largeArc} 1 ${s.x2} ${s.y2} Z`;

                    return (
                        <g key={`top-${s.id}`} 
                            transform={`translate(0, ${hoverY})`}
                            style={{ transition: 'all .3s cubic-bezier(0.34, 1.56, 0.64, 1)', pointerEvents: 'none' }}
                        >
                            <path 
                                d={path} 
                                fill={`url(#grad-${s.id})`} 
                                stroke="#fff" 
                                strokeWidth={isHovered ? 2 : 0.5} 
                                filter={isHovered ? 'url(#glow)' : ''}
                            />
                            {(isHovered || parseFloat(s.pctLabel) > 8) && (
                                <text 
                                    x={s.lx} y={s.ly} 
                                    fill="#fff" 
                                    textAnchor="middle" 
                                    fontSize={isHovered ? 14 : 10} 
                                    fontWeight="900"
                                    style={{ transition: 'all .3s' }}
                                >
                                    {s.pctLabel}%
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

/* ─────────── REVENUE MODAL ─────────── */
const RevenueModal = ({ courses, onClose }) => {
    const [tab, setTab] = useState('pie');
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const published = courses.filter(c => c.cong_khai);
    const totalRevenue = published.reduce((s, c) => s + (c.gia_tien || 0) * (c.tong_hoc_vien || 0), 0);
    const fmtVnd = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}tr₫` : `${(n / 1000).toFixed(0)}k₫`;

    const pieData = published.map(c => ({
        label: c.ten_khoa_hoc,
        value: (c.gia_tien || 0) * (c.tong_hoc_vien || 0),
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

    // Tab 2: Ranking
    const ranked = [...published]
        .map(c => ({ ...c, rev: (c.gia_tien || 0) * (c.tong_hoc_vien || 0) }))
        .sort((a, b) => b.rev - a.rev);

    // Tab 3: Conversion rate (học viên vs doanh thu)
    const maxStudents = Math.max(...published.map(c => c.tong_hoc_vien || 0), 1);

    const TABS = [
        { id: 'pie', icon: 'pie_chart', label: 'Phân bổ' },
        { id: 'rank', icon: 'leaderboard', label: 'Xếp hạng' },
        { id: 'convert', icon: 'people_alt', label: 'Học viên' },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="fade-up" style={{ background: '#fff', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
                {/* Modal Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--secondary)' }}>Chi tiết Doanh thu</h2>
                        <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.1rem' }}>{published.length} khóa học đang bán · Tổng {fmtVnd(totalRevenue)}</p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '.4rem', cursor: 'pointer', display: 'flex' }}>
                        <MI name="close" style={{ fontSize: '1.1rem', color: '#64748b' }} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '.25rem', padding: '.75rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '.4rem',
                            padding: '.4rem .9rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: tab === t.id ? ORANGE_LIGHT : 'transparent',
                            color: tab === t.id ? ORANGE_DARK : 'var(--text-secondary)',
                            fontWeight: tab === t.id ? 700 : 500, fontSize: '.82rem', transition: 'all .15s',
                        }}>
                            <MI name={t.icon} style={{ fontSize: '1rem' }} />{t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>

                    {/* ── TAB 1: PIE CHART ── */}
                    {tab === 'pie' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'center' }}>
                            <PieChart data={pieData} size={240} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', maxHeight: 280, overflowY: 'auto', paddingRight: '.25rem' }}>
                                {pieData.map((d, i) => {
                                    const pct = totalRevenue > 0 ? ((d.value / totalRevenue) * 100).toFixed(1) : 0;
                                    return (
                                        <div key={i}
                                            onMouseEnter={() => setHoveredIdx(i)}
                                            onMouseLeave={() => setHoveredIdx(null)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.4rem .5rem', borderRadius: '7px', background: hoveredIdx === i ? '#fffbeb' : 'transparent', border: hoveredIdx === i ? `1px solid #fcd34d` : '1px solid transparent', transition: 'all .15s', cursor: 'default' }}
                                        >
                                            <div style={{ width: 10, height: 10, borderRadius: '3px', flexShrink: 0, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span style={{ flex: 1, fontSize: '.78rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
                                            <span style={{ fontSize: '.75rem', fontWeight: 700, color: ORANGE, flexShrink: 0 }}>{pct}%</span>
                                            <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>{fmtVnd(d.value)}</span>
                                        </div>
                                    );
                                })}
                                {pieData.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>Chưa có doanh thu từ khóa nào.</p>}
                            </div>
                        </div>
                    )}

                    {/* ── TAB 2: RANKING TABLE ── */}
                    {tab === 'rank' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 80px 80px 80px', gap: '.75rem', padding: '.5rem .75rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '.75rem', fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                <span>#</span>
                                <span>Khóa học</span>
                                <span style={{ textAlign: 'right' }}>HV</span>
                                <span style={{ textAlign: 'right' }}>Giá</span>
                                <span style={{ textAlign: 'right' }}>Doanh thu</span>
                            </div>
                            {ranked.map((c, i) => {
                                const medals = ['🥇', '🥈', '🥉'];
                                return (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 80px 80px 80px', gap: '.75rem', padding: '.6rem .75rem', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ fontSize: '.9rem' }}>{medals[i] || <span style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}>{i + 1}</span>}</span>
                                        <span style={{ fontSize: '.83rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ten_khoa_hoc}</span>
                                        <span style={{ fontSize: '.82rem', textAlign: 'right', color: '#2563eb', fontWeight: 600 }}>{c.tong_hoc_vien || 0}</span>
                                        <span style={{ fontSize: '.78rem', textAlign: 'right', color: 'var(--text-muted)' }}>{Number(c.gia_tien || 0).toLocaleString('vi-VN')}₫</span>
                                        <span style={{ fontSize: '.82rem', textAlign: 'right', fontWeight: 700, color: c.rev > 0 ? '#059669' : 'var(--text-muted)' }}>{c.rev > 0 ? fmtVnd(c.rev) : '—'}</span>
                                    </div>
                                );
                            })}
                            {ranked.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Chưa có khóa học đang bán</p>}
                        </div>
                    )}

                    {/* ── TAB 3: HỌC VIÊN CONVERSION ── */}
                    {tab === 'convert' && (
                        <div>
                            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>So sánh số lượng học viên giữa các khóa học. Khóa đông học viên nhất = 100%.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[...published].sort((a, b) => (b.tong_hoc_vien || 0) - (a.tong_hoc_vien || 0)).map((c, i) => {
                                    const pct = ((c.tong_hoc_vien || 0) / maxStudents) * 100;
                                    const rev = (c.gia_tien || 0) * (c.tong_hoc_vien || 0);
                                    return (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem', alignItems: 'baseline' }}>
                                                <span style={{ fontSize: '.83rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>{c.ten_khoa_hoc}</span>
                                                <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
                                                    <span style={{ fontSize: '.75rem', color: '#2563eb', fontWeight: 700 }}>{c.tong_hoc_vien || 0} HV</span>
                                                    <span style={{ fontSize: '.75rem', color: ORANGE, fontWeight: 700 }}>{rev > 0 ? fmtVnd(rev) : 'Miễn phí'}</span>
                                                </div>
                                            </div>
                                            <div style={{ height: 8, background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                                                <div style={{ width: `${pct}%`, height: '100%', background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: '99px', transition: 'width .8s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {published.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Chưa có khóa học đang bán</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────── STATUS BADGE ─────────── */
const StatusBadge = ({ published }) => published
    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.15rem .6rem', borderRadius: '99px', fontSize: '.7rem', fontWeight: 600, background: '#ecfdf5', color: '#059669' }}>● Đang bán</span>
    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.15rem .6rem', borderRadius: '99px', fontSize: '.7rem', fontWeight: 600, background: '#f1f5f9', color: '#64748b' }}>○ Bản nháp</span>;

/* ─────────── TOAST ─────────── */
const Toast = ({ msg, type = 'success' }) => (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: type === 'error' ? '#ef4444' : '#1e293b', color: '#fff', padding: '.75rem 1.25rem', borderRadius: '10px', fontSize: '.875rem', zIndex: 9999, boxShadow: '0 10px 30px rgba(0,0,0,.2)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        {type === 'error' ? '❌' : '✅'} {msg}
    </div>
);

/* ─────────── COURSE ROW ─────────── */
const CourseRow = ({ course, onPublish, onUnpublish }) => {
    const rev = (course.gia_tien || 0) * (course.tong_hoc_vien || 0);
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', alignItems: 'center', gap: '1rem', padding: '.85rem 1.25rem', borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', minWidth: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: course.hinh_anh_thumbnail ? 'transparent' : ORANGE_LIGHT, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {course.hinh_anh_thumbnail
                        ? <img 
                            src={course.hinh_anh_thumbnail?.replace('maxresdefault.jpg', 'hqdefault.jpg')} 
                            alt="" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={e => e.target.style.display = 'none'} 
                        />
                        : <MI name="menu_book" style={{ fontSize: '.9rem', color: ORANGE }} />}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.88rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.ten_khoa_hoc}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.1rem' }}>{course.tong_hoc_vien || 0} học viên · {course.tong_bai || 0} bài</div>
                </div>
            </div>
            <StatusBadge published={course.cong_khai} />
            <div style={{ textAlign: 'right', minWidth: 90 }}>
                <div style={{ fontWeight: 700, fontSize: '.88rem', color: '#059669' }}>{rev >= 1e6 ? `${(rev / 1e6).toFixed(1)}tr` : `${(rev / 1000).toFixed(0)}k`}₫</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>{Number(course.gia_tien).toLocaleString('vi-VN')}₫/kh</div>
            </div>
            <div style={{ display: 'flex', gap: '.4rem' }}>
                <Link to={`/seller/courses/${course.id_khoa_hoc}/builder`}>
                    <button style={{ padding: '.35rem .75rem', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '7px', cursor: 'pointer', fontSize: '.78rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                        <MI name="edit" style={{ fontSize: '.9rem' }} /> Sửa
                    </button>
                </Link>
                {course.cong_khai ? (
                    <button onClick={() => onUnpublish(course.id_khoa_hoc)} style={{ padding: '.35rem .75rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '7px', cursor: 'pointer', fontSize: '.78rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                        <MI name="visibility_off" style={{ fontSize: '.9rem' }} /> Ẩn
                    </button>
                ) : (
                    <button onClick={() => onPublish(course.id_khoa_hoc)} style={{ padding: '.35rem .75rem', background: ORANGE_LIGHT, color: ORANGE_DARK, border: `1px solid #fcd34d`, borderRadius: '7px', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                        <MI name="publish" style={{ fontSize: '.9rem' }} /> Đăng
                    </button>
                )}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   SELLER DASHBOARD
══════════════════════════════════════════════════════════════ */
const SellerDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [streamingCourses, setStreamingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);
    const [page, setPage] = useState(1);
    const [showRevModal, setShowRevModal] = useState(false);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };

    const fetchMyCourses = (active = { current: true }) => {
        setLoading(true);
        api.get('/lms/khoa-hoc/my-courses/')
            .then(res => {
                if (!active.current) return;
                const data = res.data || [];
                setCourses(data);
                
                setStreamingCourses([]);
                data.forEach((item, index) => {
                    setTimeout(() => {
                        if (!active.current) return;
                        setStreamingCourses(prev => {
                            if (prev.some(c => c.id_khoa_hoc === item.id_khoa_hoc)) return prev;
                            return [...prev, item];
                        });
                    }, index * 100);
                });
            })
            .catch(() => { if (active.current) setCourses([]); })
            .finally(() => { if (active.current) setLoading(false); });
    };

    useEffect(() => {
        const active = { current: true };
        fetchMyCourses(active);
        return () => { active.current = false; };
    }, []);

    const handlePublish = async (id) => {
        try { await api.post(`/lms/khoa-hoc/${id}/publish/`); showToast('Khóa học đã được đăng bán!'); fetchMyCourses(); }
        catch { showToast('Lỗi khi đăng bán', 'error'); }
    };
    const handleUnpublish = async (id) => {
        try { await api.post(`/lms/khoa-hoc/${id}/unpublish/`); showToast('Đã ẩn khóa học'); fetchMyCourses(); }
        catch { showToast('Lỗi khi ẩn', 'error'); }
    };

    const published = courses.filter(c => c.cong_khai);
    const drafts = courses.filter(c => !c.cong_khai);
    const totalStudents = courses.reduce((s, c) => s + (c.tong_hoc_vien || 0), 0);
    const totalRevenue = published.reduce((s, c) => s + (c.gia_tien || 0) * (c.tong_hoc_vien || 0), 0);
    const maxRev = Math.max(...published.map(c => (c.gia_tien || 0) * (c.tong_hoc_vien || 0)), 1);
    const fmtVnd = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}tr₫` : `${(n / 1000).toFixed(0)}k₫`;

    // Reset page khi filter/search thay đổi
    const filtered = (search || filter !== 'all' ? courses : streamingCourses).filter(c => {
        const ok = filter === 'all' || (filter === 'pub' && c.cong_khai) || (filter === 'draft' && !c.cong_khai);
        return ok && (!search || c.ten_khoa_hoc?.toLowerCase().includes(search.toLowerCase()));
    });
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleFilterChange = (val) => { setFilter(val); setPage(1); };
    const handleSearchChange = (val) => { setSearch(val); setPage(1); };

    return (
        <div className="fade-up">
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '.2rem' }}>Kênh Người bán</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>Quản lý khóa học, theo dõi doanh thu và học viên</p>
                </div>
                <Link to="/seller/courses/new">
                    <button className="btn btn-primary" style={{ gap: '.4rem', fontSize: '.85rem' }}>
                        <MI name="add" style={{ fontSize: '1.1rem' }} /> Tạo khóa học
                    </button>
                </Link>
            </div>

            {/* ── STATS STRIP ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { icon: 'menu_book', label: 'Tổng khóa học', value: courses.length, sub: `${published.length} đbán · ${drafts.length} nháp` },
                    { icon: 'groups', label: 'Học viên', value: totalStudents, sub: 'Tổng đăng ký' },
                    { icon: 'paid', label: 'Doanh thu TT', value: fmtVnd(totalRevenue), sub: 'Tạm tính' },
                    { icon: 'account_balance_wallet', label: 'Số dư khả dụng', value: fmtVnd(totalRevenue * 0.9), sub: 'Sau phí 10%' },
                ].map((s, i) => (
                    <div key={i} className="stagger-item" style={{ animationDelay: `${i * 0.1}s`, background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                        <div style={{ width: 40, height: 40, background: ORANGE_LIGHT, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MI name={s.icon} style={{ fontSize: '1.3rem', color: ORANGE }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.2rem' }}>{s.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── 2-COL LAYOUT ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>

                {/* Danh sách khóa học */}
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                    {/* Toolbar */}
                    <div style={{ display: 'flex', gap: '.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '.25rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '.2rem' }}>
                            {[
                                { val: 'all', label: `Tất cả (${courses.length})` },
                                { val: 'pub', label: `Bán (${published.length})` },
                                { val: 'draft', label: `Nháp (${drafts.length})` },
                            ].map(f => (
                                <button key={f.val} onClick={() => handleFilterChange(f.val)} style={{ padding: '.28rem .7rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: filter === f.val ? '#fff' : 'transparent', color: filter === f.val ? ORANGE_DARK : 'var(--text-secondary)', fontWeight: filter === f.val ? 700 : 400, fontSize: '.78rem', boxShadow: filter === f.val ? 'var(--shadow-sm)' : 'none', transition: 'all .15s' }}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ position: 'relative', flex: 1, minWidth: 150 }}>
                            <MI name="search" style={{ position: 'absolute', left: '.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }} />
                            <input
                                value={search} onChange={e => handleSearchChange(e.target.value)}
                                placeholder="Tìm khóa học..."
                                style={{ width: '100%', paddingLeft: '2rem', paddingRight: '.75rem', paddingTop: '.4rem', paddingBottom: '.4rem', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '.82rem', outline: 'none', background: '#fff', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    {/* Course list */}
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="skeleton" style={{ height: 60, margin: '1rem' }} />
                            ))}
                        </div>
                    ) : filtered.length === 0 && courses.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <MI name="inventory_2" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '.75rem' }} />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: '1.25rem' }}>Bạn chưa có khóa học nào. Hãy tạo ngay!</p>
                            <Link to="/seller/courses/new"><button className="btn btn-primary">+ Tạo khóa học ngay</button></Link>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy kết quả</div>
                    ) : (
                        <div>
                            {/* Table header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '1rem', padding: '.6rem 1.25rem', background: '#f8fafc' }}>
                                <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Khóa học</span>
                                <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trạng thái</span>
                                <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right', minWidth: 90 }}>Doanh thu</span>
                                <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: 100 }}></span>
                            </div>
                            {paginated.map((c, i) => (
                                <div key={c.id_khoa_hoc} className="stagger-item" style={{ animationDelay: '0s' }}>
                                    <CourseRow course={c} onPublish={handlePublish} onUnpublish={handleUnpublish} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                            <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                                {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} khóa học
                            </span>
                            <div style={{ display: 'flex', gap: '.3rem' }}>
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '.3rem .65rem', border: '1px solid var(--border)', borderRadius: '6px', background: page === 1 ? '#f8fafc' : '#fff', color: page === 1 ? '#cbd5e1' : '#1e293b', cursor: page === 1 ? 'default' : 'pointer', fontSize: '.8rem' }}>‹</button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const p = i + 1;
                                    return (
                                        <button key={p} onClick={() => setPage(p)} style={{ padding: '.3rem .65rem', border: '1px solid', borderColor: page === p ? ORANGE : 'var(--border)', borderRadius: '6px', background: page === p ? ORANGE_LIGHT : '#fff', color: page === p ? ORANGE_DARK : '#1e293b', fontWeight: page === p ? 700 : 400, cursor: 'pointer', fontSize: '.8rem' }}>{p}</button>
                                    );
                                })}
                                {totalPages > 5 && <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', padding: '.3rem .4rem' }}>...</span>}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '.3rem .65rem', border: '1px solid var(--border)', borderRadius: '6px', background: page === totalPages ? '#f8fafc' : '#fff', color: page === totalPages ? '#cbd5e1' : '#1e293b', cursor: page === totalPages ? 'default' : 'pointer', fontSize: '.8rem' }}>›</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Top doanh thu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', flex: 1 }}>
                        {/* Header với nút Chi tiết */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: '#1e293b' }}>Top doanh thu</h3>
                            <button
                                onClick={() => setShowRevModal(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '.3rem', padding: '.3rem .65rem', border: '1px solid var(--border)', borderRadius: '6px', background: '#f8fafc', color: 'var(--text-secondary)', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = ORANGE_LIGHT; e.currentTarget.style.color = ORANGE_DARK; e.currentTarget.style.borderColor = '#fcd34d'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                                <MI name="bar_chart" style={{ fontSize: '.9rem' }} /> Chi tiết
                            </button>
                        </div>

                        {published.length === 0 ? (
                            <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Chưa có khóa học đang bán</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {published.slice(0, 5).map((c, i) => {
                                    const rev = (c.gia_tien || 0) * (c.tong_hoc_vien || 0);
                                    const perc = (rev / maxRev) * 100;
                                    return (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', marginBottom: '.4rem' }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%', fontWeight: 600, color: '#1e293b' }}>{c.ten_khoa_hoc}</span>
                                                <span style={{ color: ORANGE, fontWeight: 700, flexShrink: 0 }}>{fmtVnd(rev)}</span>
                                            </div>
                                            <div style={{ height: 5, background: '#f1f5f9', borderRadius: '99px' }}>
                                                <div style={{ width: `${perc}%`, height: '100%', background: ORANGE, borderRadius: '99px', transition: 'width .8s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {published.length > 5 && (
                                    <button onClick={() => setShowRevModal(true)} style={{ background: 'none', border: 'none', color: ORANGE, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                                        + {published.length - 5} khóa khác →
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Số dư summary */}
                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: '.4rem', color: 'var(--text-secondary)' }}>
                                <span>Tổng doanh thu</span>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>{fmtVnd(totalRevenue)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                                <span>Phí nền tảng (10%)</span>
                                <span style={{ fontWeight: 600, color: '#dc2626' }}>-{fmtVnd(totalRevenue * 0.1)}</span>
                            </div>
                            <div style={{ marginTop: '.75rem', padding: '.6rem .75rem', background: '#ecfdf5', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#065f46' }}>Nhận về ước tính</span>
                                <span style={{ fontWeight: 800, color: '#059669', fontSize: '.95rem' }}>{fmtVnd(totalRevenue * 0.9)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast msg={toast.msg} type={toast.type} />}
            {showRevModal && <RevenueModal courses={courses} onClose={() => setShowRevModal(false)} />}
        </div>
    );
};

export default SellerDashboard;
