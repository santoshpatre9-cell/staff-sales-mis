import React, { useState } from 'react';
import { PerformanceSummary, SalesEntry, StaffPerformance, Store } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';
import { formatPercent, formatRupees } from '../utils/misCalculator';
import { MessageSquare, Share2, Check, Send } from 'lucide-react';

interface Props {
  selectedDate: string;
  stores: Store[];
  selectedStoreFilter: string;
  summary: PerformanceSummary;
  staffList: StaffPerformance[];
  todayEntries: SalesEntry[];
  showToast: (msg: string) => void;
}

export const WhatsAppReportsScreen: React.FC<Props> = ({
  selectedDate,
  stores,
  selectedStoreFilter,
  summary,
  staffList,
  todayEntries,
  showToast
}) => {
  const [selectedStaffIdForReport, setSelectedStaffIdForReport] = useState(staffList[0]?.staffId || '');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const storeNameDisplay = selectedStoreFilter || stores[0]?.name || 'All Stores';

  // 1. Store Summary WhatsApp Text with Sale, Qty, FF, Big Bill
  const storeSummaryText = `*Staff Sales MIS - Store & Multi-Metric Report*
Date: ${formatDisplayDate(selectedDate)}
Store: ${storeNameDisplay}

🎯 *SALE:* ${formatRupees(summary.daily.sale.achieved)} / ${formatRupees(summary.daily.sale.target)} (*${formatPercent(summary.daily.sale.achievementPercent)}*)
📦 *QTY:* ${summary.daily.qty.achieved} / ${summary.daily.qty.target} (*${formatPercent(summary.daily.qty.achievementPercent)}*)
👣 *FF:* ${summary.daily.ff.achieved} / ${summary.daily.ff.target} (*${formatPercent(summary.daily.ff.achievementPercent)}*)
🏆 *BIG BILL:* ${summary.daily.bigBill.achieved} / ${summary.daily.bigBill.target} (*${formatPercent(summary.daily.bigBill.achievementPercent)}*)

*Top Staff (Sale):*
${staffList.map((s, idx) => `${idx + 1}. ${s.staffName} - ${formatRupees(s.daily.sale.achieved)} (${formatPercent(s.daily.sale.achievementPercent)})`).join('\n')}

*Rollups (WTD / MTD):*
• WTD Sale: ${formatRupees(summary.wtd.sale.achieved)} (${formatPercent(summary.wtd.sale.achievementPercent)})
• MTD Sale: ${formatRupees(summary.mtd.sale.achieved)} (${formatPercent(summary.mtd.sale.achievementPercent)})

_Powered by Staff Sales MIS Portal_`;

  // 2. Staff Report WhatsApp Text
  const targetStaff = staffList.find(s => s.staffId === selectedStaffIdForReport) || staffList[0];
  const staffReportText = targetStaff ? `*Staff Individual Performance Report*
Staff: ${targetStaff.staffName} (ID: ${targetStaff.staffId})
Store: ${targetStaff.storeName}
Date: ${formatDisplayDate(selectedDate)}

*FTD (Today):*
• Sale: ${formatRupees(targetStaff.daily.sale.achieved)} / ${formatRupees(targetStaff.daily.sale.target)} (${formatPercent(targetStaff.daily.sale.achievementPercent)})
• Qty: ${targetStaff.daily.qty.achieved} / ${targetStaff.daily.qty.target} (${formatPercent(targetStaff.daily.qty.achievementPercent)})
• FF: ${targetStaff.daily.ff.achieved} / ${targetStaff.daily.ff.target} (${formatPercent(targetStaff.daily.ff.achievementPercent)})
• Big Bill: ${targetStaff.daily.bigBill.achieved} / ${targetStaff.daily.bigBill.target} (${formatPercent(targetStaff.daily.bigBill.achievementPercent)})

*WTD:*
• Sale: ${formatRupees(targetStaff.wtd.sale.achieved)} (${formatPercent(targetStaff.wtd.sale.achievementPercent)})
• Qty: ${targetStaff.wtd.qty.achieved} (${formatPercent(targetStaff.wtd.qty.achievementPercent)})

*MTD:*
• Sale: ${formatRupees(targetStaff.mtd.sale.achieved)} (${formatPercent(targetStaff.mtd.sale.achievementPercent)})
• Qty: ${targetStaff.mtd.qty.achieved} (${formatPercent(targetStaff.mtd.qty.achievementPercent)})

_Keep up the great work!_` : '';

  const openWhatsApp = (text: string, type: string) => {
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
    showToast(`Opening WhatsApp for ${type}!`);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedType(null), 3000);
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>WhatsApp MIS Reports</h2>
        <p style={{ fontSize: '11px', color: '#64748B' }}>Share FTD, WTD, MTD performance reports for Sale, Qty, FF, and Big Bill</p>
      </div>

      {/* Button 1: Store Summary */}
      <div style={reportCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Store Multi-Metric MIS Report</h3>
            <p style={{ fontSize: '11px', color: '#64748B' }}>Summary of Sale, Qty, FF, and Big Bill performance</p>
          </div>
        </div>

        <div style={previewBoxStyle}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px', fontFamily: 'inherit', color: '#334155' }}>
            {storeSummaryText}
          </pre>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={() => openWhatsApp(storeSummaryText, 'Store MIS Report')}
            style={whatsappButtonStyle}
          >
            <Send size={15} />
            Share on WhatsApp
          </button>
          <button
            onClick={() => copyToClipboard(storeSummaryText, 'Store MIS Report')}
            style={copyButtonStyle}
          >
            {copiedType === 'Store MIS Report' ? <Check size={14} color="#059669" /> : <Share2 size={14} />}
            {copiedType === 'Store MIS Report' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Button 2: Staff-wise Report */}
      <div style={reportCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Staff Multi-Metric Report</h3>
            <p style={{ fontSize: '11px', color: '#64748B' }}>Individual FTD, WTD, MTD target vs achieved breakdown</p>
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <select
            value={selectedStaffIdForReport}
            onChange={e => setSelectedStaffIdForReport(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
          >
            {staffList.map(s => (
              <option key={s.staffId} value={s.staffId}>{s.staffName} ({s.storeName})</option>
            ))}
          </select>
        </div>

        <div style={previewBoxStyle}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px', fontFamily: 'inherit', color: '#334155' }}>
            {staffReportText}
          </pre>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={() => openWhatsApp(staffReportText, 'Staff Report')}
            style={whatsappButtonStyle}
          >
            <Send size={15} />
            Share Staff Report on WhatsApp
          </button>
          <button
            onClick={() => copyToClipboard(staffReportText, 'Staff Report')}
            style={copyButtonStyle}
          >
            {copiedType === 'Staff Report' ? <Check size={14} color="#059669" /> : <Share2 size={14} />}
            {copiedType === 'Staff Report' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

const reportCardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '14px',
  padding: '16px',
  border: '1px solid #E2E8F0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
};

const previewBoxStyle: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  padding: '10px',
  border: '1px solid #E2E8F0',
  maxHeight: '160px',
  overflowY: 'auto'
};

const whatsappButtonStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#16A34A',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  padding: '10px',
  fontSize: '12px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
};

const copyButtonStyle: React.CSSProperties = {
  padding: '10px 14px',
  backgroundColor: '#FFFFFF',
  color: '#0F172A',
  border: '1px solid #CBD5E1',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer'
};
