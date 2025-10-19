import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Loader2, Database } from "lucide-react";
import { CreateWorkspaceData } from "@/hooks/useWorkspaces";
import { z } from "zod";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import { useDatabase } from "@/contexts/DatabaseContext";

// Input validation schema to prevent SQL injection and XSS
const workspaceSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-Z0-9\s\u00C0-\u00FF-_]+$/, 'Nome contém caracteres inválidos'),
  slug: z.string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  database: z.string().min(1, 'Selecione um banco'),
  segment: z.string()
    .trim()
    .max(100, 'Segmento deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  primary_color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida. Use formato hexadecimal (#RRGGBB)')
});

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkspace: (data: CreateWorkspaceData) => Promise<any>;
}

export function CreateWorkspaceModal({
  open,
  onOpenChange,
  onCreateWorkspace,
}: CreateWorkspaceModalProps) {
  const { availableDatabases } = useDatabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateWorkspaceData>({
    name: "",
    slug: "",
    database: "asf",
    segment: "",
    primary_color: "#007AFF",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSubmitting(true);

    try {
      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

      const dataToValidate = {
        ...formData,
        slug,
        segment: formData.segment || ''
      };

      // Validate inputs to prevent SQL injection and XSS
      const validatedData = workspaceSchema.parse(dataToValidate);

      await onCreateWorkspace({
        name: validatedData.name,
        slug: validatedData.slug,
        database: validatedData.database,
        segment: validatedData.segment,
        primary_color: validatedData.primary_color
      });
      
      toast({
        title: "Workspace criada",
        description: "A workspace foi criada com sucesso!",
      });
      
      onOpenChange(false);
      setFormData({
        name: "",
        slug: "",
        database: "asf",
        segment: "",
        primary_color: "#007AFF",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
        toast({
          title: "Erro de validação",
          description: "Por favor, corrija os erros no formulário.",
          variant: "destructive",
        });
      } else {
        logger.error('Error creating workspace:', error);
        toast({
          title: "Erro ao criar workspace",
          description: "Ocorreu um erro ao criar a workspace. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Building2 className="h-5 w-5 text-blue-400" />
            </div>
            <DialogTitle className="text-2xl">Nova Workspace</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Workspace</Label>
            <Input
              id="name"
              placeholder="Ex: ASF Finance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="glass-medium border-border/50"
            />
            {validationErrors.name && (
              <p className="text-sm text-destructive">{validationErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="database">Banco de Dados</Label>
            <Select
              value={formData.database}
              onValueChange={(value) => setFormData({ ...formData, database: value })}
            >
              <SelectTrigger className="glass-medium border-border/50">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Selecione o banco" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableDatabases.map((db) => (
                  <SelectItem key={db.id} value={db.id}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>{db.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.database && (
              <p className="text-sm text-destructive">{validationErrors.database}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segmento</Label>
            <Input
              id="segment"
              placeholder="Ex: Financeiro, Saúde, Educação"
              value={formData.segment}
              onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
              className="glass-medium border-border/50"
            />
            {validationErrors.segment && (
              <p className="text-sm text-destructive">{validationErrors.segment}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor da Identidade Visual</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-20 h-10 glass-medium border-border/50 cursor-pointer"
              />
              <Input
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                placeholder="#007AFF"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1 glass-medium border-border/50"
              />
            </div>
            {validationErrors.primary_color && (
              <p className="text-sm text-destructive">{validationErrors.primary_color}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-white/10 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
