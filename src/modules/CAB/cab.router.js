import express from 'express';
import * as  cabController  from './cab.controller.js';
import * as  validators  from './cab.validation .js';
import { validation } from '../../middleware/validation.js';
import { authenticateUser, authorizeRoles } from '../../middleware/auth.js';


const router = express.Router();


router.post('/create', validation(validators.createCabSchema), cabController.createCab);
router.post('/:cabId/generate-link', cabController.generateCabLink);
router.get('/:cabId/schemes', cabController.getCabSchemes);
router.post('/:cabId/select-schemes',validation(validators.selectCabSchemeSchema),cabController.selectCabScheme);
router.get('/:slug', cabController.getCabPortal);

// Only CAB_ADMIN or CAB_CEO can add new CAB users
router.post(
  "/add_cab_user",
//   authenticateUser,
//   authorizeRoles("CAB_ADMIN", "CAB_CEO"),
  validation(validators.addCabUserSchema),
  cabController.addCabUser
);

router.get(
  "/:cabId/service-requests",
  authenticateUser,
  authorizeRoles("CAB", "CLIENT_USER"), 
  cabController.getCabServiceRequests
);


export default router;
