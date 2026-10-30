function renderData() {
  const charactersList = document.getElementById('characters-list');
  const bestiaryList = document.getElementById('bestiary-list');

  if (charactersList) {
    charactersList.innerHTML = (worldData.characters || defaultData.characters).map(item => `
      <div class="card">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
      </div>
    `).join('');
  }

  if (bestiaryList) {
    bestiaryList.innerHTML = (worldData.bestiary || defaultData.bestiary).map(item => `
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