#!/usr/bin/env zx
import { loadCategories } from './lib/modules.mjs';

$.verbose = false;

const categories = await loadCategories();

console.log();
categories.forEach(category => {
    console.log(`${category.name}:\t${chalk.green(category.id)}`);
})
