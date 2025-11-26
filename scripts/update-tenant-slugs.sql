-- Script para padronizar slugs dos tenants
-- Executar no Supabase SQL Editor

-- Verificar slugs atuais
SELECT id, name, slug FROM tenants_new ORDER BY name;

-- Atualizar slugs para ficarem padronizados
-- ASF Finance -> asf-finance
UPDATE tenants_new 
SET slug = 'asf-finance' 
WHERE name ILIKE '%ASF%Finance%' OR name ILIKE '%ASF Finance%';

-- SIEG Pré-Vendas -> sieg-pre-vendas
UPDATE tenants_new 
SET slug = 'sieg-pre-vendas' 
WHERE name ILIKE '%SIEG%Pré-Vendas%' OR name ILIKE '%SIEG Pre-Vendas%' OR name ILIKE '%SIEG Pré Vendas%';

-- SIEG Financeiro -> sieg-financeiro
UPDATE tenants_new 
SET slug = 'sieg-financeiro' 
WHERE name ILIKE '%SIEG%Financeiro%' OR name ILIKE '%SIEG Financeiro%';

-- Verificar resultado
SELECT id, name, slug FROM tenants_new ORDER BY name;
