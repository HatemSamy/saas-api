import express from 'express';
import * as  clientController  from './client.controller.js';
import * as  validators  from './client.validation.js';
import { validation } from '../../middleware/validation.js';
import { authenticateUser, authorizeRoles } from '../../middleware/auth.js';


const router = express.Router();

router.get(
  "/requested-services",
  authenticateUser,
  authorizeRoles("CLIENT_USER"),
  clientController.getClientRequestedServices
);



export default router;
