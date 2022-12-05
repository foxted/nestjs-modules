#!/usr/bin/env zx
import { syncIcons } from './lib/firebase.mjs';

$.verbose = false;

import { loadIcons } from './lib/modules.mjs';

if(!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.GOOGLE_STORAGE_BUCKET) {
    console.error(chalk.red('Missing environment variables: GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_STORAGE_BUCKET'));
    process.exit(1);
}

console.log('Syncing icons...');

const icons = await loadIcons();

await syncIcons(icons);
