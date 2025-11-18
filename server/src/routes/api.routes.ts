import { Router } from "express";
import { getTickSightings, getAllTicks } from "../controllers/index.controllers"

const router = Router();

router.get("/ticks", getAllTicks);
router.get("/ticks/:id/sightings", getTickSightings);

export default router;