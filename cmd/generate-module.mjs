#!/usr/bin/env zx
$.verbose = false;

import prompts from 'prompts';
import { paramCase } from 'change-case';
import { loadCategories } from './lib/modules.mjs';
import { dump } from 'js-yaml';

const categories = (await loadCategories()).map(category => ({
    title: category.name,
    value: category.id
}));

const response = await prompts([
    {
        type: 'select',
        name: 'type',
        message: 'Type:',
        choices: [
            { title: 'Official', value: 'official' },
            { title: 'Community', value: 'community' },
            { title: 'Third-party', value: 'third-party' }
        ],
    },
    {
        type: 'text',
        name: 'name',
        message: 'Name:',
        hint: 'ex: axios',
        format: (value) => paramCase(value),
        validate: value => value.length > 0 ? true : 'Please enter a name'
    },
    {
        type: 'text',
        name: 'description',
        message: 'Description:',
        initial: null,
    },
    {
        type: 'text',
        name: 'repository',
        message: 'Repository:',
        validate: value => /^([A-Za-z0-9])+[/]{1}[A-Za-z]+$/.test(value)
            ? true
            : 'Please enter a valid repository name: username/repository'
    },
    {
        type: 'text',
        name: 'npm',
        message: 'Package name:',
        validate: value => /^([@-_A-Za-z0-9])+[/]?[A-Za-z-_]+$/.test(value)
            ? true
            : 'Please enter a valid package name: @org/package or package'
    },
    {
        type: 'text',
        name: 'website',
        message: 'Website:',
        initial: null,
        validate: value => {
            if(!value || value.length === 0) {
                return true;
            }

            return value.length === 0 || /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/g.test(value)
                ? true
                : 'Please enter a valid URL'
        }
    },
    {
        type: 'autocompleteMultiselect',
        name: 'categories',
        message: 'Categories:',
        choices: categories,
        hint: '- Space to select. Return to submit',
        min: 1
    },

    // /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/g
], {
    onCancel: () => process.exit(0)
});

console.log('-----');
console.log('');

const yaml = dump({
    name: response.name,
    description: response.description,
    repository: response.repository,
    npm: response.npm,
    website: response.website,
    categories: response.categories,
    maintainers: [],
    usefulLinks: []
});

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
    const filename = `modules/${response.type}/${response.name}.yml`;

    if(fs.existsSync(filename)) {
        const overwrite = await question(chalk.yellow(`Module ${response.name} already exists, would you like to overwrite? [y/N] `));

        if(overwrite.toLowerCase() !== 'y') {
            process.exit(0);
        }
    }

    fs.writeFileSync(filename, yaml);
    console.log(chalk.green(`Module created: ${filename}`));
}
