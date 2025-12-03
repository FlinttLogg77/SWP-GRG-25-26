import { Hono } from 'hono';
import * as airport from './repository/airport.ts';
import * as plane from './repository/plane.ts';
import * as passenger from './repository/passenger.ts';
import * as flight from './repository/flight.ts';
import { disconnect } from './repository/db.ts';

const app = new Hono();

// Middleware: CORS
app.use('*', async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type');
    if (c.req.method === 'OPTIONS') return c.text('OK');
    await next();
});

// Routes: Airports
app.get('/airports', async (c) => {
    const airports = await airport.getAll();
    return c.json(airports);
});

app.get('/airports/count', async (c) => {
    const count = await airport.count();
    return c.json({ count });
});

// Routes: Planes
app.get('/planes', async (c) => {
    const planes = await plane.getAll();
    return c.json(planes);
});

app.get('/planes/count', async (c) => {
    const count = await plane.count();
    return c.json({ count });
});

// Routes: Passengers
app.get('/passengers/count', async (c) => {
    const count = await passenger.count();
    return c.json({ count });
});

// Routes: Flights
app.get('/flights/count', async (c) => {
    const count = await flight.count();
    return c.json({ count });
});

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'OK' });
});

// Graceful shutdown
const server = Deno.serve({ port: 3000, hostname: '0.0.0.0' }, app.fetch);
console.log('🚀 Server running at http://localhost:3000');
console.log('📚 Available endpoints:');
console.log('  GET /health');
console.log('  GET /airports');
console.log('  GET /airports/count');
console.log('  GET /planes');
console.log('  GET /planes/count');
console.log('  GET /passengers/count');
console.log('  GET /flights/count');

// Handle shutdown signals
Deno.addSignalListener('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down...');
    await disconnect();
    server.shutdown();
    Deno.exit(0);
});

Deno.addSignalListener('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down...');
    await disconnect();
    server.shutdown();
    Deno.exit(0);
});

