const PIXELS_PER_YEAR = 4;
const TOP_PADDING = 260;

let processedEvents = [];
let isSyncing = false;
let scrollTimeout = null;

function renderTimeline() {
  const axisContent = document.getElementById('timeline-axis-content');
  const streamContent = document.getElementById('timeline-stream-content');
  const axisPane = document.getElementById('timeline-axis-pane');
  const streamPane = document.getElementById('timeline-stream-pane');

  if (!axisContent || !streamContent || !axisPane || !streamPane) return;

  const rawEvents = (typeof worldData !== 'undefined' && worldData.timeline && worldData.timeline.length > 0)
    ? worldData.timeline
    : (typeof defaultData !== 'undefined' ? defaultData.timeline : []);

  if (rawEvents.length === 0) return;

  processedEvents = rawEvents.map((e, index) => {
    const extractYear = (str) => {
      if (typeof str === 'number') return str;
      if (!str) return index * 50;
      const match = str.match(/\d+/);
      return match ? parseInt(match[0], 10) : index * 50;
    };

    const startY = e.year !== undefined ? e.year : extractYear(e.date || e.startDate);
    const firstYear = rawEvents[0].year !== undefined ? rawEvents[0].year : extractYear(rawEvents[0].date || rawEvents[0].startDate);
    const top = TOP_PADDING + (startY - firstYear) * PIXELS_PER_YEAR;
    
    let height = 0;
    if (e.endDate) {
      const endY = extractYear(e.endDate);
      height = (endY - startY) * PIXELS_PER_YEAR;
    } else if (e.height) {
      height = e.height;
    }

    return { ...e, startY, top, height };
  });

  const lastItem = processedEvents[processedEvents.length - 1];
  const totalCanvasHeight = lastItem.top + 320;

  axisContent.style.height = `${totalCanvasHeight}px`;
  streamContent.style.height = `${totalCanvasHeight}px`;

  let axisHTML = `<div class="timeline-axis-line"></div>`;
  let streamHTML = '';

  processedEvents.forEach((item, index) => {
    const isPeriod = item.type === 'period' || item.endDate;
    const dateLabel = item.date || (item.startDate && item.endDate ? `${item.startDate}–${item.endDate}` : item.startDate) || `Rok ${item.startY}`;

    if (isPeriod && item.height > 0) {
      const color = item.color || '#38bdf8';
      axisHTML += `
        <div class="timeline-range-band" style="top: ${item.top}px; height: ${item.height}px; --band-color: ${color};">
          <span class="range-band-label">${item.title}</span>
        </div>
      `;
    }

    axisHTML += `
      <div class="timeline-node ${index === 0 ? 'active' : ''}" style="top: ${item.top}px;" onclick="scrollToEvent(${index})">
        <span class="node-label">${dateLabel}</span>
        <div class="node-dot"></div>
      </div>
    `;

    streamHTML += `
      <div class="timeline-card-item ${index === 0 ? 'active' : ''} ${isPeriod ? 'range-card' : ''}" 
           style="top: ${item.top}px;" onclick="scrollToEvent(${index})">
        ${item.image ? `<img src="${item.image}" alt="${item.title}" class="timeline-card-image">` : ''}
        <div class="timeline-card-content">
          <div class="tags-wrapper">
            <span class="date-tag">${dateLabel}</span>
            ${isPeriod ? '<span class="type-badge">Období / Éra</span>' : ''}
          </div>
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
        </div>
      </div>
    `;
  });

  axisContent.innerHTML = axisHTML;
  streamContent.innerHTML = streamHTML;

  setupScrollSync(axisPane, streamPane);
  scrollToEvent(0, false);
}

function setupScrollSync(axisPane, streamPane) {
  const handleScroll = (source) => {
    if (isSyncing) return;
    
    const target = source === axisPane ? streamPane : axisPane;
    target.scrollTop = source.scrollTop;
    updateActiveStates(source.scrollTop);

    // Rychlejší detekce zastavení pro plynulý přechod do magnetu
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      snapToClosestEvent(streamPane);
    }, 70); 
  };

  axisPane.addEventListener('scroll', () => handleScroll(axisPane), { passive: true });
  streamPane.addEventListener('scroll', () => handleScroll(streamPane), { passive: true });
}

function snapToClosestEvent(streamPane) {
  if (isSyncing) return;
  const containerHeight = streamPane.clientHeight;
  const currentCenter = streamPane.scrollTop + (containerHeight / 2);

  let closestIndex = 0;
  let minDistance = Infinity;

  processedEvents.forEach((item, index) => {
    const distance = Math.abs(item.top - currentCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  // Magnetický radius nastaven na 100px
  const SNAP_RADIUS = 100;
  if (minDistance <= SNAP_RADIUS && minDistance > 1) {
    scrollToEvent(closestIndex, true);
  }
}

function updateActiveStates(scrollTop) {
  const container = document.getElementById('timeline-stream-pane');
  if (!container) return;
  
  const containerHeight = container.clientHeight;
  const centerOffset = scrollTop + (containerHeight / 2);

  let closestIndex = 0;
  let minDistance = Infinity;

  processedEvents.forEach((item, index) => {
    const distance = Math.abs(item.top - centerOffset);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  const nodes = document.querySelectorAll('.timeline-node');
  const cards = document.querySelectorAll('.timeline-card-item');

  nodes.forEach((n, idx) => n.classList.toggle('active', idx === closestIndex));
  cards.forEach((c, idx) => c.classList.toggle('active', idx === closestIndex));
}

function scrollToEvent(index, smooth = true) {
  const streamPane = document.getElementById('timeline-stream-pane');
  const axisPane = document.getElementById('timeline-axis-pane');
  if (!streamPane || !processedEvents[index]) return;

  const containerHeight = streamPane.clientHeight;
  const targetTop = processedEvents[index].top - (containerHeight / 2);

  // Zamezí zbytečnému překreslování, pokud už jsme přesně na místě
  if (Math.abs(streamPane.scrollTop - targetTop) < 1) return;

  isSyncing = true;

  // Plynulý dojezd obou panelů současně
  streamPane.scrollTo({
    top: targetTop,
    behavior: smooth ? 'smooth' : 'auto'
  });

  if (axisPane) {
    axisPane.scrollTo({
      top: targetTop,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  updateActiveStates(targetTop);

  setTimeout(() => {
    isSyncing = false;
  }, smooth ? 350 : 50);
}

document.addEventListener('DOMContentLoaded', () => {
  renderTimeline();
});