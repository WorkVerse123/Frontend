import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterBox() {
  // check auth: prefer a real AuthContext; fallback to cookies 'token' or 'user'
  const getAuthFromCookie = () => {
    // look for either 'token' or 'user' cookie
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .some(c => c.startsWith('token=') || c.startsWith('user='));
  };

  const [isLoggedIn, setIsLoggedIn] = useState(() => getAuthFromCookie());

  const navigate = useNavigate();

  useEffect(() => {
    // poll for cookie changes (no native cookie change event). Interval kept small.
    let last = document.cookie;
    const id = setInterval(() => {
      if (document.cookie !== last) {
        last = document.cookie;
        setIsLoggedIn(getAuthFromCookie());
      }
    }, 1000);

    // also update on focus in case cookies changed while in background
    const onFocus = () => setIsLoggedIn(getAuthFromCookie());
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  if (isLoggedIn) return null; // hide register box when user is logged in

  return (
    <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 py-8 px-4">
      <div className="bg-white rounded-xl shadow p-6 border">
        <h2 className="text-xl font-semibold text-[#2563eb] mb-2">Trở thành Ứng viên</h2>
        <p className="text-gray-600 mb-4">Đăng ký để tìm việc làm phù hợp, quản lý hồ sơ và ứng tuyển nhanh chóng.</p>
        <button onClick={() => navigate('/auth?form=register&role=1')} className="bg-[#2563eb] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          Đăng Ký Ngay
        </button>
      </div>
      <div className="bg-[#2563eb] rounded-xl shadow p-6 border text-white">
        <h2 className="text-xl font-semibold mb-2">Trở thành Nhà tuyển dụng</h2>
        <p className="mb-4">Đăng ký để đăng tin tuyển dụng, quản lý ứng viên và tìm kiếm nhân sự hiệu quả.</p>
        <button onClick={() => navigate('/auth?form=register&role=2')} className="bg-white text-[#2563eb] px-6 py-2 rounded-lg font-semibold hover:bg-blue-100 transition">
          Đăng Ký Ngay
        </button>
      </div>
    </section>
  );
}