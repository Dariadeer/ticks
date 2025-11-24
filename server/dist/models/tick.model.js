"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_config_1 = __importDefault(require("../config/db.config"));
const trendQueries = [
    `
        SELECT 
        date(date / 1000, 'unixepoch') AS cdate, date((date / 604800000 * 604800), 'unixepoch') AS week, COUNT() as count
        FROM Sighting
        %WHERE%
        GROUP BY week;
    `,
    `
        SELECT COUNT() as count, strftime('%Y-%m', date(date / 1000, 'unixepoch')) as month, date(date / 1000, 'unixepoch') AS cdate
        FROM Sighting
        %WHERE%
        GROUP BY month
    `,
    `
        SELECT date("date" / 1000, 'unixepoch') AS "cdate", strftime('%Y', date("date" / 1000, 'unixepoch')) AS year, COUNT() as "count"
        FROM "Sighting"
        %WHERE%
        GROUP BY year;
    `
];
const ticks = {
    all,
    sightings,
    report,
    get,
    trends
};
function all() {
    return db_config_1.default.tick.findMany();
}
function sightings(id, options) {
    if (!id || isNaN(id)) {
        return db_config_1.default.sighting.groupBy({
            by: ['locationId'],
            where: {
                date: {
                    lte: options?.before,
                    gte: options?.after
                }
            },
            _count: true,
            orderBy: {
                _count: {
                    tickId: 'desc'
                }
            }
        });
    }
    return db_config_1.default.sighting.groupBy({
        by: ['locationId'],
        where: {
            tickId: id,
            date: {
                lte: options?.before,
                gte: options?.after
            }
        },
        _count: true,
    });
}
function trends(tickId = -1, after, before, mode = 2, locationId = -1) {
    return db_config_1.default.$queryRawUnsafe(trendQueries[mode].replace('%WHERE%', `WHERE ${tickId === -1 ? '' : `tickId = ${tickId} AND`} ${locationId === -1 ? '' : `locationId = ${locationId} AND`} "cdate" > '${after?.toISOString() ?? '1900-01-01'}' AND "cdate" < '${before?.toISOString() ?? '3000-01-01'}'`));
}
function report(id, locationId) {
    return db_config_1.default.sighting.create({
        data: {
            tickId: id,
            locationId: locationId
        },
        include: {
            location: true,
            tick: true
        }
    });
}
function get(id) {
    return db_config_1.default.tick.findFirst({
        where: {
            id: id
        }
    });
}
exports.default = ticks;
