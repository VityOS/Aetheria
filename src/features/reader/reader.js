import { clampNumber } from './model.js';
import { initPanels } from '../../ui/panels.js';
import { createToast } from '../../ui/toast.js';
import { createBookRepository } from '../../services/book-repository.js';
import { initEditor } from '../editor/editor.js';

export function initReader(book, storage) {
  const el = id => document.getElementById(id);
  let repository = createBookRepository(book, storage);
  let chapters = repository.getChapters();
  const chapterKey = () => book.id === 'aetheria' ? 'chapter' : 'chapter-' + book.id;
  const bookmarkKey = () => book.id === 'aetheria' ? 'bookmark' : 'bookmark-' + book.id;
  const legacyPage = clampNumber(storage.get('page', 1), 1, 16);
  let index = clampNumber(storage.get(chapterKey(), Math.min(2, Math.floor((legacyPage - 1) / 6))), 0, chapters.length - 1);
  let size = clampNumber(storage.get('size', 16), 13, 24, 16);
  let bookmarked = storage.get(bookmarkKey()) === 'true';
  const panels = initPanels(['contents', 'appearance'], el);
  const toast = createToast(el('toast'));
  const prose = el('prose');
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
    progress();
  }
  function go(next) {
    savePosition();
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
    prose.style.fontSize = size + 'px'; storage.set('size', size); progress();
  }
  el('smaller').addEventListener('click', () => setSize(-1));
  el('larger').addEventListener('click', () => setSize(1));
  function mark() {
    el('bookmark').classList.toggle('active', bookmarked);
    el('bookmark').setAttribute('aria-pressed', String(bookmarked));
    el('bookmark').setAttribute('aria-label', bookmarked ? 'Odebrat záložku' : 'Přidat záložku');
  }
  el('bookmark').addEventListener('click', () => {
    bookmarked = !bookmarked; storage.set(bookmarkKey(), bookmarked); mark();
    toast(bookmarked ? 'Záložka uložena' : 'Záložka odebrána');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') panels.close();
    if (document.querySelector('.reader').dataset.view !== 'reader' || document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, button, textarea, select, [contenteditable]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); go(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  initEditor({
    getChapter: () => chapters[index],
    saveChapter(title, paragraphs) {
      if (!repository.update(index, title, paragraphs)) return false;
      chapters = repository.getChapters(); render(); toast('Kapitola uložena'); return true;
    },
  });
  document.querySelector('.book').textContent = book.title;
  setSize(0); render(); mark();
  return {
    closePanels: panels.close,
    savePosition,
    openBook(nextBook) {
      clearTimeout(scrollTimer); savePosition();
      book = nextBook;
      repository = createBookRepository(book, storage);
      chapters = repository.getChapters();
      index = clampNumber(storage.get(chapterKey(), 0), 0, chapters.length - 1);
      bookmarked = storage.get(bookmarkKey()) === 'true';
      document.querySelector('.book').textContent = book.title;
      render(); mark();
    },
  };
}
