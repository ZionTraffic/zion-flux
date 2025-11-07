import React from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export const TenantSelector: React.FC = () => {
  const { currentTenant, availableTenants, switchTenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg animate-pulse">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
    );
  }

  if (availableTenants.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Nenhuma empresa</span>
      </div>
    );
  }

  if (availableTenants.length === 1) {
    // Se só tem um tenant, mostrar sem dropdown
    const tenant = availableTenants[0];
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 rounded-lg border">
        <Building2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{tenant.name}</span>
        <Badge variant="secondary" className="text-xs">
          {tenant.plan_type}
        </Badge>
      </div>
    );
  }

  return (
    <Select 
      value={currentTenant?.id || ''} 
      onValueChange={switchTenant}
      disabled={isLoading}
    >
      <SelectTrigger className="w-48 bg-background/95 backdrop-blur-sm border-border/50">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-primary" />
          <div className="flex flex-col items-start">
            <SelectValue placeholder="Selecionar empresa">
              {currentTenant && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{currentTenant.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {currentTenant.plan_type}
                  </Badge>
                </div>
              )}
            </SelectValue>
          </div>
        </div>
      </SelectTrigger>
      
      <SelectContent className="w-56">
        {availableTenants.map((tenant) => (
          <SelectItem 
            key={tenant.id} 
            value={tenant.id}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  tenant.active ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <div className="flex flex-col">
                  <span className="font-medium">{tenant.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tenant.database_key.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Badge 
                  variant={tenant.plan_type === 'enterprise' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {tenant.plan_type}
                </Badge>
                {currentTenant?.id === tenant.id && (
                  <Check className="h-3 w-3 text-primary" />
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Componente compacto para mobile
export const TenantSelectorCompact: React.FC = () => {
  const { currentTenant, availableTenants, switchTenant, isLoading } = useTenant();

  if (isLoading || availableTenants.length <= 1) {
    return (
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium truncate">
          {currentTenant?.name || 'Carregando...'}
        </span>
      </div>
    );
  }

  return (
    <Select value={currentTenant?.id || ''} onValueChange={switchTenant}>
      <SelectTrigger className="w-auto border-none bg-transparent p-0 h-auto">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium truncate">
            {currentTenant?.name}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      </SelectTrigger>
      
      <SelectContent>
        {availableTenants.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                tenant.active ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span>{tenant.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
