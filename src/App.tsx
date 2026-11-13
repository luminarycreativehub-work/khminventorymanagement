/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { ActivityHistory } from './components/ActivityHistory';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { PropertyFormModal } from './components/PropertyFormModal';
import { StatusChangeModal } from './components/StatusChangeModal';
import { ConfirmModal } from './components/ConfirmModal';
import {
  subscribeToProperties,
  subscribeToActivityLogs,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
  seedSampleProperties,
} from './services/propertyService';
import { Property, ActivityLog, PropertyStatus, ReservationDetails, SaleDetails } from './types/property';
import { Building2, AlertCircle, WifiOff } from 'lucide-react';

function MainApp() {
  const { user, loading: authLoading, isOnline } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'inventory' | 'activity'>('dashboard');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<PropertyStatus | 'All'>('All');

  // Modals State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [statusModalTarget, setStatusModalTarget] = useState<{
    property: Property;
    targetStatus: PropertyStatus;
  } | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Firestore Subscriptions
  useEffect(() => {
    if (!user) return;

    setInventoryLoading(true);
    setFirestoreError(null);

    const unsubProps = subscribeToProperties(
      (list) => {
        setProperties(list);
        setInventoryLoading(false);
      },
      (err) => {
        console.error('Properties sync error:', err);
        setFirestoreError(err.message || 'Failed to synchronize properties from Firestore.');
        setInventoryLoading(false);
      }
    );

    const unsubLogs = subscribeToActivityLogs(
      (logs) => {
        setActivityLogs(logs);
      },
      (err) => {
        console.error('Activity logs sync error:', err);
      }
    );

    return () => {
      unsubProps();
      unsubLogs();
    };
  }, [user]);

  // Keep selectedProperty in sync with real-time updates
  useEffect(() => {
    if (selectedProperty) {
      const updated = properties.find((p) => p.id === selectedProperty.id);
      if (updated) {
        setSelectedProperty(updated);
      }
    }
  }, [properties]);

  // Handle Loading Auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 mb-4 animate-pulse">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-lg font-bold">KHM Property Manager</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to Firestore Central Database...</p>
      </div>
    );
  }

  // Handle Unauthenticated
  if (!user) {
    return <AuthScreen />;
  }

  // Handlers
  const handleOpenAddModal = () => {
    setPropertyToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditProperty = (prop: Property) => {
    setPropertyToEdit(prop);
    setIsFormOpen(true);
    // If detail modal was open, close it
    setSelectedProperty(null);
  };

  const handleFormSubmit = async (
    data: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ) => {
    const userEmail = user.email || 'agent@khm.com';
    if (propertyToEdit) {
      await updateProperty(propertyToEdit.id, data, userEmail, propertyToEdit);
      showToast(`Property ${data.propertyId} updated successfully.`);
    } else {
      await createProperty(data, userEmail);
      showToast(`Property ${data.propertyId} added to inventory.`);
    }
  };

  const handleOpenStatusModal = (property: Property, targetStatus: PropertyStatus) => {
    setStatusModalTarget({ property, targetStatus });
  };

  const handleConfirmStatusChange = async (
    prop: Property,
    newStatus: PropertyStatus,
    details?: {
      reservation?: ReservationDetails;
      sale?: SaleDetails;
      restoreReason?: string;
    }
  ) => {
    const userEmail = user.email || 'agent@khm.com';
    await updatePropertyStatus(prop, newStatus, userEmail, details);
    showToast(`Status updated: ${prop.propertyId} is now ${newStatus}`);
  };

  const handleDeleteRequest = (prop: Property) => {
    if (prop.status === 'Sold') {
      showToast('Sold properties must remain in the permanent database and cannot be deleted.');
      return;
    }
    setPropertyToDelete(prop);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      const userEmail = user.email || 'agent@khm.com';
      await deleteProperty(propertyToDelete, userEmail);
      showToast(`Property ${propertyToDelete.propertyId} deleted.`);
      setPropertyToDelete(null);
      if (selectedProperty?.id === propertyToDelete.id) {
        setSelectedProperty(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete property.');
    }
  };

  const handleNavigateWithFilter = (status: PropertyStatus | 'All') => {
    setInventoryStatusFilter(status);
    setCurrentTab('inventory');
  };

  const handleSelectPropertyById = (propId: string) => {
    const found = properties.find(
      (p) => p.propertyId.toUpperCase() === propId.toUpperCase()
    );
    if (found) {
      setSelectedProperty(found);
    } else {
      showToast(`Property ${propId} was not found in active inventory.`);
    }
  };

  const handleSeedCompanyData = async () => {
    setSeeding(true);
    try {
      const userEmail = user.email || 'admin@khm.com';
      await seedSampleProperties(userEmail);
      showToast('Sample company inventory seeded successfully!');
    } catch (err: any) {
      console.error('Seeding error:', err);
      showToast(err.message || 'Seeding error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddModal={handleOpenAddModal}
        totalProperties={properties.length}
      />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Device is currently offline. Real-time Firestore sync will resume when connected.</span>
        </div>
      )}

      {/* Firestore Error Alert */}
      {firestoreError && (
        <div className="bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs px-4 py-2 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{firestoreError}</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-blue-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        {inventoryLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading inventory from Cloud Firestore...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                properties={properties}
                activityLogs={activityLogs}
                onNavigateToInventoryWithFilter={handleNavigateWithFilter}
                onOpenAddModal={handleOpenAddModal}
                onSeedSampleData={handleSeedCompanyData}
                seeding={seeding}
                onSelectPropertyById={handleSelectPropertyById}
              />
            )}

            {currentTab === 'inventory' && (
              <InventoryList
                properties={properties}
                onViewDetails={(p) => setSelectedProperty(p)}
                onEdit={handleEditProperty}
                onOpenStatusModal={handleOpenStatusModal}
                onOpenAddModal={handleOpenAddModal}
                initialStatusFilter={inventoryStatusFilter}
              />
            )}

            {currentTab === 'activity' && (
              <ActivityHistory
                activityLogs={activityLogs}
                onSelectPropertyById={handleSelectPropertyById}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddModal={handleOpenAddModal}
        totalProperties={properties.length}
      />

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEdit={handleEditProperty}
          onOpenStatusModal={handleOpenStatusModal}
          onDeleteRequest={handleDeleteRequest}
        />
      )}

      {/* Property Add / Edit Form Modal */}
      {isFormOpen && (
        <PropertyFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setPropertyToEdit(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={propertyToEdit}
          existingProperties={properties}
        />
      )}

      {/* Status Change Modal (Reserve, Mark Sold, Restore) */}
      {statusModalTarget && (
        <StatusChangeModal
          property={statusModalTarget.property}
          targetStatus={statusModalTarget.targetStatus}
          onClose={() => setStatusModalTarget(null)}
          onConfirm={handleConfirmStatusChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <ConfirmModal
          isOpen={Boolean(propertyToDelete)}
          title={`Delete Property ${propertyToDelete.propertyId}?`}
          message={`Are you sure you want to permanently delete "${propertyToDelete.title}"? This action cannot be undone.`}
          confirmLabel="Delete Property"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPropertyToDelete(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
