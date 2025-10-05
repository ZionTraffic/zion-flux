import { Download, Mail, MessageCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReportActionsProps {
  onGeneratePdf: () => void;
  isGenerating: boolean;
}

export function ReportActions({ onGeneratePdf, isGenerating }: ReportActionsProps) {
  const handleEmail = () => {
    toast.info("Funcionalidade de envio por e-mail será implementada em breve");
  };

  const handleWhatsApp = () => {
    toast.info("Funcionalidade de envio por WhatsApp será implementada em breve");
  };

  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <FileText className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Exportar e Compartilhar</h2>
          <p className="text-sm text-muted-foreground">
            Baixe ou compartilhe seu relatório
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          onClick={onGeneratePdf}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? "Gerando..." : "Baixar PDF"}
        </Button>

        <Button
          onClick={handleEmail}
          variant="outline"
          className="w-full border-white/10 hover:bg-white/5"
        >
          <Mail className="h-4 w-4 mr-2" />
          Enviar por E-mail
        </Button>

        <Button
          onClick={handleWhatsApp}
          variant="outline"
          className="w-full border-white/10 hover:bg-white/5"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Enviar por WhatsApp
        </Button>
      </div>
    </div>
  );
}
