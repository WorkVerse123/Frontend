import React, { useState } from 'react';
import { post as apiPost } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';

export default function CreateStaffAccount() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [identityCard, setIdentityCard] = useState('');
  // default startDate to today (YYYY-MM-DD for input)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  // default displayed as dd/mm/yyyy for UI
  const defaultStart = `${dd}/${mm}/${yyyy}`;
  const [startDate, setStartDate] = useState(defaultStart);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      // 1) Call REGISTER to create base user
      const registerPayload = { email, phoneNumber: phone, password, roleId: 2, status: 'active' };
      const regRes = await apiPost(ApiEndpoints.REGISTER, registerPayload);
      const user = regRes?.data?.data || regRes?.data || regRes;

      // 2) Call ADMIN_CREATE_ACCOUNT to create staff profile
      // helper: parse dd/MM/yyyy (or other formats) and return ISO datetime string
      const toISO = (dateStr) => {
        if (!dateStr) return null;
        // dd/MM/yyyy
        const dmy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (dmy) {
          const [_, ddv, mmv, yv] = dmy;
          // create ISO date at midnight UTC
          const iso = new Date(Date.UTC(Number(yv), Number(mmv) - 1, Number(ddv), 0, 0, 0)).toISOString();
          return iso;
        }
        // YYYY-MM-DD
        const ymd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (ymd) {
          const [_, yv, mv, dv] = ymd;
          return new Date(Date.UTC(Number(yv), Number(mv) - 1, Number(dv), 0, 0, 0)).toISOString();
        }
        // digits only like DDMMYYYY
        const digits = dateStr.replace(/\D/g, '');
        if (digits.length === 8) {
          return new Date(Date.UTC(Number(digits.slice(4)), Number(digits.slice(2,4)) - 1, Number(digits.slice(0,2)), 0,0,0)).toISOString();
        }
        return null;
      };

      // Send both shapes: top-level fields (camelCase) and nested staffProfile (PascalCase)
      const staffDto = {
        // top-level (some endpoints expect these)
        staffId: 0,
        userId: user?.id || user?.userId || null,
        fullName: name,
        gender: gender || null,
        dateOfBirth: toISO(dateOfBirth) || null,
        address: address || null,
        identityCard: identityCard || null,
        startDate: toISO(startDate) || null,
        // nested profile (other endpoints expect this)
        staffProfile: {
          FullName: name,
          gender: gender || null,
          dateOfBirth: toISO(dateOfBirth) || null,
          address: address || null,
          identityCard: identityCard || null,
          startDate: toISO(startDate) || null
        }
      };
      await apiPost(ApiEndpoints.ADMIN_CREATE_ACCOUNT, staffDto);

      setMessage('Tạo tài khoản Staff thành công');
      setEmail(''); setPhone(''); setName(''); setGender(''); setDateOfBirth(''); setAddress(''); setIdentityCard(''); setStartDate(defaultStart);
    } catch (e) {
      console.error(e);
      setMessage('Có lỗi khi tạo tài khoản: ' + (e?.message || 'unknown'));
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-3">
      {message && <div className="text-sm text-green-700">{message}</div>}
      <input required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
      <input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại" className="w-full border rounded px-3 py-2" />
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Họ tên" className="w-full border rounded px-3 py-2" />
      <select value={gender} onChange={e => setGender(e.target.value)} className="w-full border rounded px-3 py-2">
        <option value="">Chọn giới tính</option>
        <option value="Male">Nam</option>
        <option value="Female">Nữ</option>
        <option value="Other">Khác</option>
      </select>
      <input type="text" value={dateOfBirth} onChange={e => {
        // allow only digits and insert slashes to format as dd/mm/yyyy
        const raw = e.target.value.replace(/\D/g, '').slice(0,8);
        let formatted = raw;
        if (raw.length >= 3 && raw.length <= 4) formatted = `${raw.slice(0,2)}/${raw.slice(2)}`;
        if (raw.length >= 5 && raw.length <= 8) formatted = `${raw.slice(0,2)}/${raw.slice(2,4)}/${raw.slice(4)}`;
        if (raw.length <= 2) formatted = raw;
        setDateOfBirth(formatted);
      }} placeholder="Ngày sinh (dd/mm/yyyy)" className="w-full border rounded px-3 py-2" />
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Địa chỉ" className="w-full border rounded px-3 py-2" />
      <input value={identityCard} onChange={e => setIdentityCard(e.target.value)} placeholder="Số CMND/CCCD" className="w-full border rounded px-3 py-2" />
  {/* startDate is hidden and defaults to today (kept in state) */}
      <button type="submit" disabled={loading} className="w-full bg-[#2563eb] text-white px-3 py-2 rounded">{loading ? 'Đang tạo...' : 'Tạo Staff'}</button>
    </form>
  );
}
