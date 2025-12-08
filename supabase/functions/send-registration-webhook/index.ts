import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const WEBHOOK_URL = "https://n8n.srv1124961.hstgr.cloud/webhook/busqueda-linkprop";

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

interface RequestBody {
  nombreUsuario: string;
  preferencias: PreferenciasRegistro;
}

interface WebhookPayload {
  Relacion_cliente_agente: {
    "Agente inmobiliario": string;
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("[Webhook Function] Received request", {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      url: req.url,
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let requestBody: RequestBody;
    try {
      const bodyText = await req.text();
      console.log("[Webhook Function] Raw body:", bodyText);

      if (!bodyText || bodyText.trim() === "") {
        console.error("[Webhook Function] Empty body received");
        return new Response(
          JSON.stringify({
            error: "Empty request body",
            details: "The request body is empty. Make sure you're sending JSON data."
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      requestBody = JSON.parse(bodyText);
      console.log("[Webhook Function] Parsed body:", requestBody);
    } catch (parseError) {
      console.error("[Webhook Function] JSON parse error:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : String(parseError)
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { nombreUsuario, preferencias } = requestBody;

    if (!nombreUsuario || !preferencias) {
      return new Response(
        JSON.stringify({ error: "nombreUsuario and preferencias are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[Webhook Function] Getting assigned agent");

    const { data: agentData, error: agentError } = await supabaseAdmin
      .from("usuarios")
      .select("full_name")
      .eq("rol", "admin")
      .maybeSingle();

    if (agentError) {
      console.error("[Webhook Function] Error fetching agent:", agentError);
    }

    const nombreAgente = agentData?.full_name || "Karina Poblete";

    console.log("[Webhook Function] Building webhook payload");

    const convertirAvenuePreference = (pref: string | null): boolean | null => {
      if (!pref || pref === "Indiferente") return null;
      if (pref === "Sí") return true;
      if (pref === "No") return false;
      return null;
    };

    const convertirOrientacion = (pref: string | null): string | null => {
      if (!pref || pref === "Indiferente") return null;
      if (pref === "Frente" || pref === "Contrafrente") return pref;
      return null;
    };

    const convertirPiso = (pref: string | null): string | null => {
      if (!pref || pref === "Indiferente") return null;
      return pref;
    };

    const convertirAntiguedad = (pref: string[]): string | null => {
      if (!pref || pref.length === 0) return null;
      const valor = pref[0];
      if (valor === "Indiferente") return null;
      return valor;
    };

    const ambientesArray = preferencias.environments
      ? preferencias.environments.split(",").map((e) => e.trim())
      : [];

    const payload: WebhookPayload = {
      Relacion_cliente_agente: {
        "Agente inmobiliario": nombreAgente,
        Usuario: nombreUsuario,
      },
      macro_preferencias: {
        operacion: preferencias.operation_type,
        tipo: preferencias.property_types,
        precio_min: preferencias.min_price?.toString() || "0",
        precio_max: preferencias.max_price?.toString() || "0",
        ubicacion: preferencias.neighborhoods,
        amenities: preferencias.amenities.length > 0 ? preferencias.amenities : [""],
        m2_min: preferencias.min_area?.toString() || "0",
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

    console.log("[Webhook Function] Sending to n8n:", {
      url: WEBHOOK_URL,
      usuario: nombreUsuario,
      agente: nombreAgente,
    });

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await webhookResponse.text();

    console.log("[Webhook Function] n8n response:", {
      status: webhookResponse.status,
      statusText: webhookResponse.statusText,
      body: responseText,
    });

    if (!webhookResponse.ok) {
      console.error("[Webhook Function] n8n webhook failed");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Webhook request failed",
          details: {
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
            body: responseText,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[Webhook Function] Success!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook sent successfully",
        webhookResponse: {
          status: webhookResponse.status,
          body: responseText,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Webhook Function] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
