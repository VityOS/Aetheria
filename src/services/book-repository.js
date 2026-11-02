function validChapter(chapter) {
  return chapter && typeof chapter.id === 'string' && typeof chapter.title === 'string' && chapter.title.trim() &&
    Array.isArray(chapter.paragraphs) && chapter.paragraphs.length > 0 && chapter.paragraphs.every(p => typeof p === 'string');
}
function readChapters(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(validChapter) : [];
  } catch { return []; }
}
export function createBookRepository(book, storage) {
  const key = 'book-' + book.id;
  const backupKey = key + '-backup';
  const raw = storage.get(key, 'null');
  const saved = readChapters(raw);
  const recovered = saved.length ? saved : readChapters(storage.get(backupKey, 'null'));
  // Změna výchozího katalogu nesmí zahodit již napsaný obsah.
  const chaptersById = new Map(recovered.map(chapter => [chapter.id, chapter]));
  let chapters = book.chapters.map(chapter => structuredClone(chaptersById.get(chapter.id) || chapter));
  const defaultIds = new Set(book.chapters.map(chapter => chapter.id));
  chapters.push(...structuredClone(recovered.filter(chapter => !defaultIds.has(chapter.id))));
  return {
    getChapters: () => structuredClone(chapters),
    update(index, title, paragraphs) {
      if (!chapters[index] || typeof title !== 'string' || !title.trim() || !Array.isArray(paragraphs) || !paragraphs.length || paragraphs.some(p => typeof p !== 'string')) return false;
      const next = structuredClone(chapters);
      next[index] = { ...next[index], title: title.trim(), paragraphs: [...paragraphs] };
      if (!storage.set(backupKey, JSON.stringify(chapters))) return false;
      const serialized = JSON.stringify(next);
      if (!storage.set(key, serialized) || storage.get(key) !== serialized) return false;
      chapters = next;
      return true;
    },
  };
}
