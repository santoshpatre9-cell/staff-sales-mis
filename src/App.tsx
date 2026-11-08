import React, { useState, useEffect, useMemo } from 'react';
import { AdminTab, AppMode, SalesEntry, Staff, Store } from './types';
import { TopNavBar } from './components/TopNavBar';
import { HomeScreen } from './pages/HomeScreen';
import { QuickSaleEntryScreen } from './pages/QuickSaleEntryScreen';
import { StoreManagerScreen } from './pages/StoreManagerScreen';
import { AdminScreen } from './pages/AdminScreen';
import { WhatsAppReportsScreen } from './pages/WhatsAppReportsScreen';
import { todayDateString } from './utils/dateUtils';
import { calculateStaffPerformance, calculateStorePerformance, calculateSummary } from './utils/misCalculator';

export const App: React.FC = () => {
  const initialMode = useMemo<AppMode>(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode')?.toLowerCase();
    if (mode === 'staff') return 'staff';
    if (mode === 'sm') return 'sm';
    if (mode === 'admin') return 'admin';
    if (mode === 'whatsapp') return 'whatsapp';
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
    return calculateSummary(relevantSales, selectedDate, staff);
  }, [relevantSales, selectedDate, staff]);

  // Staff rankings
  const staffRankings = useMemo(() => {
    return calculateStaffPerformance(relevantSales, selectedDate, staff, rankingPeriod);
  }, [relevantSales, selectedDate, staff, rankingPeriod]);

  // Store rankings
  const storeRankings = useMemo(() => {
    return calculateStorePerformance(sales, selectedDate, staff, rankingPeriod);
  }, [sales, selectedDate, staff, rankingPeriod]);

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
      (e.remarks && e.remarks.toLowerCase().includes(q)) ||
      (e.bill_number && e.bill_number.toLowerCase().includes(q))
    );
  }, [relevantSales, searchQuery]);

  // Master Mutations
  const handleAddStaff = async (data: any) => {
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add staff');
    }
    await fetchData();
  };

  const handleUpdateStaff = async (id: string, data: any) => {
    const res = await fetch(`/api/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update staff');
    }
    await fetchData();
  };

  const handleDeleteStaff = async (id: string) => {
    const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete staff');
    await fetchData();
  };

  const handleAddStore = async (data: any) => {
    const res = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add store');
    }
    await fetchData();
  };

  const handleUpdateStore = async (id: string, data: any) => {
    const res = await fetch(`/api/stores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update store');
    }
    await fetchData();
  };

  const handleDeleteStore = async (id: string) => {
    const res = await fetch(`/api/stores/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete store');
    await fetchData();
  };

  // Sales Transaction Mutations
  const handleSaveSale = async (saleData: any) => {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save sale');
    }

    await fetchData();
  };

  const handleUpdateSale = async (id: number, saleData: any) => {
    const res = await fetch(`/api/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update sale');
    }

    await fetchData();
    showToast('Sale updated & MIS recalculated!');
  };

  const handleDeleteSale = async (id: number) => {
    const res = await fetch(`/api/sales/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Failed to delete sale');
    }

    await fetchData();
    showToast('Sale deleted & MIS recalculated!');
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
          <QuickSaleEntryScreen
            selectedDate={selectedDate}
            allStaff={staff}
            stores={stores}
            todayEntries={todaySubmissions}
            onSubmitSale={handleSaveSale}
            showToast={showToast}
          />
        )}

        {currentMode === 'sm' && (
          <StoreManagerScreen
            selectedDate={selectedDate}
            allStores={stores}
            allStaff={staff}
            allSales={sales}
            todayEntries={todaySubmissions}
            onSubmitEntry={handleSaveSale}
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
            staffList={staff}
            stores={stores}
            rankingPeriod={rankingPeriod}
            searchQuery={searchQuery}
            totalStaffCount={staff.length}
            totalStoreCount={stores.length}
            selectedStoreFilter={selectedStoreFilter}
            onTabChange={setAdminTab}
            onPeriodChange={setRankingPeriod}
            onSearchChange={setSearchQuery}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            onAddStore={handleAddStore}
            onUpdateStore={handleUpdateStore}
            onDeleteStore={handleDeleteStore}
            onUpdateEntry={handleUpdateSale}
            onDeleteEntry={handleDeleteSale}
            showToast={showToast}
          />
        )}

        {currentMode === 'whatsapp' && (
          <WhatsAppReportsScreen
            selectedDate={selectedDate}
            stores={stores}
            selectedStoreFilter={selectedStoreFilter}
            summary={performanceSummary}
            staffList={staffRankings}
            todayEntries={todaySubmissions}
            showToast={showToast}
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
