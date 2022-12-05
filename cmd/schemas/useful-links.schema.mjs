import Joi from 'joi';

export default Joi.object({
   name: Joi.string().required(),
   url: Joi.string().uri().required(),
});
