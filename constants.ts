
import { ActivityItem, Metric, Property, Client } from './types';

export const METRICS: Metric[] = [
  { label: 'Propiedades Disponibles', value: 42, trend: 12, trendDirection: 'up', iconType: 'building' },
  { label: 'Clientes Activos', value: 156, trend: 8, trendDirection: 'up', iconType: 'users' },
  { label: 'Interés en visitar (mes)', value: 112, trend: 15, trendDirection: 'up', iconType: 'heart' },
  { label: 'Tasa de Conversión (Visita vs Cierre)', value: '3.2%', trend: 0.5, trendDirection: 'up', iconType: 'chart' },
];

export const TOP_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Departamento 2 Ambientes',
    address: 'Av. Santa Fe 3200, Palermo',
    price: 125000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
    views: 1240,
    matchesCount: 85,
    interestedClients: 18,
    status: 'active',
    isVisible: true,
    addedAt: '2023-10-15',
    orientation: 'Norte'
  },
  // ... keeping minimal for top list, focus is on GRID_DATA below
];

// Data specifically matched to the user's NEW reference image (Buenos Aires style)
export const PROPERTIES_GRID_DATA: Property[] = [
  {
    id: '101',
    title: 'Departamento con balcón aterrazado',
    description: 'Hermoso departamento de 2 ambientes en el corazón de Palermo Soho. Cuenta con amplio balcón terraza, cocina integrada y dormitorio en suite. El edificio posee pileta y parrilla.',
    address: 'Medrano al 1200',
    price: 156700,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop', // Modern Living
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&q=80&w=600'
    ],
    views: 340, matchesCount: 15, interestedClients: 4, status: 'active', isVisible: true, addedAt: '2024-01-01',
    
    propertyType: 'Departamento',
    operationType: 'Venta',
    
    area: 49, // Total
    totalArea: 49,
    coveredArea: 42,
    
    environments: 2,
    bedrooms: 1,
    bathrooms: 1,
    
    antiquity: 5,
    expenses: 45000,
    
    isCreditSuitable: true,
    isProfessionalSuitable: true,
    orientation: 'Noreste',
    
    amenities: ['Pileta', 'Solarium', 'Parrilla', 'SUM'],
    
    neighborhood: 'Palermo Soho',
    province: 'CABA'
  },
  {
    id: '102',
    title: 'Torre de Categoría',
    description: 'Piso exclusivo en Torre Libertador. Vistas panorámicas al río y ciudad. Palier privado, doble circulación, dependencia de servicio. Amenities de lujo.',
    address: 'Av. Libertador 2400',
    price: 420000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop', // Modern White House/Apt
    images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80&w=600'
    ],
    views: 850, matchesCount: 42, interestedClients: 12, status: 'active', isVisible: true, addedAt: '2024-01-01',
    
    propertyType: 'Piso',
    operationType: 'Venta',
    
    area: 120,
    totalArea: 120,
    coveredArea: 110,
    
    environments: 4,
    bedrooms: 3,
    bathrooms: 2,
    
    antiquity: 15,
    expenses: 120000,
    
    isCreditSuitable: false,
    isProfessionalSuitable: false,
    orientation: 'Este',
    
    amenities: ['Seguridad 24hs', 'Cochera', 'Gimnasio', 'Sauna'],
    
    neighborhood: 'Recoleta',
    province: 'CABA'
  },
  {
    id: '103',
    title: 'PH Sin Expensas',
    description: 'PH tipo casa en planta baja al fondo. Silencioso y luminoso. Patio propio con parrilla. Reciclado a nuevo hace 2 años.',
    address: 'Thames 1500',
    price: 185000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1200&auto=format&fit=crop', // Cozy living
    images: ['https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1200&auto=format&fit=crop'],
    views: 210, matchesCount: 28, interestedClients: 8, status: 'pending', isVisible: true, addedAt: '2024-01-01',
    
    propertyType: 'PH',
    operationType: 'Venta',
    
    area: 85,
    totalArea: 85,
    coveredArea: 60,
    
    environments: 3,
    bedrooms: 2,
    bathrooms: 1,
    
    antiquity: 40,
    expenses: 0,
    
    isCreditSuitable: true,
    isProfessionalSuitable: false,
    orientation: 'Norte',
    
    amenities: ['Patio', 'Parrilla'],
    
    neighborhood: 'Palermo Hollywood',
    province: 'CABA'
  },
  {
    id: '104',
    title: 'Semipiso con Vista al Rio',
    description: 'Semipiso alto con excelente vista. Balcón corrido. Cocina comedor diario. Cochera fija cubierta.',
    address: 'Olazábal 4800',
    price: 290000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=1200&auto=format&fit=crop', // Glass window view
    images: ['https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=1200&auto=format&fit=crop'],
    views: 150, matchesCount: 9, interestedClients: 2, status: 'active', isVisible: true, addedAt: '2024-01-01',
    
    propertyType: 'Departamento',
    operationType: 'Venta',
    
    area: 95,
    totalArea: 95,
    coveredArea: 88,
    
    environments: 3,
    bedrooms: 2,
    bathrooms: 2,
    
    antiquity: 12,
    expenses: 85000,
    
    isCreditSuitable: true,
    isProfessionalSuitable: true,
    orientation: 'Noreste',
    
    amenities: ['Cochera', 'Baulera'],
    
    neighborhood: 'Villa Urquiza',
    province: 'CABA'
  },
  {
    id: '105',
    title: 'Oportunidad Inversión',
    description: 'Oficina comercial en microcentro. Ideal renta. Apto profesional por reglamento.',
    address: 'Lavalle 900',
    price: 78000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop', // Office
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop'],
    views: 95, matchesCount: 5, interestedClients: 0, status: 'pending', isVisible: false, addedAt: '2024-01-01',
    
    propertyType: 'Oficina',
    operationType: 'Venta',
    
    area: 45,
    totalArea: 45,
    coveredArea: 45,
    
    environments: 1,
    bedrooms: 0,
    bathrooms: 1,
    
    antiquity: 35,
    expenses: 32000,
    
    isCreditSuitable: true,
    isProfessionalSuitable: true,
    orientation: 'Frente',
    
    amenities: ['Seguridad', 'Ascensor'],
    
    neighborhood: 'Microcentro',
    province: 'CABA'
  },
  {
    id: '106',
    title: 'Monoambiente Divisible',
    description: 'Amplio monoambiente en L, fácilmente divisible. Cocina separada. Baño completo.',
    address: 'Soler 3400',
    price: 95000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?q=80&w=1200&auto=format&fit=crop', // Studio
    images: ['https://images.unsplash.com/photo-1556020685-ae41abfc9365?q=80&w=1200&auto=format&fit=crop'],
    views: 410, matchesCount: 35, interestedClients: 11, status: 'active', isVisible: true, addedAt: '2024-01-01',
    
    propertyType: 'Departamento',
    operationType: 'Venta',
    
    area: 38,
    totalArea: 38,
    coveredArea: 35,
    
    environments: 1,
    bedrooms: 0,
    bathrooms: 1,
    
    antiquity: 8,
    expenses: 28000,
    
    isCreditSuitable: true,
    isProfessionalSuitable: true,
    orientation: 'Oeste',
    
    amenities: ['Laundry'],
    
    neighborhood: 'Palermo',
    province: 'CABA'
  },
  {
    id: '107',
    title: 'Casa Lote Propio',
    description: 'Casa sobre lote propio de 8.66 x 30. Jardín al fondo. Garage para 2 autos. Necesita actualizaciones.',
    address: 'Melincué 3000',
    price: 310000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop', // House Exterior
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop'],
    views: 65, matchesCount: 8, interestedClients: 3, status: 'active', isVisible: true, addedAt: '2024-01-01',
    
    propertyType: 'Casa',
    operationType: 'Venta',
    
    area: 220,
    totalArea: 220,
    coveredArea: 180,
    
    environments: 5,
    bedrooms: 3,
    bathrooms: 2,
    
    antiquity: 50,
    expenses: 0,
    
    isCreditSuitable: false,
    isProfessionalSuitable: false,
    orientation: 'Norte',
    
    amenities: ['Jardín', 'Garage', 'Parrilla'],
    
    neighborhood: 'Villa del Parque',
    province: 'CABA'
  },
  {
    id: '108',
    title: 'Duplex con Terraza',
    description: 'Moderno duplex con terraza propia y parrilla. Pisos de madera. Calefacción por radiadores.',
    address: 'Cramer 2100',
    price: 235000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200&auto=format&fit=crop', // Modern Living 2
    images: ['https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200&auto=format&fit=crop'],
    views: 180, matchesCount: 16, interestedClients: 5, status: 'active', isVisible: true, addedAt: '2024-01-01',
    
    propertyType: 'PH',
    operationType: 'Venta',
    
    area: 110,
    totalArea: 110,
    coveredArea: 90,
    
    environments: 3,
    bedrooms: 2,
    bathrooms: 2,
    
    antiquity: 10,
    expenses: 15000,
    
    isCreditSuitable: true,
    isProfessionalSuitable: true,
    orientation: 'Sur',
    
    amenities: ['Terraza', 'Parrilla'],
    
    neighborhood: 'Belgrano',
    province: 'CABA'
  }
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: '1', type: 'interest', description: 'María González marcó interés en Dpto 2 amb Palermo', time: 'Hace 2 horas', userAvatar: 'https://picsum.photos/50/50?random=10' },
  { id: '2', type: 'new_property', description: 'Nueva propiedad agregada: Casa 3 dorm Villa Urquiza', time: 'Hace 5 horas' },
  { id: '3', type: 'update', description: 'Jorge Pérez actualizó sus parámetros de búsqueda', time: 'Hace 1 día', userAvatar: 'https://picsum.photos/50/50?random=11' },
  { id: '4', type: 'match', description: 'Match automático: 3 propiedades enviadas a Lucía Mendez', time: 'Hace 1 día', userAvatar: 'https://picsum.photos/50/50?random=12' },
  { id: '5', type: 'interest', description: 'Consulta recibida por WhatsApp para Loft Industrial', time: 'Hace 2 días' },
];

export const CHART_DATA = [
  { name: 'Sem 1', props: 4, interests: 12 },
  { name: 'Sem 2', props: 6, interests: 18 },
  { name: 'Sem 3', props: 3, interests: 15 },
  { name: 'Sem 4', props: 8, interests: 28 },
];

export const CONVERSION_DATA = [
  { name: 'Ene', visitas: 45, compras: 2 },
  { name: 'Feb', visitas: 52, compras: 3 },
  { name: 'Mar', visitas: 38, compras: 1 },
  { name: 'Abr', visitas: 65, compras: 4 },
  { name: 'May', visitas: 48, compras: 2 },
  { name: 'Jun', visitas: 72, compras: 5 },
];

export const CLIENTS_DATA: Client[] = [
  {
    id: '1',
    name: 'Tahsan Khan',
    email: 'tahsankhan380@gmail.com',
    avatar: 'https://picsum.photos/50/50?random=20',
    date: '06 Ene, 2025',
    groups: [],
    searchParams: {
       type: 'Departamento',
       maxPrice: 125000,
       currency: 'USD',
       environments: '2',
       location: 'Palermo',
       hasGarage: false,
       isCreditSuitable: true,
       isProfessionalSuitable: false
    },
    activityScore: 12,
    status: 'inactive'
  },
  {
    id: '2',
    name: 'Herry Kane',
    email: 'herrykane@gmail.com',
    avatar: 'https://picsum.photos/50/50?random=21',
    date: '07 Ene, 2025',
    groups: [],
    searchParams: {
       type: 'Departamento',
       maxPrice: 850,
       currency: 'USD',
       environments: '1',
       location: 'Recoleta',
       hasGarage: false,
       isCreditSuitable: false,
       isProfessionalSuitable: true
    },
    activityScore: 24,
    status: 'inactive'
  },
  {
    id: '3',
    name: 'Anwar Hussen',
    email: 'anwarhussen247@gmail.com',
    avatar: 'https://picsum.photos/50/50?random=22',
    date: '08 Ene, 2025',
    groups: [],
    searchParams: {
       type: 'Inversión Pozo',
       maxPrice: 90000,
       currency: 'USD',
       environments: '2',
       location: 'CABA',
       hasGarage: false,
       isCreditSuitable: false,
       isProfessionalSuitable: false
    },
    activityScore: 20,
    status: 'active'
  },
  {
    id: '4',
    name: 'Tim David',
    email: 'timdavid@gmail.com',
    avatar: 'https://picsum.photos/50/50?random=23',
    date: '09 Ene, 2025',
    groups: [],
    searchParams: {
       type: 'Casa',
       maxPrice: 350000,
       currency: 'USD',
       environments: '4+',
       location: 'Devoto',
       hasGarage: true,
       isCreditSuitable: true,
       isProfessionalSuitable: false
    },
    activityScore: 18,
    status: 'inactive'
  },
  {
    id: '5',
    name: 'David Warner',
    email: 'davidwarner@gmail.com',
    avatar: 'https://picsum.photos/50/50?random=24',
    date: '10 Ene, 2025',
    groups: [],
    searchParams: {
       type: 'PH',
       maxPrice: 180000,
       currency: 'USD',
       environments: '3',
       location: 'Villa Urquiza',
       hasGarage: false,
       isCreditSuitable: true,
       isProfessionalSuitable: false
    },
    activityScore: 15,
    status: 'inactive'
  },
  {
    id: '6',
    name: 'Herry Brooks',
    email: 'herrybrooks@gmail.com',
    avatar: 'https://picsum.photos/50/50?random=25',
    date: '11 Ene, 2025',
    groups: [],
    searchParams: {
       type: 'Casa',
       maxPrice: 450000,
       currency: 'USD',
       environments: '5+',
       location: 'Zona Norte',
       hasGarage: true,
       isCreditSuitable: false,
       isProfessionalSuitable: true
    },
    activityScore: 11,
    status: 'inactive'
  },
  {
    id: '7',
    name: 'Matt Henry',
    email: 'matthenry@gmail.com',
    avatar: 'https://picsum.photos/50/50?random=26',
    date: '12 Ene, 2025',
    groups: [],
    searchParams: {
       type: 'Oficina',
       maxPrice: 1200,
       currency: 'USD',
       environments: '2',
       location: 'Microcentro',
       hasGarage: true,
       isCreditSuitable: false,
       isProfessionalSuitable: true
    },
    activityScore: 8,
    status: 'inactive'
  },
  {
    id: '8',
    name: 'Nill Wagner',
    email: 'nillwagner@gmail.com',
    avatar: 'https://picsum.photos/50/50?random=27',
    date: '13 Ene, 2025',
    groups: [],
    searchParams: {
       type: 'Terreno',
       maxPrice: 80000,
       currency: 'USD',
       environments: '-',
       location: 'Pilar',
       hasGarage: false,
       isCreditSuitable: false,
       isProfessionalSuitable: false
    },
    activityScore: 17,
    status: 'inactive'
  }
];
