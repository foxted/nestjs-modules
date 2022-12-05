#!/usr/bin/env zx
$.verbose = false;
import { loadCategories } from './lib/modules.mjs';

console.log('Validating categories...');

const localCategories = await loadCategories();

const uniqueCategories = new Set(localCategories.map(category => category.id));

if (uniqueCategories.size !== localCategories.length) {
    const duplicateCategories = localCategories.reduce((acc, category) => {
        if(typeof acc[category.id] === 'undefined') acc[category.id] = [category];
        else acc[category.id].push(category);

        return acc;
    }, {});

    const duplicateCategoriesList = Object.values(duplicateCategories)
        .filter((items) => items.length > 1)
        .map((items) => ({
            name: items[0].name,
            duplicateCount: items.length - 1,
        }));

    console.log('');
    console.log(chalk.red('Some categories are duplicated:'));

    duplicateCategoriesList.forEach((category) => {
        console.log(chalk.red(`- ${category.name}: ${category.duplicateCount} ${category.duplicateCount > 1 ? 'duplicates' : 'duplicate'}`));
    })

    process.exit(1);
}

console.log(chalk.green('Categories are valid. ✅'));
