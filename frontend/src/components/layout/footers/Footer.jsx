import { LAYOUT } from '../../../utils/emun/Enum';

export default function Footer() {
  return (
    <footer
      className="w-full left-0 bottom-0 bg-[#042852] text-white z-50"
      style={{
        minHeight: LAYOUT.FOOTER_HEIGHT,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-2 h-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-sm text-gray-300">
            © {new Date().getFullYear()} WorkVerse. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#" className="hover:underline">Điều khoản</a>
            <a href="#" className="hover:underline">Chính sách bảo mật</a>
            <a href="#" className="hover:underline">Liên hệ</a>
            <a href="#" className="hover:underline">Hỗ trợ khách hàng</a>
            <a href="#" className="hover:underline">Câu hỏi thường gặp</a>
            <a href="#" className="hover:underline">Quy chế hoạt động</a>
            <a href="#" className="hover:underline">Thông tin tuyển dụng</a>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Địa chỉ: Tầng 10, Tòa nhà ABC, Quận 1, TP. Hồ Chí Minh | Email: support@workverse.vn | Hotline: 1900 1234
        </div>
        <div className="text-xs text-gray-400">
          Mã số doanh nghiệp: 0123456789 | Ngày cấp: 01/01/2020 | Nơi cấp: Sở KHĐT TP.HCM
        </div>
      </div>
    </footer>
  );
}