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
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Permissões Específicas</h4>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectNone}
          >
            Limpar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAll}
          >
            Todas
          </Button>
        </div>
      </div>

      {/* Botões de role padrão */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Aplicar padrões:</span>
        {Object.keys(DEFAULT_PERMISSIONS_BY_ROLE).map((role) => (
          <Button
            key={role}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyRoleDefaults(role as keyof typeof DEFAULT_PERMISSIONS_BY_ROLE)}
            className="h-6 text-xs"
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        ))}
      </div>

      {/* Contador de permissões selecionadas */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {selectedPermissions.length} de {Object.keys(PERMISSIONS).length} selecionadas
        </Badge>
      </div>

      {/* Lista de permissões por categoria */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
          <Collapsible
            key={category}
            open={openCategories.has(category)}
            onOpenChange={() => toggleCategory(category)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-2 h-auto"
              >
                <span className="font-medium text-sm">{category}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {permissions.filter(p => selectedPermissions.includes(p)).length}/{permissions.length}
                  </Badge>
                  {openCategories.has(category) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2 pl-4">
              {permissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={permission}
                    className="text-sm cursor-pointer flex-1"
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
      <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
              Controle de Workspace
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
              Usuários com permissões customizadas não podem trocar de workspace por segurança.
            </p>
            <div className="text-xs text-amber-600 dark:text-amber-400">
              ✓ Seletor de workspace será ocultado<br/>
              ✓ Usuário verá apenas o workspace atual<br/>
              ✓ Owners e Admins sempre podem trocar
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
        <p className="text-sm text-muted-foreground">
          <strong>Dica:</strong> Use os botões de role padrão para aplicar rapidamente um conjunto comum de permissões, depois ajuste individualmente conforme necessário.
        </p>
      </div>
    </div>
  );
}
