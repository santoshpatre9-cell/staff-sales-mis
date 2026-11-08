import React, { useState, useEffect, useMemo } from 'react';
import { AdminTab, AppMode, SalesEntry, Staff, Store } from './types';
import { TopNavBar } from './components/TopNavBar';
import { HomeScreen } from './pages/HomeScreen';
import { StaffEntryScreen } from './pages/StaffEntryScreen';
import { StoreManagerScreen } from './pages/StoreManagerScreen';
import { AdminScreen } from './pages/AdminScreen';
import { todayDateString } from './utils/dateUtils';
import { calculateStaffPerformance, calculateStorePerformance, calculateSummary } from './utils/misCalculator';

export const App: React.FC = () => {
  // Read mode from URL ?mode=staff, ?mode=sm, ?mode=admin
  const initialMode = useMemo<AppMode>(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode')?.toLowerCase();
    if (mode === 'staff') return 'staff';
    if (mode === 'sm') return 'sm';
    if (mode === 'admin') return 'admin';
    return 'home';
  }, []);

  const [currentMode, setCurrentMode] = useState<AppMode>(initialMode);
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [selectedDate, setSelectedDate] = useState<string>(todayDateString());
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('');
  const [rankingPeriod, setRankingPeriod] = useState<string>('DAILY');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [stores, setStores] = useState<Store[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [sales, setSales] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync mode with browser URL for direct link sharing
  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
    const url = new URL(window.location.href);
    if (mode === 'home') {
      url.searchParams.delete('mode');
    } else {
      url.searchParams.set('mode', mode);
    }
    window.history.pushState({}, '', url.toString());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    try {
      const [storesRes, staffRes, salesRes] = await Promise.all([
        fetch('/api/stores'),
        fetch('/api/staff'),
        fetch('/api/sales')
      ]);

      if (storesRes.ok) setStores(await storesRes.json());
      if (staffRes.ok) setStaff(await staffRes.json());
      if (salesRes.ok) setSales(await salesRes.json());
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered sales based on store selection
  const relevantSales = useMemo(() => {
    if (!selectedStoreFilter) return sales;
    return sales.filter(s => s.store_name === selectedStoreFilter);
  }, [sales, selectedStoreFilter]);

  // Overall summary for selected date
  const performanceSummary = useMemo(() => {
    return calculateSummary(relevantSales, selectedDate);
  }, [relevantSales, selectedDate]);

  // Staff rankings
  const staffRankings = useMemo(() => {
    return calculateStaffPerformance(relevantSales, selectedDate, rankingPeriod);
  }, [relevantSales, selectedDate, rankingPeriod]);

  // Store rankings
  const storeRankings = useMemo(() => {
    return calculateStorePerformance(sales, selectedDate, rankingPeriod);
  }, [sales, selectedDate, rankingPeriod]);

  // Today's submissions
  const todaySubmissions = useMemo(() => {
    return sales.filter(s => s.date === selectedDate);
  }, [sales, selectedDate]);

  // Search filtered entries
  const filteredSalesForLog = useMemo(() => {
    if (!searchQuery.trim()) return relevantSales;
    const q = searchQuery.toLowerCase();
    return relevantSales.filter(e =>
      e.staff_name.toLowerCase().includes(q) ||
      e.staff_id.toLowerCase().includes(q) ||
      e.store_name.toLowerCase().includes(q) ||
      e.date.includes(q) ||
      (e.remarks && e.remarks.toLowerCase().includes(q))
    );
  }, [relevantSales, searchQuery]);

  // API Actions
  const handleSaveEntry = async (entryData: any) => {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save entry');
    }

    await fetchData();
    showToast('Sales data saved successfully!');
  };

  const handleUpdateEntry = async (id: number, entryData: any) => {
    const res = await fetch(`/api/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update entry');
    }

    await fetchData();
    showToast('Entry updated & MIS recalculated!');
  };

  const handleDeleteEntry = async (id: number) => {
    const res = await fetch(`/api/sales/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Failed to delete entry');
    }

    await fetchData();
    showToast('Entry deleted & MIS recalculated!');
  };

  const handleReloadDemo = async () => {
    const res = await fetch('/api/demo/reload', { method: 'POST' });
    if (res.ok) {
      await fetchData();
      showToast('Sample demo records reloaded successfully!');
    }
  };

  const handleClearDemo = async () => {
    const res = await fetch('/api/demo/clear', { method: 'POST' });
    if (res.ok) {
      await fetchData();
      showToast('Demo records cleared!');
    }
  };

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top App Bar */}
      <TopNavBar
        currentMode={currentMode}
        selectedDate={selectedDate}
        stores={stores}
        selectedStoreFilter={selectedStoreFilter}
        onModeChange={handleModeChange}
        onDateChange={setSelectedDate}
        onStoreFilterChange={setSelectedStoreFilter}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentMode === 'home' && (
          <HomeScreen
            selectedDate={selectedDate}
            summary={performanceSummary}
            onNavigateMode={handleModeChange}
            onReloadDemoData={handleReloadDemo}
            onClearDemoData={handleClearDemo}
          />
        )}

        {currentMode === 'staff' && (
          <StaffEntryScreen
            selectedDate={selectedDate}
            allStaff={staff}
            todayEntries={todaySubmissions}
            onSubmitEntry={handleSaveEntry}
          />
        )}

        {currentMode === 'sm' && (
          <StoreManagerScreen
            selectedDate={selectedDate}
            allStores={stores}
            allStaff={staff}
            allSales={sales}
            todayEntries={todaySubmissions}
            onSubmitEntry={handleSaveEntry}
          />
        )}

        {currentMode === 'admin' && (
          <AdminScreen
            currentTab={adminTab}
            selectedDate={selectedDate}
            summary={performanceSummary}
            allSales={sales}
            filteredSales={filteredSalesForLog}
            staffRankings={staffRankings}
            storeRankings={storeRankings}
            rankingPeriod={rankingPeriod}
            searchQuery={searchQuery}
            totalStaffCount={staff.length}
            totalStoreCount={stores.length}
            onTabChange={setAdminTab}
            onPeriodChange={setRankingPeriod}
            onSearchChange={setSearchQuery}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '10px 18px',
          borderRadius: '24px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
