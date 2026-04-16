import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Testar conexão e listar tabelas
export async function GET() {
    try {
        // Teste de conexão
        const info = await query('SELECT NOW() as serverTime, (SELECT DATABASE()) as dbname');

        // Listar tabelas
        const tables = await query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        return NextResponse.json({
            success: true,
            connection: {
                serverTime: info[0].serverTime,
                database: info[0].dbname
            },
            tables: tableNames
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
