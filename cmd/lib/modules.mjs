import { load } from 'js-yaml';
import { asyncForEach } from './utils.mjs';
import { fetchDownloads, fetchPackage } from './npm.mjs';
import { fetchRepository } from './github.mjs';
import { paramCase } from 'change-case';
import { fetchIcon } from './firebase.mjs';

export const loadIcons = async () => {
    console.warn(chalk.green(`Loading icons...`));

    const directory = path.join(__dirname, '../icons');
    const files = fs.readdirSync(directory);

    return files.filter((file) => file.endsWith('.svg'));
}

export const loadCategories = async () => {
    console.warn(chalk.green(`Loading categories...`));

    const file = path.join(__dirname, '../modules/categories.yml');

    const { categories } = load(fs.readFileSync(file, 'utf8'));

    return categories.map(category => ({
        id: paramCase(category),
        name: category
    }));
}

export const loadModules = async (type, augment = true) => {
    const directory = path.join(__dirname, `../modules/${type}`);

    if(!fs.existsSync(directory)) {
        console.warn(chalk.yellow(`The directory ${type} does not exist.`));
        return [];
    }

    console.warn(chalk.green(`Loading ${type} modules...`));

    const files = fs.readdirSync(directory);
    const modules = [];

    files.filter((filename) => filename.endsWith('.yml')).forEach((filename) => {
        const doc = load(fs.readFileSync(path.join(directory, filename), 'utf8'));

        modules.push({
            icon: null,
            ...doc,
            type
        });
    });

    return augment ? augmentModules(modules) : modules;
}

const augmentModules = async (modules) => {
    const augmentedModules = [];

    await asyncForEach(modules, async (module) => {
        const { name, npm, repository, icon } = module;

        const { readme, versions, tags } = await fetchPackage(npm);
        const { downloads } = await fetchDownloads(npm);
        const { stars } = await fetchRepository(...repository.split('/'));
        const { url } = await fetchIcon(icon);

        augmentedModules.push({
            ...module,
            id: paramCase(name),
            readme: readme || '',
            iconUrl: url,
            stars,
            downloads,
            versions,
            tags
        });
    });

    return augmentedModules;
}
