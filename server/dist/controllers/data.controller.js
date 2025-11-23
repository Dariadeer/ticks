"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLocations = getAllLocations;
const data_model_1 = __importDefault(require("../models/data.model"));
async function getAllLocations(req, res) {
    res.json({ data: await data_model_1.default.cities() });
}
