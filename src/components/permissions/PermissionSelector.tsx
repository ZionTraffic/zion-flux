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

    </div>
  );
}
