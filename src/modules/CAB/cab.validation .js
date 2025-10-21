import joi from 'joi';

export const createCabSchema = joi.object({
  name: joi.string().min(3).max(255).required(),           
  country: joi.string().required(),
  hqAddress: joi.string().required(),
  branches: joi.string().optional(),                        
  accreditationBody: joi.string().required(),
  validTo: joi.date().optional(),

  // Schemes & Standards (optional)
  schemes: joi.array().items(
    joi.object({
      name: joi.string().valid(
        'ISO 9001','ISO 14001','ISO 45001','ISO 22000','ISO 50001','ISO 22301','ISO/IEC 27001'
      ).required()
    })
  ).optional(),

  // Technical Sectors (optional)
  technicalSectors: joi.array().items(
    joi.object({
      name: joi.string().required(),
      iafCode: joi.string().required(),
      description: joi.string().optional(),
      criticalCode: joi.string().optional()
    })
  ).optional(),

  // Admin user for the CAB (required)
  adminName: joi.string().required(),
  adminEmail: joi.string().email().required(),
  adminPassword: joi.string().min(6).required()
});



export const selectCabSchemeSchema = joi.object({
  schemeId: joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Scheme ID must be a number',
      'any.required': 'Scheme ID is required',
    }),

  sectorIds: joi.array()
    .items(joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Sector IDs must be an array of numbers',
    }),
});
