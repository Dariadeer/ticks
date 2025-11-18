"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_controllers_1 = require("../controllers/index.controllers");
const router = (0, express_1.Router)();
router.get("/ticks", index_controllers_1.getAllTicks);
router.get("/ticks/:id/sightings", index_controllers_1.getTickSightings);
exports.default = router;
