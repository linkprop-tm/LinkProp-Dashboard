export type TipoPropiedad = 'Casa' | 'Departamento' | 'Terreno' | 'Comercial' | 'PH' | 'Local' | 'Oficina' | 'Galpon';
export type TipoOperacion = 'Venta' | 'Alquiler';
export type Moneda = 'USD' | 'ARS';
export type EstadoPropiedad = 'Disponible' | 'Reservada' | 'Vendida';
export type VisibilidadPropiedad = 'Publica' | 'Privada';
export type EtapaRelacion = 'Explorar' | 'Interes' | 'Visitada';

export interface Propiedad {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoPropiedad;
  operacion: TipoOperacion;
  precio: number;
  moneda: Moneda;
  ubicacion: string;
  dormitorios: number;
  banos: number;
  superficie: number;
  imagenes: string[];
  estado: EstadoPropiedad;
  fecha_creacion: string;
  fecha_actualizacion: string;

  // Dimensiones adicionales
  m2_totales: number | null;
  m2_cubiertos: number | null;
  ambientes: number;

  // Características
  antiguedad: string;
  orientacion: string;
  expensas: number;

  // Aptitudes booleanas
  apto_credito: boolean;
  apto_profesional: boolean;
  cochera: boolean;

  // Ubicación detallada
  direccion: string;
  barrio: string;
  provincia: string;

  // Visibilidad y origen
  visibilidad: VisibilidadPropiedad;
  url_original: string;
  portal_original: string;

  // Amenities y comodidades
  amenities: string[];
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  preferencias_tipo: TipoPropiedad[];
  preferencias_operacion: TipoOperacion | null;
  preferencias_precio_min: number | null;
  preferencias_precio_max: number | null;
  preferencias_ubicacion: string[];
  preferencias_dormitorios_min: number | null;
  preferencias_banos_min: number | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  foto_perfil_url: string | null;
}

export interface Admin {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'agente';
  telefono: string;
  fecha_creacion: string;
}

export interface PropiedadUsuario {
  id: string;
  propiedad_id: string;
  usuario_id: string;
  etapa: EtapaRelacion;
  fecha_interes: string | null;
  calificacion: number | null;
  comentario_compartido: string;
  nota_agente: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PropiedadConRelacion extends Propiedad {
  relacion?: PropiedadUsuario;
  porcentaje_match?: number;
}

export interface UsuarioConRelacion extends Usuario {
  relacion?: PropiedadUsuario;
  porcentaje_match?: number;
}

export interface MatchResult {
  propiedad: Propiedad;
  usuario: Usuario;
  porcentaje_match: number;
  criterios_coincidentes: string[];
}
