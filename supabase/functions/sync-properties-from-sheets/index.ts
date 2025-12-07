import { createClient } from 'npm:@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, x-sync-secret',
};

interface PropertyRow {
  id_original: string;
  operacion: string;
  tipo: string;
  estado: string;
  precio: number;
  moneda: string;
  piso: number | null;
  imagenes: string[];
  avenida: boolean;
  direccion: string;
  barrio: string;
  provincia: string;
  latitud: number | null;
  longitud: number | null;
  ambientes: number | null;
  dormitorios: number;
  banos: number;
  m2_totales: number | null;
  m2_cubiertos: number | null;
  antiguedad: string;
  orientacion: string;
  disposicion: string;
  expensas: number | null;
  apto_credito: boolean;
  apto_profesional: boolean;
  cochera: boolean;
  apto_mascotas: boolean;
  amenities: string[];
  portal_original: string;
  url_original: string;
  confiabilidad: string;
  fecha_scraping: string | null;
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

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) {
    console.log('CSV has less than 2 lines (header + data)');
    return [];
  }

  const headers = parseCSVLine(lines[0]);
  console.log(`Found ${headers.length} columns: ${headers.slice(0, 5).join(', ')}...`);

  const rows: Record<string, string>[] = [];
  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length < headers.length) {
      while (values.length < headers.length) {
        values.push('');
      }
    }

    if (values.every(v => v === '')) {
      skippedRows++;
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = index < values.length ? values[index] : '';
    });
    rows.push(row);
  }

  if (skippedRows > 0) {
    console.log(`Skipped ${skippedRows} empty rows`);
  }

  return rows;
}

function parseDate(value: string | undefined): string | null {
  if (!value || value === '' || value.toUpperCase() === 'N/A') return null;
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

function validateAndTransformRow(row: Record<string, string>, rowNumber: number): { property: PropertyRow | null; error: SyncError | null } {
  const validTipos = ['Casa', 'Departamento', 'PH', 'Local', 'Oficina', 'Galpon', 'Terreno', 'Comercial'];
  const validOperaciones = ['Venta', 'Alquiler'];
  const validEstados = ['Disponible', 'Reservada', 'No disponible'];
  const validMonedas = ['USD', 'ARS'];
  const validDisposicion = ['Frente', 'Contrafrente', 'Lateral', 'Interno'];
  const validConfiabilidad = ['Alta', 'Media'];

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
    operacion: row.operacion,
    tipo: row.tipo,
    estado: row.estado,
    precio,
    moneda: row.moneda,
    piso: parseNumber(row.piso),
    imagenes: parseJsonArray(row.imagenes),
    avenida: parseBool(row.avenida),
    direccion: row.direccion || '',
    barrio: row.barrio || '',
    provincia: row.provincia || '',
    latitud: parseNumber(row.latitud),
    longitud: parseNumber(row.longitud),
    ambientes: parseNumber(row.ambientes),
    dormitorios: parseNumber(row.dormitorios) || 0,
    banos: parseNumber(row.banos) || 0,
    m2_totales: parseNumber(row.m2_totales),
    m2_cubiertos: parseNumber(row.m2_cubiertos),
    antiguedad: row.antiguedad || '',
    orientacion: row.orientacion || '',
    disposicion: validDisposicion.includes(row.disposicion) ? row.disposicion : '',
    expensas: parseNumber(row.expensas),
    apto_credito: parseBool(row.apto_credito),
    apto_profesional: parseBool(row.apto_profesional),
    cochera: parseBool(row.cochera),
    apto_mascotas: parseBool(row.apto_mascotas),
    amenities: parseJsonArray(row.amenities),
    portal_original: row.portal_original || '',
    url_original: row.url_original || '',
    confiabilidad: validConfiabilidad.includes(row.confiabilidad) ? row.confiabilidad : '',
    fecha_scraping: parseDate(row.fecha_scraping),
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

    if (rows.length > 0) {
      const firstRow = rows[0];
      const sampleFields = ['id_original', 'tipo', 'operacion', 'estado', 'precio', 'moneda'];
      const sample = sampleFields.map(f => `${f}: "${firstRow[f] || 'MISSING'}"`).join(', ');
      console.log(`First row sample: ${sample}`);
    }

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
            operacion: property.operacion,
            tipo: property.tipo,
            precio: property.precio,
            moneda: property.moneda,
            piso: property.piso,
            imagenes: property.imagenes,
            avenida: property.avenida,
            direccion: property.direccion,
            barrio: property.barrio,
            provincia: property.provincia,
            latitud: property.latitud,
            longitud: property.longitud,
            ambientes: property.ambientes,
            dormitorios: property.dormitorios,
            banos: property.banos,
            m2_totales: property.m2_totales,
            m2_cubiertos: property.m2_cubiertos,
            antiguedad: property.antiguedad,
            orientacion: property.orientacion,
            disposicion: property.disposicion,
            expensas: property.expensas,
            apto_credito: property.apto_credito,
            apto_profesional: property.apto_profesional,
            cochera: property.cochera,
            apto_mascotas: property.apto_mascotas,
            amenities: property.amenities,
            portal_original: property.portal_original,
            url_original: property.url_original,
            confiabilidad: property.confiabilidad,
            fecha_scraping: property.fecha_scraping,
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