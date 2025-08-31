import { useEffect, useRef, useLayoutEffect } from 'react';
import Header from './headers/Header';
import Footer from './footers/Footer';
import Sidebar from './sidebars/sidebar';
import { LAYOUT } from '../../utils/emun/Enum';

/**
 * Layout tổng quản lý header, sidebar, footer.
 */
export default function MainLayout({ children, role = 'guest', hasSidebar = true }) {
  const rafRef = useRef(null);
  const tickingRef = useRef(false);

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



  useEffect(() => {
    // chỉ chạy trên desktop
    if (window.innerWidth < 768) return;

    const footer = document.querySelector('footer');
    if (!footer) return;

    let aside = document.querySelector('aside');

    // tìm aside nếu mount muộn
    const tryFindAside = (attempts = 8) => {
      if (aside) return aside;
      for (let i = 0; i < attempts; i += 1) {
        aside = document.querySelector('aside');
        if (aside) break;
      }
      return aside;
    };
    aside = tryFindAside();

    // retry once if still null (mount timing)
    if (!aside) {
      const id = setInterval(() => {
        aside = document.querySelector('aside');
        if (aside) clearInterval(id);
      }, 150);
    }

    const gap = 8; // khoảng cách giữa sidebar và footer khi dịch lên
    let latestVisible = 0;

    const prepareAside = (el) => {
      if (!el) return;
      el.style.willChange = 'transform';
      // remove any transition to make updates immediate
      el.style.transition = 'none';
    };

    const updateTransform = () => {
      if (!aside || !footer) return;
      const fRect = footer.getBoundingClientRect();
      // visible px of footer inside viewport
      const visible = Math.max(0, Math.min(fRect.height, window.innerHeight - fRect.top));
      if (visible === latestVisible) return;
      latestVisible = visible;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!aside) return;
        if (visible > 0) {
          aside.style.transform = `translateY(-${visible + 65}px)`;
        } else {
          aside.style.transform = '';
        }
      });
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      // schedule read+write in rAF
      rafRef.current = requestAnimationFrame(() => {
        tickingRef.current = false;
        updateTransform();
      });
    };

    // ensure aside prepared
    if (aside) prepareAside(aside);
    // initial update
    updateTransform();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (aside) {
        aside.style.transform = '';
        aside.style.transition = '';
        aside.style.willChange = '';
      }
    };
  }, []);



  return (
    <div className="bg-[#eaf2fb] min-h-screen">
      <Header role={role} />
      <div>{/* wrapper (kept minimal) */}</div>
      {hasSidebar && <Sidebar role={role} />}
      <main
        className="relative px-4 py-4 md:px-6 md:py-8"
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
          <div
            className={hasSidebar ? "hidden md:block" : ""}
            style={hasSidebar ? {
              marginLeft: `${LAYOUT.SIDEBAR_WIDTH}px`,
              marginTop: `${LAYOUT.HEADER_HEIGHT}px`,
              minHeight: `calc(100vh - ${LAYOUT.HEADER_HEIGHT}px)`,
            } : {}}
          >
            {children}
          </div>
          {/* <div className="block md:hidden">
            {children}
          </div> */}
        </div>
      </main>
      <Footer />
    </div>
  );
}