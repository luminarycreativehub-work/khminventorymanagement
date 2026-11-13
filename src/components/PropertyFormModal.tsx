import React, { useState, useEffect } from 'react';
import { Property, PropertyType, SizeUnit, PropertyStatus } from '../types/property';
import { isPropertyIdDuplicate } from '../services/propertyService';
import { formatPrice } from '../utils/formatters';
import {
  X,
  AlertCircle,
  Plus,
  Sparkles,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => Promise<void>;
  initialData?: Property | null;
  existingProperties: Property[];
}

const PROPERTY_TYPES: PropertyType[] = [
  'Residential Plot',
  'Commercial Plot',
  'House',
  'Apartment',
  'Shop',
  'Villa',
  'Penthouse',
  'Office',
  'Warehouse',
  'Farmhouse',
  'Other',
];

const SIZE_UNITS: SizeUnit[] = [
  'Marla',
  'Kanal',
  'Square Yards',
  'Square Feet',
  'Acres',
];

const POPULAR_PROJECTS = [
  'DHA Phase 6',
  'Bahria Town',
  'Park View City',
  'Gulberg Greens',
  'Blue World City',
  'Capital Smart City',
  'F-7 Sector Islamabad',
];

export function PropertyFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingProperties,
}: PropertyFormModalProps) {
  const isEditing = Boolean(initialData);

  const [propertyId, setPropertyId] = useState('');
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Residential Plot');
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [plotUnitNumber, setPlotUnitNumber] = useState('');
  const [size, setSize] = useState<number | ''>('');
  const [sizeUnit, setSizeUnit] = useState<SizeUnit>('Marla');
  const [price, setPrice] = useState<number | ''>('');
  const [status, setStatus] = useState<PropertyStatus>('Available');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [duplicateIdError, setDuplicateIdError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPropertyId(initialData.propertyId);
      setTitle(initialData.title);
      setPropertyType(initialData.propertyType);
      setProjectName(initialData.projectName);
      setLocation(initialData.location);
      setPlotUnitNumber(initialData.plotUnitNumber);
      setSize(initialData.size);
      setSizeUnit(initialData.sizeUnit);
      setPrice(initialData.price);
      setStatus(initialData.status);
      setDescription(initialData.description || '');
      setImages(initialData.images || []);
    } else {
      // Auto-generate fresh ID
      generateNewId('Residential Plot');
      setTitle('');
      setPropertyType('Residential Plot');
      setProjectName('DHA Phase 6');
      setLocation('Sector J, Street 4');
      setPlotUnitNumber('');
      setSize(10);
      setSizeUnit('Marla');
      setPrice('');
      setStatus('Available');
      setDescription('');
      setImages([]);
    }
    setDuplicateIdError(null);
    setFormError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Auto-generate unique ID based on type and number
  const generateNewId = (type: PropertyType) => {
    let prefix = 'PLT';
    if (type.includes('Commercial')) prefix = 'COM';
    else if (type === 'House' || type === 'Villa') prefix = 'HSE';
    else if (type === 'Apartment' || type === 'Penthouse') prefix = 'APT';
    else if (type === 'Shop') prefix = 'SHP';
    else if (type === 'Office') prefix = 'OFC';

    const count = existingProperties.length + 1;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const suggested = `KHM-${prefix}-${randomSuffix}`;
    setPropertyId(suggested);
    checkDuplicate(suggested);
  };

  const checkDuplicate = async (id: string) => {
    if (!id.trim()) {
      setDuplicateIdError(null);
      return;
    }
    const dup = await isPropertyIdDuplicate(id, initialData?.id);
    if (dup) {
      setDuplicateIdError(`Property ID "${id.toUpperCase()}" is already assigned to another unit.`);
    } else {
      setDuplicateIdError(null);
    }
  };

  const handleIdChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    setPropertyId(clean);
    checkDuplicate(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!propertyId.trim()) {
      setFormError('Property ID is required.');
      return;
    }
    if (duplicateIdError) {
      setFormError('Please resolve duplicate Property ID before saving.');
      return;
    }
    if (!title.trim()) {
      setFormError('Property title is required.');
      return;
    }
    if (!projectName.trim()) {
      setFormError('Project or Society name is required.');
      return;
    }
    if (!plotUnitNumber.trim()) {
      setFormError('Plot or Unit number is required.');
      return;
    }
    if (!size || size <= 0) {
      setFormError('Please provide a valid property size.');
      return;
    }
    if (price === '' || price < 0) {
      setFormError('Please provide a valid asking price.');
      return;
    }

    setSubmitting(true);
    try {
      const propertyPayload: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> = {
        propertyId: propertyId.trim().toUpperCase(),
        title: title.trim(),
        propertyType,
        projectName: projectName.trim(),
        location: location.trim(),
        plotUnitNumber: plotUnitNumber.trim(),
        size: Number(size),
        sizeUnit,
        price: Number(price),
        status,
        description: description.trim(),
        images,
        ...(initialData?.reservationDetails ? { reservationDetails: initialData.reservationDetails } : {}),
        ...(initialData?.saleDetails ? { saleDetails: initialData.saleDetails } : {}),
      };
      await onSubmit(propertyPayload);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isEditing ? `Edit Property (${propertyId})` : 'Add New Inventory Unit'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Enter official specifications and real estate details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Row 1: Property ID & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Property ID <span className="text-rose-400">*</span>
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => generateNewId(propertyType)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate ID</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={propertyId}
                onChange={(e) => handleIdChange(e.target.value)}
                placeholder="e.g. KHM-RES-101"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-white text-xs sm:text-sm uppercase font-mono tracking-wider focus:outline-none focus:ring-1 ${
                  duplicateIdError
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {duplicateIdError && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{duplicateIdError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Current Inventory Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Available">Available (Open for sale)</option>
                <option value="Reserved">Reserved (Deposit taken)</option>
                <option value="Sold">Sold (Closed transaction)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Property Title / Headline <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Corner 1 Kanal Prime Plot Facing Park"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Row 3: Category & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Property Type / Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => {
                  const newType = e.target.value as PropertyType;
                  setPropertyType(newType);
                  if (!isEditing) generateNewId(newType);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project or Society Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. DHA Phase 6"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {POPULAR_PROJECTS.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProjectName(p)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Plot/Unit Number & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Plot or Unit Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={plotUnitNumber}
                onChange={(e) => setPlotUnitNumber(e.target.value)}
                placeholder="e.g. Plot 148-B, Shop G-12, Flat 501"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Location & Sector Address
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sector K, Main Boulevard, Lahore"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 5: Size, Size Unit & Asking Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Size (Numeric) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                value={size}
                onChange={(e) => setSize(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g. 10 or 500"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Size Unit <span className="text-rose-400">*</span>
              </label>
              <select
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value as SizeUnit)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                {SIZE_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Asking Price (PKR) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g. 38500000"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              {price !== '' && !isNaN(Number(price)) && (
                <p className="text-[10px] text-blue-400 font-medium mt-1 truncate">
                  {formatPrice(Number(price))}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description, Amenities & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter features (e.g. 100ft road, corner, park facing, possession ready, underground electricity, gas available)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || Boolean(duplicateIdError)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Inventory Property'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
