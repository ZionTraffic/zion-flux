// supabase/functions/webhook-disparos/index.ts
// Webhook para registrar cada disparo feito pelo NicohChat
// Cada chamada = 1 disparo (mesmo que seja para a mesma pessoa)
// VERSÃO 4 - Mais tolerante, todos os campos opcionais
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ID fixo da SIEG Financeiro (padrão)
const SIEG_EMPRESA_ID = '98ce360f-baf2-46ff-8d98-f7af80d225fa'

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

    // Pegar dados do body
    let body: any = {}
    const rawText = await req.text()
    
    console.log('📥 [Disparo] Raw body:', rawText)
    
    try {
      body = JSON.parse(rawText)
    } catch (e) {
      console.log('⚠️ [Disparo] JSON inválido, extraindo campos...')
      const nomeMatch = rawText.match(/"nome"\s*:\s*"([^"]*)"/)
      const empresaMatch = rawText.match(/"empresa"\s*:\s*"([^"]*)"/)
      const telefoneMatch = rawText.match(/"telefone"\s*:\s*"([^"]*)"/)
      
      body = {
        nome: nomeMatch ? nomeMatch[1] : null,
        empresa: empresaMatch ? empresaMatch[1] : null,
        telefone: telefoneMatch ? telefoneMatch[1] : null,
      }
    }
    
    console.log('📤 [Disparo] Dados parseados:', JSON.stringify(body))

    // Usar SIEG como padrão se não vier empresa
    const empresa = body.empresa || 'SIEG Financeiro'
    const empresaId = SIEG_EMPRESA_ID

    // Status vem do NicohChat - não usar valor padrão
    const statusRecebido = typeof body.status === 'string' && body.status.trim().length > 0
      ? body.status.trim()
      : null

    // Preparar dados do disparo (todos opcionais exceto empresa_id)
    const agora = new Date().toISOString()
    const dadosDisparo: any = {
      empresa: empresa,
      empresa_id: empresaId,
      enviado_em: agora,
      status: statusRecebido,
    }

    // Adicionar campos opcionais se existirem
    if (body.nome) dadosDisparo.nome = body.nome
    if (body.telefone) dadosDisparo.telefone = body.telefone
    if (body.tipo_disparo) dadosDisparo.tipo_disparo = body.tipo_disparo
    if (body.canal) dadosDisparo.canal = body.canal
    if (body.metadados) dadosDisparo.metadados = body.metadados

    console.log('💾 [Disparo] Inserindo:', JSON.stringify(dadosDisparo))

    // SEMPRE inserir (cada chamada = 1 disparo)
    const { data, error } = await supabase
      .from('disparos')
      .insert(dadosDisparo)
      .select()
      .single()

    if (error) {
      console.error('❌ [Disparo] Erro insert:', JSON.stringify(error))
      return new Response(
        JSON.stringify({ sucesso: false, erro: error.message, detalhes: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ [Disparo] Sucesso! ID:', data.id)

    return new Response(
      JSON.stringify({ 
        sucesso: true, 
        mensagem: 'Disparo registrado!',
        id: data.id,
        empresa: empresa
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ [Disparo] Erro geral:', error?.message || error)
    return new Response(
      JSON.stringify({ sucesso: false, erro: error?.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
