import prisma from "../config/db.config";

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
]

const ticks = {
    all,
    sightings,
    report,
    get,
    trends
}

function all() {
    return prisma.tick.findMany();
}

function sightings(id: number, options?: { after?: Date, before?: Date }) {
    if(!id || isNaN(id)) {
        return prisma.sighting.groupBy({
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
    return prisma.sighting.groupBy({
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

function trends(tickId: number = -1, after: Date | undefined, before: Date | undefined, mode: number = 2, locationId: number = -1) {
    return prisma.$queryRawUnsafe(
        trendQueries[mode].replace('%WHERE%', 
            `WHERE ${tickId === -1 ? '' : `tickId = ${tickId} AND`} ${locationId === -1 ? '' : `locationId = ${locationId} AND`} "cdate" > '${after?.toISOString() ?? '1900-01-01'}' AND "cdate" < '${before?.toISOString() ?? '3000-01-01'}'`
        )
    );
}

function report(id: number, locationId: number) {
    return prisma.sighting.create({
        data: {
            tickId: id,
            locationId: locationId
        },
        include: {
            location: true,
            tick: true
        }
    })
}

function get(id: number) {
    return prisma.tick.findFirst({
        where: {
            id: id
        }
    })
}

export default ticks;