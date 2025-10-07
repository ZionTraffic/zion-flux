import { useMemo } from "react";
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

export function FunnelPremium({
  stages,
  className = '',
  coinsCount = 15,
  showCoins = true,
}: FunnelPremiumProps) {
  const W = 500;
  const H = 500;

  // Paths dos bowls em formato de tigela 3D côncava
  const bowl1Path = `
    M 120 80
    Q 120 65, 150 60
    L 350 60
    Q 380 65, 380 80
    Q 380 110, 350 115
    L 150 115
    Q 120 110, 120 80
    Z
  `;

  const bowl2Path = `
    M 145 200
    Q 145 187, 170 183
    L 330 183
    Q 355 187, 355 200
    Q 355 225, 330 229
    L 170 229
    Q 145 225, 145 200
    Z
  `;

  const bowl3Path = `
    M 170 320
    Q 170 309, 190 306
    L 310 306
    Q 330 309, 330 320
    Q 330 340, 310 343
    L 190 343
    Q 170 340, 170 320
    Z
  `;

  // Configuração das moedas com 3 tamanhos
  const coinSizes = [16, 20, 24];
  const coinPositions = [
    // Centro (grandes)
    { x: 250, y: 380, size: 2 },
    { x: 240, y: 395, size: 2 },
    { x: 260, y: 395, size: 2 },
    { x: 250, y: 410, size: 1 },
    
    // Esquerda
    { x: 220, y: 390, size: 1 },
    { x: 210, y: 405, size: 0 },
    { x: 200, y: 420, size: 0 },
    { x: 230, y: 415, size: 1 },
    
    // Direita
    { x: 280, y: 390, size: 1 },
    { x: 290, y: 405, size: 0 },
    { x: 300, y: 420, size: 0 },
    { x: 270, y: 415, size: 1 },
    
    // Extras
    { x: 245, y: 425, size: 0 },
    { x: 255, y: 425, size: 0 },
    { x: 250, y: 435, size: 0 },
  ];

  const conversionRate = stages[0].value > 0 
    ? ((stages[2].value / stages[0].value) * 100).toFixed(2)
    : '0.00';

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
          {/* Gradiente 3D complexo com 5 stops */}
          <linearGradient id="bowl3DGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d0f0ff" stopOpacity="1" />
            <stop offset="15%" stopColor="#7dd3fc" stopOpacity="1" />
            <stop offset="50%" stopColor="#00bfff" stopOpacity="1" />
            <stop offset="85%" stopColor="#0284c7" stopOpacity="1" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="1" />
          </linearGradient>
          
          {/* Gradiente para highlight da borda */}
          <linearGradient id="bowlHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.3" />
          </linearGradient>

          {/* Gradiente das moedas */}
          <linearGradient id="coinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#ffb300" />
            <stop offset="100%" stopColor="#ff8c00" />
          </linearGradient>

          {/* Glow intenso */}
          <filter id="glowIntense" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
            <feFlood floodColor="#00d4ff" floodOpacity="0.7"/>
            <feComposite in2="coloredBlur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Setas amarelas animadas no topo */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
            y: [-20, -10, -20]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Seta horizontal topo */}
          <path
            d="M 180 20 Q 190 18, 200 20 L 195 15 M 200 20 L 195 25"
            stroke="#ffc107"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Seta diagonal esquerda */}
          <path
            d="M 160 30 Q 155 40, 150 50 L 155 45 M 150 50 L 145 48"
            stroke="#ffb300"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Seta central vertical */}
          <path
            d="M 250 15 Q 250 30, 250 45 L 245 40 M 250 45 L 255 40"
            stroke="#ffd700"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Seta diagonal direita */}
          <path
            d="M 340 30 Q 345 40, 350 50 L 345 45 M 350 50 L 355 48"
            stroke="#ffb300"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* Bowl 1 (Topo - 100%) */}
        <g transform="scale(1.0)" transform-origin="250 87.5">
          <path 
            d={bowl1Path}
            fill="url(#bowl3DGradient)" 
            stroke="rgba(255,255,255,0.35)" 
            strokeWidth="1.4"
            filter="url(#glowIntense)"
          />
          {/* Highlight Bowl 1 */}
          <ellipse 
            cx="250" 
            cy="60" 
            rx="115" 
            ry="8" 
            fill="url(#bowlHighlight)"
            opacity="0.6"
          />
          {/* Label */}
          <text
            x="250"
            y="73"
            textAnchor="middle"
            fill="white"
            opacity="0.75"
            fontSize="14"
            fontWeight="500"
          >
            {stages[0].label}
          </text>
          {/* Número */}
          <text
            x="250"
            y="103"
            textAnchor="middle"
            fill="white"
            opacity="1"
            fontSize="42"
            fontWeight="900"
            letterSpacing="1"
          >
            {formatValue(stages[0].value)}
          </text>
        </g>

        {/* Bowl 2 (Meio - 85%) */}
        <g transform="scale(0.85)" transform-origin="250 207.5">
          <path 
            d={bowl2Path}
            fill="url(#bowl3DGradient)" 
            stroke="rgba(255,255,255,0.35)" 
            strokeWidth="1.4"
            filter="url(#glowIntense)"
          />
          {/* Highlight Bowl 2 */}
          <ellipse 
            cx="250" 
            cy="183" 
            rx="95" 
            ry="7" 
            fill="url(#bowlHighlight)"
            opacity="0.6"
          />
          {/* Label */}
          <text
            x="250"
            y="193"
            textAnchor="middle"
            fill="white"
            opacity="0.75"
            fontSize="14"
            fontWeight="500"
          >
            {stages[1].label}
          </text>
          {/* Número */}
          <text
            x="250"
            y="223"
            textAnchor="middle"
            fill="white"
            opacity="1"
            fontSize="42"
            fontWeight="900"
            letterSpacing="1"
          >
            {formatValue(stages[1].value)}
          </text>
        </g>

        {/* Bowl 3 (Base - 70%) */}
        <g transform="scale(0.70)" transform-origin="250 327.5">
          <path 
            d={bowl3Path}
            fill="url(#bowl3DGradient)" 
            stroke="rgba(255,255,255,0.35)" 
            strokeWidth="1.4"
            filter="url(#glowIntense)"
          />
          {/* Highlight Bowl 3 */}
          <ellipse 
            cx="250" 
            cy="306" 
            rx="70" 
            ry="6" 
            fill="url(#bowlHighlight)"
            opacity="0.6"
          />
          {/* Label */}
          <text
            x="250"
            y="313"
            textAnchor="middle"
            fill="white"
            opacity="0.75"
            fontSize="14"
            fontWeight="500"
          >
            {stages[2].label}
          </text>
          {/* Número */}
          <text
            x="250"
            y="343"
            textAnchor="middle"
            fill="white"
            opacity="1"
            fontSize="42"
            fontWeight="900"
            letterSpacing="1"
          >
            {formatValue(stages[2].value)}
          </text>
        </g>

        {/* Moedas animadas */}
        {showCoins && coinPositions.map((coin, i) => (
          <motion.g
            key={i}
            initial={{ y: 320, opacity: 0 }}
            animate={{ 
              y: coin.y,
              opacity: [0, 1, 1],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeOut"
            }}
          >
            <circle
              cx={coin.x}
              cy={coin.y}
              r={coinSizes[coin.size]}
              fill="url(#coinGradient)"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
            />
            {/* Brilho na moeda */}
            <circle
              cx={coin.x - coinSizes[coin.size] * 0.3}
              cy={coin.y - coinSizes[coin.size] * 0.3}
              r={coinSizes[coin.size] * 0.25}
              fill="white"
              opacity="0.7"
            />
          </motion.g>
        ))}

        {/* Métrica de conversão */}
        <text
          x="60"
          y="450"
          fill="white"
          opacity="0.7"
          fontSize="12"
          fontWeight="400"
        >
          Convert Rate
        </text>
        <text
          x="60"
          y="470"
          fill="#10b981"
          fontSize="20"
          fontWeight="700"
        >
          {conversionRate}%
        </text>
        <text
          x="150"
          y="470"
          fill="#ef4444"
          fontSize="12"
          fontWeight="500"
        >
          ↓ 2.1%
        </text>
      </svg>
    </div>
  );
}

export default FunnelPremium;
