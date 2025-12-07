# Sincronización con Google Sheets

Este documento explica cómo usar la funcionalidad de sincronización automática entre Google Sheets y la base de datos de propiedades.

## Descripción General

La aplicación incluye una Edge Function de Supabase que importa datos de propiedades desde una hoja de cálculo de Google Sheets directamente a la base de datos. Esta función permite mantener sincronizados los datos de propiedades que provienen de scraping u otras fuentes externas.

## Configuración Inicial

### 1. Configurar Variables de Entorno en Supabase

Debes configurar las siguientes variables de entorno en tu proyecto de Supabase:

#### Variables Requeridas:

1. **GOOGLE_SHEET_ID**: El ID de tu hoja de cálculo de Google
   - Se encuentra en la URL: `https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit`
   - Ejemplo: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

2. **GOOGLE_SHEET_GID**: El ID de la pestaña específica (opcional, por defecto: 0)
   - Para la primera pestaña: `0`
   - Para otras pestañas, encuentra el GID en la URL: `#gid=[NUMERO]`

3. **SYNC_SECRET_KEY**: Una clave secreta para proteger el endpoint
   - Genera una clave segura (puedes usar: `openssl rand -base64 32`)
   - Ejemplo: `tu-clave-secreta-muy-segura-123456`

#### Cómo agregar estas variables en Supabase:

1. Ve a tu Dashboard de Supabase
2. Selecciona tu proyecto
3. Ve a "Settings" > "Edge Functions"
4. Agrega las variables en la sección "Secrets"

### 2. Hacer Pública tu Hoja de Google Sheets

Para que la sincronización funcione, tu hoja de Google Sheets debe ser accesible públicamente:

1. Abre tu hoja de Google Sheets
2. Haz clic en "Compartir" en la esquina superior derecha
3. Cambia la configuración a "Cualquier persona con el enlace puede ver"
4. Copia el enlace

## Estructura de la Hoja de Google Sheets

Tu hoja debe tener las siguientes columnas en el orden especificado (la primera fila debe contener los nombres de las columnas):

### Orden de Columnas (IMPORTANTE):

Las columnas deben estar en este orden exacto:

1. `id_original`
2. `operacion`
3. `tipo`
4. `estado`
5. `precio`
6. `moneda`
7. `piso`
8. `imagenes`
9. `avenida`
10. `direccion`
11. `barrio`
12. `provincia`
13. `latitud`
14. `longitud`
15. `ambientes`
16. `dormitorios`
17. `banos`
18. `m2_totales`
19. `m2_cubiertos`
20. `antiguedad`
21. `orientacion`
22. `disposicion`
23. `expensas`
24. `apto_credito`
25. `apto_profesional`
26. `cochera`
27. `apto_mascotas`
28. `amenities`
29. `portal_original`
30. `url_original`
31. `confiabilidad`
32. `fecha_scraping`

### Descripción de Columnas:

| Columna | Tipo | Descripción | Valores Válidos |
|---------|------|-------------|-----------------|
| `id_original` | Texto | ID único de la propiedad | Cualquier texto único |
| `operacion` | Texto | Tipo de operación | `Venta`, `Alquiler` |
| `tipo` | Texto | Tipo de propiedad | `Casa`, `Departamento`, `PH`, `Local`, `Oficina`, `Galpon`, `Terreno`, `Comercial` |
| `estado` | Texto | Estado de la propiedad | `Disponible`, `Reservada`, `No disponible` |
| `precio` | Número | Precio de la propiedad | Mayor a 0 |
| `moneda` | Texto | Moneda del precio | `USD`, `ARS` |
| `piso` | Número | Número de piso | Vacío o número ≥ 0 |
| `imagenes` | Array JSON | URLs de imágenes | `["url1", "url2"]` o vacío: `[]` |
| `avenida` | Booleano | Si está en avenida | `TRUE`, `FALSE`, `1`, `0`, `SI`, `YES` |
| `direccion` | Texto | Dirección completa | Cualquier texto |
| `barrio` | Texto | Barrio | Cualquier texto |
| `provincia` | Texto | Provincia | Cualquier texto |
| `latitud` | Número | Latitud | Entre -55 y -21 (rango Argentina) |
| `longitud` | Número | Longitud | Entre -73 y -53 (rango Argentina) |
| `ambientes` | Número | Cantidad de ambientes | Vacío o número ≥ 0 |
| `dormitorios` | Número | Cantidad de dormitorios | Vacío o número ≥ 0 |
| `banos` | Número | Cantidad de baños | Vacío o número ≥ 0 |
| `m2_totales` | Número | Metros cuadrados totales | Vacío o número ≥ 0 |
| `m2_cubiertos` | Número | Metros cuadrados cubiertos | Vacío o número ≥ 0 |
| `antiguedad` | Texto | Antigüedad del inmueble | `A estrenar`, `Hasta 5 años`, etc. |
| `orientacion` | Texto | Orientación | `Norte`, `Sur`, `Este`, `Oeste`, etc. |
| `disposicion` | Texto | Disposición | `Frente`, `Contrafrente`, `Lateral`, `Interno` |
| `expensas` | Número | Monto de expensas | Vacío o número ≥ 0 |
| `apto_credito` | Booleano | Apto crédito | `TRUE`, `FALSE`, `1`, `0` |
| `apto_profesional` | Booleano | Apto uso profesional | `TRUE`, `FALSE`, `1`, `0` |
| `cochera` | Booleano | Tiene cochera | `TRUE`, `FALSE`, `1`, `0` |
| `apto_mascotas` | Booleano | Acepta mascotas | `TRUE`, `FALSE`, `1`, `0` |
| `amenities` | Array JSON | Lista de amenities | `["Pileta", "Gimnasio"]` o `[]` |
| `portal_original` | Texto | Portal de origen | `Zonaprop`, `Mercado Libre`, etc. |
| `url_original` | Texto | URL de la publicación | URL completa |
| `confiabilidad` | Texto | Nivel de confianza | `Alta`, `Media` |
| `fecha_scraping` | Fecha | Fecha del scraping | Formato ISO: `2024-01-15T10:30:00Z` |

**Nota**: Las columnas vacías al final de cada fila son permitidas. No es necesario llenar todas las columnas si no tienes los datos.

### Ejemplo de Fila de Datos:

```
id_original: ML-12345
operacion: Venta
tipo: Departamento
estado: Disponible
precio: 150000
moneda: USD
piso: 5
imagenes: ["https://ejemplo.com/img1.jpg", "https://ejemplo.com/img2.jpg"]
avenida: FALSE
direccion: Av. Corrientes 1234
barrio: Balvanera
provincia: Buenos Aires
latitud: -34.6037
longitud: -58.3816
ambientes: 3
dormitorios: 2
banos: 1
m2_totales: 65
m2_cubiertos: 60
antiguedad: Hasta 5 años
orientacion: Norte
disposicion: Frente
expensas: 15000
apto_credito: TRUE
apto_profesional: FALSE
cochera: TRUE
apto_mascotas: TRUE
amenities: ["Pileta", "SUM", "Gimnasio"]
portal_original: Mercado Libre
url_original: https://inmueble.mercadolibre.com.ar/MLA-12345
confiabilidad: Alta
fecha_scraping: 2024-12-07T10:30:00Z
```

## Cómo Usar la Sincronización

### Desde la Interfaz Web:

1. Inicia sesión como administrador o agente
2. Ve a la página de "Propiedades"
3. Haz clic en el botón "Sincronizar" en la parte superior derecha
4. Ingresa el `SYNC_SECRET_KEY` cuando se te solicite
5. Espera a que termine la sincronización
6. Verás un resumen con las estadísticas:
   - Propiedades insertadas (nuevas)
   - Propiedades actualizadas
   - Propiedades omitidas
   - Errores encontrados

### Lógica de Sincronización:

La sincronización sigue estas reglas:

1. **Propiedades Nuevas**: Si el `id_original` no existe en la base de datos, se inserta como nueva propiedad

2. **Propiedades Existentes**: Si el `id_original` ya existe:
   - Se actualizan todos los campos EXCEPTO el estado en ciertos casos
   - El campo `estado` se actualiza solo si:
     - El estado en Google Sheets es "No disponible" (siempre se actualiza)
     - O el `estado_manual` es `false` (no fue modificado manualmente por un admin)
     - O el `estado_manual` es `true` pero el nuevo estado NO es "Disponible"

3. **Protección de Estados Manuales**:
   - Si un admin marca manualmente una propiedad como "Reservada" o "No disponible", la sincronización respetará ese estado
   - Solo si el scraping detecta que la propiedad ya no está disponible ("No disponible"), se actualizará el estado

## Validaciones

La función valida los datos antes de insertarlos o actualizarlos. Si encuentra errores, los reporta en el resumen final. Los errores comunes incluyen:

- `id_original` vacío o faltante
- Tipo de propiedad inválido
- Operación inválida (debe ser Venta o Alquiler)
- Estado inválido
- Precio menor o igual a 0
- Moneda inválida

## Solución de Problemas

### Error: "Unauthorized - invalid sync secret"
- Verifica que estés ingresando el `SYNC_SECRET_KEY` correcto
- Confirma que la variable está configurada en Supabase

### Error: "Failed to fetch CSV"
- Verifica que el `GOOGLE_SHEET_ID` sea correcto
- Asegúrate de que la hoja sea pública (puede ser vista por cualquiera con el enlace)
- Verifica que el `GOOGLE_SHEET_GID` corresponda a la pestaña correcta

### Errores de Validación en Filas
- Revisa el modal de resultados que muestra qué filas tienen errores
- Cada error indica la fila, el campo problemático y la razón
- Corrige los datos en Google Sheets y vuelve a sincronizar

### Propiedades no se Actualizan
- Verifica si el estado fue modificado manualmente (campo `estado_manual = true`)
- Esto es intencional para proteger cambios manuales de los administradores

## Seguridad

- La Edge Function está protegida con un `SYNC_SECRET_KEY`
- Solo los administradores pueden ejecutar la sincronización desde la interfaz
- Se validan todos los datos antes de insertarlos en la base de datos
- Las políticas RLS (Row Level Security) de Supabase protegen el acceso a los datos

## Rendimiento

- La sincronización procesa las propiedades una por una para mantener la integridad
- Se registran logs detallados en la consola de Supabase
- Se reporta el tiempo de ejecución total al finalizar
- Para hojas con muchas propiedades (>1000), la sincronización puede tomar varios segundos

## Monitoreo

Puedes ver los logs de la sincronización en:
1. Dashboard de Supabase > "Edge Functions" > "sync-properties-from-sheets" > "Logs"
2. Los logs incluyen:
   - Inicio de sincronización
   - Cada fila procesada (insertada/actualizada/error)
   - Resumen final con estadísticas
   - Tiempo de ejecución

## Automatización (Opcional)

Si deseas automatizar la sincronización periódica, puedes:

1. Usar un servicio cron que llame al endpoint:
   ```bash
   curl -X POST \
     https://[TU-PROYECTO].supabase.co/functions/v1/sync-properties-from-sheets \
     -H "x-sync-secret: tu-clave-secreta"
   ```

2. Configurar un webhook desde Google Sheets (requiere Apps Script)

3. Usar n8n o Zapier para crear flujos automáticos

## Contacto y Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.
