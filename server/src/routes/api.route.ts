import { Router } from "express";
import { getAllTickSightings, getAllTicks, getTickTrends, postTickSighting } from "../controllers/tick.controller";
import { getAllLocations } from "../controllers/data.controller";

const router = Router();

router.get("/ticks", getAllTicks);
router.get("/ticks/sightings", getAllTickSightings);
router.get("/ticks/trends", getTickTrends);

router.post("/ticks/report-sighting", postTickSighting);

router.get('/data/locations', getAllLocations);

export default router;