import Header from './headers/Header';
import Footer from './footers/Footer';
import Sidebar from './sidebars/sidebar';
import { LAYOUT } from '../../utils/emun/Enum';

/**
 * Layout tổng quản lý header, sidebar, footer.
 * @param {ReactNode} children - Nội dung trang
 * @param {string} role - Vai trò người dùng (guest, employee, employer, staff, admin)
 */
export default function MainLayout({ children, role = 'guest' }) {
  return (
    <div className="bg-[#eaf2fb] min-h-screen">
      <Header role={role} />
      <Sidebar role={role} />
      <main
        className="relative px-4 py-4 md:px-6 md:py-8"
        style={{
          marginLeft: '0',
          marginTop: '0',
          marginBottom: '0',
          minHeight: '100vh',
        }}
      >
        <div
          className="w-full h-full"
          style={{
            // Chỉ áp dụng margin cho desktop/laptop view
            marginLeft: `0`,
            marginTop: `0`,
            marginBottom: `0`,
          }}
        >
          <div
            className="hidden md:block"
            style={{
              marginLeft: `${LAYOUT.SIDEBAR_WIDTH}px`,
              marginTop: `${LAYOUT.HEADER_HEIGHT}px`,
             marginTop: `${LAYOUT.HEADER_HEIGHT}px`,
              minHeight: `calc(100vh - ${LAYOUT.HEADER_HEIGHT}px)`,
            }}
          >
            {children}
          </div>
          <div className="block md:hidden">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}