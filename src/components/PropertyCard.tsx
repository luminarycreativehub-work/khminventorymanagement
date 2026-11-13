import React from 'react';
import { Property } from '../types/property';
import { formatPrice } from '../utils/formatters';
import {
  MapPin,
  Maximize2,
  Building,
  CheckCircle2,
  Clock,
  BadgeCheck,
  Image as ImageIcon,
  MoreVertical,
  Edit,
  RotateCcw,
  Check,
  BookmarkPlus,
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onEdit: (property: Property) => void;
  onOpenStatusModal: (property: Property, targetStatus: 'Available' | 'Reserved' | 'Sold') => void;
}

export function PropertyCard({
  property,
  onViewDetails,
  onEdit,
  onOpenStatusModal,
}: PropertyCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const getStatusBadge = () => {
    switch (property.status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Available</span>
          </span>
        );
      case 'Reserved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Reserved</span>
          </span>
        );
      case 'Sold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <BadgeCheck className="w-3 h-3" />
            <span>Sold</span>
          </span>
        );
    }
  };

  const primaryImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group relative">
      {/* Image Thumbnail Header */}
      <div
        onClick={() => onViewDetails(property)}
        className="relative h-44 sm:h-48 w-full bg-slate-950 overflow-hidden cursor-pointer"
      >
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          {/* Property ID */}
          <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-blue-400 text-xs font-extrabold tracking-wider border border-slate-700/80 shadow-md">
            {property.propertyId}
          </span>

          {/* Status Badge */}
          <div className="backdrop-blur-md">{getStatusBadge()}</div>
        </div>

        {/* Bottom Overlay Info on Thumbnail */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white">
          <span className="px-2 py-0.5 rounded bg-blue-600/90 text-[11px] font-semibold">
            {property.propertyType}
          </span>

          {property.images && property.images.length > 1 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-[11px] text-slate-300">
              <ImageIcon className="w-3 h-3" />
              <span>{property.images.length} photos</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={() => onViewDetails(property)}
            className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
          >
            {property.title}
          </h3>

          {/* Project & Unit */}
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium mt-1">
            <Building className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-slate-200">{property.projectName}</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-blue-400 font-bold">{property.plotUnitNumber}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
            <span>{property.location}</span>
          </div>

          {/* Specs: Size and Unit */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-400">
              <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Size:</span>
              <span className="font-bold text-slate-200">
                {property.size} {property.sizeUnit}
              </span>
            </div>

            {property.status === 'Reserved' && property.reservationDetails?.clientName && (
              <span className="text-[11px] text-amber-400 truncate max-w-[130px]">
                Hold: {property.reservationDetails.clientName}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Price & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Asking Price
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white">
              {formatPrice(property.price)}
            </span>
          </div>

          {/* Actions & Dropdown */}
          <div className="flex items-center gap-1.5 relative">
            <button
              type="button"
              onClick={() => onViewDetails(property)}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-semibold border border-blue-500/30 transition-all cursor-pointer"
            >
              Details
            </button>

            {/* Quick Actions Menu Trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 bottom-full mb-1 z-30 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1 text-xs text-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(property);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-400" />
                    <span>Edit Specifications</span>
                  </button>

                  {property.status === 'Available' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenStatusModal(property, 'Reserved');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-amber-400 cursor-pointer"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Mark as Reserved</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenStatusModal(property, 'Sold');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-purple-400 cursor-pointer"
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
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenStatusModal(property, 'Sold');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-purple-400 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Sold</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenStatusModal(property, 'Available');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-emerald-400 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore to Available</span>
                      </button>
                    </>
                  )}

                  {property.status === 'Sold' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenStatusModal(property, 'Available');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-emerald-400 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore to Available</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
