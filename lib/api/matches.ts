import { obtenerPropiedades } from './properties';
import { obtenerUsuarios, obtenerUsuarioPorId } from './users';
import { calcularMatch, filtrarPropiedadesPorMatch, obtenerUsuariosQueMatchean } from '../matching';
import type { Propiedad, Usuario } from '../database.types';

export interface MatchesParaUsuario {
  usuario: Usuario;
  propiedades_match: Array<Propiedad & {
    porcentaje_match: number;
    criterios_coincidentes: string[];
  }>;
  total_matches: number;
}

export interface MatchesParaPropiedad {
  propiedad: Propiedad;
  usuarios_match: Array<Usuario & {
    porcentaje_match: number;
    criterios_coincidentes: string[];
  }>;
  total_matches: number;
}

export async function obtenerMatchesParaUsuario(
  usuario_id: string,
  porcentaje_minimo: number = 50
): Promise<MatchesParaUsuario> {
  const usuario = await obtenerUsuarioPorId(usuario_id);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  const propiedades = await obtenerPropiedades({ estado: 'Disponible' });
  const propiedades_match = filtrarPropiedadesPorMatch(propiedades, usuario, porcentaje_minimo);

  return {
    usuario,
    propiedades_match,
    total_matches: propiedades_match.length
  };
}

export async function obtenerMatchesParaPropiedad(
  propiedad_id: string,
  porcentaje_minimo: number = 50
): Promise<MatchesParaPropiedad> {
  const propiedades = await obtenerPropiedades();
  const propiedad = propiedades.find(p => p.id === propiedad_id);

  if (!propiedad) {
    throw new Error('Propiedad no encontrada');
  }

  const usuarios = await obtenerUsuarios();
  const usuarios_match = obtenerUsuariosQueMatchean(propiedad, usuarios, porcentaje_minimo);

  return {
    propiedad,
    usuarios_match,
    total_matches: usuarios_match.length
  };
}

export async function calcularMatchIndividual(
  propiedad_id: string,
  usuario_id: string
) {
  const propiedades = await obtenerPropiedades();
  const propiedad = propiedades.find(p => p.id === propiedad_id);

  if (!propiedad) {
    throw new Error('Propiedad no encontrada');
  }

  const usuario = await obtenerUsuarioPorId(usuario_id);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  return calcularMatch(propiedad, usuario);
}

export async function obtenerEstadisticasMatches() {
  const [propiedades, usuarios] = await Promise.all([
    obtenerPropiedades({ estado: 'Disponible' }),
    obtenerUsuarios()
  ]);

  let total_matches = 0;
  let matches_por_propiedad: Record<string, number> = {};
  let matches_por_usuario: Record<string, number> = {};

  for (const propiedad of propiedades) {
    matches_por_propiedad[propiedad.id] = 0;

    for (const usuario of usuarios) {
      const match = calcularMatch(propiedad, usuario);

      if (match.porcentaje >= 50) {
        total_matches++;
        matches_por_propiedad[propiedad.id]++;
        matches_por_usuario[usuario.id] = (matches_por_usuario[usuario.id] || 0) + 1;
      }
    }
  }

  const promedio_matches_por_propiedad = propiedades.length > 0
    ? total_matches / propiedades.length
    : 0;

  const promedio_matches_por_usuario = usuarios.length > 0
    ? total_matches / usuarios.length
    : 0;

  return {
    total_matches,
    total_propiedades: propiedades.length,
    total_usuarios: usuarios.length,
    promedio_matches_por_propiedad: Math.round(promedio_matches_por_propiedad * 10) / 10,
    promedio_matches_por_usuario: Math.round(promedio_matches_por_usuario * 10) / 10,
    matches_por_propiedad,
    matches_por_usuario
  };
}
