import { motion } from "framer-motion";

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
}

function Bowl({ x, y, topWidth, bottomWidth, height }: BowlProps) {
  const dx = (topWidth - bottomWidth) / 2;
  
  // Path côncavo 3D acentuado
  const bodyPath = `
    M ${x},${y}
    L ${x + topWidth},${y}
    Q ${x + topWidth} ${y + height * 0.12}, ${x + topWidth - dx * 0.3} ${y + height * 0.28}
    C ${x + topWidth - dx * 1.4} ${y + height * 0.55},
      ${x + bottomWidth + dx * 1.4} ${y + height * 0.82},
      ${x + bottomWidth + dx} ${y + height}
    L ${x + dx},${y + height}
    C ${x + dx * 0.6} ${y + height * 0.82},
      ${x + dx * 0.6} ${y + height * 0.55},
      ${x + dx * 0.3} ${y + height * 0.28}
    Q ${x} ${y + height * 0.12}, ${x} ${y}
    Z
  `;

  // Lip superior (aro da tigela 3D)
  const lipPath = `
    M ${x - 6},${y - 3}
    L ${x + topWidth + 6},${y - 3}
    L ${x + topWidth + 2},${y + 8}
    L ${x - 2},${y + 8}
    Z
  `;

  // Sombra interna no fundo
  const innerShadowCx = x + topWidth / 2;
  const innerShadowCy = y + height - 18;
  const innerShadowRx = (bottomWidth * 0.42);
  const innerShadowRy = 14;

  // Specular highlight no topo
  const highlightPath = `M ${x + 12},${y + 4} L ${x + topWidth - 12},${y + 4}`;

  return (
    <g filter="url(#dropShadow)">
      {/* Lip superior com gradiente metálico */}
      <path d={lipPath} fill="url(#lipGradient)" opacity="0.85" />
      
      {/* Corpo principal com gradiente radial 3D */}
      <path 
        d={bodyPath} 
        fill="url(#bowl3DGradient)" 
        stroke="rgba(0,0,0,0.35)" 
        strokeWidth="1.2"
      />
      
      {/* Sombra interna no fundo */}
      <ellipse 
        cx={innerShadowCx}
        cy={innerShadowCy}
        rx={innerShadowRx}
        ry={innerShadowRy}
        fill="url(#innerShadowGradient)"
      />
      
      {/* Specular highlight no topo */}
      <path 
        d={highlightPath} 
        stroke="rgba(255,255,255,0.7)" 
        strokeWidth="3.5" 
        opacity="0.75"
        strokeLinecap="round"
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
  // Viewbox responsivo com mais espaço para 3D
  const W = 740;
  const H = 560;

  // Proporções dos estágios (1.00 : 0.78 : 0.62)
  const topW = 700;
  const midW = Math.round(topW * 0.78);
  const botW = Math.round(topW * 0.62);

  const stageH = 110; // Aumentado para dar mais profundidade
  const gap = 28; // Aumentado para dar mais espaçamento 3D

  // Posições Y
  const y1 = 80;
  const y2 = y1 + stageH + gap;
  const y3 = y2 + stageH + gap;

  // Posições X (centralizar cada estágio)
  const x1 = (W - topW) / 2;
  const x2 = (W - midW) / 2;
  const x3 = (W - botW) / 2;

  // Gerar moedas com posições aleatórias
  const coins = Array.from({ length: coinsCount }).map((_, i) => ({
    key: `coin-${i}`,
    cx: x3 + botW / 2 + (Math.random() * 90 - 45),
    size: 14 + Math.random() * 6,
    delay: i * 0.15 + Math.random() * 0.6,
    rotate: Math.random() * 360,
  }));

  return (
    <div className={`relative rounded-3xl p-4 md:p-6 bg-white/5 backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.35)] ${className}`}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
        <defs>
          {/* Gradiente radial 3D para corpo do bowl */}
          <radialGradient id="bowl3DGradient" cx="50%" cy="18%" r="85%">
            <stop offset="0%" stopColor="#8DD3F8" />
            <stop offset="25%" stopColor="#7BC8F5" />
            <stop offset="50%" stopColor="#5FB0F0" />
            <stop offset="75%" stopColor="#4A9DD9" />
            <stop offset="90%" stopColor="#3A8ED6" />
            <stop offset="100%" stopColor="#2B7AC2" />
          </radialGradient>

          {/* Gradiente do lip (aro superior) */}
          <linearGradient id="lipGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#B8E3FA" />
            <stop offset="40%" stopColor="#A0D8F7" />
            <stop offset="70%" stopColor="#7BC8F5" />
            <stop offset="100%" stopColor="#5FB0F0" />
          </linearGradient>

          {/* Sombra interna no fundo */}
          <radialGradient id="innerShadowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Sombra projetada entre estágios */}
          <filter id="dropShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
            <feOffset dx="0" dy="8" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.35" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
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
        <Bowl x={x2} y={y2} topWidth={midW} bottomWidth={midW} height={stageH} />
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

        {/* Estágio 3 (Base) */}
        <Bowl x={x3} y={y3} topWidth={botW} bottomWidth={botW} height={stageH} />
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
