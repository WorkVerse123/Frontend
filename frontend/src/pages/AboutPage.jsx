import MainLayout from '../components/layout/MainLayout';

export default function AboutPage() {
  return (
    <MainLayout>
      <section className="max-w-4xl mx-auto py-12 px-6 bg-white rounded-xl shadow-lg mt-8">
        <h1 className="text-3xl font-bold text-[#042852] mb-6">Giới thiệu về WorkVerse</h1>
        <p className="text-lg text-gray-700 mb-4">
          WorkVerse là nền tảng kết nối ứng viên và nhà tuyển dụng hiện đại, giúp bạn tìm kiếm việc làm, quản lý hồ sơ, và phát triển sự nghiệp một cách dễ dàng.
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li>Hệ thống quản lý ứng viên và nhà tuyển dụng thông minh</li>
          <li>Giao diện thân thiện, dễ sử dụng trên mọi thiết bị</li>
          <li>Hỗ trợ đăng tin tuyển dụng, tìm kiếm việc làm, quản lý hồ sơ</li>
          <li>Bảo mật thông tin cá nhân và doanh nghiệp</li>
          <li>Chính sách hỗ trợ khách hàng tận tâm</li>
        </ul>
        <p className="text-gray-700 mb-2">
          Đội ngũ WorkVerse cam kết mang đến trải nghiệm tốt nhất cho người dùng, đồng hành cùng bạn trên hành trình phát triển sự nghiệp và kinh doanh.
        </p>
        <p className="text-gray-700">
          Mọi thắc mắc hoặc góp ý, vui lòng liên hệ qua email:
        </p>
        <div className="my-2">
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=workversecompany@gmail.com"
            className="block w-fit bg-[#2563eb] text-white font-semibold text-lg px-4 py-2 rounded shadow hover:bg-[#174ea6] transition-colors duration-150"
            target="_blank"
            rel="noopener noreferrer"
          >
            workversecompany@gmail.com
          </a>
        </div>
        <p className="text-gray-700">
          hoặc số điện thoại: <span className="font-semibold">0383109716</span>.
        </p>
      </section>
    </MainLayout>
  );
}
