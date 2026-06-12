export function formatDateTime(date) {
  if (!date) return '—';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPrice(amount) {
  return `GHS ${Number(amount || 0).toLocaleString()}`;
}

export function formatDateInput(date) {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isSameDay(date, dateString) {
  if (!date || !dateString) return true;

  return formatDateInput(date) === dateString;
}
