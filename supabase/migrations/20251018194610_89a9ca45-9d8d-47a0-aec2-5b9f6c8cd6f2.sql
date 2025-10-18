-- Adicionar coluna database à tabela workspaces
ALTER TABLE workspaces 
ADD COLUMN database text NOT NULL DEFAULT 'asf' 
CHECK (database IN ('asf', 'sieg'));

-- Atualizar workspace existente ASF Finance (se existir)
UPDATE workspaces 
SET database = 'asf' 
WHERE slug = 'asf-finance';

-- Criar índice para melhor performance
CREATE INDEX idx_workspaces_database ON workspaces(database);