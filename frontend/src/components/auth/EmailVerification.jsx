import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiEndpoints from '../../services/ApiEndpoints';
import { post } from '../../services/ApiClient';

export default function EmailVerification({ email, purpose, registerPayload, initialMessage }) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(initialMessage || null)
  const [error, setError] = useState(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [registerError, setRegisterError] = useState(null)
  const RESEND_COOLDOWN = 180
  const navigate = useNavigate();

  // Đếm ngược resend OTP
  React.useEffect(() => {
    let t;
    if (resendTimer > 0) {
      t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Gửi lại OTP khi user bấm 'Gửi lại mã'
  async function sendOtp() {
    if (resendTimer > 0) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post(ApiEndpoints.OTP_REQUEST, { email, purpose });
      const data = res.data || res;
      if (data.statusCode !== 200) throw new Error(data.message || 'Không thể gửi OTP');
      setMessage('Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.');
      setResendTimer(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setRegisterError(null);
    try {
      if (!/^[0-9]{4,8}$/.test(otp)) throw new Error('Mã OTP không hợp lệ');
      const res = await post(ApiEndpoints.OTP_VERIFY, { email, otpCode: otp, purpose });
      const data = res.data || res;
      if (data.statusCode !== 200) throw new Error(data.message || 'Xác thực thất bại');
      // Xác thực OTP thành công, gọi API REGISTER
      setMessage('Đang tạo tài khoản...');
      const regRes = await post(ApiEndpoints.REGISTER, registerPayload);
      const regData = regRes.data || regRes;
      if (regData.statusCode !== 200) throw new Error(regData.message || 'Đăng ký thất bại');
      setRegisterSuccess(true);
      setMessage('Tạo tài khoản thành công! Đang chuyển sang trang thiết lập hồ sơ...');
      setTimeout(() => {
        navigate('/employee/profile', { state: { forceCreate: true, userId: regData?.data?.userId || regData?.data?.id } });
      }, 3000);
    } catch (err) {
      setRegisterError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Xác thực email</h3>
      <p className="text-sm text-gray-600 mb-4">Vui lòng nhập mã OTP đã gửi tới <strong>{email}</strong></p>

      {message && <div className="p-2 mb-3 text-sm text-green-800 bg-green-100 rounded">{message}</div>}
      {error && <div className="p-2 mb-3 text-sm text-red-800 bg-red-100 rounded">{error}</div>}
      {registerError && <div className="p-2 mb-3 text-sm text-red-800 bg-red-100 rounded">{registerError}</div>}
      {registerSuccess && <div className="p-2 mb-3 text-sm text-green-800 bg-green-100 rounded">Tạo tài khoản thành công! Đang chuyển sang trang thiết lập hồ sơ...</div>}

      {/* Ẩn ô nhập OTP khi đang tạo tài khoản (loading sau xác thực OTP) */}
      {!registerSuccess && !message?.includes('Đang tạo tài khoản') && (
        <form onSubmit={verifyOtp} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Mã OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Nhập mã OTP (chỉ số, 4-8 chữ số)"
              required
              inputMode="numeric"
              minLength={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={sendOtp}
                disabled={resendTimer > 0 || loading}
                className="text-sm text-blue-600 underline disabled:opacity-50"
              >
                {resendTimer > 0 ? `Gửi lại (${resendTimer}s)` : 'Gửi lại mã'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
