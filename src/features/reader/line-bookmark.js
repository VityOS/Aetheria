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
  let candidates = [], generation = 0, collapsing = false, scrollFrame;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
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
  function clearCandidates() {
    generation++;
    candidates.forEach(({ dot }) => { dot.getAnimations().forEach(animation => animation.cancel()); dot.remove(); });
    candidates = []; collapsing = false;
  }
  function makeDot(paragraph, rect, className, label) {
    const dot = document.createElement('button'); dot.type = 'button'; dot.className = 'line-bookmark-dot ' + className;
    dot.setAttribute('aria-label', label); dot.title = label;
    dot.style.top = rect.top - paragraph.getBoundingClientRect().top + rect.height / 2 + 'px';
    paragraph.append(dot); return dot;
  }
  async function selectLine(candidate) {
    if (!choosing || collapsing) return;
    const { paragraph, offset, dot } = candidate;
    const chapter = getChapter();
    const saved = { chapterId: chapter.id, paragraph, offset, quote: chapter.paragraphs[paragraph].slice(offset, offset + 64) };
    if (!storage.set(key(), JSON.stringify(saved))) { toast('Záložku se nepodařilo uložit.'); return; }
    collapsing = true; choosing = false; refreshState();
    const version = generation;
    candidates.forEach(({ dot }) => dot.getAnimations().forEach(animation => animation.cancel()));
    dot.classList.add('is-selected');
    const target = dot.getBoundingClientRect();
    await Promise.all(candidates.filter(item => item !== candidate).map(({ dot }, index) => {
      dot.disabled = true;
      const rect = dot.getBoundingClientRect();
      const animation = dot.animate([
        { transform: 'translateY(-50%) scale(1)', opacity: .5 },
        { transform: 'translate(' + (target.left - rect.left) + 'px, calc(-50% + ' + (target.top - rect.top) + 'px)) scale(.15)', opacity: 0 },
      ], { duration: reduced.matches ? 1 : 380, delay: reduced.matches ? 0 : Math.min(index * 10, 180), easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
      return animation.finished.catch(() => {});
    }));
    if (version !== generation) return;
    clearCandidates(); draw(); toast('Řádek označen. Při otevření knihy se sem vrátíte.');
  }
  function showCandidates(animate = true) {
    if (!choosing || collapsing) return;
    clearCandidates();
    const viewport = prose.getBoundingClientRect();
    const paragraphs = [...prose.querySelectorAll(':scope > p')];
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const paragraphRect = paragraph.getBoundingClientRect();
      if (paragraphRect.bottom < viewport.top - 80 || paragraphRect.top > viewport.bottom + 80) return;
      const node = paragraph.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE || !node.length) return;
      let offset = 0;
      while (offset < node.length) {
        const rect = rectAt(node, offset);
        if (rect.top > viewport.bottom + 80) break;
        if (rect.height && rect.bottom >= viewport.top - 80) {
          const dot = makeDot(paragraph, rect, 'line-bookmark-choice', 'Označit tento řádek záložkou');
          const candidate = { dot, paragraph: paragraphIndex, offset };
          dot.addEventListener('click', event => { event.stopPropagation(); selectLine(candidate); });
          candidates.push(candidate);
        }
        // Přeskočení na další vizuální řádek bez procházení každého znaku.
        let low = offset + 1, high = node.length;
        while (low < high) {
          const middle = Math.floor((low + high) / 2);
          if (rectAt(node, middle).top <= rect.top + 1) low = middle + 1; else high = middle;
        }
        offset = low;
      }
    });
    if (animate && !reduced.matches) candidates.forEach(({ dot }, index) => {
      dot.animate([
        { transform: 'translateY(calc(-50% - 24px)) scale(.2)', opacity: 0 },
        { transform: 'translateY(-50%) scale(1)', opacity: .5 },
      ], { duration: 280, delay: Math.min(index * 26, 650), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    });
  }
  function draw(restore = false) {
    pendingRestore ||= restore; cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(() => {
      const restorePosition = pendingRestore; pendingRestore = false;
      marker?.remove(); marker = null;
      if (choosing) { showCandidates(); return; }
      if (collapsing) return;
      const saved = anchor(), chapter = getChapter();
      if (!saved || saved.chapterId !== chapter.id) return;
      const location = resolveBookmark(saved, chapter.paragraphs);
      if (!location) { if (restorePosition) toast('Označený text se změnil. Vyberte prosím nový řádek.'); return; }
      const paragraph = prose.querySelectorAll(':scope > p')[location.paragraph], node = paragraph?.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE || !node.length) return;
      const rect = rectAt(node, location.offset);
      marker = makeDot(paragraph, rect, '', 'Odebrat záložku tohoto řádku');
      marker.addEventListener('click', event => { event.stopPropagation(); remove(); });
      if (restorePosition) prose.scrollTop += rect.top - prose.getBoundingClientRect().top - 20;
    });
  }
  function remove() {
    if (!storage.set(key(), 'null')) { toast('Záložku se nepodařilo odstranit.'); return; }
    choosing = false; pendingRestore = false; clearCandidates(); marker?.remove(); marker = null;
    refreshState(); toast('Záložka odebrána');
  }
  button.addEventListener('click', () => {
    if (anchor()) { remove(); return; }
    choosing = !choosing; clearCandidates(); refreshState();
    if (choosing) { showCandidates(); toast('Vyberte kolečko vlevo u řádku.'); }
  });
  prose.addEventListener('scroll', () => {
    if (!choosing || collapsing) return;
    cancelAnimationFrame(scrollFrame); scrollFrame = requestAnimationFrame(() => showCandidates(false));
  }, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && choosing) { choosing = false; clearCandidates(); refreshState(); }
  });
  new ResizeObserver(() => { if (collapsing) clearCandidates(); draw(); }).observe(prose);
  return {
    draw, refreshState,
    reset() { choosing = false; clearCandidates(); refreshState(); },
    chapterIndex(chapters, fallback) { const saved = anchor(); const found = chapters.findIndex(chapter => chapter.id === saved?.chapterId); return found >= 0 ? found : fallback; },
  };
}
