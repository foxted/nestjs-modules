#!/usr/bin/env zx
$.verbose = false;
import { loadCategories } from './lib/modules.mjs';
import { COLLECTION_CATEGORIES, firestore, syncCategories } from './lib/firebase.mjs';
import { differenceBy, intersectionBy } from 'lodash-es';

if(!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(chalk.red('Missing environment variables: GOOGLE_APPLICATION_CREDENTIALS'));
    process.exit(1);
}

console.log('Syncing categories...');

// 1. Fetch the list of official modules from the Firebase database.
const remoteCategories = (await firestore.collection(COLLECTION_CATEGORIES).get()).docs.map(doc => {
    const data = doc.data();
    return {
        id: doc.id === data.name ? data.name : doc.id,
        ...data
    }
});

// 2. Fetch the list of official modules from the modules/ folder.
const localCategories = await loadCategories();

// 3. Compare the two lists.
const toAdd = differenceBy(localCategories, remoteCategories, 'id');
const toUpdate = intersectionBy(localCategories, remoteCategories, 'id');
const toRemove = differenceBy(remoteCategories, localCategories, 'id');

await syncCategories([...toAdd, ...toUpdate], toRemove);

console.log(chalk.green('Categories in sync.'));
