#!/bin/bash

# ===========================================
# 🚀 Script de Deploy para Hostinger (FTP)
# Zion App - appziontraffic.com.br
# ===========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Deploy Zion App para Hostinger (FTP)${NC}"
echo -e "${BLUE}========================================${NC}"

# Diretório do projeto
PROJECT_DIR="/Users/georgemarcel/WINDSURF/ZION APP/zion-flux"
cd "$PROJECT_DIR"

# Configurações FTP da Hostinger
FTP_HOST="ftp.appziontraffic.com.br"
FTP_USER="u424331438"
FTP_PASS="Met@581017"
FTP_PATH="/public_html"

echo -e "${GREEN}📡 Servidor FTP: $FTP_HOST${NC}"
echo -e "${GREEN}👤 Usuário: $FTP_USER${NC}"
echo -e "${GREEN}📁 Destino: $FTP_PATH${NC}"

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

# Passo 3: Deploy via FTP usando lftp
echo -e "\n${YELLOW}📤 Passo 3: Enviando arquivos via FTP...${NC}"
lftp -c "
set ftp:ssl-allow no;
set ssl:verify-certificate no;
open -u $FTP_USER,$FTP_PASS $FTP_HOST;
lcd $PROJECT_DIR/dist;
cd $FTP_PATH;
mirror --reverse --delete --verbose --parallel=5 . .;
bye
"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no deploy FTP${NC}"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n🌐 Acesse: https://appziontraffic.com.br"
echo ""
