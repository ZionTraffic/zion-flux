import { useState } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { WorkspacePerformanceMetrics } from "@/hooks/usePerformanceData";

interface PerformanceCompareProps {
  metrics: WorkspacePerformanceMetrics[];
}

export function PerformanceCompare({ metrics }: PerformanceCompareProps) {
  const [workspace1, setWorkspace1] = useState<string>("");
  const [workspace2, setWorkspace2] = useState<string>("");

  const getComparisonData = () => {
    if (!workspace1 || !workspace2) return [];

    const w1 = metrics.find(m => m.workspaceId === workspace1);
    const w2 = metrics.find(m => m.workspaceId === workspace2);

    if (!w1 || !w2) return [];

    return [
      {
        metric: "Conversão",
        [w1.workspaceName]: w1.conversion.current,
        [w2.workspaceName]: w2.conversion.current,
      },
      {
        metric: "CPL",
        [w1.workspaceName]: 100 - (w1.cpl.current / 100), // Inverted scale for better visualization
        [w2.workspaceName]: 100 - (w2.cpl.current / 100),
      },
      {
        metric: "Velocidade IA",
        [w1.workspaceName]: 300 - w1.aiSpeed.current, // Inverted scale
        [w2.workspaceName]: 300 - w2.aiSpeed.current,
      },
      {
        metric: "Retenção",
        [w1.workspaceName]: w1.retention.current,
        [w2.workspaceName]: w2.retention.current,
      },
    ];
  };

  const comparisonData = getComparisonData();
  const w1Name = metrics.find(m => m.workspaceId === workspace1)?.workspaceName;
  const w2Name = metrics.find(m => m.workspaceId === workspace2)?.workspaceName;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Modo Comparativo</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-border/50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Workspace 1</label>
            <select
              value={workspace1}
              onChange={(e) => setWorkspace1(e.target.value)}
              className="w-full glass-medium backdrop-blur-xl border border-border/50 rounded-xl px-4 py-2 text-sm font-medium hover:glass-heavy transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/80"
            >
              <option value="">Selecione...</option>
              {metrics.map(m => (
                <option key={m.workspaceId} value={m.workspaceId} className="bg-background text-foreground">
                  {m.workspaceName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Workspace 2</label>
            <select
              value={workspace2}
              onChange={(e) => setWorkspace2(e.target.value)}
              className="w-full glass-medium backdrop-blur-xl border border-border/50 rounded-xl px-4 py-2 text-sm font-medium hover:glass-heavy transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/80"
            >
              <option value="">Selecione...</option>
              {metrics.map(m => (
                <option key={m.workspaceId} value={m.workspaceId} className="bg-background text-foreground">
                  {m.workspaceName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {comparisonData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={comparisonData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" />
                <PolarRadiusAxis stroke="rgba(255,255,255,0.3)" />
                <Radar
                  name={w1Name}
                  dataKey={w1Name!}
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name={w2Name}
                  dataKey={w2Name!}
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-6 justify-center mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm text-muted-foreground">{w1Name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500"></div>
                <span className="text-sm text-muted-foreground">{w2Name}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Selecione duas workspaces para comparar
          </div>
        )}
      </motion.div>
    </div>
  );
}
