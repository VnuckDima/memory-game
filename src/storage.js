const STORAGE_KEY = 'memory-game:results:v1';
export const MAX_RESULTS = 10;

function isValidEntry(entry) {
  return (
    entry &&
    typeof entry === 'object' &&
    Number.isFinite(entry.moves) &&
    typeof entry.finishedAt === 'string' &&
    !Number.isNaN(Date.parse(entry.finishedAt))
  );
}

export function loadResults() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidEntry) : [];
  } catch {
    return [];
  }
}

export function sortResults(results) {
  return [...results].sort(
    (a, b) => a.moves - b.moves || Date.parse(a.finishedAt) - Date.parse(b.finishedAt),
  );
}

export function getTopResults() {
  return sortResults(loadResults()).slice(0, MAX_RESULTS);
}

export function saveResult(moves) {
  const entry = { moves, finishedAt: new Date().toISOString() };
  const top = sortResults([...loadResults(), entry]).slice(0, MAX_RESULTS);
  const place = top.findIndex((item) => item === entry) + 1;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(top));
  } catch {
    return { top, place };
  }

  return { top, place };
}

export function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${pad(date.getFullYear())}`;
}
