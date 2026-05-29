
import { query } from '../src/lib/db.js';

async function run() {
    try {
        console.log("Adicionando coluna status...");
        await query("ALTER TABLE User ADD COLUMN status VARCHAR(20) DEFAULT 'PENDING'");
        console.log("Coluna adicionada.");
    } catch (e) {
        if (e.message.includes("Duplicate column name")) {
            console.log("Coluna status já existe.");
        } else {
            console.error("Erro ao adicionar coluna:", e);
        }
    }

    try {
        console.log("Aprovando admins e membros existentes (para teste)...");
        // Vou aprovar todos os existentes para não bloquear o usuario atual, 
        // mas novos cadastros serão PENDING
        await query("UPDATE User SET status = 'APPROVED'");
        console.log("Usuários existentes aprovados.");
    } catch (e) {
        console.error("Erro ao atualizar usuários:", e);
    }

    process.exit(0);
}

run();
