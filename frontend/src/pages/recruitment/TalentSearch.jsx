import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TalentCard from './components/TalentCard';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;
const EMP_BLUE = 'var(--secondary)'; 

const TalentSearch = () => {
    const [talents, setTalents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
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
        loadTalents();
    }, [filters]);

    return (
        <div className="fade-up">
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: EMP_BLUE }}>Tìm kiếm Nhân tài</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Tìm kiếm ứng viên phù hợp dựa trên kỹ năng và chứng chỉ kết quả học tập.</p>
            </div>

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
                        <TalentCard key={idx} talent={t} />
                    ))}
                </div>
            )}
            
            {!loading && talents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <MI name="search_off" style={{ fontSize: '3rem', display: 'block', margin: '0 auto 1rem' }} />
                    <p>Không tìm thấy ứng viên nào phù hợp với bộ lọc hiện tại.</p>
                </div>
            )}
        </div>
    );
};

export default TalentSearch;
