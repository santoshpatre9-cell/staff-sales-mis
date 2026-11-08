import React from 'react';
import { MisMetric } from '../types';
import { formatPercent, formatRupees } from '../utils/misCalculator';
import { CheckCircle2, TrendingUp, TrendingDown, Receipt, Package } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
  metric: MisMetric;
}

export const KpiCard: React.FC<Props> = ({ title, subtitle, metric }) => {
  const achPercent = metric.achievementPercent;
  const isTargetMet = achPercent >= 100;
  const isNearTarget = achPercent >= 80 && achPercent < 100;

  const statusColor = isTargetMet ? '#059669' : isNearTarget ? '#D97706' : '#DC2626';
  const statusBg = isTargetMet ? '#ECFDF5' : isNearTarget ? '#FFFBEB' : '#FEF2F2';

  const progressPercent = Math.min(100, Math.max(0, achPercent));

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '14px',
      padding: '14px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
      marginBottom: '12px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{title}</h3>
          <p style={{ fontSize: '11px', color: '#64748B' }}>{subtitle}</p>
        </div>

        {/* Badge */}
        <div style={{
          backgroundColor: statusBg,
          color: statusColor,
          padding: '4px 8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          fontWeight: 700
        }}>
          {isTargetMet ? <CheckCircle2 size={13} /> : isNearTarget ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{formatPercent(achPercent)}</span>
        </div>
      </div>

      {/* Main Metric: Sales vs Target */}
      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Sales Achieved</span>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#1E3A8A' }}>
            {formatRupees(metric.sales)}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Target</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
            {formatRupees(metric.target)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        marginTop: '8px',
        width: '100%',
        height: '6px',
        backgroundColor: '#E2E8F0',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          backgroundColor: statusColor,
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Sub metrics: Shortfall/Excess + Bills + Quantity */}
      <div style={{
        marginTop: '10px',
        backgroundColor: '#F8FAFC',
        borderRadius: '8px',
        padding: '8px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px'
      }}>
        <div>
          {metric.shortfall > 0 ? (
            <span>
              <span style={{ color: '#64748B' }}>Shortfall: </span>
              <strong style={{ color: '#DC2626' }}>{formatRupees(metric.shortfall)}</strong>
            </span>
          ) : (
            <span>
              <span style={{ color: '#64748B' }}>Excess: </span>
              <strong style={{ color: '#059669' }}>{formatRupees(metric.excess)}</strong>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', color: '#334155' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Receipt size={12} color="#2563EB" />
            {metric.bills} bills
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Package size={12} color="#2563EB" />
            {metric.quantity} units
          </span>
        </div>
      </div>
    </div>
  );
};
