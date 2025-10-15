import React, { useState, useEffect } from 'react';
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
  const [registeredRoleId, setRegisteredRoleId] = useState(null)
  const [registeredUserId, setRegisteredUserId] = useState(null)
  const [registerAttempted, setRegisterAttempted] = useState(false)
  const RESEND_COOLDOWN = 180
  const navigate = useNavigate();

  // Helper: extract readable message from various backend error shapes
  const getApiErrorMessage = (obj) => {
    if (!obj) return null;
    // If problem-details RFC with errors map
    try {
      if (obj.errors && typeof obj.errors === 'object') {
        // prefer OtpCode, otherwise join first error arrays
        if (Array.isArray(obj.errors.OtpCode) && obj.errors.OtpCode.length > 0) return String(obj.errors.OtpCode[0]);
        const firstKey = Object.keys(obj.errors)[0];
        if (firstKey && Array.isArray(obj.errors[firstKey]) && obj.errors[firstKey].length > 0) return String(obj.errors[firstKey][0]);
      }
    } catch (e) {}
    // common { statusCode, message }
    if (obj.message) return String(obj.message);
    if (obj.title) return String(obj.title);
    // nested data.message
    if (obj.data && obj.data.message) return String(obj.data.message);
    // if obj is string
    if (typeof obj === 'string') return obj;
    return null;
  };

  // Đếm ngược resend OTP
  useEffect(() => {
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
      // verify OTP (handle thrown responses to extract friendly messages)
      let verifyRes;
      let verifyData;
      try {
        verifyRes = await post(ApiEndpoints.OTP_VERIFY, { email, otpCode: otp, purpose });
        verifyData = verifyRes.data || verifyRes;
      } catch (vErr) {
        verifyRes = vErr?.response || vErr;
        verifyData = verifyRes?.data || vErr?.data || verifyRes;
        const vMsg = getApiErrorMessage(verifyData) || vErr?.message || 'Xác thực thất bại';
        throw new Error(vMsg);
      }
      if ((verifyData?.statusCode ?? verifyRes?.status) !== 200) {
        const vMsg = getApiErrorMessage(verifyData) || 'Xác thực thất bại';
        throw new Error(vMsg);
      }
      // Xác thực OTP thành công, gọi API REGISTER
      // Some ApiClient implementations throw for non-200 statuses (e.g. they throw when status !== 200)
      // but backend may return 201 for created. Call REGISTER and handle thrown responses by
      // inspecting err.response so we can accept 201 as success.
      let regRes;
      let regData;
      try {
        regRes = await post(ApiEndpoints.REGISTER, registerPayload);
        regData = regRes.data || regRes;
      } catch (regErr) {
        // Axios-like error objects put the server response on regErr.response
        // Extract that so we can inspect status/message even when post() threw.
        regRes = regErr?.response || regErr;
        regData = regRes?.data || regErr?.data || regRes;
        console.warn('REGISTER threw; inspected response:', regErr, regRes, regData);
      }

  // Lưu roleId và userId để redirect sau 3s
      const createdRoleId = regData?.data?.roleId || registerPayload?.roleId || null;
      const createdUserId = regData?.data?.userId || regData?.data?.id || null;
  // mark that we've attempted to register (regardless of success/failure)
  setRegisterAttempted(true);
      // check status from different shapes and accept 200/201 as success
      const regStatus = regData?.statusCode ?? regRes?.status ?? null;
      const regMsg = (regData?.message || regRes?.message || '') + '';
  const isRegSuccess = [200, 201].includes(Number(regStatus)) || /success|thành công/i.test(regMsg);
      if (!isRegSuccess) throw new Error(regMsg || 'Đăng ký thất bại');

      // success -> clear any previous error, store ids and show success
      console.log('REGISTER response:', regData, regRes);
      setError(null);
      setRegisterError(null);
      setRegisteredRoleId(createdRoleId);
      setRegisteredUserId(createdUserId);
      setRegisterSuccess(true);
      // show a short success message before redirect
      setMessage('Tạo tài khoản thành công!');
    } catch (err) {
      setRegisterError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // Chuyển hướng sau 3 giây khi đăng ký thành công
  useEffect(() => {
    if (registerSuccess) {
      console.log('registerSuccess effect, roleId=', registeredRoleId, 'userId=', registeredUserId);
      const t = setTimeout(() => {
        const roleId = registeredRoleId || registerPayload?.roleId;
        // roleId: 4 = employee, 3 = employer
        if (roleId === 3) {
          navigate('/employer/setup', { state: { forceCreate: true, userId: registeredUserId } });
        } else if (roleId === 4) {
          // default to employee setup
          navigate('/employee/profile', { state: { forceCreate: true, userId: registeredUserId } });
        }
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [registerSuccess, registeredRoleId, registeredUserId, navigate, registerPayload]);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Xác thực email</h3>
      <p className="text-sm text-gray-600 mb-4">Vui lòng nhập mã OTP đã gửi tới <strong>{email}</strong></p>

  {message && !registerSuccess && <div className="p-2 mb-3 text-sm text-green-800 bg-green-100 rounded">{message}</div>}
      {error && <div className="p-2 mb-3 text-sm text-red-800 bg-red-100 rounded">{error}</div>}
      {registerError && <div className="p-2 mb-3 text-sm text-red-800 bg-red-100 rounded">{registerError}</div>}
      {registerSuccess && (
        <div className="p-2 mb-3 text-sm text-green-800 bg-green-100 rounded">Tạo tài khoản thành công! Đang chuyển sang trang thiết lập hồ sơ...</div>
      )}

      {/* Ẩn ô nhập OTP khi đã qua bước đăng ký (thành công hoặc thất bại) */}
      {!registerAttempted && (
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
