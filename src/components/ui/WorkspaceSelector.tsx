interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceSelectorProps {
  current: string;
  onChange: (workspaceId: string) => void;
}

const workspaces: Workspace[] = [
  { id: "3f14bb25-0eda-4c58-8486-16b96dca6f9e", name: "ASF Finance" },
  { id: "4e99af61-d5a2-4319-bd6c-77d31c77b411", name: "Bem Estar" },
  { id: "8d10ce88-6e33-4822-92aa-cdd2c72d91de", name: "Dr. Premium" },
];

export function WorkspaceSelector({ current, onChange }: WorkspaceSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-muted-foreground font-medium">
        Workspace:
      </label>
      <select
        className="glass-medium backdrop-blur-xl border border-border/50 rounded-xl px-4 py-2 text-sm font-medium hover:glass-heavy transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/80"
        value={current}
        onChange={(e) => onChange(e.target.value)}
      >
        {workspaces.map((ws) => (
          <option key={ws.id} value={ws.id} className="bg-background text-foreground">
            {ws.name}
          </option>
        ))}
      </select>
    </div>
  );
}
