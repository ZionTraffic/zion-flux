#!/bin/bash

# ===========================================
# 🚀 Deploy Automático - Hostinger
# Zion App - appziontraffic.com.br
# ===========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Deploy Zion App para Hostinger${NC}"
echo -e "${BLUE}========================================${NC}"

PROJECT_DIR="/Users/georgemarcel/WINDSURF/ZION APP/zion-flux"
cd "$PROJECT_DIR"

# Verificar se está no branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Mudando para branch main...${NC}"
    git checkout main
fi

# Passo 1: Commit das alterações pendentes
echo -e "\n${YELLOW}📝 Passo 1: Verificando alterações...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Commitando alterações pendentes...${NC}"
    git add -A
    git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
fi
echo -e "${GREEN}✅ Código atualizado${NC}"

# Passo 2: Build do projeto
echo -e "\n${YELLOW}🔨 Passo 2: Fazendo build de produção...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build concluído${NC}"

# Passo 3: Atualizar branch deploy
echo -e "\n${YELLOW}📤 Passo 3: Atualizando branch deploy...${NC}"

# Salvar o conteúdo do dist
cp -r dist /tmp/zion-deploy-temp

# Mudar para branch deploy
git checkout deploy

# Limpar arquivos antigos (exceto .git)
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} \;

# Copiar novos arquivos
cp -r /tmp/zion-deploy-temp/* .
rm -rf /tmp/zion-deploy-temp

# Commit e push
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin deploy

# Voltar para main
git checkout main

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n🌐 Acesse: https://appziontraffic.com.br"
echo -e "${YELLOW}⏳ Aguarde ~1 minuto para a Hostinger atualizar${NC}"
echo ""
