export function readLineBookmark(storage, bookId) {
  try {
    const value = JSON.parse(storage.get('line-bookmark-' + bookId, 'null'));
    return value && typeof value.chapterId === 'string' && Number.isInteger(value.paragraph) && value.paragraph >= 0 && Number.isInteger(value.offset) && value.offset >= 0 ? value : null;
  } catch { return null; }
}
export function resolveBookmark(anchor, paragraphs) {
  if (!anchor) return null;
  const paragraph = paragraphs[anchor.paragraph];
  if (typeof paragraph === 'string' && (!anchor.quote || paragraph.slice(anchor.offset, anchor.offset + anchor.quote.length) === anchor.quote)) return { paragraph: anchor.paragraph, offset: Math.min(anchor.offset, paragraph.length) };
  if (anchor.quote) {
    for (let index = 0; index < paragraphs.length; index++) {
      const offset = paragraphs[index].indexOf(anchor.quote);
      if (offset >= 0) return { paragraph: index, offset };
    }
  }
  return null;
}
export function initLineBookmark({ prose, button, storage, getBookId, getChapter, toast }) {
  let choosing = false, marker, pendingFrame, pendingRestore = false;
  const key = () => 'line-bookmark-' + getBookId();
  const anchor = () => readLineBookmark(storage, getBookId());
  function refreshState() {
    const saved = Boolean(anchor());
    button.classList.toggle('active', choosing || saved);
    button.setAttribute('aria-pressed', String(choosing || saved));
    const label = choosing ? 'Zrušit výběr řádku' : saved ? 'Odebrat záložku' : 'Označit řádek záložkou';
    button.setAttribute('aria-label', label); button.title = label;
    prose.classList.toggle('choosing-bookmark', choosing);
  }
  function rectAt(node, offset) {
    const range = document.createRange();
    const start = Math.max(0, Math.min(offset, Math.max(0, node.length - 1)));
    range.setStart(node, start); range.setEnd(node, Math.min(node.length, start + 1));
    return range.getBoundingClientRect();
  }
  function draw(restore = false) {
    pendingRestore ||= restore;
    cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(() => {
      const restorePosition = pendingRestore; pendingRestore = false;
      marker?.remove(); marker = null;
      const saved = anchor(), chapter = getChapter();
      if (!saved || saved.chapterId !== chapter.id) return;
      const location = resolveBookmark(saved, chapter.paragraphs);
      if (!location) { if (restorePosition) toast('Označený text se změnil. Vyberte prosím nový řádek.'); return; }
      const paragraph = prose.querySelectorAll(':scope > p')[location.paragraph];
      const node = paragraph?.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE || !node.length) return;
      const rect = rectAt(node, location.offset), paragraphRect = paragraph.getBoundingClientRect();
      marker = document.createElement('button'); marker.type = 'button'; marker.className = 'line-bookmark-dot';
      marker.setAttribute('aria-label', 'Odebrat záložku tohoto řádku'); marker.title = 'Odebrat záložku';
      marker.style.top = rect.top - paragraphRect.top + rect.height / 2 + 'px';
      marker.addEventListener('click', event => {
        event.stopPropagation();
        if (!storage.set(key(), 'null')) { toast('Záložku se nepodařilo odstranit.'); return; }
        marker.remove(); marker = null; refreshState(); toast('Záložka odebrána');
      });
      paragraph.append(marker);
      if (restorePosition) prose.scrollTop += rect.top - prose.getBoundingClientRect().top - 20;
    });
  }
  button.addEventListener('click', () => {
    if (anchor()) {
      if (!storage.set(key(), 'null')) { toast('Záložku se nepodařilo odstranit.'); return; }
      choosing = false; pendingRestore = false;
      marker?.remove(); marker = null;
      refreshState(); toast('Záložka odebrána'); return;
    }
    choosing = !choosing; refreshState();
    if (choosing) toast('Klepněte na řádek, kde jste skončili.');
  });
  prose.addEventListener('click', event => {
    if (!choosing || event.target.closest('button')) return;
    const paragraph = event.target.closest('p');
    if (!paragraph || paragraph.parentElement !== prose) return;
    const node = paragraph.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE || !node.length) return;
    // Najdeme začátek vizuálního řádku podle skutečného rozložení textu.
    const lineHeight = parseFloat(getComputedStyle(paragraph).lineHeight);
    const y = event.clientY;
    let low = 0, high = node.length - 1;
    while (low < high) {
      const middle = Math.floor((low + high) / 2), rect = rectAt(node, middle);
      if (rect.bottom < y) low = middle + 1; else high = middle;
    }
    const hit = rectAt(node, low);
    if (Math.abs(hit.top + hit.height / 2 - y) > lineHeight) return;
    const top = hit.top;
    high = low; low = 0;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (rectAt(node, middle).top < top - 1) low = middle + 1; else high = middle;
    }
    const index = [...prose.querySelectorAll(':scope > p')].indexOf(paragraph);
    const saved = { chapterId: getChapter().id, paragraph: index, offset: low, quote: node.textContent.slice(low, low + 64) };
    if (!storage.set(key(), JSON.stringify(saved))) { toast('Záložku se nepodařilo uložit.'); return; }
    choosing = false; refreshState(); draw(); toast('Řádek označen. Při otevření knihy se sem vrátíte.');
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && choosing) { choosing = false; refreshState(); } });
  new ResizeObserver(() => draw()).observe(prose);
  return {
    draw, refreshState,
    reset() { choosing = false; refreshState(); },
    chapterIndex(chapters, fallback) { const saved = anchor(); const found = chapters.findIndex(chapter => chapter.id === saved?.chapterId); return found >= 0 ? found : fallback; },
  };
}
