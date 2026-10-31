(() => {
  let focused = false, generation = 0, lastActivity = performance.now(), previousTick = performance.now();
  let writing = false, storageOK = true, saveTimer;
  const read = (key,fallback) => {try{return localStorage.getItem(key) ?? fallback;}catch{return fallback;}};
  const save = (key,value) => {try{localStorage.setItem(key,String(value));if(key==='aetheria.reader.draft'||key==='aetheria.reader.chapters'||key.startsWith('aetheria.reader.chapter.')||key.startsWith('aetheria.reader.meta.'))document.dispatchEvent(new Event('aetheria:readerchange'));return true;}catch{storageOK=false;return false;}};
  let seconds = Number(read('aetheria.reader.seconds','0')) || 0;
  const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1;
  const svg = body => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${body}</svg>`;
  const clock = svg('<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>');
  const sun = svg('<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12l2 2M4 20l2-2M18 6l2-2"/>');
  let dock, article, caption, timer, theme, nav, chapterPanel, chapterTitle, saveStatus;
  let currentChapter = 'intro';
  let addedChapters;
  try { addedChapters=JSON.parse(read('aetheria.reader.chapters','[]')); } catch { addedChapters=[]; }
  if(!Array.isArray(addedChapters))addedChapters=[];
  const chapterData = () => [...(Array.isArray(worldData.chapters) && worldData.chapters.length
    ? worldData.chapters : [{id:'intro',title:'Úvod',text:'Zde můžete číst příběhy, záznamy ze světa a hlavní lore.'}]),...addedChapters];
  function alignChapters() {
    if(!chapterPanel || chapterPanel.hidden)return;
    const left=dock.querySelector('.reader-mode').getBoundingClientRect().left-dock.getBoundingClientRect().left;
    chapterPanel.style.left=`${left}px`;
  }
  const draftKey = () => currentChapter === 'intro' ? 'aetheria.reader.draft' : `aetheria.reader.chapter.${currentChapter}`;
  function chapterInfo(chapter,index=0) {
    const id=String(chapter.id ?? index);
    let meta={};
    try { meta=JSON.parse(read(`aetheria.reader.meta.${id}`,'{}')) || {}; } catch {}
    return {
      title:typeof meta.title==='string'?meta.title:(chapter.title || `Kapitola ${index+1}`),
      description:typeof meta.description==='string'?meta.description:(chapter.description ?? 'Čtení · Aetheria')
    };
  }
  function loadChapterInfo(chapter,index=0) {
    const info=chapterInfo(chapter,index);
    chapterTitle.textContent=info.title;
    caption.textContent=info.description;
    if(saveStatus)saveStatus.textContent='';
  }
  function saveChapterInfo() {
    const success=save(`aetheria.reader.meta.${currentChapter}`,JSON.stringify({title:chapterTitle.textContent,description:caption.textContent}));
    saveStatus.textContent=success?'':'Změny se nepodařilo uložit.';
  }
  function closeChapters() {
    if(!chapterPanel)return;
    chapterPanel.hidden=true;
    dock.querySelector('.reader-chapters').setAttribute('aria-expanded','false');
  }
  function toggleChapters() {
    if(!chapterPanel.hidden){closeChapters();return;}
    chapterPanel.replaceChildren();
    const header=document.createElement('div');header.className='reader-chapters-header';
    const title=document.createElement('p');title.className='reader-chapters-title';title.textContent='Kapitoly';
    const add=document.createElement('button');add.type='button';add.className='reader-chapter-add';add.textContent='+';add.setAttribute('aria-label','Přidat novou kapitolu');add.title='Přidat novou kapitolu';
    add.addEventListener('click',()=>{
      save(draftKey(),article.innerText);
      const chapter={id:`local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,title:`Kapitola ${chapterData().length}`,text:''};
      const next=[...addedChapters,chapter];
      if(!save('aetheria.reader.chapters',JSON.stringify(next))){saveStatus.textContent='Novou kapitolu se nepodařilo uložit.';return;}
      addedChapters=next;currentChapter=chapter.id;article.textContent='';
      loadChapterInfo(chapter);
      closeChapters();setMode(true);window.scrollTo({top:0,behavior:'instant'});
    });
    header.append(title,add);chapterPanel.append(header);
    chapterData().forEach((chapter,index)=>{
      const id=String(chapter.id ?? index);
      const button=document.createElement('button');button.type='button';button.textContent=chapterInfo(chapter,index).title || `Kapitola ${index+1}`;
      button.setAttribute('aria-current',id===currentChapter?'true':'false');
      button.addEventListener('click',()=>{
        save(draftKey(),article.innerText);
        currentChapter=id;
        article.textContent=read(draftKey(),chapter.text ?? chapter.content ?? '');
        loadChapterInfo(chapter,index);
        closeChapters();setMode(writing);
        if(!writing)dock.querySelector('.reader-chapters').focus({preventScroll:true});
        window.scrollTo({top:0,behavior:'instant'});
      });
      chapterPanel.append(button);
    });
    window.AetheriaReaderBackups?.mount(chapterPanel);
    chapterPanel.hidden=false;alignChapters();
    dock.querySelector('.reader-chapters').setAttribute('aria-expanded','true');
    chapterPanel.querySelector('button[aria-current=true]')?.focus({preventScroll:true});
  }
  function setMode(write) {
    writing = write; article.contentEditable = String(write);
    article.setAttribute('role',write?'textbox':'article');
    article.setAttribute('aria-label',write?'Text příběhu – úpravy':'Text příběhu');
    article.setAttribute('aria-multiline',String(write));
    dock.querySelectorAll('[data-write]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.write==='true')===write)));
    [chapterTitle,caption].forEach((element,index)=>{
      element.contentEditable=write?'plaintext-only':'false';
      element.setAttribute('aria-label',index===0?'Název kapitoly':'Krátký popis kapitoly');
      if(write){element.setAttribute('role','textbox');element.setAttribute('aria-multiline','false');}
      else {element.removeAttribute('role');element.removeAttribute('aria-multiline');}
    });
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
      return element.animate([{transform:`translateX(${dest.x+dest.width/2-rect.x-rect.width/2}px) scale(.15)`,opacity:0},{transform:'translateX(0) scale(1)',opacity:1}],{duration:280*motion(),delay:(dock.querySelectorAll('[data-reveal]').length-1-index)*65*motion(),fill:'both',easing:'cubic-bezier(.2,.8,.25,1)'});
    });
    await finish(animations);if(token!==generation)return;
    dock.inert=false;dock.querySelectorAll('[data-reveal]').forEach(e=>e.inert=false);
  }
  async function exit(animate=true) {
    if(!focused)return;focused=false;const token=++generation;
    dock.inert=true;closeChapters();
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
    window.addEventListener('resize',alignChapters);
    const section=document.getElementById('cteni');
    section.innerHTML='<h2>Vítejte v Aetherii</h2><p class="reader-caption">Čtení · Aetheria</p><article class="reader-article" spellcheck="true"></article><p class="reader-save-status" role="status"></p>';
    article=section.querySelector('article');caption=section.querySelector('.reader-caption');
    chapterTitle=section.querySelector('h2');saveStatus=section.querySelector('.reader-save-status');
    [chapterTitle,caption].forEach(element=>{
      element.contentEditable='false';element.spellcheck=true;
      element.addEventListener('input',saveChapterInfo);
      element.addEventListener('keydown',event=>{if(event.key==='Enter')event.preventDefault();});
    });
    const firstChapter=chapterData()[0];currentChapter=String(firstChapter.id ?? 0);
    article.textContent=read(draftKey(),firstChapter.text ?? firstChapter.content ?? '');
    loadChapterInfo(firstChapter);
    window.AetheriaReaderBackups?.register(()=>chapterData().map((chapter,index)=>{
      const id=String(chapter.id ?? index),info=chapterInfo(chapter,index);
      return {
        id,title:id===currentChapter?chapterTitle.textContent:info.title,
        description:id===currentChapter?caption.textContent:info.description,
        text:id===currentChapter?article.innerText:read(id==='intro'?'aetheria.reader.draft':`aetheria.reader.chapter.${id}`,chapter.text ?? chapter.content ?? '')
      };
    }));
    document.addEventListener('aetheria:backupstatus',event=>{if(event.detail.error)saveStatus.textContent=event.detail.text;});
    article.contentEditable='false';
    dock=document.createElement('div');dock.className='reader-dock';dock.hidden=true;dock.setAttribute('role','group');dock.setAttribute('aria-label','Ovládání čtení');
    dock.innerHTML=`<button class="reader-tool reader-timer" data-reveal title="Vynulovat čas aktivity">${clock}<span>0:00</span></button><div class="reader-tool reader-mode" data-reveal role="group" aria-label="Režim textu"><button data-write="false" aria-pressed="true">Číst</button><button data-write="true" aria-pressed="false">Psát</button></div><button class="reader-tool reader-chapters" data-reveal aria-label="Kapitoly" aria-expanded="false" aria-controls="reader-chapter-panel" title="Kapitoly">${svg('<path d="M8 5h13M8 12h13M8 19h13"/><circle cx="3" cy="5" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="19" r="1"/>')}</button><button class="reader-tool reader-theme" data-reveal aria-label="Zapnout tmavý režim" aria-pressed="false">${sun}</button><button class="reader-tool reader-home" aria-label="Zobrazit hlavní navigaci" title="Zobrazit hlavní navigaci"><img src="icons/open-book.png" alt=""></button>`;
    chapterPanel=document.createElement('div');chapterPanel.id='reader-chapter-panel';chapterPanel.className='reader-chapter-panel';chapterPanel.hidden=true;chapterPanel.setAttribute('role','group');chapterPanel.setAttribute('aria-label','Výběr kapitoly');dock.append(chapterPanel);
    dock.querySelector('.reader-chapters').addEventListener('click',toggleChapters);
    document.addEventListener('pointerdown',event=>{if(!dock.contains(event.target))closeChapters();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!chapterPanel.hidden){closeChapters();dock.querySelector('.reader-chapters').focus();}});
    document.body.append(dock);timer=dock.querySelector('.reader-timer');theme=dock.querySelector('.reader-theme');
    const applyTheme=dark=>{document.body.classList.toggle('reader-dark',dark);theme.setAttribute('aria-pressed',String(dark));theme.setAttribute('aria-label',dark?'Zapnout světlý režim':'Zapnout tmavý režim');save('aetheria.reader.dark',dark);};
    applyTheme(read('aetheria.reader.dark','false')==='true');
    theme.addEventListener('click',()=>applyTheme(!document.body.classList.contains('reader-dark')));
    dock.querySelector('.reader-home').addEventListener('click',()=>exit());
    dock.querySelectorAll('[data-write]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.write==='true')));
    timer.addEventListener('click',()=>{seconds=0;lastActivity=previousTick=performance.now();save('aetheria.reader.seconds',0);updateClock();});
    article.addEventListener('input',()=>{
      const success=save(draftKey(),article.innerText);
      saveStatus.textContent=success?'':'Text se nepodařilo uložit.';
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

