/* Firestore rules checks for participants/{id}. Run: npm install && npm test
   (needs Java for the emulator). Written without being able to start the
   emulator where this was authored, so treat a first failure as something to
   look at, not necessarily as a rules bug. */
const fs = require('fs');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, getDocs, deleteDoc, collection, query, orderBy, limit, serverTimestamp } = require('firebase/firestore');

const base = () => ({
  name: 'Jinwoo', dance: 'd1', hair: 'h1', outfit: 'o1',
  status: 'created', createdAt: serverTimestamp(), updatedAt: serverTimestamp()
});

(async () => {
  const env = await initializeTestEnvironment({
    projectId: 'demo-dance',
    firestore: { rules: fs.readFileSync(__dirname + '/../firestore.rules', 'utf8') }
  });
  const db = env.authenticatedContext('kiosk').firestore();
  const anon = env.unauthenticatedContext().firestore();
  let n = 0, bad = 0;
  const t = async (label, p) => { n++; try { await p; console.log('ok   ', label); } catch (e) { bad++; console.log('FAIL ', label, '\n     ', e.message.split('\n')[0]); } };
  const ref = (id, d = db) => doc(d, 'participants', id);

  await t('create a valid row', assertSucceeds(setDoc(ref('12345'), base())));
  await t('read it back by ID', assertSucceeds(getDoc(ref('12345'))));
  await t('cannot create the same ID again', assertFails(setDoc(ref('12345'), base())));
  await t('cannot create without signing in', assertFails(setDoc(ref('22345', anon), base())));
  await t('cannot read without signing in', assertFails(getDoc(ref('12345', anon))));
  const col = (d = db) => collection(d, 'participants');
  await t('cannot list without a limit', assertFails(getDocs(col())));
  await t('cannot list more than 300', assertFails(getDocs(query(col(), orderBy('createdAt', 'desc'), limit(301)))));
  await t('cannot list without signing in', assertFails(getDocs(query(col(anon), orderBy('createdAt', 'desc'), limit(300)))));
  await t('can list the newest 300', assertSucceeds(getDocs(query(col(), orderBy('createdAt', 'desc'), limit(300)))));
  await t('rejects an ID with a leading 0', assertFails(setDoc(ref('01234'), base())));
  await t('rejects a 4-digit ID', assertFails(setDoc(ref('1234'), base())));
  await t('rejects a row that is born "ready"', assertFails(setDoc(ref('32345'), { ...base(), status: 'ready' })));
  await t('rejects an empty name', assertFails(setDoc(ref('42345'), { ...base(), name: '' })));
  await t('rejects a name over 14 characters', assertFails(setDoc(ref('52345'), { ...base(), name: 'x'.repeat(15) })));
  await t('rejects extra fields', assertFails(setDoc(ref('62345'), { ...base(), admin: true })));
  await t('a client cannot edit a row', assertFails(updateDoc(ref('12345'), { name: 'Someone else', updatedAt: serverTimestamp() })));
  await t('a client cannot delete a row', assertFails(deleteDoc(ref('12345'))));

  console.log(`\n${n - bad}/${n} passed`);
  await env.cleanup();
  process.exit(bad ? 1 : 0);
})();
