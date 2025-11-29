import { supabase } from '../supabase';
import type { PropiedadUsuario, EtapaRelacion, Propiedad, Usuario } from '../database.types';

export interface CreateRelacionData {
  propiedad_id: string;
  usuario_id: string;
  etapa?: EtapaRelacion;
  nota_agente?: string;
}

export interface UsuarioInteresado {
  usuario: Usuario;
  relacion_id: string;
  fecha_interes: string;
  propiedad_id: string;
}

export interface PropiedadConInteresados {
  propiedad: Propiedad;
  interesados: UsuarioInteresado[];
}

export interface VisitanteInfo {
  usuario: Usuario;
  relacion_id: string;
  fecha_visita: string;
  propiedad_id: string;
  calificacion: number | null;
  comentario_compartido: string;
  nota_agente: string;
}

export interface PropiedadConVisitantes {
  propiedad: Propiedad;
  visitantes: VisitanteInfo[];
}

export interface UpdateRelacionData {
  id: string;
  etapa?: EtapaRelacion;
  calificacion?: number;
  comentario_compartido?: string;
  nota_agente?: string;
}

export async function crearRelacion(data: CreateRelacionData) {
  const { data: relacion, error } = await supabase
    .from('propiedades_usuarios')
    .insert([data])
    .select()
    .maybeSingle();

  if (error) throw error;
  return relacion as PropiedadUsuario;
}

export async function obtenerRelacion(propiedad_id: string, usuario_id: string) {
  const { data, error } = await supabase
    .from('propiedades_usuarios')
    .select('*')
    .eq('propiedad_id', propiedad_id)
    .eq('usuario_id', usuario_id)
    .maybeSingle();

  if (error) throw error;
  return data as PropiedadUsuario | null;
}

export async function actualizarRelacion(data: UpdateRelacionData) {
  const { id, ...updateData } = data;

  const { data: relacion, error } = await supabase
    .from('propiedades_usuarios')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return relacion as PropiedadUsuario;
}

export async function cambiarEtapa(
  propiedad_id: string,
  usuario_id: string,
  nueva_etapa: EtapaRelacion
) {
  const relacionExistente = await obtenerRelacion(propiedad_id, usuario_id);

  if (relacionExistente) {
    return actualizarRelacion({
      id: relacionExistente.id,
      etapa: nueva_etapa
    });
  } else {
    return crearRelacion({
      propiedad_id,
      usuario_id,
      etapa: nueva_etapa
    });
  }
}

export async function marcarComoInteres(propiedad_id: string, usuario_id: string) {
  return cambiarEtapa(propiedad_id, usuario_id, 'Interes');
}

export async function marcarComoVisitada(
  propiedad_id: string,
  usuario_id: string,
  calificacion?: number,
  comentario?: string
) {
  const relacionExistente = await obtenerRelacion(propiedad_id, usuario_id);

  if (relacionExistente) {
    return actualizarRelacion({
      id: relacionExistente.id,
      etapa: 'Visitada',
      calificacion,
      comentario_compartido: comentario
    });
  } else {
    const nuevaRelacion = await crearRelacion({
      propiedad_id,
      usuario_id,
      etapa: 'Visitada'
    });

    if (calificacion || comentario) {
      return actualizarRelacion({
        id: nuevaRelacion.id,
        calificacion,
        comentario_compartido: comentario
      });
    }

    return nuevaRelacion;
  }
}

export async function agregarNotaAgente(
  propiedad_id: string,
  usuario_id: string,
  nota: string
) {
  const relacionExistente = await obtenerRelacion(propiedad_id, usuario_id);

  if (relacionExistente) {
    return actualizarRelacion({
      id: relacionExistente.id,
      nota_agente: nota
    });
  } else {
    return crearRelacion({
      propiedad_id,
      usuario_id,
      nota_agente: nota
    });
  }
}

export async function obtenerPropiedadesPorEtapa(usuario_id: string, etapa: EtapaRelacion) {
  const { data, error } = await supabase
    .from('propiedades_usuarios')
    .select(`
      *,
      propiedades (*)
    `)
    .eq('usuario_id', usuario_id)
    .eq('etapa', etapa)
    .order('fecha_interes', { ascending: false });

  if (error) throw error;

  return (data || []).map((rel: any) => rel.propiedades).filter(Boolean);
}

export async function obtenerInteresesPorPropiedad(): Promise<PropiedadConInteresados[]> {
  const { data, error } = await supabase
    .from('propiedades_usuarios')
    .select(`
      id,
      propiedad_id,
      usuario_id,
      fecha_interes,
      propiedades (*),
      usuarios (*)
    `)
    .eq('etapa', 'Interes')
    .order('fecha_interes', { ascending: false });

  if (error) throw error;

  const propiedadesMap = new Map<string, PropiedadConInteresados>();

  (data || []).forEach((rel: any) => {
    if (!rel.propiedades || !rel.usuarios) return;

    const propId = rel.propiedad_id;

    if (!propiedadesMap.has(propId)) {
      propiedadesMap.set(propId, {
        propiedad: rel.propiedades as Propiedad,
        interesados: []
      });
    }

    propiedadesMap.get(propId)!.interesados.push({
      usuario: rel.usuarios as Usuario,
      relacion_id: rel.id,
      fecha_interes: rel.fecha_interes || new Date().toISOString(),
      propiedad_id: rel.propiedad_id
    });
  });

  return Array.from(propiedadesMap.values());
}

export async function obtenerVisitasPorPropiedad(): Promise<PropiedadConVisitantes[]> {
  const { data, error } = await supabase
    .from('propiedades_usuarios')
    .select(`
      id,
      propiedad_id,
      usuario_id,
      fecha_interes,
      calificacion,
      comentario_compartido,
      nota_agente,
      propiedades (*),
      usuarios (*)
    `)
    .eq('etapa', 'Visitada')
    .order('fecha_interes', { ascending: false });

  if (error) throw error;

  const propiedadesMap = new Map<string, PropiedadConVisitantes>();

  (data || []).forEach((rel: any) => {
    if (!rel.propiedades || !rel.usuarios) return;

    const propId = rel.propiedad_id;

    if (!propiedadesMap.has(propId)) {
      propiedadesMap.set(propId, {
        propiedad: rel.propiedades as Propiedad,
        visitantes: []
      });
    }

    propiedadesMap.get(propId)!.visitantes.push({
      usuario: rel.usuarios as Usuario,
      relacion_id: rel.id,
      fecha_visita: rel.fecha_interes || new Date().toISOString(),
      propiedad_id: rel.propiedad_id,
      calificacion: rel.calificacion,
      comentario_compartido: rel.comentario_compartido || '',
      nota_agente: rel.nota_agente || ''
    });
  });

  return Array.from(propiedadesMap.values());
}

export async function eliminarRelacion(propiedad_id: string, usuario_id: string) {
  const { error } = await supabase
    .from('propiedades_usuarios')
    .delete()
    .eq('propiedad_id', propiedad_id)
    .eq('usuario_id', usuario_id);

  if (error) throw error;
}
