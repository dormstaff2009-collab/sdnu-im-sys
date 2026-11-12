import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  testConnection
} from './firebase';

export { testConnection };
import type { 
  Asset, 
  Category, 
  LocationItem, 
  ActionLog, 
  SystemSettings 
} from '../types/asset';

const ASSETS_COL = 'assets';
const CATEGORIES_COL = 'categories';
const LOCATIONS_COL = 'locations';
const LOGS_COL = 'logs';
const SETTINGS_DOC = 'settings/config';

// 1. Fetch all data from Firestore
export async function getFirestoreData(): Promise<{
  assets: Asset[];
  categories: Category[];
  locations: LocationItem[];
  logs: ActionLog[];
  settings?: SystemSettings;
}> {
  try {
    // Assets
    const assetsSnap = await getDocs(collection(db, ASSETS_COL));
    const assets: Asset[] = assetsSnap.docs.map(d => ({ ...(d.data() as Asset), id: d.id }));

    // Categories
    const categoriesSnap = await getDocs(collection(db, CATEGORIES_COL));
    const categories: Category[] = categoriesSnap.docs.map(d => ({ ...(d.data() as Category), id: d.id }));

    // Locations
    const locationsSnap = await getDocs(collection(db, LOCATIONS_COL));
    const locations: LocationItem[] = locationsSnap.docs.map(d => ({ ...(d.data() as LocationItem), id: d.id }));

    // Logs
    const logsSnap = await getDocs(collection(db, LOGS_COL));
    const logs: ActionLog[] = logsSnap.docs
      .map(d => ({ ...(d.data() as ActionLog), id: d.id }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Settings
    let settings: SystemSettings | undefined;
    const settingsSnap = await getDoc(doc(db, 'settings', 'config'));
    if (settingsSnap.exists()) {
      settings = settingsSnap.data() as SystemSettings;
    }

    return { assets, categories, locations, logs, settings };
  } catch (error) {
    console.error('[Firestore] Error loading data from Firestore:', error);
    throw error;
  }
}

// 2. Save / Create Asset in Firestore
export async function saveAssetToFirestore(asset: Asset): Promise<void> {
  await setDoc(doc(db, ASSETS_COL, asset.id), asset);
}

// 3. Update Asset in Firestore
export async function updateAssetInFirestore(id: string, updates: Partial<Asset>): Promise<void> {
  const assetRef = doc(db, ASSETS_COL, id);
  await setDoc(assetRef, updates, { merge: true });
}

// 4. Delete Asset from Firestore
export async function deleteAssetFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, ASSETS_COL, id));
}

// 5. Add Log to Firestore
export async function addLogToFirestore(log: ActionLog): Promise<void> {
  await setDoc(doc(db, LOGS_COL, log.id), log);
}

// 6. Save Category to Firestore
export async function saveCategoryToFirestore(cat: Category): Promise<void> {
  await setDoc(doc(db, CATEGORIES_COL, cat.id), cat);
}

export async function deleteCategoryFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, CATEGORIES_COL, id));
}

// 7. Save Location to Firestore
export async function saveLocationToFirestore(loc: LocationItem): Promise<void> {
  await setDoc(doc(db, LOCATIONS_COL, loc.id), loc);
}

export async function deleteLocationFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, LOCATIONS_COL, id));
}

// 8. Save Settings to Firestore
export async function saveSettingsToFirestore(settings: SystemSettings): Promise<void> {
  await setDoc(doc(db, 'settings', 'config'), settings);
}

// 9. Batch Seed Demo Data to Firestore
export async function seedDemoDataToFirestore(
  assets: Asset[],
  categories: Category[],
  locations: LocationItem[],
  logs: ActionLog[],
  settings: SystemSettings
): Promise<void> {
  const batch = writeBatch(db);

  // Categories
  categories.forEach(cat => {
    batch.set(doc(db, CATEGORIES_COL, cat.id), cat);
  });

  // Locations
  locations.forEach(loc => {
    batch.set(doc(db, LOCATIONS_COL, loc.id), loc);
  });

  // Assets
  assets.forEach(asset => {
    batch.set(doc(db, ASSETS_COL, asset.id), asset);
  });

  // Logs
  logs.forEach(log => {
    batch.set(doc(db, LOGS_COL, log.id), log);
  });

  // Settings
  batch.set(doc(db, 'settings', 'config'), settings);

  await batch.commit();
}

// 10. Clear Assets in Firestore
export async function clearAssetsInFirestore(): Promise<void> {
  const assetsSnap = await getDocs(collection(db, ASSETS_COL));
  if (assetsSnap.empty) {
    return;
  }
  const batch = writeBatch(db);
  assetsSnap.docs.forEach(d => {
    batch.delete(d.ref);
  });
  await batch.commit();
}
