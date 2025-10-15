import { useState, useRef } from 'react';
import { TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText, Snackbar } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ApiEndpoints from '../services/ApiEndpoints';
import { post } from '../services/ApiClient';
import UploadService from '../services/UploadService';
import { useLocation } from 'react-router-dom';
import { STEPS, TYPE_MAP } from '../utils/emun/Enum';
import { useEffect } from 'react';
import { get as apiGet } from '../services/ApiClient';



export default function EmployerSetup() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');
    const [establishedAt, setEstablishedAt] = useState('');
    const [companyType, setCompanyType] = useState('');
    const [employerTypes, setEmployerTypes] = useState([]);
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [socials, setSocials] = useState('');

    const [logoPreview, setLogoPreview] = useState(null);
    const logoFileRef = useRef(null);
    const [logoUploadProgress, setLogoUploadProgress] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const showSnackbar = (msg, severity = 'success') => { setSnackbarMsg(msg); setSnackbarSeverity(severity); setSnackbarOpen(true); };

    const redirectedRef = useRef(false);
    const performRedirect = () => {
        if (redirectedRef.current) return;
        redirectedRef.current = true;
        try { navigate('/auth', { replace: true }); } catch (e) {}
        const t = setTimeout(() => { try { window.location.href = '/auth'; } catch (e) {} }, 700);
        setTimeout(() => clearTimeout(t), 1500);
    };

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

    // fetch employer types to populate dropdown (API returns { data: [ { employerTypeId, employerTypeName } ] })
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await apiGet(ApiEndpoints.EMPLOYER_TYPES);
                if (!mounted) return;
                const list = res?.data?.data || res?.data || [];
                setEmployerTypes(Array.isArray(list) ? list : []);
            } catch (e) {
                // debug removed
                setEmployerTypes([]);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleSave = async () => {
        // final validation
        for (let s = 0; s <= 3; s++) {
            if (!validateStep(s)) { setStep(s); setValidationStep(s); return; }
        }


        // send numeric employerType id (selected companyType is string of id)
        const employerType = companyType ? Number(companyType) : null;

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

        // logoUrls: upload real file to Cloudinary if present; otherwise fall back to preview data URL
        const logoUrls = [];
        if (logoFileRef.current) {
            // upload selected file to Cloudinary and collect returned URL
            try {
                const uploadRes = await UploadService.uploadImageToCloudinary(logoFileRef.current, {
                    onProgress: (p) => setLogoUploadProgress(p),
                    // do not let UploadService save to backend here; we'll include returned URL in payload below
                    saveToBackend: false,
                });
                const resolvedUrl = uploadRes?.url || uploadRes?.raw?.secure_url || uploadRes?.secure_url || null;
                if (resolvedUrl) {
                    logoUrls.push(resolvedUrl);
                } else if (uploadRes?.backend) {
                    // if service saved to backend and returned backend payload, try to extract logoUrls
                    const be = uploadRes.backend;
                    if (Array.isArray(be?.logoUrls)) logoUrls.push(...be.logoUrls);
                    else if (Array.isArray(be?.data?.logoUrls)) logoUrls.push(...be.data.logoUrls);
                }
                } catch (e) {
                // debug removed
                showSnackbar('Upload logo thất bại, thử lại', 'error');
                setSaving(false);
                setLogoUploadProgress(0);
                return;
            } finally {
                setLogoUploadProgress(0);
            }
        } else if (logoPreview) {
            logoUrls.push(logoPreview);
        }

        const resolvedUserId = navStateUserId || user?.UserId || user?.userId || user?.id || user?.UserID || null;

        // pick only the first website/logo URL — backend expects single values
        const websiteUrl = websiteUrlsDedup?.[0] || '';
        const logoUrl = logoUrls?.[0] || '';

        // normalize payload to backend-expected keys (singular fields)
        const payload = {
            userId: resolvedUserId,
            companyName: companyName || '',
            employerTypeId: employerType,
            address: address || '',
            ContactPhone: phone || '',
            ContactEmail: email || '',
            // backend (PUT /api/employer/:id) expects websiteUrl and logoUrl as single values
            websiteUrl,
            logoUrl,
            // backend uses `dateEstablished` (see EditEmployer.jsx) — keep consistent
            dateEstablished: establishedAt || '',
            description: description || '',
        };

        // print formatted payload (send to API when ready)
    // debug removed

        setSaving(true);
        try {
            const res = await post(ApiEndpoints.COMPANY_SETUP, payload);
            const ok = res?.status === 200 || res?.status === 201 || (res?.data && (res.data.statusCode === 200 || res.data.statusCode === 201));
                if (!ok) {
                // debug removed
                const serverMsg = res?.data?.message || res?.data || JSON.stringify(res);
                showSnackbar('Lưu thất bại: ' + serverMsg, 'error');
            } else {
                setDone(true);
            }
        } catch (e) {
            // try to surface useful server validation messages when available
            // debug removed
            const serverDetail = e?.response?.data ?? e?.response ?? e?.message ?? e;
                try {
                // prefer explicit message field
                const msg = (e?.response?.data && (e.response.data.message || e.response.data.error)) || JSON.stringify(serverDetail);
                showSnackbar('Lưu thất bại: ' + msg, 'error');
            } catch (ex) {
                showSnackbar('Lưu thất bại, kiểm tra console để biết thêm chi tiết', 'error');
            }
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
                    <p className="text-gray-600 max-w-xl">Vui lòng đăng nhập lại!</p>
                    <div className="mt-6 flex gap-3">
                        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => window.location.href = '/auth'}>Đăng nhập</button>
                    </div>
                </div>
                <Snackbar
                    open={true}
                    autoHideDuration={3000}
                    onClose={() => performRedirect()}
                    message="Hồ sơ doanh nghiệp đã hoàn thành — chuyển tới trang đăng nhập..."
                />
            </MainLayout>
        );
    }

    const progress = Math.round((step / (STEPS.length - 1)) * 100);

    return (
       
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
                                <FormControl fullWidth variant="outlined" error={validationStep === 1 && companyType === ''}>
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
                                            PaperProps: { style: { maxHeight: 250, overflow: 'auto' } },
                                            // don't lock body scroll on open
                                            disableScrollLock: true
                                        }}
                                    >
                                        <MenuItem value="">-- Chọn --</MenuItem>
                                        {employerTypes.map((t) => (
                                            <MenuItem key={t.employerTypeId} value={String(t.employerTypeId)}>{t.employerTypeName}</MenuItem>
                                        ))}
                                    </Select>
                                    {validationStep === 1 && companyType === '' && <FormHelperText>Bắt buộc</FormHelperText>}
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
                                <TextField label="Mạng xã hội / Liên kết " value={socials} onChange={e => setSocials(e.target.value)} fullWidth variant="outlined" placeholder="https://facebook.com/..." />
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
       
    );

    
}