
import React, { useState, useEffect, useCallback } from 'react';
import { Property } from '../types';
import { 
  ArrowLeft, MapPin, Bed, Bath, Ruler, Heart, Share2, Check, Phone, 
  Calendar, ShieldCheck, Camera, ImageIcon, X, ChevronLeft, ChevronRight, 
  LayoutGrid, Car, Briefcase, CheckCircle2, Home, Compass
} from 'lucide-react';

interface PropertyDetailsProps {
  property: Property;
  onBack: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onBack, isFavorite = false, onToggleFavorite }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasGarage = property.amenities?.some(a => 
    a.toLowerCase().includes('cochera') || a.toLowerCase().includes('garage')
  ) || false;

  // Ensure we have at least images for the grid layout
  const rawImages = property.images && property.images.length > 0 ? property.images : [property.imageUrl];
  const images = [...rawImages, ...rawImages, ...rawImages].slice(0, 8); 
  const totalImagesCount = rawImages.length; // Use actual count for display

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, nextImage, prevImage]);

  const renderStatusBadge = () => {
     const status = property.status;
     if (status === 'pending') {
        return (
           <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-amber-100">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
             Reservada
           </span>
        );
     }
     if (status === 'sold') {
        return (
           <span className="px-3 py-1 bg-red-50 text-red-700 rounded-md text-xs font-bold uppercase tracking-wider border border-red-100">
              Vendida
           </span>
        );
     }
     // Default: active
     return (
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
           Disponible
        </span>
     );
  };

  return (
    <div className="bg-white min-h-screen pb-20 animate-fade-in absolute inset-0 z-50 overflow-y-auto">
       {/* Sticky Header */}
       <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-4 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft size={20} /> Volver
          </button>
          <div className="flex items-center gap-3">
             <button className="p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors border border-transparent hover:border-gray-200">
               <Share2 size={20} />
             </button>
             <button 
               onClick={onToggleFavorite}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all shadow-sm hover:shadow-md active:scale-95 border group ${
                 isFavorite 
                   ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' 
                   : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
               }`}
             >
               <Heart 
                 size={18} 
                 className={`transition-colors ${
                   isFavorite 
                     ? 'fill-rose-600 text-rose-600' 
                     : 'fill-transparent text-gray-400 group-hover:text-gray-500'
                 }`} 
               />
               <span>Me interesa</span>
             </button>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          
          {/* Modern Grid Gallery */}
          <div className="relative h-[400px] md:h-[480px] rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 mb-8 group/gallery">
             
             {/* Main Image (Left) */}
             <div 
               className="md:col-span-2 md:row-span-2 relative cursor-pointer overflow-hidden"
               onClick={() => openLightbox(0)}
             >
               <img src={images[0]} alt="Main" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
               <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                 <Camera size={16} />
                 Ver todas las fotos
               </div>
             </div>

             {/* Side Images */}
             <div className="hidden md:block relative cursor-pointer overflow-hidden" onClick={() => openLightbox(1)}>
               <img src={images[1]} alt="Side 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="hidden md:block relative cursor-pointer overflow-hidden" onClick={() => openLightbox(2)}>
               <img src={images[2]} alt="Side 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="hidden md:block relative cursor-pointer overflow-hidden" onClick={() => openLightbox(3)}>
               <img src={images[3]} alt="Side 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="hidden md:block relative cursor-pointer overflow-hidden" onClick={() => openLightbox(4)}>
               <img src={images[4]} alt="Side 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
               {/* Overlay for "More photos" */}
               <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors flex flex-col items-center justify-center text-white font-medium">
                  <ImageIcon size={24} className="mb-1" />
                  <span>Ver más</span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-8">
             {/* Left Column: Info */}
             <div className="lg:col-span-2 space-y-8">
                
                {/* Header Info */}
                <div>
                   <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold uppercase tracking-wider">
                        {property.operationType || 'Venta'}
                      </span>
                      {/* Status Badge inserted here */}
                      {renderStatusBadge()}
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold uppercase tracking-wider">
                        {property.propertyType || 'Departamento'}
                      </span>
                   </div>
                   <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                     {property.title}
                   </h1>
                   <div className="flex items-center text-gray-500 font-medium">
                      <MapPin size={18} className="mr-1" />
                      {property.address}, {property.neighborhood}, {property.province}
                   </div>
                </div>

                {/* Characteristics Strip */}
                <div className="border-y border-gray-100 py-8 my-8">
                   <div className="grid grid-cols-3 md:grid-cols-5 gap-y-8 gap-x-4">
                      
                      {/* Total Area */}
                      <div className="flex flex-col items-center justify-start text-center">
                         <div className="mb-2 text-gray-400">
                            <Ruler size={24} strokeWidth={1.5} />
                         </div>
                         <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</div>
                         <div className="font-bold text-gray-900 text-lg">{property.totalArea || property.area} m²</div>
                      </div>
                      
                      {/* Covered Area */}
                      <div className="flex flex-col items-center justify-start text-center">
                         <div className="mb-2 text-gray-400">
                            <Home size={24} strokeWidth={1.5} />
                         </div>
                         <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cubierta</div>
                         <div className="font-bold text-gray-900 text-lg">{property.coveredArea} m²</div>
                      </div>

                      {/* Ambientes */}
                      <div className="flex flex-col items-center justify-start text-center">
                         <div className="mb-2 text-gray-400">
                            <LayoutGrid size={24} strokeWidth={1.5} />
                         </div>
                         <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ambientes</div>
                         <div className="font-bold text-gray-900 text-lg">{property.environments}</div>
                      </div>

                      {/* Bedrooms */}
                      <div className="flex flex-col items-center justify-start text-center">
                         <div className="mb-2 text-gray-400">
                            <Bed size={24} strokeWidth={1.5} />
                         </div>
                         <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dormitorios</div>
                         <div className="font-bold text-gray-900 text-lg">{property.bedrooms}</div>
                      </div>

                      {/* Bathrooms */}
                      <div className="flex flex-col items-center justify-start text-center">
                         <div className="mb-2 text-gray-400">
                            <Bath size={24} strokeWidth={1.5} />
                         </div>
                         <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Baños</div>
                         <div className="font-bold text-gray-900 text-lg">{property.bathrooms}</div>
                      </div>

                      {/* Antiquity */}
                      <div className="flex flex-col items-center justify-start text-center">
                         <div className="mb-2 text-gray-400">
                            <Calendar size={24} strokeWidth={1.5} />
                         </div>
                         <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Antigüedad</div>
                         <div className="font-bold text-gray-900 text-lg">{property.antiquity} años</div>
                      </div>

                       {/* Orientation (Moved Here) */}
                       <div className="flex flex-col items-center justify-start text-center">
                         <div className="mb-2 text-gray-400">
                             <Compass size={24} strokeWidth={1.5} />
                         </div>
                         <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Orientación</div>
                         <div className="font-bold text-gray-900 text-lg">{property.orientation || '-'}</div>
                      </div>

                      {/* Cochera */}
                      <div className="flex flex-col items-center justify-start text-center">
                          <div className={`mb-2 ${hasGarage ? 'text-gray-400' : 'text-gray-200'}`}>
                             <Car size={24} strokeWidth={1.5} />
                          </div>
                          <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cochera</div>
                          <div className={`font-bold text-lg ${hasGarage ? 'text-gray-900' : 'text-gray-300'}`}>
                             {hasGarage ? 'Sí' : 'No'}
                          </div>
                      </div>

                       {/* Apto Profesional */}
                       <div className="flex flex-col items-center justify-start text-center">
                         <div className={`mb-2 ${property.isProfessionalSuitable ? 'text-gray-400' : 'text-gray-200'}`}>
                             <Briefcase size={24} strokeWidth={1.5} />
                         </div>
                         <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Apto Prof.</div>
                         <div className={`font-bold text-lg ${property.isProfessionalSuitable ? 'text-gray-900' : 'text-gray-300'}`}>
                            {property.isProfessionalSuitable ? 'Sí' : 'No'}
                         </div>
                      </div>

                       {/* Apto Credito */}
                       <div className="flex flex-col items-center justify-start text-center">
                         <div className={`mb-2 ${property.isCreditSuitable ? 'text-gray-400' : 'text-gray-200'}`}>
                             <CheckCircle2 size={24} strokeWidth={1.5} />
                         </div>
                         <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Apto Crédito</div>
                         <div className={`font-bold text-lg ${property.isCreditSuitable ? 'text-gray-900' : 'text-gray-300'}`}>
                            {property.isCreditSuitable ? 'Sí' : 'No'}
                         </div>
                      </div>

                   </div>
                </div>

                {/* Description */}
                <div>
                   <h3 className="text-xl font-bold text-gray-900 mb-4">Descripción</h3>
                   <p className="text-gray-600 leading-relaxed text-lg">
                      {property.description}
                   </p>
                </div>

                {/* Amenities */}
                <div>
                   <h3 className="text-xl font-bold text-gray-900 mb-4">Comodidades & Amenities</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {property.amenities?.map((amenity, idx) => (
                         <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="p-1 bg-white rounded-full text-primary-600 shadow-sm">
                               <Check size={14} strokeWidth={3} />
                            </div>
                            <span className="font-medium text-gray-700">{amenity}</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Right Column: Sticky Card */}
             <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24">
                   <div className="mb-6">
                      <p className="text-sm text-gray-500 font-medium mb-1">Valor de publicación</p>
                      <div className="text-4xl font-bold text-primary-600 tracking-tight">
                         {property.currency} {property.price.toLocaleString()}
                      </div>
                      {property.expenses && (
                         <div className="mt-2 inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                            + ${property.expenses.toLocaleString()} expensas
                         </div>
                      )}
                   </div>

                   {/* Agent Info */}
                   <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <img src="https://picsum.photos/100/100?random=99" alt="Agent" className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
                      <div>
                         <p className="font-bold text-gray-900">Roberto Díaz</p>
                         <p className="text-xs text-gray-500">Agente Inmobiliario</p>
                         <div className="flex text-amber-400 text-xs mt-0.5">★★★★★</div>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="space-y-3">
                      <button className="w-full py-3.5 bg-[#29BA40] hover:bg-[#23a537] text-white rounded-xl font-bold shadow-lg shadow-green-500/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                         <Phone size={20} />
                         Contactar por WhatsApp
                      </button>
                   </div>
                   
                   <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                         <ShieldCheck size={14} />
                         Propiedad verificada por LinkProp
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Lightbox Overlay */}
       {isLightboxOpen && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center backdrop-blur-sm">
             <button 
               className="absolute top-4 right-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
               onClick={closeLightbox}
             >
                <X size={32} />
             </button>
             
             <button 
               className="absolute left-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block"
               onClick={prevImage}
             >
                <ChevronLeft size={48} />
             </button>

             <div className="w-full h-full flex items-center justify-center p-4 md:p-20">
                <img 
                  src={images[currentImageIndex]} 
                  alt={`View ${currentImageIndex + 1}`} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                />
             </div>

             <button 
               className="absolute right-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block"
               onClick={nextImage}
             >
                <ChevronRight size={48} />
             </button>

             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 font-medium bg-black/50 px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {images.length}
             </div>
          </div>
       )}

    </div>
  );
};
