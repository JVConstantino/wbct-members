
import dotenv from 'dotenv';
dotenv.config();
import { query } from './src/lib/db.js';

async function run() {
    console.log("--- Starting Test ---");
    try {
        const res = await query("SELECT 1 as val");
        console.log("Query Result:", res);
    } catch (e) {
        console.error("Test Failed:", e.message);
    }
    process.exit(0);
}

run();
