function switchTab(tabId, element) {
  if (tabId !== 'bestiar' && typeof closeSearch === 'function') {
    closeSearch();
  }

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

function generatePath(centerX) {
  const w = 380; 
  const h = 70;  
  const r = 35;  
  const R = 32; 
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

function generateFlatPath() {
  const w = 380;
  const h = 70;
  const r = 35;

  return `
    M ${r},0 
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
  const activeIcon = document.getElementById('active-icon'); 
  const navItems = document.querySelectorAll('.nav-item');
  const revolverMenu = document.getElementById('revolver-menu');

  if (indicator && index !== -1) {
    indicator.style.transform = `translateX(${index * 100}%)`;

    if (activeIcon && navItems[index]) {
      const currentImg = navItems[index].querySelector('.nav-icon');
      if (currentImg) {
        activeIcon.src = currentImg.src;
        activeIcon.alt = currentImg.alt;
      }
    }

    if (revolverMenu) {
      if (index === 4) {
        revolverMenu.classList.add('open');
      } else {
        revolverMenu.classList.remove('open');
      }
    }
    
    const centers = [38, 114, 190, 266, 342];
    
    if (pathElement) {
      if (index === 0 || index === 4) {
        pathElement.setAttribute('d', generateFlatPath());
      } else {
        pathElement.setAttribute('d', generatePath(centers[index]));
      }
    }
  }
}