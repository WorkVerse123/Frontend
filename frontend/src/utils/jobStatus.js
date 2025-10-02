export function normalizeStatus(raw) {
  if (!raw && raw !== 0) return '';
  try {
    const s = String(raw).trim().toLowerCase();
    if (s === 'open' || s === 'o' || s === '1' || s === 'true' || s === 'active') return 'open';
    if (s === 'closed' || s === 'close' || s === 'c' || s === '0' || s === 'false' || s === 'inactive') return 'closed';
    return s; // fallback: return normalized lower string
  } catch (e) {
    return '';
  }
}

export function isJobOpen(job) {
  if (!job) return false;
  const raw = job.jobStatus ?? job.status ?? job.job_status ?? '';
  return normalizeStatus(raw) === 'open';
}

export function displayStatus(raw) {
  const n = normalizeStatus(raw);
  if (n === 'open') return 'Open';
  if (n === 'closed') return 'Close';
  // Capitalize first letter of fallback
  if (!raw) return '';
  const s = String(raw);
  return s.charAt(0).toUpperCase() + s.slice(1);
}
