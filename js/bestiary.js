let currentRotation = 0;
let isDragging = false;
let startAngle = 0;

// Inicializace geometrie kružnice po načtení
document.addEventListener('DOMContentLoaded', () => {
  setupRevolverRing();
  initRevolverDrag();
});

// Rozmístění slotů na kružnici o poloměru R
function setupRevolverRing() {
  const slots = document.querySelectorAll('.revolver-slot');
  const radius = 60; // Poloměr kružnice bubnu revolveru v px
  const totalSlots = slots.length;
  const angleStep = (2 * Math.PI) / totalSlots;

  slots.forEach((slot, index) => {
    const angle = index * angleStep - Math.PI / 2; // Začínáme nahoře
    const x = Math.round(radius * Math.cos(angle));
    const y = Math.round(radius * Math.sin(angle));

    slot.style.transform = `translate(${x}px, ${y}px)`;
    slot.dataset.angle = angle;
  });
}

// Možnost protáčení bubnu gestem / myší / kolečkem
function initRevolverDrag() {
  const ring = document.getElementById('revolver-ring');
  if (!ring) return;

  const getAngle = (x, y) => {
    const rect = ring.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
  };

  const startDrag = (e) => {
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startAngle = getAngle(clientX, clientY) - currentRotation;
  };

  const doDrag = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    currentRotation = getAngle(clientX, clientY) - startAngle;
    updateRingRotation();
  };

  const stopDrag = () => {
    isDragging = false;
  };

  ring.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', doDrag);
  window.addEventListener('mouseup', stopDrag);

  ring.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', doDrag, { passive: true });
  window.addEventListener('touchend', stopDrag);

  // Protáčení kolečkem myši
  ring.addEventListener('wheel', (e) => {
    e.preventDefault();
    currentRotation += e.deltaY > 0 ? 30 : -30;
    updateRingRotation();
  }, { passive: false });
}

function updateRingRotation() {
  const ring = document.getElementById('revolver-ring');
  if (!ring) return;

  ring.style.transform = `rotate(${currentRotation}deg)`;

  // Vyrovnání ikonek, aby se neotáčely nohama vzhůru
  document.querySelectorAll('.revolver-slot span').forEach(span => {
    span.style.transform = `rotate(${-currentRotation}deg)`;
  });
}

function selectSlot(category, element) {
  if (isDragging) return; // Pokud uživatel zrovna točí bubnem, neklikáme
  filterBestiary(category, element);
}

function openSearch() {
  const searchWrapper = document.getElementById('search-wrapper');
  const searchInput = document.getElementById('bestiary-search-input');

  if (searchWrapper && !searchWrapper.classList.contains('expanded')) {
    searchWrapper.classList.add('expanded');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 150);
    }
  }
}

function closeSearch(event) {
  if (event) event.stopPropagation();

  const searchWrapper = document.getElementById('search-wrapper');
  const searchInput = document.getElementById('bestiary-search-input');

  if (searchWrapper) {
    searchWrapper.classList.remove('expanded');
  }

  if (searchInput) {
    searchInput.value = '';
    filterBestiary('all');
  }
}

function searchBestiary(query) {
  const bestiaryList = document.getElementById('bestiary-list');
  if (!bestiaryList) return;

  const items = worldData.bestiary || defaultData.bestiary;
  const filtered = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length === 0) {
    bestiaryList.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #94a3b8;">Žádný tvor neodpovídá hledání "${query}".</p>
      </div>
    `;
    return;
  }

  bestiaryList.innerHTML = filtered.map(item => `
    <div class="card">
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
    </div>
  `).join('');
}

function filterBestiary(category, element) {
  document.querySelectorAll('.revolver-slot').forEach(slot => slot.classList.remove('active'));
  if (element) element.classList.add('active');

  const bestiaryList = document.getElementById('bestiary-list');
  if (!bestiaryList) return;

  const items = worldData.bestiary || defaultData.bestiary;
  const filtered = category === 'all' ? items : items.filter(item => item.category === category);

  bestiaryList.innerHTML = filtered.map(item => `
    <div class="card">
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
    </div>
  `).join('');
}