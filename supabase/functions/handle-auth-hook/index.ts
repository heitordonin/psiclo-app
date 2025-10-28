import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const WEBHOOK_SECRET = Deno.env.get('AUTH_HOOK_SECRET');

serve(async (req) => {
  try {
    // 1. Validar assinatura do webhook
    const signature = req.headers.get('x-webhook-signature');
    const payload = await req.text();
    
    // Supabase envia um hash HMAC SHA-256 do payload
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );
    
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (signature !== expectedSignatureHex) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Parsear o evento
    const event = JSON.parse(payload);
    
    console.log('Auth hook event:', event.type);

    // 3. Processar apenas eventos de criação de usuário
    if (event.type === 'user.created') {
      const userId = event.user.id;
      
      console.log('Creating default categories for user:', userId);

      // 4. Criar cliente Supabase com service_role (bypass RLS)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // 5. Chamar a função de seed
      const { error } = await supabaseAdmin.rpc('seed_default_categories', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error seeding categories:', error);
        return new Response(
          JSON.stringify({ error: error.message }), 
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log('Default categories created successfully for user:', userId);
    }

    // 6. Retornar sucesso
    return new Response(
      JSON.stringify({ success: true }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in handle-auth-hook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
