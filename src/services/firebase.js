import { firebaseConfig, authorUid } from '../config/firebase.js';
import { validateContent, assertRevision } from './cloud-content.js';
let loading;
async function client() {
  if (!loading) loading = Promise.all([
    import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js'),
  ]).then(async ([appSdk, authSdk, dbSdk]) => {
    const app = appSdk.initializeApp(firebaseConfig);
    const auth = authSdk.getAuth(app);
    await auth.authStateReady();
    return { auth, authSdk, db: dbSdk.getFirestore(app), dbSdk };
  }).catch(error => { loading = null; throw error; });
  return loading;
}
export const cloud = {
  async isAuthor() { const { auth } = await client(); return auth.currentUser?.uid === authorUid; },
  async login(email, password) {
    const { auth, authSdk } = await client();
    const result = await authSdk.signInWithEmailAndPassword(auth, email, password);
    if (result.user.uid !== authorUid) { await authSdk.signOut(auth); throw new Error('Tento účet nemá oprávnění autora.'); }
  },
  async logout() { const { auth, authSdk } = await client(); await authSdk.signOut(auth); },
  watch(bookId, onChange, onError) {
    let stopped = false, unsubscribe;
    client().then(({ db, dbSdk }) => {
      if (stopped) return;
      unsubscribe = dbSdk.onSnapshot(dbSdk.collection(db, 'books', bookId, 'chapters'), { includeMetadataChanges: true }, snapshot => {
        // Čtení ze serveru je nutné pro bezpečný začátek úprav.
        const chapters = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).filter(validateContent);
        onChange(chapters, !snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites);
      }, onError);
    }).catch(error => { if (!stopped) onError(error); });
    return () => { stopped = true; unsubscribe?.(); };
  },
  async save(bookId, chapterId, title, paragraphs, expectedRevision) {
    const { auth, db, dbSdk } = await client();
    if (auth.currentUser?.uid !== authorUid) throw new Error('Přihlaste se autorským účtem.');
    if (new TextEncoder().encode(JSON.stringify({ title, paragraphs })).length > 700000) throw new Error('Kapitola je příliš dlouhá. Rozdělte ji na menší části.');
    const reference = dbSdk.doc(db, 'books', bookId, 'chapters', chapterId);
    const revision = await dbSdk.runTransaction(db, async transaction => {
      const snapshot = await transaction.get(reference);
      const current = snapshot.exists() ? snapshot.data().revision : 0;
      assertRevision(current, expectedRevision);
      const next = current + 1;
      transaction.set(reference, { title, paragraphs, revision: next, updatedAt: dbSdk.serverTimestamp(), updatedBy: auth.currentUser.uid });
      return next;
    });
    return revision;
  },
};
export function cloudError(error) {
  const code = error?.code || '';
  if (code.includes('permission-denied')) return 'Firebase odmítl přístup. Zkontrolujte publikovaná pravidla Firestore a účet autora.';
  if (code.includes('auth/')) return 'Přihlášení se nezdařilo. Ověřte e-mail, heslo a zapnutí Email/Password ve Firebase.';
  if (code.includes('unavailable') || code.includes('network')) return 'Server není dostupný. Text zůstává v místním konceptu; zkuste to po připojení.';
  return error?.message || 'Spojení s Firebase se nezdařilo. Text zůstává v konceptu.';
}
