import React, { useState } from 'react';
import { SalesEntry, StaffPerformance, StorePerformance } from '../types';
import { formatDisplayDate, getMtdStartDate, getWtdStartDate, getYtdStartDate } from '../utils/dateUtils';
import { calculateAchievementPercent, formatPercent, formatRupees } from '../utils/misCalculator';
import { Download, Copy, Check } from 'lucide-react';

interface Props {
  selectedDate: string;
  allSales: SalesEntry[];
  staffList: StaffPerformance[];
  storeList: StorePerformance[];
}

export const ReportsScreen: React.FC<Props> = ({
  selectedDate,
  allSales,
  staffList,
  storeList
}) => {
  const [reportType, setReportType] = useState<'DAILY' | 'WTD' | 'MTD' | 'YTD' | 'STAFF' | 'STORE'>('DAILY');
  const [copied, setCopied] = useState(false);

  const wtdStart = getWtdStartDate(selectedDate);
  const mtdStart = getMtdStartDate(selectedDate);
  const ytdStart = getYtdStartDate(selectedDate);

  const filteredSales =
    reportType === 'DAILY' ? allSales.filter(e => e.date === selectedDate) :
    reportType === 'WTD' ? allSales.filter(e => e.date >= wtdStart && e.date <= selectedDate) :
    reportType === 'MTD' ? allSales.filter(e => e.date >= mtdStart && e.date <= selectedDate) :
    reportType === 'YTD' ? allSales.filter(e => e.date >= ytdStart && e.date <= selectedDate) :
    allSales.filter(e => e.date <= selectedDate);

  const totalSales = filteredSales.reduce((s, e) => s + e.daily_sales, 0);
  const totalTarget = filteredSales.reduce((s, e) => s + e.daily_target, 0);
  const totalBills = filteredSales.reduce((s, e) => s + e.bills, 0);
  const totalQty = filteredSales.reduce((s, e) => s + e.quantity, 0);
  const totalAch = calculateAchievementPercent(totalSales, totalTarget);

  const handleExportCsv = () => {
    let csv = '';
    if (reportType === 'STAFF') {
      csv = 'Rank,Staff ID,Staff Name,Store,Daily Sales,Daily Target,Daily Ach %,WTD Sales,MTD Sales,YTD Sales\n' +
        staffList.map(s => `${s.rank},"${s.staffId}","${s.staffName}","${s.storeName}",${s.daily.sales},${s.daily.target},${s.daily.achievementPercent.toFixed(1)},${s.wtd.sales},${s.mtd.sales},${s.ytd.sales}`).join('\n');
    } else if (reportType === 'STORE') {
      csv = 'Rank,Store Name,Staff Count,Daily Sales,Daily Target,Daily Ach %,WTD Sales,MTD Sales,YTD Sales\n' +
        storeList.map(st => `${st.rank},"${st.storeName}",${st.staffCount},${st.daily.sales},${st.daily.target},${st.daily.achievementPercent.toFixed(1)},${st.wtd.sales},${st.mtd.sales},${st.ytd.sales}`).join('\n');
    } else {
      csv = 'Entry ID,Date,Staff ID,Staff Name,Store,Daily Sales,Daily Target,Bills,Quantity,Remarks\n' +
        filteredSales.map(e => `${e.id},${e.date},"${e.staff_id}","${e.staff_name}","${e.store_name}",${e.daily_sales},${e.daily_target},${e.bills},${e.quantity},"${e.remarks || ''}"`).join('\n');
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MIS_Report_${reportType}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrintable = () => {
    let text = `==================================================\n`;
    text += `STAFF SALES TRACKER & STORE MANAGER MIS PORTAL\n`;
    text += `REPORT: ${reportType} | DATE: ${selectedDate}\n`;
    text += `==================================================\n`;
    text += `Total Sales:   ${formatRupees(totalSales)}\n`;
    text += `Total Target:  ${formatRupees(totalTarget)}\n`;
    text += `Achievement:   ${formatPercent(totalAch)}\n`;
    text += `Total Bills:   ${totalBills} | Total Units: ${totalQty}\n`;
    text += `--------------------------------------------------\n`;

    if (reportType === 'STAFF') {
      staffList.forEach(s => {
        text += `#${s.rank} ${s.staffName} (${s.storeName}) - Daily: ${formatRupees(s.daily.sales)} | WTD: ${formatRupees(s.wtd.sales)} | MTD: ${formatRupees(s.mtd.sales)} | YTD: ${formatRupees(s.ytd.sales)}\n`;
      });
    } else if (reportType === 'STORE') {
      storeList.forEach(st => {
        text += `#${st.rank} ${st.storeName} - Daily: ${formatRupees(st.daily.sales)} | WTD: ${formatRupees(st.wtd.sales)} | MTD: ${formatRupees(st.mtd.sales)} | YTD: ${formatRupees(st.ytd.sales)}\n`;
      });
    } else {
      filteredSales.forEach(e => {
        text += `${e.date} | ${e.staff_name} | ${e.store_name} | Sales: ${formatRupees(e.daily_sales)} (Tgt: ${formatRupees(e.daily_target)})\n`;
      });
    }
    text += `==================================================\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Executive MIS Reports</h2>
          <span style={{ fontSize: '12px', color: '#64748B' }}>{formatDisplayDate(selectedDate)}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {(['DAILY', 'WTD', 'MTD', 'YTD', 'STAFF', 'STORE'] as const).map(type => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              style={{
                backgroundColor: reportType === type ? '#2563EB' : '#FFFFFF',
                color: reportType === type ? '#FFFFFF' : '#334155',
                border: reportType === type ? 'none' : '1px solid #CBD5E1',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {type === 'STAFF' ? 'Staff-wise' : type === 'STORE' ? 'Store-wise' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
          {reportType} Consolidated Audit
        </span>

        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Total Sales Achieved</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#1E3A8A' }}>
              {formatRupees(totalSales)}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Target: {formatRupees(totalTarget)}</span>
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              color: totalAch >= 100 ? '#059669' : '#DC2626'
            }}>
              {formatPercent(totalAch)} Target Met
            </span>
          </div>
        </div>

        <div style={{
          marginTop: '10px',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px'
        }}>
          <span>Total Bills: <strong>{totalBills}</strong></span>
          <span>Total Units: <strong>{totalQty}</strong></span>
          <span>Avg Ticket: <strong>{formatRupees(totalBills > 0 ? totalSales / totalBills : 0)}</strong></span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleExportCsv}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Download size={14} />
          Export CSV
        </button>

        <button
          onClick={handleCopyPrintable}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Report'}
        </button>
      </div>

      {/* Table / List */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
          Report Breakdown Table
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reportType === 'STAFF' ? (
            staffList.map(s => (
              <div key={s.staffId} style={reportItemStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>#{s.rank} {s.staffName}</span>
                  <span style={{ fontWeight: 800, color: '#1E3A8A' }}>{formatRupees(s.daily.sales)}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>{s.storeName} • ID: {s.staffId}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px', color: '#334155' }}>
                  <span>WTD: {formatRupees(s.wtd.sales)}</span>
                  <span>MTD: {formatRupees(s.mtd.sales)}</span>
                  <span>YTD: {formatRupees(s.ytd.sales)}</span>
                </div>
              </div>
            ))
          ) : reportType === 'STORE' ? (
            storeList.map(st => (
              <div key={st.storeName} style={reportItemStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>#{st.rank} {st.storeName}</span>
                  <span style={{ fontWeight: 800, color: '#1E3A8A' }}>{formatRupees(st.daily.sales)}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>{st.staffCount} Staff Members</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px', color: '#334155' }}>
                  <span>WTD: {formatRupees(st.wtd.sales)}</span>
                  <span>MTD: {formatRupees(st.mtd.sales)}</span>
                  <span>YTD: {formatRupees(st.ytd.sales)}</span>
                </div>
              </div>
            ))
          ) : (
            filteredSales.map(e => (
              <div key={e.id} style={reportItemStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{e.date} • {e.staff_name}</span>
                  <span style={{ fontWeight: 800, color: '#1E3A8A' }}>{formatRupees(e.daily_sales)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                  <span>{e.store_name}</span>
                  <span>Target: {formatRupees(e.daily_target)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const reportItemStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '10px',
  padding: '12px',
  border: '1px solid #E2E8F0',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};
