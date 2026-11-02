export function validateContent(data) {
  return data && typeof data.title === 'string' && data.title.trim().length > 0 && data.title.length <= 200 &&
    Array.isArray(data.paragraphs) && data.paragraphs.length > 0 && data.paragraphs.every(p => typeof p === 'string') &&
    Number.isInteger(data.revision) && data.revision > 0;
}
export function assertRevision(current, expected) {
  if (current !== expected) throw new Error('Kapitola byla změněna na jiném zařízení. Váš koncept zůstává uložený. Zavřete a znovu otevřete editor pro kontrolu aktuální verze.');
}
