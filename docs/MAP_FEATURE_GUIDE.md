# Guía de la Funcionalidad de Mapa Interactivo

## Descripción General

Se ha implementado un mapa interactivo en la aplicación LinkProp que permite visualizar propiedades geográficamente y filtrarlas dibujando áreas personalizadas en el mapa.

## Características Implementadas

### 1. Vista de Mapa
- **Acceso**: Botón de mapa en la barra de herramientas de Propiedades (junto a los botones de vista Grid y Lista)
- **Tecnología**: React Leaflet + OpenStreetMap (100% gratuito, sin API keys)
- **Características**:
  - Marcadores personalizados por tipo de propiedad
  - Clustering automático para agrupar propiedades cercanas
  - Pop-ups informativos al hacer click en marcadores
  - Zoom y navegación fluida

### 2. Herramienta de Dibujo
- **Formas disponibles**:
  - Polígono libre (dibujar área personalizada)
  - Rectángulo (área rectangular)
  - Círculo (radio desde punto central)
- **Edición**: Posibilidad de editar vértices del área dibujada
- **Eliminación**: Botón para eliminar el área dibujada

### 3. Filtrado por Área
- **Automático**: Al completar el dibujo, las propiedades se filtran automáticamente
- **Contador**: Muestra "X propiedades en área seleccionada"
- **Visual**: Solo los marcadores dentro del área permanecen visibles
- **Limpieza**: Botón "Limpiar Área" para remover el filtro

### 4. Persistencia de Sesión
- **localStorage**: El área dibujada se guarda automáticamente
- **Recuperación**: Al recargar la página, el área se restaura
- **Posición**: Se guarda también el centro del mapa y nivel de zoom

### 5. Geolocalización de Propiedades
- **Columnas nuevas en BD**: `latitud` y `longitud` (nullable)
- **Validación**: Solo coordenadas válidas para Argentina (-55 a -21 lat, -73 a -53 lng)
- **Índice**: Índice compuesto para búsquedas eficientes

## Uso del Sistema

### Para Usuarios (Frontend)

1. **Ver propiedades en el mapa**:
   - Ir a sección "Propiedades"
   - Hacer click en el botón del mapa (icono de pin)
   - El mapa carga con todas las propiedades que tengan coordenadas

2. **Filtrar por área**:
   - Click en herramienta de dibujo (arriba a la derecha del mapa)
   - Seleccionar: Polígono, Rectángulo o Círculo
   - Dibujar el área deseada con el mouse
   - El filtro se aplica automáticamente
   - Ver contador de propiedades filtradas en panel superior

3. **Editar área dibujada**:
   - Click en herramienta "Edit layers"
   - Arrastrar vértices del polígono
   - Click "Save" para aplicar cambios

4. **Limpiar filtro**:
   - Click en botón "Limpiar Área" en panel de control
   - O click en "Delete layers" y eliminar el área

5. **Ver detalles de propiedad**:
   - Click en cualquier marcador
   - Se muestra pop-up con información resumida
   - Click en el marcador abre el modal de detalles completos

### Para Administradores (Google Sheets)

1. **Agregar coordenadas a propiedades**:
   - Agregar columnas opcionales al Sheet: `latitud` y `longitud`
   - Si se incluyen, las propiedades se mostrarán en el mapa automáticamente
   - Si no se incluyen, las propiedades no aparecerán en vista de mapa (solo en lista/grid)

2. **Formato de coordenadas**:
   - Latitud: número decimal entre -55 y -21 (ej: -34.6037)
   - Longitud: número decimal entre -73 y -53 (ej: -58.3816)
   - Dejar vacío si no se conoce la ubicación exacta

3. **Ejemplos de coordenadas para Buenos Aires**:
   - Palermo: lat: -34.5833, lng: -58.4167
   - Recoleta: lat: -34.5875, lng: -58.3917
   - Puerto Madero: lat: -34.6118, lng: -58.3623
   - Belgrano: lat: -34.5631, lng: -58.4583

## Servicios de Geocodificación

### Servicio Incluido
- **Nominatim API**: Servicio gratuito de OpenStreetMap
- **Rate limit**: 1 request por segundo (automático)
- **Caché**: Los resultados se cachean en memoria para evitar requests duplicados

### Función de Geocodificación
```typescript
import { geocodeAddress } from '../lib/geocoding';

const result = await geocodeAddress(
  'Av. Corrientes 1234',
  'Balvanera',
  'Buenos Aires'
);

if (result) {
  console.log(result.lat, result.lng, result.address);
}
```

### API de Propiedades (Nuevas funciones)
```typescript
// Actualizar coordenadas de una propiedad
await actualizarCoordenadasPropiedad('propiedad-id', -34.6037, -58.3816);

// Obtener solo propiedades con coordenadas
const propiedadesConMapa = await obtenerPropiedadesConCoordenadas();

// Obtener propiedades sin coordenadas
const propiedadesSinMapa = await obtenerPropiedadesSinCoordenadas();
```

## Arquitectura Técnica

### Componentes Principales

1. **PropertyMap.tsx**
   - Componente principal del mapa
   - Maneja marcadores, clustering, posición
   - Lazy loading para optimización

2. **PropertyMarker.tsx**
   - Marcadores individuales con iconos personalizados
   - Pop-ups con información de la propiedad
   - Colores según estado (Disponible, Reservada, etc.)

3. **DrawControl.tsx**
   - Integración con Leaflet Draw
   - Manejo de eventos de dibujo/edición/eliminación
   - Conversión de círculos a polígonos para filtrado

4. **MapControlPanel.tsx**
   - Panel de control con contador y botones
   - Toggle entre vistas (Lista/Grid/Mapa)
   - Botón de limpiar área

5. **useMapFilter.ts**
   - Hook personalizado para lógica de filtrado
   - Algoritmo point-in-polygon para detección
   - Gestión de estado del polígono dibujado

### Utilidades Geográficas (lib/geo-utils.ts)

- `isPointInPolygon()`: Detecta si coordenada está dentro de polígono (ray-casting)
- `getDistanceBetweenPoints()`: Calcula distancia entre coordenadas (Haversine)
- `getBoundsFromPolygon()`: Obtiene límites de un polígono
- `isValidCoordinate()`: Valida coordenadas para Argentina
- `saveDrawnArea()`, `loadDrawnArea()`, `clearDrawnArea()`: Persistencia en localStorage

## Base de Datos

### Migración Aplicada
- **Archivo**: `add_geolocation_to_propiedades.sql`
- **Columnas agregadas**:
  - `latitud NUMERIC(10, 7)` - Nullable
  - `longitud NUMERIC(10, 7)` - Nullable
- **Índice**: `idx_propiedades_coordinates` en (latitud, longitud)
- **Constraints**: Validación de rango para Argentina

### Edge Function Actualizada
- **sync-properties-from-sheets**: Ahora lee columnas opcionales `latitud` y `longitud`
- Valida rangos automáticamente
- Si no están en el Sheet, quedan como NULL

## Testing Manual

### Propiedades de Prueba con Coordenadas

Para probar el mapa, puedes insertar propiedades de prueba con estas coordenadas:

```sql
-- Insertar propiedad en Palermo
UPDATE propiedades
SET latitud = -34.5833, longitud = -58.4167
WHERE id = 'tu-propiedad-id';

-- Insertar propiedad en Recoleta
UPDATE propiedades
SET latitud = -34.5875, longitud = -58.3917
WHERE id = 'tu-propiedad-id';

-- Insertar propiedad en Puerto Madero
UPDATE propiedades
SET latitud = -34.6118, longitud = -58.3623
WHERE id = 'tu-propiedad-id';
```

### Flujo de Testing

1. Agregar coordenadas a al menos 3 propiedades (diferentes barrios)
2. Ir a vista de Propiedades
3. Click en botón de mapa
4. Verificar que aparecen los 3 marcadores
5. Dibujar un polígono que incluya solo 2 marcadores
6. Verificar contador: "2 propiedades en área seleccionada"
7. Click en "Limpiar Área"
8. Verificar que vuelven a aparecer las 3 propiedades
9. Recargar página
10. Verificar que el área dibujada se restauró

## Próximos Pasos Sugeridos

### Mejoras Opcionales

1. **Geocodificación Automática**:
   - Script batch para geocodificar propiedades existentes
   - Integrar geocodificación en formulario de creación

2. **Búsquedas Guardadas**:
   - Guardar áreas dibujadas en BD vinculadas a usuario
   - Lista de búsquedas guardadas para recuperar rápidamente

3. **Mapa de Calor**:
   - Visualizar densidad de propiedades
   - Identificar zonas con más oferta

4. **Radio de Búsqueda**:
   - Herramienta para buscar en X km desde un punto
   - Útil para buscar propiedades cerca de una dirección específica

5. **Capas Adicionales**:
   - Toggle para mostrar/ocultar por tipo de propiedad
   - Filtro por rango de precios visible en mapa

6. **Mobile Optimization**:
   - Mejorar controles de dibujo para touch
   - Panel lateral colapsable en mobile

## Solución de Problemas

### El mapa no carga
- Verificar que hay propiedades con coordenadas válidas
- Revisar consola del navegador por errores
- Verificar conexión a internet (tiles de OpenStreetMap)

### Los marcadores no aparecen
- Verificar que las propiedades tienen `latitud` y `longitud` no nulos
- Verificar que las coordenadas están en rango válido para Argentina
- Revisar RLS policies en Supabase

### El filtro no funciona
- Verificar que el área se dibujó completamente (cerrar polígono)
- Revisar consola por errores en algoritmo point-in-polygon
- Probar limpiar localStorage y dibujar nuevamente

### El área no persiste
- Verificar permisos de localStorage en el navegador
- Revisar que no está en modo incógnito
- Verificar que no hay errors en consola

## Créditos y Tecnologías

- **React Leaflet**: Biblioteca de mapas para React
- **Leaflet**: Biblioteca de mapas interactivos de código abierto
- **Leaflet Draw**: Plugin para herramientas de dibujo
- **OpenStreetMap**: Proveedor de tiles de mapa gratuito
- **Nominatim**: Servicio de geocodificación gratuito
- **React Leaflet Cluster**: Plugin para clustering de marcadores
