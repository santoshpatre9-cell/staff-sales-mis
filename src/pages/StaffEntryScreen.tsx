import React, { useState } from 'react';
import { SalesEntry, Staff } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';
import { calculateAchievementPercent, formatPercent, formatRupees } from '../utils/misCalculator';
import { User, Calendar, Store as StoreIcon, Send, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  selectedDate: string;
  allStaff: Staff[];
  todayEntries: SalesEntry[];
  onSubmitEntry: (entry: {
    date: string;
    staff_id: string;
    staff_name: string;
    store_name: string;
    daily_sales: number;
    daily_target: number;
    bills: number;
    quantity: number;
    remarks: string;
  }) => Promise<void>;
}

export const StaffEntryScreen: React.FC<Props> = ({
  selectedDate,
  allStaff,
  todayEntries,
  onSubmitEntry
}) => {
  const [date, setDate] = useState(selectedDate);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [sales, setSales] = useState('');
  const [target, setTarget] = useState('');
  const [bills, setBills] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedStaff = allStaff.find(s => s.id === selectedStaffId);

  const handleClear = () => {
    setSales('');
    setTarget('');
    setBills('');
    setQuantity('');
    setRemarks('');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedStaff) {
      setErrorMsg('Please select your Staff Name / ID');
      return;
    }

    const sVal = parseFloat(sales);
    if (isNaN(sVal) || sVal < 0) {
      setErrorMsg('Daily sales amount cannot be empty or negative');
      return;
    }

    const tVal = parseFloat(target) || 0;
    const bVal = parseInt(bills, 10) || 0;
    const qVal = parseInt(quantity, 10) || 0;

    if (tVal < 0 || bVal < 0 || qVal < 0) {
      setErrorMsg('Target, bills, and quantity cannot be negative');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await onSubmitEntry({
        date,
        staff_id: selectedStaff.id,
        staff_name: selectedStaff.name,
        store_name: selectedStaff.store_name,
        daily_sales: sVal,
        daily_target: tVal,
        bills: bVal,
        quantity: qVal,
        remarks
      });

      setSuccessMsg(`Daily sales of ${formatRupees(sVal)} recorded for ${selectedStaff.name}!`);
      handleClear();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit sales entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Form Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A8A' }}>Staff Daily Sales Entry</h2>
            <p style={{ fontSize: '12px', color: '#64748B' }}>Submit your retail counter numbers in 30 seconds</p>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB'
          }}>
            <User size={20} />
          </div>
        </div>

        {/* Feedback Banners */}
        {successMsg && (
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Date Field */}
          <div>
            <label style={labelStyle}>Date *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Staff Selector */}
          <div>
            <label style={labelStyle}>Select Staff Name / ID *</label>
            <select
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">-- Choose Staff Member --</option>
              {allStaff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id}) - {s.store_name}
                </option>
              ))}
            </select>
          </div>

          {/* Store Name (Auto-filled) */}
          <div>
            <label style={labelStyle}>Store Name (Auto-filled)</label>
            <input
              type="text"
              value={selectedStaff ? selectedStaff.store_name : ''}
              readOnly
              placeholder="Store will appear after selecting staff"
              style={{ ...inputStyle, backgroundColor: '#F8FAFC', color: '#64748B' }}
            />
          </div>

          {/* Sales Amount & Daily Target */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Daily Sales (₹) *</label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                step="any"
                value={sales}
                onChange={e => setSales(e.target.value)}
                placeholder="e.g. 25000"
                required
                style={{ ...inputStyle, fontSize: '16px', fontWeight: 600, color: '#1E3A8A' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Daily Target (₹)</label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                step="any"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="e.g. 30000"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Bills & Quantity */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Bills (Count)</label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                value={bills}
                onChange={e => setBills(e.target.value)}
                placeholder="e.g. 15"
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Quantity (Units)</label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="e.g. 24"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label style={labelStyle}>Remarks (Optional)</label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g. Strong evening footfall, top seller"
              style={inputStyle}
            />
          </div>

          {/* Submit and Clear Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={handleClear}
              style={{
                width: '35%',
                padding: '14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={15} />
              Clear
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '65%',
                padding: '14px',
                backgroundColor: isSubmitting ? '#93C5FD' : '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 3px 8px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Send size={16} />
              {isSubmitting ? 'Saving...' : 'Submit Daily Sales'}
            </button>
          </div>
        </form>
      </div>

      {/* Today's Submissions List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
            Today's Submissions ({todayEntries.length})
          </h3>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            {formatDisplayDate(date)}
          </span>
        </div>

        {todayEntries.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            color: '#64748B',
            fontSize: '12px',
            border: '1px solid #E2E8F0'
          }}>
            No sales recorded yet for {formatDisplayDate(date)}. Use the form above to submit your numbers.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayEntries.map(entry => {
              const ach = calculateAchievementPercent(entry.daily_sales, entry.daily_target);
              const isMet = ach >= 100;

              return (
                <div
                  key={entry.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{entry.staff_name}</h4>
                    <p style={{ fontSize: '11px', color: '#64748B' }}>
                      {entry.store_name} • ID: {entry.staff_id}
                    </p>
                    {entry.remarks && (
                      <p style={{ fontSize: '11px', color: '#2563EB', marginTop: '2px', fontStyle: 'italic' }}>
                        "{entry.remarks}"
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E3A8A', display: 'block' }}>
                      {formatRupees(entry.daily_sales)}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isMet ? '#059669' : '#DC2626',
                      display: 'block'
                    }}>
                      Tgt: {formatRupees(entry.daily_target)} • {formatPercent(ach)}
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748B' }}>
                      {entry.bills} bills • {entry.quantity} units
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '4px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  fontSize: '14px',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  transition: 'border-color 0.15s ease'
};
