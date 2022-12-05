#!/usr/bin/env zx
$.verbose = false;
import { intersectionBy, differenceBy } from 'lodash-es';
import { COLLECTION_MODULES, firestore, syncModules } from './lib/firebase.mjs';
import { loadModules } from './lib/modules.mjs';

if(!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.GOOGLE_STORAGE_BUCKET) {
    console.error(chalk.red('Missing environment variables: GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_STORAGE_BUCKET'));
    process.exit(1);
}

console.log('Syncing modules...');

// 1. Fetch the list of official modules from the Firebase database.
const remoteModules = (await firestore.collection(COLLECTION_MODULES).get()).docs.map(doc => {
    const data = doc.data();
    return {
        id: doc.id === data.name ? data.name : doc.id,
        ...data
    };
});

// 2. Fetch the list of official modules from the modules/ folder.
const localModules = [
    ...(await loadModules('official')),
    ...(await loadModules('community')),
    ...(await loadModules('third-party'))
];

// 3. Compare the two lists.
const toAdd = differenceBy(localModules, remoteModules, 'name');
const toUpdate = intersectionBy(localModules, remoteModules, 'name');
const toRemove = differenceBy(remoteModules, localModules, 'name');

// 4. For each module in the list of official modules from the modules/ folder, but not in the list of official modules from the Firebase database, add the module to the Firebase database.
await syncModules([...toAdd, ...toUpdate], toRemove);

console.log(chalk.green('Modules in sync.'));
