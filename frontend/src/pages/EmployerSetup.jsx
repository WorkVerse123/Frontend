import { useState, useRef } from 'react';
import { TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import ApiEndpoints from '../services/ApiEndpoints';
import { post } from '../services/ApiClient';
import { useLocation } from 'react-router-dom';
import { STEPS, TYPE_MAP } from '../utils/emun/Enum';



export default function EmployerSetup() {
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');
    const [establishedAt, setEstablishedAt] = useState('');
    const [companyType, setCompanyType] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [socials, setSocials] = useState('');

    const [logoPreview, setLogoPreview] = useState(null);
    const logoFileRef = useRef(null);

        const { user } = useAuth();
        const location = useLocation();
        // registration may navigate here with state: { forceCreate: true, userId }
        const navStateUserId = location?.state?.userId || null;
        const roleCandidate = user?.RoleId || user?.roleId || user?.role || user?.role_id || null;
        const normalizedRole = (() => {
            if (roleCandidate === null || roleCandidate === undefined) return 'guest';
            const n = Number(roleCandidate);
            if (!Number.isNaN(n) && n > 0) {
                switch (n) {
                    case 1: return 'admin';
                    case 2: return 'staff';
                    case 3: return 'employer';
                    case 4: return 'employee';
                    default: return 'guest';
                }
            }
            return String(roleCandidate).toLowerCase();
        })();

    // validation helpers
    const [validationStep, setValidationStep] = useState(null); // show errors for this step
    const [completedUntil, setCompletedUntil] = useState(-1); // highest completed step

    const onFile = (file, setPreview, ref) => {
        if (!file) { setPreview(null); ref.current = null; return; }
        ref.current = file;
        const fr = new FileReader();
        fr.onload = () => setPreview(fr.result);
        fr.readAsDataURL(file);
    };

    const isEmailValid = (v) => /\S+@\S+\.\S+/.test(v);
    const validateStep = (s) => {
        if (s === 0) return companyName.trim().length > 0 && description.trim().length > 0;
        if (s === 1) return establishedAt.trim().length > 0 && companyType.trim().length > 0;
        if (s === 2) return !!logoFileRef.current;
        if (s === 3) return address.trim().length > 0 && phone.trim().length > 6 && isEmailValid(email);
        return true;
    };

    const next = () => {
        if (!validateStep(step)) {
            setValidationStep(step);
            return;
        }
        // mark current step completed
        setCompletedUntil((p) => Math.max(p, step));
        setValidationStep(null);
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const back = () => {
        setValidationStep(null);
        setStep((s) => Math.max(s - 1, 0));
    };

    const handleSave = async () => {
        // final validation
        for (let s = 0; s <= 3; s++) {
            if (!validateStep(s)) { setStep(s); setValidationStep(s); return; }
        }


        const employerType = TYPE_MAP[companyType] ?? null;

        // parse website and socials into URL list
        const parseList = (raw) =>
            String(raw || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

        const normalizeUrl = (u) => {
            if (!u) return null;
            if (/^https?:\/\//i.test(u)) return u;
            return 'https://' + u.replace(/^\/+/, '');
        };

        const websiteUrls = parseList(website).map(normalizeUrl).filter(Boolean);
        const socialUrls = parseList(socials).map(normalizeUrl).filter(Boolean);
        const websiteUrlsDedup = Array.from(new Set([...websiteUrls, ...socialUrls]));

        // logoUrls: use preview (data URL) as placeholder since real upload/API not available
        const logoUrls = [];
        if (logoPreview) logoUrls.push(logoPreview);

        const resolvedUserId = navStateUserId || user?.UserId || user?.userId || user?.id || user?.UserID || null;

        const payload = {
            userId: resolvedUserId,
            companyName: companyName || '',
            employerType: employerType,
            address: address || '',
            websiteUrls: websiteUrlsDedup,
            logoUrls,
            dateEstablished: establishedAt || '',
            description: description || '',
        };

        // print formatted payload (send to API when ready)
        console.log('Employer setup payload:', JSON.stringify(payload, null, 2));

        setSaving(true);
        try {
            const res = await post(ApiEndpoints.COMPANY_SETUP, payload);
            // handle Async wrapper shapes: post returns axios response; use status or data
            const ok = res?.status === 200 || res?.status === 201 || (res?.data && (res.data.statusCode === 200 || res.data.statusCode === 201));
            if (!ok) {
                console.error('Company setup failed', res);
                alert('Lưu thất bại, thử lại');
            } else {
                setDone(true);
            }
        } catch (e) {
            console.error(e);
            alert('Lưu thất bại, thử lại');
        } finally {
            setSaving(false);
        }
    };

    if (done) {
        return (
            <MainLayout role={normalizedRole} hasSidebar={false}>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                    <div className="rounded-full bg-white/30 w-24 h-24 flex items-center justify-center mb-6">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4L19 6" stroke="#0b66d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">🎉 Xin chúc mừng, hồ sơ đã hoàn thành 100%!</h2>
                    <p className="text-gray-600 max-w-xl">Bạn có thể tiếp tục đăng tin hoặc về trang tổng quan để quản lý doanh nghiệp và ứng viên.</p>
                    <div className="mt-6 flex gap-3">
                        <button className="px-4 py-2 rounded bg-white border" onClick={() => window.location.href = '/'}>Trang chủ</button>
                        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => window.location.href = '/jobs/create'}>Đăng Tin</button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const progress = Math.round((step / (STEPS.length - 1)) * 100);

    return (
        <MainLayout role={normalizedRole} hasSidebar={false}>
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-semibold text-[#042852]">Thiết lập thông tin doanh nghiệp</h1>
                        <div className="text-sm text-gray-500">Tiến trình thiết lập</div>
                    </div>
                    <div className="w-full bg-white/40 rounded-full h-2 mt-3">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <div className="flex items-center gap-6 border-b pb-4 mb-6 overflow-x-auto">
                        {STEPS.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => { if (i <= completedUntil + 1) { setStep(i); setValidationStep(null); } }}
                                className={`text-sm pb-3 ${i === step ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                disabled={i > completedUntil + 1}
                            >
                                {s.title}
                            </button>
                        ))}
                    </div>

                    <div>
                        {step === 0 && (
                            <div className="space-y-4">
                                <TextField
                                    required
                                    label="Tên doanh nghiệp"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    error={validationStep === 0 && companyName.trim() === ''}
                                    helperText={validationStep === 0 && companyName.trim() === '' ? 'Bắt buộc' : ''}
                                />
                                <TextField
                                    required
                                    label="Giới thiệu về doanh nghiệp"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    multiline
                                    minRows={5}
                                    error={validationStep === 0 && description.trim() === ''}
                                    helperText={validationStep === 0 && description.trim() === '' ? 'Bắt buộc' : ''}
                                />
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-4">
                                <TextField
                                    required
                                    label="Ngày thành lập"
                                    type="date"
                                    value={establishedAt}
                                    onChange={e => setEstablishedAt(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    error={validationStep === 1 && establishedAt.trim() === ''}
                                    helperText={validationStep === 1 && establishedAt.trim() === '' ? 'Bắt buộc' : ''}
                                />
                                <FormControl fullWidth variant="outlined" error={validationStep === 1 && companyType.trim() === ''}>
                                    <InputLabel id="company-type-label">Loại doanh nghiệp</InputLabel>
                                    <Select
                                        labelId="company-type-label"
                                        label="Loại doanh nghiệp"
                                        required
                                        value={companyType}
                                        onChange={e => setCompanyType(e.target.value)}
                                        MenuProps={{
                                          // ensure menu is rendered in a portal (attach to body) to avoid parent clipping
                                          disablePortal: false,
                                          // make paper scrollable
                                          PaperProps: { style: { maxHeight: 250, overflow: 'auto' } }
                                        }}
                                    >
                                        <MenuItem value="">-- Chọn --</MenuItem>
                                        <MenuItem value="Private Limited">Private Limited</MenuItem>
                                        <MenuItem value="Public Company">Public Company</MenuItem>
                                        <MenuItem value="Startup">Startup</MenuItem>
                                        <MenuItem value="NGO">NGO / Non-profit</MenuItem>
                                        <MenuItem value="Sole Proprietorship">Sole Proprietorship</MenuItem>
                                        <MenuItem value="Partnership">Partnership</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                    {validationStep === 1 && companyType.trim() === '' && <FormHelperText>Bắt buộc</FormHelperText>}
                                </FormControl>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium mb-2">
                                    Logo <span className="text-red-600">*</span>
                                </label>

                                <div className="border dashed border-gray-200 rounded p-4 flex flex-col items-center justify-center">
                                    <input
                                        accept="image/*"
                                        type="file"
                                        aria-required="true"
                                        onChange={e => {
                                            const f = e.target.files?.[0];
                                            if (!f) { onFile(null, setLogoPreview, logoFileRef); return; }
                                            // basic validations
                                            const maxMB = 5;
                                            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
                                            if (f.size > maxMB * 1024 * 1024) {
                                                setValidationStep(2);
                                                alert(`Logo vượt quá ${maxMB}MB, vui lòng chọn file nhỏ hơn.`);
                                                return;
                                            }
                                            if (!allowedTypes.includes(f.type)) {
                                                setValidationStep(2);
                                                alert('Định dạng không hỗ trợ. Vui lòng chọn PNG/JPEG/WebP.');
                                                return;
                                            }
                                            onFile(f, setLogoPreview, logoFileRef);
                                        }}
                                    />
                                    <div className="text-xs text-gray-500 mt-2">Kích thước tối đa 5MB. Định dạng: PNG, JPG, WebP.</div>
                                </div>

                                {validationStep === 2 && !logoFileRef.current && (
                                    <div className="text-sm text-red-600 mt-2">Vui lòng tải lên logo trước khi tiếp tục</div>
                                )}

                                {logoPreview && (
                                    <div className="mt-3">
                                        <img src={logoPreview} alt="logo" className="w-28 h-28 object-cover rounded shadow-sm" />
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <TextField
                                    required
                                    label="Địa chỉ hoạt động"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    error={validationStep === 3 && address.trim() === ''}
                                    helperText={validationStep === 3 && address.trim() === '' ? 'Bắt buộc' : ''}
                                />
                                <TextField
                                    required
                                    label="Số điện thoại"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    error={validationStep === 3 && phone.trim().length <= 6}
                                    helperText={validationStep === 3 && phone.trim().length <= 6 ? 'Số điện thoại không hợp lệ' : ''}
                                />
                                <TextField
                                    required
                                    label="Email liên hệ"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    error={validationStep === 3 && !/\S+@\S+\.\S+/.test(email)}
                                    helperText={validationStep === 3 && !/\S+@\S+\.\S+/.test(email) ? 'Email không hợp lệ' : ''}
                                />
                                <TextField label="Mạng xã hội / Liên kết (URL, cách nhau bằng dấu phẩy)" value={socials} onChange={e => setSocials(e.target.value)} fullWidth variant="outlined" placeholder="https://facebook.com/..., https://linkedin.com/..." />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-3">
                            <button onClick={back} disabled={step === 0} className="px-4 py-2 rounded border bg-white disabled:opacity-50">Trước</button>
                            {step < STEPS.length - 1 ? (
                                <button onClick={next} className="px-4 py-2 rounded bg-blue-600 text-white" disabled={false}>Lưu & Tiếp Theo</button>
                            ) : (
                                <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white" disabled={saving}>{saving ? 'Đang lưu...' : 'Hoàn Thành'}</button>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">Bước {step + 1} / {STEPS.length}</div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}