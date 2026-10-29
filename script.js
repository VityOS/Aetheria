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

function moveIndicator(index) {
  const indicator = document.getElementById('nav-indicator');
  const navContainer = document.querySelector('.nav-container');
  
  if (indicator && index !== -1) {
    indicator.style.transform = `translateX(${index * 100}%)`;
    
    // Přesné středy 5 sloupců pro masku výřezu: 10%, 30%, 50%, 70%, 90%
    const centerPositions = ['10%', '30%', '50%', '70%', '90%'];
    navContainer.style.setProperty('--indicator-pos', centerPositions[index]);
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