-- Script para adicionar colunas de perfil médico
-- Execute este script no banco de dados MySQL

ALTER TABLE User 
ADD COLUMN stack VARCHAR(255) DEFAULT NULL COMMENT 'Especialidade médica principal',
ADD COLUMN crm VARCHAR(50) DEFAULT NULL COMMENT 'CRM ou registro profissional',
ADD COLUMN specialty VARCHAR(255) DEFAULT NULL COMMENT 'Área de atuação';
