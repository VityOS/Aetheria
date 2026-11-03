// Geometrie rámu je společná pro hlavní obrazovku i detaily.
export function appendOrnamentalFrame(container) {
  const frame = document.createElement('div'); frame.className = 'ornamental-frame'; frame.setAttribute('aria-hidden', 'true');
  const corners = [[0,0,1,1], [400,0,-1,1], [0,800,1,-1], [400,800,-1,-1]].map(([x,y,sx,sy]) =>
    '<g transform="translate(' + x + ' ' + y + ') scale(' + sx + ' ' + sy + ')"><path d="M10 80 80 10M10 55h45V10M10 34h24V10M22 10v24M10 22h24"/><circle cx="24" cy="55" r="9"/><circle cx="24" cy="55" r="5"/></g>'
  ).join('');
  let ticks = '';
  for (let x = 22; x < 390; x += 22) ticks += '<path d="M' + x + ' 4v6M' + x + ' 790v6"/>';
  for (let y = 22; y < 790; y += 22) ticks += '<path d="M4 ' + y + 'h6M390 ' + y + 'h6"/>';
  frame.innerHTML = '<svg viewBox="0 0 400 800" preserveAspectRatio="none"><rect x="4" y="4" width="392" height="792"/><rect x="10" y="10" width="380" height="780"/>' + corners + ticks + '</svg>';
  container.append(frame);
}
