import React from 'react';
import { StaffPerformance } from '../types';
import { formatPercent, formatRupees } from '../utils/misCalculator';

interface Props {
  staffList: StaffPerformance[];
  periodLabel: string;
}

export const StaffRankingChart: React.FC<Props> = ({ staffList, periodLabel }) => {
  const topStaff = staffList.slice(0, 5);
  const maxSales = Math.max(...topStaff.map(s => s.daily.sales), 30000);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '14px',
      padding: '14px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
      marginBottom: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
          Top Performers ({periodLabel})
        </h3>
        <span style={{ fontSize: '11px', color: '#64748B' }}>
          {topStaff.length} staff listed
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {topStaff.map((staff, idx) => {
          const sales = staff.daily.sales;
          const achPercent = staff.daily.achievementPercent;
          const fraction = Math.min(100, Math.max(8, (sales / maxSales) * 100));

          const rankColor = idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : idx === 2 ? '#B45309' : '#64748B';

          return (
            <div key={staff.staffId} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Rank circle */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: rankColor,
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                #{idx + 1}
              </div>

              {/* Progress and name */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{staff.staffName}</span>
                  <span style={{ fontWeight: 700, color: '#1E3A8A' }}>{formatRupees(sales)}</span>
                </div>

                <div style={{
                  width: '100%',
                  height: '5px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${fraction}%`,
                    height: '100%',
                    backgroundColor: achPercent >= 100 ? '#059669' : '#2563EB',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>

              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: achPercent >= 100 ? '#059669' : '#64748B',
                width: '45px',
                textAlign: 'right'
              }}>
                {formatPercent(achPercent)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
