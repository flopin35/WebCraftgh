import { useEffect } from 'react';

const loaded = new Set();

function familyParam(name) {
  return `family=${name.replace(/ /g, '+')}:wght@400;500;600;700;800`;
}

/** Load the heading + body fonts of one or more approved pairings from Google Fonts (once each). */
export function useGoogleFonts(pairings) {
  const key = pairings.map((p) => `${p.heading}|${p.body}`).join(',');
  useEffect(() => {
    const families = [...new Set(pairings.flatMap((p) => [p.heading, p.body]))].filter((name) => !loaded.has(name));
    if (!families.length || typeof document === 'undefined') return;
    families.forEach((name) => loaded.add(name));
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families.map(familyParam).join('&')}&display=swap`;
    document.head.appendChild(link);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
