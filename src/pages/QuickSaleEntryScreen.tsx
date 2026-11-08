import React, { useState } from 'react';
import { SalesEntry, Staff, Store } from '../types';
import { formatDisplayDate, todayDateString } from '../utils/dateUtils';
import { calculateAchievementPercent, formatPercent, formatRupees } from '../utils/misCalculator';
import { Zap, Send, RotateCcw, CheckCircle2, AlertCircle, ShoppingBag, Receipt, Clock, Award } from 'lucide-react';

interface Props {
  selectedDate: string;
  allStaff: Staff[];
  stores: Store[];
  todayEntries: SalesEntry[];
  onSubmitSale: (data: {
    date: string;
    staff_id: string;
    staff_name: string;
    store_id: string;
    store_name: string;
    sale_amount: number;
    target_amount: number;
    bill_number: string;
    product_category: string;
    payment_mode: string;
    remarks: string;
  }) => Promise<void>;
  showToast: (msg: string) => void;
}

export const QuickSaleEntryScreen: React.FC<Props> = ({
  selectedDate,
  allStaff,
  stores,
  todayEntries,
  onSubmitSale,
  showToast
}) => {
  const activeStaff = allStaff.filter(s => s.status === 'ACTIVE');

  const [date, setDate] = useState(selectedDate);
  const [selectedStaffId, setSelectedStaffId] = useState(activeStaff[0]?.id || '');
  const [saleAmount, setSaleAmount] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [category, setCategory] = useState('Apparel');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [remarks, setRemarks] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentStaff = activeStaff.find(s => s.id === selectedStaffId);

  // Today's sales by this selected staff
  const staffTodaySales = todayEntries
    .filter(e => e.staff_id === selectedStaffId)
    .reduce((sum, e) => sum + e.sale_amount, 0);

  const staffTodayCount = todayEntries.filter(e => e.staff_id === selectedStaffId).length;

  const handleClear = () => {
    setSaleAmount('');
    setBillNumber('');
    setRemarks('');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!currentStaff) {
      setErrorMsg('Please select a Staff member');
      return;
    }

    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid sale amount');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const storeObj = stores.find(s => s.name === currentStaff.store_name);
      await onSubmitSale({
        date,
        staff_id: currentStaff.id,
        staff_name: currentStaff.name,
        store_id: storeObj?.id || currentStaff.store_id || 'STR-01',
        store_name: currentStaff.store_name,
        sale_amount: amount,
        target_amount: currentStaff.daily_target || 30000,
        bill_number: billNumber || `B-${Math.floor(1000 + Math.random() * 9000)}`,
        product_category: category,
        payment_mode: paymentMode,
        remarks
      });

      setSuccessMsg(`Sale of ${formatRupees(amount)} recorded for ${currentStaff.name}!`);
      showToast(`Sale recorded! Total today: ${formatRupees(staffTodaySales + amount)}`);
      
      // Clear amount and bill number for rapid consecutive entries, but KEEP selected staff!
      setSaleAmount('');
      setBillNumber('');
      setRemarks('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Fast Entry Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={20} color="#2563EB" />
              Fast Mobile Sale Entry
            </h2>
            <p style={{ fontSize: '11px', color: '#64748B' }}>Optimized for 5-10 second counter entry workflow</p>
          </div>

          {currentStaff && (
            <div style={{
              backgroundColor: '#EFF6FF',
              padding: '6px 10px',
              borderRadius: '8px',
              textAlign: 'right'
            }}>
              <span style={{ fontSize: '9px', color: '#64748B', display: 'block' }}>Staff Today Total</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E3A8A' }}>
                {formatRupees(staffTodaySales)} ({staffTodayCount} sales)
              </span>
            </div>
          )}
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
          {/* Staff Searchable Dropdown */}
          <div>
            <label style={labelStyle}>Select Staff (Active Counter) *</label>
            <select
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
              required
              style={{ ...inputStyle, fontSize: '15px', fontWeight: 700, color: '#1E3A8A' }}
            >
              <option value="">-- Choose Staff Member --</option>
              {activeStaff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.store_name})
                </option>
              ))}
            </select>
          </div>

          {/* Sale Amount - Large Numeric Input */}
          <div>
            <label style={labelStyle}>Sale Amount (₹) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '12px', fontSize: '18px', fontWeight: 800, color: '#2563EB' }}>₹</span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                step="any"
                value={saleAmount}
                onChange={e => setSaleAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 34px',
                  borderRadius: '10px',
                  border: '2px solid #2563EB',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0F172A',
                  backgroundColor: '#F8FAFC',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Bill Number & Product Category */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Bill Number (Optional)</label>
              <input
                type="text"
                value={billNumber}
                onChange={e => setBillNumber(e.target.value)}
                placeholder="e.g. B-105"
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={inputStyle}
              >
                <option value="Apparel">Apparel</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Electronics">Electronics</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label style={labelStyle}>Payment Mode</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['UPI', 'Cash', 'Card', 'Other'] as const).map(mode => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: paymentMode === mode ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    backgroundColor: paymentMode === mode ? '#EFF6FF' : '#FFFFFF',
                    color: paymentMode === mode ? '#1E3A8A' : '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Submit and Clear */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={handleClear}
              style={{
                width: '30%',
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
                width: '70%',
                padding: '14px',
                backgroundColor: isSubmitting ? '#93C5FD' : '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Send size={18} />
              {isSubmitting ? 'Saving Sale...' : 'Save Sale (Fast)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '4px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  fontSize: '13px',
  backgroundColor: '#FFFFFF',
  outline: 'none'
};
