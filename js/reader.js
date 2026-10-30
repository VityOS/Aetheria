(() => {
  let focused = false, generation = 0, lastActivity = performance.now(), previousTick = performance.now();
  let writing = false, storageOK = true, saveTimer;
  const read = (key,fallback) => {try{return localStorage.getItem(key) ?? fallback;}catch{return fallback;}};
  const save = (key,value) => {try{localStorage.setItem(key,String(value));return true;}catch{storageOK=false;return false;}};
  let seconds = Number(read('aetheria.reader.seconds','0')) || 0;
  const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1;
  const svg = body => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${body}</svg>`;
  const clock = svg('<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>');
  const sun = svg('<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12l2 2M4 20l2-2M18 6l2-2"/>');
  let dock, article, caption, timer, theme, nav;
  function setMode(write) {
    writing = write; article.contentEditable = String(write);
    article.setAttribute('role',write?'textbox':'article');
    article.setAttribute('aria-label',write?'Text příběhu – úpravy':'Text příběhu');
    article.setAttribute('aria-multiline',String(write));
    dock.querySelectorAll('[data-write]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.write==='true')===write)));
    caption.textContent = write ? 'Psaní · změny se ukládají v tomto prohlížeči' : 'Čtení · Aetheria';
    if(write)article.focus({preventScroll:true});
    else article.blur();
    lastActivity=performance.now();
  }
  function updateClock() {
    const total=Math.floor(seconds), hours=Math.floor(total/3600), minutes=Math.floor(total/60)%60;
    const text=hours?`${hours}:${String(minutes).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`:`${minutes}:${String(total%60).padStart(2,'0')}`;
    timer.querySelector('span').textContent=text;
    timer.setAttribute('aria-label',`Vynulovat čas aktivity, ${text}`);
  }
  const finish = animations => Promise.all(animations.map(a=>a.finished.catch(()=>{})));
  const cancelDock = () => dock.getAnimations({subtree:true}).forEach(a=>a.cancel());
  async function enter() {
    if(focused)return;
    focused=true; const token=++generation;lastActivity=performance.now();
    const indicator=document.getElementById('nav-indicator');
    getComputedStyle(indicator).transform;
    await finish(indicator.getAnimations());if(token!==generation)return;
    cancelDock();dock.hidden=false;dock.inert=true;
    const hub=dock.querySelector('.reader-home');
    const origin=document.querySelector('.active-circle').getBoundingClientRect();
    const dest=hub.getBoundingClientRect();
    const offsetX=origin.width?origin.x+origin.width/2-dest.x-dest.width/2:0;
    const offsetY=origin.width?origin.y+origin.height/2-dest.y-dest.height/2:0;
    const offset=`translate(${offsetX}px,${offsetY}px)`;
    const aligned=`translate(${offsetX}px,0)`;
    hub.style.transform=offset;hub.style.backgroundColor='#880909';
    dock.querySelectorAll('[data-reveal]').forEach(e=>{e.style.opacity='0';e.inert=true;});
    // Keep the detached red icon stationary while the bar slides away.
    document.body.classList.add('reader-detached','reader-focused');nav.inert=true;
    getComputedStyle(nav).transform;
    await finish(nav.getAnimations());if(token!==generation)return;
    await finish([hub.animate([{transform:offset},{transform:aligned}],{duration:180*motion(),fill:'forwards',easing:'ease-in-out'})]);
    if(token!==generation)return;
    await finish([hub.animate([{transform:aligned},{transform:'translate(0,0)'}],{duration:300*motion(),fill:'forwards',easing:'cubic-bezier(.2,.7,.2,1)'})]);
    if(token!==generation)return;
    await finish([hub.animate([{backgroundColor:'#880909'},{backgroundColor:'#343333'}],{duration:220*motion(),fill:'forwards'})]);
    if(token!==generation)return;
    const animations=[...dock.querySelectorAll('[data-reveal]')].map((element,index)=>{
      const rect=element.getBoundingClientRect();element.style.opacity='1';
      return element.animate([{transform:`translateX(${dest.x+dest.width/2-rect.x-rect.width/2}px) scale(.15)`,opacity:0},{transform:'translateX(0) scale(1)',opacity:1}],{duration:280*motion(),delay:(2-index)*65*motion(),fill:'both',easing:'cubic-bezier(.2,.8,.25,1)'});
    });
    await finish(animations);if(token!==generation)return;
    dock.inert=false;dock.querySelectorAll('[data-reveal]').forEach(e=>e.inert=false);
  }
  async function exit(animate=true) {
    if(!focused)return;focused=false;const token=++generation;
    dock.inert=true;
    const hub=dock.querySelector('.reader-home');
    const tools=[...dock.querySelectorAll('[data-reveal]')];
    const hubRect=hub.getBoundingClientRect();
    if(animate){
      const animations=tools.map((element,index)=>{
        const rect=element.getBoundingClientRect();
        return element.animate([{transform:getComputedStyle(element).transform,opacity:getComputedStyle(element).opacity},{transform:`translateX(${hubRect.x+hubRect.width/2-rect.x-rect.width/2}px) scale(.15)`,opacity:0}],{duration:250*motion(),delay:index*55*motion(),fill:'forwards',easing:'ease-in'});
      });
      await finish(animations);if(token!==generation)return;
      await finish([hub.animate([{backgroundColor:'#343333'},{backgroundColor:'#880909'}],{duration:220*motion(),fill:'forwards'})]);
      if(token!==generation)return;
      const target=document.querySelector('.active-circle').getBoundingClientRect();
      // The hidden bar is translated down by 160px; its resting icon is above it.
      const targetX=target.width?target.x+target.width/2-hubRect.x-hubRect.width/2:0;
      const targetY=target.width?target.y+target.height/2-hubRect.y-hubRect.height/2-160:0;
      const aligned=`translate(${targetX}px,0)`;
      const targetTransform=`translate(${targetX}px,${targetY}px)`;
      await finish([hub.animate([{transform:'translate(0,0)'},{transform:aligned}],{duration:300*motion(),fill:'forwards',easing:'cubic-bezier(.4,0,.2,1)'})]);
      if(token!==generation)return;
      await finish([hub.animate([{transform:aligned},{transform:targetTransform}],{duration:180*motion(),fill:'forwards',easing:'ease-in-out'})]);
      if(token!==generation)return;
    }
    document.body.classList.remove('reader-focused');
    getComputedStyle(nav).transform;
    if(animate)await finish(nav.getAnimations());
    if(token!==generation)return;
    dock.hidden=true;cancelDock();hub.style.transform='';hub.style.backgroundColor='';
    document.body.classList.remove('reader-detached');nav.inert=false;dock.inert=false;
    if(animate)nav.querySelectorAll('.nav-item')[2].focus({preventScroll:true});
    save('aetheria.reader.seconds',seconds);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    nav=document.querySelector('.mobile-nav');
    const section=document.getElementById('cteni');
    section.innerHTML='<h2>Vítejte v Aetherii</h2><p class="reader-caption">Čtení · Aetheria</p><article class="reader-article" spellcheck="true"></article>';
    article=section.querySelector('article');caption=section.querySelector('.reader-caption');
    article.textContent=read('aetheria.reader.draft','Zde můžete číst příběhy, záznamy ze světa a hlavní lore.');
    article.contentEditable='false';
    dock=document.createElement('div');dock.className='reader-dock';dock.hidden=true;dock.setAttribute('role','group');dock.setAttribute('aria-label','Ovládání čtení');
    dock.innerHTML=`<button class="reader-tool reader-timer" data-reveal title="Vynulovat čas aktivity">${clock}<span>0:00</span></button><div class="reader-tool reader-mode" data-reveal role="group" aria-label="Režim textu"><button data-write="false" aria-pressed="true">Číst</button><button data-write="true" aria-pressed="false">Psát</button></div><button class="reader-tool reader-theme" data-reveal aria-label="Zapnout tmavý režim" aria-pressed="false">${sun}</button><button class="reader-tool reader-home" aria-label="Zobrazit hlavní navigaci" title="Zobrazit hlavní navigaci"><img src="icons/open-book.png" alt=""></button>`;
    document.body.append(dock);timer=dock.querySelector('.reader-timer');theme=dock.querySelector('.reader-theme');
    const applyTheme=dark=>{document.body.classList.toggle('reader-dark',dark);theme.setAttribute('aria-pressed',String(dark));theme.setAttribute('aria-label',dark?'Zapnout světlý režim':'Zapnout tmavý režim');save('aetheria.reader.dark',dark);};
    applyTheme(read('aetheria.reader.dark','false')==='true');
    theme.addEventListener('click',()=>applyTheme(!document.body.classList.contains('reader-dark')));
    dock.querySelector('.reader-home').addEventListener('click',()=>exit());
    dock.querySelectorAll('[data-write]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.write==='true')));
    timer.addEventListener('click',()=>{seconds=0;lastActivity=previousTick=performance.now();save('aetheria.reader.seconds',0);updateClock();});
    article.addEventListener('input',()=>{
      const success=save('aetheria.reader.draft',article.innerText);
      caption.textContent=success?'Psaní · uloženo v tomto prohlížeči':'Psaní · uložení se nezdařilo';
    });
    ['pointerdown','keydown','scroll','touchstart','wheel'].forEach(event=>document.addEventListener(event,()=>lastActivity=performance.now(),{passive:true,capture:true}));
    setInterval(()=>{
      const now=performance.now(),delta=(now-previousTick)/1000;previousTick=now;
      if(section.classList.contains('active')&&!document.hidden&&document.hasFocus()&&now-lastActivity<60000)seconds+=Math.min(delta,2);
      updateClock();
    },1000);
    saveTimer=setInterval(()=>save('aetheria.reader.seconds',seconds),5000);
    document.addEventListener('visibilitychange',()=>{previousTick=performance.now();if(document.hidden)save('aetheria.reader.seconds',seconds);});
    window.addEventListener('pagehide',()=>save('aetheria.reader.seconds',seconds));
    document.addEventListener('aetheria:tabchange',()=>{if(section.classList.contains('active'))enter();else exit(false);});
    updateClock();
    // The reading tab is the initial page; allow layout and navigation to initialize first.
    requestAnimationFrame(()=>{if(section.classList.contains('active'))enter();});
  });
})();

