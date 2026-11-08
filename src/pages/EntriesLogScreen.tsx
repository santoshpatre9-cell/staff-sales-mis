import React, { useState } from 'react';
import { SalesEntry } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';
import { calculateAchievementPercent, formatPercent, formatRupees } from '../utils/misCalculator';
import { Search, Edit3, Trash2, X, AlertTriangle } from 'lucide-react';

interface Props {
  entries: SalesEntry[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUpdateEntry: (id: number, data: {
    date: string;
    daily_sales: number;
    daily_target: number;
    bills: number;
    quantity: number;
    remarks: string;
  }) => Promise<void>;
  onDeleteEntry: (id: number) => Promise<void>;
}

export const EntriesLogScreen: React.FC<Props> = ({
  entries,
  searchQuery,
  onSearchChange,
  onUpdateEntry,
  onDeleteEntry
}) => {
  const [editingEntry, setEditingEntry] = useState<SalesEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<SalesEntry | null>(null);

  // Edit form state
  const [editDate, setEditDate] = useState('');
  const [editSales, setEditSales] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editBills, setEditBills] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const startEdit = (entry: SalesEntry) => {
    setEditingEntry(entry);
    setEditDate(entry.date);
    setEditSales(entry.daily_sales.toString());
    setEditTarget(entry.daily_target.toString());
    setEditBills(entry.bills.toString());
    setEditQuantity(entry.quantity.toString());
    setEditRemarks(entry.remarks || '');
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    const sVal = parseFloat(editSales);
    const tVal = parseFloat(editTarget) || 0;
    const bVal = parseInt(editBills, 10) || 0;
    const qVal = parseInt(editQuantity, 10) || 0;

    if (isNaN(sVal) || sVal < 0) {
      setEditError('Sales amount cannot be negative');
      return;
    }
    if (tVal < 0 || bVal < 0 || qVal < 0) {
      setEditError('Target, bills, and quantity cannot be negative');
      return;
    }

    try {
      await onUpdateEntry(editingEntry.id, {
        date: editDate,
        daily_sales: sVal,
        daily_target: tVal,
        bills: bVal,
        quantity: qVal,
        remarks: editRemarks
      });
      setEditingEntry(null);
    } catch (err: any) {
      setEditError(err.message || 'Failed to save changes');
    }
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      await onDeleteEntry(entryToDelete.id);
      setEntryToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by Staff, ID, Store, or Date..."
          style={{
            width: '100%',
            padding: '12px 14px 12px 38px',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            fontSize: '13px',
            backgroundColor: '#FFFFFF',
            outline: 'none'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '10px',
              top: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
          Sales Entries Log ({entries.length})
        </h3>
        <span style={{ fontSize: '11px', color: '#64748B' }}>Tap to edit or delete</span>
      </div>

      {entries.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          color: '#64748B',
          fontSize: '12px',
          border: '1px solid #E2E8F0'
        }}>
          No entries matched your search query.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.map(entry => {
            const ach = calculateAchievementPercent(entry.daily_sales, entry.daily_target);
            const isMet = ach >= 100;

            return (
              <div
                key={entry.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{entry.staff_name}</h4>
                      {entry.is_demo === 1 && (
                        <span style={{
                          backgroundColor: '#F1F5F9',
                          color: '#64748B',
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '4px'
                        }}>
                          DEMO
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748B' }}>
                      {entry.store_name} • ID: {entry.staff_id}
                    </p>
                    <p style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>
                      Date: {formatDisplayDate(entry.date)}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#1E3A8A', display: 'block' }}>
                      {formatRupees(entry.daily_sales)}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isMet ? '#059669' : '#DC2626', display: 'block' }}>
                      Tgt: {formatRupees(entry.daily_target)} ({formatPercent(ach)})
                    </span>
                  </div>
                </div>

                {entry.remarks && (
                  <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                    Remarks: "{entry.remarks}"
                  </p>
                )}

                <div style={{
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {entry.bills} bills • {entry.quantity} units
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => startEdit(entry)}
                      style={{
                        backgroundColor: '#EFF6FF',
                        border: 'none',
                        color: '#2563EB',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit3 size={12} />
                      Edit
                    </button>

                    <button
                      onClick={() => setEntryToDelete(entry)}
                      style={{
                        backgroundColor: '#FEF2F2',
                        border: 'none',
                        color: '#DC2626',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Edit Sales Entry</h3>
                <p style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>
                  {editingEntry.staff_name} ({editingEntry.store_name})
                </p>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div style={{
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                marginBottom: '10px'
              }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={modalLabelStyle}>Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  required
                  style={modalInputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={modalLabelStyle}>Sales (₹)</label>
                  <input
                    type="number"
                    value={editSales}
                    onChange={e => setEditSales(e.target.value)}
                    required
                    style={modalInputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={modalLabelStyle}>Target (₹)</label>
                  <input
                    type="number"
                    value={editTarget}
                    onChange={e => setEditTarget(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={modalLabelStyle}>Bills</label>
                  <input
                    type="number"
                    value={editBills}
                    onChange={e => setEditBills(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={modalLabelStyle}>Units</label>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={e => setEditQuantity(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={modalLabelStyle}>Remarks</label>
                <input
                  type="text"
                  value={editRemarks}
                  onChange={e => setEditRemarks(e.target.value)}
                  style={modalInputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              Confirm Delete Entry?
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4, marginBottom: '16px' }}>
              Are you sure you want to delete the sales record for <strong>{entryToDelete.staff_name}</strong> on <strong>{entryToDelete.date}</strong> ({formatRupees(entryToDelete.daily_sales)})?<br /><br />
              WTD, MTD, and YTD metrics will automatically recalculate.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setEntryToDelete(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const modalLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '2px'
};

const modalInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid #CBD5E1',
  fontSize: '13px',
  outline: 'none'
};
