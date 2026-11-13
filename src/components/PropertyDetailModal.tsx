import React, { useState } from 'react';
import { Property, PropertyStatus } from '../types/property';
import { formatPrice, formatDate, formatDateTime } from '../utils/formatters';
import {
  X,
  MapPin,
  Building,
  Maximize2,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  BadgeCheck,
  Edit,
  Trash2,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
  BookmarkPlus,
  Check,
  Phone,
  Coins,
  FileText,
  Copy,
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onEdit: (property: Property) => void;
  onOpenStatusModal: (property: Property, targetStatus: PropertyStatus) => void;
  onDeleteRequest: (property: Property) => void;
}

export function PropertyDetailModal({
  property,
  onClose,
  onEdit,
  onOpenStatusModal,
  onDeleteRequest,
}: PropertyDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!property) return null;

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80'];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleCopySummary = () => {
    const text = `🏡 *KHM PROPERTY DETAILS*
📌 *ID:* ${property.propertyId}
🏷 *Title:* ${property.title}
🏢 *Type:* ${property.propertyType}
📍 *Project:* ${property.projectName}
🗺 *Location:* ${property.location}
🔢 *Unit/Plot:* ${property.plotUnitNumber}
📐 *Size:* ${property.size} ${property.sizeUnit}
💰 *Asking Price:* ${formatPrice(property.price)}
⚡ *Status:* ${property.status}

📝 *Description:*
${property.description || 'N/A'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-extrabold text-xs tracking-wider">
              {property.propertyId}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                property.status === 'Available'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : property.status === 'Reserved'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}
            >
              {property.status === 'Available' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {property.status === 'Reserved' && <Clock className="w-3.5 h-3.5" />}
              {property.status === 'Sold' && <BadgeCheck className="w-3.5 h-3.5" />}
              <span>{property.status}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopySummary}
              title="Copy Listing Text for WhatsApp or Client"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Image Gallery Viewer */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[16/10] sm:aspect-[2/1] border border-slate-800">
            <img
              src={images[activeImageIndex]}
              alt={`${property.title} - ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Gallery Navigation Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === activeImageIndex ? 'bg-blue-500 w-4' : 'bg-slate-500/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                {property.propertyType}
              </span>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white mt-0.5">
                {property.title}
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 mt-1">
                <Building className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-semibold">{property.projectName}</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-blue-300 font-bold">{property.plotUnitNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="sm:text-right bg-slate-950 p-3.5 rounded-2xl border border-slate-800 shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                Asking Price
              </span>
              <span className="text-xl sm:text-2xl font-black text-white block">
                {formatPrice(property.price)}
              </span>
              <span className="text-[11px] text-slate-400">
                Rate: PKR {Math.round(property.price / (property.size || 1)).toLocaleString()} /{' '}
                {property.sizeUnit}
              </span>
            </div>
          </div>

          {/* Reserved Details Card (if status is Reserved) */}
          {property.status === 'Reserved' && property.reservationDetails && (
            <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Active Reservation Record</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Reserved For (Client):</span>
                  <span className="font-bold text-white text-sm">
                    {property.reservationDetails.clientName}
                  </span>
                </div>
                {property.reservationDetails.clientPhone && (
                  <div>
                    <span className="text-slate-400 block">Client Contact:</span>
                    <span className="font-medium text-slate-200 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-400" />
                      {property.reservationDetails.clientPhone}
                    </span>
                  </div>
                )}
                {property.reservationDetails.tokenAmount && (
                  <div>
                    <span className="text-slate-400 block">Token Deposit Amount:</span>
                    <span className="font-bold text-amber-300">
                      PKR {property.reservationDetails.tokenAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block">Reservation Date:</span>
                  <span className="text-slate-200">
                    {formatDate(property.reservationDetails.reservationDate)}
                  </span>
                </div>
                {property.reservationDetails.expiryDate && (
                  <div>
                    <span className="text-slate-400 block">Token Expiry:</span>
                    <span className="text-amber-400 font-medium">
                      {formatDate(property.reservationDetails.expiryDate)}
                    </span>
                  </div>
                )}
                {property.reservationDetails.notes && (
                  <div className="sm:col-span-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                    <span className="font-semibold text-slate-400 block">Reservation Remarks:</span>
                    {property.reservationDetails.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sold Details Card (if status is Sold) */}
          {property.status === 'Sold' && property.saleDetails && (
            <div className="bg-purple-950/20 border border-purple-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <BadgeCheck className="w-4 h-4" />
                <span>Closed Sale Record (Protected Record)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Buyer Name:</span>
                  <span className="font-bold text-white text-sm">
                    {property.saleDetails.buyerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Final Closed Price:</span>
                  <span className="font-extrabold text-purple-300 text-sm">
                    {formatPrice(property.saleDetails.finalPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Closing Date:</span>
                  <span className="text-slate-200">
                    {formatDate(property.saleDetails.saleDate)}
                  </span>
                </div>
                {property.saleDetails.buyerPhone && (
                  <div>
                    <span className="text-slate-400 block">Buyer Phone:</span>
                    <span className="text-slate-200">{property.saleDetails.buyerPhone}</span>
                  </div>
                )}
                {property.saleDetails.notes && (
                  <div className="sm:col-span-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                    <span className="font-semibold text-slate-400 block">Sale Closing Notes:</span>
                    {property.saleDetails.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Specifications Grid */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Property Specifications & Dimensions</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Total Area:</span>
                <span className="font-bold text-white text-sm">
                  {property.size} {property.sizeUnit}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Plot/Unit Number:</span>
                <span className="font-bold text-blue-400 text-sm">
                  {property.plotUnitNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Category:</span>
                <span className="font-semibold text-slate-200">
                  {property.propertyType}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Housing Society:</span>
                <span className="font-semibold text-slate-200">
                  {property.projectName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Listing Date:</span>
                <span className="text-slate-300">{formatDate(property.createdAt)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Last Updated:</span>
                <span className="text-slate-300">{formatDateTime(property.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Property Overview & Amenities
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                {property.description}
              </p>
            </div>
          )}

          {/* Internal Staff Tracking Info */}
          <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <span>Created by: {property.createdBy || 'Authorized Agent'}</span>
            <span>Last modified by: {property.updatedBy || 'Staff'}</span>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2.5">
          {/* Status Quick Transitions */}
          <div className="flex flex-wrap items-center gap-2">
            {property.status === 'Available' && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenStatusModal(property, 'Reserved')}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Reserve Property</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenStatusModal(property, 'Sold')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark as Sold</span>
                </button>
              </>
            )}

            {property.status === 'Reserved' && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenStatusModal(property, 'Sold')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Finalize Sale</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenStatusModal(property, 'Available')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore to Available</span>
                </button>
              </>
            )}

            {property.status === 'Sold' && (
              <button
                type="button"
                onClick={() => onOpenStatusModal(property, 'Available')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore to Available (Confirmation Required)</span>
              </button>
            )}
          </div>

          {/* Edit & Delete Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(property)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            {/* Delete button (Strictly disabled if Sold) */}
            <button
              type="button"
              onClick={() => onDeleteRequest(property)}
              disabled={property.status === 'Sold'}
              title={
                property.status === 'Sold'
                  ? 'Sold properties must remain in the database and cannot be deleted.'
                  : 'Delete active property'
              }
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                property.status === 'Sold'
                  ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
