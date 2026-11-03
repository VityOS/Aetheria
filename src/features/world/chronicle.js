import { chronicleItems, itemHash } from '../../data/chronicle.js';
export function initChronicle(root) {
  const dialog = document.createElement('dialog'); dialog.className = 'item-detail';
  dialog.setAttribute('aria-labelledby', 'itemDetailTitle'); document.body.append(dialog);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let origin, current, moving = false;
  function element(tag, className, text) {
    const node = document.createElement(tag); node.className = className;
    if (text !== undefined) node.textContent = text; return node;
  }
  function image(item, className) {
    const img = element('img', className); img.src = item.image; img.alt = item.alt; img.decoding = 'async'; return img;
  }
  function initialClip() {
    const bounds = dialog.getBoundingClientRect();
    const card = origin?.isConnected ? origin.getBoundingClientRect() : { top: bounds.top + bounds.height / 2 - 60, bottom: bounds.top + bounds.height / 2 + 60, left: bounds.left + 24, right: bounds.right - 24 };
    return 'inset(' + Math.max(0, card.top - bounds.top) + 'px ' + Math.max(0, bounds.right - card.right) + 'px ' + Math.max(0, bounds.bottom - card.bottom) + 'px ' + Math.max(0, card.left - bounds.left) + 'px round 16px)';
  }
  function layout() {
    const rect = root.getBoundingClientRect();
    Object.assign(dialog.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' });
  }
  new ResizeObserver(() => { if (dialog.open) layout(); }).observe(root);
  async function open(item, card, push = true) {
    if (moving || dialog.open) return;
    moving = true; origin = card; current = item;
    if (push) history.pushState({ ...history.state, chronicleItem: item.id }, '', itemHash(item.id));
    dialog.replaceChildren(); layout();
    const page = element('article', 'item-detail-page');
    const top = element('div', 'item-detail-top');
    const back = element('button', 'item-back', '←'); back.type = 'button'; back.setAttribute('aria-label', 'Zpět do kroniky');
    back.addEventListener('click', requestClose);
    top.append(back, element('span', 'item-detail-index', item.number + ' / KRONIKA'));
    const title = element('h1', 'item-detail-title', item.title); title.id = 'itemDetailTitle';
    const hero = element('figure', 'item-hero'); hero.append(image(item, 'item-detail-image'));
    const text = element('div', 'item-detail-copy');
    text.append(element('p', 'eyebrow', item.type), title, element('p', 'item-lead', item.summary));
    const facts = element('dl', 'item-facts');
    for (const [label, value] of [['Katalogové číslo', item.number], ['Kategorie', item.category], ['Typ', item.type]]) { facts.append(element('dt', '', label), element('dd', '', value)); }
    text.append(facts, element('h2', '', 'Vzhled'));
    item.description.forEach(paragraph => text.append(element('p', '', paragraph)));
    page.append(top, hero, text); dialog.append(page); dialog.showModal();
    const clip = initialClip();
    const animation = dialog.animate([
      { clipPath: clip, backgroundColor: '#343333' },
      { clipPath: 'inset(0px 0px 0px 0px round 0px)', backgroundColor: getComputedStyle(root).getPropertyValue('--surface').trim() },
    ], { duration: reduced.matches ? 1 : 560, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'both' });
    page.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: reduced.matches ? 0 : 250, duration: reduced.matches ? 1 : 330, fill: 'both' });
    await animation.finished; animation.cancel(); moving = false;
    back.focus({ preventScroll: true });
  }
  async function close() {
    if (moving || !dialog.open) return;
    moving = true;
    const animation = dialog.animate([
      { clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: 1 },
      { clipPath: initialClip(), opacity: 0 },
    ], { duration: reduced.matches ? 1 : 420, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
    await animation.finished; dialog.close(); animation.cancel(); moving = false;
    origin?.focus({ preventScroll: true }); current = null;
  }
  function requestClose() {
    if (moving) return;
    if (history.state?.chronicleItem) history.back();
    else { history.replaceState(history.state, '', '#kronika'); close(); }
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); requestClose(); });
  window.addEventListener('popstate', () => {
    if (dialog.open && location.hash !== itemHash(current.id)) close();
    else if (!dialog.open && location.hash === itemHash(chronicleItems[0].id) && origin?.isConnected) open(chronicleItems[0], origin, false);
  });
  return {
    mount(container) {
      const list = element('div', 'chronicle-list');
      for (const item of chronicleItems) {
        const card = element('button', 'chronicle-card'); card.type = 'button'; card.dataset.item = item.id;
        card.setAttribute('aria-label', 'Otevřít předmět: ' + item.title + ', ' + item.number);
        const frame = element('span', 'chronicle-thumbnail'); frame.append(image(item, 'chronicle-image'));
        const copy = element('span', 'chronicle-card-copy');
        copy.append(element('span', 'chronicle-kind', item.type), element('span', 'chronicle-card-title', item.title), element('span', 'chronicle-summary', item.summary));
        const bottom = element('span', 'chronicle-card-bottom'); bottom.append(element('span', 'chronicle-number', item.number), element('span', 'chronicle-arrow', '↗'));
        copy.append(bottom); card.append(frame, copy);
        card.addEventListener('click', () => open(item, card)); list.append(card);
      }
      container.replaceChildren(list);
      if (location.hash === itemHash(chronicleItems[0].id)) queueMicrotask(() => open(chronicleItems[0], list.firstElementChild, false));
    },
  };
}
