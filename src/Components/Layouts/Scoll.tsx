import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/** Jump to the top on every page change (instant, so smooth-scroll CSS can't interrupt it). */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
