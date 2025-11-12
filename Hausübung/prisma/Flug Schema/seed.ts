import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const ensurePassengers = 20000;
const ensureAirports = 100;
const ensurePlanes = 250;

// ensure passengers (no deps)
// Erstelle 20.000 Passagiere mit zufälligen Namen und Email-Adressen
while (await prisma.passenger.count() < ensurePassengers) {
    try {
        await prisma.passenger.create({
            data: {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
            },
        });
    } catch (e) {
        console.error(`Error creating passenger`, (e as Error).message);
    }
}

// ensure planes (no deps)
// Erstelle 250 Flugzeuge mit zufälligen Modellnamen und Kapazitäten (10-850 Plätze)
const planes_to_create = ensurePlanes - await prisma.plane.count();
for (let i = 0; i < planes_to_create; i++) {
    await prisma.plane.create({
        data: {
            model: faker.airline.airplane().name,
            capacity: faker.number.int({ min: 10, max: 850 }),
        },
    });
}

// ensure 100 airports (no deps)
// Erstelle 100 Flughäfen mit zufälligen Namen, IATA-Codes und Städten
const airports_to_create = ensureAirports - await prisma.airport.count();
for (let i = 0; i < airports_to_create; i++) {
    try {
        const fakeAirport = faker.airline.airport();
        await prisma.airport.create({
            data: {
                name: fakeAirport.name,
                iataCode: fakeAirport.iataCode,
                city: faker.location.city(),
            },
        });
    } catch (e) {
        console.error(`Error creating airport`, (e as Error).message);
    }
}

// ensure flights (depends on airport, plane)
// Erstelle Flüge zwischen zufälligen Flughäfen mit zufälligen Flugzeugen und Zeiten
const flights_to_create = 500 - await prisma.flight.count();
const airports = await prisma.airport.findMany();
const planes = await prisma.plane.findMany();

if (airports.length >= 2 && planes.length > 0) {
    for (let i = 0; i < flights_to_create; i++) {
        const departure = faker.date.soon({ days: 30 });
        const arrival = new Date(departure.getTime() + faker.number.int({ min: 3600000, max: 36000000 })); // 1-10 Stunden später

        await prisma.flight.create({
            data: {
                flightNumber: `${faker.airline.flightNumber()}`,
                departureTime: departure,
                arrivalTime: arrival,
                originId: airports[faker.number.int({ min: 0, max: airports.length - 1 })].id,
                destinationId: airports[faker.number.int({ min: 0, max: airports.length - 1 })].id,
                planeId: planes[faker.number.int({ min: 0, max: planes.length - 1 })].id,
            },
        });
    }
}

console.log("✅ Seed erfolgreich abgeschlossen!");
await prisma.$disconnect();