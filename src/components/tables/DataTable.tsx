import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableData {
  id: string;
  date: string;
  source: string;
  leads: number;
  qualified: number;
  investment: number;
  cpl: number;
}

const mockData: TableData[] = [
  { id: '1', date: '07/01/2025', source: 'Google Ads', leads: 23, qualified: 18, investment: 832.50, cpl: 36.20 },
  { id: '2', date: '07/01/2025', source: 'Meta Ads', leads: 24, qualified: 16, investment: 868.00, cpl: 36.17 },
  { id: '3', date: '06/01/2025', source: 'Google Ads', leads: 28, qualified: 21, investment: 1015.20, cpl: 36.26 },
  { id: '4', date: '06/01/2025', source: 'Meta Ads', leads: 25, qualified: 19, investment: 904.80, cpl: 36.19 },
  { id: '5', date: '05/01/2025', source: 'Google Ads', leads: 25, qualified: 18, investment: 905.00, cpl: 36.20 },
  { id: '6', date: '05/01/2025', source: 'Meta Ads', leads: 23, qualified: 17, investment: 835.00, cpl: 36.30 },
];

export const DataTable = () => {
  const getCplColor = (cpl: number) => {
    if (cpl < 36.20) return 'text-accent';
    if (cpl > 36.30) return 'text-destructive';
    return 'text-foreground';
  };

  return (
    <div className="glass rounded-2xl border border-border/50 overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <div className="p-6 border-b border-border/50">
        <h2 className="text-xl font-bold mb-1">Detalhamento por Fonte</h2>
        <p className="text-sm text-muted-foreground">Performance detalhada das campanhas</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-muted-foreground font-semibold">Data</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Fonte</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Leads</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Qualificados</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Investimento</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">CPL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow 
                key={row.id} 
                className="border-border/50 hover:bg-glass-light transition-colors"
              >
                <TableCell className="font-medium">{row.date}</TableCell>
                <TableCell>
                  <span className="px-3 py-1 rounded-lg bg-glass-medium text-xs font-medium">
                    {row.source}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">{row.leads}</TableCell>
                <TableCell className="text-right font-semibold text-primary">{row.qualified}</TableCell>
                <TableCell className="text-right font-semibold">
                  R$ {row.investment.toFixed(2)}
                </TableCell>
                <TableCell className={`text-right font-bold ${getCplColor(row.cpl)}`}>
                  R$ {row.cpl.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>Mostrando 6 de 30 registros</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg glass-medium hover:glass-heavy transition-all">
            Anterior
          </button>
          <button className="px-3 py-1 rounded-lg glass-medium hover:glass-heavy transition-all">
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};
