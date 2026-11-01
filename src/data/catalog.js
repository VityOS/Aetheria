import { book } from './book.js';
export const catalog = [
  { ...book, cover: { label: 'AETHERIA', subtitle: 'Město nad oblaky', color: '#465d5b', symbol: '◈', note: 'Svět nad hranicí známého' } },
  { id: 'atlas', title: 'Atlas tichých míst', cover: { label: 'ATLAS', subtitle: 'tichých míst', color: '#8a6049', symbol: '✳', note: 'Ukázková kniha · Cesty a objevy' }, chapters: [
    { id: 'atlas-1', title: 'První souřadnice', paragraphs: ['Na okraji mapy bylo místo, které nikdo nepojmenoval. Nevedla k němu žádná cesta, jen tenká čára tužkou a poznámka: poslouchej.', 'Vyrazil za úsvitu. V kapse měl kompas a v hlavě otázku, na kterou město nedokázalo odpovědět.', 'Ticho se nenachází tam, kde nikdo není. Někdy čeká mezi dvěma větami, ve stínu stromu nebo na prahu starého domu.'] },
    { id: 'atlas-2', title: 'Údolí bez ozvěny', paragraphs: ['Údolí se otevřelo náhle. Voda tu tekla pomalu a každý kámen vypadal, jako by si pamatoval něčí jméno.', 'Posadil se na břeh a poprvé po dlouhé době nikam nespěchal.'] },
  ] },
  { id: 'nocni-zahrady', title: 'Noční zahrady', cover: { label: 'NOČNÍ', subtitle: 'zahrady', color: '#343c54', symbol: '☾', note: 'Ukázková kniha · Za světlem hvězd' }, chapters: [
    { id: 'garden-1', title: 'Po setmění', paragraphs: ['Zahrada se probouzela až tehdy, když v okolních domech zhasla poslední světla. Květiny rozevíraly stříbrné koruny a cestičky voněly po dešti.', 'Mira odemkla branku. Klíč jí svěřila babička se slovy, že některé věci rostou jen pod hvězdami.', 'Uprostřed záhonu našla lucernu. Nesvítila ohněm, ale drobnými vzpomínkami, které v ní někdo pečlivě uschoval.'] },
  ] },
];
