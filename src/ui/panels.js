export function initPanels(names, getElement) {
  function close() {
    for (const name of names) {
      getElement(name + 'Panel').hidden = true;
      getElement(name).setAttribute('aria-expanded', 'false');
    }
  }
  for (const name of names) {
    getElement(name).addEventListener('click', () => {
      const opening = getElement(name + 'Panel').hidden;
      close();
      getElement(name + 'Panel').hidden = !opening;
      getElement(name).setAttribute('aria-expanded', String(opening));
    });
  }
  document.addEventListener('pointerdown', event => {
    for (const name of names) {
      const panel = getElement(name + 'Panel');
      const trigger = getElement(name);
      if (!panel.hidden && !panel.contains(event.target) && !trigger.contains(event.target)) {
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    }
  });
  return { close };
}
