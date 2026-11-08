import React from 'react';
import { AppMode, PerformanceSummary } from '../types';
import { formatDisplayDate, getFinancialYearLabel } from '../utils/dateUtils';
import { formatPercent, formatRupees } from '../utils/misCalculator';
import { User, Store as StoreIcon, BarChart3, ArrowRight, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  selectedDate: string;
  summary: PerformanceSummary;
  onNavigateMode: (mode: AppMode) => void;
  onReloadDemoData: () => void;
  onClearDemoData: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  selectedDate,
  summary,
  onNavigateMode,
  onReloadDemoData,
  onClearDemoData
}) => {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Banner Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 14px rgba(30, 58, 138, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#BFDBFE', fontWeight: 600 }}>Store Manager & Staff</span>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>MIS Sales Portal</h2>
          </div>
          <span style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700
          }}>
            {getFinancialYearLabel(selectedDate)}
          </span>
        </div>

        <p style={{ marginTop: '8px', fontSize: '13px', color: '#EFF6FF', lineHeight: 1.4 }}>
          Enter daily store & staff sales. System automatically calculates WTD, MTD, YTD & achievement without manual entry.
        </p>

        {/* Snapshot pill */}
        <div style={{
          marginTop: '14px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: '#BFDBFE', display: 'block' }}>
              Today's Sales ({formatDisplayDate(selectedDate)})
            </span>
            <span style={{ fontSize: '18px', fontWeight: 800 }}>
              {formatRupees(summary.daily.sales)}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#BFDBFE', display: 'block' }}>
              Target: {formatRupees(summary.daily.target)}
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              color: summary.daily.achievementPercent >= 100 ? '#4ADE80' : '#FFFFFF'
            }}>
              {formatPercent(summary.daily.achievementPercent)} Achieved
            </span>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Select Portal Mode</h3>

      {/* Mode 1: Staff Entry */}
      <div
        onClick={() => onNavigateMode('staff')}
        style={modeCardStyle}
      >
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2563EB',
          flexShrink: 0
        }}>
          <User size={24} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>1. Staff Entry</h4>
            <span style={{
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              fontSize: '9px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              QUICK ENTRY
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.3 }}>
            For counter sales staff. Large mobile inputs, quick submission of daily sales, target, bills & units with instant confirmation.
          </p>
        </div>

        <ArrowRight size={20} color="#94A3B8" />
      </div>

      {/* Mode 2: Store Manager */}
      <div
        onClick={() => onNavigateMode('sm')}
        style={modeCardStyle}
      >
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: 'rgba(79, 70, 229, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4F46E5',
          flexShrink: 0
        }}>
          <StoreIcon size={24} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>2. Store Manager Portal</h4>
            <span style={{
              backgroundColor: '#EEF2FF',
              color: '#4338CA',
              fontSize: '9px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              AUTO MIS
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.3 }}>
            WhatsApp-style daily reporting. Enter daily figures for any staff/store. Live automatic calculation of WTD, MTD, YTD & Shortfall.
          </p>
        </div>

        <ArrowRight size={20} color="#94A3B8" />
      </div>

      {/* Mode 3: Admin Dashboard */}
      <div
        onClick={() => onNavigateMode('admin')}
        style={modeCardStyle}
      >
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: 'rgba(30, 58, 138, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1E3A8A',
          flexShrink: 0
        }}>
          <BarChart3 size={24} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>3. Admin MIS Dashboard</h4>
            <span style={{
              backgroundColor: '#F1F5F9',
              color: '#0F172A',
              fontSize: '9px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              EXECUTIVE
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.3 }}>
            Complete analytics. Daily trend charts, store/staff performance rankings, reports, CSV export, and entry corrections.
          </p>
        </div>

        <ArrowRight size={20} color="#94A3B8" />
      </div>

      {/* Demo Controls */}
      <div style={{
        backgroundColor: '#F1F5F9',
        borderRadius: '12px',
        padding: '14px',
        border: '1px solid #E2E8F0',
        marginTop: '6px'
      }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Demo Data Controls</h4>
        <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
          Sample data is pre-seeded for Mumbai, Delhi, Bengaluru, Hyderabad, and Chennai stores. You can reload or clear demo records anytime.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={onReloadDemoData}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} />
            Reload Sample Data
          </button>

          <button
            onClick={onClearDemoData}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={12} />
            Clear Demo Records
          </button>
        </div>
      </div>
    </div>
  );
};

const modeCardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '14px',
  padding: '16px',
  border: '1px solid #E2E8F0',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  cursor: 'pointer',
  transition: 'transform 0.1s ease, box-shadow 0.15s ease'
};
