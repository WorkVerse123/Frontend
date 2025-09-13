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



  return (
    <div className="bg-[#eaf2fb] min-h-screen">
      <Header role={role} />
      <div>{/* wrapper (kept minimal) */}</div>

      {/* Layout: on md+ show sidebar in flow (no fixed), main becomes flex-1 */}
      <div className="md:flex">
        {hasSidebar && <Sidebar role={role} />}

        <main
          className="relative px-4 py-4 md:px-6 md:py-8 flex-1"
          style={{
            marginLeft: '0',
            marginTop: '0',
            marginBottom: '0',
            minHeight: '100vh',
            paddingTop: LAYOUT.HEADER_HEIGHT + 10,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              marginLeft: `0`,
              marginTop: `0`,
              marginBottom: `0`,
            }}
          >
            <div className="block">
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