import React, { useState, useRef, DragEvent } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { subirMultiplesFotosPropiedad, validarImagen, MAX_PROPERTY_IMAGES } from '../lib/api/storage';

interface PropertyPhotosUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (photoUrls: string[]) => void;
  propertyId: string;
  currentImagesCount: number;
}

interface SelectedFilePreview {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const PropertyPhotosUploadModal: React.FC<PropertyPhotosUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  propertyId,
  currentImagesCount,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const remainingSlots = MAX_PROPERTY_IMAGES - currentImagesCount;

  const handleFilesSelect = (files: FileList | null) => {
    if (!files) return;

    setGlobalError(null);
    const filesArray = Array.from(files);
    const totalFiles = selectedFiles.length + filesArray.length;

    if (totalFiles + currentImagesCount > MAX_PROPERTY_IMAGES) {
      setGlobalError(`Solo puedes agregar ${remainingSlots} imagen(es) más. Máximo ${MAX_PROPERTY_IMAGES} por propiedad.`);
      return;
    }

    const newPreviews: SelectedFilePreview[] = [];

    filesArray.forEach((file) => {
      const validation = validarImagen(file);

      if (!validation.valid) {
        newPreviews.push({
          file,
          preview: '',
          status: 'error',
          error: validation.error,
        });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedFiles((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((p) => p.file === file);
            if (index !== -1) {
              updated[index].preview = reader.result as string;
            }
            return updated;
          });
        };
        reader.readAsDataURL(file);

        newPreviews.push({
          file,
          preview: '',
          status: 'pending',
        });
      }
    });

    setSelectedFiles((prev) => [...prev, ...newPreviews]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelect(e.target.files);
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
    handleFilesSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setGlobalError(null);
  };

  const handleUpload = async () => {
    const validFiles = selectedFiles.filter((f) => f.status === 'pending');

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setGlobalError(null);

    const filesToUpload = validFiles.map((f) => f.file);

    setSelectedFiles((prev) =>
      prev.map((file) =>
        file.status === 'pending' ? { ...file, status: 'uploading' } : file
      )
    );

    try {
      const results = await subirMultiplesFotosPropiedad(propertyId, filesToUpload);

      setSelectedFiles((prev) =>
        prev.map((file) =>
          file.status === 'uploading' ? { ...file, status: 'success' } : file
        )
      );

      const uploadedUrls = results.map((r) => r.url);
      setUploadComplete(true);

      setTimeout(() => {
        onSuccess(uploadedUrls);
        handleClose();
      }, 1500);
    } catch (err: any) {
      setGlobalError(err.message || 'Error al subir las fotos');
      setSelectedFiles((prev) =>
        prev.map((file) =>
          file.status === 'uploading'
            ? { ...file, status: 'error', error: 'Error al subir' }
            : file
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setGlobalError(null);
    setUploadComplete(false);
    setIsDragging(false);
    onClose();
  };

  const validFilesCount = selectedFiles.filter((f) => f.status !== 'error').length;
  const hasValidFiles = validFilesCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subir Fotos de Propiedad</h2>
            <p className="text-sm text-gray-500 mt-2">
              {currentImagesCount > 0
                ? `Tienes ${currentImagesCount} foto(s). Puedes agregar ${remainingSlots} más.`
                : `Sube hasta ${MAX_PROPERTY_IMAGES} fotos de la propiedad`}
            </p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {selectedFiles.length === 0 ? (
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
                    {isDragging ? 'Suelta las imágenes aquí' : 'Haz clic o arrastra múltiples imágenes'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG o WebP (máx. 5MB cada una)
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Máximo {MAX_PROPERTY_IMAGES} fotos por propiedad
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  {validFilesCount} imagen(es) seleccionada(s)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedFiles.length + currentImagesCount >= MAX_PROPERTY_IMAGES}
                  className="text-sm text-primary-600 font-semibold hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ImageIcon size={16} />
                  Agregar más
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedFiles.map((filePreview, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                      {filePreview.preview && (
                        <img
                          src={filePreview.preview}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {filePreview.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 size={32} className="text-white animate-spin" />
                        </div>
                      )}

                      {filePreview.status === 'success' && (
                        <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center">
                          <CheckCircle size={32} className="text-white" />
                        </div>
                      )}

                      {filePreview.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                          <AlertCircle size={32} className="text-white" />
                        </div>
                      )}

                      {filePreview.status === 'pending' && (
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="p-2 bg-white">
                      <p className="text-xs font-medium text-gray-600 truncate">
                        {filePreview.file.name}
                      </p>
                      {filePreview.error && (
                        <p className="text-xs text-red-600 mt-1">{filePreview.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />

          {globalError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{globalError}</p>
            </div>
          )}

          {uploadComplete && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <p className="text-sm text-emerald-800 font-medium">Fotos subidas correctamente</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!hasValidFiles || isUploading || uploadComplete}
            className="flex-1 py-3 px-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={18} />
                Subir {validFilesCount} foto{validFilesCount !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
