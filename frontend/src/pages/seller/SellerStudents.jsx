import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.1rem', ...style }}>{name}</span>;

const ORANGE = '#d97706';

/* Hiển thị phần trăm progress */
const ProgressBar = ({ value, color = ORANGE }) => (
    <div style={{ height: 5, background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width .6s ease' }} />
    </div>
);

/* Badge trạng thái học */
const StatusBadge = ({ status }) => {
    const map = {
        DaXong: { label: 'Hoàn thành', color: '#059669', bg: '#ecfdf5' },
        DangHoc: { label: 'Đang học', color: ORANGE, bg: '#fef3c7' },
        ChuaBatDau: { label: 'Chưa học', color: '#94a3b8', bg: '#f1f5f9' },
    };
    const s = map[status] || map.ChuaBatDau;
    return <span style={{ padding: '.2rem .55rem', borderRadius: '99px', fontSize: '.68rem', fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
};

const SellerStudents = () => {
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');
    const [expandedStudentId, setExpandedStudentId] = useState(null);
    const [progressMap, setProgressMap] = useState({});

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/lms/khoa-hoc/my-courses/'),
            api.get('/lms/dang-ky-hoc/'),
        ])
            .then(([cRes, eRes]) => {
                setCourses(cRes.data || []);
                setEnrollments((eRes.data || []).filter(e =>
                    (cRes.data || []).some(c => c.id_khoa_hoc === e.id_khoa_hoc)
                ));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    /* Group students */
    const groupedStudents = enrollments.reduce((acc, curr) => {
        const uid = curr.id_nguoi_dung;
        if (!acc[uid]) {
            acc[uid] = { id: uid, name: curr.ten_hoc_vien || `#${uid}`, avatar: curr.hinh_anh_hoc_vien, enrolledCourses: [] };
        }
        const courseInfo = courses.find(c => c.id_khoa_hoc === curr.id_khoa_hoc);
        acc[uid].enrolledCourses.push({ ...curr, fullData: courseInfo });
        return acc;
    }, {});

    const studentList = Object.values(groupedStudents).filter(s => {
        const nameOk = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const courseOk = filterCourse === 'all' || s.enrolledCourses.some(ec => String(ec.id_khoa_hoc) === filterCourse);
        return nameOk && courseOk;
    });

    /* Stats */
    const totalCompleted = enrollments.filter(e => e.trang_thai_hoc === 'DaXong').length;
    const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((s, e) => s + (e.phan_tram_hoan_thanh || 0), 0) / enrollments.length)
        : 0;

    const handleExpandToggle = async (student) => {
        if (expandedStudentId === student.id) { setExpandedStudentId(null); return; }
        setExpandedStudentId(student.id);
        for (const ec of student.enrolledCourses) {
            const key = `${student.id}_${ec.id_khoa_hoc}`;
            if (!progressMap[key]) {
                try {
                    const res = await api.get(`/lms/tien-do-bai/?khoa_hoc=${ec.id_khoa_hoc}&user=${student.id}`);
                    setProgressMap(prev => ({ ...prev, [key]: res.data.completed_lesson_ids || [] }));
                } catch { }
            }
        }
    };

    return (
        <div className="fade-up" style={{ paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '.2rem' }}>Học viên</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>Theo dõi tiến độ và thống kê học tập</p>
            </div>

            {/* Stats chips */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[
                    { icon: 'group', label: 'Tổng học viên', value: studentList.length },
                    { icon: 'school', label: 'Lượt đăng ký', value: enrollments.length },
                    { icon: 'check_circle', label: 'Hoàn thành', value: totalCompleted },
                    { icon: 'trending_up', label: 'Trung bình tiến độ', value: `${avgProgress}%` },
                ].map((stat, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '.75rem 1.1rem', display: 'flex', alignItems: 'center', gap: '.65rem', boxShadow: 'var(--shadow-sm)' }}>
                        <MI name={stat.icon} style={{ color: ORANGE, fontSize: '1.2rem' }} />
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1, color: '#1e293b' }}>{stat.value}</div>
                            <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginTop: '.15rem' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <MI name="search" style={{ position: 'absolute', left: '.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }} />
                    <input
                        placeholder="Tìm học viên..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2rem', paddingRight: '.75rem', paddingTop: '.5rem', paddingBottom: '.5rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.85rem', outline: 'none', background: '#fff', fontFamily: 'inherit', minWidth: 220 }}
                    />
                </div>
                <select
                    value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
                    style={{ padding: '.5rem .75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.85rem', fontFamily: 'inherit', background: '#fff', color: 'var(--text-primary)', outline: 'none' }}
                >
                    <option value="all">Tất cả khóa học</option>
                    {courses.map(c => <option key={c.id_khoa_hoc} value={String(c.id_khoa_hoc)}>{c.ten_khoa_hoc}</option>)}
                </select>
                {(searchTerm || filterCourse !== 'all') && (
                    <button onClick={() => { setSearchTerm(''); setFilterCourse('all'); }} style={{ padding: '.45rem .9rem', border: '1px solid var(--border)', borderRadius: '8px', background: '#fff', fontSize: '.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        Xóa lọc
                    </button>
                )}
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{studentList.length} học viên</span>
            </div>

            {/* Student Table */}
            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>
            ) : studentList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <MI name="group_off" style={{ fontSize: '3rem', color: '#cbd5e1' }} />
                    <p style={{ color: '#64748b', marginTop: '.75rem' }}>Không tìm thấy học viên nào</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    {studentList.map((student) => {
                        const isExpanded = expandedStudentId === student.id;
                        // Tính overall progress của student này
                        const allProgress = student.enrolledCourses.map(ec => ec.phan_tram_hoan_thanh || 0);
                        const avgStudentProgress = allProgress.length > 0 ? Math.round(allProgress.reduce((s, v) => s + v, 0) / allProgress.length) : 0;

                        return (
                            <div key={student.id} style={{
                                background: '#fff',
                                border: isExpanded ? `1.5px solid ${ORANGE}` : '1px solid var(--border)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: isExpanded ? `0 4px 20px rgba(217,119,6,0.1)` : 'var(--shadow-sm)',
                                transition: 'all .2s ease',
                            }}>
                                {/* Row header */}
                                <div
                                    onClick={() => handleExpandToggle(student)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.9rem 1.25rem', cursor: 'pointer' }}
                                    onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = '#fffbeb'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {/* Avatar */}
                                    <div style={{
                                        width: 42, height: 42, borderRadius: '10px', flexShrink: 0,
                                        background: student.avatar ? 'transparent' : 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 800, fontSize: '1rem', color: ORANGE, overflow: 'hidden'
                                    }}>
                                        {student.avatar
                                            ? <img src={student.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : student.name[0].toUpperCase()
                                        }
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '.92rem', color: '#1e293b', marginBottom: '.2rem' }}>{student.name}</div>
                                        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{student.enrolledCourses.length} khóa học</span>
                                            {student.enrolledCourses.map((ec, i) => (
                                                <span key={i} style={{ fontSize: '.68rem', background: '#f1f5f9', color: '#64748b', padding: '.15rem .45rem', borderRadius: '99px', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {ec.fullData?.ten_khoa_hoc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Overall progress */}
                                    <div style={{ width: 100, textAlign: 'center', flexShrink: 0 }}>
                                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: '.3rem' }}>Tiến độ TB</div>
                                        <div style={{ fontWeight: 800, fontSize: '.95rem', color: avgStudentProgress >= 100 ? '#059669' : ORANGE, marginBottom: '.3rem' }}>
                                            {avgStudentProgress}%
                                        </div>
                                        <ProgressBar value={avgStudentProgress} color={avgStudentProgress >= 100 ? '#059669' : ORANGE} />
                                    </div>

                                    {/* Expand toggle */}
                                    <MI name={isExpanded ? 'expand_less' : 'expand_more'} style={{ color: 'var(--text-muted)', fontSize: '1.25rem', flexShrink: 0 }} />
                                </div>

                                {/* Expanded detail */}
                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '1.25rem', background: '#fafaf8', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {student.enrolledCourses.map((ec, i) => {
                                            const completedIds = progressMap[`${student.id}_${ec.id_khoa_hoc}`] || [];
                                            const totalLessons = ec.fullData?.chuong_set?.reduce((s, ch) => s + ch.bai_giang.length, 0) || 0;
                                            const pct = ec.phan_tram_hoan_thanh || 0;
                                            return (
                                                <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                                                    {/* Course header */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
                                                        <div style={{ fontWeight: 700, fontSize: '.88rem', color: '#1e293b' }}>{ec.fullData?.ten_khoa_hoc}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                                                            <StatusBadge status={ec.trang_thai_hoc} />
                                                            <span style={{ fontWeight: 800, fontSize: '.9rem', color: pct >= 100 ? '#059669' : ORANGE }}>{pct}%</span>
                                                        </div>
                                                    </div>
                                                    <ProgressBar value={pct} color={pct >= 100 ? '#059669' : ORANGE} />
                                                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.4rem' }}>
                                                        Đã hoàn thành {completedIds.length}/{totalLessons} bài học
                                                    </div>

                                                    {/* Chapters */}
                                                    {ec.fullData?.chuong_set && ec.fullData.chuong_set.length > 0 && (
                                                        <div style={{ marginTop: '.85rem', display: 'flex', flexDirection: 'column', gap: '.4rem', maxHeight: 200, overflowY: 'auto', paddingRight: '.25rem' }}>
                                                            {ec.fullData.chuong_set.map((chuong, ci) => (
                                                                <div key={ci}>
                                                                    <div style={{ fontSize: '.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '.25rem' }}>
                                                                        Chương {ci + 1}: {chuong.ten_chuong}
                                                                    </div>
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                                                                        {chuong.bai_giang.map((bai, bi) => {
                                                                            const isDone = completedIds.includes(bai.id_bai_giang);
                                                                            return (
                                                                                <div key={bi} title={bai.ten_bai_giang} style={{
                                                                                    display: 'flex', alignItems: 'center', gap: '.3rem',
                                                                                    padding: '.2rem .5rem', borderRadius: '6px', fontSize: '.7rem', fontWeight: 500,
                                                                                    background: isDone ? '#ecfdf5' : '#f8fafc',
                                                                                    color: isDone ? '#059669' : '#94a3b8',
                                                                                    border: `1px solid ${isDone ? '#d1fae5' : '#f1f5f9'}`,
                                                                                    maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                                                }}>
                                                                                    <MI name={isDone ? 'check_circle' : 'radio_button_unchecked'} style={{ fontSize: '.75rem', flexShrink: 0 }} />
                                                                                    {bai.ten_bai_giang}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SellerStudents;
