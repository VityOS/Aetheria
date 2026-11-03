import { initChronicle } from './chronicle.js';
// Samostatné pohledy pro další rozvoj. Skutečný obsah světa se doplní později.
export function initWorldSections(root, onNavigate) {
  const region = document.createElement('section'); region.className = 'world-section';
  region.hidden = true; region.setAttribute('aria-label', 'Svět Aetherie');
  root.append(region);
  const chronicle = initChronicle(root);
  function button(label, action, className = 'world-link') {
    const node = document.createElement('button'); node.type = 'button'; node.className = className;
    node.textContent = label; node.addEventListener('click', action); return node;
  }
  function heading(kicker, title, description) {
    const header = document.createElement('header');
    const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = kicker;
    const h1 = document.createElement('h1'); h1.textContent = title;
    const p = document.createElement('p'); p.textContent = description; header.append(eyebrow, h1, p); return header;
  }
  function show(section) {
    region.dataset.section = section;
    region.replaceChildren(); region.hidden = section === 'library';
    if (section === 'library') return;
    if (section === 'home') {
      region.append(heading('PŘÍBĚHY · KRONIKA · SVĚT', 'Aetheria', 'Každý svět začíná příběhem.'));
      const modes = document.createElement('div'); modes.className = 'home-theme-choice'; modes.setAttribute('role', 'group'); modes.setAttribute('aria-label', 'Barevný režim webu');
      for (const [value, label] of [['light', 'Denní režim'], ['dark', 'Noční režim']]) {
        const choice = document.createElement('button'); choice.type = 'button'; choice.dataset.themeChoice = value; choice.textContent = label;
        choice.setAttribute('aria-pressed', String((document.documentElement.dataset.theme || 'light') === value)); modes.append(choice);
      }
      region.append(modes);
      const emblem = document.createElement('div'); emblem.className = 'home-emblem'; emblem.setAttribute('aria-hidden', 'true');
      emblem.innerHTML = '<svg viewBox="0 0 200 180"><path d="m100 10 75 75-75 75-75-75zM100 35l50 50-50 50-50-50zM100 60l25 25-25 25-25-25z"/><circle cx="100" cy="85" r="72"/><path d="M100 0v30M100 140v35M10 85h30M160 85h30"/></svg>'; region.append(emblem);
      for (const [id, label] of [['library', 'Knihovna →'], ['chronicle', 'Kronika / Bestiář →'], ['map', 'Mapa světa →']]) region.append(button(label, () => onNavigate(id)));
    } else if (section === 'chronicle') {
      region.append(heading('ENCYKLOPEDIE SVĚTA', 'Kronika / Bestiář', 'Předměty, postavy a bestie z příběhů Aetherie.'));
      const tabs = document.createElement('div'); tabs.className = 'world-tabs'; tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Kategorie kroniky');
      const empty = document.createElement('div'); empty.className = 'world-empty';
      const categories = ['Předměty', 'Postavy', 'Bestie'];
      const controls = categories.map(label => button(label, () => select(label), 'world-tab'));
      function select(label) {
        controls.forEach((control, i) => control.setAttribute('aria-pressed', String(categories[i] === label)));
        if (label === 'Předměty') chronicle.mount(empty);
        else empty.textContent = label + ' — záznamy zatím nejsou doplněné.';
      }
      tabs.append(...controls); select(categories[0]); region.append(tabs, empty);
    } else if (section === 'map') {
      region.append(heading('ATLAS AETHERIE', 'Mapa světa', 'Místo pro velkou interaktivní mapu s lokacemi a královstvími.'));
      const placeholder = document.createElement('div'); placeholder.className = 'world-map-placeholder';
      const title = document.createElement('strong'); title.textContent = 'Svět čeká na své obrysy';
      const note = document.createElement('p'); note.textContent = 'Mapový podklad a skutečné lokace doplníme v další části.';
      placeholder.append(title, note); region.append(placeholder);
    }
  }
  return { show };
}
