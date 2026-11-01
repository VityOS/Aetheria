import { createBottomNavigation } from '../../ui/bottom-navigation.js';
export function initLibrary(catalog, reader, storage) {
  const root = document.querySelector('.reader');
  const library = document.getElementById('library');
  const shelf = document.getElementById('bookshelf');
  const content = document.getElementById('readingContent');
  const back = document.getElementById('back');
  const controls = [...document.querySelectorAll('.toolbar button:not(.back)')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let busy = false;
  let selected = catalog.find(b => b.id === storage.get('selected-book')) || catalog[0];
  root.dataset.view = 'reader';
  let filter = 'all';
  const searchDialog = document.getElementById('librarySearchDialog');
  const searchInput = document.getElementById('librarySearch');
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('cs');
  function filterCards() {
    const query = normalize(searchInput.value.trim());
    let count = 0;
    for (const card of shelf.children) {
      const book = catalog.find(book => book.id === card.dataset.book);
      const saved = storage.get(book.id === 'aetheria' ? 'bookmark' : 'bookmark-' + book.id) === 'true';
      card.hidden = !(filter !== 'saved' || saved) || !normalize(book.title).includes(query);
      if (!card.hidden) count++;
    }
    document.getElementById('libraryEmpty').hidden = count !== 0;
    document.getElementById('libraryCounter').textContent = count ? '01 / ' + String(count).padStart(2, '0') : '00 / 00';
    shelf.scrollLeft = 0;
  }
  const navigation = createBottomNavigation({ container: root, anchor: back, reducedMotion: reduced, items: [
    { id: 'library', label: 'Knihovna', onSelect() { filter = 'all'; searchInput.value = ''; filterCards(); navigation.select('library'); } },
    { id: 'search', label: 'Hledat knihu', onSelect() { searchDialog.showModal(); } },
    { id: 'bookmarks', label: 'Knihy se záložkou', onSelect() { filter = 'saved'; searchInput.value = ''; filterCards(); navigation.select('bookmarks'); } },
    { id: 'reading', label: 'Pokračovat ve čtení', onSelect() { openBook(selected); } },
  ] });
  navigation.select('library');
  document.getElementById('librarySearchForm').addEventListener('submit', event => { event.preventDefault(); filter = 'all'; filterCards(); navigation.select('search'); searchDialog.close(); });
  document.getElementById('librarySearchCancel').addEventListener('click', () => searchDialog.close());
  async function animate(node, frames, duration, delay = 0) {
    const animation = node.animate(frames, { duration: reduced.matches ? 1 : duration, delay: reduced.matches ? 0 : delay, fill: 'forwards', easing: 'cubic-bezier(.22,.8,.25,1)' });
    await animation.finished;
    const final = frames[frames.length - 1];
    for (const [property, value] of Object.entries(final)) node.style[property] = value;
    animation.cancel();
  }
  function offsets() {
    const origin = back.getBoundingClientRect();
    return controls.map(button => origin.left - button.getBoundingClientRect().left);
  }
  function setControlsInert(value) { controls.forEach(button => button.inert = value); }
  function dockDrop() {
    const bottom = Math.max(24, parseFloat(getComputedStyle(root).paddingBottom) + 16);
    return root.clientHeight - bottom - 44 - (document.querySelector('.toolbar').offsetTop + back.offsetTop);
  }
  new ResizeObserver(() => {
    if (root.dataset.view === 'library' && !busy) back.style.transform = 'translateY(' + dockDrop() + 'px) rotate(-90deg)';
  }).observe(root);
  async function showLibrary() {
    if (busy || root.dataset.view === 'library') return;
    busy = true; back.disabled = true; reader.savePosition(); reader.closePanels();
    content.inert = true; setControlsInert(true);
    const distances = offsets();
    await Promise.all([
      animate(content, [{ opacity: 1 }, { opacity: 0 }], 250),
      ...controls.map((button, i) => animate(button, [{ transform: 'translateX(0) scale(1)', opacity: 1 }, { transform: 'translateX(' + distances[i] + 'px) scale(.2)', opacity: 0 }], 300, (controls.length - 1 - i) * 65)),
    ]);
    controls.forEach(button => button.style.visibility = 'hidden');
    const drop = dockDrop();
    await animate(back, [{ transform: 'translateY(0)' }, { transform: 'translateY(' + drop + 'px) rotate(-90deg)' }], 450);
    library.hidden = false; library.inert = false;
    root.dataset.view = 'library';
    await animate(library, [{ transform: 'translateX(70px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], 450);
    shelf.querySelector('[data-book="' + selected.id + '"]').focus({ preventScroll: true });
    await navigation.show();
    back.disabled = false; busy = false;
  }
  async function openBook(book) {
    if (busy || root.dataset.view !== 'library') return;
    busy = true; back.disabled = true; library.inert = true;
    selected = book;
    await navigation.hide();
    await animate(library, [{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(70px)', opacity: 0 }], 350);
    library.hidden = true;
    reader.openBook(book); storage.set('selected-book', book.id);
    root.dataset.view = 'returning';
    controls.forEach(button => button.style.visibility = 'visible');
    const current = back.style.transform;
    await animate(back, [{ transform: current }, { transform: 'translateY(0) rotate(0)' }], 450);
    await Promise.all([
      animate(content, [{ opacity: 0 }, { opacity: 1 }], 350),
      ...controls.map((button, i) => animate(button, [{ transform: button.style.transform, opacity: 0 }, { transform: 'translateX(0) scale(1)', opacity: 1 }], 300, i * 65)),
    ]);
    root.dataset.view = 'reader'; content.inert = false; setControlsInert(false);
    back.setAttribute('aria-label', 'Otevřít knihovnu'); back.title = 'Otevřít knihovnu';
    back.disabled = false; busy = false;
    document.getElementById('prose').focus({ preventScroll: true });
  }
  catalog.forEach((book, i) => {
    const card = document.createElement('button'); card.className = 'book-card';
    card.dataset.book = book.id; card.setAttribute('aria-label', 'Číst: ' + book.title);
    const cover = document.createElement('span'); cover.className = 'cover'; cover.style.setProperty('--cover', book.cover.color);
    for (const [className, text] of [['cover-series', 'AETHERIA / ' + String(i + 1).padStart(2, '0')], ['cover-symbol', book.cover.symbol], ['cover-title', book.cover.label], ['cover-subtitle', book.cover.subtitle]]) {
      const span = document.createElement('span'); span.className = className; span.textContent = text;
      if (className === 'cover-symbol') {
        const shapes = [
          '<path d="m50 12 38 38-38 38-38-38z"/><path d="m50 30 20 20-20 20-20-20z"/>',
          '<path d="M50 12v76M12 50h76M23 23l54 54M23 77l54-54"/>',
          '<path d="M68 15a38 38 0 1 0 17 61A39 39 0 0 1 68 15Z"/>',
        ];
        span.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true">' + shapes[i % shapes.length] + '</svg>';
      }
      cover.append(span);
    }
    const widgets = document.createElement('span'); widgets.className = 'book-widgets';
    const badge = document.createElement('span'); badge.textContent = book.chapters.length + (book.chapters.length === 1 ? ' kapitola' : book.chapters.length < 5 ? ' kapitoly' : ' kapitol');
    const read = document.createElement('span'); read.textContent = 'Otevřít '; const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); arrow.setAttribute('viewBox', '0 0 24 24'); arrow.setAttribute('aria-hidden', 'true'); arrow.innerHTML = '<path d="M6 18 18 6M6 6h12v12"/>'; read.append(arrow); widgets.append(badge, read);
    const note = document.createElement('span'); note.className = 'book-note'; note.textContent = book.cover.note;
    card.append(cover, widgets, note); card.addEventListener('click', () => openBook(book)); shelf.append(card);
  });
  shelf.addEventListener('scroll', () => {
    const cards = [...shelf.children].filter(card => !card.hidden);
    if (!cards.length) return;
    const center = shelf.getBoundingClientRect().left + shelf.clientWidth / 2;
    const nearest = cards.reduce((a, b) => Math.abs(b.getBoundingClientRect().left + b.clientWidth / 2 - center) < Math.abs(a.getBoundingClientRect().left + a.clientWidth / 2 - center) ? b : a);
    document.getElementById('libraryCounter').textContent = String(cards.indexOf(nearest) + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
  }, { passive: true });
  shelf.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); shelf.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * shelf.clientWidth * .8, behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  back.addEventListener('click', () => root.dataset.view === 'library' ? (!busy && navigation.toggle()) : showLibrary());
}
