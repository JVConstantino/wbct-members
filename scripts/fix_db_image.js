const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));

            if (dbUrlLine) {
                const url = dbUrlLine.split('=')[1].trim().replace(/^"|"$/g, '');

                const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
                const match = url.match(regex);

                if (match) {
                    const config = {
                        user: match[1],
                        password: decodeURIComponent(match[2]),
                        host: match[3],
                        port: parseInt(match[4]),
                        database: match[5]
                    };

                    const connection = await mysql.createConnection(config);
                    console.log('Connected to database.');

                    console.log('Altering User table image column to LONGTEXT...');
                    await connection.query('ALTER TABLE User MODIFY COLUMN image LONGTEXT');

                    console.log('Success! Image column updated.');
                    await connection.end();
                    return;
                }
            }
        }
        console.error('Could not parse DATABASE_URL from .env');

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
