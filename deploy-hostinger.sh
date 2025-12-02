#!/bin/bash

# ===========================================
# 🚀 Script de Deploy para Hostinger
# Zion App - appziontraffic.com.br
# ===========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Deploy Zion App para Hostinger${NC}"
echo -e "${BLUE}========================================${NC}"

# Diretório do projeto
PROJECT_DIR="/Users/georgemarcel/WINDSURF/ZION APP/zion-flux"
cd "$PROJECT_DIR"

# Carregar variáveis do arquivo .env.hostinger se existir
if [ -f "$PROJECT_DIR/.env.hostinger" ]; then
    echo -e "${GREEN}📄 Carregando configurações de .env.hostinger${NC}"
    export $(cat "$PROJECT_DIR/.env.hostinger" | grep -v '^#' | xargs)
fi

# Configurações da Hostinger
HOSTINGER_USER="${HOSTINGER_USER:-u424331438}"
HOSTINGER_HOST="${HOSTINGER_HOST:-217.196.55.53}"
HOSTINGER_PATH="${HOSTINGER_PATH:-/public_html}"
HOSTINGER_PORT="${HOSTINGER_PORT:-65002}"
HOSTINGER_PASS="${HOSTINGER_PASS:-Met@581017}"

echo -e "${GREEN}📡 Servidor: $HOSTINGER_HOST:$HOSTINGER_PORT${NC}"
echo -e "${GREEN}👤 Usuário: $HOSTINGER_USER${NC}"
echo -e "${GREEN}📁 Destino: $HOSTINGER_PATH${NC}"

# Passo 1: Instalar dependências
echo -e "\n${YELLOW}📦 Passo 1: Instalando dependências...${NC}"
npm install --silent
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# Passo 2: Build do projeto
echo -e "\n${YELLOW}🔨 Passo 2: Fazendo build de produção...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build concluído${NC}"

# Passo 3: Deploy via rsync com sshpass
echo -e "\n${YELLOW}📤 Passo 3: Enviando arquivos para Hostinger...${NC}"
sshpass -p "$HOSTINGER_PASS" rsync -avz --delete \
    -e "ssh -p $HOSTINGER_PORT -o StrictHostKeyChecking=no" \
    "$PROJECT_DIR/dist/" \
    "$HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH/"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no deploy${NC}"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n🌐 Acesse: https://appziontraffic.com.br"
echo ""
