import type { Propiedad, Usuario } from './database.types';

export interface MatchScore {
  porcentaje: number;
  criterios_coincidentes: string[];
}

export function calcularMatch(propiedad: Propiedad, usuario: Usuario): MatchScore {
  const criterios_coincidentes: string[] = [];
  let puntos_totales = 0;
  let puntos_obtenidos = 0;

  if (usuario.preferencias_tipo && usuario.preferencias_tipo.length > 0) {
    puntos_totales += 20;
    if (usuario.preferencias_tipo.includes(propiedad.tipo)) {
      puntos_obtenidos += 20;
      criterios_coincidentes.push('Tipo de propiedad');
    }
  }

  if (usuario.preferencias_operacion) {
    puntos_totales += 20;
    if (usuario.preferencias_operacion === propiedad.operacion) {
      puntos_obtenidos += 20;
      criterios_coincidentes.push('Tipo de operación');
    }
  }

  if (usuario.preferencias_precio_min !== null || usuario.preferencias_precio_max !== null) {
    puntos_totales += 20;
    const precio_min_ok = usuario.preferencias_precio_min === null || propiedad.precio >= usuario.preferencias_precio_min;
    const precio_max_ok = usuario.preferencias_precio_max === null || propiedad.precio <= usuario.preferencias_precio_max;

    if (precio_min_ok && precio_max_ok) {
      puntos_obtenidos += 20;
      criterios_coincidentes.push('Rango de precio');
    }
  }

  if (usuario.preferencias_ubicacion && usuario.preferencias_ubicacion.length > 0) {
    puntos_totales += 20;
    const ubicacionCompleta = `${propiedad.direccion} ${propiedad.barrio} ${propiedad.provincia}`.toLowerCase();
    const ubicacion_match = usuario.preferencias_ubicacion.some(loc =>
      ubicacionCompleta.includes(loc.toLowerCase())
    );
    if (ubicacion_match) {
      puntos_obtenidos += 20;
      criterios_coincidentes.push('Ubicación');
    }
  }

  if (usuario.preferencias_dormitorios_min !== null) {
    puntos_totales += 10;
    if (propiedad.dormitorios >= usuario.preferencias_dormitorios_min) {
      puntos_obtenidos += 10;
      criterios_coincidentes.push('Dormitorios');
    }
  }

  if (usuario.preferencias_banos_min !== null) {
    puntos_totales += 10;
    if (propiedad.banos >= usuario.preferencias_banos_min) {
      puntos_obtenidos += 10;
      criterios_coincidentes.push('Baños');
    }
  }

  const porcentaje = puntos_totales > 0 ? Math.round((puntos_obtenidos / puntos_totales) * 100) : 0;

  return {
    porcentaje,
    criterios_coincidentes
  };
}

export function filtrarPropiedadesPorMatch(
  propiedades: Propiedad[],
  usuario: Usuario,
  porcentaje_minimo: number = 50
): Array<Propiedad & { porcentaje_match: number; criterios_coincidentes: string[] }> {
  return propiedades
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
