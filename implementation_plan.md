# Kế hoạch cải tiến giao diện "Tạo Khóa Học" - CreateCourse.jsx

## 📍 Vị trí file cần sửa
- **File duy nhất cần sửa**: `d:\Github\cHuYen_dE_2\frontend\src\pages\seller\CreateCourse.jsx`
- **KHÔNG** sửa bất kỳ file nào khác (App.jsx, index.css, CourseBuilder.jsx, v.v.)

## 📋 Phân tích hiện trạng

### File hiện tại (294 dòng)
- Form dài 1 trang scroll, 3 section nhưng hiển thị TẤT CẢ cùng lúc
- StepBar chỉ là trang trí, không có chức năng wizard thực sự
- Thumbnail chỉ nhập URL text
- Thiếu các trường quan trọng cho LMS: mục tiêu khóa học, yêu cầu tiên quyết
- Không có preview trước khi submit

### Các thành phần hiện có cần GIỮ NGUYÊN
- Import: `React, { useState }` từ 'react', `useNavigate` từ 'react-router-dom', `api` từ '../../services/api'
- Hằng số màu: `SELLER_ORANGE = '#d97706'`, `SELLER_ORANGE_LIGHT = '#fef3c7'`, `SELLER_ORANGE_DARK = '#b45309'`
- Danh mục: `DANH_MUC = ['Lập trình', 'Thiết kế', 'Marketing', 'Kinh doanh', 'Ngoại ngữ', 'Khoa học dữ liệu', 'Khác']`
- Icon map: `CAT_ICONS = { 'Lập trình': 'code', 'Thiết kế': 'palette', ... }`
- API call: `api.post('/lms/khoa-hoc/', {...})` — giữ nguyên payload
- Navigate sau tạo: `navigate('/seller/courses/${res.data.id_khoa_hoc}/builder')`
- Component MI: `const MI = ({ name, style }) => <span className="material-icons" style={{ fontSize: '1.2rem', ...style }}>{name}</span>`

### CSS classes có sẵn trong index.css (dùng được, không cần tạo mới)
- `.card` — card trắng có border, shadow, border-radius
- `.form-group` — margin-bottom 1.25rem
- `.form-label` — label bold, uppercase, letter-spacing
- `.form-input` — input/textarea/select styled
- `.fade-up` — animation fadeUp
- `.btn`, `.btn-primary`, `.btn-secondary` — buttons
- `.grid-2` — grid 2 cột (responsive)

---

## 🎯 Các cải tiến cần thực hiện

### 1. WIZARD MULTI-STEP THỰC SỰ (3 bước)

Thay vì hiển thị tất cả form cùng lúc, chia thành 3 bước riêng biệt:

#### Bước 1: "Thông tin cơ bản"
- Tên khóa học (required) — input lớn, nổi bật
- Mô tả ngắn (maxLength 200, hiện character count)
- Mô tả chi tiết (textarea 5 rows)

#### Bước 2: "Phân loại & Mục tiêu"
- Chọn danh mục (grid card giữ nguyên CatCard)
- Chọn trình độ (3 card: Cơ sở / Trung cấp / Nâng cao)
- **MỚI**: "Mục tiêu khóa học" — danh sách động (thêm/xóa item)
  - Mỗi item là 1 input text + nút xóa
  - Nút "+ Thêm mục tiêu" ở dưới
  - Placeholder gợi ý: "VD: Hiểu được cách hoạt động của React Hooks"
  - Icon: `emoji_objects` (💡)
- **MỚI**: "Yêu cầu tiên quyết" — danh sách động tương tự
  - Placeholder: "VD: Biết cơ bản HTML, CSS, JavaScript"
  - Icon: `checklist`
  - Có thể để trống (không bắt buộc)

#### Bước 3: "Giá bán & Hoàn tất"
- Giá bán + Giá gốc (grid-2, giữ nguyên)
- **Drag & Drop Thumbnail** (thay thế input URL đơn giản)
- **Live Preview Card** — hiển thị khóa học sẽ trông như thế nào

#### Logic điều hướng bước
```javascript
const [step, setStep] = useState(1);

// Validation mỗi bước trước khi next
const canGoNext = () => {
  if (step === 1) return form.ten_khoa_hoc.trim().length > 0;
  if (step === 2) return true; // danh mục có default
  return true;
};

const nextStep = () => { if (canGoNext() && step < 3) setStep(s => s + 1); };
const prevStep = () => { if (step > 1) setStep(s => s - 1); };
```

### 2. STEPBAR CẢI TIẾN

StepBar phải tương tác được (click để nhảy bước), có animation transition:

```jsx
const StepBar = ({ current, onStepClick }) => {
    const steps = [
        { n: 1, icon: 'list_alt', label: 'Thông tin cơ bản' },
        { n: 2, icon: 'category', label: 'Phân loại & Mục tiêu' },
        { n: 3, icon: 'publish', label: 'Giá bán & Hoàn tất' },
    ];
    // Cho phép click vào step đã hoàn thành hoặc step hiện tại
    // Step chưa đến thì không click được
    // Hiệu ứng: step hoàn thành có checkmark, step hiện tại có glow ring
};
```

### 3. DRAG & DROP THUMBNAIL

Khu vực kéo thả ảnh (vẫn giữ fallback nhập URL):

```jsx
const ThumbnailUploader = ({ value, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(value || '');
    const [inputMode, setInputMode] = useState('drag'); // 'drag' | 'url'

    // Drag events
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreviewUrl(ev.target.result);
                onChange(ev.target.result); // base64 hoặc URL tùy backend
            };
            reader.readAsDataURL(file);
        }
    };

    // File input click fallback
    const fileInputRef = useRef(null);

    // UI: 
    // - Khi chưa có ảnh: hiển thị drop zone lớn với icon upload, text hướng dẫn
    //   border dashed, background nhạt, hover effect
    // - Khi đang drag: border màu SELLER_ORANGE, background SELLER_ORANGE_LIGHT
    // - Khi đã có ảnh: hiển thị preview + nút đổi ảnh / xóa ảnh
    // - Toggle giữa "Kéo thả ảnh" và "Nhập URL" bằng 2 tab nhỏ
};
```

**Lưu ý quan trọng**: Vì API hiện tại nhận `hinh_anh_thumbnail` là URL string, nên:
- Nếu user drop file → hiển thị preview bằng base64 local, nhưng gửi form vẫn cần URL
- Hoặc đơn giản hơn: drop zone chỉ là UX sugar, vẫn yêu cầu paste URL nhưng giao diện đẹp hơn
- **Giải pháp tốt nhất**: Giữ 2 mode - "Kéo thả" (preview local, ghi chú rằng sẽ dùng sau khi có upload API) và "Nhập URL" (mode chính, hoạt động ngay)
- **→ Mặc định hiện mode "Nhập URL" nhưng giao diện đẹp hơn: drop zone style cho input URL**

### 4. DANH SÁCH ĐỘNG (Mục tiêu & Yêu cầu)

```jsx
const DynamicList = ({ items, onChange, placeholder, icon, label, maxItems = 8 }) => {
    const addItem = () => {
        if (items.length < maxItems) onChange([...items, '']);
    };
    const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));
    const updateItem = (idx, val) => onChange(items.map((item, i) => i === idx ? val : item));

    return (
        <div>
            <label className="form-label">
                <MI name={icon} /> {label}
            </label>
            {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem', animation: 'fadeUp .2s ease' }}>
                    <span style={/* số thứ tự */}>#{idx + 1}</span>
                    <input className="form-input" value={item} 
                        onChange={e => updateItem(idx, e.target.value)}
                        placeholder={placeholder} style={{ flex: 1 }} />
                    <button onClick={() => removeItem(idx)} 
                        style={/* nút xóa đỏ nhỏ */}>✕</button>
                </div>
            ))}
            {items.length < maxItems && (
                <button onClick={addItem} type="button"
                    style={/* nút thêm: border dashed, SELLER_ORANGE */}>
                    + Thêm mục
                </button>
            )}
        </div>
    );
};
```

**State ban đầu:**
```javascript
const [form, setForm] = useState({
    ten_khoa_hoc: '',
    mo_ta_ngan: '',
    mo_ta_chi_tiet: '',
    danh_muc: 'Lập trình',
    trinh_do: 'CoSo',
    gia_tien: '',
    gia_goc: '',
    hinh_anh_thumbnail: '',
    // MỚI - chỉ dùng local, KHÔNG gửi lên API
    muc_tieu: [''],      // ít nhất 1 item rỗng sẵn
    yeu_cau: [],         // rỗng ban đầu
});
```

**Khi submit, lọc bỏ `muc_tieu` và `yeu_cau` khỏi payload** (vì API chưa hỗ trợ):
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    const { muc_tieu, yeu_cau, ...payload } = form;
    // gửi payload lên api.post('/lms/khoa-hoc/', {...payload, gia_tien: ..., gia_goc: ...})
};
```

### 5. LIVE PREVIEW CARD (Bước 3)

Hiển thị ở bên phải (desktop) hoặc dưới (mobile) của bước 3:

```jsx
const CoursePreviewCard = ({ form }) => (
    <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '14px', padding: '1.25rem', color: '#fff',
    }}>
        {/* Thumbnail preview */}
        <div style={{ aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', background: 'rgba(255,255,255,.1)' }}>
            {form.hinh_anh_thumbnail 
                ? <img src={form.hinh_anh_thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={/* placeholder icon */}><MI name="image" /></div>
            }
        </div>
        {/* Tags */}
        <div style={{ display: 'flex', gap: '.4rem', marginBottom: '.5rem', flexWrap: 'wrap' }}>
            <span style={/* badge nhỏ */}>{form.danh_muc}</span>
            <span style={/* badge nhỏ */}>{TRINH_DO_LABEL[form.trinh_do]}</span>
        </div>
        {/* Title */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '.4rem' }}>
            {form.ten_khoa_hoc || 'Tên khóa học...'}
        </h3>
        {/* Description */}
        <p style={{ opacity: .8, fontSize: '.82rem', marginBottom: '.75rem' }}>
            {form.mo_ta_ngan || 'Mô tả ngắn...'}
        </p>
        {/* Price */}
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fcd34d' }}>
            {Number(form.gia_tien) === 0 || !form.gia_tien 
                ? 'Miễn phí' 
                : `${Number(form.gia_tien).toLocaleString('vi-VN')}₫`}
        </div>
        {/* Objectives preview */}
        {form.muc_tieu?.filter(m => m.trim()).length > 0 && (
            <div style={{ marginTop: '.75rem', borderTop: '1px solid rgba(255,255,255,.15)', paddingTop: '.75rem' }}>
                <div style={{ fontSize: '.75rem', opacity: .6, marginBottom: '.4rem' }}>Bạn sẽ học được</div>
                {form.muc_tieu.filter(m => m.trim()).map((m, i) => (
                    <div key={i} style={{ fontSize: '.78rem', display: 'flex', gap: '.3rem', marginBottom: '.25rem' }}>
                        <MI name="check_circle" style={{ color: '#34d399', fontSize: '.85rem' }} />
                        {m}
                    </div>
                ))}
            </div>
        )}
    </div>
);
```

### 6. ANIMATION & TRANSITION

Thêm CSS inline cho transition giữa các step:
```jsx
// Wrapper cho mỗi step content
<div key={step} style={{ animation: 'fadeUp .3s ease both' }}>
    {/* step content */}
</div>
```

Animation `fadeUp` đã có sẵn trong `index.css`.

---

## 🏗️ Cấu trúc component cuối cùng

```
CreateCourse (main)
├── StepBar (interactive, 3 steps)
├── Step 1: Thông tin cơ bản
│   ├── Input: Tên khóa học (required)
│   ├── Input: Mô tả ngắn (counter /200)
│   └── Textarea: Mô tả chi tiết
├── Step 2: Phân loại & Mục tiêu
│   ├── CatCard grid (7 categories)
│   ├── Trình độ cards (3 levels)
│   ├── DynamicList: Mục tiêu khóa học
│   └── DynamicList: Yêu cầu tiên quyết
├── Step 3: Giá bán & Hoàn tất
│   ├── Input: Giá bán + Giá gốc (grid-2)
│   ├── ThumbnailInput (styled drop zone + URL input)
│   └── CoursePreviewCard (live preview)
└── Navigation Buttons (Hủy / Quay lại / Tiếp theo / Tạo khóa học)
```

## 🎨 Styling Guidelines

- **Giữ nguyên inline styles** (pattern hiện tại của dự án, không tạo CSS file mới)
- **Màu sắc**: SELLER_ORANGE (#d97706), SELLER_ORANGE_LIGHT (#fef3c7), SELLER_ORANGE_DARK (#b45309)
- **CSS classes**: dùng `.card`, `.form-group`, `.form-label`, `.form-input`, `.fade-up` có sẵn
- **Border radius**: 8-14px (theo pattern hiện tại)
- **Font sizes**: label .85rem, input .95rem, hint .72rem (giữ nguyên)
- **Drop zone**: border `2px dashed var(--border)`, hover → border SELLER_ORANGE, background SELLER_ORANGE_LIGHT

## ⚙️ API & State

### State đầy đủ:
```javascript
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
    muc_tieu: [''],   // local only
    yeu_cau: [],      // local only
});
```

### Submit (KHÔNG thay đổi API):
```javascript
const handleSubmit = async () => {
    if (!form.ten_khoa_hoc.trim()) { setError('Vui lòng nhập tên khóa học.'); setStep(1); return; }
    setError('');
    setLoading(true);
    try {
        const res = await api.post('/lms/khoa-hoc/', {
            ten_khoa_hoc: form.ten_khoa_hoc,
            mo_ta_ngan: form.mo_ta_ngan,
            mo_ta_chi_tiet: form.mo_ta_chi_tiet,
            danh_muc: form.danh_muc,
            trinh_do: form.trinh_do,
            gia_tien: parseFloat(form.gia_tien) || 0,
            gia_goc: parseFloat(form.gia_goc) || 0,
            hinh_anh_thumbnail: form.hinh_anh_thumbnail,
        });
        navigate(`/seller/courses/${res.data.id_khoa_hoc}/builder`);
    } catch (err) {
        setError(err?.response?.data?.detail || 'Tạo khóa học thất bại.');
    } finally {
        setLoading(false);
    }
};
```

## ⚠️ Lưu ý quan trọng

1. **KHÔNG sửa file nào khác** ngoài CreateCourse.jsx
2. **KHÔNG đổi API endpoint** hoặc payload structure
3. **Giữ nguyên routing**: `/seller/courses/new` → CreateCourse
4. **`muc_tieu` và `yeu_cau`** chỉ là local state để UX đẹp, KHÔNG gửi lên server
5. **Export default**: `export default CreateCourse;`
6. **Breadcrumb** giữ nguyên ở đầu trang
7. **Responsive**: mỗi step nên hiển thị tốt trên mobile (grid-2 → 1 cột)
