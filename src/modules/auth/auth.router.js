
import express from 'express';
import * as  authController  from './auth.controller.js';
import * as  validators  from './auth.validation.js';
import { validation } from '../../middleware/validation.js';


const router = express.Router();


router.post(
  "/login",
  authController.loginUser
);

export default router;