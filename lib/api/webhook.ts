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

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function intentarEnviarWebhook(
  nombreUsuario: string,
  preferencias: PreferenciasRegistro,
  intentoNumero: number
): Promise<boolean> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-registration-webhook`;

    console.log(`[Webhook] Intento ${intentoNumero} - Llamando a edge function:`, {
      usuario: nombreUsuario,
      url: edgeFunctionUrl,
      timestamp: new Date().toISOString(),
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
      console.error(`[Webhook] Intento ${intentoNumero} - Error en edge function:`, {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        timestamp: new Date().toISOString(),
      });
      return false;
    }

    console.log(`[Webhook] Intento ${intentoNumero} - Webhook enviado exitosamente:`, {
      ...responseData,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error(`[Webhook] Intento ${intentoNumero} - Excepción al enviar webhook:`, {
      error,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}

export async function enviarWebhookConReintentos(
  nombreUsuario: string,
  preferencias: PreferenciasRegistro
): Promise<void> {
  const maxIntentos = 3;
  const delaysPorIntento = [1000, 2000, 4000];

  console.log('[Webhook] Iniciando envío de webhook con reintentos:', {
    usuario: nombreUsuario,
    maxIntentos,
    timestamp: new Date().toISOString(),
  });

  for (let intento = 1; intento <= maxIntentos; intento++) {
    const exito = await intentarEnviarWebhook(nombreUsuario, preferencias, intento);

    if (exito) {
      console.log('[Webhook] ✓ Webhook enviado exitosamente en intento', intento);
      return;
    }

    if (intento < maxIntentos) {
      const delay = delaysPorIntento[intento - 1];
      console.log(`[Webhook] ⏳ Esperando ${delay}ms antes del siguiente intento...`);
      await sleep(delay);
    }
  }

  console.error('[Webhook] ✗ FALLO: Todos los intentos de envío de webhook fallaron después de', maxIntentos, 'intentos');
  throw new Error(`Webhook falló después de ${maxIntentos} intentos`);
}

export async function enviarWebhookRegistro(
  nombreUsuario: string,
  preferencias: PreferenciasRegistro
): Promise<void> {
  return enviarWebhookConReintentos(nombreUsuario, preferencias);
}
