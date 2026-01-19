// supabase/functions/webhook-leads-asf/index.ts
// Webhook para receber dados do NicoChat e salvar/atualizar na tabela leads_asf
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Pegar dados do body - tenta JSON, se falhar trata como texto
    let body
    const rawText = await req.text()
    try {
      body = JSON.parse(rawText)
    } catch (e) {
      // Se o JSON for invalido, tenta extrair os campos manualmente
      console.log('JSON invalido, tentando extrair campos...')
      const telefoneMatch = rawText.match(/"telefone":\s*"([^"]+)"/)
      const nomeMatch = rawText.match(/"nome":\s*"([^"]+)"/)
      const tagMatch = rawText.match(/"tag":\s*"([^"]+)"/)
      
      // Pega tudo depois de historico_conversa como texto
      const historicoMatch = rawText.match(/"historico_conversa":\s*(.+)/s)
      
      body = {
        telefone: telefoneMatch ? telefoneMatch[1].replace(/[{}]/g, '') : null,
        nome: nomeMatch ? nomeMatch[1].replace(/[{}]/g, '') : null,
        tag: tagMatch ? tagMatch[1] : null,
        historico_conversa: historicoMatch ? historicoMatch[1].trim() : null
      }
    }
    console.log('Dados recebidos:', body)

    // Validar campo obrigatório
    if (!body.telefone) {
      return new Response(
        JSON.stringify({ sucesso: false, erro: 'Campo obrigatorio: telefone' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar registro existente pelo telefone
    const { data: existente } = await supabase
      .from('leads_asf')
      .select('id')
      .eq('telefone', body.telefone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Preparar dados base - usando fuso horário de Brasília
    const agora = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00'
    const dados: any = {
      updated_at: agora,
    }
    
    // Telefone só é adicionado em novos registros
    if (!existente) {
      dados.telefone = body.telefone
    }

    // Adicionar campos se enviados
    if (body.nome) dados.nome = body.nome
    if (body.tag) dados.tag = body.tag
    // Historico pode vir como array ou string
    if (body.historico_conversa) {
      if (Array.isArray(body.historico_conversa)) {
        dados.historico_conversa = JSON.stringify(body.historico_conversa)
      } else {
        dados.historico_conversa = body.historico_conversa
      }
    }

    let result
    let acao

    if (existente) {
      // ATUALIZAR registro existente
      const { data, error } = await supabase
        .from('leads_asf')
        .update(dados)
        .eq('id', existente.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar:', error)
        return new Response(
          JSON.stringify({ sucesso: false, erro: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      result = data
      acao = 'atualizado'
    } else {
      // INSERIR novo registro
      // Adicionar created_at com fuso horário de Brasília
      dados.created_at = agora

      const { data, error } = await supabase
        .from('leads_asf')
        .insert(dados)
        .select()
        .single()

      if (error) {
        console.error('Erro ao inserir:', error)
        return new Response(
          JSON.stringify({ sucesso: false, erro: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      result = data
      acao = 'criado'
    }

    console.log(`Registro ${acao}:`, result)

    return new Response(
      JSON.stringify({ sucesso: true, mensagem: `Lead ${acao} com sucesso!`, acao, id: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ sucesso: false, erro: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
