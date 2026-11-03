import { initLineBookmark } from './line-bookmark.js';
import { cloud, cloudError } from '../../services/firebase.js';
import { clampNumber } from './model.js';
import { initPanels } from '../../ui/panels.js';
import { createToast } from '../../ui/toast.js';
import { createBookRepository } from '../../services/book-repository.js';
import { initEditor } from '../editor/editor.js';

export function initReader(book, storage) {
  const el = id => document.getElementById(id);
  let repository = createBookRepository(book, storage);
  let chapters = repository.getChapters();
  let remote = new Map(), serverReady = false, unsubscribe;
  let restoreBookmark = true, awaitingServerBookmark = true;
  function status(text) { el('syncStatus').textContent = text; }
  function watchBook() {
    unsubscribe?.(); serverReady = false; remote = new Map(); awaitingServerBookmark = true;
    const watchedId = book.id;
    status('Připojuji sdílenou knihovnu…');
    unsubscribe = cloud.watch(watchedId, (records, confirmed) => {
      if (book.id !== watchedId) return;
      serverReady = confirmed;
      remote = new Map(records.map(chapter => [chapter.id, chapter]));
      chapters = repository.getChapters().map(chapter => {
        const online = remote.get(chapter.id);
        return online ? { id: chapter.id, title: online.title, paragraphs: online.paragraphs } : chapter;
      });
      status(confirmed ? 'Sdílená knihovna připojena' : 'Místní kopie · čekám na server');
      if (confirmed && awaitingServerBookmark) { restoreBookmark = true; awaitingServerBookmark = false; }
      savePosition(); render();
    }, error => { if (book.id === watchedId) { serverReady = false; status(cloudError(error)); } });
  }
  const chapterKey = () => book.id === 'aetheria' ? 'chapter' : 'chapter-' + book.id;
  const legacyPage = clampNumber(storage.get('page', 1), 1, 16);
  let index = clampNumber(storage.get(chapterKey(), Math.min(2, Math.floor((legacyPage - 1) / 6))), 0, chapters.length - 1);
  let size = clampNumber(storage.get('size', 16), 13, 24, 16);
  const panels = initPanels(['contents', 'appearance'], el);
  const toast = createToast(el('toast'));
  const prose = el('prose');
  const lineBookmark = initLineBookmark({ prose, button: el('bookmark'), storage, getBookId: () => book.id, getChapter: () => chapters[index], toast });
  index = lineBookmark.chapterIndex(chapters, index);
  const positionKey = () => 'scroll-' + book.id + '-' + chapters[index].id;
  function progress() {
    const max = prose.scrollHeight - prose.clientHeight;
    el('progress').value = max > 0 ? Math.round(prose.scrollTop / max * 100) : 100;
  }
  function savePosition() { storage.set(positionKey(), prose.scrollTop); }
  function render() {
    const chapter = chapters[index];
    el('chapter').textContent = 'Kapitola ' + (index + 1);
    el('title').textContent = chapter.title;
    prose.replaceChildren(...chapter.paragraphs.map(text => {
      const p = document.createElement('p'); p.textContent = text; return p;
    }));
    el('counter').textContent = (index + 1) + ' / ' + chapters.length;
    el('previous').disabled = index === 0;
    el('next').disabled = index === chapters.length - 1;
    el('chapterList').replaceChildren(...chapters.map((chapter, i) => {
      const button = document.createElement('button');
      button.textContent = (i + 1) + ' · ' + chapter.title;
      if (i === index) button.setAttribute('aria-current', 'true');
      button.addEventListener('click', () => { go(i); panels.close(); });
      return button;
    }));
    const position = Math.max(0, Number(storage.get(positionKey(), 0)) || 0);
    prose.scrollTop = position;
    lineBookmark.draw(restoreBookmark); restoreBookmark = false;
    progress();
  }
  function go(next) {
    savePosition(); lineBookmark.reset(); restoreBookmark = false;
    index = clampNumber(next, 0, chapters.length - 1);
    storage.set(chapterKey(), index);
    render();
  }
  let scrollTimer;
  prose.addEventListener('scroll', () => {
    progress(); clearTimeout(scrollTimer);
    scrollTimer = setTimeout(savePosition, 180);
  }, { passive: true });
  window.addEventListener('pagehide', savePosition);
  new ResizeObserver(progress).observe(prose);
  el('previous').addEventListener('click', () => go(index - 1));
  el('next').addEventListener('click', () => go(index + 1));

  function setSize(delta) {
    size = clampNumber(size + delta, 13, 24, 16);
    prose.style.fontSize = size + 'px'; storage.set('size', size); lineBookmark.draw(); progress();
  }
  el('smaller').addEventListener('click', () => setSize(-1));
  el('larger').addEventListener('click', () => setSize(1));
  function mark() { lineBookmark.refreshState(); }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') panels.close();
    if (document.querySelector('.reader').dataset.view !== 'reader' || document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, button, textarea, select, [contenteditable]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); go(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  initEditor({
    getChapter: () => chapters[index],
    storage,
    getDraftKey: () => 'draft-' + book.id + '-' + chapters[index].id,
    getEditContext() {
      if (!serverReady) throw new Error('Nejdříve je nutné načíst aktuální stav z Firebase. Zkontrolujte připojení a pravidla Firestore.');
      return { bookId: book.id, chapterId: chapters[index].id, revision: remote.get(chapters[index].id)?.revision || 0 };
    },
    async saveChapter(title, paragraphs, context) {
      if (context.bookId !== book.id || context.chapterId !== chapters[index].id) throw new Error('Otevřená kapitola se změnila. Text zůstává v konceptu.');
      const revision = await cloud.save(context.bookId, context.chapterId, title, paragraphs, context.revision);
      remote.set(context.chapterId, { title, paragraphs, revision });
      const localSaved = repository.update(index, title, paragraphs);
      chapters[index] = { ...chapters[index], title, paragraphs };
      render();
      status('Uloženo na Firebase · dostupné na všech zařízeních');
      toast(localSaved ? 'Kapitola uložena na serveru' : 'Uloženo na serveru; místní záloha není dostupná');
    },
  });
  document.querySelector('.book').textContent = book.title;
  setSize(0); render(); mark(); watchBook();
  return {
    closePanels: panels.close,
    savePosition,
    openBook(nextBook) {
      clearTimeout(scrollTimer); savePosition();
      book = nextBook;
      repository = createBookRepository(book, storage);
      chapters = repository.getChapters();
      index = clampNumber(storage.get(chapterKey(), 0), 0, chapters.length - 1);
      index = lineBookmark.chapterIndex(chapters, index);
      restoreBookmark = true; lineBookmark.reset();
      document.querySelector('.book').textContent = book.title;
      render(); mark(); watchBook();
    },
  };
}
