import React from 'react';
import { SalesEntry } from '../types';
import { addDays, formatShortDate } from '../utils/dateUtils';
import { formatRupees } from '../utils/misCalculator';

interface Props {
  entries: SalesEntry[];
  selectedDate: string;
}

export const SalesTrendChart: React.FC<Props> = ({ entries, selectedDate }) => {
  // 7 days up to selectedDate
  const dates = [6, 5, 4, 3, 2, 1, 0].map(d => addDays(selectedDate, -d));
  
  const dailyData = dates.map(date => {
    const dayEntries = entries.filter(e => e.date === date);
    const sales = dayEntries.reduce((sum, e) => sum + e.daily_sales, 0);
    const target = dayEntries.reduce((sum, e) => sum + e.daily_target, 0);
    return { date, sales, target };
  });

  const maxVal = Math.max(...dailyData.map(d => Math.max(d.sales, d.target)), 50000);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '14px',
      padding: '14px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
      marginBottom: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Daily Sales Trend (7-Day)</h3>
          <p style={{ fontSize: '11px', color: '#64748B' }}>Sales vs Target across stores</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#64748B' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'inline-block' }} />
            Sales
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }} />
            Target
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '8px', paddingTop: '10px' }}>
        {dailyData.map((item, idx) => {
          const salesHeightPercent = Math.min(100, Math.max(5, (item.sales / maxVal) * 100));
          const targetHeightPercent = Math.min(100, Math.max(5, (item.target / maxVal) * 100));
          const isTargetMet = item.sales >= item.target && item.target > 0;

          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              {/* Bar area */}
              <div style={{ position: 'relative', width: '100%', height: '110px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                {/* Sales Bar */}
                <div
                  title={`Sales: ${formatRupees(item.sales)}`}
                  style={{
                    width: '60%',
                    height: `${salesHeightPercent}%`,
                    backgroundColor: isTargetMet ? '#059669' : '#2563EB',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease'
                  }}
                />

                {/* Target line indicator */}
                {item.target > 0 && (
                  <div
                    title={`Target: ${formatRupees(item.target)}`}
                    style={{
                      position: 'absolute',
                      bottom: `${targetHeightPercent}%`,
                      width: '80%',
                      height: '2px',
                      backgroundColor: '#DC2626',
                      boxShadow: '0 0 2px rgba(220, 38, 38, 0.8)'
                    }}
                  />
                )}
              </div>

              {/* Date label */}
              <span style={{ fontSize: '10px', color: '#64748B', marginTop: '6px', fontWeight: 600 }}>
                {formatShortDate(item.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
