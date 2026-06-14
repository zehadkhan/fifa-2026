import { useState, useEffect } from 'react';

export function useBreakpoint() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return {
    isMobile: w < 768,
    isTablet: w >= 768 && w < 1080,
    isDesktop: w >= 1080,
    width: w,
  };
}
