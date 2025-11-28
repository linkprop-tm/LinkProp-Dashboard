
import React, { useState, useEffect, useRef } from 'react';
import {
  X, Link, CheckCircle2, MapPin, Image as ImageIcon, Home, Bath, Bed, Save, Calendar,
  DollarSign, Ruler, Briefcase, CheckSquare, LayoutGrid, Trash2, Car, Compass, ShieldCheck,
  Upload, GripVertical, Plus, Globe, ExternalLink, Sparkles, Loader2, Eye, EyeOff
} from 'lucide-react';
import { ScrapedData, Property } from '../types';
import { actualizarPropiedad, crearPropiedad, eliminarPropiedad } from '../lib/api/properties';
import { propertyToPropiedad } from '../lib/adapters';
import { PropertyPhotosUploadModal } from './PropertyPhotosUploadModal';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Property | null;
  onSuccess?: () => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose, initialData, onSuccess }) => {
  
  // --- DATA MAPPING HELPER (Synchronous) ---
  const getInitialScrapedData = (data: Property | null | undefined): ScrapedData | null => {
    if (!data) return null;
    return {
        title: data.title,
        price: data.price.toString(),
        address: data.address,
        description: data.description || "Descripción de la propiedad...",
        features: {
          beds: data.bedrooms || 1,
          baths: data.bathrooms || 1,
          area: data.totalArea || data.area || 0,
          coveredArea: data.coveredArea || 0,
          environments: data.environments || 1
        },
        details: {
          antiquity: data.antiquity || 0,
          expenses: data.expenses || 0,
          isCreditSuitable: data.isCreditSuitable || false,
          isProfessionalSuitable: data.isProfessionalSuitable || false,
          operationType: data.operationType || 'Venta',
          propertyType: data.propertyType || 'Departamento'
        },
        location: {
          neighborhood: data.neighborhood || '',
          province: data.province || 'Buenos Aires'
        },
        amenities: data.amenities || ['Agua Corriente', 'Luz', 'Gas Natural'],
        images: data.images && data.images.length > 0 
          ? data.images 
          : [data.imageUrl, 'https://picsum.photos/300/200?random=102', 'https://picsum.photos/300/200?random=103']
    };
  };

  // --- STATE INITIALIZATION (Lazy) ---
  // Initialize state based on props synchronously to avoid visual flash
  const [step, setStep] = useState<'input' | 'scraping' | 'preview'>(() => initialData ? 'preview' : 'input');
  const [url, setUrl] = useState(() => initialData ? 'https://www.zonaprop.com.ar/propiedades/clasificado-demo.html' : '');
  const [progress, setProgress] = useState(0);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(() => getInitialScrapedData(initialData));
  const [status, setStatus] = useState<'active' | 'pending' | 'sold'>(() => initialData?.status || 'active');
  const [isVisible, setIsVisible] = useState(() => initialData?.isVisible !== undefined ? initialData.isVisible : true);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [sourcePortal, setSourcePortal] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const [formData, setFormData] = useState(() => ({
    title: scrapedData?.title || '',
    price: scrapedData?.price || '',
    currency: initialData?.currency || 'USD',
    address: scrapedData?.address || '',
    neighborhood: scrapedData?.location?.neighborhood || '',
    province: scrapedData?.location?.province || 'Buenos Aires',
    description: scrapedData?.description || '',
    propertyType: scrapedData?.details?.propertyType || 'Departamento',
    operationType: scrapedData?.details?.operationType || 'Venta',
    totalArea: scrapedData?.features?.area || 0,
    coveredArea: scrapedData?.features?.coveredArea || 0,
    environments: scrapedData?.features?.environments || 1,
    bedrooms: scrapedData?.features?.beds || 1,
    bathrooms: scrapedData?.features?.baths || 1,
    antiquity: scrapedData?.details?.antiquity || 0,
    orientation: initialData?.orientation || 'Norte',
    expenses: scrapedData?.details?.expenses || 0,
    hasGarage: scrapedData?.details?.hasGarage || false,
    isProfessionalSuitable: scrapedData?.details?.isProfessionalSuitable || false,
    isCreditSuitable: scrapedData?.details?.isCreditSuitable || false,
    amenities: scrapedData?.amenities || []
  }));

  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Amenities State
  const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false);
  const availableAmenities = ['Pileta', 'SUM', 'Parrilla', 'Gimnasio', 'Lavadero', 'Balcón Terraza'];
  const amenitiesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (amenitiesDropdownRef.current && !amenitiesDropdownRef.current.contains(event.target as Node)) {
        setShowAmenitiesDropdown(false);
      }
    };

    if (showAmenitiesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAmenitiesDropdown]);

  useEffect(() => {
    if (scrapedData) {
      setFormData({
        title: scrapedData.title,
        price: scrapedData.price.replace(/[^0-9]/g, ''),
        currency: initialData?.currency || 'USD',
        address: scrapedData.address,
        neighborhood: scrapedData.location?.neighborhood || '',
        province: scrapedData.location?.province || 'Buenos Aires',
        description: scrapedData.description,
        propertyType: scrapedData.details?.propertyType || 'Departamento',
        operationType: scrapedData.details?.operationType || 'Venta',
        totalArea: scrapedData.features?.area || 0,
        coveredArea: scrapedData.features?.coveredArea || 0,
        environments: scrapedData.features?.environments || 1,
        bedrooms: scrapedData.features?.beds || 1,
        bathrooms: scrapedData.features?.baths || 1,
        antiquity: typeof scrapedData.details?.antiquity === 'number' ? scrapedData.details.antiquity : 0,
        orientation: scrapedData.details?.orientation || 'Norte',
        expenses: scrapedData.details?.expenses || 0,
        hasGarage: scrapedData.details?.hasGarage || false,
        isProfessionalSuitable: scrapedData.details?.isProfessionalSuitable || false,
        isCreditSuitable: scrapedData.details?.isCreditSuitable || false,
        amenities: scrapedData.amenities || []
      });
    }
  }, [scrapedData, initialData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);

      if (!formData.title || formData.title.trim() === '') {
        setErrorMessage('El título de la propiedad es requerido');
        setSaving(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        setErrorMessage('El precio debe ser mayor a 0');
        setSaving(false);
        return;
      }

      if (!formData.address && !formData.neighborhood) {
        setErrorMessage('Debe especificar al menos la dirección o el barrio');
        setSaving(false);
        return;
      }

      const propertyData: Partial<Property> = {
        title: formData.title.trim(),
        price: parseFloat(formData.price) || 0,
        currency: formData.currency,
        address: formData.address.trim(),
        neighborhood: formData.neighborhood.trim(),
        province: formData.province,
        description: formData.description,
        propertyType: formData.propertyType,
        operationType: formData.operationType,
        totalArea: formData.totalArea || 0,
        coveredArea: formData.coveredArea || 0,
        environments: formData.environments || 1,
        bedrooms: formData.bedrooms || 0,
        bathrooms: formData.bathrooms || 0,
        antiquity: formData.antiquity || 0,
        orientation: formData.orientation,
        expenses: formData.expenses || 0,
        hasGarage: formData.hasGarage,
        isProfessionalSuitable: formData.isProfessionalSuitable,
        isCreditSuitable: formData.isCreditSuitable,
        status: status,
        isVisible: isVisible,
        images: scrapedData?.images && scrapedData.images.length > 0 ? scrapedData.images : [],
        amenities: formData.amenities || [],
        sourceUrl: sourceUrl || undefined,
        sourcePortal: sourcePortal || undefined
      };

      console.log('Saving property data:', propertyData);

      if (initialData?.id) {
        const updateData = propertyToPropiedad(propertyData);
        console.log('Update data to send to Supabase:', updateData);
        await actualizarPropiedad({ id: initialData.id, ...updateData });
      } else {
        const createData = propertyToPropiedad(propertyData);
        console.log('Create data to send to Supabase:', createData);
        await crearPropiedad({
          titulo: createData.titulo || '',
          tipo: createData.tipo || 'Departamento',
          operacion: createData.operacion || 'Venta',
          precio: createData.precio || 0,
          direccion: createData.direccion,
          barrio: createData.barrio,
          provincia: createData.provincia,
          ...createData
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error saving property:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar la propiedad';
      console.error('Full error details:', JSON.stringify(err, null, 2));
      setErrorMessage(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || !deleteConfirm) return;

    try {
      setSaving(true);
      setErrorMessage(null);
      await eliminarPropiedad(initialData.id);

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error deleting property:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Error al eliminar la propiedad');
    } finally {
      setSaving(false);
      setDeleteConfirm(false);
    }
  };

  const handleScrape = async () => {
    if (!url) return;
    setStep('scraping');
    setProgress(0);
    setElapsedTime(0);
    setErrorMessage(null);

    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl === 'https://your-n8n-instance.com/webhook/scrape-property') {
      setErrorMessage('URL del webhook no configurada. Por favor configura VITE_N8N_WEBHOOK_URL en el archivo .env');
      setStep('input');
      return;
    }

    const progressInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setProgress(prev => {
        if (prev < 60) return prev + 2;
        if (prev < 90) return prev + 0.5;
        return prev;
      });
    }, 1000);

    const timeoutId = setTimeout(() => {
      clearInterval(progressInterval);
      setErrorMessage('El scraping está tardando demasiado. El portal podría estar lento. ¿Deseas reintentar?');
      setStep('input');
    }, 90000);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url_original: url }),
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.titulo || !data.precio || !data.tipo || !data.operacion) {
        throw new Error('La respuesta del webhook no contiene los campos requeridos');
      }

      const parsedAntiquity = data.antiguedad ? parseInt(String(data.antiguedad).replace(/[^0-9]/g, '')) || 0 : 0;

      setScrapedData({
        title: data.titulo,
        price: String(data.precio),
        address: data.direccion || '',
        description: data.descripcion || '',
        features: {
          beds: data.dormitorios || 0,
          baths: data.banos || 0,
          area: data.m2_totales || 0,
          coveredArea: data.m2_cubiertos || 0,
          environments: data.ambientes || 0
        },
        details: {
          antiquity: parsedAntiquity,
          expenses: data.expensas || 0,
          isCreditSuitable: data.apto_credito || false,
          isProfessionalSuitable: data.apto_profesional || false,
          operationType: data.operacion,
          propertyType: data.tipo,
          hasGarage: data.cochera || false,
          orientation: data.orientacion || 'Norte'
        },
        location: {
          neighborhood: data.barrio || '',
          province: data.provincia || 'Buenos Aires'
        },
        amenities: data.amenities || [],
        images: data.imagenes || []
      });

      setSourceUrl(data.url_original || url);
      setSourcePortal(data.portal_original || '');
      setStatus('active');
      setIsVisible(true);
      setProgress(100);
      setTimeout(() => setStep('preview'), 800);

    } catch (err) {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      console.error('Error scraping property:', err);

      let errorMsg = 'Error al obtener los datos de la propiedad';
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          errorMsg = 'No se pudo acceder a la URL proporcionada. Verifica que sea correcta.';
        } else if (err.message.includes('500')) {
          errorMsg = 'Error en el servidor de scraping. Por favor intenta nuevamente.';
        } else if (err.message.includes('campos requeridos')) {
          errorMsg = 'La respuesta del portal no es válida. Intenta con otra URL.';
        } else {
          errorMsg = err.message;
        }
      }

      setErrorMessage(errorMsg);
      setStep('input');
    }
  };

  // Photo Management Functions
  const handleRemovePhoto = (index: number) => {
    if (!scrapedData) return;
    const newImages = [...scrapedData.images];
    newImages.splice(index, 1);
    setScrapedData({ ...scrapedData, images: newImages });
  };

  const handleAddPhoto = () => {
    setShowPhotoUploadModal(true);
  };

  const handlePhotoUploadSuccess = (newPhotoUrls: string[]) => {
    if (!scrapedData) return;
    const updatedImages = [...scrapedData.images, ...newPhotoUrls];
    setScrapedData({ ...scrapedData, images: updatedImages });
    setShowPhotoUploadModal(false);
  };

  // Amenities Handlers
  const handleRemoveAmenity = (index: number) => {
    const newAmenities = formData.amenities.filter((_, i) => i !== index);
    setFormData({ ...formData, amenities: newAmenities });
  };

  const handleAddAmenity = (amenity: string) => {
    if (!formData.amenities.includes(amenity)) {
      setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
    }
    setShowAmenitiesDropdown(false);
  };

  const getAvailableAmenities = () => {
    return availableAmenities.filter(amenity => !formData.amenities.includes(amenity));
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Transparent drag image or custom if needed, standard ghost is usually fine
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex || !scrapedData) return;

    const newImages = [...scrapedData.images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);

    setScrapedData({ ...scrapedData, images: newImages });
    setDraggedIndex(null);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
  };

  const getPortalName = (link: string) => {
     if (link.includes('zonaprop')) return 'ZonaProp';
     if (link.includes('argenprop')) return 'Argenprop';
     if (link.includes('mercadolibre')) return 'MercadoLibre';
     if (link.includes('remax')) return 'Remax';
     return 'Web Directa';
  };

  // If !isOpen is handled by parent conditional rendering, this check is redundant but safe
  if (!isOpen) return null;

  const getStatusColor = () => {
      switch(status) {
          case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100 focus:ring-emerald-200';
          case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100 focus:ring-amber-200';
          case 'sold': return 'bg-red-50 text-red-700 border-red-100 focus:ring-red-200';
          default: return 'bg-gray-100 text-gray-600 border-gray-200';
      }
  };

  const getOperationColor = () => {
     if (formData.operationType === 'Alquiler') {
         return 'bg-violet-50 text-violet-700 border-violet-100 focus:ring-violet-200';
     }
     return 'bg-blue-50 text-blue-700 border-blue-100 focus:ring-blue-200';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[1200px] h-[90vh] flex flex-col overflow-hidden animate-fade-in-up transform transition-all">
        
        {/* Body with Internal Header for Blur Effect */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
          
          {/* Sticky Header inside scroll view */}
          <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
              <p className="text-xs text-gray-400">{initialData ? 'Modifica los datos como se verán en la ficha' : 'Verifica la información importada'}</p>
            </div>
            <div className="flex gap-3">
               <button
                 onClick={onClose}
                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
               >
                 <X size={20} />
               </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <X size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {step === 'input' && (
            <div className="h-[calc(100%-80px)] flex flex-col items-center justify-center space-y-6 px-8">
               <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-2 ring-4 ring-primary-50/50">
                 <Link size={32} />
               </div>
               <div className="w-full max-w-md space-y-4">
                 <h3 className="text-center text-lg font-medium text-gray-900">Importar desde Portal</h3>
                 <div className="flex gap-2">
                   <input 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Pega el enlace de ZonaProp, Argenprop o Remax..." 
                      className="flex-1 rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all w-full"
                   />
                 </div>
                 <button 
                    onClick={handleScrape}
                    disabled={!url}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg shadow-lg shadow-primary-600/20 transition-all active:scale-95"
                 >
                    Importar Datos
                 </button>
               </div>
               
               <div className="flex gap-6 mt-8 opacity-50 items-center">
                 <img src="/assets/Zonaprop.svg" alt="ZonaProp" className="h-7.5 object-contain grayscale" />
                 <img src="/assets/argenprop.svg" alt="Argenprop" className="h-6 object-contain grayscale" />
                 <img src="/assets/mercado-libre.svg" alt="MercadoLibre" className="h-6 object-contain grayscale" />
                 <img src="/assets/remax copy.svg" alt="Remax" className="h-6 object-contain grayscale" />
               </div>
            </div>
          )}

          {step === 'scraping' && (
            <div className="h-[calc(100%-80px)] flex flex-col items-center justify-center p-8">
              
              {/* Modern Animated Icon Wrapper */}
              <div className="relative mb-10">
                 {/* Pulsing Glow Background */}
                 <div className="absolute inset-0 bg-primary-500/30 blur-2xl rounded-full animate-pulse"></div>
                 
                 {/* Main Icon Container */}
                 <div className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl shadow-primary-100 border border-white flex items-center justify-center z-10">
                    <Sparkles className="text-primary-600 animate-pulse" size={40} strokeWidth={1.5} />
                 </div>

                 {/* Orbiting Dot Ring */}
                 <div className="absolute top-[-10px] left-[-10px] right-[-10px] bottom-[-10px] border border-gray-100 rounded-full animate-spin" style={{animationDuration: '8s'}}>
                    <div className="absolute top-1/2 left-0 w-2.5 h-2.5 bg-primary-400 rounded-full -translate-x-1.5 shadow-sm"></div>
                 </div>
              </div>

              {/* Dynamic Step Text */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {elapsedTime < 15 ? 'Conectando con el portal...' :
                 elapsedTime < 30 ? 'Procesando imágenes y características...' :
                 elapsedTime < 50 ? 'El portal está respondiendo lentamente, por favor espera...' :
                 elapsedTime < 70 ? 'Casi listo, extrayendo últimos detalles...' : 'Finalizando el scraping...'}
              </h3>

              <p className="text-gray-400 text-sm mb-8 font-medium">
                {elapsedTime > 30 ? `Tiempo transcurrido: ${elapsedTime}s` : 'La IA de LinkProp está analizando la publicación'}
              </p>

              {/* Modern Gradient Progress Bar */}
              <div className="w-full max-w-md space-y-3">
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 via-blue-500 to-cyan-400 transition-all duration-300 ease-out rounded-full relative shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                      style={{ width: `${progress}%` }}
                    >
                       {/* Shimmer Effect */}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_1s_infinite]"></div>
                    </div>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-gray-400 px-1">
                    <span>0%</span>
                    <span className="text-primary-600">{Math.round(progress)}% completado</span>
                    <span>100%</span>
                 </div>
              </div>

            </div>
          )}

          {step === 'preview' && scrapedData && (
            <div className="max-w-6xl mx-auto p-6 md:p-8">
              
              {/* 1. Photo Manager (Grid View) */}
              <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">Galería ({scrapedData.images.length})</h3>
                      <span className="text-xs text-gray-400 font-medium hidden md:inline">Arrastra para reordenar</span>
                    </div>
                    <button 
                      onClick={handleAddPhoto}
                      className="text-sm text-white bg-primary-600 font-bold flex items-center gap-2 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                       <Upload size={16} /> Subir fotos
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                     
                     {/* Image Grid */}
                     {scrapedData.images.map((img, idx) => (
                        <div 
                           key={idx}
                           draggable
                           onDragStart={(e) => onDragStart(e, idx)}
                           onDragOver={(e) => onDragOver(e, idx)}
                           onDrop={(e) => onDrop(e, idx)}
                           onDragEnd={onDragEnd}
                           className={`relative group rounded-xl overflow-hidden shadow-sm border-2 transition-all cursor-grab active:cursor-grabbing bg-white
                             ${draggedIndex === idx ? 'opacity-40 border-dashed border-gray-400' : 'border-transparent hover:border-primary-200'}
                             ${idx === 0 ? 'ring-2 ring-primary-500 ring-offset-2 border-primary-500' : ''}
                           `}
                        >
                           {/* Cover Header / Index Label */}
                           <div className={`px-3 py-1.5 text-[10px] font-bold uppercase flex items-center justify-between
                              ${idx === 0 ? 'bg-primary-600 text-white' : 'bg-white border-b border-gray-100 text-gray-400'}
                           `}>
                              <div className="flex items-center gap-1">
                                <GripVertical size={12} className="opacity-50" />
                                {idx === 0 ? 'Foto de Portada' : `Orden #${idx + 1}`}
                              </div>
                              {idx === 0 && <ImageIcon size={12} />}
                           </div>
                           
                           {/* Image Container */}
                           <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                              <img 
                                src={img} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                alt={`Propiedad ${idx}`} 
                              />
                              
                              {/* Hover Actions Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                 <button 
                                   onClick={() => handleRemovePhoto(idx)}
                                   className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-lg"
                                   title="Eliminar"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                 
                 {/* Left Column: Information (Client Style) */}
                 <div className="lg:col-span-2 space-y-8">
                    
                    {/* Header Info */}
                    <div>
                       <div className="flex items-center gap-2 mb-3">
                          {/* 1. Operation Type */}
                          <select
                            className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border outline-none focus:ring-2 ${getOperationColor()}`}
                            value={formData.operationType}
                            onChange={(e) => setFormData({...formData, operationType: e.target.value as 'Venta' | 'Alquiler'})}
                          >
                              <option value="Venta">Venta</option>
                              <option value="Alquiler">Alquiler</option>
                          </select>
                          
                          {/* 2. Property Type */}
                          <select className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold uppercase tracking-wider border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200" value={formData.propertyType} onChange={(e) => setFormData({...formData, propertyType: e.target.value})}>
                              <option value="Departamento">Departamento</option>
                              <option value="Casa">Casa</option>
                              <option value="PH">PH</option>
                              <option value="Terreno">Terreno</option>
                              <option value="Local">Local</option>
                              <option value="Oficina">Oficina</option>
                              <option value="Galpón">Galpón</option>
                          </select>

                          {/* 3. Status Selector */}
                          <select 
                             value={status}
                             onChange={(e) => setStatus(e.target.value as any)}
                             className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border outline-none focus:ring-2 ${getStatusColor()}`} 
                          >
                              <option value="active">Disponible</option>
                              <option value="pending">Reservada</option>
                              <option value="sold">Vendida</option>
                          </select>
                       </div>
                       <input
                         type="text"
                         value={formData.title}
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                         className="w-full text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight border-b border-transparent hover:border-gray-300 focus:border-primary-500 outline-none bg-transparent transition-colors placeholder:text-gray-300"
                       />
                       <div className="flex items-center text-gray-500 font-medium gap-2">
                          <MapPin size={18} className="mr-1" />
                          <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="bg-transparent border-b border-gray-200 focus:border-primary-500 outline-none w-48" placeholder="Dirección"/>
                          ,
                          <input type="text" value={formData.neighborhood} onChange={(e) => setFormData({...formData, neighborhood: e.target.value})} className="bg-transparent border-b border-gray-200 focus:border-primary-500 outline-none w-32" placeholder="Barrio"/>
                       </div>
                    </div>

                    {/* Characteristics Strip (Client Style Grid) */}
                    <div className="border-y border-gray-100 py-8 my-8 bg-gray-50/30 rounded-xl px-4">
                       <div className="grid grid-cols-3 md:grid-cols-5 gap-y-8 gap-x-4">
                          
                          {/* Item: Area */}
                          <div className="flex flex-col items-center justify-start text-center">
                             <div className="mb-2 text-gray-400"><Ruler size={24} strokeWidth={1.5} /></div>
                             <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total m²</div>
                             <input type="number" value={formData.totalArea} onChange={(e) => setFormData({...formData, totalArea: parseInt(e.target.value) || 0})} className="font-bold text-gray-900 text-lg w-16 text-center bg-transparent border-b border-gray-200 focus:border-primary-500 outline-none" />
                          </div>

                          {/* Item: Covered */}
                          <div className="flex flex-col items-center justify-start text-center">
                             <div className="mb-2 text-gray-400"><Home size={24} strokeWidth={1.5} /></div>
                             <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cubierta m²</div>
                             <input type="number" value={formData.coveredArea} onChange={(e) => setFormData({...formData, coveredArea: parseInt(e.target.value) || 0})} className="font-bold text-gray-900 text-lg w-16 text-center bg-transparent border-b border-gray-200 focus:border-primary-500 outline-none" />
                          </div>

                          {/* Item: Environments */}
                          <div className="flex flex-col items-center justify-start text-center">
                             <div className="mb-2 text-gray-400"><LayoutGrid size={24} strokeWidth={1.5} /></div>
                             <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ambientes</div>
                             <input type="number" value={formData.environments} onChange={(e) => setFormData({...formData, environments: parseInt(e.target.value) || 0})} className="font-bold text-gray-900 text-lg w-16 text-center bg-transparent border-b border-gray-200 focus:border-primary-500 outline-none" />
                          </div>

                          {/* Item: Bedrooms */}
                          <div className="flex flex-col items-center justify-start text-center">
                             <div className="mb-2 text-gray-400"><Bed size={24} strokeWidth={1.5} /></div>
                             <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dormitorios</div>
                             <input type="number" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value) || 0})} className="font-bold text-gray-900 text-lg w-16 text-center bg-transparent border-b border-gray-200 focus:border-primary-500 outline-none" />
                          </div>

                          {/* Item: Bathrooms */}
                          <div className="flex flex-col items-center justify-start text-center">
                             <div className="mb-2 text-gray-400"><Bath size={24} strokeWidth={1.5} /></div>
                             <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Baños</div>
                             <input type="number" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value) || 0})} className="font-bold text-gray-900 text-lg w-16 text-center bg-transparent border-b border-gray-200 focus:border-primary-500 outline-none" />
                          </div>

                          {/* Item: Antiquity */}
                          <div className="flex flex-col items-center justify-start text-center">
                             <div className="mb-2 text-gray-400"><Calendar size={24} strokeWidth={1.5} /></div>
                             <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Antigüedad</div>
                             <input type="number" value={formData.antiquity} onChange={(e) => setFormData({...formData, antiquity: parseInt(e.target.value) || 0})} className="font-bold text-gray-900 text-lg w-16 text-center bg-transparent border-b border-gray-200 focus:border-primary-500 outline-none" />
                          </div>

                           {/* Item: Orientation */}
                           <div className="flex flex-col items-center justify-start text-center">
                             <div className="mb-2 text-gray-400"><Compass size={24} strokeWidth={1.5} /></div>
                             <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Orientación</div>
                             <select value={formData.orientation} onChange={(e) => setFormData({...formData, orientation: e.target.value})} className="font-bold text-gray-900 text-sm w-full text-center bg-transparent border-b border-gray-200 focus:border-primary-500 outline-none">
                                <option value="Norte">Norte</option>
                                <option value="Sur">Sur</option>
                                <option value="Este">Este</option>
                                <option value="Oeste">Oeste</option>
                                <option value="Noreste">Noreste</option>
                             </select>
                          </div>

                          {/* Item: Garage */}
                          <label className="flex flex-col items-center justify-start text-center cursor-pointer group">
                             <div className="mb-2 text-gray-400 group-hover:text-primary-600 transition-colors"><Car size={24} strokeWidth={1.5} /></div>
                             <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cochera</div>
                             <input type="checkbox" checked={formData.hasGarage} onChange={(e) => setFormData({...formData, hasGarage: e.target.checked})} className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                          </label>

                          {/* Item: Prof */}
                          <label className="flex flex-col items-center justify-start text-center cursor-pointer group">
                             <div className="mb-2 text-gray-400 group-hover:text-primary-600 transition-colors"><Briefcase size={24} strokeWidth={1.5} /></div>
                             <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Apto Prof.</div>
                             <input type="checkbox" checked={formData.isProfessionalSuitable} onChange={(e) => setFormData({...formData, isProfessionalSuitable: e.target.checked})} className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                          </label>

                          {/* Item: Credit */}
                          <label className="flex flex-col items-center justify-start text-center cursor-pointer group">
                             <div className="mb-2 text-gray-400 group-hover:text-primary-600 transition-colors"><CheckCircle2 size={24} strokeWidth={1.5} /></div>
                             <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Apto Crédito</div>
                             <input type="checkbox" checked={formData.isCreditSuitable} onChange={(e) => setFormData({...formData, isCreditSuitable: e.target.checked})} className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                          </label>

                       </div>
                    </div>

                    {/* Description */}
                    <div>
                       <h3 className="text-xl font-bold text-gray-900 mb-4">Descripción</h3>
                       <textarea
                         className="w-full h-48 p-3 bg-white border border-gray-200 rounded-lg text-gray-600 leading-relaxed text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
                         value={formData.description}
                         onChange={(e) => setFormData({...formData, description: e.target.value})}
                       ></textarea>
                    </div>

                    {/* Amenities */}
                    <div>
                       <h3 className="text-xl font-bold text-gray-900 mb-4">Comodidades & Amenities</h3>
                       <div className="flex flex-wrap gap-3">
                          {formData.amenities.map((amenity, i) => (
                             <span key={i} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 font-medium text-gray-700">
                                {amenity}
                                <button
                                  onClick={() => handleRemoveAmenity(i)}
                                  className="hover:text-red-500 transition-colors"
                                >
                                  <X size={14}/>
                                </button>
                             </span>
                          ))}
                          <div className="relative" ref={amenitiesDropdownRef}>
                            <button
                              onClick={() => setShowAmenitiesDropdown(!showAmenitiesDropdown)}
                              className="px-4 py-2 border border-dashed border-gray-300 text-gray-500 rounded-xl text-sm font-medium hover:border-primary-500 hover:text-primary-600 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={getAvailableAmenities().length === 0}
                            >
                               <CheckSquare size={16} /> Agregar
                            </button>
                            {showAmenitiesDropdown && getAvailableAmenities().length > 0 && (
                              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[200px] overflow-hidden">
                                {getAvailableAmenities().map((amenity, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleAddAmenity(amenity)}
                                    className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                  >
                                    {amenity}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                       </div>
                    </div>
                    
                    {/* Danger Zone */}
                    {initialData && (
                      <div className="mt-12 pt-8 border-t border-gray-100">
                          <h4 className="text-sm font-bold text-gray-900 mb-2">Zona de Peligro</h4>
                          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                             <div>
                                <p className="text-sm font-bold text-red-800">Eliminar esta propiedad</p>
                                <p className="text-xs text-red-600 mt-0.5">Esta acción no se puede deshacer.</p>
                             </div>
                             <button
                                onClick={deleteConfirm ? handleDelete : () => setDeleteConfirm(true)}
                                disabled={saving}
                                className={`px-4 py-2 bg-white border rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm ${
                                  deleteConfirm
                                    ? 'text-white bg-red-600 border-red-600 hover:bg-red-700'
                                    : 'text-red-600 border-red-200 hover:bg-red-100'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                             >
                                <Trash2 size={16} /> {deleteConfirm ? 'Confirmar Eliminar' : 'Eliminar'}
                             </button>
                          </div>
                      </div>
                    )}

                 </div>

                 {/* Right Column: Sticky Card */}
                 <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        
                        {/* Main Actions Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                           <div className="mb-6">
                              <p className="text-sm text-gray-500 font-medium mb-1">Valor de publicación</p>
                              <div className="flex items-center gap-2">
                                 <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="text-xl font-bold bg-transparent border-none outline-none text-primary-600">
                                    <option>USD</option>
                                    <option>$</option>
                                 </select>
                                 <input
                                   type="text"
                                   value={formData.price}
                                   onChange={(e) => setFormData({...formData, price: e.target.value.replace(/[^0-9]/g, '')})}
                                   className="w-full text-4xl font-bold text-primary-600 tracking-tight bg-transparent border-b border-gray-200 focus:border-primary-500 outline-none"
                                 />
                              </div>
                              <div className="mt-2 flex items-center gap-1 text-gray-600 text-xs font-bold">
                                 + $ <input
                                   type="text"
                                   value={formData.expenses === 0 ? '' : formData.expenses}
                                   onChange={(e) => {
                                     const value = e.target.value.replace(/[^0-9]/g, '');
                                     setFormData({...formData, expenses: value === '' ? 0 : parseInt(value)});
                                   }}
                                   placeholder="0"
                                   className="w-20 bg-gray-100 px-1 rounded border-none outline-none focus:bg-white focus:ring-1 focus:ring-primary-300"
                                 /> expensas
                              </div>
                           </div>
                           
                           {/* Visibility Control (Added as requested) */}
                           <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                      {isVisible ? <Eye size={16}/> : <EyeOff size={16}/>}
                                      Visibilidad
                                  </span>
                                  <div 
                                      className="flex items-center cursor-pointer"
                                      onClick={() => setIsVisible(!isVisible)}
                                  >
                                      <button 
                                          className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none shadow-sm
                                              ${isVisible ? 'bg-primary-600' : 'bg-gray-400'}
                                          `}
                                      >
                                          <div 
                                              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
                                                  ${isVisible ? 'translate-x-4' : 'translate-x-0'}
                                              `}
                                          />
                                      </button>
                                  </div>
                              </div>
                              <p className="text-xs text-gray-500">
                                  {isVisible 
                                    ? 'La propiedad es visible para todos los clientes.' 
                                    : 'La propiedad está oculta. Solo visible para el equipo interno.'}
                              </p>
                           </div>

                           {/* Agent Info */}
                           <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-80">
                              <img src="https://picsum.photos/100/100?random=99" alt="Agent" className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
                              <div>
                                 <p className="font-bold text-gray-900">Roberto Díaz</p>
                                 <p className="text-xs text-gray-500">Agente Inmobiliario</p>
                              </div>
                           </div>
                           
                           {/* Actions */}
                           <div className="space-y-3">
                              <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-primary-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                              >
                                 {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                 {saving ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Publicar Propiedad')}
                              </button>
                           </div>
                           
                           <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                 <ShieldCheck size={14} />
                                 Vista Previa del Agente
                              </div>
                           </div>
                        </div>

                        {/* Portal / Source Info Box - Moved Outside */}
                         {(sourceUrl || url) && (
                           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                     <div className="flex items-center gap-1.5">
                                        <Globe size={14} className="text-gray-400"/>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Portal de Origen</span>
                                     </div>
                                     <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-50 border border-primary-100 rounded-md text-primary-600">
                                        {sourcePortal || getPortalName(sourceUrl || url)}
                                     </span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 group hover:border-primary-200 transition-colors">
                                     <Link size={14} className="text-gray-400 flex-shrink-0" />
                                     <a href={sourceUrl || url || '#'} target="_blank" rel="noreferrer" className="text-xs text-gray-600 truncate hover:text-primary-600 transition-colors block w-full font-medium">
                                        {sourceUrl || url || 'https://www.zonaprop.com.ar/propiedades/clasificado-...'}
                                     </a>
                                     <ExternalLink size={14} className="text-gray-300 flex-shrink-0 group-hover:text-primary-600" />
                                </div>
                           </div>
                         )}
                    </div>
                 </div>

              </div>
            </div>
          )}

        </div>
      </div>

      <PropertyPhotosUploadModal
        isOpen={showPhotoUploadModal}
        onClose={() => setShowPhotoUploadModal(false)}
        onSuccess={handlePhotoUploadSuccess}
        propertyId={initialData?.id || 'temp-' + Date.now()}
        currentImagesCount={scrapedData?.images.length || 0}
      />
    </div>
  );
};
