
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
  // Create a robust list of images for the gallery
  const images = property.images && property.images.length > 0 
    ? property.images 
    : [property.imageUrl, property.imageUrl, property.imageUrl, property.imageUrl, property.imageUrl]; 
    
  const totalImagesCount = images.length;

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
               <img src={images[1] || images[0]} alt="Side 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="hidden md:block relative cursor-pointer overflow-hidden" onClick={() => openLightbox(2)}>
               <img src={images[2] || images[0]} alt="Side 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="hidden md:block relative cursor-pointer overflow-hidden" onClick={() => openLightbox(3)}>
               <img src={images[3] || images[0]} alt="Side 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="hidden md:block relative cursor-pointer overflow-hidden" onClick={() => openLightbox(4)}>
               <img src={images[4] || images[0]} alt="Side 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
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
                      {/* 1. Operation Type */}
                      <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                           property.operationType === 'Alquiler' 
                               ? 'bg-violet-50 text-violet-700' 
                               : 'bg-blue-50 text-blue-700'
                      }`}>
                        {property.operationType || 'Venta'}
                      </span>
                      
                      {/* 2. Property Type */}
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold uppercase tracking-wider">
                        {property.propertyType || 'Departamento'}
                      </span>

                      {/* 3. Status Badge */}
                      {renderStatusBadge()}
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
                      <img src="https://mhfdfnhjdfmescizbzol.supabase.co/storage/v1/render/image/public/avatars/dd5d766c-6eb9-497b-88da-2fe1dadde019/profile.png?width=400&height=400&quality=80" alt="Karina Poblete" className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
                      <div>
                         <p className="font-bold text-gray-900">Karina Poblete</p>
                         <p className="text-xs text-gray-500">Agente Inmobiliario</p>
                         <div className="flex text-amber-400 text-xs mt-0.5">★★★★★</div>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="space-y-3">
                      <button className="w-full py-3.5 bg-[#29BA40] hover:bg-[#23a537] text-white rounded-xl font-bold shadow-lg shadow-green-500/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                         <svg width="24" height="24" viewBox="0 0 954.97107 963.30536" fill="currentColor">
                           <path d="M 42.149614,900.89881 C 57.000526,856.74287 76.05032,800.09188 84.48249,775.00772 l 15.331219,-45.60755 -6.46564,-11.39245 C 62.999717,664.53398 44.143684,607.34283 36.17523,544.60006 22.932771,440.33033 46.112488,332.12129 100.86411,242.61528 121.1865,209.39297 142.40723,182.58845 170.9801,154.04975 240.63314,84.480028 332.3885,37.611552 427.07768,23.235561 c 99.49513,-15.1056471 196.2387,-0.463965 282.94806,42.822854 20.81087,10.389148 32.28162,17.062573 52.53973,30.566443 71.0396,47.354322 128.70349,114.584862 164.67091,191.990422 21.91056,47.15376 35.63686,96.66527 40.86593,147.40561 8.12351,78.82676 -1.93717,152.61122 -30.69215,225.09439 -34.84043,87.82288 -97.90228,165.15538 -177.34469,217.47711 -64.65277,42.5811 -138.7599,68.60772 -215.5,75.68418 -17.73882,1.63576 -67.79589,1.6413 -85.5,0.009 -57.44024,-5.29441 -110.96496,-20.40602 -164.17378,-46.35109 l -20.67377,-10.0807 -55.32623,17.76069 c -85.35365,27.40049 -141.56072,45.40181 -173.326224,55.51129 -15.95,5.07614 -29.31894,9.41547 -29.708755,9.64296 -0.389816,0.22747 11.441991,-35.71397 26.292903,-79.86991 z M 545.06547,875.60507 c 69.34784,-8.29158 133.24415,-33.36071 187.96114,-73.74483 72.54632,-53.54312 122.65168,-127.23836 147.36482,-216.74496 2.1306,-7.71665 7.31543,-34.48166 9.10469,-47 10.79336,-75.51448 -3.55445,-158.90834 -39.31314,-228.5 C 830.68263,271.66472 810.132,243.18157 780.6814,213.28614 758.66358,190.93577 741.30759,176.51573 716.81877,160.22658 668.22675,127.90479 610.51761,106.29751 552.12566,98.562678 c -28.76907,-3.81086 -75.91942,-3.54357 -104.43106,0.59202 -49.30239,7.151272 -97.3173,23.513622 -138.62913,47.241542 -108.68316,62.42343 -180.44455,170.14829 -195.66222,293.71904 -2.2555,18.31507 -2.54144,69.96039 -0.49278,89 6.60921,61.42373 28.09823,120.39575 63.33716,173.81534 l 8.78363,13.31534 -4.96153,14.68466 c -29.34261,86.8454 -43.66861,130.18466 -43.03317,130.18466 0.4207,0 23.66181,-7.36595 51.64691,-16.36878 76.60765,-24.64475 96.58251,-30.96629 97.78655,-30.94698 0.6025,0.01 5.59545,2.87125 11.09545,6.35909 14.46592,9.17361 43.58692,23.70481 61.5,30.68811 15.36391,5.98953 35.03862,12.28949 50.55218,16.1871 11.38767,2.86103 40.85432,7.73991 54.44782,9.01509 6.325,0.59333 13.3,1.25799 15.5,1.47702 8.88958,0.88501 52.80359,-0.40281 65.5,-1.92086 z m 74.5,-154.16543 c -20.19731,-2.5312 -53.01382,-13.63126 -101.3844,-34.29286 -47.02926,-20.08865 -80.2252,-43.09026 -121.20781,-83.98538 -35.97097,-35.89419 -55.64513,-61.30235 -92.5675,-119.54612 -7.5915,-11.97534 -18.93813,-34.43506 -24.18274,-47.86778 -8.70718,-22.30115 -14.06985,-51.69149 -12.70538,-69.63222 2.82189,-37.10333 15.80213,-65.55426 41.64535,-91.28095 7.91196,-7.8763 11.307,-10.48463 17.43444,-13.39454 6.82458,-3.24098 8.50416,-3.62447 16.28862,-3.71905 4.77368,-0.058 14.90004,0.29921 22.50303,0.7938 22.57237,1.4684 21.12968,-0.48255 42.22495,57.10074 13.31865,36.35561 16.6045,45.15475 19.55819,52.37457 5.00254,12.22795 4.92754,15.01111 -0.70079,26.00653 -4.9503,9.67083 -13.05,19.79608 -28.49338,35.6189 -4.29448,4.4 -8.28165,9.26679 -8.86036,10.8151 -2.50659,6.70613 -0.44572,12.79669 10.32121,30.50265 16.19301,26.629 30.57888,45.14339 51.11078,65.77873 27.86988,28.0103 51.48552,44.74908 88.72419,62.88775 19.32399,9.41256 24.10626,10.45063 30.41701,6.6025 3.699,-2.25556 20.93361,-20.98157 37.37445,-40.60867 6.4601,-7.71207 12.47814,-14.62988 13.37343,-15.3729 2.91257,-2.41722 9.90397,-2.50908 16.76779,-0.2203 10.61412,3.53932 100.19179,51.12486 104.85223,55.6997 2.15894,2.11929 2.54147,3.50791 2.85239,10.35446 0.67324,14.82509 -5.61489,42.15022 -12.34521,53.64625 -10.1513,17.33935 -35.11564,35.22611 -62.94575,45.10014 -3.81989,1.35528 -11.69489,3.09197 -17.5,3.8593 -5.80511,0.76733 -12.97866,1.85868 -15.94123,2.42522 -5.25116,1.00419 -10.53023,1.11681 -16.61351,0.35443 z" />
                         </svg>
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
          <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm">
             <button 
               className="absolute top-4 right-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-[70]"
               onClick={closeLightbox}
             >
                <X size={32} />
             </button>
             
             <button 
               className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-full transition-colors hidden md:block z-[70]"
               onClick={prevImage}
             >
                <ChevronLeft size={48} />
             </button>

             {/* Main Image Container */}
             <div className="flex-1 w-full h-full flex items-center justify-center p-4 md:p-10 pb-28 animate-fade-in relative">
                <img 
                  src={images[currentImageIndex]} 
                  alt={`View ${currentImageIndex + 1}`} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                />
             </div>

             <button 
               className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-full transition-colors hidden md:block z-[70]"
               onClick={nextImage}
             >
                <ChevronRight size={48} />
             </button>

             {/* Thumbnail Strip (Bottom) */}
             <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex justify-center z-[70] bg-gradient-to-t from-black via-black/80 to-transparent">
                 <div className="flex gap-2 overflow-x-auto max-w-full custom-scrollbar p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                     {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                             e.stopPropagation();
                             setCurrentImageIndex(idx);
                          }}
                          className={`relative w-14 h-14 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ease-out border-2 ${
                             currentImageIndex === idx 
                             ? 'border-white opacity-100 scale-105' 
                             : 'border-transparent opacity-40 hover:opacity-80 hover:scale-105'
                          }`}
                        >
                           <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        </button>
                     ))}
                 </div>
             </div>

             <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md text-sm">
                {currentImageIndex + 1} / {images.length}
             </div>
          </div>
       )}

    </div>
  );
};
