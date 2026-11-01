import test from 'node:test';
import assert from 'node:assert/strict';
import { slotCenter, cutoutPath, NAV_HEIGHT } from '../src/ui/navigation-geometry.js';
test('Indikátor odpovídá středu položky na telefonu i širší obrazovce', () => {
  for (const width of [288, 343, 382, 420]) {
    for (let i = 0; i < 4; i++) {
      const center = slotCenter(width, i, 4);
      assert.equal(center, width / 4 * i + width / 8);
      assert.ok(center > 0 && center < width);
    }
  }
});
test('Výřez má konstantní hloubku a posouvá se spolu s indikátorem', () => {
  assert.equal(NAV_HEIGHT, 70);
  assert.ok(cutoutPath(100).includes('100 32'));
  assert.ok(cutoutPath(200).includes('200 32'));
  assert.ok(cutoutPath(100).startsWith('M 54 -40'));
  assert.ok(cutoutPath(200).startsWith('M 154 -40'));
});
