
interface HeroSectionProps {
  userName?: string;
  workspaceName?: string;
  totalLeads?: number;
  totalInvested?: number;
  conversionRate?: number;
  trend?: "up" | "down" | "stable";
  hideStats?: boolean;
}

export function HeroSection({ 
  userName = "Usuário", 
  workspaceName = "Workspace", 
  totalLeads = 0, 
  totalInvested = 0, 
  conversionRate = 0,
  trend = "stable",
  hideStats = false
}: HeroSectionProps) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getTrendIcon = () => {
    if (trend === "up") return (
      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
    if (trend === "down") return (
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    );
    return (
      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  };

  const getTrendColor = () => {
    if (trend === "up") return "from-green-500/20 to-emerald-500/20";
    if (trend === "down") return "from-red-500/20 to-rose-500/20";
    return "from-blue-500/20 to-cyan-500/20";
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-8 border border-blue-500/30" style={{
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* Liquid Glass Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.8) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4), transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite'
      }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-lg flex items-center gap-2">
              {greeting()}, {userName?.split('@')[0] || 'Usuário'}!
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white/90 text-base font-medium">Workspace:</span>
              <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-base">
                {workspaceName || 'Carregando...'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            {getTrendIcon()}
            <span className="text-sm font-semibold text-white">
              {trend === "up" ? "Em crescimento" : trend === "down" ? "Em queda" : "Estável"}
            </span>
          </div>
        </div>

        {/* Quick Stats - OCULTO PARA SIEG */}
        {!hideStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Total de Leads</p>
            <p className="text-2xl font-bold text-white">{totalLeads.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Investimento Total</p>
            <p className="text-2xl font-bold text-white">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-white">{conversionRate.toFixed(1)}%</p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
