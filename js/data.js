const defaultData = {
  cities: [
    { name: "Aetheria Prime", desc: "Hlavní vznášející se citadela světa." }
  ],
  timeline: [
    {
      id: "e1",
      type: "point",
      date: "Rok 0",
      title: "Vznik Aetherie",
      desc: "Vytvoření prvního vznášejícího se ostrova a počátek nového letopočtu v oblacích.",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      positionTop: 20
    },
    {
      id: "e2",
      type: "period",
      startDate: "Rok 120",
      endDate: "Rok 180",
      title: "Zlatý věk magie",
      desc: "Dlouhé období rozkvětu, kdy civilizace dosáhla vrcholu v ovládání aetherických krystalů a stavbě vzdušných chrámů.",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
      positionTop: 100,
      height: 90
    },
    {
      id: "e3",
      type: "point",
      date: "Rok 215",
      title: "Objevení hlubinných dolů",
      desc: "První expedice pod vznášející se ostrovy objevila netušené zásoby temné rudy a zapomenuté relikty.",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
      positionTop: 220
    },
    {
      id: "e4",
      type: "period",
      startDate: "Rok 280",
      endDate: "Rok 310",
      title: "Éra Velkého Sucha",
      desc: "Kritické období nedostatku magické energie, které vedlo k migraci celých kmenů a bojům o zdroje.",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
      positionTop: 330,
      height: 80
    },
    {
      id: "e5",
      type: "point",
      date: "Rok 340",
      title: "Válka Křišťálů",
      desc: "Krvavý konflikt o magické rudy v Údolí, který navždy změnil rovnováhu sil mezi frakcemi.",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
      positionTop: 430
    },
    {
      id: "e6",
      type: "point",
      date: "Rok 400",
      title: "Založení Rady Archivů",
      desc: "Sjednocení přeživších frakcí a zřízení Hlavní citadely jako centra vědění a ochrany světa.",
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
      positionTop: 530
    }
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

// Pro jistotu vymažeme stará nesprávná data z localStorage, aby se načetla tato nová
localStorage.removeItem('aetheriaData');

let worldData = JSON.parse(localStorage.getItem('aetheriaData')) || defaultData;