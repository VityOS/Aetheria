let currentRotation = 0;
let selectedCategory = 'all';
let searchQuery = '';
let revolverGeneration = 0;
let rotationFrame = 0;
let stageAnimation;
let drag = null;
let suppressClick = false;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const slots = () => [...document.querySelectorAll('.revolver-slot')];
const normalizedAngle = value => ((value % 360) + 360) % 360;

function paintRevolver(reveal = 1) {
  const menu = document.getElementById('revolver-menu');
  slots().forEach((slot, index, all) => {
    const angle = normalizedAngle(180 + index * 360 / all.length + currentRotation);
    const visible = angle >= 90 && angle <= 270;
    const radians = angle * Math.PI / 180;
    const radius = 76;
    slot.style.transform = `translate(${Math.cos(radians) * radius * reveal - 22}px, ${Math.sin(radians) * radius * reveal - 22}px) scale(${reveal})`;
    slot.style.opacity = visible ? reveal : 0;
    slot.style.visibility = visible ? 'visible' : 'hidden';
    const interactive = visible && menu.classList.contains('ready') && !menu.classList.contains('search-active');
    slot.style.pointerEvents = interactive ? 'auto' : 'none';
    slot.tabIndex = interactive ? 0 : -1;
    slot.setAttribute('aria-hidden', String(!visible));
    slot.setAttribute('aria-pressed', String(slot.dataset.category === selectedCategory));
    slot.classList.toggle('active', slot.dataset.category === selectedCategory);
  });
}

function rotateRevolver(target, onEnd) {
  cancelAnimationFrame(rotationFrame);
  const from = currentRotation;
  const start = performance.now();
  const duration = reducedMotion() ? 0 : 320;
  const tick = now => {
    const t = duration ? Math.min(1, (now - start) / duration) : 1;
    currentRotation = from + (target - from) * (1 - Math.pow(1 - t, 3));
    paintRevolver();
    if (t < 1) rotationFrame = requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  };
  rotationFrame = requestAnimationFrame(tick);
}

function chooseCategory(index) {
  const all = slots();
  const base = -index * 360 / all.length;
  const target = currentRotation + ((base - currentRotation + 540) % 360 + 360) % 360 - 180;
  selectedCategory = all[index].dataset.category;
  renderBestiary();
  rotateRevolver(target);
}

async function setRevolverOpen(open, navigationAnimation) {
  const generation = ++revolverGeneration;
  const menu = document.getElementById('revolver-menu');
  cancelAnimationFrame(rotationFrame);
  stageAnimation?.cancel();
  menu.getAnimations({subtree:true}).forEach(animation => animation.cancel());
  menu.classList.remove('ready', 'open', 'search-active');
  menu.querySelector('.search-wrapper').classList.remove('expanded');
  menu.inert = true;
  drag = null;
  if (!open) return;
  // Wait for the actual navigation transition rather than a parallel timeout.
  await Promise.all((navigationAnimation || []).map(animation => animation.finished.catch(() => {})));
  if (generation !== revolverGeneration) return;
  menu.classList.add('open');
  const stage = menu.querySelector('.revolver-stage');
  stageAnimation = stage.animate([
    {transform:'translateY(0) scale(.75)',opacity:0},
    {transform:'translateY(-148px) scale(1.04)',opacity:1,offset:.8},
    {transform:'translateY(-140px) scale(1)',opacity:1}
  ], {duration:reducedMotion()?0:440,fill:'forwards',easing:'cubic-bezier(.2,.7,.25,1)'});
  paintRevolver(0);
  await stageAnimation.finished.catch(() => {});
  if (generation !== revolverGeneration) return;
  paintRevolver();
  const visible = slots().filter(slot => slot.style.visibility === 'visible');
  const animations = visible.map((slot,index) => slot.animate([
    {transform:'translate(-22px,-22px) scale(.1)',opacity:0},
    {transform:slot.style.transform,opacity:1}
  ], {duration:reducedMotion()?0:280,delay:reducedMotion()?0:index*75,easing:'cubic-bezier(.2,.8,.25,1.15)',fill:'backwards'}));
  await Promise.all(animations.map(animation => animation.finished.catch(()=>{})));
  if (generation !== revolverGeneration) return;
  menu.classList.add('ready'); menu.inert = false; paintRevolver();
}

function openSearch() {
  const menu = document.getElementById('revolver-menu');
  if (!menu.classList.contains('ready')) return;
  menu.classList.add('search-active');
  menu.querySelector('.search-wrapper').classList.add('expanded');
  paintRevolver();
  document.getElementById('bestiary-search-input').focus();
}
function closeSearch(event) {
  event?.stopPropagation();
  const menu = document.getElementById('revolver-menu');
  menu.classList.remove('search-active');
  menu.querySelector('.search-wrapper').classList.remove('expanded');
  document.getElementById('bestiary-search-input').value = '';
  searchQuery = ''; renderBestiary(); paintRevolver();
}
function searchBestiary(query) { searchQuery = query; renderBestiary(); }
function filterBestiary(category) {
  const index = slots().findIndex(slot => slot.dataset.category === category);
  if (index >= 0) chooseCategory(index);
}
function renderBestiary() {
  const list = document.getElementById('bestiary-list');
  const items = (worldData.bestiary || defaultData.bestiary).filter(item =>
    (selectedCategory === 'all' || item.category === selectedCategory || (item.elements || []).includes(selectedCategory)) &&
    `${item.name} ${item.desc}`.toLocaleLowerCase('cs').includes(searchQuery.toLocaleLowerCase('cs')));
  list.replaceChildren();
  if (!items.length) {
    const message = document.createElement('p'); message.className = 'bestiary-empty';
    message.textContent = 'V této kategorii zatím nejsou žádní tvorové odpovídající hledání.';
    list.append(message);
  }
  items.forEach(item => {
    const card = document.createElement('div');card.className='card';
    const title = document.createElement('h3');title.textContent=item.name;
    const description = document.createElement('p');description.textContent=item.desc;
    card.append(title,description);list.append(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('revolver-menu'); menu.inert = true;
  const ring = document.getElementById('revolver-ring');
  slots().forEach((slot,index) => slot.addEventListener('click', event => {
    if (suppressClick) {event.preventDefault();return;}
    chooseCategory(index);
  }));
  const angleAt = event => {
    const rect = ring.getBoundingClientRect();
    return Math.atan2(event.clientY-rect.top-rect.height/2,event.clientX-rect.left-rect.width/2)*180/Math.PI;
  };
  ring.addEventListener('pointerdown', event => {
    if (!menu.classList.contains('ready') || event.button !== 0) return;
    cancelAnimationFrame(rotationFrame); suppressClick=false;
    drag={id:event.pointerId,last:angleAt(event),x:event.clientX,y:event.clientY,moved:false};
  });
  ring.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    if (Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6) {
      if(!drag.moved) ring.setPointerCapture(event.pointerId);
      drag.moved=true; suppressClick=true;
    }
    if (!drag.moved) return;
    const next=angleAt(event);
    currentRotation += ((next-drag.last+540)%360)-180;
    drag.last=next;paintRevolver();
  });
  const release=event=>{
    if(!drag || drag.id!==event.pointerId)return;
    const moved=drag.moved;drag=null;
    if(ring.hasPointerCapture(event.pointerId))ring.releasePointerCapture(event.pointerId);
    if(moved){
      const all=slots();
      const index=all.reduce((best,slot,i)=>{
        const distance=j=>Math.abs(((j*360/all.length+currentRotation+540)%360)-180);
        return distance(i)<distance(best)?i:best;
      },0);
      chooseCategory(index);
    }
  };
  ring.addEventListener('pointerup',release);ring.addEventListener('pointercancel',release);
  ring.addEventListener('lostpointercapture',event=>{if(event.target===ring && drag?.id===event.pointerId)drag=null;});
  ring.addEventListener('wheel',event=>{
    if(!menu.classList.contains('ready'))return;
    event.preventDefault();
    const all=slots(), index=all.findIndex(slot=>slot.dataset.category===selectedCategory);
    chooseCategory((index+(event.deltaY>0?1:-1)+all.length)%all.length);
  },{passive:false});
  ring.addEventListener('keydown',event=>{
    if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();const all=slots(),index=all.findIndex(slot=>slot.dataset.category===selectedCategory);
    chooseCategory((index+(['ArrowDown','ArrowRight'].includes(event.key)?1:-1)+all.length)%all.length);
  });
  document.getElementById('bestiary-search-input').addEventListener('keydown',event=>{if(event.key==='Escape')closeSearch(event);});
  paintRevolver();
});

