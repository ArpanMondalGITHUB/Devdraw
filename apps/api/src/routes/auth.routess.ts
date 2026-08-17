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
import { 
    requireAuth,
    validate ,
    authLimiter
} from "../middleware/auth.middleware";
import { 
    deleteMeSchema,
    signinSchema,
    signupSchema,
    updateMeSchema,
    patchMeSchema
} from "@devdraw/shared";

const router = Router()

router.route("/signup").post(authLimiter,validate(signupSchema), signup);
router.route("/signin").post(authLimiter,validate(signinSchema),signin);
router.route("/refresh-token").post(authLimiter,refresh);
router.route("/logout").post(logout);
router.route("/logoutall").post(requireAuth,logoutall);
router.route("/me")
      .get(requireAuth, getMe)
      .put(requireAuth, validate(updateMeSchema), updateMe)
      .patch(requireAuth, validate(patchMeSchema), patchMe)
      .delete(requireAuth, validate(deleteMeSchema), deleteMe);

export default router;