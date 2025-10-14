// Utility helpers for date formatting used across the frontend
export function formatDateToDDMMYYYY(input) {
  if (!input) return '';
  // Accept Date object or ISO-like string (YYYY-MM-DD or full ISO)
  let d;
  if (input instanceof Date) {
    d = input;
  } else if (typeof input === 'string') {
    // If string like 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm:ssZ'
    const iso = input.split('T')[0];
    const parts = iso.split('-');
    if (parts.length === 3) {
      // parts: [YYYY, MM, DD]
      const [y, m, day] = parts;
      // guard numbers
      if (!y || !m || !day) return '';
      return `${day.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    // fallback try Date parse
    const parsed = new Date(input);
    if (isNaN(parsed)) return '';
    d = parsed;
  } else {
    return '';
  }

  const day = `${d.getDate()}`.padStart(2, '0');
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Convert dd/mm/yyyy -> YYYY-MM-DD (useful if you ever need to parse user-entered display dates)
export function parseDDMMYYYYToISO(value) {
  if (!value || typeof value !== 'string') return null;
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(p => p.trim());
  if (!day || !month || !year) return null;
  // Basic validation
  const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default formatDateToDDMMYYYY;
