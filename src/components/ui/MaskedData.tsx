import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  mascararCPF, 
  mascararTelefone, 
  mascararTelefoneParcial,
  mascararEmail,
  mascararNome 
} from '@/utils/seguranca';

type TipoDado = 'cpf' | 'telefone' | 'telefone_parcial' | 'email' | 'nome';

interface MaskedDataProps {
  value: string | null | undefined;
  type: TipoDado;
  allowReveal?: boolean;  // Permitir revelar o dado
  className?: string;
}

/**
 * Componente para exibir dados sensíveis mascarados
 * Com opção de revelar temporariamente
 */
export function MaskedData({ 
  value, 
  type, 
  allowReveal = false,
  className = ''
}: MaskedDataProps) {
  const [revelado, setRevelado] = useState(false);

  const getMaskedValue = () => {
    if (!value) return '-';
    
    switch (type) {
      case 'cpf':
        return mascararCPF(value);
      case 'telefone':
        return mascararTelefone(value);
      case 'telefone_parcial':
        return mascararTelefoneParcial(value);
      case 'email':
        return mascararEmail(value);
      case 'nome':
        return mascararNome(value);
      default:
        return value;
    }
  };

  const displayValue = revelado ? value : getMaskedValue();

  if (!allowReveal) {
    return <span className={className}>{displayValue}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{displayValue}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 hover:bg-transparent"
        onClick={() => setRevelado(!revelado)}
        title={revelado ? 'Ocultar' : 'Revelar'}
      >
        {revelado ? (
          <EyeOff className="h-3 w-3 text-muted-foreground" />
        ) : (
          <Eye className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>
    </span>
  );
}

/**
 * Componentes específicos para cada tipo de dado
 */
export function MaskedCPF({ value, allowReveal = false, className = '' }: Omit<MaskedDataProps, 'type'>) {
  return <MaskedData value={value} type="cpf" allowReveal={allowReveal} className={className} />;
}

export function MaskedTelefone({ value, allowReveal = false, className = '' }: Omit<MaskedDataProps, 'type'>) {
  return <MaskedData value={value} type="telefone_parcial" allowReveal={allowReveal} className={className} />;
}

export function MaskedEmail({ value, allowReveal = false, className = '' }: Omit<MaskedDataProps, 'type'>) {
  return <MaskedData value={value} type="email" allowReveal={allowReveal} className={className} />;
}

export function MaskedNome({ value, allowReveal = false, className = '' }: Omit<MaskedDataProps, 'type'>) {
  return <MaskedData value={value} type="nome" allowReveal={allowReveal} className={className} />;
}
