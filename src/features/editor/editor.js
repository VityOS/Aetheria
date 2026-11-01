import { parseParagraphs } from '../reader/model.js';

// Lokální zámek rozhraní. Nejde o serverové ověření uživatele.
export function initEditor({ getChapter, saveChapter }) {
  const el = id => document.getElementById(id);
  let unlocked = false;
  function openEditor() {
    const chapter = getChapter();
    el('editTitle').value = chapter.title;
    el('editText').value = chapter.paragraphs.join('\n\n');
    el('saveError').textContent = '';
    el('editorDialog').showModal();
  }
  el('write').addEventListener('click', () => {
    if (unlocked) return openEditor();
    el('unlockForm').reset();
    el('passwordError').textContent = '';
    el('unlockDialog').showModal();
  });
  el('unlockCancel').addEventListener('click', () => el('unlockDialog').close());
  el('unlockForm').addEventListener('submit', event => {
    event.preventDefault();
    if (el('password').value !== 'vitkojak') {
      el('passwordError').textContent = 'Nesprávné heslo. Zkuste to znovu.';
      el('password').select();
      return;
    }
    unlocked = true;
    el('password').value = '';
    el('unlockDialog').close();
    openEditor();
  });
  el('editCancel').addEventListener('click', () => el('editorDialog').close());
  el('editorForm').addEventListener('submit', event => {
    event.preventDefault();
    if (!unlocked) return;
    const title = el('editTitle').value.trim();
    const paragraphs = parseParagraphs(el('editText').value);
    if (!title || !paragraphs.length) {
      el('saveError').textContent = 'Vyplňte název i text kapitoly.';
      return;
    }
    if (!saveChapter(title, paragraphs)) {
      el('saveError').textContent = 'Text se nepodařilo uložit. Zkontrolujte dostupné místo a povolení úložiště. Text zůstává v editoru.';
      return;
    }
    el('editorDialog').close();
  });
}
