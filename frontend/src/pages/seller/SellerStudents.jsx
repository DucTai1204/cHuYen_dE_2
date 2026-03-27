import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.1rem', ...style }}>{name}</span>;

const SellerStudents = () => {
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State quản lý việc mở rộng và dữ liệu tiến độ chi tiết
    const [expandedStudentId, setExpandedStudentId] = useState(null);
    const [progressMap, setProgressMap] = useState({}); // { studentId_courseId: [completed_ids] }

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
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const groupedStudents = enrollments.reduce((acc, curr) => {
        const uid = curr.id_nguoi_dung;
        if (!acc[uid]) {
            acc[uid] = {
                id: uid,
                name: curr.ten_hoc_vien || `Học viên #${uid}`,
                enrolledCourses: []
            };
        }
        const courseInfo = courses.find(c => c.id_khoa_hoc === curr.id_khoa_hoc);
        acc[uid].enrolledCourses.push({
            ...curr,
            fullData: courseInfo
        });
        return acc;
    }, {});

    const studentList = Object.values(groupedStudents).filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExpandToggle = async (student) => {
        if (expandedStudentId === student.id) {
            setExpandedStudentId(null);
            return;
        }

        setExpandedStudentId(student.id);
        
        // Fetch tiến độ thật cho tất cả khóa học của học viên này
        for (const ec of student.enrolledCourses) {
            const key = `${student.id}_${ec.id_khoa_hoc}`;
            if (!progressMap[key]) {
                try {
                    const res = await api.get(`/lms/tien-do-bai/?khoa_hoc=${ec.id_khoa_hoc}&user=${student.id}`);
                    setProgressMap(prev => ({
                        ...prev,
                        [key]: res.data.completed_lesson_ids || []
                    }));
                } catch (err) {
                    console.error("Lỗi lấy tiến độ:", err);
                }
            }
        }
    };

    return (
        <div className="fade-up" style={{ paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>Quản lý học viên</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Theo dõi chi tiết lộ trình học tập của từng cá nhân</p>
            </div>

            <div style={{ 
                marginBottom: '2rem', background: '#fff', padding: '1rem', 
                borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                display: 'flex', alignItems: 'center', maxWidth: '500px'
            }}>
                <MI name="search" style={{ color: '#94a3b8', marginRight: '1rem' }} />
                <input 
                    placeholder="Tìm kiếm theo tên học viên..." 
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '.9rem', fontFamily: 'inherit' }}
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={{ padding: '5rem', textAlign: 'center' }}><div className="spinner"></div></div>
            ) : studentList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', borderRadius: '20px', border: '1px solid var(--border)' }}>
                    <MI name="group_off" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                    <p style={{ color: '#64748b' }}>Không tìm thấy học viên nào</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    {studentList.map((student, idx) => {
                        const isExpanded = expandedStudentId === student.id;
                        return (
                            <div key={idx} style={{ 
                                background: '#fff', borderRadius: '24px', padding: '1.5rem', 
                                border: isExpanded ? '2px solid #d97706' : '1px solid #e2e8f0', 
                                boxShadow: isExpanded ? '0 20px 25px -5px rgba(217,119,6,0.1)' : 'var(--shadow-sm)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                {/* Header Info */}
                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: isExpanded ? '1.5rem' : '0' }}>
                                    <div style={{ 
                                        width: '64px', height: '64px', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', 
                                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#1e293b', fontWeight: 800, fontSize: '1.3rem'
                                    }}>
                                        {student.name[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1e293b', marginBottom: '.2rem' }}>{student.name}</div>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <span style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600 }}>ID: #{student.id}</span>
                                            <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                                            <span style={{ fontSize: '.75rem', color: '#d97706', fontWeight: 700 }}>{student.enrolledCourses.length} Khóa học đang tham gia</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleExpandToggle(student)}
                                        style={{ 
                                            padding: '.75rem 1.5rem', borderRadius: '14px', background: isExpanded ? '#fef3c7' : '#1e293b', 
                                            color: isExpanded ? '#d97706' : '#fff', border: 'none', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '.5rem'
                                        }}
                                    >
                                        <MI name={isExpanded ? 'expand_less' : 'analytics'} /> 
                                        {isExpanded ? 'Thu gọn' : 'Xem chi tiết tiến độ'}
                                    </button>
                                </div>

                                {/* Expanded Content: Detailed Progress */}
                                {isExpanded && (
                                    <div className="fade-in" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                        {student.enrolledCourses.map((ec, i) => {
                                            const completedIds = progressMap[`${student.id}_${ec.id_khoa_hoc}`] || [];
                                            const totalLessons = ec.fullData?.chuong_set?.reduce((s, ch) => s + ch.bai_giang.length, 0) || 0;
                                            
                                            return (
                                                <div key={i} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                                    <div style={{ marginBottom: '1.25rem' }}>
                                                        <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '.4rem' }}>{ec.fullData?.ten_khoa_hoc}</div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '.5rem' }}>
                                                            <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600 }}>
                                                                Đã hoàn thành {completedIds.length}/{totalLessons} bài học
                                                            </div>
                                                            <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#d97706' }}>{ec.phan_tram_hoan_thanh}%</div>
                                                        </div>
                                                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                            <div style={{ 
                                                                width: `${ec.phan_tram_hoan_thanh}%`, height: '100%', 
                                                                background: '#d97706', borderRadius: '10px', transition: 'width 1s'
                                                            }} />
                                                        </div>
                                                    </div>

                                                    {/* Lesson Detailed List */}
                                                    <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '.5rem' }}>
                                                        {ec.fullData?.chuong_set?.map((chuong, ci) => (
                                                            <div key={ci} style={{ marginBottom: '1rem' }}>
                                                                <div style={{ fontSize: '.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '.5rem' }}>
                                                                    Chương {ci + 1}: {chuong.ten_chuong}
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    {chuong.bai_giang.map((bai, bi) => {
                                                                        const isDone = completedIds.includes(bai.id_bai_giang);
                                                                        return (
                                                                            <div key={bi} style={{ 
                                                                                display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.5rem .75rem', 
                                                                                borderRadius: '10px', background: isDone ? '#ecfdf5' : '#fff',
                                                                                border: '1px solid', borderColor: isDone ? '#d1fae5' : '#f1f5f9'
                                                                            }}>
                                                                                <MI 
                                                                                    name={isDone ? 'check_circle' : 'schedule'} 
                                                                                    style={{ color: isDone ? '#10b981' : '#cbd5e1', fontSize: '1rem' }} 
                                                                                />
                                                                                <span style={{ fontSize: '.75rem', fontWeight: 600, color: isDone ? '#065f46' : '#475569', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                    {bai.ten_bai_giang}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
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

            <style>{`
                .fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .spinner { width: 30px; height: 30px; border: 3px solid #f1f5f9; border-top-color: #d97706; border-radius: 50%; display: inline-block; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default SellerStudents;
