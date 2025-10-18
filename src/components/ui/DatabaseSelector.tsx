import { Database } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseContext';

export function DatabaseSelector() {
  const { currentDatabase, databaseName, setDatabase, availableDatabases } = useDatabase();

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-muted-foreground font-medium flex items-center gap-2">
        <Database className="h-4 w-4" />
        Banco:
      </label>
      <select
        className="glass-medium backdrop-blur-xl border border-border/50 rounded-xl px-4 py-2 text-sm font-medium hover:glass-heavy transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/80"
        value={currentDatabase}
        onChange={(e) => setDatabase(e.target.value as any)}
      >
        {availableDatabases.map((db) => (
          <option key={db.id} value={db.id} className="bg-background text-foreground">
            {db.name}
          </option>
        ))}
      </select>
    </div>
  );
}
