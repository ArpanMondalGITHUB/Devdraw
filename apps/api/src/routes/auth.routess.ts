import { Router } from "express";
import {signup,signin,logout,logoutall , refresh} from "../controllers/auth.controllers";
import { requireAuth, validate } from "../middleware/auth.middleware";
import { signinSchema, signupSchema } from "../schemas/auth.schemas";
const router = Router()

router.route("/signup").post(validate(signupSchema), signup);
router.route("/signin").post(validate(signinSchema),signin);
router.route("/refresh-token").post(refresh);
router.route("/logout").post(requireAuth,logout);
router.route("/logoutall").post(requireAuth,logoutall);

export default router;