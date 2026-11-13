import React, { useState, useMemo } from 'react';
import { Property, PropertyStatus, PropertyType } from '../types/property';
import { PropertyCard } from './PropertyCard';
import { formatPrice } from '../utils/formatters';
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Plus,
  ArrowUpDown,
  Building,
  CheckCircle2,
  Clock,
  BadgeCheck,
  RotateCcw,
} from 'lucide-react';

interface InventoryListProps {
  properties: Property[];
  onViewDetails: (property: Property) => void;
  onEdit: (property: Property) => void;
  onOpenStatusModal: (property: Property, targetStatus: 'Available' | 'Reserved' | 'Sold') => void;
  onOpenAddModal: () => void;
  initialStatusFilter?: PropertyStatus | 'All';
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

export function InventoryList({
  properties,
  onViewDetails,
  onEdit,
  onOpenStatusModal,
  onOpenAddModal,
  initialStatusFilter = 'All',
}: InventoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'All'>(initialStatusFilter);
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'All'>('All');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'size-asc' | 'size-desc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);

  // Extract unique project names
  const uniqueProjects = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      if (p.projectName) set.add(p.projectName);
    });
    return Array.from(set).sort();
  }, [properties]);

  // Counts by status
  const counts = useMemo(() => {
    return {
      all: properties.length,
      available: properties.filter((p) => p.status === 'Available').length,
      reserved: properties.filter((p) => p.status === 'Reserved').length,
      sold: properties.filter((p) => p.status === 'Sold').length,
    };
  }, [properties]);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Status filter
        if (statusFilter !== 'All' && p.status !== statusFilter) return false;

        // Type filter
        if (typeFilter !== 'All' && p.propertyType !== typeFilter) return false;

        // Project filter
        if (projectFilter !== 'All' && p.projectName !== projectFilter) return false;

        // Search Query (ID, Title, Project, Location, PlotUnitNumber)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = p.propertyId?.toLowerCase().includes(q);
          const matchTitle = p.title?.toLowerCase().includes(q);
          const matchProject = p.projectName?.toLowerCase().includes(q);
          const matchLocation = p.location?.toLowerCase().includes(q);
          const matchPlot = p.plotUnitNumber?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchId && !matchTitle && !matchProject && !matchLocation && !matchPlot && !matchDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'size-asc':
            return a.size - b.size;
          case 'size-desc':
            return b.size - a.size;
          default:
            return 0;
        }
      });
  }, [properties, statusFilter, typeFilter, projectFilter, searchQuery, sortBy]);

  const hasActiveFilters =
    statusFilter !== 'All' || typeFilter !== 'All' || projectFilter !== 'All' || searchQuery !== '';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
    setProjectFilter('All');
    setSortBy('newest');
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Top Search & Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          {/* Real-time Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID (e.g. KHM-101), project, location, title..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Drawer Toggle */}
          <button
            type="button"
            onClick={() => setFiltersDrawerOpen(!filtersDrawerOpen)}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filtersDrawerOpen || typeFilter !== 'All' || projectFilter !== 'All'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-950 rounded-xl border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            All Units ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Available')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'Available'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950 text-emerald-400/90 hover:text-emerald-300 border border-slate-800/80'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Available ({counts.available})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Reserved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'Reserved'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-950 text-amber-400/90 hover:text-amber-300 border border-slate-800/80'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Reserved ({counts.reserved})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Sold')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'Sold'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-950 text-purple-400/90 hover:text-purple-300 border border-slate-800/80'
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Sold ({counts.sold})</span>
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {filtersDrawerOpen && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Property Type Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Property Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as PropertyType | 'All')}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Categories</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Project / Society Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Project / Society
              </label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Projects</option>
                {uniqueProjects.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Sort Inventory
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Recently Added (Newest)</option>
                <option value="oldest">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="size-asc">Size: Small to Large</option>
                <option value="size-desc">Size: Large to Small</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Result Status & Clear Filters */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-bold text-white">{filteredProperties.length}</span> of{' '}
          <span className="font-semibold text-slate-300">{properties.length}</span> properties
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3 my-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No properties match your search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, selecting a different status filter, or clearing active filters.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Unit</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onOpenStatusModal={onOpenStatusModal}
            />
          ))}
        </div>
      )}

      {/* List / Table View (Mobile Friendly Dense View) */}
      {viewMode === 'list' && filteredProperties.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-800">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              onClick={() => onViewDetails(property)}
              className="p-3.5 sm:p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                  <img
                    src={
                      property.images && property.images.length > 0
                        ? property.images[0]
                        : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-400 tracking-wider">
                      {property.propertyId}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        property.status === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : property.status === 'Reserved'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                    {property.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {property.projectName} &bull; {property.plotUnitNumber} &bull; {property.size}{' '}
                    {property.sizeUnit}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="text-right shrink-0">
                <span className="text-xs sm:text-sm font-extrabold text-white block">
                  {formatPrice(property.price)}
                </span>
                <span className="text-[10px] text-blue-400 font-medium group-hover:underline">
                  View specs &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
