import React from 'react';
import { useNavigate } from 'react-router-dom';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;
const EMP_BLUE = 'var(--secondary)';
const EMP_BLUE_LIGHT = 'var(--secondary-light)';

const TalentCard = ({ talent }) => {
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
                </div>
            </div>

            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {talent.ready_to_work && (
                    <div style={{ background: '#ecfdf5', color: '#059669', padding: '.2rem .5rem', borderRadius: '5px', fontSize: '.65rem', fontWeight: 800, border: '1px solid #d1fae5' }}>SẴN SÀNG ĐI LÀM</div>
                )}
                {/* Hiển thị kỹ năng thực tế đạt được từ khóa học này */}
                {talent.ky_nang_khoa_hoc && talent.ky_nang_khoa_hoc.map((kn, i) => (
                    <div key={i} title={kn.mo_ta} style={{ background: 'var(--secondary-light)', color: 'var(--secondary)', padding: '.2rem .5rem', borderRadius: '5px', fontSize: '.65rem', fontWeight: 700, border: '1px solid var(--secondary-light)' }}>
                        <MI name="check_circle" style={{ fontSize: '.7rem', verticalAlign: 'middle', marginRight: '.2rem' }} />
                        {kn.ten_ky_nang}
                    </div>
                ))}
                {!talent.ky_nang_khoa_hoc && talent.ky_nang && talent.ky_nang.split(',').slice(0, 3).map((s, i) => (
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

export default TalentCard;
