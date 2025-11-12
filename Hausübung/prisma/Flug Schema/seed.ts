import { PrismaClient } from "./prisma/client/deno.ts";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
    for (let i = 0; i < 10; i++) {
        const fakeAirport = faker.airline.airport();
        await prisma.airport.create({
            data: {
                name: fakeAirport.name,
                iataCode: fakeAirport.iataCode,
                city: faker.location.city(),
            },
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        Deno.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });