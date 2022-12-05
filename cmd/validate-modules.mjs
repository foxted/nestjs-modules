#!/usr/bin/env zx
import Joi from 'joi';
import schema from './schemas/module.schema.mjs';
import { loadModules } from './lib/modules.mjs';

$.verbose = false;

const official = await loadModules('official', false);
const community = await loadModules('community', false);
const thirdParty = await loadModules('third-party', false);

const modules = [...official, ...community, ...thirdParty];

const validatedModules = {};

modules.forEach((module) => {
    try {
        Joi.assert(module, schema);
        validatedModules[module.name] = null;
    } catch(error) {
        validatedModules[module.name] = error.details;
    }
});

if (Object.values(validatedModules).some((error) => error !== null)) {
    console.error(chalk.red('Validation failed'));
    Object.entries(validatedModules).forEach(([moduleName, error]) => {
        if (error !== null) {
            console.error(chalk.red(`Module ${moduleName} failed validation with error(s): `), error);
        }
    });
    process.exit(1);
}

console.log(chalk.green('Modules are valid ✅'));
