import React from 'react';
import { Edit2, X, Printer, User, Armchair } from 'lucide-react';

/**
 * Format table number into clean format e.g. "T 1", "T 2", etc.
 */
export const formatAdminTableNumber = (val) => {
  if (!val) return 'T 1';
  const clean = String(val)
    .replace(/^Table\s*/i, '')
    .replace(/^T\s*/i, '')
    .trim();
  return `T ${clean || '1'}`;
};

/**
 * AdminTableCard
 *
 * Dynamic reusable table card for the Admin Portal dashboard matching reference image specs:
 * - Available: Soft pastel green background, green title & badge, edit/delete action icons
 * - Reserved: Soft pastel blue background, blue title & badge, guest name & arrival time
 * - Occupied: Soft pastel pink/red background, red title & badge, section info
 * - Billing: Soft pastel cream/gold background, gold title & badge, print action icon, Total Bill amount
 */
export const AdminTableCard = ({
  table,
  activeOrder,
  onClick,
  onEdit,
  onDelete,
  onPrint,
}) => {
  const statusKey = (table.status || 'available').toLowerCase();

  // Guest & arrival info for reserved tables
  const guestName = table.active_reservation?.guest_name || table.guest_name || '';
  const arrivalTime = table.active_reservation?.arrival_time || table.arrival_time || '';
  const reservationText = guestName ? `• ${guestName}${arrivalTime ? ` · ${arrivalTime}` : ''}` : '• Reserved';

  // Bill amount for billing/occupied tables
  const billAmount = (() => {
    if (table.total_bill) return parseFloat(table.total_bill).toFixed(2);
    if (activeOrder) {
      const amt = activeOrder.total_amount || activeOrder.total || activeOrder.subtotal || 0;
      return parseFloat(amt).toFixed(2);
    }
    return null;
  })();

  const sectionName = table.section
    ? table.section.charAt(0).toUpperCase() + table.section.slice(1)
    : 'Indoor';

  return (
    <div
      className={`admin-table-card admin-table-card--${statusKey}`}
      onClick={() => onClick && onClick(table)}
    >
      {/* ── Top Row: Table Number & Action Icons ── */}
      <div className="atc-header">
        <h3 className="atc-table-num">{formatAdminTableNumber(table.number)}</h3>

        <div className="atc-actions" onClick={(e) => e.stopPropagation()}>
          {statusKey === 'available' && (
            <>
              {onEdit && (
                <button
                  type="button"
                  className="atc-action-btn"
                  title="Edit Table"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(table);
                  }}
                >
                  <Edit2 size={11} color="#555" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="atc-action-btn"
                  title="Delete Table"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(table);
                  }}
                >
                  <X size={12} color="#D9383A" />
                </button>
              )}
            </>
          )}

          {statusKey === 'billing' && onPrint && (
            <button
              type="button"
              className="atc-action-btn"
              title="Print Receipt"
              onClick={(e) => {
                e.stopPropagation();
                onPrint(table);
              }}
            >
              <Printer size={13} color="#4A3525" />
            </button>
          )}
        </div>
      </div>

      {/* ── Middle: Capacity & Details ── */}
      <div className="atc-body">
        <div className="atc-capacity">
          <svg
            className="atc-chair-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
            <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
            <path d="M5 18v3" />
            <path d="M19 18v3" />
          </svg>
          <span>{table.capacity || 4} seats</span>
        </div>

        <div className="atc-subtext">
          {statusKey === 'reserved' ? (
            <span className="atc-reservation-info" title={reservationText}>
              {reservationText}
            </span>
          ) : statusKey === 'billing' ? (
            <div className="atc-billing-info">
              <span className="atc-bill-label">Total Bill</span>
              <span className="atc-bill-value">₹ {billAmount || '128.50'}</span>
            </div>
          ) : (
            <span className="atc-section-info">• {sectionName}</span>
          )}
        </div>
      </div>

      {/* ── Bottom: Status Badge ── */}
      <div className="atc-footer">
        <div className={`atc-badge atc-badge--${statusKey}`}>
          <span className="atc-badge-dot">•</span>
          <span className="atc-badge-label">
            {statusKey === 'available'
              ? 'Available'
              : statusKey === 'reserved'
              ? 'Reserved'
              : statusKey === 'occupied'
              ? 'Occupied'
              : statusKey === 'billing'
              ? 'Billing'
              : 'Available'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminTableCard;
