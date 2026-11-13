export type PropertyStatus = 'Available' | 'Reserved' | 'Sold';

export type PropertyType =
  | 'Residential Plot'
  | 'Commercial Plot'
  | 'House'
  | 'Apartment'
  | 'Shop'
  | 'Villa'
  | 'Penthouse'
  | 'Office'
  | 'Warehouse'
  | 'Farmhouse'
  | 'Other';

export type SizeUnit =
  | 'Square Yards'
  | 'Square Feet'
  | 'Marla'
  | 'Kanal'
  | 'Acres';

export interface ReservationDetails {
  clientName: string;
  clientPhone?: string;
  tokenAmount?: number;
  reservationDate: string;
  expiryDate?: string;
  notes?: string;
  agentEmail?: string;
}

export interface SaleDetails {
  buyerName: string;
  buyerPhone?: string;
  finalPrice: number;
  saleDate: string;
  notes?: string;
  agentEmail?: string;
}

export interface Property {
  id: string; // Firestore document ID
  propertyId: string; // Business unique code e.g. KHM-RES-001
  title: string;
  propertyType: PropertyType;
  projectName: string;
  location: string;
  plotUnitNumber: string;
  size: number;
  sizeUnit: SizeUnit;
  price: number;
  description: string;
  images: string[];
  status: PropertyStatus;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  reservationDetails?: ReservationDetails;
  saleDetails?: SaleDetails;
}

export interface ActivityLog {
  id: string;
  userEmail: string;
  propertyId: string;
  propertyTitle: string;
  previousStatus?: PropertyStatus;
  newStatus?: PropertyStatus;
  action: 'Created' | 'Updated' | 'Reserved' | 'Sold' | 'Restored' | 'Deleted';
  notes?: string;
  timestamp: string;
}

export interface PropertyFilters {
  searchQuery: string;
  status: PropertyStatus | 'All';
  propertyType: PropertyType | 'All';
  projectName: string | 'All';
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'size-asc' | 'size-desc';
}
