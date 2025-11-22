
export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  currency: string;
  imageUrl: string;
  views: number;
  matchesCount: number;
  interestedClients: number;
  status: 'active' | 'pending' | 'sold';
  addedAt: string;
  
  // Basic Details
  propertyType?: string; // Casa, PH, Departamento
  operationType?: 'Venta' | 'Alquiler';
  description?: string;
  images?: string[]; // Array of photo URLs

  // Dimensions
  totalArea?: number; // Metros cuadrados totales
  coveredArea?: number; // Metros cuadrados cubiertos
  
  // Distribution
  environments?: number; // Ambientes
  bedrooms?: number; // Dormitorios
  bathrooms?: number; // Baños
  
  // Specifics
  antiquity?: number; // Años de antigüedad
  expenses?: number; // Expensas value
  
  // Boolean Flags
  isCreditSuitable?: boolean; // Apto crédito
  isProfessionalSuitable?: boolean; // Apto profesional
  
  // Extras
  amenities?: string[];
  orientation?: string; // Orientación (Norte, Sur, Este, Oeste, etc)
  
  // Location
  neighborhood?: string;
  province?: string;
  
  // Legacy optional fields (keeping for compatibility if needed, though mostly replaced)
  beds?: number; 
  rentStatus?: 'Rent' | 'Due' | 'Empty';
  tenants?: string[];
  area?: number; // Keeping as alias for totalArea often used in grid
}

export interface Metric {
  label: string;
  value: string | number;
  trend: number; // percentage
  trendDirection: 'up' | 'down';
  iconType: 'building' | 'users' | 'heart' | 'chart';
}

export interface ActivityItem {
  id: string;
  type: 'interest' | 'new_property' | 'update' | 'match';
  description: string;
  time: string;
  userAvatar?: string;
}

export interface ScrapedData {
  // This matches the Property structure closely for the form
  title: string;
  price: string;
  address: string;
  description: string;
  features: {
    beds: number;
    baths: number;
    area: number;
    coveredArea: number;
    environments: number;
  };
  details: {
    antiquity: number;
    expenses: number;
    isCreditSuitable: boolean;
    isProfessionalSuitable: boolean;
    operationType: 'Venta' | 'Alquiler';
    propertyType: string;
  };
  location: {
    neighborhood: string;
    province: string;
  };
  amenities: string[];
  images: string[];
}

export interface SearchParams {
  type: string;
  maxPrice: number;
  currency: string;
  environments: string | number; // '2' or '3+'
  location: string;
  hasGarage?: boolean;
  isCreditSuitable?: boolean;
  isProfessionalSuitable?: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string;
  date: string;
  groups: string[];
  searchParams: SearchParams;
  activityScore: number;
  status: 'active' | 'inactive';
}