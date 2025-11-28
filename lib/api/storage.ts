import { supabase } from '../supabase';

const AVATARS_BUCKET = 'avatars';
const PROPERTY_IMAGES_BUCKET = 'property-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PROPERTY_IMAGES = 10;

export interface UploadResult {
  url: string;
  path: string;
}

export function validarImagen(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato no permitido. Solo se aceptan JPG, PNG y WebP.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Máximo 5MB.',
    };
  }

  return { valid: true };
}

export async function subirFotoPerfil(
  userId: string,
  file: File
): Promise<UploadResult> {
  const validation = validarImagen(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `profile.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Error al subir la foto: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(filePath, {
      transform: {
        width: 400,
        height: 400,
        quality: 80,
      },
    });

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

export async function eliminarFotoPerfil(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .remove([filePath]);

  if (error) {
    throw new Error(`Error al eliminar la foto: ${error.message}`);
  }
}

export function obtenerUrlPublica(filePath: string): string {
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath, {
    transform: {
      width: 400,
      height: 400,
      quality: 80,
    },
  });

  return data.publicUrl;
}

export async function actualizarFotoPerfilUsuario(
  userId: string,
  fotoUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('usuarios')
    .update({ foto_perfil_url: fotoUrl })
    .eq('auth_id', userId);

  if (error) {
    throw new Error(`Error al actualizar la base de datos: ${error.message}`);
  }
}

export function generarIniciales(nombre: string): string {
  if (!nombre) return '?';

  const palabras = nombre.trim().split(' ');
  if (palabras.length === 1) {
    return palabras[0].charAt(0).toUpperCase();
  }

  return (palabras[0].charAt(0) + palabras[palabras.length - 1].charAt(0)).toUpperCase();
}

export function generarColorAvatar(nombre: string): string {
  const colores = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];

  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colores[Math.abs(hash) % colores.length];
}

export interface PropertyImageUploadResult {
  url: string;
  path: string;
  index: number;
}

export async function subirFotoPropiedad(
  propertyId: string,
  file: File,
  index: number
): Promise<PropertyImageUploadResult> {
  const validation = validarImagen(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const fileName = `${timestamp}-${index}.${fileExt}`;
  const filePath = `${propertyId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Error al subir la foto: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .getPublicUrl(filePath, {
      transform: {
        width: 1200,
        height: 900,
        quality: 85,
      },
    });

  return {
    url: urlData.publicUrl,
    path: filePath,
    index,
  };
}

export async function subirMultiplesFotosPropiedad(
  propertyId: string,
  files: File[]
): Promise<PropertyImageUploadResult[]> {
  if (files.length > MAX_PROPERTY_IMAGES) {
    throw new Error(`Máximo ${MAX_PROPERTY_IMAGES} imágenes permitidas`);
  }

  const uploadPromises = files.map((file, index) =>
    subirFotoPropiedad(propertyId, file, index)
  );

  return Promise.all(uploadPromises);
}

export async function eliminarFotoPropiedad(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .remove([filePath]);

  if (error) {
    throw new Error(`Error al eliminar la foto: ${error.message}`);
  }
}

export async function eliminarMultiplesFotosPropiedad(filePaths: string[]): Promise<void> {
  const { error } = await supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .remove(filePaths);

  if (error) {
    throw new Error(`Error al eliminar las fotos: ${error.message}`);
  }
}

export function obtenerUrlPublicaPropiedad(filePath: string): string {
  const { data } = supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(filePath, {
    transform: {
      width: 1200,
      height: 900,
      quality: 85,
    },
  });

  return data.publicUrl;
}

export async function actualizarImagenesPropiedad(
  propertyId: string,
  imageUrls: string[]
): Promise<void> {
  const { error } = await supabase
    .from('propiedades')
    .update({ imagenes: imageUrls })
    .eq('id', propertyId);

  if (error) {
    throw new Error(`Error al actualizar las imágenes: ${error.message}`);
  }
}

export { MAX_PROPERTY_IMAGES };
