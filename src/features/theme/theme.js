const icons = {
  dark: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>',
  light: '<svg viewBox="0 0 24 24"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>',
};
export function initTheme(button, storage) {
  let theme = storage.get('theme', 'light') === 'dark' ? 'dark' : 'light';
  function render() {
    document.documentElement.dataset.theme = theme;
    const label = theme === 'dark' ? 'Přepnout na denní režim' : 'Přepnout na noční režim';
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.setAttribute('aria-label', label); button.title = label; button.innerHTML = icons[theme];
    document.querySelectorAll('[data-theme-choice]').forEach(choice => choice.setAttribute('aria-pressed', String(choice.dataset.themeChoice === theme)));
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', theme === 'dark' ? '#343333' : '#f0e7da');
  }
  function choose(value) { theme = value === 'dark' ? 'dark' : 'light'; storage.set('theme', theme); render(); }
  button.addEventListener('click', () => choose(theme === 'dark' ? 'light' : 'dark'));
  document.addEventListener('click', event => { const choice = event.target.closest('[data-theme-choice]'); if (choice) choose(choice.dataset.themeChoice); });
  render();
}
