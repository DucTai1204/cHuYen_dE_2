import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ══════════════════════════════════════════════════════════════ */
const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const SELLER_ORANGE = '#d97706';
const SELLER_ORANGE_LIGHT = '#fef3c7';
const SELLER_ORANGE_DARK = '#b45309';

const DANH_MUC = ['Lập trình', 'Thiết kế', 'Marketing', 'Kinh doanh', 'Ngoại ngữ', 'Khoa học dữ liệu', 'Khác'];
const CAT_ICONS = { 'Lập trình': 'code', 'Thiết kế': 'palette', 'Marketing': 'campaign', 'Kinh doanh': 'trending_up', 'Ngoại ngữ': 'language', 'Khoa học dữ liệu': 'analytics', 'Khác': 'category' };
const TRINH_DO_LABEL = { CoSo: 'Cơ sở', TrungCap: 'Trung cấp', NangCao: 'Nâng cao' };

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════ */

/* ── Step Indicator ── */
const StepBar = ({ current, onStepClick }) => {
    const steps = [
        { n: 1, icon: 'list_alt', label: 'Thông tin cơ bản' },
        { n: 2, icon: 'category', label: 'Phân loại & Mục tiêu' },
        { n: 3, icon: 'publish', label: 'Giá bán & Hoàn tất' },
    ];

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', userSelect: 'none' }}>
            {steps.map((s, i) => {
                const isCompleted = current > s.n;
                const isActive = current === s.n;
                const isDisabled = current < s.n;

                return (
                    <React.Fragment key={s.n}>
                        <div 
                            onClick={() => !isDisabled && onStepClick(s.n)}
                            style={{ 
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem', flex: 1,
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                opacity: isDisabled ? 0.6 : 1,
                                transition: 'all .3s'
                            }}
                        >
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: (isCompleted || isActive) ? SELLER_ORANGE : 'var(--border)',
                                color: (isCompleted || isActive) ? '#fff' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: isCompleted ? '1.2rem' : '.9rem',
                                transition: 'all .3s', 
                                boxShadow: isActive ? `0 0 0 4px ${SELLER_ORANGE_LIGHT}` : 'none',
                                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                            }}>
                                {isCompleted ? <MI name="check" style={{ fontSize: '1.2rem' }} /> : <span>{s.n}</span>}
                            </div>
                            <span style={{ 
                                fontSize: '.75rem', 
                                color: (isCompleted || isActive) ? SELLER_ORANGE_DARK : 'var(--text-muted)', 
                                fontWeight: isActive ? 700 : 400,
                                textAlign: 'center'
                            }}>
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div style={{ 
                                flex: 2, height: 3, 
                                background: isCompleted ? SELLER_ORANGE : 'var(--border)', 
                                marginBottom: '1.5rem', 
                                transition: 'background .4s ease' 
                            }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

/* ── Dynamic List (Goals/Prerequisites) ── */
const DynamicList = ({ items, onChange, placeholder, icon, label, maxItems = 8 }) => {
    const addItem = () => {
        if (items.length < maxItems) onChange([...items, '']);
    };
    const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
    const updateItem = (idx, val) => onChange(items.map((item, i) => i === idx ? val : item));

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.75rem' }}>
                <MI name={icon} style={{ color: SELLER_ORANGE }} /> {label}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {items.map((item, idx) => (
                    <div key={idx} className="fade-up" style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
                        <div style={{ 
                            width: 24, height: 24, borderRadius: '50%', background: SELLER_ORANGE_LIGHT, 
                            color: SELLER_ORANGE_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '.7rem', fontWeight: 800, flexShrink: 0
                        }}>
                            {idx + 1}
                        </div>
                        <input 
                            className="form-input" 
                            value={item} 
                            onChange={e => updateItem(idx, e.target.value)}
                            placeholder={placeholder} 
                            style={{ flex: 1, padding: '.6rem .8rem' }} 
                        />
                        <button 
                            type="button"
                            onClick={() => removeItem(idx)} 
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '.4rem', borderRadius: '50%' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            <MI name="delete_outline" style={{ fontSize: '1.1rem' }} />
                        </button>
                    </div>
                ))}
            </div>
            {items.length < maxItems && (
                <button 
                    onClick={addItem} 
                    type="button"
                    style={{ 
                        marginTop: '.75rem', width: '100%', padding: '.6rem', 
                        border: `2px dashed ${SELLER_ORANGE}`, background: 'transparent',
                        color: SELLER_ORANGE, borderRadius: '8px', fontSize: '.8rem', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem',
                        transition: 'all .2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = SELLER_ORANGE_LIGHT}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <MI name="add" style={{ fontSize: '1rem' }} /> Thêm nội dung
                </button>
            )}
        </div>
    );
};

/* ── Course Preview Card ── */
const CoursePreviewCard = ({ form }) => (
    <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '18px', padding: '1.5rem', color: '#fff',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'sticky', top: '2rem',
        border: '1px solid rgba(255,255,255,0.1)'
    }}>
        <div style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '1rem', fontWeight: 700 }}>
            Live Preview
        </div>
        {/* Thumbnail */}
        <div style={{ 
            aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', 
            marginBottom: '1.25rem', background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {form.hinh_anh_thumbnail 
                ? <img src={form.hinh_anh_thumbnail} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <MI name="image" style={{ fontSize: '3rem', opacity: 0.2 }} />
            }
        </div>
        {/* Tags */}
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '.25rem .6rem', borderRadius: '99px', fontSize: '.65rem', fontWeight: 600 }}>
                {form.danh_muc}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '.25rem .6rem', borderRadius: '99px', fontSize: '.65rem', fontWeight: 600 }}>
                {TRINH_DO_LABEL[form.trinh_do]}
            </span>
        </div>
        {/* Title */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '.5rem', lineHeight: 1.4 }}>
            {form.ten_khoa_hoc || 'Tên khóa học của bạn'}
        </h3>
        {/* Description */}
        <p style={{ opacity: 0.7, fontSize: '.82rem', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {form.mo_ta_ngan || 'Mô tả ngắn gọn thu hút học viên sẽ xuất hiện ở đây...'}
        </p>
        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '.6rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fcd34d' }}>
                {(!form.gia_tien || Number(form.gia_tien) === 0) ? 'Miễn phí' : `${Number(form.gia_tien).toLocaleString('vi-VN')}₫`}
            </div>
            {form.gia_goc > form.gia_tien && (
                <div style={{ fontSize: '.9rem', textDecoration: 'line-through', opacity: 0.5 }}>
                    {Number(form.gia_goc).toLocaleString('vi-VN')}₫
                </div>
            )}
        </div>
        {/* Objectives */}
        {form.muc_tieu?.filter(m => m.trim()).length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 700, marginBottom: '.6rem', opacity: 0.8 }}>Mục tiêu học tập:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                    {form.muc_tieu.filter(m => m.trim()).slice(0, 3).map((m, i) => (
                        <div key={i} style={{ fontSize: '.78rem', display: 'flex', gap: '.4rem', alignItems: 'flex-start' }}>
                            <MI name="check_circle" style={{ color: '#10b981', fontSize: '.9rem', marginTop: '2px' }} />
                            <span>{m}</span>
                        </div>
                    ))}
                    {form.muc_tieu.filter(m => m.trim()).length > 3 && (
                        <div style={{ fontSize: '.72rem', opacity: 0.5, paddingLeft: '1.3rem' }}>... và {form.muc_tieu.filter(m => m.trim()).length - 3} mục tiêu khác</div>
                    )}
                </div>
            </div>
        )}
    </div>
);

/* ── Category Card ── */
const CatCard = ({ value, label, icon, selected, onClick }) => (
    <button
        type="button"
        onClick={() => onClick(value)}
        style={{
            padding: '1rem .5rem', border: `2px solid ${selected ? SELLER_ORANGE : 'var(--border)'}`,
            borderRadius: '12px', background: selected ? SELLER_ORANGE_LIGHT : '#fff',
            cursor: 'pointer', transition: 'all .2s', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem',
            boxShadow: selected ? '0 4px 12px rgba(217, 119, 6, 0.15)' : 'none',
            transform: selected ? 'translateY(-2px)' : 'none',
        }}
    >
        <span style={{ fontSize: '1.8rem', display: 'flex' }}><MI name={icon} style={{ fontSize: '1.8rem', color: selected ? SELLER_ORANGE_DARK : 'var(--text-muted)' }} /></span>
        <span style={{ fontSize: '.8rem', fontWeight: selected ? 700 : 500, color: selected ? SELLER_ORANGE_DARK : 'var(--text-secondary)' }}>
            {label}
        </span>
    </button>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT: CREATE COURSE
   ══════════════════════════════════════════════════════════════ */
const CreateCourse = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        ten_khoa_hoc: '',
        mo_ta_ngan: '',
        mo_ta_chi_tiet: '',
        danh_muc: 'Lập trình',
        trinh_do: 'CoSo',
        gia_tien: '',
        gia_goc: '',
        hinh_anh_thumbnail: '',
        muc_tieu: [''], // Local only
        yeu_cau: [],    // Local only
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const canGoNext = () => {
        if (step === 1) return form.ten_khoa_hoc.trim().length > 0;
        return true;
    };

    const handleNext = () => {
        if (canGoNext()) setStep(s => s + 1);
        else setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
    };

    const handlePrev = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.ten_khoa_hoc.trim()) { setError('Vui lòng nhập tên khóa học.'); setStep(1); return; }
        
        setError('');
        setLoading(true);
        
        try {
            // Filter out local-only fields
            const { muc_tieu, yeu_cau, ...payload } = form;
            const res = await api.post('/lms/khoa-hoc/', {
                ...payload,
                gia_tien: parseFloat(form.gia_tien) || 0,
                gia_goc: parseFloat(form.gia_goc) || 0,
            });
            navigate(`/seller/courses/${res.data.id_khoa_hoc}/builder`);
        } catch (err) {
            setError(err?.response?.data?.detail || 'Tạo khóa học thất bại. Kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-up" style={{ maxWidth: step === 3 ? 1000 : 760, margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/seller/dashboard')}>Kênh người bán</span>
                {' › '}
                <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/seller/courses')}>Khóa học của tôi</span>
                {' › '}
                <strong>Tạo mới</strong>
            </div>

            {/* Page Header */}
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '.5rem' }}>
                    Thiết kế khóa học của bạn
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.95rem' }}>
                    {step === 1 && "Bắt đầu với những thông tin nền tảng nhất"}
                    {step === 2 && "Giúp học viên hiểu rõ nội dung và giá trị khóa học"}
                    {step === 3 && "Thiết lập mức giá và hình ảnh đại diện ấn tượng"}
                </p>
            </div>

            {/* Wizard Step Bar */}
            <StepBar current={step} onStepClick={setStep} />

            {/* Error Message */}
            {error && (
                <div className="fade-up" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem', marginBottom: '2rem', fontSize: '.9rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                    <MI name="error_outline" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: step === 3 ? '1fr 340px' : '1fr', gap: '2.5rem' }}>
                    
                    <div style={{ flex: 1 }}>
                        {/* ── STEP 1: Thông tin cơ bản ── */}
                        {step === 1 && (
                            <div className="card fade-up" style={{ animationDuration: '.4s' }}>
                                <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                                    <MI name="info" style={{ color: SELLER_ORANGE }} /> Thông tin cơ bản
                                </h2>

                                <div className="form-group">
                                    <label className="form-label">
                                        Tiêu đề khóa học <span style={{ color: 'var(--danger)' }}>*</span>
                                    </label>
                                    <input
                                        className="form-input"
                                        placeholder="VD: Làm chủ React từ Zero đến Pro trong 30 ngày"
                                        value={form.ten_khoa_hoc}
                                        onChange={e => set('ten_khoa_hoc', e.target.value)}
                                        style={{ fontSize: '1.05rem', padding: '.8rem 1rem' }}
                                    />
                                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                                        <MI name="lightbulb" style={{ fontSize: '.9rem', color: '#f59e0b' }} /> 
                                        Tiêu đề ngắn gọn, chứa từ khóa sẽ dễ được tìm thấy hơn.
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Mô tả ngắn <span style={{ fontSize: '.75rem', fontWeight: 400, opacity: 0.6 }}>({form.mo_ta_ngan.length}/200)</span>
                                    </label>
                                    <textarea
                                        className="form-input"
                                        rows={2}
                                        placeholder="Tóm tắt giá trị cốt lõi nhất của khóa học trong 1-2 câu..."
                                        value={form.mo_ta_ngan}
                                        onChange={e => set('mo_ta_ngan', e.target.value)}
                                        maxLength={200}
                                        style={{ resize: 'none' }}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Mô tả chi tiết</label>
                                    <textarea
                                        className="form-input"
                                        rows={6}
                                        placeholder="Viết chi tiết về lộ trình học, phương pháp giảng dạy..."
                                        value={form.mo_ta_chi_tiet}
                                        onChange={e => set('mo_ta_chi_tiet', e.target.value)}
                                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Phân loại & Mục tiêu ── */}
                        {step === 2 && (
                            <div className="fade-up">
                                <div className="card" style={{ marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                                        <MI name="label" style={{ color: SELLER_ORANGE }} /> Phân loại
                                    </h2>

                                    <div className="form-group">
                                        <label className="form-label">Chọn danh mục phù hợp nhất</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '.75rem', marginTop: '.5rem' }}>
                                            {DANH_MUC.map(d => (
                                                <CatCard key={d} value={d} label={d} icon={CAT_ICONS[d] || 'category'} selected={form.danh_muc === d} onClick={v => set('danh_muc', v)} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Trình độ khóa học</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.75rem', marginTop: '.5rem' }}>
                                            {[
                                                { val: 'CoSo', icon: 'signal_cellular_alt_1_bar', label: 'Cơ sở' },
                                                { val: 'TrungCap', icon: 'signal_cellular_alt_2_bar', label: 'Trung cấp' },
                                                { val: 'NangCao', icon: 'signal_cellular_alt', label: 'Nâng cao' },
                                            ].map(t => (
                                                <button
                                                    key={t.val} type="button"
                                                    onClick={() => set('trinh_do', t.val)}
                                                    style={{
                                                        padding: '1rem .5rem', border: `2px solid ${form.trinh_do === t.val ? SELLER_ORANGE : 'var(--border)'}`,
                                                        borderRadius: '12px', background: form.trinh_do === t.val ? SELLER_ORANGE_LIGHT : '#fff',
                                                        cursor: 'pointer', transition: 'all .2s', textAlign: 'center',
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem'
                                                    }}
                                                >
                                                    <MI name={t.icon} style={{ fontSize: '1.4rem', color: form.trinh_do === t.val ? SELLER_ORANGE_DARK : 'var(--text-muted)' }} />
                                                    <div style={{ fontWeight: 700, fontSize: '.85rem', color: form.trinh_do === t.val ? SELLER_ORANGE_DARK : 'var(--text-primary)' }}>{t.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                                        <MI name="flag" style={{ color: SELLER_ORANGE }} /> Mục tiêu & Yêu cầu
                                    </h2>
                                    <DynamicList 
                                        label="Học viên sẽ đạt được gì sau khóa học?" 
                                        items={form.muc_tieu} 
                                        onChange={v => set('muc_tieu', v)} 
                                        icon="emoji_objects"
                                        placeholder="VD: Xây dựng được ứng dụng E-commerce hoàn chỉnh"
                                    />
                                    <DynamicList 
                                        label="Yêu cầu tiên quyết (nếu có)" 
                                        items={form.yeu_cau} 
                                        onChange={v => set('yeu_cau', v)} 
                                        icon="checklist"
                                        placeholder="VD: Cần biết cơ bản về lập trình JavaScript"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Giá bán & Thumbnail ── */}
                        {step === 3 && (
                            <div className="fade-up">
                                <div className="card" style={{ marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                                        <MI name="payments" style={{ color: SELLER_ORANGE }} /> Giá bán
                                    </h2>
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label className="form-label">Giá bán thực tế (₫)</label>
                                            <input
                                                type="number" className="form-input"
                                                placeholder="2,490,000" value={form.gia_tien}
                                                onChange={e => set('gia_tien', e.target.value)} min={0}
                                            />
                                            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.4rem' }}>Nhập 0 để cho học viên học miễn phí</div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Giá gốc chưa giảm (₫)</label>
                                            <input
                                                type="number" className="form-input"
                                                placeholder="4,990,000" value={form.gia_goc}
                                                onChange={e => set('gia_goc', e.target.value)} min={0}
                                            />
                                            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.4rem' }}>Dùng để hiển thị giá gạch ngang (so sánh)</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                                        <MI name="image" style={{ color: SELLER_ORANGE }} /> Hình ảnh đại diện
                                    </h2>
                                    
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Nhập URL ảnh thumbnail</label>
                                        <div style={{ 
                                            padding: '2rem', border: `2px dashed ${form.hinh_anh_thumbnail ? SELLER_ORANGE : 'var(--border)'}`,
                                            borderRadius: '12px', background: form.hinh_anh_thumbnail ? SELLER_ORANGE_LIGHT : 'var(--bg-app)',
                                            textAlign: 'center', transition: 'all .2s'
                                        }}>
                                            {!form.hinh_anh_thumbnail ? (
                                                <>
                                                    <MI name="cloud_upload" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                                                    <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                                        Dán link ảnh từ Unsplash, Google Drive hoặc server của bạn
                                                    </p>
                                                </>
                                            ) : (
                                                <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                                                    <img src={form.hinh_anh_thumbnail} alt="Upload" style={{ height: 120, borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
                                                    <button 
                                                        type="button"
                                                        onClick={() => set('hinh_anh_thumbnail', '')}
                                                        style={{ position: 'absolute', top: -10, right: -10, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                            <input
                                                className="form-input"
                                                placeholder="https://example.com/image.jpg"
                                                value={form.hinh_anh_thumbnail}
                                                onChange={e => set('hinh_anh_thumbnail', e.target.value)}
                                                style={{ marginTop: '1rem', background: '#fff' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 3 Preview Card */}
                    {step === 3 && (
                        <div className="fade-up" style={{ animationDelay: '.1s' }}>
                            <CoursePreviewCard form={form} />
                        </div>
                    )}
                </div>

                {/* ── Navigation Actions ── */}
                <div style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' 
                }}>
                    {step === 1 ? (
                        <button
                            type="button" onClick={() => navigate('/seller/dashboard')}
                            style={{ padding: '.75rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)', fontSize: '.95rem' }}
                        >
                            Quay lại dashboard
                        </button>
                    ) : (
                        <button
                            type="button" onClick={handlePrev}
                            style={{ 
                                padding: '.75rem 1.5rem', background: '#fff', border: '1px solid var(--border)', 
                                borderRadius: '10px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)', 
                                fontSize: '.95rem', display: 'flex', alignItems: 'center', gap: '.4rem' 
                            }}
                        >
                            <MI name="arrow_back" style={{ fontSize: '1rem' }} /> Bước trước
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            type="button" onClick={handleNext}
                            style={{
                                padding: '.8rem 2.5rem', background: SELLER_ORANGE, color: '#fff',
                                border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                                fontSize: '1rem', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                                display: 'flex', alignItems: 'center', gap: '.5rem'
                            }}
                        >
                            Tiếp tục <MI name="arrow_forward" style={{ fontSize: '1.1rem' }} />
                        </button>
                    ) : (
                        <button
                            type="submit" disabled={loading || !form.ten_khoa_hoc.trim()}
                            style={{
                                padding: '.8rem 2.5rem', background: SELLER_ORANGE, color: '#fff',
                                border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                                fontSize: '1rem', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                                opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '.6rem'
                            }}
                        >
                            {loading ? (
                                <><MI name="hourglass_top" style={{ animation: 'spin 2s linear infinite' }} /> Đang xử lý...</>
                            ) : (
                                <><MI name="check_circle" /> Hoàn tất & Tạo nội dung</>
                            )}
                        </button>
                    )}
                </div>
            </form>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .card { transition: all 0.3s ease; }
                .card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
            `}</style>
        </div>
    );
};

export default CreateCourse;
