-- Script para limpar usuários órfãos manualmente
-- Execute este script no Supabase SQL Editor quando necessário

-- 1. Ver usuários órfãos
SELECT 
  u.id,
  u.email,
  u.created_at,
  'ÓRFÃO - Não está em nenhum workspace' as status
FROM auth.users u
WHERE u.id NOT IN (
  SELECT DISTINCT user_id FROM membros_workspace
)
AND u.email != 'george@ziontraffic.com.br'
ORDER BY u.created_at DESC;

-- 2. Deletar usuários órfãos (CUIDADO: Execute apenas se tiver certeza!)
-- DELETE FROM auth.users
-- WHERE id NOT IN (
--   SELECT DISTINCT user_id FROM membros_workspace
-- )
-- AND email != 'george@ziontraffic.com.br';
