import { useMemo } from "react";
import { motion } from "framer-motion";

export interface FunnelStage5 {
  id: string;
  label: string;
  value: number;
}

export interface FunnelPremium5StagesProps {
  stages: [FunnelStage5, FunnelStage5, FunnelStage5, FunnelStage5, FunnelStage5];
  className?: string;
  coinsCount?: number;
  showCoins?: boolean;
}

const formatValue = (value: number) => value.toLocaleString('pt-BR');

interface BowlProps {
  x: number;
  y: number;
  topWidth: number;
  bottomWidth: number;
  height: number;
  gradientId?: string;
}

function Bowl({ x, y, topWidth, bottomWidth, height, gradientId = 'bowlGradient3D' }: BowlProps) {
  const sideOffset = (topWidth - bottomWidth) / 2;
  
  // Path com curvatura 3D mais pronunciada
  const bodyPath = `
    M ${x} ${y}
    H ${x + topWidth}
    C ${x + topWidth - sideOffset * 0.2} ${y + height * 0.3}, 
      ${x + topWidth - sideOffset * 0.5} ${y + height * 0.7}, 
      ${x + sideOffset + bottomWidth} ${y + height}
    H ${x + sideOffset}
    C ${x + sideOffset * 0.5} ${y + height * 0.7}, 
      ${x + sideOffset * 0.2} ${y + height * 0.3}, 
      ${x} ${y}
    Z
  `;

  return (
    <g>
      {/* Corpo do bowl com gradiente 3D */}
      <path 
        d={bodyPath} 
        fill={`url(#${gradientId})`}
        stroke="rgba(0,0,0,0.4)" 
        strokeWidth="2"
        filter="url(#glow)"
      />
      
      {/* Elipse superior (abertura do bowl) */}
      <ellipse 
        cx={x + topWidth / 2} 
        cy={y} 
        rx={topWidth / 2} 
        ry="12" 
        fill="url(#topHighlight)"
        opacity="0.85"
      />
      
      {/* Highlight branco na borda superior */}
      <ellipse 
        cx={x + topWidth / 2} 
        cy={y - 2} 
        rx={topWidth / 2 - 8} 
        ry="4" 
        fill="white"
        opacity="0.6"
      />
    </g>
  );
}

export function FunnelPremium5Stages({
  stages,
  className = '',
  coinsCount = 16,
  showCoins = true,
}: FunnelPremium5StagesProps) {
  // Dimensões do viewBox
  const W = 600;
  const H = 600;

  // Proporções fixas para 5 estágios
  const w1 = 480;  // Novo Lead
  const w2 = 400;  // Em Qualificação
  const w3 = 320;  // Qualificados
  const w4 = 240;  // Desqualificados
  const w5 = 180;  // Follow-up Concluído
  const botW = 140; // Base final

  const stageH = 70; // Altura de cada estágio
  const gap = 18;     // Espaço entre estágios

  // Posições Y
  const y1 = 50;
  const y2 = y1 + stageH + gap;
  const y3 = y2 + stageH + gap;
  const y4 = y3 + stageH + gap;
  const y5 = y4 + stageH + gap;

  // Posições X (centralizar cada estágio)
  const x1 = (W - w1) / 2;
  const x2 = (W - w2) / 2;
  const x3 = (W - w3) / 2;
  const x4 = (W - w4) / 2;
  const x5 = (W - w5) / 2;

  // Memoize coin positions to prevent flickering on re-renders
  const coins = useMemo(() => 
    Array.from({ length: coinsCount }).map((_, i) => ({
      key: `coin-${i}`,
      cx: x5 + botW / 2 + (Math.random() * 60 - 30),
      size: 14 + Math.random() * 6,
      delay: i * 0.15 + Math.random() * 0.6,
      rotate: Math.random() * 360,
    })), 
    [coinsCount, x5, botW]
  );

  return (
    <div className={`relative ${className}`}>
      <svg 
        width="100%" 
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg" 
        className="overflow-visible"
      >
        <defs>
          {/* Gradiente 3D Azul com 5 stops (efeito profundidade real) */}
          <linearGradient id="bowlGradient3D" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" stopOpacity="1"/> {/* Azul claro topo */}
            <stop offset="25%" stopColor="#60C5F5" stopOpacity="1"/> {/* Azul médio-claro */}
            <stop offset="50%" stopColor="#3A9FD8" stopOpacity="1"/> {/* Azul médio */}
            <stop offset="75%" stopColor="#1E7BB8" stopOpacity="1"/> {/* Azul médio-escuro */}
            <stop offset="100%" stopColor="#0A5A8A" stopOpacity="1"/> {/* Azul escuro base */}
          </linearGradient>

          {/* Gradiente 3D Vermelho para Desqualificados */}
          <linearGradient id="bowlGradientRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" stopOpacity="1"/> {/* Vermelho claro topo */}
            <stop offset="25%" stopColor="#EE5A6F" stopOpacity="1"/> {/* Vermelho médio-claro */}
            <stop offset="50%" stopColor="#DC4C64" stopOpacity="1"/> {/* Vermelho médio */}
            <stop offset="75%" stopColor="#C93D58" stopOpacity="1"/> {/* Vermelho médio-escuro */}
            <stop offset="100%" stopColor="#A8304E" stopOpacity="1"/> {/* Vermelho escuro base */}
          </linearGradient>

          {/* Gradiente para o topo do bowl */}
          <radialGradient id="topHighlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4"/>
            <stop offset="60%" stopColor="#60C5F5" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#3A9FD8" stopOpacity="0.8"/>
          </radialGradient>

          {/* Efeito glow intensificado para os bowls */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Sombra interna mais intensa */}
          <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feOffset dx="0" dy="4"/>
            <feGaussianBlur stdDeviation="3" result="offset-blur"/>
            <feComposite in="SourceGraphic" in2="offset-blur" operator="arithmetic" k2="-1" k3="1"/>
            <feColorMatrix type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0.55 0"/>
          </filter>

          {/* Gradiente das moedas */}
          <radialGradient id="coinGradient" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFF6B0" />
            <stop offset="65%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#E0B000" />
          </radialGradient>

          {/* Sombra das moedas */}
          <filter id="coinShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.35)" />
          </filter>

          {/* ClipPath para moedas saindo da base */}
          <clipPath id="funnelOutput">
            <rect x={x5} y={y5 + stageH - 10} width={botW} height="200" />
          </clipPath>
        </defs>

        {/* Estágio 1 - Novo Lead */}
        <Bowl x={x1} y={y1} topWidth={w1} bottomWidth={w2} height={stageH} />
        <ellipse 
          cx={W / 2} 
          cy={y1 + stageH} 
          rx={w2 / 2} 
          ry="5" 
          fill="rgba(0,0,0,0.4)"
          filter="blur(4px)"
        />
        <text
          x={W / 2}
          y={y1 + stageH / 2 - 8}
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="600"
          opacity="0.92"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
        >
          {stages[0].label}
        </text>
        <text
          x={W / 2}
          y={y1 + stageH / 2 + 12}
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="700"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {formatValue(stages[0].value)}
        </text>

        {/* Estágio 2 - Em Qualificação */}
        <Bowl x={x2} y={y2} topWidth={w2} bottomWidth={w3} height={stageH} />
        <ellipse 
          cx={W / 2} 
          cy={y2 + stageH} 
          rx={w3 / 2} 
          ry="5" 
          fill="rgba(0,0,0,0.4)"
          filter="blur(4px)"
        />
        <text
          x={W / 2}
          y={y2 + stageH / 2 - 8}
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="600"
          opacity="0.92"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
        >
          {stages[1].label}
        </text>
        <text
          x={W / 2}
          y={y2 + stageH / 2 + 12}
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="700"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {formatValue(stages[1].value)}
        </text>

        {/* Estágio 3 - Qualificados */}
        <Bowl x={x3} y={y3} topWidth={w3} bottomWidth={w4} height={stageH} />
        <ellipse 
          cx={W / 2} 
          cy={y3 + stageH} 
          rx={w4 / 2} 
          ry="5" 
          fill="rgba(0,0,0,0.4)"
          filter="blur(4px)"
        />
        <text
          x={W / 2}
          y={y3 + stageH / 2 - 8}
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="600"
          opacity="0.92"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
        >
          {stages[2].label}
        </text>
        <text
          x={W / 2}
          y={y3 + stageH / 2 + 12}
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="700"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {formatValue(stages[2].value)}
        </text>

        {/* Estágio 4 - Desqualificados (VERMELHO) */}
        <Bowl x={x4} y={y4} topWidth={w4} bottomWidth={w5} height={stageH} gradientId="bowlGradientRed" />
        <ellipse 
          cx={W / 2} 
          cy={y4 + stageH} 
          rx={w5 / 2} 
          ry="5" 
          fill="rgba(168,48,78,0.4)"
          filter="blur(4px)"
        />
        <text
          x={W / 2}
          y={y4 + stageH / 2 - 8}
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="600"
          opacity="0.92"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
        >
          {stages[3].label}
        </text>
        <text
          x={W / 2}
          y={y4 + stageH / 2 + 12}
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="700"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {formatValue(stages[3].value)}
        </text>

        {/* Estágio 5 - Follow-up Concluído */}
        <Bowl x={x5} y={y5} topWidth={w5} bottomWidth={botW} height={stageH} />
        <ellipse 
          cx={W / 2} 
          cy={y5 + stageH} 
          rx={botW / 2} 
          ry="4" 
          fill="rgba(0,0,0,0.4)"
          filter="blur(4px)"
        />
        <text
          x={W / 2}
          y={y5 + stageH / 2 - 8}
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="600"
          opacity="0.92"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
        >
          {stages[4].label}
        </text>
        <text
          x={W / 2}
          y={y5 + stageH / 2 + 12}
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="700"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {formatValue(stages[4].value)}
        </text>

        {/* Moedas animadas saindo da base */}
        {showCoins && (
          <g clipPath="url(#funnelOutput)">
            {coins.map((coin) => (
              <motion.g
                key={coin.key}
                initial={{ opacity: 0, y: y5 + stageH - 10 }}
                animate={{
                  y: [y5 + stageH - 10, y5 + stageH + 70, y5 + stageH + 140, y5 + stageH + 200],
                  opacity: [0, 1, 1, 0],
                  rotate: [0, coin.rotate, coin.rotate * 2],
                  x: [0, 0, 0, 0],
                }}
                transition={{
                  duration: 3.6 + Math.random() * 0.8,
                  repeat: Infinity,
                  delay: coin.delay,
                  ease: 'easeInOut',
                }}
                filter="url(#coinShadow)"
              >
                <circle 
                  cx={coin.cx} 
                  cy={0} 
                  r={coin.size / 2} 
                  fill="url(#coinGradient)" 
                  stroke="#E0B000"
                  strokeWidth="1"
                />
                <text
                  x={coin.cx}
                  y={4}
                  textAnchor="middle"
                  fontSize={coin.size * 0.5}
                  fontWeight="800"
                  fill="#2b2100"
                >
                  R$
                </text>
              </motion.g>
            ))}
          </g>
        )}
      </svg>

    </div>
  );
}

export default FunnelPremium5Stages;
