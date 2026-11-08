import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run sets PORT (typically 8080) for standalone containers.
// Inside AI Studio sandbox, NGINX runs on 8080 and proxies to DEFAULT_APP_PORT (3000).
const PORT = process.env.NGINX_PORT ? (process.env.DEFAULT_APP_PORT || 3000) : (process.env.PORT || 8080);
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sales_mis.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE'
  );

  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    store_name TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE'
  );

  CREATE TABLE IF NOT EXISTS sales_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    store_name TEXT NOT NULL,
    daily_target REAL NOT NULL,
    daily_sales REAL NOT NULL,
    bills INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    remarks TEXT DEFAULT '',
    is_demo INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_entries(date);
  CREATE INDEX IF NOT EXISTS idx_sales_staff ON sales_entries(staff_id);
  CREATE INDEX IF NOT EXISTS idx_sales_store ON sales_entries(store_name);
`);

// Sample data
const sampleStores = [
  { id: 'STR-01', name: 'Mumbai - Phoenix Palladium', location: 'Lower Parel, Mumbai' },
  { id: 'STR-02', name: 'Delhi - Connaught Place', location: 'Inner Circle, New Delhi' },
  { id: 'STR-03', name: 'Bengaluru - Indiranagar', location: '100ft Road, Bengaluru' },
  { id: 'STR-04', name: 'Hyderabad - Inorbit Mall', location: 'Madhapur, Hyderabad' },
  { id: 'STR-05', name: 'Chennai - Express Avenue', location: 'Royapettah, Chennai' }
];

const sampleStaff = [
  { id: 'STF-101', name: 'Rahul Sharma', store_name: 'Mumbai - Phoenix Palladium' },
  { id: 'STF-102', name: 'Priya Patel', store_name: 'Mumbai - Phoenix Palladium' },
  { id: 'STF-103', name: 'Amit Verma', store_name: 'Delhi - Connaught Place' },
  { id: 'STF-104', name: 'Neha Gupta', store_name: 'Delhi - Connaught Place' },
  { id: 'STF-105', name: 'Karthik Raja', store_name: 'Bengaluru - Indiranagar' },
  { id: 'STF-106', name: 'Sneha Reddy', store_name: 'Bengaluru - Indiranagar' },
  { id: 'STF-107', name: 'Vikram Singh', store_name: 'Hyderabad - Inorbit Mall' },
  { id: 'STF-108', name: 'Ananya Nair', store_name: 'Chennai - Express Avenue' }
];

function seedDatabase(force = false) {
  const storeCount = db.prepare('SELECT COUNT(*) as count FROM stores').get().count;
  if (storeCount === 0 || force) {
    db.prepare('DELETE FROM stores').run();
    const insertStore = db.prepare('INSERT INTO stores (id, name, location) VALUES (?, ?, ?)');
    for (const store of sampleStores) {
      insertStore.run(store.id, store.name, store.location);
    }
  }

  const staffCount = db.prepare('SELECT COUNT(*) as count FROM staff').get().count;
  if (staffCount === 0 || force) {
    db.prepare('DELETE FROM staff').run();
    const insertStaff = db.prepare('INSERT INTO staff (id, name, store_name) VALUES (?, ?, ?)');
    for (const s of sampleStaff) {
      insertStaff.run(s.id, s.name, s.store_name);
    }
  }

  const salesCount = db.prepare('SELECT COUNT(*) as count FROM sales_entries').get().count;
  if (salesCount === 0 || force) {
    if (force) {
      db.prepare('DELETE FROM sales_entries').run();
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const insertSales = db.prepare(`
      INSERT INTO sales_entries (
        date, staff_id, staff_name, store_name, daily_target, daily_sales, bills, quantity, remarks, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Today's entries
    const todayData = [
      { staff_id: 'STF-101', staff_name: 'Rahul Sharma', store_name: 'Mumbai - Phoenix Palladium', target: 30000, sales: 28500, bills: 14, qty: 22, remarks: 'Evening footfall was strong' },
      { staff_id: 'STF-102', staff_name: 'Priya Patel', store_name: 'Mumbai - Phoenix Palladium', target: 32000, sales: 35200, bills: 18, qty: 29, remarks: 'Exceeded target on new arrivals' },
      { staff_id: 'STF-103', staff_name: 'Amit Verma', store_name: 'Delhi - Connaught Place', target: 28000, sales: 25000, bills: 12, qty: 19, remarks: 'Shortfall by ₹3,000' },
      { staff_id: 'STF-104', staff_name: 'Neha Gupta', store_name: 'Delhi - Connaught Place', target: 35000, sales: 39800, bills: 21, qty: 34, remarks: 'Top bill value of the day' },
      { staff_id: 'STF-105', staff_name: 'Karthik Raja', store_name: 'Bengaluru - Indiranagar', target: 30000, sales: 31500, bills: 16, qty: 25, remarks: 'Good accessory add-on conversions' },
      { staff_id: 'STF-106', staff_name: 'Sneha Reddy', store_name: 'Bengaluru - Indiranagar', target: 26000, sales: 22800, bills: 11, qty: 16, remarks: 'Slow afternoon conversion' },
      { staff_id: 'STF-107', staff_name: 'Vikram Singh', store_name: 'Hyderabad - Inorbit Mall', target: 34000, sales: 36500, bills: 19, qty: 30, remarks: 'Corporate gifting bulk purchase' },
      { staff_id: 'STF-108', staff_name: 'Ananya Nair', store_name: 'Chennai - Express Avenue', target: 25000, sales: 27400, bills: 15, qty: 23, remarks: 'Solid festive ethnic sales' }
    ];

    const now = Date.now();
    for (const item of todayData) {
      insertSales.run(todayStr, item.staff_id, item.staff_name, item.store_name, item.target, item.sales, item.bills, item.qty, item.remarks, 1, now, now);
    }

    // Past 5 days in this week
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      const pastDate = d.toISOString().split('T')[0];

      sampleStaff.forEach((staff, idx) => {
        const baseTarget = 26000 + (idx % 4) * 3000;
        const variance = (((idx * 7 + dayOffset * 13) % 21) - 10) / 100;
        const sales = Math.max(15000, Math.round(baseTarget * (1.0 + variance)));
        const bills = 10 + ((idx * 3 + dayOffset) % 12);
        const qty = Math.round(bills * 1.6);
        insertSales.run(pastDate, staff.id, staff.name, staff.store_name, baseTarget, sales, bills, qty, 'Standard daily sales', 1, now, now);
      });
    }

    // Representative months in current financial year (April - October)
    const currentYear = new Date().getFullYear();
    const pastMonths = [
      `${currentYear}-04-15`, `${currentYear}-05-15`, `${currentYear}-06-15`,
      `${currentYear}-07-15`, `${currentYear}-08-15`, `${currentYear}-09-15`, `${currentYear}-10-15`
    ];

    for (const mDate of pastMonths) {
      if (mDate >= todayStr) continue;
      sampleStaff.forEach((staff, idx) => {
        const monthTarget = 400000 + (idx * 20000);
        const monthSales = Math.round(monthTarget * (0.92 + ((idx * 5) % 17) / 100));
        const bills = 180 + (idx * 15);
        const qty = Math.round(bills * 1.8);
        insertSales.run(mDate, staff.id, staff.name, staff.store_name, monthTarget, monthSales, bills, qty, 'Monthly consolidated sales', 1, now, now);
      });
    }
  }
}

seedDatabase(false);

// --- REST API ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: 'production',
    service: 'Staff Sales MIS Web Portal',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/stores', (req, res) => {
  const stores = db.prepare('SELECT * FROM stores ORDER BY name ASC').all();
  res.json(stores);
});

app.get('/api/staff', (req, res) => {
  const staff = db.prepare('SELECT * FROM staff ORDER BY name ASC').all();
  res.json(staff);
});

app.get('/api/sales', (req, res) => {
  const sales = db.prepare('SELECT * FROM sales_entries ORDER BY date DESC, id DESC').all();
  res.json(sales);
});

app.post('/api/sales', (req, res) => {
  const { date, staff_id, staff_name, store_name, daily_target, daily_sales, bills, quantity, remarks } = req.body;

  if (!date || !staff_id || !staff_name || !store_name) {
    return res.status(400).json({ error: 'Date, Staff ID, Staff Name, and Store Name are required' });
  }

  const sVal = parseFloat(daily_sales);
  const tVal = parseFloat(daily_target) || 0;
  const bVal = parseInt(bills, 10) || 0;
  const qVal = parseInt(quantity, 10) || 0;

  if (isNaN(sVal) || sVal < 0) {
    return res.status(400).json({ error: 'Daily sales cannot be negative or empty' });
  }
  if (tVal < 0 || bVal < 0 || qVal < 0) {
    return res.status(400).json({ error: 'Target, bills, and quantity cannot be negative' });
  }

  const now = Date.now();
  // Check if entry exists for this staff and date to prevent accidental duplicates
  const existing = db.prepare('SELECT id FROM sales_entries WHERE staff_id = ? AND date = ?').get(staff_id, date);

  if (existing) {
    db.prepare(`
      UPDATE sales_entries SET
        store_name = ?,
        daily_target = ?,
        daily_sales = ?,
        bills = ?,
        quantity = ?,
        remarks = ?,
        updated_at = ?
      WHERE id = ?
    `).run(store_name, tVal, sVal, bVal, qVal, remarks || '', now, existing.id);

    const updated = db.prepare('SELECT * FROM sales_entries WHERE id = ?').get(existing.id);
    return res.json({ message: 'Entry updated successfully', entry: updated });
  } else {
    const result = db.prepare(`
      INSERT INTO sales_entries (
        date, staff_id, staff_name, store_name, daily_target, daily_sales, bills, quantity, remarks, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(date, staff_id, staff_name, store_name, tVal, sVal, bVal, qVal, remarks || '', now, now);

    const inserted = db.prepare('SELECT * FROM sales_entries WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ message: 'Entry recorded successfully', entry: inserted });
  }
});

app.put('/api/sales/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { date, daily_target, daily_sales, bills, quantity, remarks } = req.body;

  const sVal = parseFloat(daily_sales);
  const tVal = parseFloat(daily_target) || 0;
  const bVal = parseInt(bills, 10) || 0;
  const qVal = parseInt(quantity, 10) || 0;

  if (isNaN(sVal) || sVal < 0 || tVal < 0 || bVal < 0 || qVal < 0) {
    return res.status(400).json({ error: 'Invalid numbers: sales, target, bills and quantity cannot be negative' });
  }

  const now = Date.now();
  db.prepare(`
    UPDATE sales_entries SET
      date = ?,
      daily_target = ?,
      daily_sales = ?,
      bills = ?,
      quantity = ?,
      remarks = ?,
      updated_at = ?
    WHERE id = ?
  `).run(date, tVal, sVal, bVal, qVal, remarks || '', now, id);

  const updated = db.prepare('SELECT * FROM sales_entries WHERE id = ?').get(id);
  res.json({ message: 'Entry updated', entry: updated });
});

app.delete('/api/sales/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM sales_entries WHERE id = ?').run(id);
  res.json({ message: 'Entry deleted successfully' });
});

app.post('/api/demo/reload', (req, res) => {
  seedDatabase(true);
  res.json({ message: 'Sample demo data reloaded successfully' });
});

app.post('/api/demo/clear', (req, res) => {
  db.prepare('DELETE FROM sales_entries WHERE is_demo = 1').run();
  res.json({ message: 'Demo data cleared successfully' });
});

// Serve static frontend assets
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Staff Sales MIS</title></head>
        <body style="font-family:sans-serif;padding:40px;text-align:center;">
          <h2>Staff Sales MIS Portal Server is running</h2>
          <p>Listening on port ${PORT}. Building web frontend...</p>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, HOST, () => {
  console.log(`[Cloud Run] Staff Sales MIS Portal server listening on http://${HOST}:${PORT}`);
});
