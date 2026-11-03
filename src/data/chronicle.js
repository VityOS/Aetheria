export const chronicleItems = [{
  id: 'dyky', number: 'PŘ–001', category: 'Předměty', title: 'Dýky',
  type: 'Párové čepele', image: './public/images/daggers.png',
  alt: 'Dvě zahnuté dýky, jedna se světlou a druhá s tmavou čepelí, s omotanými rukojeťmi.',
  summary: 'Dvojice zahnutých čepelí. Světlý a tmavý kov, omotané rukojeti a jemné zářící praskliny.',
  description: [
    'Dvě dýky sdílejí podobnou siluetu: dlouhé zahnuté čepele, výrazné záštity a rukojeti ovinuté potrhanou látkou.',
    'Světlá čepel má teplé kovové odstíny a světlý ovin rukojeti. Tmavá čepel kombinuje téměř černý kov s tmavým vínovým ovinem. Povrchem obou procházejí jemné světelné linie.',
  ],
}];
export function itemHash(id) { return '#kronika/predmet/' + encodeURIComponent(id); }
