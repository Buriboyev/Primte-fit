const FIREBASE_SDK_VERSION = "12.12.1";
const ORDERS_COLLECTION = "orders";

const firebaseConfig = {
  apiKey: "AIzaSyC4VS6Zm8Jode7oN4ypIq1rnyC-jIC9y3E",
  authDomain: "prime-fit-termiz.firebaseapp.com",
  projectId: "prime-fit-termiz",
  storageBucket: "prime-fit-termiz.firebasestorage.app",
  messagingSenderId: "673814245650",
  appId: "1:673814245650:web:6ab55bbabedbf59b4103cb",
  measurementId: "G-XTMFKDWBF0",
};

let firebaseSdkPromise;

export function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every((value) => {
    return typeof value === "string" && value.trim() && !value.includes("PASTE_");
  });
}

export async function saveOrderToFirebase(order) {
  const sdk = await getFirebaseSdk();
  if (!sdk) return null;

  const cloudOrder = {
    ...order,
    clientCreatedAt: order.createdAt,
    createdAt: sdk.serverTimestamp(),
    updatedAt: sdk.serverTimestamp(),
  };

  const docRef = await sdk.addDoc(sdk.collection(sdk.db, ORDERS_COLLECTION), cloudOrder);
  return docRef.id;
}

export async function subscribeToFirebaseOrders(onOrders, onError) {
  const sdk = await getFirebaseSdk();
  if (!sdk) return null;

  const ordersQuery = sdk.query(
    sdk.collection(sdk.db, ORDERS_COLLECTION),
    sdk.orderBy("createdAt", "desc"),
  );

  return sdk.onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = snapshot.docs.map((item) => normalizeOrder(item));
      onOrders(orders);
    },
    onError,
  );
}

export async function updateFirebaseOrderStatus(firebaseId, status) {
  const sdk = await getFirebaseSdk();
  if (!sdk) return;

  await sdk.updateDoc(sdk.doc(sdk.db, ORDERS_COLLECTION, firebaseId), {
    status,
    updatedAt: sdk.serverTimestamp(),
  });
}

export async function deleteFirebaseOrder(firebaseId) {
  const sdk = await getFirebaseSdk();
  if (!sdk) return;

  await sdk.deleteDoc(sdk.doc(sdk.db, ORDERS_COLLECTION, firebaseId));
}

export async function clearFirebaseOrders() {
  const sdk = await getFirebaseSdk();
  if (!sdk) return;

  const snapshot = await sdk.getDocs(sdk.collection(sdk.db, ORDERS_COLLECTION));
  await Promise.all(
    snapshot.docs.map((item) => sdk.deleteDoc(sdk.doc(sdk.db, ORDERS_COLLECTION, item.id))),
  );
}

async function getFirebaseSdk() {
  if (!isFirebaseConfigured()) return null;
  if (firebaseSdkPromise) return firebaseSdkPromise;

  firebaseSdkPromise = Promise.all([
    import(/* @vite-ignore */ `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
    import(/* @vite-ignore */ `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`),
  ]).then(([appSdk, firestoreSdk]) => {
    const app = appSdk.getApps().length
      ? appSdk.getApps()[0]
      : appSdk.initializeApp(firebaseConfig);
    const db = firestoreSdk.getFirestore(app);

    return {
      db,
      addDoc: firestoreSdk.addDoc,
      collection: firestoreSdk.collection,
      deleteDoc: firestoreSdk.deleteDoc,
      doc: firestoreSdk.doc,
      getDocs: firestoreSdk.getDocs,
      onSnapshot: firestoreSdk.onSnapshot,
      orderBy: firestoreSdk.orderBy,
      query: firestoreSdk.query,
      serverTimestamp: firestoreSdk.serverTimestamp,
      updateDoc: firestoreSdk.updateDoc,
    };
  });

  return firebaseSdkPromise;
}

function normalizeOrder(snapshotDoc) {
  const data = snapshotDoc.data();

  return {
    ...data,
    firebaseId: snapshotDoc.id,
    createdAt: normalizeDate(data.createdAt, data.clientCreatedAt),
    updatedAt: normalizeDate(data.updatedAt, data.clientCreatedAt),
  };
}

function normalizeDate(value, fallback) {
  if (value?.toDate) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000).toISOString();
  return fallback || new Date().toISOString();
}
