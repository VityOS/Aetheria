// INITIAL DATA
const defaultNations = [
  {
    id: 'nat_aethelgard',
    title: 'Království Aethelgard',
    sub: 'Feudální monarchie',
    desc: 'Starobylá říše kartografů, rytířů a větrných observatoří.',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'nat_kurogani',
    title: 'Klan Kurogani',
    sub: 'Sopečný klan kovářů',
    desc: 'Bojovníci a mistři techniky obývající hřebeny Obsidian Peaks.',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop'
  }
];

const defaultCities = [
  {
    id: 'cit_ostry_usvit',
    nationId: 'nat_aethelgard',
    title: 'Ostrý Úsvit',
    subcat: 'Hlavní citadela',
    desc: 'Pevnost Cechu Kartografů postavená na vysokém útesu nad Zpívající soutěskou.',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'cit_aetherionske_udoli',
    nationId: 'nat_aethelgard',
    title: 'Aetheriánské údolí',
    subcat: 'Posvátná rokle',
    desc: 'Hluboké kaňony s tajemnými vznášejícími se deskami a vodopády, které protínají magické runy.',
    img: 'Aetherionske udoli.jpg'
  },
  {
    id: 'cit_al_sharai',
    nationId: 'nat_aethelgard',
    title: 'Al Sharai',
    subcat: 'Pouštní velkoměsto',
    desc: 'Uliční labyrint plný pestrých látek, s centrální majestátní kupolí a paláci zářícími v dálce.',
    img: 'Al Sharai.jpg'
  },
  {
    id: 'cit_deadmans_beak',
    nationId: 'nat_aethelgard',
    title: 'Deadman\'s Beak',
    subcat: 'Pirátská svatyně / Útes',
    desc: 'Temná osada na útesech vystavěná z vraků lodí a zavěšená na lanových mostech nad vodní hladinou.',
    img: 'Deadmans beak.jpg'
  },
  {
    id: 'cit_tianfeng',
    nationId: 'nat_kurogani',
    title: 'Pohoří TianFeng',
    subcat: 'Nebeské věže',
    desc: 'Impozantní vertikální skalní pilíře porostlé bujnou vegetací, tyčící se vysoko do mraků.',
    img: 'Pohori TianFeng.jpg'
  }
];

const defaultBestiary = [
  {
    id: 'best_melinoe',
    num: '01',
    title: 'Melinoë',
    subcat: 'Keeper of Ruòn',
    desc: 'Melinoë is a traditionalist member of the Lampade, druids that shield the surface from threats that boil up from the underworld. In Ruòn, one of the eight great chamberdeeps, she holds vigil, holding back both creatures from below and adventurers from above.',
    notes: 'Lampede spells are based on symbiosis with the elements and creatures of the lightless deep.',
    spells: 'Vyvolávání živlových červů, Světlo hlubin, Kamenná zeď',
    mapImg: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'best_bitter',
    num: '02',
    title: 'Standing in His Jaws',
    subcat: 'Temný živel',
    desc: 'Ne každý život je výjimečný. Mnohé bytosti procházejí stíny bez odkazů, podvoleny tichu hlubokých hvozdů a starých ruin.',
    notes: 'Vídán v temných rolinách během mlžných nocí. Pozor na jeho stínový dech.',
    spells: 'Stínový skok, Tiché kroky, Noční vidění',
    mapImg: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop',
    img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'best_aether',
    num: '03',
    title: 'Aether',
    subcat: 'Ztělesnění nebes',
    desc: 'Záhadná humanoidní bytost, jejíž hlava a končetiny jsou tvořeny čistým obláčným kouřem a éterickou září. Vznáší se nad oblaky a málokdy se dotýká země.',
    notes: 'Reaguje na proudění větru a změny barva oblohy.',
    spells: 'Levitace, Éterický závan, Mlžný štít',
    mapImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    img: 'Aether.jpg'
  },
  {
    id: 'best_clocksby',
    num: '04',
    title: 'Clocksby',
    subcat: 'Mechanický průzkumník',
    desc: 'Autonomní automat se zlatým hodinovým strojkem na helmě. Na zádech nosí srolované mapy a krumpáč, zatímco jeho modré optické oko skenuje okolní terén.',
    notes: 'Před cestou jej nutno natáhnout klíčem na hlavě.',
    spells: 'Mechanická detekce, Časový krok',
    mapImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    img: 'Clocksby.jpg'
  },
  {
    id: 'best_darkin',
    num: '05',
    title: 'Darkin',
    subcat: 'Monstrózní dračí dravčík',
    desc: 'Agilní šupinatý tvor s ostrými hnáty a modrými krystalickými ploutvemi na zádech. Vyznačuje se černobílým zbarvením a dravou povahou v drsných oblastech.',
    notes: 'Stavba těla ukazuje na rychlého lovce ze zálohy.',
    spells: 'Drápová bouře, Krystalová čepel',
    mapImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    img: 'Darkin.jpg'
  },
  {
    id: 'best_hrimor',
    num: '06',
    title: 'Hrímor, the Frostbound Colossus',
    subcat: 'Mrazivý kolos',
    desc: 'Obří masivní tvor ztělesňující led a sníh, obklopený neprostupnou vánicí. Jeho mohutná čelist a hřbetní ostny budí strach u každého poutníka.',
    notes: 'Obývá nejvyšší ledové hřebeny a mrazivé pláně.',
    spells: 'Ledová bouře, Mrazivý dech, Lavinový dupot',
    mapImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    img: 'Hrimor,, the Frostbound Colossus.jpg'
  }
];

const defaultPins = [
  { id: 'p1', x: 40, y: 45, title: 'Ostrý Úsvit', entityId: 'cit_ostry_usvit' }
];

const defaultChapters = [
  { id: 1, title: 'Kapitola I: Stíny nad Aetherií', text: 'Vzduch v údolí zhoustl. Stará věž v Ostrém Úsvitu vydávala zvláštní světlo...' }
];

const defaultGallery = [
  { title: 'Sopečné ruiny', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop' }
];

let nations = JSON.parse(localStorage.getItem('aeth_nations')) || defaultNations;
let cities = JSON.parse(localStorage.getItem('aeth_cities')) || defaultCities;
let bestiary = JSON.parse(localStorage.getItem('aeth_bestiary')) || defaultBestiary;
let pins = JSON.parse(localStorage.getItem('aeth_pins')) || defaultPins;
let chapters = JSON.parse(localStorage.getItem('aeth_chapters')) || defaultChapters;
let gallery = JSON.parse(localStorage.getItem('aeth_gallery')) || defaultGallery;

let activeNationId = null;
let activeBestiaryFilter = 'all';
let activeChapterId = chapters[0]?.id || 1;
let carouselOffset = 0;

document.addEventListener('DOMContentLoaded', () => {
  renderDashboardWidgets();
  renderNations();
  renderBestiary();
  renderMapPins();
  renderChapters();
  renderGallery();
  lucide.createIcons();
});

// PŘEPÍNÁNÍ SEKCÍ
function switchSection(secKey, navBtn) {
  document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`sec-${secKey}`).classList.add('active');

  if(navBtn) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    navBtn.classList.add('active');
  } else {
    document.querySelectorAll('.nav-item').forEach(btn => {
      if(btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(secKey)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  const backdrop = document.getElementById('bgBackdrop');
  if(secKey === 'bestiary') backdrop.style.backgroundImage = "url('https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1600&auto=format&fit=crop')";
  else if(secKey === 'nations') backdrop.style.backgroundImage = "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop')";
  else backdrop.style.backgroundImage = "url('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1600&auto=format&fit=crop')";

  lucide.createIcons();
}

// DASHBOARD WIDGETY
function renderDashboardWidgets() {
  const track = document.getElementById('dashboardWidgetsTrack');
  const widgetsData = [
    { target: 'bestiary', title: 'Bestiář', sub: `${bestiary.length} tvorů`, img: bestiary[0]?.img },
    { target: 'nations', title: 'Národy & Říše', sub: `${nations.length} království`, img: nations[0]?.img },
    { target: 'story', title: 'Příběh', sub: 'Kapitoly & Poznámky', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop' },
    { target: 'gallery', title: 'Galerie', sub: 'Koncepty & Art', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop' }
  ];

  track.innerHTML = widgetsData.map(w => `
    <div class="widget-card" onclick="switchSection('${w.target}')">
      <div class="widget-img-wrapper">
        <img src="${w.img}" alt="${w.title}">
      </div>
      <div class="widget-card-title">${w.title}</div>
      <div class="widget-card-sub">${w.sub}</div>
      <div class="widget-card-link">Otevřít sekci <i data-lucide="arrow-right" style="width:14px;"></i></div>
    </div>
  `).join('');
}

function slideCarousel(direction) {
  const track = document.getElementById('dashboardWidgetsTrack');
  carouselOffset += direction * 230;
  if(carouselOffset < 0) carouselOffset = 0;
  if(carouselOffset > 230) carouselOffset = 230;
  track.style.transform = `translateX(-${carouselOffset}px)`;
}

// RENDEROVÁNÍ BESTIÁŘE
function renderBestiary() {
  const grid = document.getElementById('bestiaryGrid');
  const filterContainer = document.getElementById('bestiaryFilters');

  const subcats = ['all', ...new Set(bestiary.map(i => i.subcat).filter(Boolean))];

  filterContainer.innerHTML = subcats.map(sc => `
    <button class="filter-chip ${sc === activeBestiaryFilter ? 'active' : ''}" onclick="setBestiaryFilter('${sc}')">
      ${sc === 'all' ? 'Všechny tvory' : sc}
    </button>
  `).join('');

  const filtered = activeBestiaryFilter === 'all' ? bestiary : bestiary.filter(i => i.subcat === activeBestiaryFilter);

  grid.innerHTML = filtered.map((b, idx) => `
    <div class="editorial-card" onclick="openBeastDetail('${b.id}')">
      <div class="editorial-card-img-box">
        <img src="${b.img}" alt="${b.title}">
      </div>
      <div class="editorial-card-content">
        <div class="editorial-num">${b.num || ('0' + (idx + 1)).slice(-2)}</div>
        <div>
          <div class="editorial-title">${b.title}</div>
          <div class="editorial-sub">${b.subcat || 'Bestie'}</div>
          <div class="editorial-desc">${b.desc}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function setBestiaryFilter(f) {
  activeBestiaryFilter = f;
  renderBestiary();
}

// OTEVŘENÍ DETAILU TVORA
let currentBeastId = null;
let isEditingBeast = false;

function openBeastDetail(id) {
  currentBeastId = id;
  isEditingBeast = false;
  renderBeastDetailView();
  switchSection('beast-detail');
}

function renderBeastDetailView() {
  const item = bestiary.find(b => b.id === currentBeastId);
  if(!item) return;

  const editBtn = document.getElementById('btnEditBeast');
  if(editBtn) {
    if(isEditingBeast) {
      editBtn.innerHTML = `<i data-lucide="check"></i> Uložit změny`;
      editBtn.onclick = saveInlineBeastChanges;
    } else {
      editBtn.innerHTML = `<i data-lucide="edit-3"></i> Upravit stránku`;
      editBtn.onclick = toggleInlineEdit;
    }
  }

  const sheet = document.getElementById('beastDetailSheet');

  if(isEditingBeast) {
    sheet.innerHTML = `
      <div class="concept-art-background" style="background-image: url('${item.img}');"></div>

      <div class="concept-content-box">
        <div style="margin-bottom: 0.5rem;">
          <label style="font-size:0.75rem; font-weight:700; color:#7A3B39;">ČÍSLO:</label>
          <input type="text" id="editNum" class="inline-edit-input" value="${item.num || ''}" style="width: 80px;">
        </div>

        <div style="margin-bottom: 0.5rem;">
          <label style="font-size:0.75rem; font-weight:700; color:#7A3B39;">JMÉNO / TITUL:</label>
          <input type="text" id="editTitle" class="inline-edit-input" value="${item.title || ''}" style="font-size: 2.2rem; font-family: var(--font-hand); font-weight:700;">
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="font-size:0.75rem; font-weight:700; color:#7A3B39;">PODTITUL / ŽIVEL:</label>
          <input type="text" id="editSubcat" class="inline-edit-input" value="${item.subcat || ''}" style="font-size: 1.5rem; font-family: var(--font-hand);">
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="font-size:0.75rem; font-weight:700; color:#7A3B39;">HLAVNÍ POPIS & LORE:</label>
          <textarea id="editDesc" class="inline-edit-textarea" rows="5">${item.desc || ''}</textarea>
        </div>

        <div class="concept-section-block">
          <div class="concept-block-title">Poznámky z výzkumu</div>
          <textarea id="editNotes" class="inline-edit-textarea" rows="3">${item.notes || ''}</textarea>
        </div>

        <div class="concept-section-block">
          <div class="concept-block-title">Schopnosti a kouzla</div>
          <input type="text" id="editSpells" class="inline-edit-input" value="${item.spells || ''}" style="font-size:1.3rem; font-family:var(--font-hand);">
        </div>

        <div class="concept-section-block">
          <div class="concept-block-title">URL obrázku pozadí</div>
          <input type="text" id="editImg" class="inline-edit-input" value="${item.img || ''}">
        </div>
      </div>

      <div class="concept-extra-gallery">
        <div class="concept-extra-card">
          <img src="${item.mapImg || item.img}" alt="Mapa teritoria">
          <div class="concept-extra-card-title">Mapa výskytu</div>
          <p style="font-family:var(--font-hand); font-size:1.2rem;">Ruòny, komora VIII</p>
        </div>
        <div class="concept-extra-card">
          <img src="${item.img}" alt="Anatomie">
          <div class="concept-extra-card-title">Anatomická skica</div>
          <p style="font-family:var(--font-hand); font-size:1.2rem;">Detail lebky / pařátů</p>
        </div>
      </div>
    `;
  } else {
    sheet.innerHTML = `
      <div class="concept-art-background" style="background-image: url('${item.img}');"></div>

      <div class="concept-content-box">
        <div class="concept-header-num">${item.num || '01'}</div>
        <h1 class="concept-main-title">${item.title}</h1>
        <div class="concept-sub-title">${item.subcat || 'Lore Record'}</div>

        <p class="concept-hand-text">${item.desc}</p>

        <div class="concept-section-block">
          <div class="concept-block-title">Poznámky z výzkumu</div>
          <p class="concept-hand-text" style="font-size:1.3rem;">${item.notes || 'Bytost reaguje na elementární výkyvy v okolí.'}</p>
        </div>

        <div class="concept-section-block">
          <div class="concept-block-title">Schopnosti a kouzla</div>
          <p class="concept-hand-text" style="font-size:1.3rem;">${item.spells || 'Neznámé schopnosti.'}</p>
        </div>
      </div>

      <div class="concept-extra-gallery">
        <div class="concept-extra-card">
          <img src="${item.mapImg || item.img}" alt="Mapa teritoria">
          <div class="concept-extra-card-title">Mapa výskytu / Teritorium</div>
          <p style="font-family:var(--font-hand); font-size:1.2rem;">Ruòny, komora VIII</p>
        </div>
        <div class="concept-extra-card">
          <img src="${item.img}" alt="Anatomie">
          <div class="concept-extra-card-title">Anatomická skica</div>
          <p style="font-family:var(--font-hand); font-size:1.2rem;">Detail lebky / pařátů</p>
        </div>
      </div>
    `;
  }

  lucide.createIcons();
}

function toggleInlineEdit() {
  isEditingBeast = true;
  renderBeastDetailView();
}

function saveInlineBeastChanges() {
  const idx = bestiary.findIndex(b => b.id === currentBeastId);
  if(idx === -1) return;

  const newNum = document.getElementById('editNum').value;
  const newTitle = document.getElementById('editTitle').value;
  const newSubcat = document.getElementById('editSubcat').value;
  const newDesc = document.getElementById('editDesc').value;
  const newNotes = document.getElementById('editNotes').value;
  const newSpells = document.getElementById('editSpells').value;
  const newImg = document.getElementById('editImg').value;

  if(!newTitle) {
    alert('Jméno tvora nemůže být prázdné!');
    return;
  }

  bestiary[idx] = {
    ...bestiary[idx],
    num: newNum || '01',
    title: newTitle,
    subcat: newSubcat,
    desc: newDesc,
    notes: newNotes,
    spells: newSpells,
    img: newImg || bestiary[idx].img
  };

  saveData();
  renderBestiary();
  renderDashboardWidgets();

  isEditingBeast = false;
  renderBeastDetailView();
}

function openCreateBestiaryModal() {
  const title = prompt('Jméno nového tvora:');
  if(!title) return;

  const newBeast = {
    id: 'best_' + Date.now(),
    num: '0' + (bestiary.length + 1),
    title: title,
    subcat: 'Nová bestie',
    desc: 'Zde napište popis a historii tvora...',
    notes: 'Poznámky z terénu...',
    spells: 'Základní schopnosti',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop'
  };

  bestiary.push(newBeast);
  saveData();
  renderBestiary();
  renderDashboardWidgets();
  openBeastDetail(newBeast.id);
  toggleInlineEdit();
}

// RENDEROVÁNÍ NÁRODŮ
function renderNations() {
  const grid = document.getElementById('nationsGrid');
  grid.innerHTML = nations.map(n => {
    const cityCount = cities.filter(c => c.nationId === n.id).length;
    return `
      <div class="grid-card" onclick="openNationDetail('${n.id}')">
        <img src="${n.img}" class="grid-card-img" alt="${n.title}">
        <div class="grid-card-body">
          <span class="grid-card-badge">${cityCount} lokací</span>
          <h3 style="font-size:1.2rem; font-weight:700;">${n.title}</h3>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-top:0.3rem;">${n.desc}</p>
        </div>
      </div>
    `;
  }).join('');
}

function openNationDetail(nationId) {
  activeNationId = nationId;
  const nation = nations.find(n => n.id === nationId);
  if(!nation) return;

  document.getElementById('nationDetailTitle').innerText = nation.title;
  document.getElementById('nationDetailDesc').innerText = nation.desc;

  renderNationCities();
  switchSection('nation-detail');
}

function renderNationCities() {
  const grid = document.getElementById('nationCitiesGrid');
  const nationCities = cities.filter(c => c.nationId === activeNationId);

  if(nationCities.length === 0) {
    grid.innerHTML = `<p style="color:var(--color-text-muted); grid-column:1/-1;">V tomto národě zatím nejsou žádná města.</p>`;
    return;
  }

  grid.innerHTML = nationCities.map(c => `
    <div class="grid-card" onclick="showCityDetail('${c.title.replace(/'/g, "\\'")}', '${c.desc.replace(/'/g, "\\'")}')">
      <img src="${c.img}" class="grid-card-img" alt="${c.title}">
      <div class="grid-card-body">
        ${c.subcat ? `<span class="grid-card-badge">${c.subcat}</span>` : ''}
        <h3 style="font-size:1.1rem; font-weight:700;">${c.title}</h3>
        <p style="font-size:0.85rem; color:var(--color-text-muted); margin-top:0.3rem;">${c.desc}</p>
      </div>
    </div>
  `).join('');
}

function showCityDetail(title, desc) {
  alert(`${title}\n\n${desc}`);
}

// MAPA
function renderMapPins() {
  const map = document.getElementById('worldMap');
  map.querySelectorAll('.map-pin').forEach(p => p.remove());

  pins.forEach(pin => {
    const p = document.createElement('div');
    p.className = 'map-pin';
    p.style.left = `${pin.x}%`;
    p.style.top = `${pin.y}%`;
    p.innerHTML = `<div class="pin-badge">${pin.title}</div>`;
    p.onclick = (e) => {
      e.stopPropagation();
      alert(`Místo: ${pin.title}`);
    };
    map.appendChild(p);
  });
}

function handleMapClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
  const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);

  const title = prompt('Název bodu na mapě:');
  if(!title) return;

  pins.push({ id: 'pin_' + Date.now(), x, y, title, entityId: cities[0]?.id });
  saveData();
  renderMapPins();
}

// EDITOR
function renderChapters() {
  const container = document.getElementById('chapterListContainer');
  container.innerHTML = chapters.map(c => `
    <button class="chapter-btn ${c.id === activeChapterId ? 'active' : ''}" onclick="selectChapter(${c.id})">
      ${c.title}
    </button>
  `).join('');

  const active = chapters.find(c => c.id === activeChapterId);
  const editor = document.getElementById('chapterEditor');
  editor.value = active ? active.text : '';
  updateWordCount(editor.value);
}

function selectChapter(id) {
  activeChapterId = id;
  renderChapters();
}

function createNewChapter() {
  const title = prompt('Název kapitoly:');
  if(!title) return;
  const newC = { id: Date.now(), title, text: '' };
  chapters.push(newC);
  activeChapterId = newC.id;
  saveData();
  renderChapters();
}

function updateChapterText(val) {
  const c = chapters.find(chap => chap.id === activeChapterId);
  if(c) {
    c.text = val;
    saveData();
    updateWordCount(val);
  }
}

function updateWordCount(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById('wordCount').innerText = `${words} slov | ${text.length} znaků`;
}

// GALERIE
function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = gallery.map(g => `
    <div class="gallery-card">
      <img src="${g.url}" alt="${g.title}">
    </div>
  `).join('');
}

function addGalleryImage() {
  const url = prompt('URL obrázku:');
  if(!url) return;
  gallery.push({ title: 'Koncept', url });
  saveData();
  renderGallery();
}

// EXPORT / IMPORT
function exportData() {
  const fullBackup = { nations, cities, bestiary, pins, chapters, gallery };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `aetheria_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function triggerImport() {
  document.getElementById('importFileInput').click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.nations) nations = imported.nations;
      if (imported.cities) cities = imported.cities;
      if (imported.bestiary) bestiary = imported.bestiary;
      if (imported.pins) pins = imported.pins;
      if (imported.chapters) chapters = imported.chapters;
      if (imported.gallery) gallery = imported.gallery;

      saveData();
      location.reload();
    } catch (err) {
      alert('Chyba při načítání souboru se zálohou!');
    }
  };
  reader.readAsText(file);
}

// MODÁLY PRO NÁRODY A MĚSTA
function openCreateNationModal() {
  document.getElementById('createNationModal').classList.add('active');
}

function saveNewNation() {
  const title = document.getElementById('newNationTitle').value;
  const sub = document.getElementById('newNationSub').value;
  const desc = document.getElementById('newNationDesc').value;
  const img = document.getElementById('newNationImg').value;

  if(!title) return;

  nations.push({
    id: 'nat_' + Date.now(),
    title,
    sub: sub || 'Neznámé zřízení',
    desc,
    img: img || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'
  });

  saveData();
  renderNations();
  renderDashboardWidgets();
  closeModal('createNationModal');
}

function openCreateCityModal() {
  const select = document.getElementById('newCityNationSelect');
  select.innerHTML = nations.map(n => `<option value="${n.id}">${n.title}</option>`).join('');
  if(activeNationId) select.value = activeNationId;

  document.getElementById('createCityModal').classList.add('active');
}

function saveNewCity() {
  const title = document.getElementById('newCityTitle').value;
  const nationId = document.getElementById('newCityNationSelect').value;
  const subcat = document.getElementById('newCitySubcat').value;
  const desc = document.getElementById('newCityDesc').value;
  const img = document.getElementById('newCityImg').value;

  if(!title) return;

  cities.push({
    id: 'cit_' + Date.now(),
    nationId,
    title,
    subcat: subcat || 'Osada',
    desc,
    img: img || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop'
  });

  saveData();
  if(activeNationId) renderNationCities();
  renderNations();
  closeModal('createCityModal');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function saveData() {
  localStorage.setItem('aeth_nations', JSON.stringify(nations));
  localStorage.setItem('aeth_cities', JSON.stringify(cities));
  localStorage.setItem('aeth_bestiary', JSON.stringify(bestiary));
  localStorage.setItem('aeth_pins', JSON.stringify(pins));
  localStorage.setItem('aeth_chapters', JSON.stringify(chapters));
  localStorage.setItem('aeth_gallery', JSON.stringify(gallery));
}

function resetData() {
  if(confirm('Obnovit výchozí data? Všechny vaše úpravy budou smazány.')) {
    localStorage.clear();
    location.reload();
  }
}