import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { validarSenha, type ValidacaoSenha } from '@/utils/seguranca';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const validacao = useMemo(() => validarSenha(password), [password]);

  const getCorForca = (forca: ValidacaoSenha['forca']) => {
    switch (forca) {
      case 'muito_forte': return 'bg-emerald-500';
      case 'forte': return 'bg-green-500';
      case 'media': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getLabelForca = (forca: ValidacaoSenha['forca']) => {
    switch (forca) {
      case 'muito_forte': return 'Muito Forte';
      case 'forte': return 'Forte';
      case 'media': return 'Média';
      default: return 'Fraca';
    }
  };

  const requisitos = [
    { label: 'Mínimo 8 caracteres', check: password.length >= 8 },
    { label: 'Letra maiúscula', check: /[A-Z]/.test(password) },
    { label: 'Letra minúscula', check: /[a-z]/.test(password) },
    { label: 'Número', check: /[0-9]/.test(password) },
    { label: 'Caractere especial (!@#$%...)', check: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Barra de força */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getCorForca(validacao.forca)}`}
            style={{ width: `${(validacao.pontuacao / 7) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          validacao.forca === 'fraca' ? 'text-red-600' :
          validacao.forca === 'media' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {getLabelForca(validacao.forca)}
        </span>
      </div>

      {/* Lista de requisitos */}
      {showRequirements && (
        <div className="grid grid-cols-2 gap-1 text-xs">
          {requisitos.map((req, index) => (
            <div 
              key={index}
              className={`flex items-center gap-1 ${req.check ? 'text-green-600' : 'text-gray-400'}`}
            >
              {req.check ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
