import React from 'react';
import { AdminTab, PerformanceSummary, SalesEntry, StaffPerformance, StorePerformance } from '../types';
import { KpiCard } from '../components/KpiCard';
import { SalesTrendChart } from '../components/SalesTrendChart';
import { StaffRankingChart } from '../components/StaffRankingChart';
import { StaffMisScreen } from './StaffMisScreen';
import { StoreMisScreen } from './StoreMisScreen';
import { EntriesLogScreen } from './EntriesLogScreen';
import { ReportsScreen } from './ReportsScreen';
import { formatDisplayDate, getFinancialYearLabel, getMtdStartDate, getWtdStartDate, getYtdStartDate } from '../utils/dateUtils';
import { formatRupees } from '../utils/misCalculator';
import { LayoutDashboard, Users, Store as StoreIcon, FileText, PieChart, Calculator, ShoppingBag } from 'lucide-react';

interface Props {
  currentTab: AdminTab;
  selectedDate: string;
  summary: PerformanceSummary;
  allSales: SalesEntry[];
  filteredSales: SalesEntry[];
  staffRankings: StaffPerformance[];
  storeRankings: StorePerformance[];
  rankingPeriod: string;
  searchQuery: string;
  totalStaffCount: number;
  totalStoreCount: number;
  onTabChange: (tab: AdminTab) => void;
  onPeriodChange: (period: string) => void;
  onSearchChange: (query: string) => void;
  onUpdateEntry: (id: number, data: any) => Promise<void>;
  onDeleteEntry: (id: number) => Promise<void>;
}

export const AdminScreen: React.FC<Props> = ({
  currentTab,
  selectedDate,
  summary,
  allSales,
  filteredSales,
  staffRankings,
  storeRankings,
  rankingPeriod,
  searchQuery,
  totalStaffCount,
  totalStoreCount,
  onTabChange,
  onPeriodChange,
  onSearchChange,
  onUpdateEntry,
  onDeleteEntry
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)', paddingBottom: '70px' }}>
      {/* Tab Content */}
      <div style={{ flex: 1 }}>
        {currentTab === 'overview' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <StatCard
                title="Active Stores"
                value={`${totalStoreCount} Stores`}
                icon={<StoreIcon size={18} color="#2563EB" />}
              />
              <StatCard
                title="Retail Staff"
                value={`${totalStaffCount} Staff`}
                icon={<Users size={18} color="#4F46E5" />}
              />
              <StatCard
                title="Avg Ticket Value"
                value={formatRupees(summary.daily.averageBillValue)}
                icon={<Calculator size={18} color="#0D9488" />}
              />
              <StatCard
                title="Units / Txn (UPT)"
                value={`${summary.daily.unitsPerTransaction.toFixed(1)} units`}
                icon={<ShoppingBag size={18} color="#0284C7" />}
              />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
              MIS Performance Cards
            </h3>

            {/* Daily Card */}
            <KpiCard
              title="Daily Performance"
              subtitle={formatDisplayDate(selectedDate)}
              metric={summary.daily}
            />

            {/* WTD Card */}
            <KpiCard
              title="WTD (Week to Date)"
              subtitle={`${formatDisplayDate(getWtdStartDate(selectedDate))} to ${formatDisplayDate(selectedDate)}`}
              metric={summary.wtd}
            />

            {/* MTD Card */}
            <KpiCard
              title="MTD (Month to Date)"
              subtitle={`${formatDisplayDate(getMtdStartDate(selectedDate))} to ${formatDisplayDate(selectedDate)}`}
              metric={summary.mtd}
            />

            {/* YTD Card */}
            <KpiCard
              title={`YTD (${getFinancialYearLabel(selectedDate)})`}
              subtitle={`${formatDisplayDate(getYtdStartDate(selectedDate))} to ${formatDisplayDate(selectedDate)}`}
              metric={summary.ytd}
            />

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
              Visual Analytics & Trends
            </h3>

            <SalesTrendChart
              entries={allSales}
              selectedDate={selectedDate}
            />

            <StaffRankingChart
              staffList={staffRankings}
              periodLabel="Daily"
            />
          </div>
        )}

        {currentTab === 'staff_mis' && (
          <StaffMisScreen
            staffList={staffRankings}
            selectedPeriod={rankingPeriod}
            onPeriodChange={onPeriodChange}
          />
        )}

        {currentTab === 'store_mis' && (
          <StoreMisScreen
            storeList={storeRankings}
            selectedPeriod={rankingPeriod}
            onPeriodChange={onPeriodChange}
          />
        )}

        {currentTab === 'entries_log' && (
          <EntriesLogScreen
            entries={filteredSales}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onUpdateEntry={onUpdateEntry}
            onDeleteEntry={onDeleteEntry}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsScreen
            selectedDate={selectedDate}
            allSales={allSales}
            staffList={staffRankings}
            storeList={storeRankings}
          />
        )}
      </div>

      {/* Bottom Sticky Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 4px',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        zIndex: 40
      }}>
        <NavButton
          label="Overview"
          isActive={currentTab === 'overview'}
          icon={<LayoutDashboard size={18} />}
          onClick={() => onTabChange('overview')}
        />
        <NavButton
          label="Staff MIS"
          isActive={currentTab === 'staff_mis'}
          icon={<Users size={18} />}
          onClick={() => onTabChange('staff_mis')}
        />
        <NavButton
          label="Store MIS"
          isActive={currentTab === 'store_mis'}
          icon={<StoreIcon size={18} />}
          onClick={() => onTabChange('store_mis')}
        />
        <NavButton
          label="Log & Edit"
          isActive={currentTab === 'entries_log'}
          icon={<FileText size={18} />}
          onClick={() => onTabChange('entries_log')}
        />
        <NavButton
          label="Reports"
          isActive={currentTab === 'reports'}
          icon={<PieChart size={18} />}
          onClick={() => onTabChange('reports')}
        />
      </nav>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div style={{
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{title}</span>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{value}</span>
    </div>
  </div>
);

const NavButton: React.FC<{ label: string; isActive: boolean; icon: React.ReactNode; onClick: () => void }> = ({
  label,
  isActive,
  icon,
  onClick
}) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      color: isActive ? '#1E3A8A' : '#64748B',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3px',
      fontSize: '10px',
      fontWeight: isActive ? 700 : 500,
      cursor: 'pointer',
      padding: '4px 8px'
    }}
  >
    <div style={{
      color: isActive ? '#1E3A8A' : '#64748B',
      backgroundColor: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
      padding: '4px 10px',
      borderRadius: '12px'
    }}>
      {icon}
    </div>
    <span>{label}</span>
  </button>
);
