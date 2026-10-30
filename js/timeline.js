const PIXELS_PER_YEAR = 4;
const TOP_PADDING = 260;

let processedEvents = [];
let scrollTimeout = null;

function renderTimeline() {
  // A single native scroll surface moves dates and cards together.
  const container = document.querySelector('.timeline-container');
  if (!container.querySelector('.timeline-scroll')) {
    const cards = document.getElementById('timeline-stream-pane');
    cards.id = 'timeline-cards-pane';
    cards.className = 'timeline-cards-pane';
    const scroll = document.createElement('div');
    scroll.id = 'timeline-stream-pane';
    scroll.className = 'timeline-scroll';
    container.append(scroll);
    scroll.append(document.getElementById('timeline-axis-pane'), cards);
  }
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
      const color = item.color || '#880909';
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

let timelineTouching = false;

function setupScrollSync(axisPane, streamPane) {
  const nativeScrollEnd = 'onscrollend' in streamPane;
  const scheduleSnap = () => {
    clearTimeout(scrollTimeout);
    if (!timelineTouching) scrollTimeout = setTimeout(() => snapToClosestEvent(streamPane), 250);
  };
  streamPane.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    updateActiveStates(streamPane.scrollTop);
    if (!nativeScrollEnd) scheduleSnap();
  }, { passive: true });
  streamPane.addEventListener('scrollend', () => {
    if (!timelineTouching) snapToClosestEvent(streamPane);
  });
  streamPane.addEventListener('touchstart', () => {
    timelineTouching = true;
    clearTimeout(scrollTimeout);
    streamPane.scrollTo({ top: streamPane.scrollTop, behavior: 'instant' });
  }, { passive: true });
  const release = () => {
    timelineTouching = false;
    // Handles a finger held still before release, with no subsequent scrollend.
    if (!nativeScrollEnd) scheduleSnap();
    else scrollTimeout = setTimeout(() => {
      if (!timelineTouching) snapToClosestEvent(streamPane);
    }, 350);
  };
  streamPane.addEventListener('touchend', release, { passive: true });
  streamPane.addEventListener('touchcancel', release, { passive: true });
  let origin;
  let dragged = false;
  streamPane.addEventListener('pointerdown', e => { origin = [e.clientX, e.clientY]; dragged = false; }, { passive: true });
  streamPane.addEventListener('pointermove', e => {
    if (origin && Math.hypot(e.clientX - origin[0], e.clientY - origin[1]) > 8) dragged = true;
  }, { passive: true });
  streamPane.addEventListener('click', e => {
    if (dragged) { e.preventDefault(); e.stopPropagation(); }
    origin = null;
  }, true);
}

function snapToClosestEvent(streamPane) {
  if (timelineTouching) return;
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

  clearTimeout(scrollTimeout);
  streamPane.scrollTo({ top: targetTop, behavior: smooth ? 'smooth' : 'instant' });
  if (!smooth && axisPane) {
    updateActiveStates(streamPane.scrollTop);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  renderTimeline();
});

// Decorative background only; the scroll positions and magnetic behavior stay unchanged.
function layoutTimelineInk() {
  const section = document.getElementById('timeline');
  const container = section.querySelector('.timeline-container');
  if (!section.classList.contains('active')) return;
  let svg = section.querySelector('.timeline-ink');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('timeline-ink');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path />';
    section.prepend(svg);
  }
  const rect = container.getBoundingClientRect();
  const nav = document.querySelector('.mobile-nav');
  const navRect = nav.getBoundingClientRect();
  const hasNav = navRect.width > 0;
  const x = hasNav ? navRect.left + navRect.width * .3 : rect.left + 125;
  section.style.setProperty('--timeline-axis-x', `${x - rect.left}px`);
  const bottom = hasNav ? navRect.top : rect.bottom;
  const neck = Math.max(rect.top, bottom - 120);
  svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  svg.querySelector('path').setAttribute('d', hasNav ? `
    M ${x - 1.5} ${rect.top} L ${x - 1.5} ${neck}
    C ${x - 1.5} ${bottom - 65} ${x - 3} ${bottom - 48} ${x - 14} ${bottom - 30}
    C ${x - 18} ${bottom - 24} ${x - 21} ${bottom - 20} ${x - 24.25} ${bottom - 14}
    L ${x - 24.25} ${bottom}
    L ${x + 24.25} ${bottom}
    L ${x + 24.25} ${bottom - 14}
    C ${x + 21} ${bottom - 20} ${x + 18} ${bottom - 24} ${x + 14} ${bottom - 30}
    C ${x + 3} ${bottom - 48} ${x + 1.5} ${bottom - 65} ${x + 1.5} ${neck}
    L ${x + 1.5} ${rect.top} Z
  ` : `M ${x - 1.5} ${rect.top} H ${x + 1.5} V ${bottom} H ${x - 1.5} Z`);
}
window.addEventListener('resize', layoutTimelineInk);
window.addEventListener('scroll', layoutTimelineInk, { passive: true });
document.addEventListener('aetheria:tabchange', layoutTimelineInk);
document.addEventListener('DOMContentLoaded', () => {
  new ResizeObserver(layoutTimelineInk).observe(document.querySelector('.content-container'));
  layoutTimelineInk();
});


// Visual liquid state is independent of the existing magnetic scroll logic.
document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('timeline');
  const stream = document.getElementById('timeline-stream-pane');
  let liquidTimer;
  const settleLiquid = () => {
    section.classList.remove('timeline-moving');
    const center = stream.scrollTop + stream.clientHeight / 2;
    const atEvent = processedEvents.some(event => Math.abs(event.top - center) <= 2);
    section.classList.toggle('timeline-settled', atEvent);
  };
  stream.addEventListener('scroll', () => {
    section.classList.add('timeline-moving');
    section.classList.remove('timeline-settled');
    clearTimeout(liquidTimer);
    liquidTimer = setTimeout(settleLiquid, 180);
  }, { passive: true });
  document.addEventListener('aetheria:tabchange', () => {
    clearTimeout(liquidTimer);
    liquidTimer = setTimeout(settleLiquid, 400);
  });
  window.addEventListener('resize', () => {
    clearTimeout(liquidTimer);
    liquidTimer = setTimeout(settleLiquid, 180);
  });
  settleLiquid();
});

// The section is hidden during initial rendering; center it once it is visible.
document.addEventListener('aetheria:tabchange', () => {
  const section = document.getElementById('timeline');
  if (!section.classList.contains('active')) return;
  const cards = [...section.querySelectorAll('.timeline-card-item')];
  const selected = Math.max(0, cards.findIndex(card => card.classList.contains('active')));
  scrollToEvent(selected, false);
});
