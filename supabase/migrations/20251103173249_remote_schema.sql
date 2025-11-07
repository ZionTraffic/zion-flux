-- Migration: Create tenants table for multi-tenancy
-- Created: 2024-11-03
-- Description: Base table for multi-tenant architecture

-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT, -- domínio personalizado (opcional)
  database_key TEXT NOT NULL, -- 'asf', 'sieg', 'empresa3'
  
  -- Configurações da empresa
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}', -- cores, logo, etc.
  
  -- Controle de acesso
  active BOOLEAN DEFAULT true,
  max_users INTEGER DEFAULT 50,
  max_leads INTEGER DEFAULT 10000,
  
  -- Plano e billing
  plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'pro', 'enterprise')),
  billing_email TEXT,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tenants_new_slug ON tenants_new(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_new_database_key ON tenants_new(database_key);
CREATE INDEX IF NOT EXISTS idx_tenants_new_active ON tenants_new(active) WHERE active = true;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_new_updated_at 
    BEFORE UPDATE ON tenants_new 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE tenants_new IS 'Tabela principal para multi-tenancy - representa cada empresa/cliente';
COMMENT ON COLUMN tenants_new.database_key IS 'Chave única para identificar o banco/schema da empresa';
COMMENT ON COLUMN tenants_new.settings IS 'Configurações específicas da empresa (JSON)';
COMMENT ON COLUMN tenants_new.branding IS 'Configurações de marca: cores, logo, tema (JSON)';
COMMENT ON COLUMN tenants_new.max_users IS 'Limite máximo de usuários para este tenant';
COMMENT ON COLUMN tenants_new.max_leads IS 'Limite máximo de leads para este tenant';