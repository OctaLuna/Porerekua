import { useEffect, type FC } from 'react';

const FAVICON_LINK_ID = 'app-favicon';

const syncFavicon = (isDark: boolean) => {
  const favicon = document.getElementById(FAVICON_LINK_ID);
  if (!(favicon instanceof HTMLLinkElement)) {
    return;
  }

  const fileName = isDark ? 'favicon-dark.svg' : 'favicon.svg';
  favicon.href = `${import.meta.env.BASE_URL}${fileName}`;
};

/** Keeps the tab icon aligned with the browser's color preference. */
const FaviconSync: FC = () => {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      syncFavicon(event.matches);
    };

    syncFavicon(mediaQuery.matches);
    mediaQuery.addEventListener('change', handlePreferenceChange);

    return () => mediaQuery.removeEventListener('change', handlePreferenceChange);
  }, []);

  return null;
};

export default FaviconSync;
