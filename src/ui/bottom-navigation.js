const icons = {
  library: '<path d="M4 5h5v15H4zM11 5h4v15h-4zM17 5l4-1 3 15-4 1z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  bookmarks: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  reading: '<path d="M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z"/>',
};
// Sdílená navigace: cíle dodává stránka, vzhled a rozvinutí jsou společné.
export function createBottomNavigation({ container, anchor, items, reducedMotion }) {
  const nav = document.createElement('nav'); nav.className = 'bottom-navigation';
  nav.setAttribute('aria-label', 'Hlavní navigace'); nav.id = 'mainNavigation';
  nav.hidden = true; nav.inert = true;
  const links = document.createElement('div'); links.className = 'bottom-navigation-items';
  const buttons = new Map();
  for (const item of items) {
    const button = document.createElement('button'); button.type = 'button';
    button.title = item.label; button.setAttribute('aria-label', item.label);
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[item.id] + '</svg>';
    button.addEventListener('click', () => item.onSelect());
    buttons.set(item.id, button); links.append(button);
  }
  nav.append(links); container.append(nav);
  let expanded = false;
  let moving = false;
  let available = false;
  function layout() {
    const circle = anchor.getBoundingClientRect(), parent = container.getBoundingClientRect();
    nav.style.left = circle.left - parent.left - container.clientLeft + 'px';
    nav.style.top = circle.top - parent.top - container.clientTop + 'px';
    return container.clientWidth - 2 * (circle.left - parent.left);
  }
  async function setExpanded(value) {
    if (moving || value === expanded) return;
    moving = true;
    const width = layout();
    nav.hidden = false; nav.inert = true;
    const animation = nav.animate([
      { width: (expanded ? width : 44) + 'px' },
      { width: (value ? width : 44) + 'px' },
    ], { duration: reducedMotion.matches ? 1 : 420, fill: 'forwards', easing: 'cubic-bezier(.22,.8,.25,1)' });
    links.style.opacity = value ? '1' : '0';
    await animation.finished; animation.commitStyles(); animation.cancel();
    expanded = value; nav.inert = !value; nav.dataset.expanded = String(value);
    anchor.setAttribute('aria-expanded', String(value));
    anchor.setAttribute('aria-controls', nav.id);
    anchor.setAttribute('aria-label', value ? 'Sbalit navigaci' : 'Rozbalit navigaci');
    anchor.title = value ? 'Sbalit navigaci' : 'Rozbalit navigaci';
    moving = false;
  }
  new ResizeObserver(() => { if (available && !moving) { const width = layout(); nav.style.width = (expanded ? width : 44) + 'px'; } }).observe(container);
  return {
    async show() { available = true; await setExpanded(true); },
    async hide() { await setExpanded(false); nav.hidden = true; available = false; anchor.removeAttribute('aria-expanded'); anchor.removeAttribute('aria-controls'); },
    toggle() { return setExpanded(!expanded); },
    select(id) { for (const [key, button] of buttons) { if (key === id) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); } },
  };
}
