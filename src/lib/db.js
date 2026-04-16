import mysql from 'mysql2/promise';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não definida. Configure a variável de ambiente antes de iniciar o servidor.');
}

// Função para extrair dados da DATABASE_URL
const parseDbUrl = (url) => {
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
};

const dbConfig = parseDbUrl(process.env.DATABASE_URL);

if (!dbConfig) {
    throw new Error('DATABASE_URL inválida. Formato esperado: mysql://usuario:senha@host:porta/banco');
}

// Adiciona opções de pool
const poolConfig = {
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

const pool = mysql.createPool(poolConfig);

export async function query(sql, params = []) {
    try {
        // Converter undefined para null para evitar erros do driver mysql2
        const safeParams = params.map(p => p === undefined ? null : p);
        const [results] = await pool.execute(sql, safeParams);
        return results;
    } catch (error) {
        console.error('❌ Erro na query SQL:', error.message);
        // Se for erro de acesso, mostrar detalhes do host
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('⚠️ Detalhes do erro de acesso:', error.sqlMessage);
        }
        throw error;
    }
}

export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexão estabelecida com sucesso!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Falha na conexão:', error.message);
        return false;
    }
}

export default pool;
