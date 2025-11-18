"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedDatabase;
const xlsx_1 = __importDefault(require("xlsx"));
const path_1 = __importDefault(require("path"));
const db_config_1 = __importDefault(require("../config/db.config"));
async function seedDatabase() {
    console.log("Seeding the database...");
    const cityLocationsFile = xlsx_1.default.readFile(path_1.default.resolve(__dirname, '../../sample_data/worldcities.xlsx'));
    const tickSightingsFile = xlsx_1.default.readFile(path_1.default.resolve(__dirname, '../../sample_data/tick-sightings.xlsx'));
    const cityLocationsData = xlsx_1.default.utils.sheet_to_json(cityLocationsFile.Sheets[cityLocationsFile.SheetNames[0]]).filter((obj) => obj.iso2 == "GB").map((obj) => ({
        name: obj.city,
        admin_name: obj.admin_name,
        latitude: obj.lat,
        longtitude: obj.lng,
        population: obj.population ?? null
    }));
    await db_config_1.default.sighting.deleteMany();
    await db_config_1.default.tick.deleteMany();
    await db_config_1.default.location.deleteMany();
    await db_config_1.default.location.createMany({
        data: cityLocationsData,
    });
    const citiesResult = await db_config_1.default.location.findMany({
        orderBy: {
            population: 'desc'
        }
    });
    console.log('Locations created: ' + citiesResult.length);
    const tickSightingsData = xlsx_1.default.utils.sheet_to_json(tickSightingsFile.Sheets[tickSightingsFile.SheetNames[0]]).map((obj) => ({
        date: obj.date + 'Z',
        location: obj.location,
        species: obj.species,
        latinName: obj.latinName
    })).sort((a, b) => a.species.localeCompare(b.species));
    const tickData = [];
    let sighting, tick, sightingDB;
    for (let i = 0; i < tickSightingsData.length; i++) {
        sighting = tickSightingsData[i];
        try {
            sightingDB = {
                date: sighting.date,
                location: {
                    connect: {
                        id: citiesResult.find(city => city.name === sighting.location || city.admin_name === sighting.location).id
                    }
                }
            };
        }
        catch {
            console.log(sighting);
            throw new Error("Meh");
        }
        if (i == 0 || tickSightingsData[i - 1].species !== sighting.species) {
            tick = {
                species: sighting.species,
                latinName: sighting.latinName,
                sightings: {
                    create: [sightingDB]
                }
            };
            tickData.push(tick);
        }
        else {
            tickData[tickData.length - 1].sightings.create.push(sightingDB);
        }
    }
    for (let tick of tickData) {
        const tickResult = await db_config_1.default.tick.create({
            data: tick
        });
        console.log("Registered " + tickResult.species);
    }
}
seedDatabase();
