// Data pro váš svět (s localStorage podporou)
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

// Načtení z localStorage nebo použií defaultních dat
let worldData = JSON.parse(localStorage.getItem('aetheriaData')) || defaultData;

// Funkce pro přepínání záložek
function switchTab(tabId, element) {
  // Skrýt všechny sekce
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Zobrazit vybranou sekci
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  // Odstranit active třídu ze všech tlačítek
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
  });

  // Přidat active třídu kliknutému tlačítku
  if (element) {
    element.classList.add('active');
  }
}

// Funkce pro vykreslení seznamů
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

// Inicializace po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
  renderData();
});