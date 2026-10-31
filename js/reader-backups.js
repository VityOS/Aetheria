/* Plain-text chapter backups to a user-selected folder, plus portable ZIP export. */
(() => {
  let provider, folder = null, debounce, queue = Promise.resolve(), message = 'Složka záloh není připojená.';
  const listeners = new Set();
  function status(text,error=false) {
    message=text;listeners.forEach(update=>update());
    document.dispatchEvent(new CustomEvent('aetheria:backupstatus',{detail:{text,error}}));
  }
  const filename = id => `kapitola-${encodeURIComponent(String(id)).slice(0,120)}.txt`;
  const serialize = chapter => `${chapter.title}\r\n${chapter.description}\r\n\r\n${chapter.text.replace(/\r?\n/g,'\r\n')}\r\n`;
  async function write(directory,name,text) {
    const handle=await directory.getFileHandle(name,{create:true});
    const stream=await handle.createWritable();
    try {await stream.write(text);await stream.close();}
    catch(error){try{await stream.abort();}catch{}throw error;}
  }
  async function existing(directory,name) {
    try{return await (await (await directory.getFileHandle(name)).getFile()).text();}
    catch(error){if(error.name==='NotFoundError')return null;throw error;}
  }
  function backup() {
    if(!folder||!provider)return Promise.resolve();
    const selectedFolder=folder;
    queue=queue.catch(()=>{}).then(async()=>{
      const chapters=provider();
      status('Ukládám zálohy…');
      const date=new Date(), day=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
      const hour=String(date.getHours()).padStart(2,'0');
      for(const chapter of chapters){
        const name=filename(chapter.id), text=serialize(chapter);
        const old=await existing(selectedFolder,name);
        if(old===text)continue;
        // Before overwriting, preserve the first prior version from this hour.
        if(old!==null){
          const history=await selectedFolder.getDirectoryHandle('Historie',{create:true});
          const dated=await history.getDirectoryHandle(day,{create:true});
          const oldName=`${hour}h-${name}`;
          if(await existing(dated,oldName)===null)await write(dated,oldName,old);
        }
        await write(selectedFolder,name,text);
      }
      await write(selectedFolder,'aetheria-zaloha.json',JSON.stringify({version:1,savedAt:new Date().toISOString(),chapters},null,2));
      status(`Zálohováno do ${selectedFolder.name} v ${new Date().toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}.`);
    }).catch(error=>{
      status(`Záloha se nezdařila. ${error.name==='NotAllowedError'?'Znovu připoj složku záloh.':'Zkontroluj přístup ke složce a volné místo.'}`,true);
    });
    return queue;
  }
  async function connect() {
    if(!window.showDirectoryPicker){status('Tento prohlížeč neumí připojit složku. Použij „Stáhnout ZIP“.');return;}
    try{
      // Called directly from a click: the browser owns the permission prompt.
      folder=await window.showDirectoryPicker({id:'aetheria-backups',mode:'readwrite'});
      await backup();
    }catch(error){if(error.name!=='AbortError')status('Složku se nepodařilo připojit. Můžeš stáhnout ZIP.',true);}
  }
  // ZIP with stored entries, so no external library or connection is needed.
  const encoder=new TextEncoder();
  function crc32(bytes){let crc=0xffffffff;for(const value of bytes){crc^=value;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
  function header(size,values){const data=new Uint8Array(size),view=new DataView(data.buffer);for(const [offset,value,bits] of values)bits===16?view.setUint16(offset,value,true):view.setUint32(offset,value,true);return data;}
  function download(){
    if(!provider)return;
    const chapters=provider();
    const files=chapters.map(chapter=>({name:filename(chapter.id),text:serialize(chapter)}));
    files.push({name:'aetheria-zaloha.json',text:JSON.stringify({version:1,savedAt:new Date().toISOString(),chapters},null,2)});
    let offset=0,centralSize=0;const parts=[],central=[];
    for(const file of files){
      const name=encoder.encode(file.name),data=encoder.encode(file.text),crc=crc32(data);
      const local=header(30,[[0,0x04034b50,32],[4,20,16],[6,0x800,16],[14,crc,32],[18,data.length,32],[22,data.length,32],[26,name.length,16]]);
      parts.push(local,name,data);
      const entry=header(46,[[0,0x02014b50,32],[4,20,16],[6,20,16],[8,0x800,16],[16,crc,32],[20,data.length,32],[24,data.length,32],[28,name.length,16],[42,offset,32]]);
      central.push(entry,name);centralSize+=entry.length+name.length;offset+=local.length+name.length+data.length;
    }
    const end=header(22,[[0,0x06054b50,32],[8,files.length,16],[10,files.length,16],[12,centralSize,32],[16,offset,32]]);
    const url=URL.createObjectURL(new Blob([...parts,...central,end],{type:'application/zip'}));
    const link=document.createElement('a');link.href=url;link.download=`Aetheria-zaloha-${new Date().toISOString().replace(/[:.]/g,'-')}.zip`;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
    status('ZIP je připravený ke stažení. Ulož si ho do složky záloh.');
  }
  function mount(panel){
    const box=document.createElement('div');box.className='reader-backups';
    const title=document.createElement('p');title.textContent='Zálohy kapitol';title.className='reader-chapters-title';
    const connectButton=document.createElement('button');connectButton.type='button';connectButton.textContent='Připojit složku záloh';connectButton.addEventListener('click',connect);
    const now=document.createElement('button');now.type='button';now.textContent='Zálohovat teď';now.addEventListener('click',backup);
    const zip=document.createElement('button');zip.type='button';zip.textContent='Stáhnout ZIP';zip.addEventListener('click',download);
    const note=document.createElement('p');note.className='reader-backup-note';note.setAttribute('role','status');
    const update=()=>{note.textContent=message;now.disabled=!folder;connectButton.hidden=!window.showDirectoryPicker;};
    // Only one panel exists; release old callbacks when the panel is rebuilt.
    listeners.clear();listeners.add(update);update();
    box.append(title,connectButton,now,zip,note);panel.append(box);
  }
  window.AetheriaReaderBackups={register(getChapters){provider=getChapters;},mount};
  document.addEventListener('aetheria:readerchange',()=>{
    if(!folder)return;
    clearTimeout(debounce);debounce=setTimeout(backup,1000);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&folder){clearTimeout(debounce);backup();}});
})();
