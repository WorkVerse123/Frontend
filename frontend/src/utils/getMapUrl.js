// Utility to return the best map URL for a given location string.
// It prefers native map schemes on mobile (geo:, maps://) and falls back to Google Maps web.
export default function getMapUrl(location) {
  if (!location) return '';
  try {
    const encoded = encodeURIComponent(location);
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      const isAndroid = /Android/i.test(ua);
      const isiOS = /iPhone|iPad|iPod/i.test(ua);
      if (isAndroid) return `geo:0,0?q=${encoded}`;
      if (isiOS) return `maps://?q=${encoded}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  } catch (e) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }
}
