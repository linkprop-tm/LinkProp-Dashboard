# Google Sheets Sync - Guía Completa de Configuración

## 📋 Resumen

Este sistema permite sincronizar propiedades desde Google Sheets a Supabase de forma automática, usando una Edge Function que se activa desde n8n.

---

## ✅ Cambios Implementados

### 1. **Migraciones de Base de Datos**

Se aplicaron 3 migraciones:

#### a) Eliminación del campo `titulo`
- **Archivo:** `remove_titulo_from_propiedades.sql`
- **Cambio:** Se eliminó la columna `titulo` de la tabla `propiedades`
- **Impacto:** Las propiedades ahora se identifican por: `tipo + barrio/provincia`
- **Ejemplo:** "Casa en Palermo" en lugar de un título manual

#### b) Adición del campo `estado_manual`
- **Archivo:** `add_estado_manual_to_propiedades.sql`
- **Cambio:** Agregó columna `estado_manual: boolean` (default: false)
- **Propósito:** Proteger cambios manuales de estado de ser sobrescritos por sincronizaciones automáticas
- **Lógica:**
  - `estado_manual = false`: El estado se puede actualizar automáticamente desde Sheets
  - `estado_manual = true`: El estado está protegido (excepto "No disponible")

#### c) Campo `id_original` único y obligatorio
- **Archivo:** `make_id_original_unique_and_required.sql`
- **Cambio:**
  - `id_original` ahora es NOT NULL
  - Constraint UNIQUE para evitar duplicados
- **Propósito:** Identificar propiedades de forma única para sincronización

### 2. **Edge Function: sync-properties-from-sheets**

**Ubicación:** `supabase/functions/sync-properties-from-sheets/index.ts`

**Funcionalidades:**
- ✅ Fetch automático de CSV público desde Google Sheets
- ✅ Parseo y validación de datos
- ✅ Transformación de tipos (booleanos, arrays JSON, números)
- ✅ Lógica inteligente de sincronización (INSERT/UPDATE)
- ✅ Protección de estados manuales
- ✅ Logs detallados
- ✅ Manejo robusto de errores
- ✅ Autenticación con clave secreta

### 3. **Actualizaciones de Código**

- ✅ `database.types.ts`: Actualizado con `estado_manual` y `id_original`, eliminado `titulo`
- ✅ `lib/api/properties.ts`: Nueva función `actualizarEstadoPropiedadManual()`
- ✅ `lib/adapters.ts`: Generación automática de título desde tipo + ubicación
- ✅ `lib/adapters-matching.ts`: Mismo cambio
- ✅ `components/Dashboard.tsx`: Generación dinámica de títulos
- ✅ `components/ClientLayout.tsx`: Generación dinámica de títulos
- ✅ `components/AddPropertyModal.tsx`: Eliminadas referencias a `titulo`

---

## 🔧 Configuración Paso a Paso

### **Paso 1: Configurar Variables en Supabase**

Ve a: **Supabase Dashboard → Settings → Edge Functions → Secrets**

Agrega estas **3 variables**:

```bash
GOOGLE_SHEET_ID=108mc1Yy8RemzHSzmUjmaZSzXXruh0q2UGmAqmw-9m4o
GOOGLE_SHEET_GID=0
SYNC_SECRET_KEY=YksV4azcC25qBhhbLH^y2tJwb$N1k%1RYBqt%Tshedw=
```

✅ **Ya completado** según tu mensaje

---

### **Paso 2: Hacer Público el Google Sheet**

1. Abre tu Google Sheet: https://docs.google.com/spreadsheets/d/108mc1Yy8RemzHSzmUjmaZSzXXruh0q2UGmAqmw-9m4o/edit
2. Haz click en el botón **"Share"** (Compartir)
3. En "General access" selecciona: **"Anyone with the link"**
4. Permisos: **Viewer** (Lector)
5. Guarda los cambios

---

### **Paso 3: Configurar Columnas en Google Sheet**

#### **Fila 1 - Headers (con estos nombres EXACTOS):**

```
A:  id_original
B:  operacion
C:  tipo
D:  estado
E:  precio
F:  moneda
G:  piso
H:  imagenes
I:  avenida
J:  direccion
K:  barrio
L:  provincia
M:  latitud
N:  longitud
O:  ambientes
P:  dormitorios
Q:  banos
R:  m2_totales
S:  m2_cubiertos
T:  antiguedad
U:  orientacion
V:  disposicion
W:  expensas
X:  apto_credito
Y:  apto_profesional
Z:  cochera
AA: apto_mascotas
AB: amenities
AC: portal_original
AD: url_original
AE: confiabilidad
AF: fecha_scraping
```

#### **Fila 2+ - Datos de Ejemplo:**

```
ML-123 | Venta | Casa | Disponible | 150000 | USD | 3 | ['img1.jpg','img2.jpg'] | TRUE | Av. Libertador 1234 | Palermo | CABA | -34.5731 | -58.4270 | 3 | 2 | 1 | 120 | 100 | 5 años | Norte | Frente | 15000 | TRUE | FALSE | TRUE | FALSE | ['Pileta','SUM'] | Mercado Libre | https://... | Alta | 2025-12-07
```

---

### **Paso 4: Formato de Datos**

#### **Campos Booleanos:**
Usa `TRUE` o `FALSE` (nativo de Google Sheets):
- Columnas: `avenida`, `apto_mascotas`, `apto_credito`, `apto_profesional`, `cochera`
- Valores válidos: `TRUE`, `FALSE`, `1`, `0`, vacío (= false)

#### **Campos de Array (JSON):**
Usa formato JSON con comillas simples:
- Columnas: `imagenes`, `amenities`
- Formato: `['valor1', 'valor2', 'valor3']`
- Ejemplos:
  ```
  ['https://imagen1.jpg', 'https://imagen2.jpg']
  ['Pileta', 'SUM', 'Gimnasio', 'Parrilla']
  []  ← array vacío
  ```

#### **Campos Obligatorios:**
- `id_original`: Identificador único (ej: ML-123, ZP-456)
- `tipo`: Casa | Departamento | PH | Local | Oficina | Galpon | Terreno | Comercial
- `operacion`: Venta | Alquiler
- `estado`: Disponible | Reservada | No disponible
- `precio`: Número mayor a 0
- `moneda`: USD | ARS

#### **Campos Nuevos:**
- `piso`: Número entero (1, 2, 3, etc.) o vacío para planta baja/sin dato
- `avenida`: TRUE/FALSE - indica si está en una avenida principal
- `latitud` y `longitud`: Coordenadas geográficas en formato decimal (-34.5731, -58.4270)
- `disposicion`: Frente | Contrafrente | Lateral | Interno (o vacío)
- `confiabilidad`: Alta | Media (o vacío)
- `fecha_scraping`: Fecha en formato YYYY-MM-DD o timestamp ISO 8601

#### **Campos Opcionales:**
Todos los demás campos pueden estar vacíos

---

### **Paso 5: Deploy de Edge Function**

Ejecuta en tu terminal:

```bash
cd /tmp/cc-agent/60719168/project
supabase functions deploy sync-properties-from-sheets
```

**Respuesta esperada:**
```
Deploying function sync-properties-from-sheets...
Function sync-properties-from-sheets deployed successfully!
URL: https://mhfdfnhjdfmescizbzol.supabase.co/functions/v1/sync-properties-from-sheets
```

---

### **Paso 6: Test Manual de la Edge Function**

Prueba que la función funciona correctamente:

```bash
curl -X POST \
  https://mhfdfnhjdfmescizbzol.supabase.co/functions/v1/sync-properties-from-sheets \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZmRmbmhqZGZtZXNjaXpiem9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTI4MjIsImV4cCI6MjA3OTY4ODgyMn0.yLL2ZhNrLzLck5O9mP8l1Q3sFYKFYEYTfDstfUOuLdc" \
  -H "x-sync-secret: YksV4azcC25qBhhbLH^y2tJwb$N1k%1RYBqt%Tshedw=" \
  -H "Content-Type: application/json" \
  -d '{"trigger":"manual_test"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "timestamp": "2025-11-30T12:34:56Z",
  "stats": {
    "total_rows": 5,
    "processed": 5,
    "inserted": 3,
    "updated": 2,
    "skipped": 0,
    "errors": 0
  },
  "execution_time_ms": 1234
}
```

---

### **Paso 7: Configurar n8n**

#### **Agregar nodo HTTP Request al final del workflow:**

**Configuración del Nodo:**

- **Method:** POST
- **URL:** `https://mhfdfnhjdfmescizbzol.supabase.co/functions/v1/sync-properties-from-sheets`
- **Authentication:** None

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZmRmbmhqZGZtZXNjaXpiem9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTI4MjIsImV4cCI6MjA3OTY4ODgyMn0.yLL2ZhNrLzLck5O9mP8l1Q3sFYKFYEYTfDstfUOuLdc",
  "x-sync-secret": "YksV4azcC25qBhhbLH^y2tJwb$N1k%1RYBqt%Tshedw=",
  "Content-Type": "application/json"
}
```

**Body (opcional):**
```json
{
  "trigger": "n8n_workflow",
  "timestamp": "{{$now}}",
  "workflow_id": "{{$execution.id}}"
}
```

**Posición en el workflow:**
- ✅ Último nodo después de actualizar Google Sheet
- ✅ Solo se ejecuta si pasos anteriores fueron exitosos

---

## 🧠 Lógica de Estado Inteligente

### **Tabla de Decisión:**

| Supabase Estado | estado_manual | Sheet Estado | Resultado |
|-----------------|---------------|--------------|-----------|
| Disponible | false | Disponible | ✅ No cambiar |
| Disponible | false | Reservada | ✅ Actualizar a Reservada |
| Disponible | false | No disponible | ✅ Actualizar a No disponible |
| Reservada | **true** | Disponible | 🚫 **NO actualizar** (protegido) |
| Reservada | **true** | Reservada | ✅ No cambiar |
| Reservada | **true** | No disponible | ✅ Actualizar + estado_manual = false |
| No disponible | false | Disponible | ✅ Actualizar a Disponible |
| No disponible | **true** | Disponible | 🚫 **NO actualizar** (protegido) |

### **Regla de Oro:**
> **"No disponible" del Sheet SIEMPRE prevalece sobre cualquier estado manual.**

Esto permite que propiedades vendidas/eliminadas en portales externos se marquen como no disponibles automáticamente.

---

## 🎯 Uso de `actualizarEstadoPropiedadManual()`

Cuando un Admin/Agente cambia el estado manualmente desde la UI:

```typescript
import { actualizarEstadoPropiedadManual } from './lib/api/properties';

// Cambiar a Reservada y proteger de cambios automáticos
await actualizarEstadoPropiedadManual(propertyId, 'Reservada', true);

// Cambiar a Disponible sin protección (permite syncs futuros)
await actualizarEstadoPropiedadManual(propertyId, 'Disponible', false);
```

---

## 📊 Monitoreo y Logs

### **Ver logs en Supabase Dashboard:**

1. Ve a: **Supabase Dashboard → Functions → sync-properties-from-sheets**
2. Click en **Logs**
3. Verás logs como:

```
[2025-11-30T12:34:56Z] Starting sync from Google Sheet: 108mc1Yy8RemzHSzmUjmaZSzXXruh0q2UGmAqmw-9m4o
[2025-11-30T12:34:57Z] CSV fetched successfully, size: 15234 bytes
[2025-11-30T12:34:58Z] Parsed 10 rows from CSV
[2025-11-30T12:35:00Z] Row 2: Inserted new property ML-123
[2025-11-30T12:35:00Z] Row 3: Updated property ZP-456 (estado: Reservada)
[2025-11-30T12:35:01Z] Row 4: Updated property AR-789 (estado protected)
[2025-11-30T12:35:02Z] Sync completed in 3450ms
[2025-11-30T12:35:02Z] Stats: 10 processed, 3 inserted, 7 updated, 0 skipped, 0 errors
```

---

## 🔍 Troubleshooting

### **Error: "Unauthorized - invalid sync secret"**
- ✅ Verifica que `SYNC_SECRET_KEY` esté configurado en Supabase Secrets
- ✅ Verifica que el header `x-sync-secret` en n8n coincida exactamente

### **Error: "Failed to fetch CSV: 403"**
- ✅ Verifica que el Google Sheet sea público (Anyone with the link → Viewer)
- ✅ Prueba abrir la URL manualmente en el navegador:
  ```
  https://docs.google.com/spreadsheets/d/108mc1Yy8RemzHSzmUjmaZSzXXruh0q2UGmAqmw-9m4o/export?format=csv&gid=0
  ```

### **Error: "Tipo inválido: 'Cochera'"**
- ✅ Verifica que el valor de `tipo` sea uno de los válidos
- ✅ Valores válidos: Casa, Departamento, PH, Local, Oficina, Galpon, Terreno, Comercial

### **Error: "id_original es requerido"**
- ✅ Asegúrate de que la columna `id_original` tenga un valor único para cada fila
- ✅ No dejes celdas vacías en esta columna

### **Error: "duplicate key value violates unique constraint"**
- ✅ Tienes un `id_original` duplicado en el Sheet
- ✅ Cada propiedad debe tener un id_original único

---

## 📝 Validaciones Automáticas

La Edge Function valida automáticamente:

- ✅ `id_original`: No vacío
- ✅ `tipo`: Debe ser uno de los 8 tipos válidos
- ✅ `operacion`: Solo Venta o Alquiler
- ✅ `estado`: Solo Disponible, Reservada o No disponible
- ✅ `precio`: Número mayor a 0
- ✅ `moneda`: Solo USD o ARS
- ✅ Arrays JSON: Formato correcto o se convierte a []
- ✅ Booleanos: TRUE/FALSE/1/0 o se convierte a false

**Las filas con errores se registran pero no detienen el proceso.**

---

## 🚀 Workflow Completo

```mermaid
graph LR
    A[n8n detecta cambio] --> B[n8n actualiza Sheet]
    B --> C[n8n llama Edge Function]
    C --> D[Edge Function fetch CSV]
    D --> E[Parse y validar datos]
    E --> F{¿Propiedad existe?}
    F -->|No| G[INSERT nueva]
    F -->|Sí| H{¿Actualizar estado?}
    H -->|Sí| I[UPDATE con estado]
    H -->|No| J[UPDATE sin estado]
    G --> K[Logs y estadísticas]
    I --> K
    J --> K
```

---

## ✨ Ventajas de esta Implementación

1. ✅ **Sin Apps Script:** No necesitas código en Google Apps Script
2. ✅ **Sin Service Account:** No necesitas credenciales de Google Cloud
3. ✅ **Sheet público:** Acceso directo vía CSV export
4. ✅ **Control desde n8n:** Sincronización solo cuando tú quieres
5. ✅ **Protección de cambios manuales:** No se pierden ajustes del admin
6. ✅ **Logs completos:** Visibilidad total de cada operación
7. ✅ **Validaciones robustas:** Errores individuales no detienen el proceso
8. ✅ **Escalable:** Maneja cientos de propiedades sin problema
9. ✅ **Mantenible:** Código limpio y bien documentado

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Supabase Functions Dashboard
2. Verifica que las variables de entorno estén configuradas
3. Prueba la función manualmente con curl
4. Asegúrate de que el Google Sheet sea público

---

**¡Listo para sincronizar! 🎉**
