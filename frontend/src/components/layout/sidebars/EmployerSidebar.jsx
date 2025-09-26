// START: EmployerSidebar.jsx
export default function EmployerSidebar({ mobile }) {
  return (
    <nav className={`flex flex-col gap-4 ${mobile ? 'mt-8' : ''}`}>
      <a href="#" className={`text-[#2563eb] font-semibold hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Tổng quan</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Tin tuyển dụng của tôi</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Ứng viên đã lưu</a>
      <a href="#" className={`text-gray-700 hover:underline ${mobile ? 'text-lg py-2 w-full text-center' : ''}`}>Gói dịch vụ và thanh toán</a>
      </nav>
  );
}
// END: EmployerSidebar.jsx