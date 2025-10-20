import express from 'express';
import * as  cabController  from './cab.controller.js';
import { validation } from '../../middleware/validation.js';
import { createCabSchema } from './cab.validation .js';

const router = express.Router();


router.post('/create', validation(createCabSchema), cabController.createCab);
router.post('/:cabId/generate-link', cabController.generateCabLink);
router.get('/:slug', cabController.getCabPortal);

export default router;