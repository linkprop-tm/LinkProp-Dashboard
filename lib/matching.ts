import type { Propiedad, Usuario } from './database.types';
import { expandNeighborhoods } from './neighborhoods';

export interface MatchScore {
  porcentaje: number;
  criterios_coincidentes: string[];
}

export function cumpleFiltrosObligatorios(propiedad: Propiedad, usuario: Usuario): boolean {
  if (usuario.preferencias_tipo && usuario.preferencias_tipo.length > 0) {
    if (!usuario.preferencias_tipo.includes(propiedad.tipo)) {
      return false;
    }
  }

  if (usuario.preferencias_operacion) {
    if (usuario.preferencias_operacion !== propiedad.operacion) {
      return false;
    }
  }

  if (usuario.preferencias_apto_credito === true) {
    if (propiedad.apto_credito !== true) {
      return false;
    }
  }

  if (usuario.preferencias_apto_profesional === true) {
    if (propiedad.apto_profesional !== true) {
      return false;
    }
  }

  if (usuario.preferencias_operacion === 'Alquiler' && usuario.preferencias_apto_mascotas === true) {
    if (propiedad.apto_mascotas !== true) {
      return false;
    }
  }

  return true;
}

export function calcularMatch(propiedad: Propiedad, usuario: Usuario): MatchScore {
  const criterios_coincidentes: string[] = [];
  let puntos_obtenidos = 0;
  const PUNTOS_TOTALES = 100;

  const PUNTOS_PRECIO = 30;
  if (usuario.preferencias_precio_min !== null || usuario.preferencias_precio_max !== null) {
    const precio_min = usuario.preferencias_precio_min ?? 0;
    const precio_max = usuario.preferencias_precio_max ?? Infinity;

    if (propiedad.precio >= precio_min && propiedad.precio <= precio_max) {
      puntos_obtenidos += PUNTOS_PRECIO;
      criterios_coincidentes.push('Precio dentro del rango');
    } else if (propiedad.precio > precio_max) {
      const exceso_porcentaje = (propiedad.precio - precio_max) / precio_max;

      if (exceso_porcentaje <= 0.05) {
        puntos_obtenidos += PUNTOS_PRECIO * 0.75;
        criterios_coincidentes.push('Precio ligeramente por encima');
      } else if (exceso_porcentaje <= 0.10) {
        puntos_obtenidos += PUNTOS_PRECIO * 0.5;
        criterios_coincidentes.push('Precio moderadamente por encima');
      } else if (exceso_porcentaje <= 0.20) {
        puntos_obtenidos += PUNTOS_PRECIO * 0.25;
      } else if (exceso_porcentaje <= 0.30) {
        puntos_obtenidos += PUNTOS_PRECIO * 0.10;
      }
    } else if (propiedad.precio < precio_min) {
      const deficit_porcentaje = (precio_min - propiedad.precio) / precio_min;

      if (deficit_porcentaje <= 0.10) {
        puntos_obtenidos += PUNTOS_PRECIO * 0.85;
        criterios_coincidentes.push('Precio ligeramente por debajo');
      } else if (deficit_porcentaje <= 0.20) {
        puntos_obtenidos += PUNTOS_PRECIO * 0.70;
      } else {
        puntos_obtenidos += PUNTOS_PRECIO * 0.50;
      }
    }
  }

  const PUNTOS_BARRIO = 25;
  if (usuario.preferencias_ubicacion && usuario.preferencias_ubicacion.length > 0) {
    const ubicacionCompleta = `${propiedad.direccion} ${propiedad.barrio} ${propiedad.provincia}`.toLowerCase();
    const expandedNeighborhoods = expandNeighborhoods(usuario.preferencias_ubicacion);
    const ubicacion_match = expandedNeighborhoods.some(loc =>
      ubicacionCompleta.includes(loc.toLowerCase())
    );
    if (ubicacion_match) {
      puntos_obtenidos += PUNTOS_BARRIO;
      criterios_coincidentes.push('Ubicación');
    }
  }

  const PUNTOS_AMBIENTES = 20;
  if (usuario.preferencias_ambientes) {
    const ambientes_preferidos = usuario.preferencias_ambientes;

    if (ambientes_preferidos.includes('+')) {
      const min_ambientes = parseInt(ambientes_preferidos.replace('+', ''));
      if (propiedad.ambientes >= min_ambientes) {
        puntos_obtenidos += PUNTOS_AMBIENTES;
        criterios_coincidentes.push('Ambientes');
      } else if (propiedad.ambientes === min_ambientes - 1) {
        puntos_obtenidos += PUNTOS_AMBIENTES * 0.60;
      } else if (propiedad.ambientes === min_ambientes - 2) {
        puntos_obtenidos += PUNTOS_AMBIENTES * 0.25;
      }
    } else {
      const ambientes_exactos = parseInt(ambientes_preferidos);
      if (propiedad.ambientes === ambientes_exactos) {
        puntos_obtenidos += PUNTOS_AMBIENTES;
        criterios_coincidentes.push('Ambientes');
      } else if (Math.abs(propiedad.ambientes - ambientes_exactos) === 1) {
        puntos_obtenidos += PUNTOS_AMBIENTES * 0.60;
        criterios_coincidentes.push('Ambientes cercanos');
      } else if (Math.abs(propiedad.ambientes - ambientes_exactos) === 2) {
        puntos_obtenidos += PUNTOS_AMBIENTES * 0.25;
      }
    }
  }

  const PUNTOS_M2 = 15;
  if (usuario.preferencias_m2_min !== null && propiedad.m2_totales !== null) {
    if (propiedad.m2_totales >= usuario.preferencias_m2_min) {
      puntos_obtenidos += PUNTOS_M2;
      criterios_coincidentes.push('M2 totales');
    } else {
      const deficit_porcentaje = (usuario.preferencias_m2_min - propiedad.m2_totales) / usuario.preferencias_m2_min;

      if (deficit_porcentaje <= 0.05) {
        puntos_obtenidos += PUNTOS_M2 * 0.80;
        criterios_coincidentes.push('M2 ligeramente menor');
      } else if (deficit_porcentaje <= 0.10) {
        puntos_obtenidos += PUNTOS_M2 * 0.60;
      } else if (deficit_porcentaje <= 0.20) {
        puntos_obtenidos += PUNTOS_M2 * 0.30;
      }
    }
  }

  const PUNTOS_COCHERA = 5;
  if (usuario.preferencias_cochera === true) {
    if (propiedad.cochera === true) {
      puntos_obtenidos += PUNTOS_COCHERA;
      criterios_coincidentes.push('Cochera');
    }
  }

  const PUNTOS_AMENITIES = 3;
  if (usuario.preferencias_amenities && usuario.preferencias_amenities.length > 0 && propiedad.amenities && propiedad.amenities.length > 0) {
    const amenities_coincidentes = usuario.preferencias_amenities.filter(amenity =>
      propiedad.amenities.some(pa => pa.toLowerCase() === amenity.toLowerCase())
    );
    const porcentaje_amenities = amenities_coincidentes.length / usuario.preferencias_amenities.length;
    puntos_obtenidos += PUNTOS_AMENITIES * porcentaje_amenities;

    if (porcentaje_amenities > 0) {
      criterios_coincidentes.push('Amenities');
    }
  }

  const PUNTOS_ANTIGUEDAD = 2;
  if (usuario.preferencias_antiguedad && usuario.preferencias_antiguedad.length > 0 && propiedad.antiguedad) {
    const antiguedad_match = usuario.preferencias_antiguedad.some(ant =>
      ant.toLowerCase() === propiedad.antiguedad.toLowerCase()
    );
    if (antiguedad_match) {
      puntos_obtenidos += PUNTOS_ANTIGUEDAD;
      criterios_coincidentes.push('Antigüedad');
    }
  }

  const porcentaje = Math.round((puntos_obtenidos / PUNTOS_TOTALES) * 100);

  return {
    porcentaje,
    criterios_coincidentes
  };
}

export function filtrarPropiedadesPorMatch(
  propiedades: Propiedad[],
  usuario: Usuario,
  porcentaje_minimo: number = 70
): Array<Propiedad & { porcentaje_match: number; criterios_coincidentes: string[] }> {
  return propiedades
    .filter(propiedad => cumpleFiltrosObligatorios(propiedad, usuario))
    .map(propiedad => {
      const match = calcularMatch(propiedad, usuario);
      return {
        ...propiedad,
        porcentaje_match: match.porcentaje,
        criterios_coincidentes: match.criterios_coincidentes
      };
    })
    .filter(item => item.porcentaje_match >= porcentaje_minimo)
    .sort((a, b) => b.porcentaje_match - a.porcentaje_match);
}

export function contarMatchesPorPropiedad(
  propiedad: Propiedad,
  usuarios: Usuario[],
  porcentaje_minimo: number = 50
): number {
  return usuarios.filter(usuario => {
    const match = calcularMatch(propiedad, usuario);
    return match.porcentaje >= porcentaje_minimo;
  }).length;
}

export function obtenerUsuariosQueMatchean(
  propiedad: Propiedad,
  usuarios: Usuario[],
  porcentaje_minimo: number = 50
): Array<Usuario & { porcentaje_match: number; criterios_coincidentes: string[] }> {
  return usuarios
    .map(usuario => {
      const match = calcularMatch(propiedad, usuario);
      return {
        ...usuario,
        porcentaje_match: match.porcentaje,
        criterios_coincidentes: match.criterios_coincidentes
      };
    })
    .filter(item => item.porcentaje_match >= porcentaje_minimo)
    .sort((a, b) => b.porcentaje_match - a.porcentaje_match);
}
