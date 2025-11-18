import xlsx from 'xlsx';
import path from 'path';

import prisma from '../config/db.config'

export default async function seedDatabase() {
    console.log("Seeding the database...");
    const cityLocationsFile = xlsx.readFile(path.resolve(__dirname, '../../sample_data/worldcities.xlsx'));
    const tickSightingsFile = xlsx.readFile(path.resolve(__dirname, '../../sample_data/tick-sightings.xlsx'));

    const cityLocationsData = xlsx.utils.sheet_to_json(
        cityLocationsFile.Sheets[cityLocationsFile.SheetNames[0]]
    ).filter((obj: any) => obj.iso2 == "GB").map((obj: any) => ({
        name: obj.city,
        admin_name: obj.admin_name,
        latitude: obj.lat,
        longtitude: obj.lng,
        population: obj.population ?? null
    }));

    await prisma.sighting.deleteMany();
    await prisma.tick.deleteMany();
    await prisma.location.deleteMany();

    await prisma.location.createMany({
        data: cityLocationsData,
    });

    const citiesResult = await prisma.location.findMany({
        orderBy: {
            population: 'desc'
        }
    })

    console.log('Locations created: ' + citiesResult.length);

    const tickSightingsData = xlsx.utils.sheet_to_json(
        tickSightingsFile.Sheets[tickSightingsFile.SheetNames[0]]
    ).map((obj: any) => ({
        date: obj.date + 'Z',
        location: obj.location,
        species: obj.species,
        latinName: obj.latinName
    })).sort((a: any, b: any) => a.species.localeCompare(b.species));

    const tickData: any[] = [];

    let sighting, tick, sightingDB;
    for(let i = 0; i < tickSightingsData.length; i++) {
        sighting = tickSightingsData[i];
        try {
            sightingDB = {
                date: sighting.date,
                location: {
                    connect: {
                        id: citiesResult.find(city => city.name === sighting!.location || city.admin_name === sighting!.location)!.id
                    }
                }
            }
        } catch {
            console.log(sighting);
            throw new Error("Meh");
        }
        
        if(i == 0 || tickSightingsData[i - 1].species !== sighting.species) {
            tick = {
                species: sighting.species,
                latinName: sighting.latinName,
                sightings: {
                    create: [sightingDB]
                }
            };
            tickData.push(tick);
        } else {
            tickData[tickData.length - 1].sightings.create.push(sightingDB);
        }
    }

    for(let tick of tickData) {
        const tickResult = await prisma.tick.create({
            data: tick
        });
        console.log("Registered " + tickResult.species);
    }
    
}

seedDatabase();