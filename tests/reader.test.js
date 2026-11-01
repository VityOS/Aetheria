import test from 'node:test';
import assert from 'node:assert/strict';
import { book } from '../src/data/book.js';
import { parseParagraphs, clampNumber } from '../src/features/reader/model.js';
import { createStorage } from '../src/services/storage.js';

test('Kapitoly obsahují souvislý text bez opakovaných ukázkových stran', () => {
  assert.equal(book.chapters.length, 3);
  assert.ok(book.chapters.every(c => c.paragraphs.length === 4));
  assert.deepEqual(parseParagraphs('První odstavec.\n\nDruhý odstavec.'), ['První odstavec.', 'Druhý odstavec.']);
});
test('Poškozená uložená nastavení zůstávají v povolených mezích', () => {
  assert.equal(clampNumber('invalid', 11, 20, 13), 13);
  assert.equal(clampNumber(Infinity, 1, 16), 1);
  assert.equal(clampNumber(100, 11, 20), 20);
  assert.equal(clampNumber(-1, 1, 16), 1);
});
test('Blokované úložiště nebrání fungování čtečky', () => {
  const storage = createStorage({ getItem() { throw Error(); }, setItem() { throw Error(); } });
  assert.equal(storage.get('theme', 'light'), 'light');
  assert.doesNotThrow(() => storage.set('theme', 'dark'));
});
test('Úložiště zachovává původní klíče nastavení', () => {
  const data = new Map();
  const storage = createStorage({ getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) });
  storage.set('page', 7);
  assert.equal(data.get('aetheria-page'), '7');
  assert.equal(storage.get('page'), '7');
});

import { createBookRepository } from '../src/services/book-repository.js';
test('Upravená kapitola se načte po novém otevření a selhání úložiště ji nepřepíše', () => {
  const data = new Map();
  const storage = createStorage({ getItem: k => data.get(k), setItem: (k,v) => data.set(k,v) });
  const repo = createBookRepository(book, storage);
  assert.equal(repo.update(0, 'Nový název', ['Nový text']), true);
  assert.equal(createBookRepository(book, storage).getChapters()[0].title, 'Nový název');
  assert.equal(book.chapters[0].title, 'Město nad oblaky');
  const unavailable = createBookRepository(book, createStorage(null));
  assert.equal(unavailable.update(0, 'Ztracená změna', ['Text']), false);
  assert.equal(unavailable.getChapters()[0].title, book.chapters[0].title);
});
