import { createClient } from 'npm:@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PropertyRow {
  id_original: string;
  tipo: string;
  operacion: string;
  estado: string;
  visibilidad: string;
  precio: number;
  moneda: string;
  descripcion: string;
  imagenes: string[];
  direccion: string;
  barrio: string;
  provincia: string;
  ambientes: number | null;
  dormitorios: number;
  banos: number;
  m2_totales: number | null;
  m2_cubiertos: number | null;
  antiguedad: string;
  orientacion: string;
  expensas: number | null;
  apto_mascotas: boolean;
  apto_credito: boolean;
  apto_profesional: boolean;
  cochera: boolean;
  amenities: string[];
  portal_original: string;
  url_original: string;
}

interface SyncError {
  row: number;
  id_original?: string;
  field?: string;
  error: string;
}

interface SyncStats {
  total_rows: number;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

function parseBool(value: string | undefined): boolean {
  if (!value || value === '') return false;
  const normalized = value.toString().toUpperCase().trim();
  return normalized === 'TRUE' || normalized === '1' || normalized === 'SI' || normalized === 'YES';
}

function parseJsonArray(value: string | undefined): string[] {
  if (!value || value === '') return [];
  try {
    const normalized = value.replace(/'/g, '"');
    const parsed = JSON.parse(normalized);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseNumber(value: string | undefined): number | null {
  if (!value || value === '' || value.toUpperCase() === 'N/A') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    rows.push(row);
  }

  return rows;
}

function validateAndTransformRow(row: Record<string, string>, rowNumber: number): { property: PropertyRow | null; error: SyncError | null } {
  const validTipos = ['Casa', 'Departamento', 'PH', 'Local', 'Oficina', 'Galpon', 'Terreno', 'Comercial'];
  const validOperaciones = ['Venta', 'Alquiler'];
  const validEstados = ['Disponible', 'Reservada', 'No disponible'];
  const validMonedas = ['USD', 'ARS'];
  const validVisibilidad = ['Publica', 'Privada'];

  if (!row.id_original || row.id_original.trim() === '') {
    return { property: null, error: { row: rowNumber, field: 'id_original', error: 'id_original es requerido' } };
  }

  if (!validTipos.includes(row.tipo)) {
    return { property: null, error: { row: rowNumber, id_original: row.id_original, field: 'tipo', error: `Tipo inválido: "${row.tipo}". Debe ser uno de: ${validTipos.join(', ')}` } };
  }

  if (!validOperaciones.includes(row.operacion)) {
    return { property: null, error: { row: rowNumber, id_original: row.id_original, field: 'operacion', error: `Operación inválida: "${row.operacion}". Debe ser: Venta o Alquiler` } };
  }

  if (!validEstados.includes(row.estado)) {
    return { property: null, error: { row: rowNumber, id_original: row.id_original, field: 'estado', error: `Estado inválido: "${row.estado}". Debe ser: Disponible, Reservada o No disponible` } };
  }

  const precio = parseNumber(row.precio);
  if (precio === null || precio <= 0) {
    return { property: null, error: { row: rowNumber, id_original: row.id_original, field: 'precio', error: 'Precio debe ser mayor a 0' } };
  }

  if (!validMonedas.includes(row.moneda)) {
    return { property: null, error: { row: rowNumber, id_original: row.id_original, field: 'moneda', error: `Moneda inválida: "${row.moneda}". Debe ser: USD o ARS` } };
  }

  const property: PropertyRow = {
    id_original: row.id_original.trim(),
    tipo: row.tipo,
    operacion: row.operacion,
    estado: row.estado,
    visibilidad: validVisibilidad.includes(row.visibilidad) ? row.visibilidad : 'Publica',
    precio,
    moneda: row.moneda,
    descripcion: row.descripcion || '',
    imagenes: parseJsonArray(row.imagenes),
    direccion: row.direccion || '',
    barrio: row.barrio || '',
    provincia: row.provincia || '',
    ambientes: parseNumber(row.ambientes),
    dormitorios: parseNumber(row.dormitorios) || 0,
    banos: parseNumber(row.banos) || 0,
    m2_totales: parseNumber(row.m2_totales),
    m2_cubiertos: parseNumber(row.m2_cubiertos),
    antiguedad: row.antiguedad || '',
    orientacion: row.orientacion || '',
    expensas: parseNumber(row.expensas),
    apto_mascotas: parseBool(row.apto_mascotas),
    apto_credito: parseBool(row.apto_credito),
    apto_profesional: parseBool(row.apto_profesional),
    cochera: parseBool(row.cochera),
    amenities: parseJsonArray(row.amenities),
    portal_original: row.portal_original || '',
    url_original: row.url_original || '',
  };

  return { property, error: null };
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const syncSecret = req.headers.get('x-sync-secret');
    const expectedSecret = Deno.env.get('SYNC_SECRET_KEY');

    if (!syncSecret || syncSecret !== expectedSecret) {
      console.log('Unauthorized sync attempt - invalid secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid sync secret' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const sheetId = Deno.env.get('GOOGLE_SHEET_ID');
    const gid = Deno.env.get('GOOGLE_SHEET_GID') || '0';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!sheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable not set');
    }

    console.log(`Starting sync from Google Sheet: ${sheetId}, GID: ${gid}`);

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    console.log(`Fetching CSV from: ${csvUrl}`);

    const csvResponse = await fetch(csvUrl);
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV: ${csvResponse.status} ${csvResponse.statusText}`);
    }

    const csvText = await csvResponse.text();
    console.log(`CSV fetched successfully, size: ${csvText.length} bytes`);

    const rows = parseCSV(csvText);
    console.log(`Parsed ${rows.length} rows from CSV`);

    const stats: SyncStats = {
      total_rows: rows.length,
      processed: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    const errors: SyncError[] = [];
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      const row = rows[i];

      const { property, error } = validateAndTransformRow(row, rowNumber);

      if (error) {
        errors.push(error);
        stats.errors++;
        stats.skipped++;
        console.log(`Row ${rowNumber} validation error:`, error.error);
        continue;
      }

      if (!property) {
        stats.skipped++;
        continue;
      }

      try {
        const { data: existing, error: fetchError } = await supabase
          .from('propiedades')
          .select('id, estado, estado_manual')
          .eq('id_original', property.id_original)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (!existing) {
          const { error: insertError } = await supabase
            .from('propiedades')
            .insert({
              ...property,
              estado_manual: false,
            });

          if (insertError) {
            throw insertError;
          }

          stats.inserted++;
          stats.processed++;
          console.log(`Row ${rowNumber}: Inserted new property ${property.id_original}`);
        } else {
          const shouldUpdateEstado =
            property.estado === 'No disponible' ||
            !existing.estado_manual ||
            (existing.estado_manual && property.estado !== 'Disponible');

          const updateData: any = {
            tipo: property.tipo,
            operacion: property.operacion,
            precio: property.precio,
            moneda: property.moneda,
            descripcion: property.descripcion,
            imagenes: property.imagenes,
            direccion: property.direccion,
            barrio: property.barrio,
            provincia: property.provincia,
            ambientes: property.ambientes,
            dormitorios: property.dormitorios,
            banos: property.banos,
            m2_totales: property.m2_totales,
            m2_cubiertos: property.m2_cubiertos,
            antiguedad: property.antiguedad,
            orientacion: property.orientacion,
            expensas: property.expensas,
            visibilidad: property.visibilidad,
            apto_mascotas: property.apto_mascotas,
            apto_credito: property.apto_credito,
            apto_profesional: property.apto_profesional,
            cochera: property.cochera,
            amenities: property.amenities,
            portal_original: property.portal_original,
            url_original: property.url_original,
          };

          if (shouldUpdateEstado) {
            updateData.estado = property.estado;
            if (property.estado === 'No disponible') {
              updateData.estado_manual = false;
            }
          }

          const { error: updateError } = await supabase
            .from('propiedades')
            .update(updateData)
            .eq('id', existing.id);

          if (updateError) {
            throw updateError;
          }

          stats.updated++;
          stats.processed++;
          console.log(`Row ${rowNumber}: Updated property ${property.id_original}${shouldUpdateEstado ? ` (estado: ${property.estado})` : ' (estado protected)'}`);
        }
      } catch (dbError) {
        errors.push({
          row: rowNumber,
          id_original: property.id_original,
          error: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
        });
        stats.errors++;
        console.error(`Row ${rowNumber} database error:`, dbError);
      }
    }

    const executionTime = Date.now() - startTime;
    console.log(`Sync completed in ${executionTime}ms`);
    console.log(`Stats: ${stats.processed} processed, ${stats.inserted} inserted, ${stats.updated} updated, ${stats.skipped} skipped, ${stats.errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        stats,
        errors: errors.length > 0 ? errors : undefined,
        execution_time_ms: executionTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Sync function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Sync failed',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
