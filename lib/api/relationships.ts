import { supabase } from '../supabase';
import type { PropiedadUsuario, EtapaRelacion } from '../database.types';

export interface CreateRelacionData {
  propiedad_id: string;
  usuario_id: string;
  etapa?: EtapaRelacion;
  nota_agente?: string;
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

export async function eliminarRelacion(propiedad_id: string, usuario_id: string) {
  const { error } = await supabase
    .from('propiedades_usuarios')
    .delete()
    .eq('propiedad_id', propiedad_id)
    .eq('usuario_id', usuario_id);

  if (error) throw error;
}
