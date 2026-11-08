export interface Store {
  id: string;
  name: string;
  location: string;
  status: string;
}

export interface Staff {
  id: string;
  name: string;
  store_name: string;
  status: string;
}

export interface SalesEntry {
  id: number;
  date: string;
  staff_id: string;
  staff_name: string;
  store_name: string;
  daily_target: number;
  daily_sales: number;
  bills: number;
  quantity: number;
  remarks: string;
  is_demo: number;
  created_at: number;
  updated_at: number;
}

export interface MisMetric {
  target: number;
  sales: number;
  bills: number;
  quantity: number;
  achievementPercent: number;
  shortfall: number;
  excess: number;
  averageBillValue: number;
  unitsPerTransaction: number;
}

export interface PerformanceSummary {
  daily: MisMetric;
  wtd: MisMetric;
  mtd: MisMetric;
  ytd: MisMetric;
  entryCount: number;
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  storeName: string;
  daily: MisMetric;
  wtd: MisMetric;
  mtd: MisMetric;
  ytd: MisMetric;
  rank: number;
}

export interface StorePerformance {
  storeName: string;
  daily: MisMetric;
  wtd: MisMetric;
  mtd: MisMetric;
  ytd: MisMetric;
  staffCount: number;
  rank: number;
}

export type AppMode = 'home' | 'staff' | 'sm' | 'admin';
export type AdminTab = 'overview' | 'staff_mis' | 'store_mis' | 'entries_log' | 'reports';
