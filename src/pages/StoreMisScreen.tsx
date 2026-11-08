import React from 'react';
import { StorePerformance } from '../types';
import { formatPercent, formatRupees } from '../utils/misCalculator';
import { Users } from 'lucide-react';

interface Props {
  storeList: StorePerformance[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export const StoreMisScreen: React.FC<Props> = ({
  storeList,
  selectedPeriod,
  onPeriodChange
}) => {
  const periods = [
    { code: 'DAILY', label: 'Daily Sales' },
    { code: 'WTD', label: 'WTD Sales' },
    { code: 'MTD', label: 'MTD Sales' },
    { code: 'YTD', label: 'YTD Sales' },
    { code: 'ACHIEVEMENT', label: 'Achievement %' }
  ];

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Store Performance & Ranking</h2>
          <span style={{ fontSize: '12px', color: '#64748B' }}>{storeList.length} Stores</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {periods.map(p => (
            <button
              key={p.code}
              onClick={() => onPeriodChange(p.code)}
              style={{
                backgroundColor: selectedPeriod === p.code ? '#2563EB' : '#FFFFFF',
                color: selectedPeriod === p.code ? '#FFFFFF' : '#334155',
                border: selectedPeriod === p.code ? 'none' : '1px solid #CBD5E1',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {storeList.map(store => {
          const activeMetric =
            selectedPeriod === 'WTD' ? store.wtd :
            selectedPeriod === 'MTD' ? store.mtd :
            selectedPeriod === 'YTD' ? store.ytd : store.daily;

          const ach = activeMetric.achievementPercent;
          const isMet = ach >= 100;
          const rankColor = store.rank === 1 ? '#F59E0B' : store.rank === 2 ? '#94A3B8' : store.rank === 3 ? '#B45309' : '#64748B';

          return (
            <div
              key={store.storeName}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: rankColor,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  #{store.rank}
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{store.storeName}</h4>
                  <p style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} />
                    {store.staffCount} Staff Members
                  </p>
                </div>

                <span style={{
                  backgroundColor: isMet ? '#ECFDF5' : '#FEF2F2',
                  color: isMet ? '#059669' : '#DC2626',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  {formatPercent(ach)}
                </span>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{selectedPeriod} Sales</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#1E3A8A' }}>
                    {formatRupees(activeMetric.sales)}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{selectedPeriod} Target</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                    {formatRupees(activeMetric.target)}
                  </span>
                </div>
              </div>

              <div style={{
                marginTop: '6px',
                width: '100%',
                height: '5px',
                backgroundColor: '#E2E8F0',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(100, Math.max(0, ach))}%`,
                  height: '100%',
                  backgroundColor: isMet ? '#059669' : '#2563EB',
                  borderRadius: '3px'
                }} />
              </div>

              <div style={{
                marginTop: '10px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Daily</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                    {formatRupees(store.daily.sales)}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#2563EB' }}>
                    {formatPercent(store.daily.achievementPercent)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>WTD</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                    {formatRupees(store.wtd.sales)}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#2563EB' }}>
                    {formatPercent(store.wtd.achievementPercent)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>MTD</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                    {formatRupees(store.mtd.sales)}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#2563EB' }}>
                    {formatPercent(store.mtd.achievementPercent)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>YTD</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                    {formatRupees(store.ytd.sales)}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#2563EB' }}>
                    {formatPercent(store.ytd.achievementPercent)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
