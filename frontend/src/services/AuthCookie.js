// Simple cookie helpers for auth data (non-HttpOnly so client-side can read).
// If you want HttpOnly cookies set by server, switch flows accordingly.
const COOKIE_PATH = '/';

export function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=${COOKIE_PATH}; SameSite=Lax`;
}

export function getCookie(name) {
  const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; Path=${COOKIE_PATH};`;
}

export default { setCookie, getCookie, deleteCookie };
