import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Property, ActivityLog, PropertyStatus, ReservationDetails, SaleDetails } from '../types/property';

const PROPERTIES_COLLECTION = 'properties';
const ACTIVITY_COLLECTION = 'activity_logs';

/**
 * Subscribe to real-time property inventory updates
 */
export function subscribeToProperties(
  onUpdate: (properties: Property[]) => void,
  onError: (error: Error) => void
) {
  const q = query(collection(db, PROPERTIES_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Property[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          propertyId: data.propertyId || '',
          title: data.title || '',
          propertyType: data.propertyType || 'Other',
          projectName: data.projectName || '',
          location: data.location || '',
          plotUnitNumber: data.plotUnitNumber || '',
          size: Number(data.size) || 0,
          sizeUnit: data.sizeUnit || 'Marla',
          price: Number(data.price) || 0,
          description: data.description || '',
          images: Array.isArray(data.images) ? data.images : [],
          status: (data.status as PropertyStatus) || 'Available',
          createdBy: data.createdBy || '',
          updatedBy: data.updatedBy || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          reservationDetails: data.reservationDetails,
          saleDetails: data.saleDetails,
        });
      });
      onUpdate(list);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, PROPERTIES_COLLECTION);
    }
  );
}

/**
 * Subscribe to real-time activity history logs
 */
export function subscribeToActivityLogs(
  onUpdate: (logs: ActivityLog[]) => void,
  onError: (error: Error) => void
) {
  const q = query(collection(db, ACTIVITY_COLLECTION), orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: ActivityLog[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        logs.push({
          id: docSnap.id,
          userEmail: data.userEmail || 'System',
          propertyId: data.propertyId || '',
          propertyTitle: data.propertyTitle || '',
          previousStatus: data.previousStatus,
          newStatus: data.newStatus,
          action: data.action || 'Updated',
          notes: data.notes || '',
          timestamp: data.timestamp || new Date().toISOString(),
        });
      });
      onUpdate(logs);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, ACTIVITY_COLLECTION);
    }
  );
}

/**
 * Check if a custom property ID already exists in the inventory
 */
export async function isPropertyIdDuplicate(propertyId: string, excludeDocId?: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, PROPERTIES_COLLECTION),
      where('propertyId', '==', propertyId.trim().toUpperCase())
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;

    // If an excludeDocId is provided (during edit), verify if it matches other records
    if (excludeDocId) {
      return snapshot.docs.some((d) => d.id !== excludeDocId);
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PROPERTIES_COLLECTION);
    return false;
  }
}

/**
 * Recursively removes all undefined keys from an object to prevent Firestore errors.
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item)) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) {
      continue;
    } else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      cleaned[key] = cleanFirestoreData(val);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned as T;
}

/**
 * Create a new property and log the creation
 */
export async function createProperty(
  propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  userEmail: string
): Promise<string> {
  const normalizedId = propertyData.propertyId.trim().toUpperCase();

  // Validate duplicate
  const exists = await isPropertyIdDuplicate(normalizedId);
  if (exists) {
    throw new Error(`Property ID "${normalizedId}" is already assigned to another inventory unit.`);
  }

  const docRef = doc(collection(db, PROPERTIES_COLLECTION));
  const now = new Date().toISOString();

  const newProperty = cleanFirestoreData({
    ...propertyData,
    propertyId: normalizedId,
    createdAt: now,
    updatedAt: now,
    createdBy: userEmail,
    updatedBy: userEmail,
  });

  try {
    await setDoc(docRef, newProperty);

    // Record activity log
    await recordActivityLog({
      userEmail,
      propertyId: normalizedId,
      propertyTitle: newProperty.title,
      newStatus: newProperty.status,
      action: 'Created',
      notes: `New ${newProperty.propertyType} listed in ${newProperty.projectName} (${newProperty.plotUnitNumber})`,
      timestamp: now,
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${PROPERTIES_COLLECTION}/${docRef.id}`);
  }
}

/**
 * Update an existing property
 */
export async function updateProperty(
  docId: string,
  updatedData: Partial<Property>,
  userEmail: string,
  currentProperty: Property
): Promise<void> {
  if (updatedData.propertyId && updatedData.propertyId !== currentProperty.propertyId) {
    const isDup = await isPropertyIdDuplicate(updatedData.propertyId, docId);
    if (isDup) {
      throw new Error(`Property ID "${updatedData.propertyId}" already exists.`);
    }
  }

  const now = new Date().toISOString();
  const docRef = doc(db, PROPERTIES_COLLECTION, docId);

  const payload = cleanFirestoreData({
    ...updatedData,
    updatedAt: now,
    updatedBy: userEmail,
  });

  try {
    await updateDoc(docRef, payload);

    await recordActivityLog({
      userEmail,
      propertyId: currentProperty.propertyId,
      propertyTitle: updatedData.title || currentProperty.title,
      previousStatus: currentProperty.status,
      newStatus: updatedData.status || currentProperty.status,
      action: 'Updated',
      notes: `Specifications or details modified by ${userEmail}`,
      timestamp: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PROPERTIES_COLLECTION}/${docId}`);
  }
}

/**
 * Change property status (Available -> Reserved, Available/Reserved -> Sold, or Restoring to Available)
 */
export async function updatePropertyStatus(
  property: Property,
  newStatus: PropertyStatus,
  userEmail: string,
  details?: {
    reservation?: ReservationDetails;
    sale?: SaleDetails;
    restoreReason?: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  const docRef = doc(db, PROPERTIES_COLLECTION, property.id);

  const payload: Record<string, any> = {
    status: newStatus,
    updatedAt: now,
    updatedBy: userEmail,
  };

  let action: ActivityLog['action'] = 'Updated';
  let notes = '';

  if (newStatus === 'Reserved') {
    action = 'Reserved';
    if (details?.reservation) {
      payload.reservationDetails = details.reservation;
      notes = `Reserved for client: ${details.reservation.clientName}${
        details.reservation.tokenAmount ? ` (Token: PKR ${details.reservation.tokenAmount.toLocaleString()})` : ''
      }`;
    } else {
      notes = `Marked as Reserved by ${userEmail}`;
    }
  } else if (newStatus === 'Sold') {
    action = 'Sold';
    if (details?.sale) {
      payload.saleDetails = details.sale;
      notes = `Sold to buyer: ${details.sale.buyerName} at final price PKR ${details.sale.finalPrice.toLocaleString()}`;
    } else {
      notes = `Marked as Sold by ${userEmail}`;
    }
  } else if (newStatus === 'Available') {
    action = 'Restored';
    notes = details?.restoreReason
      ? `Restored back to Available: ${details.restoreReason}`
      : `Restored back to Available status from ${property.status} by ${userEmail}`;
  }

  try {
    const cleanedPayload = cleanFirestoreData(payload);
    await updateDoc(docRef, cleanedPayload);

    await recordActivityLog({
      userEmail,
      propertyId: property.propertyId,
      propertyTitle: property.title,
      previousStatus: property.status,
      newStatus,
      action,
      notes,
      timestamp: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PROPERTIES_COLLECTION}/${property.id}`);
  }
}

/**
 * Delete a property (strictly barred if status is Sold)
 */
export async function deleteProperty(property: Property, userEmail: string): Promise<void> {
  if (property.status === 'Sold') {
    throw new Error('Sold properties must remain in the permanent database and cannot be deleted.');
  }

  const docRef = doc(db, PROPERTIES_COLLECTION, property.id);
  const now = new Date().toISOString();

  try {
    await deleteDoc(docRef);

    await recordActivityLog({
      userEmail,
      propertyId: property.propertyId,
      propertyTitle: property.title,
      previousStatus: property.status,
      action: 'Deleted',
      notes: `Property permanently removed from active inventory list by ${userEmail}`,
      timestamp: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PROPERTIES_COLLECTION}/${property.id}`);
  }
}

/**
 * Records an immutable activity history log entry
 */
export async function recordActivityLog(log: Omit<ActivityLog, 'id'>): Promise<void> {
  const docRef = doc(collection(db, ACTIVITY_COLLECTION));
  try {
    const cleaned = cleanFirestoreData(log as Record<string, any>);
    await setDoc(docRef, cleaned);
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}

/**
 * Seeds company sample inventory if the database is fresh
 */
export async function seedSampleProperties(userEmail: string): Promise<void> {
  const samples: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[] = [
    {
      propertyId: 'KHM-RES-001',
      title: 'Corner 1 Kanal Prime Residential Plot',
      propertyType: 'Residential Plot',
      projectName: 'DHA Phase 6',
      location: 'Sector K, Block B, Main Boulevard',
      plotUnitNumber: 'Plot 148-B',
      size: 1,
      sizeUnit: 'Kanal',
      price: 38500000,
      status: 'Available',
      description: 'Exceptional 1 Kanal corner plot on 100ft wide boulevard. Facing lush green community park, underground utilities ready, direct possession.',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      propertyId: 'KHM-COM-012',
      title: 'Ground Floor Commercial Shop with High Footfall',
      propertyType: 'Shop',
      projectName: 'Bahria Town Civic Center',
      location: 'Commercial Zone 1, Rawalpindi',
      plotUnitNumber: 'Shop G-07',
      size: 450,
      sizeUnit: 'Square Feet',
      price: 18000000,
      status: 'Available',
      description: 'Prime retail shop on ground floor facing central plaza. High footfall commercial hub with ample dedicated basement customer parking.',
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      propertyId: 'KHM-VIL-204',
      title: 'Luxury 10 Marla Spanish Designer Villa',
      propertyType: 'Villa',
      projectName: 'Park View City',
      location: 'Overseas Block, Sunset Avenue',
      plotUnitNumber: 'House 412',
      size: 10,
      sizeUnit: 'Marla',
      price: 49500000,
      status: 'Reserved',
      description: 'Brand new 5-bedroom Spanish architecture villa. Double height lobby, imported Italian tiled bathrooms, solar backup and rooftop terrace.',
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
      ],
      reservationDetails: {
        clientName: 'Tariq Mehmood',
        clientPhone: '+92 300 5551234',
        tokenAmount: 2000000,
        reservationDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        expiryDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        notes: 'Token received via pay order. Awaiting final mortgage clearance from bank.',
      },
    },
    {
      propertyId: 'KHM-APT-305',
      title: 'Executive 3-Bed Skyline Penthouse Apartment',
      propertyType: 'Penthouse',
      projectName: 'Gulberg Heights',
      location: 'Block C, Main Gulberg Expressway',
      plotUnitNumber: 'Penthouse 14-A',
      size: 2600,
      sizeUnit: 'Square Feet',
      price: 34000000,
      status: 'Sold',
      description: 'Magnificent top-floor penthouse with panoramic city views, private Jacuzzi on deck, high-speed elevators, and smart home automation.',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      ],
      saleDetails: {
        buyerName: 'Dr. Shahzad Khan',
        buyerPhone: '+92 321 8899000',
        finalPrice: 33500000,
        saleDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        notes: 'Registry transferred and possession handed over successfully.',
      },
    },
    {
      propertyId: 'KHM-RES-055',
      title: '5 Marla Affordable Developed Plot',
      propertyType: 'Residential Plot',
      projectName: 'Blue World City',
      location: 'General Block, Street 9',
      plotUnitNumber: 'Plot 789',
      size: 5,
      sizeUnit: 'Marla',
      price: 3200000,
      status: 'Available',
      description: 'Ready for immediate home construction. Gas, water, electricity lines installed. Easy 10-minute access to motorway interchange.',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
      ],
    },
  ];

  for (const item of samples) {
    try {
      await createProperty(item, userEmail);
    } catch (e) {
      console.warn('Seed item skipped or already exists:', item.propertyId);
    }
  }
}
