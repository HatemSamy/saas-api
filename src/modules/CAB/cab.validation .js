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





export const addCabUserSchema = joi.object({
  cabId: joi.number().integer().positive().required(),
  name: joi.string().min(3).max(255).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),

  // Allow multiple roles
  roles: joi.array()
    .items(
      joi.string().valid(
        'CAB_ADMIN',
        'CAB_CUSTOMER_SERVICE',
        'CAB_SALES',
        'CAB_ACCOUNTANT',
        'CAB_CERTIFICATION_MANAGER',
        'CAB_TECHNICAL_MANAGER',
        'CAB_LEAD_AUDITOR',
        'CAB_AUDITOR',
        'CAB_TRAINEE',
        'CAB_CEO',
        'CAB_COMMITTEE_MEMBER'
      )
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one role must be provided",
      "any.required": "Roles are required",
    }),
});



