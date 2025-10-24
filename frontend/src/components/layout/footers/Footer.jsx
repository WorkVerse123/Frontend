import { LAYOUT } from '../../../utils/emun/Enum';
import { useState } from 'react';
import FeedbackForm from '../../common/FeedbackForm';
import AuthCookie from '../../../services/AuthCookie';

export default function Footer() {
  const [popup, setPopup] = useState({ open: false, message: '', showAuth: false });
  const [fbOpen, setFbOpen] = useState(false);
  // Lấy role từ token trong cookie và map sang tên quyền
  const roleMap = {
    "1": "admin",
    "2": "staff",
    "3": "employer",
    "4": "employee"
  };
  let role = null;
  const token = AuthCookie.getCookie('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const rawRole = payload.role || payload.RoleId;
      role = roleMap[String(rawRole)] || String(rawRole).toLowerCase();
    } catch (e) {
      console.log('JWT decode error:', e);
    }
  }

  function showRolePopup(msg, showAuth) {
    setPopup({ open: true, message: msg, showAuth });
  }



  function goTo(path, requiredRole) {
    if (!role) {
      showRolePopup('Vui lòng đăng nhập để tiếp tục.', true);
      return;
    }
    if (requiredRole && role !== String(requiredRole).toLowerCase()) {
      if (String(requiredRole).toLowerCase() === 'employer') {
        showRolePopup('Trang này chỉ dành cho nhà tuyển dụng.', false);
      } else if (String(requiredRole).toLowerCase() === 'employee') {
        showRolePopup('Trang này chỉ dành cho ứng viên.', false);
      } else {
        showRolePopup('Bạn không có quyền truy cập trang này.', false);
      }
      return;
    }
    window.location.href = path;
  }

  return (
    <>
      <footer className="w-full bg-[#042852] text-white pt-10 pb-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
          {/* Logo và thông tin liên hệ */}
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-3 mb-4">
              <img src="/image/WorkVerseLogoCycle 1.png" alt="WorkVerse Logo" className="w-14 h-14" />
              <span className="text-2xl font-bold">WorkVerse</span>
            </div>
            <div className="text-gray-300 mb-2">Số Điện Thoại <span className="text-gray-400">0383109716</span></div>
            <div className="text-gray-400 mb-2">
              Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh
            </div>
          </div>
          {/* Liên kết nhanh */}
          <div className="flex-1 min-w-[160px]">
            <div className="font-semibold mb-2">Liên kết nhanh</div>
            <ul className="space-y-1 text-gray-300">
              <li><a href="/about" className="hover:underline">Giới thiệu</a></li>
              <li>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=workversecompany@gmail.com"
                  className="block font-semibold text-white hover:underline px-2 py-1 rounded transition-colors duration-150"
                  style={{ width: '100%' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Liên hệ
                </a>
              </li>
              <li>Blog</li>
            </ul>
          </div>
          {/* Ứng viên */}
          <div className="flex-1 min-w-[160px]">
            <div className="font-semibold mb-2">Ứng viên</div>
            <ul className="space-y-1 text-gray-300">
              <li><a href="/jobs" className="hover:underline">Tìm việc</a></li>
              <li><a href="/companies" className="hover:underline">Tìm công ty</a></li>
              <li><button className="hover:underline" onClick={() => goTo('/employee/dashboard', 'employee')}>Trang quản lý ứng viên</button></li>
              <li><button className="hover:underline" onClick={() => goTo('/employee/dashboard?activeTab=saved', 'employee')}>Việc đã lưu</button></li>
            </ul>
          </div>
          {/* Nhà tuyển dụng */}
          <div className="flex-1 min-w-[160px]">
            <div className="font-semibold mb-2">Nhà tuyển dụng</div>
            <ul className="space-y-1 text-gray-300">
              <li><button className="hover:underline" onClick={() => goTo('/jobs/create', 'employer')}>Đăng tin tuyển dụng</button></li>
              <li><button className="hover:underline" onClick={() => goTo('/candidates', 'employer')}>Tìm ứng viên</button></li>
              <li><button className="hover:underline" onClick={() => goTo('/employer/jobs', 'employer')}>Trang quản lý nhà tuyển dụng</button></li>
              <li><button className="hover:underline" onClick={() => goTo('/employer/jobs?activeTab=applications', 'employer')}>Quản lý hồ sơ ứng tuyển</button></li>
            </ul>
          </div>
          {/* Hỗ trợ */}
          <div className="flex-1 min-w-[160px]">
            <div className="font-semibold mb-2">Hỗ trợ</div>
            <ul className="space-y-1 text-gray-300">
              <li>Câu hỏi thường gặp (FAQ)</li>
              <li>Chính sách bảo mật</li>
              <li>Điều khoản sử dụng</li>
            </ul>
          </div>
        </div>
        {/* Đăng ký nhận bản tin */}
        <div className="max-w-7xl mx-auto px-4 mt-8 text-center">
          <div className="font-semibold mb-2">Đăng ký nhận bản tin mới</div>
          <form className="flex justify-center items-center gap-2">
            <div className="flex items-center bg-white rounded px-2 py-1">
              <svg className="w-5 h-5 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12l-4-4-4 4m8 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
              </svg>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="outline-none bg-transparent text-gray-700 px-2 py-1 w-48"
              />
            </div>
            <button type="submit" className="bg-red-500 text-white px-4 py-1 rounded font-semibold">Đăng ký</button>
          </form>
        </div>
        {/* Social icons */}
        <div className="max-w-7xl mx-auto px-4 mt-8 flex justify-center gap-6 text-gray-300 text-xl">
          <a href="https://www.facebook.com/profile.php?id=61567714224653" target="_blank" rel="noreferrer noopener"><i className="fab fa-facebook"></i></a>
          <a href="https://www.instagram.com/work.verse/" target="_blank" rel="noreferrer noopener"><i className="fab fa-instagram"></i></a>
          <a href="https://www.threads.com/@work.verse" target="_blank" rel="noreferrer noopener"><i className="fab fa-threads"></i></a>
          {/* Feedback button */}
          <button onClick={() => setFbOpen(true)} className="ml-4 bg-white text-[#042852] px-3 py-1 rounded text-sm font-semibold">Feedback</button>
        </div>
        <FeedbackForm open={fbOpen} onClose={() => setFbOpen(false)} />
        {/* Copyright */}
        <div className="max-w-7xl mx-auto px-4 mt-6 text-center text-sm text-gray-400 border-t border-gray-700 pt-2">
          © {new Date().getFullYear()} WorkVerse. All rights reserved.
        </div>
        {/* Popup cảnh báo role */}
        {popup.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] text-center">
              <div className="text-lg font-semibold mb-2 text-[#042852]">{popup.message}</div>
              {popup.showAuth ? (
                <div className="flex justify-center gap-4 mt-4">
                  <a href="/auth" className="bg-[#2563eb] text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Đăng nhập</a>
                </div>
              ) : null}
              <button className="mt-6 px-4 py-2 rounded bg-[#296788] text-white font-semibold" onClick={() => setPopup({ open: false, message: '', showAuth: false })}>Đóng</button>
            </div>
          </div>
        )}
      </footer>
    </>
  );
}