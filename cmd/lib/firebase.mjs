import { chunk } from 'lodash-es';
import {initializeApp, applicationDefault} from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { asyncForEach } from './utils.mjs';
import { paramCase } from 'change-case';
import { v4 as uuidv4 } from 'uuid';

export const COLLECTION_CATEGORIES = 'categories';
export const COLLECTION_ICONS = 'icons';
export const COLLECTION_MODULES = 'modules';

const iconCache = {};

const app = initializeApp({
    credential: applicationDefault(),
});

export const firestore = getFirestore(app);
export const storage = getStorage(app);

export const syncModules = async (toSync = [], toRemove = []) => {
    return Promise.all([
        sync(COLLECTION_MODULES, toSync),
        remove(COLLECTION_MODULES, toRemove),
    ]);
};

export const syncCategories = async (toSync, toRemove) => {
    return Promise.all([
        sync(COLLECTION_CATEGORIES, toSync),
        remove(COLLECTION_CATEGORIES, toRemove)
    ])
}

export const syncIcons = async (icons) => {
    await clearIcons(icons);
    return asyncForEach(icons, uploadIcon);
}

/**
 * For each module in the list of modules from the modules/ folder:
 * - If the module is not in the list of modules from the Firebase database, add the module in Firestore
 * - If the module is in the list of modules from the Firebase database, update the module in Firestore
 * @param collection
 * @param {Array} documents
 * @returns {Promise<void>}
 */
export const sync = async (collection, documents) => {
    console.log(`Syncing ${documents.length} ${collection}...`, documents.map(doc => doc.name));

    const chunks = chunk(documents, 500);

    return asyncForEach(chunks, async (chunk) => {
        const batch = firestore.batch();

        chunk.forEach((doc) => {
            const ref = firestore.collection(collection).doc(paramCase(doc.id));
            batch.set(ref, doc);
        });

        await batch.commit();
    });
}

/**
 * For each document in the list from Firestore but not in the list locally
 * - Delete the document from the Firebase database.
 * @param collection
 * @param {Array} documents
 * @returns {Promise<void>}
 */
export const remove = async (collection, documents) => {
    console.log(`Removing ${documents.length} ${collection}...`, documents.map(doc => doc.name));

    const chunks = chunk(documents, 500);

    return asyncForEach(chunks, async (chunk) => {
        const batch = firestore.batch();

        chunk.forEach((doc) => {
            const ref = firestore.collection(collection).doc(doc.id);
            batch.delete(ref);
        });

        await batch.commit();
    });
}

export const fetchIcon = async (name) => {
    const filepath = `icons/${name}`;
    const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET);
    const file = bucket.file(filepath);

    if(typeof iconCache[name] !== 'undefined') {
        console.log(`Fetching icon ${name} from cache...`);
        return iconCache[name];
    }

    console.log(`Fetching icon ${name}...`);

    const [exists] = await file.exists();

    if (!exists) {
        const data = { url: null };

        iconCache[name] = data;

        return data;
    }

    const [metadata] = await file.getMetadata();
    const data = {
        url: `https://firebasestorage.googleapis.com/v0/b/${process.env.GOOGLE_STORAGE_BUCKET}/o/${encodeURIComponent(path)}?alt=media&token=${metadata.metadata.firebaseStorageDownloadTokens}`,
    };

    iconCache[name] = data;

    return data;
}

export const clearIcons = async (icons) => {
    console.log(`Clearing icons...`);
    const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET);
    const [files] = await bucket.getFiles();

    return asyncForEach(files, async (file) => {
        if (!icons.includes(file.name)) {
            await file.delete();
        }
    });
};

export const uploadIcon = async (name) => {
    console.log(`Uploading icon ${name}...`);
    const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET);
    const source = path.join(__dirname, `../icons/${name}`);
    const destination = `icons/${name}`;
    const file = bucket.file(destination);
    const contents = fs.readFileSync(source);

    await file.save(contents, {
        metadata: {
            metadata: {
                firebaseStorageDownloadTokens: uuidv4(),
            },
        },
    });
}
