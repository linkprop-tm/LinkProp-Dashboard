import { supabase } from '../supabase';

const WEBHOOK_URL = 'https://n8n.srv1124961.hstgr.cloud/webhook/busqueda-linkprop';

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

interface WebhookPayload {
  Relacion_cliente_agente: {
    'Agente inmobiliario': string;
    Usuario: string;
  };
  macro_preferencias: {
    operacion: string;
    tipo: string[];
    precio_min: string;
    precio_max: string;
    ubicacion: string[];
    amenities: string[];
    m2_min: string;
    ambientes: string[];
    apto_credito: boolean;
    apto_profesional: boolean;
    cochera: boolean;
    antiguedad: string | null;
  };
  micro_preferencias: {
    desde_piso: string | null;
    avenida: boolean | null;
    disposicion: string | null;
  };
}

async function obtenerAgenteAsignado(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('full_name')
      .eq('rol', 'admin')
      .maybeSingle();

    if (error) {
      console.error('[Webhook] Error al obtener agente:', error);
      return 'Karina Poblete';
    }

    return data?.full_name || 'Karina Poblete';
  } catch (error) {
    console.error('[Webhook] Excepción al obtener agente:', error);
    return 'Karina Poblete';
  }
}

function convertirAvenuePreference(pref: string | null): boolean | null {
  if (!pref || pref === 'Indiferente') return null;
  if (pref === 'Sí') return true;
  if (pref === 'No') return false;
  return null;
}

function convertirOrientacion(pref: string | null): string | null {
  if (!pref || pref === 'Indiferente') return null;
  if (pref === 'Frente' || pref === 'Contrafrente') return pref;
  return null;
}

function convertirPiso(pref: string | null): string | null {
  if (!pref || pref === 'Indiferente') return null;
  return pref;
}

function convertirAntiguedad(pref: string[]): string | null {
  if (!pref || pref.length === 0) return null;
  const valor = pref[0];
  if (valor === 'Indiferente') return null;
  return valor;
}

function transformarPreferenciasAWebhook(
  nombreUsuario: string,
  nombreAgente: string,
  preferencias: PreferenciasRegistro
): WebhookPayload {
  const ambientesArray = preferencias.environments
    ? preferencias.environments.split(',').map(e => e.trim())
    : [];

  return {
    Relacion_cliente_agente: {
      'Agente inmobiliario': nombreAgente,
      Usuario: nombreUsuario,
    },
    macro_preferencias: {
      operacion: preferencias.operation_type,
      tipo: preferencias.property_types,
      precio_min: preferencias.min_price?.toString() || '0',
      precio_max: preferencias.max_price?.toString() || '0',
      ubicacion: preferencias.neighborhoods,
      amenities: preferencias.amenities.length > 0 ? preferencias.amenities : [''],
      m2_min: preferencias.min_area?.toString() || '0',
      ambientes: ambientesArray,
      apto_credito: preferencias.credit,
      apto_profesional: preferencias.professional,
      cochera: preferencias.garage,
      antiguedad: convertirAntiguedad(preferencias.antiguedad),
    },
    micro_preferencias: {
      desde_piso: convertirPiso(preferencias.min_floor),
      avenida: convertirAvenuePreference(preferencias.avenue_preference),
      disposicion: convertirOrientacion(preferencias.front_preference),
    },
  };
}

export async function enviarWebhookRegistro(
  nombreUsuario: string,
  preferencias: PreferenciasRegistro
): Promise<void> {
  try {
    const nombreAgente = await obtenerAgenteAsignado();

    const payload = transformarPreferenciasAWebhook(
      nombreUsuario,
      nombreAgente,
      preferencias
    );

    console.log('[Webhook] Enviando webhook de registro:', {
      usuario: nombreUsuario,
      agente: nombreAgente,
      url: WEBHOOK_URL,
    });

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(() => {
        console.log('[Webhook] Webhook enviado exitosamente para:', nombreUsuario);
      })
      .catch((error) => {
        console.error('[Webhook] Error al enviar webhook:', error);
        console.error('[Webhook] Payload que falló:', JSON.stringify(payload, null, 2));
      });
  } catch (error) {
    console.error('[Webhook] Excepción al procesar webhook:', error);
  }
}
