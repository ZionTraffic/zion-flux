# Action Cards - Versao Sutil (Menos Metalico)

Data: 22/10/2025

## Ajustes para Visual Mais Sutil

### 1. Gradientes Mais Escuros

#### Antes (Muito Vibrante):
- Trafego: #1e40af → #3b82f6 → #1e40af (3 pontos)
- Qualificacao: #15803d → #22c55e → #15803d (3 pontos)
- Analise: #6b21a8 → #a855f7 → #6b21a8 (3 pontos)

#### Depois (Mais Sutil):
- Trafego: #1e3a8a → #1e40af (2 pontos, mais escuro)
- Qualificacao: #166534 → #15803d (2 pontos, mais escuro)
- Analise: #581c87 → #6b21a8 (2 pontos, mais escuro)

### 2. Sombras Reduzidas

#### Antes:
```css
boxShadow: 0 20px 60px 0 rgba(cor, 0.4)
```

#### Depois:
```css
boxShadow: 0 8px 24px 0 rgba(cor, 0.2)
```

**Mudancas:**
- Blur: 60px → 24px (60% menor)
- Offset: 20px → 8px (60% menor)
- Opacidade: 0.4 → 0.2 (50% menor)

### 3. Bordas Mais Sutis

#### Antes:
```css
border: 50% opacidade
```

#### Depois:
```css
border: 20% opacidade
```

**Resultado:** Bordas menos visiveis e mais discretas

### 4. Padrao de Pontos Reduzido

#### Antes:
- Opacidade geral: 10%
- Cor pontos: rgba(255, 255, 255, 0.8)

#### Depois:
- Opacidade geral: 5% (50% menor)
- Cor pontos: rgba(255, 255, 255, 0.5) (37% menor)

### 5. Gradiente Animado Mais Sutil

#### Antes:
- Opacidade: 20%
- Cor: rgba(255, 255, 255, 0.3)

#### Depois:
- Opacidade: 10% (50% menor)
- Cor: rgba(255, 255, 255, 0.2) (33% menor)

### 6. Cores do Texto Ajustadas

#### Antes:
- Titulo: text-white

#### Depois:
- Trafego: text-blue-100
- Qualificacao: text-green-100
- Analise: text-purple-100

**Resultado:** Texto mais suave e menos contrastante

## Comparacao Geral

### Intensidade dos Efeitos:

| Efeito | Antes | Depois | Reducao |
|--------|-------|--------|---------|
| Sombra Blur | 60px | 24px | 60% |
| Sombra Opacidade | 0.4 | 0.2 | 50% |
| Borda Opacidade | 50% | 20% | 60% |
| Padrao Opacidade | 10% | 5% | 50% |
| Gradiente Opacidade | 20% | 10% | 50% |

## Resultado Final

Action Cards agora tem:
- Visual mais sutil e elegante
- Menos "metalico" e chamativo
- Cores mais escuras e profundas
- Sombras suaves e discretas
- Bordas quase invisiveis
- Padrao de pontos sutil
- Gradiente animado discreto
- Texto suave
- Profissional e clean
- Menos distrativo

## Arquivo Modificado

/src/components/dashboard/executive/ActionCard.tsx
