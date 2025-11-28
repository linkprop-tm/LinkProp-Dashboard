import React, { useState, useRef, DragEvent } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { subirFotoPerfil, actualizarFotoPerfilUsuario, validarImagen } from '../lib/api/storage';

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (photoUrl: string) => void;
  userId: string;
  userName: string;
}

export const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userName,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setError(null);

    const validation = validarImagen(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo no válido');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await subirFotoPerfil(userId, selectedFile);
      await actualizarFotoPerfilUsuario(userId, result.url);

      setSuccess(true);
      setTimeout(() => {
        onSuccess(result.url);
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al subir la foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    setIsDragging(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-scale-in">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Subir Foto de Perfil</h2>
          <p className="text-sm text-gray-500 mt-2">
            Sube una foto para personalizar tu perfil
          </p>
        </div>

        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-200
              ${isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`
                p-4 rounded-full transition-colors
                ${isDragging ? 'bg-primary-100' : 'bg-gray-100'}
              `}>
                <Upload size={32} className={isDragging ? 'text-primary-600' : 'text-gray-400'} />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-700">
                  {isDragging ? 'Suelta la imagen aquí' : 'Haz clic o arrastra una imagen'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, PNG o WebP (máx. 5MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                {success && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <CheckCircle size={48} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              <ImageIcon size={18} className="inline mr-2" />
              Elegir otra imagen
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-600" />
            <p className="text-sm text-emerald-800 font-medium">Foto subida correctamente</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || success}
            className="flex-1 py-3 px-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-900/20"
          >
            {isUploading ? 'Subiendo...' : 'Subir Foto'}
          </button>
        </div>
      </div>
    </div>
  );
};
