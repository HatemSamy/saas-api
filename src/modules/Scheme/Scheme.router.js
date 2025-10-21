import express from 'express';
import * as schemeController from './Scheme.controller.js';
import { validation } from '../../middleware/validation.js';
import { addSectorToSchemeSchema, createSchemeSchema } from './Scheme.validation.js';

const router = express.Router();

router.post('/create', validation(createSchemeSchema), schemeController.createScheme);
router.get('/users', schemeController.getAllUsers);
router.get('/', schemeController.getSchemes);
router.post('/:schemeId/sectors', validation(addSectorToSchemeSchema), schemeController.addSectorToScheme);

export default router;
