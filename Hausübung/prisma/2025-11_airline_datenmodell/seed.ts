import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const ensurePassengers = 20000;
const ensureAirports = 100;
const ensurePlanes = 250;
const ensureFlights = 500;

// ensure passengers (no deps)
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
const planes_to_create = ensurePlanes - await prisma.plane.count();
for (let i = 0; i < planes_to_create; i++) {
    await prisma.plane.create({
        data: {
            model: faker.airline.airplane().name,
            capacity: faker.number.int({ min: 10, max: 850 }),
        },
    });
}

// ensure airports (no deps)
const airports_to_create = ensureAirports - await prisma.airport.count();
for (let i = 0; i < airports_to_create; i++) {
    const fake_airport = faker.airline.airport();
    await prisma.airport.create({
        data: {
            name: fake_airport.name,
            iataCode: fake_airport.iataCode,
            city: faker.location.city(),
        },
    });
}

// ensure flights (depends on airport, plane)
const flights_to_create = ensureFlights - await prisma.flight.count();
const airports = await prisma.airport.findMany();
const planes = await prisma.plane.findMany();

if (airports.length >= 2 && planes.length > 0) {
    for (let i = 0; i < flights_to_create; i++) {
        const departure = faker.date.soon({ days: 30 });
        const arrival = new Date(departure.getTime() + faker.number.int({ min: 3600000, max: 36000000 }));

        await prisma.flight.create({
            data: {
                flightNumber: faker.airline.flightNumber(),
                departureTime: departure,
                arrivalTime: arrival,
                originId: airports[Math.floor(Math.random() * airports.length)].id,
                destinationId: airports[Math.floor(Math.random() * airports.length)].id,
                planeId: planes[Math.floor(Math.random() * planes.length)].id,
            },
        });
    }
}

console.log("✅ Seed erfolgreich abgeschlossen!");
await prisma.$disconnect();