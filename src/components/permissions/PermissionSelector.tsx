import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PERMISSIONS, 
  PermissionKey, 
  PERMISSION_LABELS, 
  PERMISSION_CATEGORIES,
  DEFAULT_PERMISSIONS_BY_ROLE 
} from '@/types/permissions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface PermissionSelectorProps {
  selectedPermissions: PermissionKey[];
  onPermissionsChange: (permissions: PermissionKey[]) => void;
  userRole?: string;
}

export function PermissionSelector({ 
  selectedPermissions, 
  onPermissionsChange,
  userRole = 'viewer'
}: PermissionSelectorProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['Visualização']));

  const toggleCategory = (category: string) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(category)) {
      newOpenCategories.delete(category);
    } else {
      newOpenCategories.add(category);
    }
    setOpenCategories(newOpenCategories);
  };

  const handlePermissionChange = (permission: PermissionKey, checked: boolean) => {
    if (checked) {
      onPermissionsChange([...selectedPermissions, permission]);
    } else {
      onPermissionsChange(selectedPermissions.filter(p => p !== permission));
    }
  };

  const applyRoleDefaults = (role: keyof typeof DEFAULT_PERMISSIONS_BY_ROLE) => {
    onPermissionsChange(DEFAULT_PERMISSIONS_BY_ROLE[role] as PermissionKey[]);
  };

  const selectAll = () => {
    onPermissionsChange(Object.values(PERMISSIONS));
  };

  const selectNone = () => {
    onPermissionsChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Header com título e ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h4 className="text-base font-semibold text-foreground">Permissões Específicas</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Configure o acesso do usuário</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectNone}
            className="h-8 text-xs"
          >
            Limpar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="h-8 text-xs"
          >
            Todas
          </Button>
        </div>
      </div>

      {/* Botões de role padrão */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground mr-1">Aplicar padrões:</span>
        {Object.keys(DEFAULT_PERMISSIONS_BY_ROLE).map((role) => (
          <Button
            key={role}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyRoleDefaults(role as keyof typeof DEFAULT_PERMISSIONS_BY_ROLE)}
            className="h-7 text-xs px-3 hover:bg-primary/10 hover:border-primary/50 transition-colors"
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        ))}
      </div>

      {/* Contador de permissões selecionadas */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
          {selectedPermissions.length} de {Object.keys(PERMISSIONS).length} selecionadas
        </Badge>
      </div>

      {/* Lista de permissões por categoria */}
      <div className="space-y-2">
        {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
          <Collapsible
            key={category}
            open={openCategories.has(category)}
            onOpenChange={() => toggleCategory(category)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all"
              >
                <span className="font-medium text-sm text-foreground">{category}</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={permissions.filter(p => selectedPermissions.includes(p)).length === permissions.length ? "default" : "outline"} 
                    className="text-xs"
                  >
                    {permissions.filter(p => selectedPermissions.includes(p)).length}/{permissions.length}
                  </Badge>
                  {openCategories.has(category) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-2 pl-4 pr-2">
              {permissions.map((permission) => (
                <div 
                  key={permission} 
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission, checked as boolean)
                    }
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={permission}
                    className="text-sm cursor-pointer flex-1 text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {PERMISSION_LABELS[permission]}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Opção para bloquear troca de workspace */}
      <div className="mt-6 p-4 rounded-xl bg-indigo-600 text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-1">
              Controle de Workspace
            </h4>
            <p className="text-xs text-white/80 mb-3">
              Usuários com permissões customizadas não podem trocar de workspace.
            </p>
            <div className="text-xs text-white/90 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">✓</span>
                <span>Seletor de workspace será ocultado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">✓</span>
                <span>Usuário verá apenas o workspace atual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">✓</span>
                <span>Owners e Admins sempre podem trocar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-bold text-gray-900 dark:text-white">Dica:</span> Use os botões de role padrão para aplicar rapidamente um conjunto comum de permissões.
        </p>
      </div>
    </div>
  );
}
