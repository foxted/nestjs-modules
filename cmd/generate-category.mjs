#!/usr/bin/env zx
$.verbose = false;

import prompts from 'prompts';
import { titleCase } from 'title-case';
import { paramCase } from 'change-case';
import { loadCategories } from './lib/modules.mjs';
import { dump } from 'js-yaml';

const categories = await loadCategories();

const uniqueCategories = new Set(categories.map(category => category.name));

const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: 'Name:',
    hint: 'ex: HTTP',
    format: (value) => titleCase(value),
    validate: value => value.length > 0 ? true : 'Please enter a name',
}, {
    onCancel: () => process.exit(0)
});

uniqueCategories.add(name);

const yaml = dump({ categories: Array.from(uniqueCategories).sort() });

console.log(yaml);

const { value: confirmed } = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Does it look good?',
    initial: true,
    active: 'yes',
    inactive: 'no'
});

if(confirmed) {
    const filename = `modules/categories.yml`;
    fs.writeFileSync(filename, yaml);
    console.log(chalk.green(`Categories updated: ${filename}. You can now use \`${paramCase(name)}\` as a category.`));
}
