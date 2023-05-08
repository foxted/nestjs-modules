import Joi from 'joi';
import maintainerSchema from './maintainer.schema.mjs';
import usefulLinksSchema from './useful-links.schema.mjs';
import { loadCategories } from '../lib/modules.mjs';

const categories = await loadCategories();

export default Joi.object({
    type: Joi.string().required().only().allow('official', 'community', 'third-party'),
    name: Joi.string().required(),
    description: Joi.string().required().allow(''),
    repository: Joi.string().regex(/^([A-Za-z0-9])+[/]{1}[A-Za-z0-9-_]+$/).required(),
    npm: Joi.string().regex(/^([@-_A-Za-z0-9])+[/]?[A-Za-z0-9-_]+$/).required(),
    website: Joi.string().uri().required().allow(''),
    icon: Joi.string().regex(/[\w-_]+.(svg|png)$/).optional().allow(null),
    categories: Joi.array().items(Joi.string().only().allow(
        ...categories.map(category => category.id)
    )).min(1).required(),
    keywords: Joi.array().items(Joi.string()).min(1).optional(),
    maintainers: Joi.array().items(maintainerSchema).min(1).required(),
    usefulLinks: Joi.array().items(usefulLinksSchema).optional().allow(null),
});
