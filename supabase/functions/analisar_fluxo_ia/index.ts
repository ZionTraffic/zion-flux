import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY não configurada");
    }

    const { workspace_id, conversa_id, mensagens } = await req.json();

    if (!mensagens || mensagens.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhuma mensagem enviada" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Analisando conversa ${conversa_id} do workspace ${workspace_id}`);

    const prompt = `
Analise o atendimento abaixo e responda APENAS com um JSON válido (sem markdown, sem formatação extra).
Estrutura obrigatória:
{
  "summary": "resumo geral da conversa",
  "issues": ["problema 1", "problema 2"],
  "suggestions": ["sugestão 1", "sugestão 2"],
  "score_coerencia": 85,
  "score_fluxo": 90,
  "score_humanizacao": 75
}

Identifique:
1. Resumo geral da conversa
2. Pontos problemáticos no fluxo (issues)
3. Sugestões para melhoria (suggestions)
4. Notas de 0 a 100: coerência, fluxo, humanização

Conversa:
${mensagens.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um analista de fluxos conversacionais. Responda sempre em JSON válido.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro OpenAI:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const resposta = data.choices[0]?.message?.content;
    
    console.log('Resposta da OpenAI:', resposta);

    let parsed;
    try {
      // Remove markdown se houver
      const cleanedResponse = resposta?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanedResponse || "{}");
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError, 'Resposta:', resposta);
      throw new Error('Resposta da IA não está em formato JSON válido');
    }

    const { error: insertError } = await supabase.from("analise_fluxos").insert({
      workspace_id,
      conversa_id,
      summary: parsed.summary || "",
      issues: parsed.issues || [],
      suggestions: parsed.suggestions || [],
      score_coerencia: parsed.score_coerencia || 0,
      score_fluxo: parsed.score_fluxo || 0,
      score_humanizacao: parsed.score_humanizacao || 0,
    });

    if (insertError) {
      console.error('Erro ao inserir análise:', insertError);
      throw insertError;
    }

    console.log('Análise salva com sucesso');

    return new Response(JSON.stringify({ status: "ok", analise: parsed }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Erro na função:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
