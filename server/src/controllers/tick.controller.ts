import { Request, Response } from "express";
import ticks from "../models/tick.model";
import locations from "../models/location.model";
import { stringToDateOrUndefined } from "../utils/date.util";
import { renameKey } from "../utils/objects.util";

export async function getAllTickSightings(req: Request, res: Response) {
    const id = Number.parseInt(req.query.id as string);
    const after = stringToDateOrUndefined(req.query.after as string);
    const before = stringToDateOrUndefined(req.query.before as string);
    const severity = Number.parseInt(req.query.severity as string);

    let sightings = await ticks.sightings(id, { after, before });
    const tick = await ticks.get(id);

    const _locations = await locations.get(...sightings.map((s: any) => s.locationId));
    let total = 0;
    let max = 0;
    let sum = 0;

    for(let s of sightings) {
        total += s._count;
        if(s._count > max) {
            max = s._count;
        }
        (s as any).location = _locations.find(l => l.id === s.locationId);
        renameKey(s as any, "_count", "count");
        delete (s as any).locationId;
    }

    for(let s of sightings) {
        if((s as any).count < max / 3) {
            (s as any).severity = 0;
        } else if((s as any).count < 2 * max / 3) {
            (s as any).severity = 1;
        } else {
            (s as any).severity = 2;
        }
    }

    const toFilter = !isNaN(severity) && severity >= 0 && severity <= 2

    if(toFilter) {
        (sightings as any) = sightings.filter((s: any) => s.severity === severity);
    }

    for(let s of sightings) {
        sum += (s as any).count;
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

export async function postTickSighting(req: Request, res: Response) {
    const tickId = Number.parseInt(req.body.tickId);
    const locationId = Number.parseInt(req.body.locationId);

    if(isNaN(tickId) || isNaN(locationId)) {
        return res.status(400).json({ error: "Tick and/or Location weren't specified" });
    }
    try {
        const sighting = await ticks.report(tickId, locationId);
        res.json({ success: true, data: { sighting } });
    } catch {
        res.json({ error: "Failed to report a sighting" });
    }

}


export async function getAllTicks(req: Request, res: Response) {
    const data = await ticks.all();
    res.json({ data });
}

export async function getTickTrends(req: Request, res: Response) {

    let tickId = Number.parseInt(req.query.id as string);
    let locationId = Number.parseInt(req.query.locationId as string);
    let mode = Number.parseInt(req.query.mode as string);
    const after = stringToDateOrUndefined(req.query.after as string);
    const before = stringToDateOrUndefined(req.query.before as string);

    console.log(req.query, after, before);

    if(isNaN(tickId)) tickId = -1;
    if(isNaN(locationId)) locationId = -1;
    if(isNaN(mode)) mode = 0;


    const data = await ticks.trends(tickId, after, before, mode, locationId);
    for(let d of (data as any[])) {
        d.count = Number(d.count);
        if(d.w) d.w = Number(d.w);
        delete d.cdate;
    }
    res.json({ data: {
        trends: data,
        mode: mode
    } });
}