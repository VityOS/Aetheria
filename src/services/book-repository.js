export function createBookRepository(book, storage) {
  const key = 'book-' + book.id;
  let chapters = structuredClone(book.chapters);
  try {
    const saved = JSON.parse(storage.get(key, 'null'));
    if (Array.isArray(saved) && saved.length === chapters.length && saved.every((c, i) =>
      c.id === chapters[i].id && typeof c.title === 'string' && c.title.trim() &&
      Array.isArray(c.paragraphs) && c.paragraphs.length && c.paragraphs.every(p => typeof p === 'string')
    )) chapters = saved;
  } catch { /* Poškozený obsah nahradí výchozí kniha. */ }
  return {
    getChapters: () => structuredClone(chapters),
    update(index, title, paragraphs) {
      if (!chapters[index] || !title.trim() || !paragraphs.length) return false;
      const next = structuredClone(chapters);
      next[index] = { ...next[index], title: title.trim(), paragraphs: [...paragraphs] };
      if (!storage.set(key, JSON.stringify(next))) return false;
      chapters = next;
      return true;
    },
  };
}
