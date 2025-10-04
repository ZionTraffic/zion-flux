import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Filter } from "lucide-react";
import { TrainerConversation } from "@/hooks/useTrainerData";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TrainerTableProps {
  conversations: TrainerConversation[];
  onViewDetails: (conversation: TrainerConversation) => void;
}

function getSentimentLabel(sentiment: number) {
  if (sentiment < 0.3) return { label: "Crítica", color: "text-red-400 bg-red-500/10" };
  if (sentiment < 0.7) return { label: "Treinável", color: "text-amber-400 bg-amber-500/10" };
  return { label: "Positiva", color: "text-emerald-400 bg-emerald-500/10" };
}

export function TrainerTable({ conversations, onViewDetails }: TrainerTableProps) {
  const [filter, setFilter] = useState<"all" | "trainable" | "critical">("all");

  const filtered = conversations.filter(conv => {
    if (filter === "trainable") return conv.sentiment >= 0.3 && conv.sentiment < 0.7;
    if (filter === "critical") return conv.sentiment < 0.3;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-6 border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Conversas Analisadas</h2>
          <p className="text-sm text-muted-foreground/60">
            {filtered.length} de {conversations.length} conversas
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "trainable" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("trainable")}
          >
            Treináveis
          </Button>
          <Button
            variant={filter === "critical" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("critical")}
          >
            Críticas
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Agente</TableHead>
              <TableHead>Sentimento</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((conv) => {
              const sentiment = getSentimentLabel(conv.sentiment);
              return (
                <TableRow key={conv.id}>
                  <TableCell className="font-medium">
                    {new Date(conv.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {conv.agent_name}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${sentiment.color}`}>
                      {sentiment.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {Math.floor(conv.duration / 60)}m {conv.duration % 60}s
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {conv.lead_status}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(conv)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Analisar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
