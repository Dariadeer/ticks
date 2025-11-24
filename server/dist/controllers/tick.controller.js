"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTickSightings = getAllTickSightings;
exports.postTickSighting = postTickSighting;
exports.getAllTicks = getAllTicks;
exports.getTickTrends = getTickTrends;
const tick_model_1 = __importDefault(require("../models/tick.model"));
const location_model_1 = __importDefault(require("../models/location.model"));
const date_util_1 = require("../utils/date.util");
const objects_util_1 = require("../utils/objects.util");
async function getAllTickSightings(req, res) {
    const id = Number.parseInt(req.query.id);
    const after = (0, date_util_1.stringToDateOrUndefined)(req.query.after);
    const before = (0, date_util_1.stringToDateOrUndefined)(req.query.before);
    const severity = Number.parseInt(req.query.severity);
    let sightings = await tick_model_1.default.sightings(id, { after, before });
    const tick = await tick_model_1.default.get(id);
    const _locations = await location_model_1.default.get(...sightings.map((s) => s.locationId));
    let total = 0;
    let max = 0;
    let sum = 0;
    for (let s of sightings) {
        total += s._count;
        if (s._count > max) {
            max = s._count;
        }
        s.location = _locations.find(l => l.id === s.locationId);
        (0, objects_util_1.renameKey)(s, "_count", "count");
        delete s.locationId;
    }
    for (let s of sightings) {
        if (s.count < max / 3) {
            s.severity = 0;
        }
        else if (s.count < 2 * max / 3) {
            s.severity = 1;
        }
        else {
            s.severity = 2;
        }
    }
    const toFilter = !isNaN(severity) && severity >= 0 && severity <= 2;
    if (toFilter) {
        sightings = sightings.filter((s) => s.severity === severity);
    }
    for (let s of sightings) {
        sum += s.count;
    }
    res.json({ data: {
            sightings,
            total,
            max,
            tick,
            sum,
            severity: isNaN(severity) ? null : severity,
            after,
            before
        } });
}
async function postTickSighting(req, res) {
    const tickId = Number.parseInt(req.body.tickId);
    const locationId = Number.parseInt(req.body.locationId);
    if (isNaN(tickId) || isNaN(locationId)) {
        return res.status(400).json({ error: "Tick and/or Location weren't specified" });
    }
    try {
        const sighting = await tick_model_1.default.report(tickId, locationId);
        res.json({ success: true, data: { sighting } });
    }
    catch {
        res.json({ error: "Failed to report a sighting" });
    }
}
async function getAllTicks(req, res) {
    const data = await tick_model_1.default.all();
    res.json({ data });
}
async function getTickTrends(req, res) {
    let tickId = Number.parseInt(req.query.id);
    let locationId = Number.parseInt(req.query.locationId);
    let mode = Number.parseInt(req.query.mode);
    const after = (0, date_util_1.stringToDateOrUndefined)(req.query.after);
    const before = (0, date_util_1.stringToDateOrUndefined)(req.query.before);
    if (isNaN(tickId))
        tickId = -1;
    if (isNaN(locationId))
        locationId = -1;
    if (isNaN(mode))
        mode = 0;
    const data = await tick_model_1.default.trends(tickId, after, before, mode, locationId);
    for (let d of data) {
        d.count = Number(d.count);
        if (d.w)
            d.w = Number(d.w);
        delete d.cdate;
    }
    res.json({ data: {
            trends: data,
            mode: mode
        } });
}
