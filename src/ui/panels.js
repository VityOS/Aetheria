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
  return { close };
}
