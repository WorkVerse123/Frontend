import React, { useState } from 'react'
import ApiEndpoints from '../../services/ApiEndpoints'
import { OtpPurpose } from '../../utils/emun/Enum'
import { post } from '../../services/ApiClient'

// REUSABLE Email verification component
// Props:
//  - email (string) required
//  - onVerified() callback when OTP verified successfully
export default function EmailVerification({ email, onVerified, purpose = OtpPurpose.AccountVerification }) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [resendTimer, setResendTimer] = useState(0)
  const RESEND_COOLDOWN = 180

  // Không tự động gửi OTP khi mount, chỉ gửi khi user bấm gửi lại

  React.useEffect(() => {
    let t
    if (resendTimer > 0) {
      t = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    }
    return () => clearTimeout(t)
  }, [resendTimer])

  // Chỉ gửi OTP_REQUEST khi user bấm 'Gửi lại mã', không gửi khi modal mount
  const [otpRequested, setOtpRequested] = useState(true) // Đã gửi OTP thành công ở RegisterForm
  async function sendOtp() {
    // Chỉ cho phép gửi lại khi hết cooldown
    if (resendTimer > 0) return;
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await post(ApiEndpoints.OTP_REQUEST, { email, purpose })
      const data = res.data || res
      if (data.statusCode !== 200) throw new Error(data.message || 'Không thể gửi OTP')
      setMessage('Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.')
      setResendTimer(RESEND_COOLDOWN)
      setOtpRequested(true)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e) {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      if (!/^[0-9]{4,8}$/.test(otp)) throw new Error('Mã OTP không hợp lệ')
      const res = await post(ApiEndpoints.OTP_VERIFY, { email, otpCode: otp, purpose })
      const data = res.data || res
      if (data.statusCode !== 200) throw new Error(data.message || 'Xác thực thất bại')
      setMessage('Xác thực thành công! Chuyển sang phần tạo hồ sơ...')
      if (typeof onVerified === 'function') onVerified(data)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Xác thực email</h3>
      <p className="text-sm text-gray-600 mb-4">Vui lòng nhập mã OTP đã gửi tới <strong>{email}</strong></p>

      {message && <div className="p-2 mb-3 text-sm text-green-800 bg-green-100 rounded">{message}</div>}
      {error && <div className="p-2 mb-3 text-sm text-red-800 bg-red-100 rounded">{error}</div>}

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
    </div>
  )
}
