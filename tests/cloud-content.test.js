import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContent, assertRevision } from '../src/services/cloud-content.js';
test('Serverový obsah musí mít textové odstavce a platnou revizi', () => {
  assert.equal(validateContent({ title: 'Kapitola', paragraphs: ['První\nDruhý'], revision: 1 }), true);
  for (const item of [ { title: 'X', paragraphs: [null], revision: 1 }, { title: '', paragraphs: ['X'], revision: 1 }, { title: 'X', paragraphs: ['X'], revision: 0 } ]) assert.equal(Boolean(validateContent(item)), false);
});
test('Změna z jiného zařízení nesmí být přepsána starým konceptem', () => {
  assert.doesNotThrow(() => assertRevision(3, 3));
  assert.doesNotThrow(() => assertRevision(0, 0));
  assert.throws(() => assertRevision(4, 3), /jiném zařízení/);
});
