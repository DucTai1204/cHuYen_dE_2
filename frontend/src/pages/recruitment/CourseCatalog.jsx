import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CourseCardNTD from './components/CourseCardNTD';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;
const EMP_BLUE = 'var(--secondary)';

const CourseCatalog = () => {
    const [courses, setCourses] = useState([]);
    const [streamingCourses, setStreamingCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        api.get('/lms/khoa-hoc/')
            .then(res => {
                if (!isMounted) return;
                const data = res.data || [];
                setCourses(data);
                
                // Hiệu ứng streaming
                setStreamingCourses([]);
                data.forEach((item, index) => {
                    setTimeout(() => {
                        if (!isMounted) return;
                        setStreamingCourses(prev => [...prev, item]);
                    }, index * 30);
                });
            })
            .catch(err => console.error(err))
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="fade-up">
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: EMP_BLUE }}>Khám phá khóa học</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Danh sách các khóa học hiện có trên hệ thống EduHKT. Bạn có thể xem lộ trình đào tạo để đánh giá chất lượng nguồn nhân lực.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {streamingCourses.map(c => (
                    <CourseCardNTD key={c.id_khoa_hoc} course={c} />
                ))}
            </div>
            
            {!loading && courses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <MI name="search_off" style={{ fontSize: '3rem', display: 'block', margin: '0 auto 1rem' }} />
                    <p>Chưa có khóa học nào trên hệ thống.</p>
                </div>
            )}
        </div>
    );
};

export default CourseCatalog;
