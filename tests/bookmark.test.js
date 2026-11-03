import test from 'node:test';
import assert from 'node:assert/strict';
import { readLineBookmark, resolveBookmark } from '../src/features/reader/line-bookmark.js';
test('Záložka zachová místo a nalezne text po vložení dalších odstavců', () => {
  const mark = { chapterId: 'one', paragraph: 0, offset: 6, quote: 'řádek' };
  assert.deepEqual(resolveBookmark(mark, ['První řádek']), { paragraph: 0, offset: 6 });
  assert.deepEqual(resolveBookmark(mark, ['Nový odstavec', 'První řádek']), { paragraph: 1, offset: 6 });
  assert.equal(resolveBookmark(mark, ['Odstraněný text']), null);
});
test('Poškozená záložka se ignoruje a knihy mají oddělené klíče', () => {
  const storage = { get: key => key === 'line-bookmark-first' ? JSON.stringify({ chapterId: 'one', paragraph: 1, offset: 20 }) : 'invalid' };
  assert.equal(readLineBookmark(storage, 'first').offset, 20);
  assert.equal(readLineBookmark(storage, 'second'), null);
});
