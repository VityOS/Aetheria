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
  document.dispatchEvent(new Event('aetheria:tabchange'));
}

// The mask clips the same cutout against the rounded bar at every position.
function generatePath(centerX) {
  const radius = 32;
  const cutoutWidth = 46;

  return `
    M ${centerX - cutoutWidth},-40
    L ${centerX - cutoutWidth},0
    C ${centerX - radius},0 ${centerX - radius},${radius} ${centerX},${radius}
    C ${centerX + radius},${radius} ${centerX + radius},0 ${centerX + cutoutWidth},0
    L ${centerX + cutoutWidth},-40
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

    if (revolverMenu && typeof setRevolverOpen === 'function') {
      const open = index === 4;
      if (revolverMenu._requestedOpen !== open) {
        revolverMenu._requestedOpen = open;
        // Flush the navigation transition so the following phase awaits it.
        getComputedStyle(indicator).transform;
        setRevolverOpen(open, indicator.getAnimations());
      }
    }

    // Use real CSS pixels: a fixed 380-unit SVG drifts away from the icons
    // when the responsive bar grows or shrinks.
    const nav = document.querySelector('.mobile-nav');
    const width = nav.getBoundingClientRect().width;
    const background = nav.querySelector('.nav-bg');
    if (width > 0) {
      background.setAttribute('viewBox', `0 0 ${width} 70`);
      background.setAttribute('preserveAspectRatio', 'none');
      background.querySelector('mask').setAttribute('width', width);
      background.querySelectorAll('rect').forEach(rect => rect.setAttribute('width', width));
    }
    const center = (width || 380) * (index + .5) / 5;
    
    if (pathElement) {
      pathElement.setAttribute('d', generatePath(center));
    }
  }
}

window.addEventListener('resize', () => {
  const buttons = [...document.querySelectorAll('.nav-item')];
  const index = buttons.findIndex(button => button.classList.contains('active'));
  if (index >= 0) moveIndicator(index);
});
