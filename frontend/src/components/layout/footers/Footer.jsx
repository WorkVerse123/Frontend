import { LAYOUT } from '../../../utils/emun/Enum';

export default function Footer() {
  return (
    <footer className="w-full bg-[#042852] text-white pt-10 pb-4">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Logo và thông tin liên hệ */}
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-3 mb-4">
            <img src="/image/WorkVerseLogoCycle 1.png" alt="WorkVerse Logo" className="w-14 h-14" />
            <span className="text-2xl font-bold">WorkVerse</span>
          </div>
          <div className="text-gray-300 mb-2">Số Điện Thoại <span className="text-gray-400">(028) 7300 5588</span></div>
          <div className="text-gray-400 mb-2">
            Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh
          </div>
        </div>
        {/* Liên kết nhanh */}
        <div className="flex-1 min-w-[160px]">
          <div className="font-semibold mb-2">Liên kết nhanh</div>
          <ul className="space-y-1 text-gray-300">
            <li>Giới thiệu</li>
            <li>→ <span className="font-semibold text-white">Liên hệ</span></li>
            <li>Bảng giá</li>
            <li>Blog</li>
          </ul>
        </div>
        {/* Ứng viên */}
        <div className="flex-1 min-w-[160px]">
          <div className="font-semibold mb-2">Ứng viên</div>
          <ul className="space-y-1 text-gray-300">
            <li>Tìm việc</li>
            <li>Tìm công ty</li>
            <li>Trang quản lý ứng viên</li>
            <li>Việc đã lưu</li>
          </ul>
        </div>
        {/* Nhà tuyển dụng */}
        <div className="flex-1 min-w-[160px]">
          <div className="font-semibold mb-2">Nhà tuyển dụng</div>
          <ul className="space-y-1 text-gray-300">
            <li>Đăng tin tuyển dụng</li>
            <li>Tìm ứng viên</li>
            <li>Trang quản lý nhà tuyển dụng</li>
            <li>Quản lý hồ sơ ứng tuyển</li>
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
      </div>
      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 mt-6 text-center text-sm text-gray-400 border-t border-gray-700 pt-2">
        © {new Date().getFullYear()} WorkVerse. All rights reserved.
      </div>
    </footer>
  );
}