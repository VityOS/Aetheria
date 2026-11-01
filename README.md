# Aetheria Reader

Lokální čtečka v čistém HTML, CSS a JavaScriptu s ES moduly. Bez externích závislostí a bez sestavovacího kroku.

## Spuštění

Vyžaduje Node.js 20 nebo novější. Ve složce projektu spusťte:

```sh
npm run dev
```

Otevřete http://localhost:3000. Port lze změnit proměnnou prostředí PORT. Server naslouchá pouze na místním počítači a slouží pro vývoj. Kvůli ES modulům otevírejte stránku přes tento server, nikoli dvojklikem na HTML. Instalace balíčků není potřeba.

## Struktura

- index.html — sémantická kostra stránky.
- src/app.js — vstup aplikace a propojení jednotlivých částí.
- src/data/book.js — obsah knihy, kapitoly a explicitní stránky.
- src/features/reader/model.js — práce se stránkami bez závislosti na DOM.
- src/features/reader/reader.js — stav čtečky, vykreslování a ovládání.
- src/features/theme/theme.js — světlý a tmavý režim.
- src/services/storage.js — bezpečný přístup k lokálnímu úložišti.
- src/ui/ — sdílené panely a oznámení.
- src/styles/ — hlavní vstup stylů, vzhled čtečky a barevné režimy.
- scripts/serve.js — lokální vývojový server.
- tests/ — automatické testy modelu a úložiště.

## Kontrola

Spusťte npm test. Testy používají vestavěný testovací nástroj Node.js.

## Další rozšiřování

Nové funkce přidávejte do src/features, přístup k API do src/services. Obsah nemá záviset na HTML ani ovládacích prvcích. Případné obrázky a další veřejné soubory lze přidat do public/.

Stávající ukázkový obsah i rozdělení na 16 stran jsou zachované; některé ukázkové pasáže se opakují. Pro skutečnou knihu nahraďte explicitní stránky v book.js. Záložka zatím zachovává původní chování jako zapnutý/vypnutý stav. Pozice, velikost písma i režim používají původní klíče úložiště. Backend, účty a synchronizace nejsou součástí tohoto základu.


## Mobilní čtení a psaní

Každá kapitola tvoří jeden souvislý posuvný text. Kapitoly se přepínají ručně šipkami nebo obsahem. Pozice v každé kapitole se ukládá lokálně.

Ikona tužky otevře režim psaní. Heslo je vitkojak; odemčení trvá do obnovení stránky. Jde o lokální zámek rozhraní, nikoli zabezpečenou autentizaci. Editor upravuje název a celý text aktuální kapitoly. Ukládání je výslovné tlačítkem Uložit kapitolu. Zrušit změny zahodí. Data jsou pouze v localStorage daného prohlížeče, nejsou sdílená mezi zařízeními ani zapsaná do zdrojových souborů. Vymazání dat prohlížeče je odstraní. Pro sdílené publikování bude potřeba backend a serverové ověření.

Obsah nyní používá chapters[].paragraphs místo pages; stránkovací model byl nahrazen souvislými kapitolami.


## Knihovna

Šipka vlevo nahoře otevře animovanou knihovnu. Obálky lze posouvat do stran dotykem nebo šipkami klávesnice v pásu knih. Klepnutí na obálku spustí opačný přechod. Katalog je v src/data/catalog.js; dvě další knihy obsahují ukázkový text. Pozice kapitol, záložky a upravený obsah jsou oddělené podle knihy. Paleta vychází z vedlejšího projektu Aetheria: #F0E7DA, #D2B48C, #121824. Animace respektují omezení pohybu v nastavení zařízení.
