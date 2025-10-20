import joi from 'joi';

export const createSchemeSchema = joi.object({
  name: joi.string().min(3).max(255).required(),
  sectors: joi.array().items(
    joi.object({
      name: joi.string().min(2).max(255).required(),
      iafCode: joi.string().required(),
      description: joi.string().optional(),
      criticalCode: joi.string().optional(),
    })
  ).optional(),
});
