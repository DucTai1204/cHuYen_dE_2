import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>;

const SELLER_ORANGE = '#d97706';
const SELLER_ORANGE_LIGHT = '#fef3c7';
const SELLER_ORANGE_DARK = '#b45309';

const DANH_MUC = ['Lập trình', 'Thiết kế', 'Marketing', 'Kinh doanh', 'Ngoại ngữ', 'Khoa học dữ liệu', 'Khác'];

/* ── Step Indicator ── */
const StepBar = ({ current }) => {
    const steps = [
        { n: 1, icon: 'list_alt', label: 'Thông tin cơ bản' },
        { n: 2, icon: 'video_library', label: 'Xây dựng nội dung' },
        { n: 3, icon: 'publish', label: 'Đăng bán' },
    ];
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            {steps.map((s, i) => (
                <React.Fragment key={s.n}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem', flex: 1 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: current >= s.n ? SELLER_ORANGE : 'var(--border)',
                            color: current >= s.n ? '#fff' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: current > s.n ? '1rem' : '.875rem',
                            transition: 'all .3s', boxShadow: current === s.n ? `0 0 0 4px ${SELLER_ORANGE_LIGHT}` : 'none',
                        }}>
                            {current > s.n ? <MI name="check" style={{ fontSize: '1rem' }} /> : <MI name={s.icon} style={{ fontSize: '.95rem' }} />}
                        </div>
                        <span style={{ fontSize: '.75rem', color: current >= s.n ? SELLER_ORANGE_DARK : 'var(--text-muted)', fontWeight: current === s.n ? 700 : 400 }}>
                            {s.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{ flex: 2, height: 2, background: current > s.n ? SELLER_ORANGE : 'var(--border)', marginBottom: '1.2rem', transition: 'background .3s' }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

/* ── Category Card ── */
const CatCard = ({ value, label, icon, selected, onClick }) => (
    <button
        onClick={() => onClick(value)}
        style={{
            padding: '.75rem .5rem', border: `2px solid ${selected ? SELLER_ORANGE : 'var(--border)'}`,
            borderRadius: '10px', background: selected ? SELLER_ORANGE_LIGHT : '#fff',
            cursor: 'pointer', transition: 'all .18s', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3rem',
        }}
    >
        <span style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MI name={icon} style={{ fontSize: '1.4rem', color: selected ? SELLER_ORANGE_DARK : 'var(--text-muted)' }} /></span>
        <span style={{ fontSize: '.75rem', fontWeight: selected ? 700 : 400, color: selected ? SELLER_ORANGE_DARK : 'var(--text-secondary)' }}>
            {label}
        </span>
    </button>
);

const CAT_ICONS = { 'Lập trình': 'code', 'Thiết kế': 'palette', 'Marketing': 'campaign', 'Kinh doanh': 'trending_up', 'Ngoại ngữ': 'language', 'Khoa học dữ liệu': 'analytics', 'Khác': 'category' };

/* ══════════════════════════════════════════════════════════════
   MAIN: CREATE COURSE WIZARD
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
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.ten_khoa_hoc.trim()) { setError('Vui lòng nhập tên khóa học.'); return; }
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/lms/khoa-hoc/', {
                ...form,
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
        <div className="fade-up" style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/seller/dashboard')}>Kênh người bán</span>
                {' › '}
                <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/seller/courses')}>Khóa học của tôi</span>
                {' › '}
                <strong>Tạo khóa học mới</strong>
            </div>

            {/* Page title */}
            <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '.25rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}><MI name="add_circle" style={{ fontSize: '1.3rem', color: SELLER_ORANGE }} /> Tạo khóa học mới</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.875rem' }}>Điền thông tin cơ bản để bắt đầu xây dựng khóa học của bạn</p>
            </div>

            {/* Step Bar */}
            <StepBar current={step} />

            {/* Error */}
            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.875rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    ❌ {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* ── STEP 1: Thông tin cơ bản ── */}
                <div className="card" style={{ marginBottom: '1.25rem' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ width: 28, height: 28, borderRadius: '50%', background: SELLER_ORANGE, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700 }}>1</span>
                        Thông tin cơ bản
                    </h2>

                    <div className="form-group">
                        <label className="form-label">
                            Tên khóa học <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                            name="ten_khoa_hoc" className="form-input"
                            placeholder="VD: Lập trình Web Full-Stack từ Zero đến Hero"
                            value={form.ten_khoa_hoc} onChange={e => set('ten_khoa_hoc', e.target.value)}
                            required
                            style={{ fontSize: '1rem', padding: '.7rem 1rem' }}
                        />
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.25rem', display: 'flex', alignItems: 'center', gap: '.2rem' }}>
                            <MI name="lightbulb" style={{ fontSize: '.9rem', color: '#f59e0b' }} /> Tên hay, cụ thể sẽ thu hút học viên hơn
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Mô tả ngắn <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({form.mo_ta_ngan.length}/200 ký tự)</span>
                        </label>
                        <input
                            name="mo_ta_ngan" className="form-input"
                            placeholder="Trở thành lập trình viên chuyên nghiệp — học từ thực tế, có chứng chỉ"
                            value={form.mo_ta_ngan} onChange={e => set('mo_ta_ngan', e.target.value)}
                            maxLength={200}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Mô tả chi tiết</label>
                        <textarea
                            name="mo_ta_chi_tiet" className="form-input" rows={4}
                            placeholder="Mô tả nội dung, đối tượng học viên, điểm nổi bật..."
                            value={form.mo_ta_chi_tiet} onChange={e => set('mo_ta_chi_tiet', e.target.value)}
                            style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>

                {/* ── STEP 2: Danh mục & Trình độ ── */}
                <div className="card" style={{ marginBottom: '1.25rem' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ width: 28, height: 28, borderRadius: '50%', background: SELLER_ORANGE, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700 }}>2</span>
                        Phân loại khóa học
                    </h2>

                    <div className="form-group">
                        <label className="form-label">Chọn danh mục</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.6rem', marginTop: '.4rem' }}>
                            {DANH_MUC.map(d => (
                                <CatCard key={d} value={d} label={d} icon={CAT_ICONS[d] || '📦'} selected={form.danh_muc === d} onClick={v => set('danh_muc', v)} />
                            ))}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Trình độ yêu cầu</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.6rem', marginTop: '.4rem' }}>
                            {[
                                { val: 'CoSo', icon: 'signal_cellular_alt_1_bar', label: 'Cơ sở', sub: 'Dành cho người mới bắt đầu' },
                                { val: 'TrungCap', icon: 'signal_cellular_alt_2_bar', label: 'Trung cấp', sub: 'Có kiến thức cơ bản' },
                                { val: 'NangCao', icon: 'signal_cellular_alt', label: 'Nâng cao', sub: 'Cho người có kinh nghiệm' },
                            ].map(t => (
                                <button
                                    key={t.val} type="button"
                                    onClick={() => set('trinh_do', t.val)}
                                    style={{
                                        padding: '.75rem', border: `2px solid ${form.trinh_do === t.val ? SELLER_ORANGE : 'var(--border)'}`,
                                        borderRadius: '10px', background: form.trinh_do === t.val ? SELLER_ORANGE_LIGHT : '#fff',
                                        cursor: 'pointer', transition: 'all .18s', textAlign: 'left',
                                    }}
                                >
                                    <div style={{ fontSize: '1.2rem', marginBottom: '.3rem', display: 'flex' }}><MI name={t.icon} style={{ fontSize: '1.2rem', color: form.trinh_do === t.val ? SELLER_ORANGE_DARK : 'var(--text-muted)' }} /></div>
                                    <div style={{ fontWeight: 700, fontSize: '.85rem', color: form.trinh_do === t.val ? SELLER_ORANGE_DARK : 'var(--text-primary)' }}>{t.label}</div>
                                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.15rem' }}>{t.sub}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── STEP 3: Giá bán ── */}
                <div className="card" style={{ marginBottom: '1.25rem' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ width: 28, height: 28, borderRadius: '50%', background: SELLER_ORANGE, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700 }}>3</span>
                        Giá bán & Thumbnail
                    </h2>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Giá bán (₫)</label>
                            <input
                                type="number" name="gia_tien" className="form-input"
                                placeholder="2499000" value={form.gia_tien}
                                onChange={e => set('gia_tien', e.target.value)} min={0}
                            />
                            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>Nhập 0 để miễn phí</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Giá gốc / So sánh (₫)</label>
                            <input
                                type="number" name="gia_goc" className="form-input"
                                placeholder="4999000" value={form.gia_goc}
                                onChange={e => set('gia_goc', e.target.value)} min={0}
                            />
                            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>Dùng để hiển thị % giảm giá</div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">URL Ảnh thumbnail <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '.8rem' }}>(tùy chọn — có thể thêm sau)</span></label>
                        <input
                            name="hinh_anh_thumbnail" className="form-input"
                            placeholder="https://images.unsplash.com/..."
                            value={form.hinh_anh_thumbnail}
                            onChange={e => set('hinh_anh_thumbnail', e.target.value)}
                        />
                        {form.hinh_anh_thumbnail && (
                            <div style={{ marginTop: '.75rem', width: 160, aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                <img src={form.hinh_anh_thumbnail} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Actions ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.5rem' }}>
                    <button
                        type="button" onClick={() => navigate('/seller/dashboard')}
                        style={{ padding: '.65rem 1.4rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)', fontSize: '.9rem' }}
                    >
                        ← Hủy bỏ
                    </button>
                    <button
                        type="submit" disabled={loading || !form.ten_khoa_hoc.trim()}
                        style={{
                            padding: '.7rem 2rem', background: form.ten_khoa_hoc.trim() ? SELLER_ORANGE : 'var(--border)',
                            color: form.ten_khoa_hoc.trim() ? '#fff' : 'var(--text-muted)',
                            border: 'none', borderRadius: '8px', fontWeight: 700, cursor: form.ten_khoa_hoc.trim() ? 'pointer' : 'not-allowed',
                            fontSize: '.95rem', transition: 'all .18s', display: 'flex', alignItems: 'center', gap: '.5rem',
                        }}
                    >
                        {loading ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="hourglass_empty" style={{ fontSize: '1rem' }} /> Đang tạo...</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><MI name="check_circle" style={{ fontSize: '1rem' }} /> Tạo &amp; Thiết kế nội dung →</span>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;
