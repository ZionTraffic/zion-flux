#!/usr/bin/env python3
import subprocess
import os

print("\n🔍 DIAGNÓSTICO MCP SUPABASE\n")
print("="*60)

print("\n1️⃣ Verificando MCP...")
os.system('npm list -g @supabase/mcp 2>/dev/null | grep supabase && echo "✅ MCP encontrado" || echo "❌ MCP não encontrado"')

print("\n2️⃣ Variáveis de ambiente...")
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY')
print(f"✅ SUPABASE_URL: {url[:30] if url else '❌ Não configurada'}")
print(f"✅ SUPABASE_ANON_KEY: {key[:20] if key else '❌ Não configurada'}")

print("\n" + "="*60 + "\n")
