import joi from 'joi';

export const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  password: joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
  }),
});





export const registerClientFromCabSchema = joi.object({
  companyName: joi.string().min(3).required(),
  companyAddress: joi.string().required(),
  contactPerson: joi.string().required(),
  email: joi.string().email().required(),
  requiredStandard: joi.string().required(),
});
