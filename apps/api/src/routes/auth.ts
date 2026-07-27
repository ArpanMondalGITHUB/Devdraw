import { Router } from "express";

const router = Router()

router.get("/signin",(req,res) => {
    res.json({message:"sign in"})
});

export default router;