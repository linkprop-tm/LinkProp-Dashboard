interface PreferenciasRegistro {
  operation_type: string;
  property_types: string[];
  neighborhoods: string[];
  geographic_zone: any;
  min_price: number | null;
  max_price: number | null;
  min_area: number | null;
  environments: string | null;
  amenities: string[];
  antiguedad: string[];
  min_floor: string | null;
  avenue_preference: string | null;
  front_preference: string | null;
  credit: boolean;
  professional: boolean;
  garage: boolean;
  pets: boolean;
}

export async function enviarWebhookRegistro(
  nombreUsuario: string,
  preferencias: PreferenciasRegistro
): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-registration-webhook`;

    console.log('[Webhook] Llamando a edge function:', {
      usuario: nombreUsuario,
      url: edgeFunctionUrl,
    });

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        nombreUsuario,
        preferencias,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('[Webhook] Error en edge function:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
      throw new Error(`Edge function failed: ${response.statusText}`);
    }

    console.log('[Webhook] Webhook enviado exitosamente:', responseData);
  } catch (error) {
    console.error('[Webhook] Excepción al enviar webhook:', error);
    throw error;
  }
}
