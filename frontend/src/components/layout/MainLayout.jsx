import { useLayoutEffect } from 'react';
import Header from './headers/Header';
import Footer from './footers/Footer';
import Sidebar from './sidebars/sidebar';
import { LAYOUT } from '../../utils/emun/Enum';
import AIChatWidget from '../common/AIChat/AIChatWidget';

/**
 * Layout tổng quản lý header, sidebar, footer.
 */
export default function MainLayout({ children, role = 'guest', hasSidebar = false }) {
  useLayoutEffect(() => {
    // Ngăn browser tự động restore scroll khi reload/F5
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // Scroll lên đầu ngay khi mount
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // Xử lý trường hợp bfcache (Safari/Firefox)
    const onPageShow = (e) => {
      if (e.persisted) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);



  // Normalize role: accept numeric RoleId (1/2/3/4 or string) or role name ('admin','staff','employer','employee')
  const normalizedRole = (() => {
    if (role === null || role === undefined) return 'guest';
    // If role is a number or numeric string, map to role name
    const n = Number(role);
    if (!Number.isNaN(n) && n > 0) {
      switch (n) {
        case 1:
          return 'admin';
        case 2:
          return 'staff';
        case 3:
          return 'employer';
        case 4:
          return 'employee';
        default:
          return 'guest';
      }
    }
    // otherwise accept existing string role (keep compatibility)
    return String(role).toLowerCase();
  })();

  return (
    <div className="bg-[#eaf2fb] min-h-screen">
      <Header role={normalizedRole} />
      <div>{/* wrapper (kept minimal) */}</div>

      {/* Layout: centered container so sidebar sits near main content; apply header offset to wrapper */}
      <div className="max-w-6xl mx-auto md:flex md:items-start md:gap-6" style={{ paddingTop: LAYOUT.HEADER_HEIGHT + 10 }}>
        {hasSidebar && <Sidebar role={normalizedRole} />}

        <main
          className="relative px-4 py-6 md:px-6 md:py-8 flex-1"
          style={{
            minHeight: '100vh',
          }}
        >
          <div className="w-full h-full">
            <div>
              {children}
            </div>
          </div>
        </main>
      </div>

      <Footer />
      <AIChatWidget />
    </div>
  );
}