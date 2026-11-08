import React, { useState } from 'react';
import { SalesEntry, Staff } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';
import { calculateAchievementPercent, formatPercent, formatRupees } from '../utils/misCalculator';
import { User, Send, RotateCcw, CheckCircle2, AlertCircle, Award } from 'lucide-react';

interface Props {
  selectedDate: string;
  allStaff: Staff[];
  todayEntries: SalesEntry[];
  onSubmitEntry: (entry: {
    date: string;
    staff_id: string;
    staff_name: string;
    store_id: string;
    store_name: string;
    sale_amount: number;
    qty: number;
    ff: number;
    big_bill: number;
    bill_number: string;
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
  const [saleAmount, setSaleAmount] = useState('');
  const [qty, setQty] = useState('1');
  const [ff, setFF] = useState('1');
  const [bigBill, setBigBill] = useState('0');
  const [billNumber, setBillNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedStaff = allStaff.find(s => s.id === selectedStaffId);

  // Compute live FTD for selected staff from todayEntries
  const staffTodayEntries = todayEntries.filter(e => e.staff_id === selectedStaffId && e.date === date);
  const ftdSale = staffTodayEntries.reduce((sum, e) => sum + e.sale_amount, 0);
  const ftdQty = staffTodayEntries.reduce((sum, e) => sum + (e.qty ?? 1), 0);
  const ftdFF = staffTodayEntries.reduce((sum, e) => sum + (e.ff ?? 1), 0);
  const ftdBigBill = staffTodayEntries.reduce((sum, e) => sum + (e.big_bill ?? 0), 0);

  const saleTarget = selectedStaff?.daily_sale_target || selectedStaff?.daily_target || 25000;
  const qtyTarget = selectedStaff?.daily_qty_target || 20;
  const ffTarget = selectedStaff?.daily_ff_target || 5;
  const bigBillTarget = selectedStaff?.daily_big_bill_target || 2;

  const handleClear = () => {
    setSaleAmount('');
    setQty('1');
    setFF('1');
    setBigBill('0');
    setBillNumber('');
    setRemarks('');
    setErrorMsg(null);
  };

  const handleSaleChange = (val: string) => {
    setSaleAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 10000) {
      setBigBill('1');
    } else if (!isNaN(num) && num < 10000) {
      setBigBill('0');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedStaff) {
      setErrorMsg('Please select your Staff Name / ID');
      return;
    }

    const sVal = parseFloat(saleAmount);
    if (isNaN(sVal) || sVal < 0) {
      setErrorMsg('Sale amount cannot be empty or negative');
      return;
    }

    const qVal = parseInt(qty, 10) || 1;
    const fVal = parseInt(ff, 10) || 1;
    const bVal = parseInt(bigBill, 10) || 0;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await onSubmitEntry({
        date,
        staff_id: selectedStaff.id,
        staff_name: selectedStaff.name,
        store_id: selectedStaff.store_id || 'STR-01',
        store_name: selectedStaff.store_name,
        sale_amount: sVal,
        qty: qVal,
        ff: fVal,
        big_bill: bVal,
        bill_number: billNumber,
        remarks
      });

      setSuccessMsg(`✓ Sale of ${formatRupees(sVal)} recorded successfully!`);
      handleClear();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit sale entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Entry Form Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A8A' }}>Fast Mobile Sale Entry</h2>
            <p style={{ fontSize: '12px', color: '#64748B' }}>Enter individual retail sale in 5–10 seconds</p>
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
          {/* Staff Selector */}
          <div>
            <label style={labelStyle}>Staff Member *</label>
            <select
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">-- Select Staff Name --</option>
              {allStaff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.store_name})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Store */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Store</label>
              <input
                type="text"
                value={selectedStaff ? selectedStaff.store_name : ''}
                readOnly
                placeholder="Auto store"
                style={{ ...inputStyle, backgroundColor: '#F8FAFC', color: '#64748B' }}
              />
            </div>
          </div>

          {/* Sale Amount (Large Numeric Input) */}
          <div>
            <label style={labelStyle}>Sale Amount (₹) *</label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min="0"
              step="any"
              value={saleAmount}
              onChange={e => handleSaleChange(e.target.value)}
              placeholder="e.g. 5000"
              required
              style={{ ...inputStyle, fontSize: '18px', fontWeight: 700, color: '#1E3A8A', padding: '14px' }}
            />
          </div>

          {/* Qty, FF, Big Bill */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Quantity (Qty)</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={qty}
                onChange={e => setQty(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Footfall (FF)</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={ff}
                onChange={e => setFF(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Big Bill (0/1)</label>
              <select
                value={bigBill}
                onChange={e => setBigBill(e.target.value)}
                style={inputStyle}
              >
                <option value="0">0 (Normal)</option>
                <option value="1">1 (Big Bill)</option>
              </select>
            </div>
          </div>

          {/* Bill Number & Remarks */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Bill Number (Optional)</label>
              <input
                type="text"
                value={billNumber}
                onChange={e => setBillNumber(e.target.value)}
                placeholder="e.g. B-101"
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Remarks (Optional)</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. UPI / Cash"
                style={inputStyle}
              />
            </div>
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
              {isSubmitting ? 'Saving...' : 'SUBMIT SALE'}
            </button>
          </div>
        </form>
      </div>

      {/* Live FTD Performance Card for Selected Staff */}
      {selectedStaff && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Award size={18} color="#2563EB" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              {selectedStaff.name} - FTD (Today's Live Performance)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {/* Sale */}
            <div style={metricBoxStyle}>
              <span style={metricTitleStyle}>SALE</span>
              <span style={metricValueStyle}>{formatRupees(ftdSale)}</span>
              <span style={metricSubStyle}>Target: {formatRupees(saleTarget)}</span>
              <span style={{ ...metricBadgeStyle, color: ftdSale >= saleTarget ? '#059669' : '#DC2626' }}>
                {formatPercent(calculateAchievementPercent(ftdSale, saleTarget))}
              </span>
            </div>

            {/* Qty */}
            <div style={metricBoxStyle}>
              <span style={metricTitleStyle}>QTY (Units)</span>
              <span style={metricValueStyle}>{ftdQty}</span>
              <span style={metricSubStyle}>Target: {qtyTarget}</span>
              <span style={{ ...metricBadgeStyle, color: ftdQty >= qtyTarget ? '#059669' : '#DC2626' }}>
                {formatPercent(calculateAchievementPercent(ftdQty, qtyTarget))}
              </span>
            </div>

            {/* FF */}
            <div style={metricBoxStyle}>
              <span style={metricTitleStyle}>FF (Footfall)</span>
              <span style={metricValueStyle}>{ftdFF}</span>
              <span style={metricSubStyle}>Target: {ffTarget}</span>
              <span style={{ ...metricBadgeStyle, color: ftdFF >= ffTarget ? '#059669' : '#DC2626' }}>
                {formatPercent(calculateAchievementPercent(ftdFF, ffTarget))}
              </span>
            </div>

            {/* Big Bill */}
            <div style={metricBoxStyle}>
              <span style={metricTitleStyle}>BIG BILL</span>
              <span style={metricValueStyle}>{ftdBigBill}</span>
              <span style={metricSubStyle}>Target: {bigBillTarget}</span>
              <span style={{ ...metricBadgeStyle, color: ftdBigBill >= bigBillTarget ? '#059669' : '#DC2626' }}>
                {formatPercent(calculateAchievementPercent(ftdBigBill, bigBillTarget))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Today's Transactions Log */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
            Today's Sale History ({todayEntries.length})
          </h3>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            {formatDisplayDate(date)}
          </span>
        </div>

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
            No transactions recorded yet for today.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayEntries.map(entry => (
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
                    {entry.time} • Bill: {entry.bill_number || 'N/A'} • Cat: {entry.product_category}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E3A8A', display: 'block' }}>
                    {formatRupees(entry.sale_amount)}
                  </span>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    Qty: {entry.qty} | FF: {entry.ff} | BB: {entry.big_bill}
                  </span>
                </div>
              </div>
            ))}
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
  outline: 'none'
};

const metricBoxStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '10px',
  padding: '10px',
  border: '1px solid #E2E8F0',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const metricTitleStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748B'
};

const metricValueStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
  color: '#1E3A8A'
};

const metricSubStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#64748B'
};

const metricBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  marginTop: '2px'
};
