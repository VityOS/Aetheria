// Defaultní data
const defaultData = {
  cities: [
    { name: "Aetheria Prime", desc: "Hlavní vznášející se citadel světa." },
    { name: "Křišťálové Údolí", desc: "Místo výskytu vzácných magických rud." }
  ],
  characters: [
    { name: "Valerius", desc: "Arcimág a strážce archivů." }
  ],
  bestiary: [
    { name: "Aetherický Drak", desc: "Stvoření složené ze čisté magie." }
  ]
};

let worldData = JSON.parse(localStorage.getItem('aetheriaData')) || defaultData;

function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  navItems.forEach(btn => btn.classList.remove('active'));

  if (element) {
    element.classList.add('active');
    const index = navItems.indexOf(element);
    moveIndicator(index);
  }
}

// Aktualizovaná funkce generující křivku přesně podle našeho černého kruhu (poloměr 28px)
function generatePath(centerX) {
  const w = 380; // Šířka SVG v px
  const h = 70;  // Výška SVG
  const r = 35;  // Zaoblení rohů lišty
  
  // Poloměr výřezu (černý kruh 28px + 4px rovnoměrný offset = 32px)
  const R = 32; 

  // Kde začíná a končí celý tvar výřezu na ose X
  const cutoutWidth = 46; 

  return `
    M ${r},0 
    L ${centerX - cutoutWidth},0 
    C ${centerX - R},0 ${centerX - R},${R} ${centerX},${R} 
    C ${centerX + R},${R} ${centerX + R},0 ${centerX + cutoutWidth},0 
    L ${w - r},0 
    A ${r},${r} 0 0 1 ${w},${r} 
    L ${w},${h - r} 
    A ${r},${r} 0 0 1 ${w - r},${h} 
    L ${r},${h} 
    A ${r},${r} 0 0 1 0,${h - r} 
    L 0,${r} 
    A ${r},${r} 0 0 1 ${r},0 
    Z
  `;
}

function moveIndicator(index) {
  const indicator = document.getElementById('nav-indicator');
  const pathElement = document.getElementById('curve-path');
  
  if (indicator && index !== -1) {
    // Posuneme kuličku
    indicator.style.transform = `translateX(${index * 100}%)`;
    
    // Přesné středy 5 záložek v rámci 380px viewBoxu SVG
    const centers = [38, 114, 190, 266, 342]; // (10%, 30%, 50%, 70%, 90% ze 380px)
    const activeCenter = centers[index];
    
    // Vytvoříme novou plynulou SVG křivku
    if (pathElement) {
      pathElement.setAttribute('d', generatePath(activeCenter));
    }
  }
}

function renderData() {
  const citiesList = document.getElementById('cities-list');
  const charactersList = document.getElementById('characters-list');
  const bestiaryList = document.getElementById('bestiary-list');

  if (citiesList) {
    citiesList.innerHTML = worldData.cities.map(item => `
      <div class="card">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
      </div>
    `).join('');
  }

  if (charactersList) {
    charactersList.innerHTML = worldData.characters.map(item => `
      <div class="card">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
      </div>
    `).join('');
  }

  if (bestiaryList) {
    bestiaryList.innerHTML = worldData.bestiary.map(item => `
      <div class="card">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderData();
  
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const activeIndex = navItems.findIndex(btn => btn.classList.contains('active'));
  if (activeIndex !== -1) {
    moveIndicator(activeIndex);
  }
});