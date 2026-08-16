import { rateLimit } from 'express-rate-limit';
import { Router } from "express";
import {
    signup,
    signin,
    logout,
    logoutall,
    refresh,
    getMe,
    deleteMe,
    patchMe,
    updateMe,
 } from "../controllers/auth.controllers";
import { requireAuth, validate , authLimiter} from "../middleware/auth.middleware";
import { signinSchema, signupSchema } from "@devdraw/shared";
const router = Router()

router.route("/signup").post(authLimiter,validate(signupSchema), signup);
router.route("/signin").post(authLimiter,validate(signinSchema),signin);
router.route("/refresh-token").post(refresh);
router.route("/logout").post(logout);
router.route("/logoutall").post(logoutall);
router.route("/me").get(requireAuth,getMe);
router.route("/me").put(requireAuth,updateMe);
router.route("/me").patch(requireAuth,patchMe);
router.route("/me").delete(requireAuth,deleteMe);

export default router;