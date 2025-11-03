import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[Recurring] Starting recurring transactions processing...');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const today = new Date().toISOString().split('T')[0];
    console.log(`[Recurring] Processing date: ${today}`);

    // 1. Buscar transações recorrentes ativas que precisam gerar novas ocorrências
    const { data: recurringTxs, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('is_recurring', true)
      .is('parent_transaction_id', null) // Apenas transações "mãe"
      .or(`recurrence_end_date.is.null,recurrence_end_date.gte.${today}`);

    if (fetchError) {
      console.error('[Recurring] Error fetching transactions:', fetchError);
      throw fetchError;
    }

    console.log(`[Recurring] Found ${recurringTxs?.length || 0} active recurring transactions`);

    if (!recurringTxs || recurringTxs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0,
          generated: 0,
          message: 'No recurring transactions to process'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newTransactions = [];
    let skippedCount = 0;

    for (const tx of recurringTxs) {
      console.log(`[Recurring] Processing transaction ${tx.id} - ${tx.description}`);
      
      // Calcular próximas datas baseado no padrão
      const nextDates = calculateNextDates(
        new Date(tx.transaction_date),
        tx.recurrence_pattern,
        tx.recurrence_end_date,
        tx.recurrence_count,
        new Date(today)
      );

      console.log(`[Recurring] Generated ${nextDates.length} dates for transaction ${tx.id}`);

      for (const nextDate of nextDates) {
        // Verificar se já existe transação para esta data
        const { data: existing } = await supabase
          .from('transactions')
          .select('id')
          .eq('parent_transaction_id', tx.id)
          .eq('transaction_date', nextDate)
          .maybeSingle();

        if (existing) {
          console.log(`[Recurring] Transaction already exists for date ${nextDate}, skipping`);
          skippedCount++;
          continue;
        }

        newTransactions.push({
          user_id: tx.user_id,
          amount: tx.amount,
          description: tx.description,
          type: tx.type,
          category_id: tx.category_id,
          transaction_date: nextDate,
          is_recurring: false,
          is_auto_generated: true,
          parent_transaction_id: tx.id,
        });
      }
    }

    console.log(`[Recurring] Preparing to insert ${newTransactions.length} new transactions (${skippedCount} skipped)`);

    // 2. Inserir novas transações em lote
    let insertedCount = 0;
    if (newTransactions.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('transactions')
        .insert(newTransactions)
        .select();

      if (insertError) {
        console.error('[Recurring] Error inserting transactions:', insertError);
        throw insertError;
      }
      
      insertedCount = inserted?.length || 0;
      console.log(`[Recurring] Successfully generated ${insertedCount} new transactions`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: recurringTxs.length,
        generated: insertedCount,
        skipped: skippedCount,
        message: `Processed ${recurringTxs.length} recurring transactions, generated ${insertedCount} new, skipped ${skippedCount} existing`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Recurring] Fatal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Calcula as próximas datas de recorrência que devem ser geradas
 * @param startDate - Data inicial da transação
 * @param pattern - Padrão de recorrência (daily, weekly, monthly, yearly)
 * @param endDate - Data limite (opcional)
 * @param count - Número máximo de ocorrências (opcional)
 * @param currentDate - Data atual para comparação
 * @returns Array de datas em formato ISO (YYYY-MM-DD)
 */
function calculateNextDates(
  startDate: Date,
  pattern: string | null,
  endDate: string | null,
  count: number | null,
  currentDate: Date
): string[] {
  if (!pattern) {
    console.log('[Recurring] No pattern specified, returning empty array');
    return [];
  }

  const dates: string[] = [];
  const end = endDate ? new Date(endDate) : null;
  const maxCount = count || 1000; // Limite de segurança
  const currentDateStart = new Date(currentDate);
  currentDateStart.setHours(0, 0, 0, 0);

  let currentIterationDate = new Date(startDate);
  currentIterationDate.setHours(0, 0, 0, 0);
  let iterations = 0;

  console.log(`[Recurring] Calculating dates from ${startDate.toISOString()} with pattern ${pattern}`);
  console.log(`[Recurring] End date: ${end?.toISOString() || 'none'}, Max count: ${maxCount}, Current date: ${currentDate.toISOString()}`);

  while (iterations < maxCount) {
    // Calcular próxima data baseado no padrão
    switch (pattern) {
      case 'daily':
        currentIterationDate.setDate(currentIterationDate.getDate() + 1);
        break;
      case 'weekly':
        currentIterationDate.setDate(currentIterationDate.getDate() + 7);
        break;
      case 'monthly':
        currentIterationDate.setMonth(currentIterationDate.getMonth() + 1);
        break;
      case 'yearly':
        currentIterationDate.setFullYear(currentIterationDate.getFullYear() + 1);
        break;
      default:
        console.log(`[Recurring] Unknown pattern: ${pattern}`);
        return dates;
    }

    // Parar se ultrapassar data limite
    if (end && currentIterationDate > end) {
      console.log(`[Recurring] Reached end date limit at iteration ${iterations}`);
      break;
    }

    // Converter data para string ISO (antes de usar nos logs)
    const dateStr = currentIterationDate.toISOString().split('T')[0];

    // Para recorrências mensais/anuais, incluir o período atual
    // Para diárias/semanais, gerar apenas até hoje
    if (currentIterationDate > currentDateStart) {
      if (pattern === 'monthly' || pattern === 'yearly') {
        // Verificar se está no mesmo período (mês/ano)
        const currentMonth = currentDateStart.getMonth();
        const currentYear = currentDateStart.getFullYear();
        const iterMonth = currentIterationDate.getMonth();
        const iterYear = currentIterationDate.getFullYear();
        
        if (pattern === 'monthly') {
          // Se for mês/ano diferente, parar
          if (iterMonth !== currentMonth || iterYear !== currentYear) {
            console.log(`[Recurring] Reached future month at iteration ${iterations}`);
            break;
          }
          // Se for mesmo mês/ano, permitir (continua o loop)
          console.log(`[Recurring] Including current month date: ${dateStr}`);
        } else if (pattern === 'yearly') {
          // Se for ano diferente, parar
          if (iterYear !== currentYear) {
            console.log(`[Recurring] Reached future year at iteration ${iterations}`);
            break;
          }
          console.log(`[Recurring] Including current year date: ${dateStr}`);
        }
      } else {
        // Para daily e weekly, parar em datas futuras
        console.log(`[Recurring] Reached future date at iteration ${iterations}`);
        break;
      }
    }
    dates.push(dateStr);
    iterations++;

    // Limite de segurança para evitar loop infinito
    if (iterations >= maxCount) {
      console.log(`[Recurring] Reached max iteration limit: ${maxCount}`);
      break;
    }
  }

  console.log(`[Recurring] Generated ${dates.length} dates`);
  return dates;
}
