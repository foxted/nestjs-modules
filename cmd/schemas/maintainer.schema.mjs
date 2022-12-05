import Joi from 'joi';

export default Joi.object({
   name: Joi.string().required(),
   github: Joi.string().regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i).required(),
});
