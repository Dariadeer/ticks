"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTickSightings = getTickSightings;
exports.getAllTicks = getAllTicks;
const tick_model_1 = __importDefault(require("../models/tick.model"));
async function getTickSightings(req, res) {
    const id = Number(req.params.id);
    const data = await tick_model_1.default.sightings(id);
    res.json({ data });
}
async function getAllTicks(req, res) {
    const data = await tick_model_1.default.all();
    res.json({ data });
}
