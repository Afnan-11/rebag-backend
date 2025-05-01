import express from "express";

import Validation from "../../../validations/validation.js";
import validate from "../../../middleware/validate.middleware.js";
import AuthController from "../../../controllers/auth.controller.js";
import authorize from "../../../middleware/authorized.middleware.js";
import config from "../../../config.js";
const router = express.Router();
// console.log("this is my app url:", config.mailer);
router.post(
  "/sign-up",
  [validate(Validation.auth.signUp)],
  AuthController.signUp
);
router.post(
  "/sign-in",
  [validate(Validation.auth.signIn)],
  AuthController.signIn
);
router.post(
  "/forgot-password",
  [validate(Validation.auth.forgotPassword)],
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  [validate(Validation.auth.resetPassword)],
  AuthController.resetPassword
);
router.get("/profile", [authorize()], AuthController.getUserDetails);
const authRoutes = router;

export default authRoutes;
