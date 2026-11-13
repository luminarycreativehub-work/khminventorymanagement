import React, { useState } from 'react';
import { Property, PropertyStatus, ReservationDetails, SaleDetails } from '../types/property';
import { formatPrice } from '../utils/formatters';
import {
  X,
  AlertTriangle,
  BookmarkPlus,
  BadgeCheck,
  RotateCcw,
  User,
  Phone,
  Coins,
  Calendar,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface StatusChangeModalProps {
  property: Property | null;
  targetStatus: PropertyStatus | null;
  onClose: () => void;
  onConfirm: (
    property: Property,
    newStatus: PropertyStatus,
    details?: {
      reservation?: ReservationDetails;
      sale?: SaleDetails;
      restoreReason?: string;
    }
  ) => Promise<void>;
}

export function StatusChangeModal({
  property,
  targetStatus,
  onClose,
  onConfirm,
}: StatusChangeModalProps) {
  if (!property || !targetStatus) return null;

  // Reservation Form State
  const [clientName, setClientName] = useState(property.reservationDetails?.clientName || '');
  const [clientPhone, setClientPhone] = useState(property.reservationDetails?.clientPhone || '');
  const [tokenAmount, setTokenAmount] = useState<number | ''>(
    property.reservationDetails?.tokenAmount || ''
  );
  const [expiryDate, setExpiryDate] = useState(
    property.reservationDetails?.expiryDate
      ? property.reservationDetails.expiryDate.split('T')[0]
      : ''
  );
  const [reservationNotes, setReservationNotes] = useState(
    property.reservationDetails?.notes || ''
  );

  // Sale Form State
  const [buyerName, setBuyerName] = useState(property.saleDetails?.buyerName || '');
  const [buyerPhone, setBuyerPhone] = useState(property.saleDetails?.buyerPhone || '');
  const [finalPrice, setFinalPrice] = useState<number | ''>(
    property.saleDetails?.finalPrice || property.price || ''
  );
  const [saleDate, setSaleDate] = useState(
    property.saleDetails?.saleDate
      ? property.saleDetails.saleDate.split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [saleNotes, setSaleNotes] = useState(property.saleDetails?.notes || '');

  // Restoration Form State
  const [restoreReason, setRestoreReason] = useState('');
  const [confirmedRestore, setConfirmedRestore] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (targetStatus === 'Reserved') {
      if (!clientName.trim()) {
        setError('Client name is required for reservations.');
        return;
      }
    } else if (targetStatus === 'Sold') {
      if (!buyerName.trim()) {
        setError('Buyer name is required to mark property as sold.');
        return;
      }
      if (finalPrice === '' || Number(finalPrice) <= 0) {
        setError('Please enter a valid final sale price.');
        return;
      }
    } else if (targetStatus === 'Available') {
      if (!confirmedRestore) {
        setError('Please check the confirmation box to restore this property.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (targetStatus === 'Reserved') {
        const resObj: ReservationDetails = {
          clientName: clientName.trim(),
          reservationDate: new Date().toISOString(),
          ...(clientPhone.trim() ? { clientPhone: clientPhone.trim() } : {}),
          ...(tokenAmount !== '' ? { tokenAmount: Number(tokenAmount) } : {}),
          ...(expiryDate ? { expiryDate: new Date(expiryDate).toISOString() } : {}),
          ...(reservationNotes.trim() ? { notes: reservationNotes.trim() } : {}),
        };
        await onConfirm(property, 'Reserved', { reservation: resObj });
      } else if (targetStatus === 'Sold') {
        const saleObj: SaleDetails = {
          buyerName: buyerName.trim(),
          finalPrice: Number(finalPrice),
          saleDate: saleDate ? new Date(saleDate).toISOString() : new Date().toISOString(),
          ...(buyerPhone.trim() ? { buyerPhone: buyerPhone.trim() } : {}),
          ...(saleNotes.trim() ? { notes: saleNotes.trim() } : {}),
        };
        await onConfirm(property, 'Sold', { sale: saleObj });
      } else if (targetStatus === 'Available') {
        await onConfirm(property, 'Available', {
          restoreReason: restoreReason.trim() || 'Restored by agent',
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update property status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {targetStatus === 'Reserved' && (
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <BookmarkPlus className="w-4 h-4" />
              </div>
            )}
            {targetStatus === 'Sold' && (
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <BadgeCheck className="w-4 h-4" />
              </div>
            )}
            {targetStatus === 'Available' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <RotateCcw className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {targetStatus === 'Reserved' && `Reserve Property ${property.propertyId}`}
                {targetStatus === 'Sold' && `Record Sale for ${property.propertyId}`}
                {targetStatus === 'Available' && `Restore Property ${property.propertyId}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                {property.title} &bull; {property.projectName}
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* RESERVATION FORM */}
          {targetStatus === 'Reserved' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                Marking this property as <strong>Reserved</strong> temporarily holds the unit for a client and displays a reserved badge to all team members.
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Client / Customer Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Client Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Token Deposit Amount (PKR)
                  </label>
                  <div className="relative">
                    <Coins className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={tokenAmount}
                      onChange={(e) =>
                        setTokenAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      placeholder="e.g. 1000000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reservation Expiry Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reservation Terms & Notes
                </label>
                <textarea
                  rows={2}
                  value={reservationNotes}
                  onChange={(e) => setReservationNotes(e.target.value)}
                  placeholder="Token payment method, payment deadline, agent remarks..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* SOLD FORM */}
          {targetStatus === 'Sold' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs">
                Marking this property as <strong>Sold</strong> finalizes the deal. By company policy, sold properties are permanent records and cannot be deleted.
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Buyer Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Dr. Shahzad Khan"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Final Closed Price (PKR) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Coins className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="1000"
                      value={finalPrice}
                      onChange={(e) =>
                        setFinalPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      placeholder={property.price.toString()}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  {finalPrice !== '' && !isNaN(Number(finalPrice)) && (
                    <p className="text-[10px] text-purple-300 font-medium mt-1 truncate">
                      {formatPrice(Number(finalPrice))}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Closing Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Buyer Contact / Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+92 321 8899000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Transaction Notes & Transfer Details
                </label>
                <textarea
                  rows={2}
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="Registry number, pay order details, transfer office..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* RESTORATION CONFIRMATION FORM */}
          {targetStatus === 'Available' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Mandatory Explicit Status Reversal Confirmation</span>
                </div>
                <p className="leading-relaxed">
                  You are about to restore this {property.status} property back to <strong>Available</strong> status. This will reopen the listing across the company database and log an official reversal in the audit history.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reason for Reopening Inventory <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={restoreReason}
                  onChange={(e) => setRestoreReason(e.target.value)}
                  placeholder="e.g. Token reservation expired, buyer backed out, or agreement cancellation..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedRestore}
                  onChange={(e) => setConfirmedRestore(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-xs text-slate-300 leading-normal select-none">
                  I explicitly confirm that I am authorized to restore this property back to Available inventory.
                </span>
              </label>
            </div>
          )}

          {/* Submit Action */}
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
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer ${
                targetStatus === 'Reserved'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : targetStatus === 'Sold'
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {targetStatus === 'Reserved' && 'Confirm Reservation'}
                    {targetStatus === 'Sold' && 'Confirm Sale & Close'}
                    {targetStatus === 'Available' && 'Restore to Available'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
