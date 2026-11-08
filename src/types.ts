export interface Store {
  id: string;
  name: string;
  location: string;
  status: string; // 'ACTIVE' | 'INACTIVE'
}

export interface Staff {
  id: string;
  name: string;
  store_name: string;
  store_id: string;
  daily_target: number;
  daily_sale_target: number;
  daily_qty_target: number;
  daily_ff_target: number;
  daily_big_bill_target: number;
  monthly_target: number;
  annual_aop: number;
  status: string; // 'ACTIVE' | 'INACTIVE'
}

export interface SalesEntry {
  id: number;
  date: string;
  time: string;
  staff_id: string;
  staff_name: string;
  store_id: string;
  store_name: string;
  sale_amount: number;
  qty: number;
  ff: number;
  big_bill: number;
  target_amount: number;
  target_qty: number;
  target_ff: number;
  target_big_bill: number;
  bill_number: string;
  product_category: string;
  payment_mode: string;
  remarks: string;
  is_demo: number;
  created_at: number;
  updated_at: number;
}

export interface MetricDetail {
  target: number;
  achieved: number;
  achievementPercent: number;
  shortfall: number;
  excess: number;
}

export interface MultiMetricSummary {
  sale: MetricDetail;
  qty: MetricDetail;
  ff: MetricDetail;
  bigBill: MetricDetail;
  billsCount: number;
}

export interface PerformanceSummary {
  daily: MultiMetricSummary;
  wtd: MultiMetricSummary;
  mtd: MultiMetricSummary;
  ytd: MultiMetricSummary;
  entryCount: number;
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  storeName: string;
  salesCount: number;
  daily: MultiMetricSummary;
  wtd: MultiMetricSummary;
  mtd: MultiMetricSummary;
  ytd: MultiMetricSummary;
  lastSaleTime: string;
  rank: number;
}

export interface StorePerformance {
  storeName: string;
  daily: MultiMetricSummary;
  wtd: MultiMetricSummary;
  mtd: MultiMetricSummary;
  ytd: MultiMetricSummary;
  staffCount: number;
  transactionCount: number;
  lastSaleTime: string;
  rank: number;
}

export type AppMode = 'home' | 'staff' | 'sm' | 'admin' | 'whatsapp';
export type AdminTab = 'overview' | 'staff_master' | 'store_master' | 'staff_mis' | 'store_mis' | 'entries_log' | 'reports' | 'whatsapp';
