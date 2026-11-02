# Firebase: dokončení nastavení

Projekt: aetheria-c16c3. Autor: Hmnk75jRmwZBfKNjDT2sKkzp5b22.

1. Ve Firebase vytvořte Firestore Database (výchozí databázi).
2. V Authentication zapněte Email/Password. Autorský účet musí mít výše uvedené UID.
3. V Authentication / Settings / Authorized domains přidejte vityos.github.io a localhost.
4. Ve Firestore / Rules nahraďte pravidla obsahem firestore.rules a klikněte Publish. Pravidla čtení zveřejní kapitoly příběhu; zápis dovolí pouze autorovi. Nevkládejte pravidlo povolující zápis všem.
5. Nahrajte změny webu na GitHub Pages.
6. Otevřete web na zařízení, kde je původní místní text. Tužka nově vyžaduje e-mail a heslo Firebase účtu (původní lokální heslo se už nepoužívá). Každou místní kapitolu zkontrolujte a uložte na server. Předchozí text není automaticky publikován. Pro jistotu si nejprve stáhněte Zálohu TXT.
7. Na jiném zařízení otevřete tutéž knihu. Po hlášení „Sdílená knihovna připojena“ musí vidět serverový text i bez přihlášení. Další změny se načítají průběžně.

Alternativa k vložení pravidel v konzoli: použijte Firebase CLI, přihlaste se a spusťte firebase deploy --only firestore:rules --project aetheria-c16c3.

Web používá připnuté ES moduly Firebase z oficiálního CDN; není potřeba npm install firebase ani sestavování. Analytics se nenačítá.

Každá kapitola má vlastní dokument books/{bookId}/chapters/{chapterId}. Ukládání potvrzuje až serverová transakce. Revize chrání před přepsáním souběžné úpravy. Při konfliktu si stáhněte koncept jako TXT, zavřete editor a porovnejte s aktuální verzí; koncept s původní revizí se nesmí automaticky přepsat přes novější text. Místní data zůstávají zachovaná pod původními klíči.
