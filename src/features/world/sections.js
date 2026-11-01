// Samostatné pohledy pro další rozvoj. Skutečný obsah světa se doplní později.
export function initWorldSections(root, onNavigate) {
  const region = document.createElement('section'); region.className = 'world-section';
  region.hidden = true; region.setAttribute('aria-label', 'Svět Aetherie');
  root.append(region);
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
    region.replaceChildren(); region.hidden = section === 'library';
    if (section === 'library') return;
    if (section === 'home') {
      region.append(heading('VÍTEJTE V AETHERII', 'Každý svět začíná příběhem.', 'Čtěte, poznávejte obyvatele a objevujte místa jednoho světa.'));
      for (const [id, label] of [['library', 'Knihovna →'], ['chronicle', 'Kronika / Bestiář →'], ['map', 'Mapa světa →']]) region.append(button(label, () => onNavigate(id)));
    } else if (section === 'chronicle') {
      region.append(heading('ENCYKLOPEDIE SVĚTA', 'Kronika / Bestiář', 'Předměty, postavy a bestie z příběhů Aetherie.'));
      const tabs = document.createElement('div'); tabs.className = 'world-tabs'; tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Kategorie kroniky');
      const empty = document.createElement('p'); empty.className = 'world-empty';
      const categories = ['Předměty', 'Postavy', 'Bestie'];
      const controls = categories.map(label => button(label, () => select(label), 'world-tab'));
      function select(label) { controls.forEach((control, i) => control.setAttribute('aria-pressed', String(categories[i] === label))); empty.textContent = label + ' — záznamy zatím nejsou doplněné.'; }
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
