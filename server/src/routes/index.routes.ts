import { Router } from "express";
import apiRouter from "./api.routes";

const router = Router();

router.use("/api", apiRouter);

export default router;