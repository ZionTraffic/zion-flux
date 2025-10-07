import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export type FunnelStage = {
  id: string;
  label: string;
  value: number;
};

export type FunnelPremiumProps = {
  stages: [FunnelStage, FunnelStage, FunnelStage]; // exatamente 3 estágios
  className?: string;
  coinsCount?: number;   // default 12–18
  showCoins?: boolean;   // default true
  glowLabel?: string;    // default "Convert Rate"
  glowValue?: string;    // ex: "68,80%"
  glowDelta?: { value: string; trend: "up" | "down" };
};

// Utilitário: formata número com separador de milhar ponto
const fmt = (n: number) => n.toLocaleString("pt-BR");

/**
 * Desenha um "bowl" (estágio côncavo) com topo mais largo, base mais estreita e curvatura suave.
 * A proporção é inspirada no print do Dash Premium.
 */
function Bowl({
  x = 0,
  y = 0,
  topWidth,
  bottomWidth,
  height,
  fill = "url(#bowlGrad)",
  stroke = "rgba(255,255,255,0.28)",
  strokeWidth = 2,
}: {
  x?: number;
  y?: number;
  topWidth: number;
  bottomWidth: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  const dx = (topWidth - bottomWidth) / 2;
  // Path com curvatura leve nas laterais e "highlight" no topo
  const d = [
    `M ${x} ${y}`,                                     // canto sup. esquerdo
    `H ${x + topWidth}`,                               // linha topo
    `C ${x + topWidth - dx * 0.15} ${y + height * 0.35}, ${x + bottomWidth + dx * 1.15} ${y + height * 0.65}, ${x + bottomWidth} ${y + height}`, // lado direito curvo
    `H ${x + dx}`,                                     // base
    `C ${x - dx * 0.15} ${y + height * 0.65}, ${x + dx * 0.15} ${y + height * 0.35}, ${x} ${y}`, // lado esquerdo curvo
    "Z",
  ].join(" ");

  // highlight no topo
  const topHighlight = [
    `M ${x + 6} ${y + 2}`,
    `H ${x + topWidth - 6}`,
  ].join(" ");

  return (
    <g>
      <path d={d} fill={fill} stroke="rgba(0,0,0,0.18)" strokeWidth={1.5} />
      <path d={topHighlight} stroke={stroke} strokeWidth={strokeWidth} opacity={0.55} />
    </g>
  );
}

export function FunnelPremium({
  stages,
  className,
  coinsCount = 16,
  showCoins = true,
  glowLabel = "Convert Rate",
  glowValue = "68,80%",
  glowDelta = { value: "▲ 4,3%", trend: "up" },
}: FunnelPremiumProps) {
  // Viewbox base para preservar proporções
  const W = 740;
  const H = 520;

  // Proporções dos três níveis (larguras relativas)
  const topW = 700;
  const midW = Math.round(topW * 0.28);   // funil com pescoço estreito
  const botW = Math.round(midW * 0.9);

  const stageH = 96;
  const gap = 18;

  const y1 = 80;                 // topo do primeiro nível
  const y2 = y1 + stageH + gap;  // topo do segundo
  const y3 = y2 + stageH + gap;  // topo do terceiro

  const x1 = (W - topW) / 2;
  const x2 = (W - midW) / 2;
  const x3 = (W - botW) / 2;

  // moedas (posições relativas saindo da boca inferior)
  const coins = Array.from({ length: coinsCount }).map((_, i) => ({
    key: `coin-${i}`,
    cx: x3 + botW / 2 + (Math.random() * 90 - 45),
    size: 14 + Math.random() * 6,
    delay: i * 0.15 + (Math.random() * 0.6),
    rotate: Math.random() * 360,
  }));

  return (
    <div
      className={clsx(
        "relative rounded-3xl p-4 md:p-6 bg-white/5 backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bowlGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5fb0f0" />
            <stop offset="100%" stopColor="#3a8ed6" />
          </linearGradient>
          <radialGradient id="coinGrad" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFF6B0" />
            <stop offset="65%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#E0B000" />
          </radialGradient>
          <filter id="coinShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.35)" />
          </filter>
        </defs>

        {/* Bowl 1 (topo) */}
        <Bowl x={x1} y={y1} topWidth={topW} bottomWidth={midW} height={stageH} />
        {/* Label/valor bowl 1 */}
        <text
          x={W / 2}
          y={y1 + stageH / 2 - 8}
          textAnchor="middle"
          fill="white"
          fontSize="18"
          fontWeight={600}
        >
          {stages[0].label}
        </text>
        <text
          x={W / 2}
          y={y1 + stageH / 2 + 20}
          textAnchor="middle"
          fill="white"
          fontSize="22"
          fontWeight={700}
        >
          {fmt(stages[0].value)}
        </text>

        {/* Bowl 2 (meio) */}
        <Bowl x={x2} y={y2} topWidth={midW} bottomWidth={midW} height={stageH} />
        <text
          x={W / 2}
          y={y2 + stageH / 2 + 8}
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight={700}
        >
          {fmt(stages[1].value)}
        </text>

        {/* Bowl 3 (base) */}
        <Bowl x={x3} y={y3} topWidth={botW} bottomWidth={botW} height={stageH} />
        <text
          x={W / 2}
          y={y3 + stageH / 2 + 8}
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight={700}
        >
          {fmt(stages[2].value)}
        </text>

        {/* Coins animadas saindo da base */}
        {showCoins && coins.map((c) => (
          <motion.g
            key={c.key}
            initial={{ opacity: 0, y: y3 + stageH - 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [y3 + stageH - 10, y3 + stageH + 70, y3 + stageH + 140, y3 + stageH + 200], rotate: [0, c.rotate, c.rotate * 2] }}
            transition={{ duration: 3.6 + Math.random() * 0.8, repeat: Infinity, delay: c.delay, ease: "easeInOut" }}
            filter="url(#coinShadow)"
          >
            <circle cx={c.cx} cy={y3 + stageH - 10} r={c.size / 2} fill="url(#coinGrad)" />
            <text x={c.cx} y={y3 + stageH - 6} textAnchor="middle" fontSize={c.size * 0.5} fontWeight={800} fill="#2b2100">R$</text>
          </motion.g>
        ))}
      </svg>

      {/* Glow Convert Rate (canto inferior esquerdo) */}
      <div className="absolute left-4 bottom-4">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-6 rounded-full blur-2xl opacity-70"
               style={{ background: "radial-gradient(ellipse at center, rgba(255,215,0,0.22), rgba(0,0,0,0))" }} />
          <div className="text-zinc-200/80 text-sm">{glowLabel}</div>
          <div className="text-yellow-300 text-5xl md:text-6xl font-bold tracking-tight drop-shadow-[0_0_18px_rgba(255,215,0,0.35)]">
            {glowValue}
          </div>
          <div className={clsx("text-xs mt-1", glowDelta.trend === "up" ? "text-emerald-400" : "text-red-400")}>
            {glowDelta.value}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FunnelPremium;
