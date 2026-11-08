import React, { useState } from 'react';
import { AppMode, Store } from '../types';
import { addDays, formatDisplayDate, getFinancialYearLabel, getMtdStartDate, getWtdStartDate, getYesterdayDate, todayDateString } from '../utils/dateUtils';
import { Home, User, Store as StoreIcon, BarChart3, ChevronLeft, ChevronRight, Calendar, Building2 } from 'lucide-react';

interface Props {
  currentMode: AppMode;
  selectedDate: string;
  stores: Store[];
  selectedStoreFilter: string;
  onModeChange: (mode: AppMode) => void;
  onDateChange: (date: string) => void;
  onStoreFilterChange: (store: string) => void;
}

export const TopNavBar: React.FC<Props> = ({
  currentMode,
  selectedDate,
  stores,
  selectedStoreFilter,
  onModeChange,
  onDateChange,
  onStoreFilterChange
}) => {
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);
  const todayStr = todayDateString();
  const yesterdayStr = getYesterdayDate(todayStr);

  return (
    <header style={{
      backgroundColor: '#1E3A8A',
      color: '#FFFFFF',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div 
          onClick={() => onModeChange('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {currentMode === 'home' && <Home size={20} color="#FFFFFF" />}
            {currentMode === 'staff' && <User size={20} color="#FFFFFF" />}
            {currentMode === 'sm' && <StoreIcon size={20} color="#FFFFFF" />}
            {currentMode === 'admin' && <BarChart3 size={20} color="#FFFFFF" />}
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.2 }}>Staff Sales MIS</h1>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {currentMode === 'home' && 'Store Portal Home'}
              {currentMode === 'staff' && 'Staff Entry Mode'}
              {currentMode === 'sm' && 'Store Manager Portal'}
              {currentMode === 'admin' && 'Admin Executive Dashboard'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Pills */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0, 0, 0, 0.15)', padding: '3px', borderRadius: '20px' }}>
          <button
            onClick={() => onModeChange('staff')}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: currentMode === 'staff' ? '#FFFFFF' : 'transparent',
              color: currentMode === 'staff' ? '#1E3A8A' : '#FFFFFF',
              transition: 'all 0.15s ease'
            }}
          >
            Staff
          </button>
          <button
            onClick={() => onModeChange('sm')}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: currentMode === 'sm' ? '#FFFFFF' : 'transparent',
              color: currentMode === 'sm' ? '#1E3A8A' : '#FFFFFF',
              transition: 'all 0.15s ease'
            }}
          >
            SM
          </button>
          <button
            onClick={() => onModeChange('admin')}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: currentMode === 'admin' ? '#FFFFFF' : 'transparent',
              color: currentMode === 'admin' ? '#1E3A8A' : '#FFFFFF',
              transition: 'all 0.15s ease'
            }}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Date Navigation Row */}
      <div style={{
        marginTop: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: '10px',
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => onDateChange(addDays(selectedDate, -1))}
          style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          title="Previous Day"
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} color="#93C5FD" />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{formatDisplayDate(selectedDate)}</span>
          {selectedDate === todayStr && (
            <span style={{ backgroundColor: '#2563EB', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
              TODAY
            </span>
          )}
        </div>

        <button
          onClick={() => onDateChange(addDays(selectedDate, 1))}
          style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          title="Next Day"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Quick Filter Chips */}
      <div style={{
        marginTop: '8px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '2px',
        scrollbarWidth: 'none'
      }}>
        <button
          onClick={() => onDateChange(todayStr)}
          style={chipStyle(selectedDate === todayStr)}
        >
          Today
        </button>
        <button
          onClick={() => onDateChange(yesterdayStr)}
          style={chipStyle(selectedDate === yesterdayStr)}
        >
          Yesterday
        </button>
        <button
          onClick={() => onDateChange(getWtdStartDate(todayStr))}
          style={chipStyle(selectedDate === getWtdStartDate(todayStr))}
        >
          Week Start
        </button>
        <button
          onClick={() => onDateChange(getMtdStartDate(todayStr))}
          style={chipStyle(selectedDate === getMtdStartDate(todayStr))}
        >
          Month Start
        </button>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          color: '#E2E8F0'
        }}>
          {getFinancialYearLabel(selectedDate)}
        </div>

        {/* Store Filter Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setStoreMenuOpen(!storeMenuOpen)}
            style={{
              ...chipStyle(Boolean(selectedStoreFilter)),
              backgroundColor: selectedStoreFilter ? '#2563EB' : 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Building2 size={12} />
            {selectedStoreFilter ? selectedStoreFilter.split(' - ')[0] : 'All Stores'} ▾
          </button>

          {storeMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              minWidth: '200px',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              <div
                onClick={() => { onStoreFilterChange(''); setStoreMenuOpen(false); }}
                style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #E2E8F0', fontWeight: selectedStoreFilter === '' ? 700 : 500 }}
              >
                All Stores
              </div>
              {stores.map(s => (
                <div
                  key={s.id}
                  onClick={() => { onStoreFilterChange(s.name); setStoreMenuOpen(false); }}
                  style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', fontWeight: selectedStoreFilter === s.name ? 700 : 500 }}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const chipStyle = (isSelected: boolean): React.CSSProperties => ({
  backgroundColor: isSelected ? '#2563EB' : 'rgba(255, 255, 255, 0.15)',
  color: '#FFFFFF',
  border: 'none',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: isSelected ? 700 : 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'background-color 0.15s ease'
});
