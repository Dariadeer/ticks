"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const api_route_1 = __importDefault(require("./api.route"));
const router = (0, express_1.Router)();
router.use("/api", api_route_1.default);
exports.default = router;
