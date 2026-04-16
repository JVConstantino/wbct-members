
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log("Testing DB Connection...");
    const dbUrl = process.env.DATABASE_URL;
    console.log("URL Found:", !!dbUrl);

    try {
        const connection = await mysql.createConnection(dbUrl);
        console.log("✅ Success!");
        await connection.end();
    } catch (err) {
        console.error("❌ Link Error:");
        console.error("Code:", err.code);
        console.error("Message:", err.message);
    }
}

test();
