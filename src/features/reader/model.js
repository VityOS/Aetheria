export function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.trunc(number))) : fallback;
}
export function parseParagraphs(text) {
  return text.replace(/\r\n?/g, '\n').trim().split(/\n[\t ]*\n+/).map(text => text.trim()).filter(Boolean);
}
