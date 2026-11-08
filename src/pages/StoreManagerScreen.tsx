import React, { useState } from 'react';
import { SalesEntry, Staff, Store } from '../types';
import { formatDisplayDate, getMtdStartDate, getWtdStartDate, getYtdStartDate } from '../utils/dateUtils';
import { calculateAchievementPercent, formatPercent, formatRupees } from '../utils/misCalculator';
import { Store as StoreIcon, Sparkles, Send, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  selectedDate: string;
  allStores: Store[];
  allStaff: Staff[];
  allSales: SalesEntry[];
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

export const StoreManagerScreen: React.FC<Props> = ({
  selectedDate,
  allStores,
  allStaff,
  allSales,
  todayEntries,
  onSubmitEntry
}) => {
  const [date, setDate] = useState(selectedDate);
  const [selectedStoreName, setSelectedStoreName] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [target, setTarget] = useState('');
  const [sales, setSales] = useState('');
  const [bills, setBills] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available staff for chosen store
  const availableStaff = selectedStoreName
    ? allStaff.filter(s => s.store_name === selectedStoreName)
    : allStaff;

  const currentStaff = allStaff.find(s => s.id === selectedStaffId);

  // Live Auto-MIS Calculations
  const inputSales = parseFloat(sales) || 0;
  const inputTarget = parseFloat(target) || 0;
  const liveDailyAch = calculateAchievementPercent(inputSales, inputTarget);
  const liveShortfall = Math.max(0, inputTarget - inputSales);
  const liveExcess = Math.max(0, inputSales - inputTarget);

  const wtdStart = getWtdStartDate(date);
  const mtdStart = getMtdStartDate(date);
  const ytdStart = getYtdStartDate(date);

  const pastEntries = allSales.filter(
    e => e.staff_id === selectedStaffId && e.date !== date && e.date <= date
  );

  const pastWtdSales = pastEntries.filter(e => e.date >= wtdStart).reduce((sum, e) => sum + e.daily_sales, 0);
  const pastWtdTarget = pastEntries.filter(e => e.date >= wtdStart).reduce((sum, e) => sum + e.daily_target, 0);

  const pastMtdSales = pastEntries.filter(e => e.date >= mtdStart).reduce((sum, e) => sum + e.daily_sales, 0);
  const pastMtdTarget = pastEntries.filter(e => e.date >= mtdStart).reduce((sum, e) => sum + e.daily_target, 0);

  const pastYtdSales = pastEntries.filter(e => e.date >= ytdStart).reduce((sum, e) => sum + e.daily_sales, 0);
  const pastYtdTarget = pastEntries.filter(e => e.date >= ytdStart).reduce((sum, e) => sum + e.daily_target, 0);

  const liveWtdSales = pastWtdSales + inputSales;
  const liveWtdTarget = pastWtdTarget + inputTarget;
  const liveWtdAch = calculateAchievementPercent(liveWtdSales, liveWtdTarget);

  const liveMtdSales = pastMtdSales + inputSales;
  const liveMtdTarget = pastMtdTarget + inputTarget;
  const liveMtdAch = calculateAchievementPercent(liveMtdSales, liveMtdTarget);

  const liveYtdSales = pastYtdSales + inputSales;
  const liveYtdTarget = pastYtdTarget + inputTarget;
  const liveYtdAch = calculateAchievementPercent(liveYtdSales, liveYtdTarget);

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

    if (!selectedStoreName) {
      setErrorMsg('Please select a Store');
      return;
    }
    if (!currentStaff) {
      setErrorMsg('Please select a Staff Member');
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
        staff_id: currentStaff.id,
        staff_name: currentStaff.name,
        store_name: selectedStoreName,
        daily_sales: sVal,
        daily_target: tVal,
        bills: bVal,
        quantity: qVal,
        remarks
      });

      setSuccessMsg(`Daily sales of ${formatRupees(sVal)} recorded for ${currentStaff.name}! WTD/MTD/YTD updated.`);
      handleClear();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Rapid Entry Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A8A' }}>Store Manager Rapid Entry</h2>
            <p style={{ fontSize: '12px', color: '#64748B' }}>Only enter daily figures — WTD, MTD, YTD compute automatically</p>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#EEF2FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4F46E5'
          }}>
            <StoreIcon size={20} />
          </div>
        </div>

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
          {/* Date Picker */}
          <div>
            <label style={labelStyle}>Date *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* Store Selector */}
          <div>
            <label style={labelStyle}>Store *</label>
            <select
              value={selectedStoreName}
              onChange={e => {
                setSelectedStoreName(e.target.value);
                setSelectedStaffId('');
              }}
              required
              style={inputStyle}
            >
              <option value="">-- Choose Store --</option>
              {allStores.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.location})
                </option>
              ))}
            </select>
          </div>

          {/* Staff Selector */}
          <div>
            <label style={labelStyle}>Staff Member *</label>
            <select
              value={selectedStaffId}
              onChange={e => {
                setSelectedStaffId(e.target.value);
                const st = allStaff.find(s => s.id === e.target.value);
                if (st && !selectedStoreName) {
                  setSelectedStoreName(st.store_name);
                }
              }}
              required
              style={inputStyle}
            >
              <option value="">-- Choose Staff Member --</option>
              {availableStaff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          {/* Target & Sales */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Daily Target (₹) *</label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                step="any"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="e.g. 30000"
                required
                style={inputStyle}
              />
            </div>

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
                style={{ ...inputStyle, fontWeight: 700, color: '#1E3A8A' }}
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
                placeholder="e.g. 12"
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
                placeholder="e.g. 18"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label style={labelStyle}>Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g. Footfall note, promo feedback"
              style={inputStyle}
            />
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* LIVE AUTOMATIC MIS CALCULATION PREVIEW BOX */}
          {/* ----------------------------------------------------------------- */}
          <div style={{
            backgroundColor: '#EEF2FF',
            borderRadius: '12px',
            border: '1px solid #C7D2FE',
            padding: '14px',
            marginTop: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: '#4338CA' }}>
                <Sparkles size={14} />
                LIVE AUTOMATIC MIS CALCULATION
              </span>
              <span style={{ fontSize: '10px', color: '#64748B' }}>Zero manual math</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Daily Achievement</span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: liveDailyAch >= 100 ? '#059669' : liveDailyAch >= 80 ? '#2563EB' : '#DC2626'
                }}>
                  {formatPercent(liveDailyAch)}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                {liveShortfall > 0 ? (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Daily Shortfall</span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#DC2626' }}>
                      {formatRupees(liveShortfall)}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Daily Excess</span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#059669' }}>
                      {formatRupees(liveExcess)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* WTD, MTD, YTD Matrix */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', display: 'block' }}>WTD</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E3A8A', display: 'block' }}>
                  {formatRupees(liveWtdSales)}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: liveWtdAch >= 100 ? '#059669' : '#2563EB' }}>
                  {formatPercent(liveWtdAch)}
                </span>
              </div>

              <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', display: 'block' }}>MTD</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E3A8A', display: 'block' }}>
                  {formatRupees(liveMtdSales)}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: liveMtdAch >= 100 ? '#059669' : '#2563EB' }}>
                  {formatPercent(liveMtdAch)}
                </span>
              </div>

              <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', display: 'block' }}>YTD</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E3A8A', display: 'block' }}>
                  {formatRupees(liveYtdSales)}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: liveYtdAch >= 100 ? '#059669' : '#2563EB' }}>
                  {formatPercent(liveYtdAch)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
                backgroundColor: isSubmitting ? '#A5B4FC' : '#4F46E5',
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
                boxShadow: '0 3px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Send size={16} />
              {isSubmitting ? 'Updating MIS...' : 'Submit & Auto-Calculate'}
            </button>
          </div>
        </form>
      </div>

      {/* Today's Logged Sales */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
          Today's Logged Sales ({todayEntries.length})
        </h3>

        {todayEntries.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            color: '#64748B',
            fontSize: '12px',
            border: '1px solid #E2E8F0'
          }}>
            No entries logged for today yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayEntries.map(e => {
              const ach = calculateAchievementPercent(e.daily_sales, e.daily_target);
              return (
                <div
                  key={e.id}
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
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{e.staff_name}</h4>
                    <p style={{ fontSize: '11px', color: '#64748B' }}>{e.store_name} • ID: {e.staff_id}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E3A8A', display: 'block' }}>
                      {formatRupees(e.daily_sales)}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: ach >= 100 ? '#059669' : '#DC2626' }}>
                      Tgt: {formatRupees(e.daily_target)} ({formatPercent(ach)})
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
