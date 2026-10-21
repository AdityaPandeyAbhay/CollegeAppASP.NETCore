import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * useDashboardScroll
 * 
 * Custom hook to manage specialized scrolling behavior across all dashboards:
 * 1. When scrolling directly on the sidebar (scrollbar/menu): only the sidebar scrolls independently (overscroll contained).
 * 2. When scrolling on the main page/content: the main page scrolls normally.
 * 3. When page content ends (footer boundary reached): scrolling continues by scrolling the sidebar down to its end FIRST.
 * 4. When sidebar reaches its bottom (end): continuing to scroll reveals the footer smoothly from the bottom.
 * 5. When scrolling up from the footer: the footer tucks away first, immediately resuming page/sidebar scrolling upward.
 */
export function useDashboardScroll() {
  const location = useLocation();

  useEffect(() => {
    const rawPath = (location.pathname || "").toLowerCase().trim();
    const isDashboard = rawPath.startsWith("/dashboard");

    if (!isDashboard) return;

    const handleWheel = (e) => {
      // Only apply on desktop/tablet where sidebar is sticky (> 700px)
      if (window.innerWidth <= 700) return;

      const sidebar = document.querySelector(".dashboard-sidebar");
      const footer =
        document.querySelector(".dashboard-footer-wrapper") ||
        document.querySelector(".footer");

      if (!sidebar) return;

      // 1. If cursor is directly over the sidebar, let native sidebar scrolling handle it
      if (sidebar.contains(e.target)) {
        return;
      }

      // 2. User is scrolling outside the sidebar (on main dashboard content/page)
      const delta = e.deltaY;
      if (Math.abs(delta) < 0.1) return;

      const maxSidebarScroll = Math.max(
        0,
        sidebar.scrollHeight - sidebar.clientHeight,
      );
      const isSidebarScrollable = maxSidebarScroll > 2;

      const footerRect = footer ? footer.getBoundingClientRect() : null;
      const viewportHeight = window.innerHeight;

      // Scrolling DOWN (delta > 0)
      if (delta > 0) {
        // Check if page content has reached the bottom (footer is at or near viewport bottom)
        const isPageAtBottom = footerRect
          ? footerRect.top <= viewportHeight + 4
          : window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 4;
        const canSidebarScrollDown =
          isSidebarScrollable && maxSidebarScroll - sidebar.scrollTop > 2;

        if (isPageAtBottom && canSidebarScrollDown) {
          // Page reached bottom, but sidebar still has items below -> scroll sidebar first!
          e.preventDefault();
          sidebar.scrollTop = Math.min(
            maxSidebarScroll,
            sidebar.scrollTop + delta,
          );
        }
        // If sidebar reached bottom or cannot scroll further, natural window scroll allows footer to come into view
      }
      // Scrolling UP (delta < 0)
      else if (delta < 0) {
        // Check if footer is currently in view
        const isFooterInView =
          footerRect && footerRect.top < viewportHeight - 2;

        if (isFooterInView) {
          // Let window scroll naturally so footer scrolls down out of view first
          return;
        }

        // Once footer is out of view, if window is at the top of dashboard and sidebar was scrolled down,
        // scrolling up on page scrolls sidebar up smoothly
        const isWindowAtTop = window.scrollY <= 2;
        const canSidebarScrollUp = isSidebarScrollable && sidebar.scrollTop > 2;

        if (isWindowAtTop && canSidebarScrollUp) {
          e.preventDefault();
          sidebar.scrollTop = Math.max(0, sidebar.scrollTop + delta);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [location.pathname]);
}

export default useDashboardScroll;

