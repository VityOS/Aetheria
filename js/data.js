const defaultData = {
  cities: [
    { name: "Aetheria Prime", desc: "Hlavní vznášející se citadela světa." }
  ],
  timeline: [
    { name: "Vznik Aetherie (Rok 0)", desc: "Vytvoření prvního vznášejícího se ostrova." },
    { name: "Válka Křišťálů (Rok 340)", desc: "Konflikt o magické rudy v údolí." }
  ],
  characters: [
    { name: "Valerius", desc: "Arcimág a strážce archivů." }
  ],
  bestiary: [
    { name: "Aetherický Drak", category: "dragons", desc: "Stvoření složené ze čisté magie." },
    { name: "Stínový Vlk", category: "beasts", desc: "Šelma lovící v temných hvozdech." },
    { name: "Kostěný Strážce", category: "undead", desc: "Oživená kostra bránící hrobky." },
    { name: "Golem z Křišťálu", category: "constructs", desc: "Magický konstrukt těžený v Údolí." }
  ]
};

let worldData = JSON.parse(localStorage.getItem('aetheriaData')) || defaultData;