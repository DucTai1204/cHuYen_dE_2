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
        <div className="stagger-item" style={{
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
                    <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '.3rem', marginTop: '.1rem' }}>
                        <MI name="school" style={{ fontSize: '.9rem' }} />
                        <span>Đã tốt nghiệp <strong>{talent.completed_courses?.length || 1}</strong> khóa học</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                {(talent.completed_courses || [{ ten_khoa_hoc: talent.ten_khoa_hoc }]).slice(0, 3).map((c, i) => (
                    <span key={i} style={{ fontSize: '.68rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '.15rem .5rem', borderRadius: '6px' }}>
                        {c.ten_khoa_hoc}
                    </span>
                ))}
                {talent.completed_courses?.length > 3 && (
                    <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>...</span>
                )}
            </div>

            <div style={{ background: '#f8fafc', padding: '.75rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Uy tín Doanh nghiệp (TB)</div>
                        <div style={{ fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                            <MI name="verified" style={{ fontSize: '1rem' }} /> {talent.trung_binh_sao_ntd || '—'}/5.0 
                            <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '.75rem' }}>({talent.completed_courses?.length || 1} khóa)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {talent.ready_to_work && (
                    <div style={{ background: '#ecfdf5', color: '#059669', padding: '.2rem .5rem', borderRadius: '5px', fontSize: '.65rem', fontWeight: 800, border: '1px solid #d1fae5' }}>SẴN SÀNG ĐI LÀM</div>
                )}
                {/* Hiển thị kỹ năng thực tế tổng hợp */}
                {talent.ky_nang_khoa_hoc && talent.ky_nang_khoa_hoc.slice(0, 6).map((kn, i) => (
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
                    style={{ 
                        flex: 1, padding: '.65rem', border: '1px solid #cbd5e1', borderRadius: '7px', 
                        fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all .2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem',
                        ...(talent.completed_courses?.some(c => c.recruitment_status === 'DaDongY') ? {
                            background: '#ecfdf5', color: '#059669', borderColor: '#d1fae5'
                        } : talent.completed_courses?.some(c => c.recruitment_status === 'ChoXacNhan') ? {
                            background: '#fffbeb', color: '#d97706', borderColor: '#fef3c7'
                        } : {
                            background: '#fff', color: 'var(--text-primary)'
                        })
                    }}
                >
                    {talent.completed_courses?.some(c => c.recruitment_status === 'DaDongY') ? (
                        <><MI name="verified" style={{ fontSize: '1.1rem' }} /> Đã tuyển dụng & Chat</>
                    ) : talent.completed_courses?.some(c => c.recruitment_status === 'ChoXacNhan') ? (
                        <><MI name="hourglass_empty" style={{ fontSize: '1.1rem' }} /> Đang chờ xác nhận</>
                    ) : (
                        <>Săn nhân tài & Chat</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TalentCard;
