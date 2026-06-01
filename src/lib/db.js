import mysql from 'mysql2/promise';

let pool = null;

function parseDbUrl(url) {
    try {
        const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
        const match = url.match(regex);
        if (match) {
            return {
                user: match[1],
                password: decodeURIComponent(match[2]),
                host: match[3],
                port: parseInt(match[4]),
                database: match[5]
            };
        }
    } catch (e) {
        console.error("Erro ao processar DATABASE_URL:", e);
    }
    return null;
}

function getPool() {
    if (pool) return pool;
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL não definida. Configure a variável de ambiente ou defina USE_APPWRITE_DB=1 para usar Appwrite como banco primário.');
    }
    const dbConfig = parseDbUrl(process.env.DATABASE_URL);
    if (!dbConfig) {
        throw new Error('DATABASE_URL inválida. Formato esperado: mysql://usuario:senha@host:porta/banco');
    }
    pool = mysql.createPool({
        ...dbConfig,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
    });
    return pool;
}

export function isDatabaseConfigured() {
    return Boolean(process.env.DATABASE_URL);
}

export async function query(sql, params = []) {
    try {
        const safeParams = params.map(p => p === undefined ? null : p);
        const [results] = await getPool().execute(sql, safeParams);
        return results;
    } catch (error) {
        console.error('❌ Erro na query SQL:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('⚠️ Detalhes do erro de acesso:', error.sqlMessage);
        }
        throw error;
    }
}

export async function testConnection() {
    try {
        const connection = await getPool().getConnection();
        console.log('✅ Conexão estabelecida com sucesso!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Falha na conexão:', error.message);
        return false;
    }
}

export default { query, testConnection, isDatabaseConfigured };
