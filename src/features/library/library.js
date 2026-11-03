import { initWorldSections } from '../world/sections.js';
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
  const sections = initWorldSections(root, navigate);
  function navigate(section) {
    if (busy) return;
    root.dataset.section = section;
    library.hidden = section !== 'library';
    library.inert = section !== 'library';
    sections.show(section);
    navigation.select(section);
  }
  const navigation = createBottomNavigation({ container: root, anchor: back, reducedMotion: reduced, items: [
    { id: 'home', label: 'Domovská stránka', onSelect() { navigate('home'); } },
    { id: 'library', label: 'Knihovna', onSelect() { navigate('library'); } },
    { id: 'chronicle', label: 'Kronika / Bestiář', onSelect() { navigate('chronicle'); } },
    { id: 'map', label: 'Mapa světa', onSelect() { navigate('map'); } },
  ] });
  navigation.select('library');
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

    root.dataset.section = 'library'; sections.show('library'); navigation.select('library');
    library.hidden = false; library.inert = false;
    root.dataset.view = 'library';
    navigation.setLanding(true);
    await Promise.all([
      navigation.show(),
      animate(library, [{ transform: 'translateX(70px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], 450),
    ]);
    const landing = navigation.landingTransform();
    await animate(back, [
      { transform: 'translate(0, 0)', offset: 0 },
      { transform: landing + ' scale(.92, 1.08)', offset: .83 },
      { transform: landing + ' scale(1.1, .9)', offset: .93 },
      { transform: landing + ' scale(1)', offset: 1 },
    ], 560);
    back.style.visibility = 'hidden'; back.inert = true;
    navigation.setLanding(false);
    shelf.querySelector('[data-book="' + selected.id + '"]').focus({ preventScroll: true });
    back.disabled = false; busy = false;
  }
  async function openBook(book) {
    if (busy || root.dataset.view !== 'library') return;
    busy = true; back.disabled = true; library.inert = true;
    selected = book;
    navigation.setLanding(true);
    back.style.transform = navigation.landingTransform();
    back.style.visibility = 'visible'; back.inert = false;
    const takeoff = back.style.transform;
    await Promise.all([
      navigation.hide(),
      animate(back, [
        { transform: takeoff + ' scale(1.1, .9)', offset: 0 },
        { transform: takeoff + ' scale(.9, 1.12)', offset: .12 },
        { transform: 'translate(0, -8px) scale(1)', offset: .88 },
        { transform: 'translate(0, 0) scale(1)', offset: 1 },
      ], 560),
      animate(library, [{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(70px)', opacity: 0 }], 350),
    ]);
    library.hidden = true;
    reader.openBook(book); storage.set('selected-book', book.id);
    root.dataset.view = 'returning';
    controls.forEach(button => button.style.visibility = 'visible');

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
  if (location.hash.startsWith('#kronika')) queueMicrotask(async () => { await showLibrary(); navigate('chronicle'); });
  back.addEventListener('click', () => root.dataset.view === 'reader' && showLibrary());
}
