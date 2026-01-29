import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, Rocket, Gift } from 'lucide-react';

// Versão atual das novidades - incrementar a cada atualização importante
const CURRENT_VERSION = '2.5.0';
const STORAGE_KEY = 'zion_last_seen_version';

interface UpdateItem {
  icon: 'sparkles' | 'check' | 'rocket' | 'gift';
  title: string;
  description: string;
}

// Lista de novidades - editar aqui para adicionar novas atualizações
const updates: UpdateItem[] = [
  {
    icon: 'sparkles',
    title: 'Valores Financeiros Atualizados',
    description: 'Agora o valor em aberto no topo da página mostra o total geral, independente do período selecionado nos filtros.',
  },
  {
    icon: 'check',
    title: 'Melhorias no Dashboard',
    description: 'Os cards de valores financeiros agora mostram informações mais precisas e atualizadas em tempo real.',
  },
  {
    icon: 'rocket',
    title: 'Performance Aprimorada',
    description: 'Otimizamos o carregamento dos dados para uma experiência mais rápida e fluida.',
  },
];

const iconMap = {
  sparkles: Sparkles,
  check: CheckCircle2,
  rocket: Rocket,
  gift: Gift,
};

const iconColorMap = {
  sparkles: 'text-yellow-500 bg-yellow-100',
  check: 'text-green-500 bg-green-100',
  rocket: 'text-blue-500 bg-blue-100',
  gift: 'text-purple-500 bg-purple-100',
};

export function WhatsNewModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já viu esta versão
    const lastSeenVersion = localStorage.getItem(STORAGE_KEY);
    
    if (lastSeenVersion !== CURRENT_VERSION) {
      // Pequeno delay para não aparecer imediatamente ao carregar
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Salvar que o usuário viu esta versão
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-800">
                Novidades do Sistema! 🎉
              </DialogTitle>
              <p className="text-sm text-gray-500">Versão {CURRENT_VERSION}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 mb-6">
            Olá! Fizemos algumas melhorias para você. Confira o que há de novo:
          </p>

          <div className="space-y-4">
            {updates.map((update, index) => {
              const IconComponent = iconMap[update.icon];
              const colorClass = iconColorMap[update.icon];
              
              return (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {update.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {update.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={handleClose}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            Entendi, vamos lá! 🚀
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
