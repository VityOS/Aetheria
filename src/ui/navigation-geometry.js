export const NAV_HEIGHT = 70;
export function slotCenter(width, index, count) {
  return width * (index + .5) / count;
}
// Plynulý výřez z v1.0 v reálných pixelech aktuální lišty.
export function cutoutPath(center) {
  const radius = 32, shoulder = 46;
  return 'M ' + (center - shoulder) + ' -40 L ' + (center - shoulder) + ' 0 C ' + (center - radius) + ' 0 ' + (center - radius) + ' ' + radius + ' ' + center + ' ' + radius + ' C ' + (center + radius) + ' ' + radius + ' ' + (center + radius) + ' 0 ' + (center + shoulder) + ' 0 L ' + (center + shoulder) + ' -40 Z';
}
