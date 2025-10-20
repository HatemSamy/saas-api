import express from 'express';
import * as schemeController from './Scheme.controller.js';
import { validation } from '../../middleware/validation.js';
import { createSchemeSchema } from './Scheme.validation.js';

const router = express.Router();

router.post('/create', validation(createSchemeSchema), schemeController.createScheme);
router.get('/', schemeController.getSchemes);

export default router;
