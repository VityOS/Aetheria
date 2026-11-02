import { parseParagraphs } from '../reader/model.js';
import { cloud, cloudError } from '../../services/firebase.js';

export function initEditor({ getChapter, saveChapter, storage, getDraftKey, getEditContext }) {
  const el = id => document.getElementById(id);
  let context, draftKey, saving = false;
  function openEditor() {
    context = getEditContext(); draftKey = getDraftKey();
    const chapter = getChapter();
    el('editTitle').value = chapter.title;
    el('editText').value = chapter.paragraphs.join('\n\n');
    el('saveError').textContent = '';
    try {
      const draft = JSON.parse(storage.get(draftKey, 'null'));
      if (draft && typeof draft.title === 'string' && typeof draft.text === 'string') {
        el('editTitle').value = draft.title; el('editText').value = draft.text;
        // Starý koncept si zachovává verzi, ze které vznikl.
        if (Number.isInteger(draft.revision)) context.revision = draft.revision;
        el('saveError').textContent = 'Obnoven místní koncept. Před uložením zkontrolujte jeho obsah.';
      }
    } catch { /* Neplatný koncept neovlivní uloženou kapitolu. */ }
    el('editorDialog').showModal();
  }
  function saveDraft() {
    if (!context) return;
    const ok = storage.set(draftKey, JSON.stringify({ title: el('editTitle').value, text: el('editText').value, revision: context.revision }));
    if (!ok) el('saveError').textContent = 'Koncept se nepodařilo zálohovat. Stáhněte si Zálohu TXT.';
  }
  el('editTitle').addEventListener('input', saveDraft);
  el('editText').addEventListener('input', saveDraft);
  el('downloadText').addEventListener('click', () => {
    const blob = new Blob([el('editTitle').value + '\n\n' + el('editText').value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'aetheria-kapitola.txt';
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  el('write').addEventListener('click', async () => {
    el('write').disabled = true;
    try {
      if (await cloud.isAuthor()) { openEditor(); return; }
      el('unlockForm').reset(); el('passwordError').textContent = ''; el('unlockDialog').showModal();
    } catch (error) {
      el('unlockDialog').showModal(); el('passwordError').textContent = cloudError(error);
    } finally { el('write').disabled = false; }
  });
  el('unlockCancel').addEventListener('click', () => el('unlockDialog').close());
  el('unlockForm').addEventListener('submit', async event => {
    event.preventDefault();
    const button = el('unlockForm').querySelector('[type=submit]'); button.disabled = true;
    try {
      await cloud.login(el('email').value.trim(), el('password').value);
      el('password').value = ''; openEditor(); el('unlockDialog').close();
    } catch (error) { el('passwordError').textContent = cloudError(error); }
    finally { button.disabled = false; }
  });
  el('loadCurrent').addEventListener('click', () => {
    if (saving) return;
    const archived = storage.set(draftKey + '-previous', JSON.stringify({ title: el('editTitle').value, text: el('editText').value, revision: context.revision }));
    if (!archived) { el('saveError').textContent = 'Nejdříve si stáhněte Zálohu TXT. Předchozí koncept se nepodařilo zálohovat.'; return; }
    try {
      const nextContext = getEditContext();
      const current = getChapter();
      context = nextContext;
      el('editTitle').value = current.title;
      el('editText').value = current.paragraphs.join('\n\n');
      saveDraft();
      el('saveError').textContent = 'Načtena aktuální uložená verze. Předchozí koncept je zálohovaný v tomto prohlížeči.';
    } catch (error) { el('saveError').textContent = cloudError(error); }
  });
  el('logout').addEventListener('click', async () => {
    if (saving) return;
    try { saveDraft(); await cloud.logout(); el('editorDialog').close(); }
    catch (error) { el('saveError').textContent = cloudError(error); }
  });
  el('editCancel').addEventListener('click', () => { if (!saving) { saveDraft(); el('editorDialog').close(); } });
  el('editorDialog').addEventListener('cancel', event => { if (saving) event.preventDefault(); else saveDraft(); });
  el('editorForm').addEventListener('submit', async event => {
    event.preventDefault(); if (saving) return;
    const title = el('editTitle').value.trim(), paragraphs = parseParagraphs(el('editText').value);
    if (!title || !paragraphs.length) { el('saveError').textContent = 'Vyplňte název i text kapitoly.'; return; }
    saveDraft(); saving = true;
    const controls = [...el('editorForm').querySelectorAll('input, textarea, button')]; controls.forEach(control => control.disabled = true);
    el('saveError').textContent = 'Ukládám na server…';
    try {
      await saveChapter(title, paragraphs, context);
      storage.set(draftKey, 'null'); el('editorDialog').close();
    } catch (error) { el('saveError').textContent = cloudError(error); }
    finally { saving = false; controls.forEach(control => control.disabled = false); }
  });
}
