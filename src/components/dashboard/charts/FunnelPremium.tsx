import { useMemo } from "react";
import { motion } from "framer-motion";

// FunnelPremium - 3 Stages Version

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
}

export interface FunnelPremiumProps {
  stages: [FunnelStage, FunnelStage, FunnelStage];
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

export function FunnelPremium({
  stages,
  className = '',
  coinsCount = 16,
  showCoins = true,
}: FunnelPremiumProps) {
  // Dimensões do viewBox
  const W = 600;
  const H = 450;

  // Proporções ajustadas para viewBox 600x450
  const topW = 480;  // Largura do topo (80% de 600) - mais largo
  const midW = 360;  // Largura do meio (60% de 600) - mais largo
  const botW = 280;  // Largura da base (47% de 600) - mais largo

  const stageH = 90; // Altura de cada estágio - menos alto
  const gap = 25;     // Espaço entre estágios - menor gap

  // Posições Y
  const y1 = 60;
  const y2 = y1 + stageH + gap;
  const y3 = y2 + stageH + gap;

  // Posições X (centralizar cada estágio)
  const x1 = (W - topW) / 2;
  const x2 = (W - midW) / 2;
  const x3 = (W - botW) / 2;

  // Memoize coin positions to prevent flickering on re-renders
  const coins = useMemo(() => 
    Array.from({ length: coinsCount }).map((_, i) => ({
      key: `coin-${i}`,
      cx: x3 + botW / 2 + (Math.random() * 90 - 45),
      size: 14 + Math.random() * 6,
      delay: i * 0.15 + Math.random() * 0.6,
      rotate: Math.random() * 360,
    })), 
    [coinsCount, x3, botW]
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
          {/* Gradiente 3D Azul Principal */}
          <linearGradient id="bowlGradient3D" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="1"/> {/* Azul claro topo */}
            <stop offset="25%" stopColor="#3b82f6" stopOpacity="1"/> {/* Azul vibrante */}
            <stop offset="50%" stopColor="#2563eb" stopOpacity="1"/> {/* Azul médio */}
            <stop offset="75%" stopColor="#1d4ed8" stopOpacity="1"/> {/* Azul médio-escuro */}
            <stop offset="100%" stopColor="#1e40af" stopOpacity="1"/> {/* Azul escuro base */}
          </linearGradient>

          {/* Gradiente 3D Azul Escuro para último estágio */}
          <linearGradient id="bowlGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="1"/> {/* Azul escuro topo */}
            <stop offset="25%" stopColor="#1e3a8a" stopOpacity="1"/> {/* Azul muito escuro */}
            <stop offset="50%" stopColor="#1e3a8a" stopOpacity="1"/> {/* Azul muito escuro */}
            <stop offset="75%" stopColor="#172554" stopOpacity="1"/> {/* Azul profundo */}
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1"/> {/* Azul quase preto */}
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
            <rect x={x3} y={y3 + stageH - 10} width={botW} height="200" />
          </clipPath>
        </defs>

        {/* Estágio 1 (Topo) */}
        <Bowl x={x1} y={y1} topWidth={topW} bottomWidth={midW} height={stageH} />
        {/* Sombra inferior do bowl 1 */}
        <ellipse 
          cx={W / 2} 
          cy={y1 + stageH} 
          rx={midW / 2} 
          ry="6" 
          fill="rgba(0,0,0,0.4)"
          filter="blur(4px)"
        />
        <text
          x={W / 2}
          y={y1 + stageH / 2 - 12}
          textAnchor="middle"
          fill="white"
          fontSize="19"
          fontWeight="600"
          opacity="0.92"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
        >
          {stages[0].label}
        </text>
        <text
          x={W / 2}
          y={y1 + stageH / 2 + 20}
          textAnchor="middle"
          fill="white"
          fontSize="24"
          fontWeight="700"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {formatValue(stages[0].value)}
        </text>

        {/* Estágio 2 (Meio) */}
        <Bowl x={x2} y={y2} topWidth={midW} bottomWidth={botW} height={stageH} />
        {/* Sombra inferior do bowl 2 */}
        <ellipse 
          cx={W / 2} 
          cy={y2 + stageH} 
          rx={botW / 2} 
          ry="5" 
          fill="rgba(0,0,0,0.4)"
          filter="blur(4px)"
        />
        <text
          x={W / 2}
          y={y2 + stageH / 2 - 12}
          textAnchor="middle"
          fill="white"
          fontSize="17"
          fontWeight="600"
          opacity="0.92"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
        >
          {stages[1].label}
        </text>
        <text
          x={W / 2}
          y={y2 + stageH / 2 + 20}
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="700"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {formatValue(stages[1].value)}
        </text>

        {/* Estágio 3 (Base) - AZUL ESCURO */}
        <Bowl x={x3} y={y3} topWidth={botW} bottomWidth={botW * 0.85} height={stageH} gradientId="bowlGradientDark" />
        {/* Sombra inferior do bowl 3 */}
        <ellipse 
          cx={W / 2} 
          cy={y3 + stageH} 
          rx={(botW * 0.85) / 2} 
          ry="4" 
          fill="rgba(15,23,42,0.5)"
          filter="blur(4px)"
        />
        <text
          x={W / 2}
          y={y3 + stageH / 2 - 12}
          textAnchor="middle"
          fill="white"
          fontSize="17"
          fontWeight="600"
          opacity="0.92"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
        >
          {stages[2].label}
        </text>
        <text
          x={W / 2}
          y={y3 + stageH / 2 + 20}
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight="700"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {formatValue(stages[2].value)}
        </text>

        {/* Moedas animadas saindo da base */}
        {showCoins && (
          <g clipPath="url(#funnelOutput)">
            {coins.map((coin) => (
              <motion.g
                key={coin.key}
                initial={{ opacity: 0, y: y3 + stageH - 10 }}
                animate={{
                  y: [y3 + stageH - 10, y3 + stageH + 70, y3 + stageH + 140, y3 + stageH + 200],
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

export default FunnelPremium;
