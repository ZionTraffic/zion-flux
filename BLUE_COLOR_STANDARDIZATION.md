# Padronizacao de Cores - Tons de Azul Zion

Data: 22/10/2025

## Objetivo

Remover todas as cores vermelhas e roxas do sistema, padronizando com tons de azul da marca Zion.

## Cores Removidas

### Vermelho:
- ❌ --destructive: 0 72% 51% (vermelho)
- ❌ --gradient-rose: roxo/rosa

### Roxo:
- ❌ --secondary: 271 91% 65% (lilac)
- ❌ --purple: 262 83% 58%
- ❌ --gradient-purple: roxo

### Verde:
- ❌ Gradiente verde nos Action Cards (qualificacao)

### Laranja:
- ❌ --orange: 38 92% 50%
- ❌ --gradient-orange: laranja
- ❌ --gradient-amber: ambar

## Cores Substituidas

### Paleta de Azuis Zion:

1. **Azul Escuro (Primary)**
   - --primary: 217 91% 60%
   - Uso: Botoes principais, links

2. **Azul Claro (Secondary)**
   - --secondary: 199 89% 48%
   - Uso: Elementos secundarios

3. **Sky Blue**
   - Uso: Card Qualificacao
   - Gradiente: #0c4a6e → #0369a1

4. **Cyan**
   - --cyan: 189 94% 43%
   - Uso: Card Analise
   - Gradiente: #075985 → #0284c7

5. **Azul Dourado**
   - --gold: 210 100% 56%
   - Uso: Elementos premium

## Mudancas por Arquivo

### 1. index.css

#### Cores Base:
```css
/* ANTES */
--secondary: 271 91% 65% (roxo)
--destructive: 0 72% 51% (vermelho)
--purple: 262 83% 58% (roxo)
--orange: 38 92% 50% (laranja)

/* DEPOIS */
--secondary: 199 89% 48% (azul claro)
--destructive: 217 91% 60% (azul)
--purple: 217 91% 60% (azul)
--orange: 210 100% 56% (azul dourado)
```

#### Gradientes:
```css
/* ANTES */
--gradient-purple: roxo
--gradient-rose: rosa
--gradient-orange: laranja
--gradient-amber: ambar

/* DEPOIS */
--gradient-purple: tons de azul
--gradient-rose: tons de azul
--gradient-orange: tons de azul
--gradient-amber: tons de azul
```

### 2. ActionCard.tsx

#### Qualificacao:
```css
/* ANTES */
gradient: #166534 → #15803d (verde)
color: text-green-100
border: border-green-500/20

/* DEPOIS */
gradient: #0c4a6e → #0369a1 (sky blue)
color: text-sky-100
border: border-sky-500/20
```

#### Analise:
```css
/* ANTES */
gradient: #581c87 → #6b21a8 (roxo)
color: text-purple-100
border: border-purple-500/20

/* DEPOIS */
gradient: #075985 → #0284c7 (cyan)
color: text-cyan-100
border: border-cyan-500/20
```

## Paleta Final de Azuis

### Tons Disponiveis:

1. **Azul Escuro:** #1e3a8a, #1e40af
2. **Azul Medio:** #217 91% 60%
3. **Azul Claro:** #199 89% 48%
4. **Sky Blue:** #0c4a6e, #0369a1
5. **Cyan:** #075985, #0284c7, #189 94% 43%
6. **Azul Dourado:** #210 100% 56%

## Impacto Visual

### Action Cards:
- ✅ Trafego: Azul escuro (mantido)
- ✅ Qualificacao: Sky blue (antes verde)
- ✅ Analise: Cyan (antes roxo)

### Botoes e Links:
- ✅ Primary: Azul
- ✅ Secondary: Azul claro
- ✅ Destructive: Azul (antes vermelho)

### Gradientes:
- ✅ Todos os gradientes agora usam tons de azul
- ✅ Sem roxo, vermelho, laranja ou rosa

## Beneficios

1. ✅ Identidade visual consistente
2. ✅ Alinhado com marca Zion
3. ✅ Paleta coesa e profissional
4. ✅ Menos poluicao visual
5. ✅ Hierarquia clara de cores
6. ✅ Facil manutencao

## Arquivos Modificados

1. /src/index.css
2. /src/components/dashboard/executive/ActionCard.tsx

## Proximos Passos

- Verificar se ha outros componentes usando cores roxas/vermelhas
- Atualizar graficos se necessario
- Revisar badges e alertas
- Documentar paleta oficial Zion
