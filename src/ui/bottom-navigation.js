import { NAV_HEIGHT, slotCenter, cutoutPath } from './navigation-geometry.js';
const icons = {
  home: '<path d="m3 11 9-8 9 8v10h-6v-7H9v7H3z"/>',
  chronicle: '<path d="M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z"/><path d="m8 10 1 2-1 2m8-4-1 2 1 2"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
  library: '<path d="M4 5h5v15H4zM11 5h4v15h-4zM17 5l4-1 3 15-4 1z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  bookmarks: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  reading: '<path d="M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z"/>',
};

// Společná navigace s výřezem a vystouplou aktivní ikonou.
export function createBottomNavigation({ container, anchor, items, reducedMotion }) {
  const nav = document.createElement('nav'); nav.className = 'bottom-navigation';
  nav.id = 'mainNavigation'; nav.setAttribute('aria-label', 'Hlavní navigace');
  nav.hidden = true; nav.inert = true;
  const ns = 'http://www.w3.org/2000/svg';
  const background = document.createElementNS(ns, 'svg'); background.classList.add('navigation-background');
  background.setAttribute('aria-hidden', 'true'); background.setAttribute('preserveAspectRatio', 'none');
  background.innerHTML = '<defs><mask id="world-nav-cutout" maskUnits="userSpaceOnUse" x="0" y="0" height="70" style="mask-type:luminance"><rect class="mask-base" height="70" fill="white"/><path class="mask-curve" fill="black"/></mask></defs><rect class="navigation-shape" height="70" rx="35" fill="#343333" mask="url(#world-nav-cutout)"/>';
  const curve = background.querySelector('.mask-curve');
  const indicator = document.createElement('div'); indicator.className = 'navigation-indicator'; indicator.setAttribute('aria-hidden', 'true');
  const circle = document.createElement('div'); circle.className = 'navigation-circle'; indicator.append(circle);
  const links = document.createElement('div'); links.className = 'bottom-navigation-items';
  const buttons = new Map(); let active = items[0].id;
  for (const item of items) {
    const button = document.createElement('button'); button.type = 'button';
    button.title = item.label; button.setAttribute('aria-label', item.label);
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[item.id] + '</svg>';
    const label = document.createElement('span'); label.className = 'nav-label';
    label.textContent = ({ home: 'Domov', library: 'Knihovna', chronicle: 'Kronika', map: 'Mapa' })[item.id] || item.label;
    button.append(label); button.addEventListener('click', () => item.onSelect());
    buttons.set(item.id, button); links.append(button);
  }
  nav.append(background, links, indicator); container.append(nav);
  let available = false;
  let currentCenter = null;
  let frame = 0;
  function draw(center) {
    currentCenter = center;
    indicator.style.transform = 'translateX(' + (center - 28) + 'px)';
    curve.setAttribute('d', cutoutPath(center));
  }
  function move(center, animated) {
    cancelAnimationFrame(frame);
    if (!animated || currentCenter === null || reducedMotion.matches) { draw(center); return; }
    const start = currentCenter, started = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - started) / 350);
      const eased = t * t * (3 - 2 * t);
      draw(start + (center - start) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }
  function layout(animated = false) {
    const padding = getComputedStyle(container);
    const left = parseFloat(padding.paddingLeft);
    const bottom = Math.max(20, parseFloat(padding.paddingBottom) + 12);
    const width = container.clientWidth - left - parseFloat(padding.paddingRight);
    const top = container.clientHeight - bottom - NAV_HEIGHT;
    const slot = items.findIndex(item => item.id === active);
    const center = slotCenter(width, slot, items.length);
    background.setAttribute('viewBox', '0 0 ' + width + ' ' + NAV_HEIGHT);
    background.querySelector('mask').setAttribute('width', width);
    background.querySelectorAll('rect').forEach(rect => rect.setAttribute('width', width));
    move(center, animated);
    Object.assign(nav.style, { left: left + 'px', top: top + 'px', width: width + 'px' });
    nav.style.setProperty('--active-x', center + 'px');
    return { left, top, center };
  }
  async function slide(show, animated = true) {
    layout(); nav.hidden = false; nav.inert = true;
    const frames = show ? [{ transform: 'translateY(130px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }] : [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(130px)', opacity: 0 }];
    if (!animated) {
      Object.assign(nav.style, frames[1]); nav.inert = !show; nav.hidden = !show; available = show; return;
    }
    const animation = nav.animate(frames, { duration: reducedMotion.matches ? 1 : 420, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'forwards' });
    await animation.finished;
    Object.assign(nav.style, frames[1]); animation.cancel();
    nav.inert = !show; nav.hidden = !show; available = show;
  }
  new ResizeObserver(() => { if (available) layout(); }).observe(container);
  return {
    show(options = {}) { return slide(true, options.animated !== false); },
    hide() { return slide(false); },
    landingTransform() {
      const { left, top, center } = layout();
      const toolbar = anchor.parentElement;
      const x = left + center - 22 - toolbar.offsetLeft - anchor.offsetLeft;
      const y = top - 22 - toolbar.offsetTop - anchor.offsetTop;
      return 'translate(' + x + 'px, ' + y + 'px) scale(' + (56 / 44) + ')';
    },
    setLanding(value) { nav.dataset.landing = String(value); },
    select(id) {
      if (!buttons.has(id)) return;
      const changed = active !== id;
      active = id;
      circle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[id] + '</svg>';
      for (const [key, button] of buttons) {
        if (key === id) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
      }
      layout(available && changed);
    },
  };
}
