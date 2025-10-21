import express from 'express';
import * as  cabController  from './cab.controller.js';
import * as  validators  from './cab.validation .js';
import { validation } from '../../middleware/validation.js';


const router = express.Router();


router.post('/create', validation(validators.createCabSchema), cabController.createCab);
router.post('/:cabId/generate-link', cabController.generateCabLink);
router.get('/:cabId/schemes', cabController.getCabSchemes);
router.post('/:cabId/select-schemes',validation(validators.selectCabSchemeSchema),cabController.selectCabScheme);
router.get('/:slug', cabController.getCabPortal);


export default router;