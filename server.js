import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');

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
    store_id TEXT,
    daily_target REAL DEFAULT 25000,
    daily_sale_target REAL DEFAULT 25000,
    daily_qty_target REAL DEFAULT 20,
    daily_ff_target REAL DEFAULT 5,
    daily_big_bill_target REAL DEFAULT 2,
    monthly_target REAL DEFAULT 750000,
    annual_aop REAL DEFAULT 9000000,
    status TEXT DEFAULT 'ACTIVE'
  );

  CREATE TABLE IF NOT EXISTS sales_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    store_id TEXT NOT NULL,
    store_name TEXT NOT NULL,
    sale_amount REAL NOT NULL,
    qty INTEGER DEFAULT 1,
    ff INTEGER DEFAULT 1,
    big_bill INTEGER DEFAULT 0,
    target_amount REAL DEFAULT 25000,
    target_qty REAL DEFAULT 20,
    target_ff REAL DEFAULT 5,
    target_big_bill REAL DEFAULT 2,
    bill_number TEXT DEFAULT '',
    product_category TEXT DEFAULT 'General',
    payment_mode TEXT DEFAULT 'Cash',
    remarks TEXT DEFAULT '',
    is_demo INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_trans_date ON sales_transactions(date);
  CREATE INDEX IF NOT EXISTS idx_trans_staff ON sales_transactions(staff_id);
  CREATE INDEX IF NOT EXISTS idx_trans_store ON sales_transactions(store_id);
`);

// Helper to get India date & time
function getIndiaDateTime() {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const timeStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).format(now);
  return { date: dateStr, time: timeStr };
}

const sampleStores = [
  { id: 'STR-01', name: 'Mumbai - Phoenix Palladium', location: 'Lower Parel, Mumbai', status: 'ACTIVE' },
  { id: 'STR-02', name: 'Delhi - Connaught Place', location: 'Inner Circle, New Delhi', status: 'ACTIVE' },
  { id: 'STR-03', name: 'Bengaluru - Indiranagar', location: '100ft Road, Bengaluru', status: 'ACTIVE' },
  { id: 'STR-04', name: 'Hyderabad - Inorbit Mall', location: 'Madhapur, Hyderabad', status: 'ACTIVE' },
  { id: 'STR-05', name: 'Chennai - Express Avenue', location: 'Royapettah, Chennai', status: 'ACTIVE' }
];

const sampleStaff = [
  { id: 'STF-101', name: 'Rahul Sharma', store_name: 'Mumbai - Phoenix Palladium', store_id: 'STR-01', daily_target: 25000, daily_sale_target: 25000, daily_qty_target: 20, daily_ff_target: 5, daily_big_bill_target: 2, monthly_target: 750000, annual_aop: 9000000, status: 'ACTIVE' },
  { id: 'STF-102', name: 'Priya Patel', store_name: 'Mumbai - Phoenix Palladium', store_id: 'STR-01', daily_target: 32000, daily_sale_target: 32000, daily_qty_target: 25, daily_ff_target: 6, daily_big_bill_target: 3, monthly_target: 960000, annual_aop: 11500000, status: 'ACTIVE' },
  { id: 'STF-103', name: 'Amit Verma', store_name: 'Delhi - Connaught Place', store_id: 'STR-02', daily_target: 28000, daily_sale_target: 28000, daily_qty_target: 22, daily_ff_target: 5, daily_big_bill_target: 2, monthly_target: 840000, annual_aop: 10000000, status: 'ACTIVE' },
  { id: 'STF-104', name: 'Neha Gupta', store_name: 'Delhi - Connaught Place', store_id: 'STR-02', daily_target: 35000, daily_sale_target: 35000, daily_qty_target: 28, daily_ff_target: 7, daily_big_bill_target: 3, monthly_target: 1050000, annual_aop: 12600000, status: 'ACTIVE' },
  { id: 'STF-105', name: 'Karthik Raja', store_name: 'Bengaluru - Indiranagar', store_id: 'STR-03', daily_target: 30000, daily_sale_target: 30000, daily_qty_target: 24, daily_ff_target: 6, daily_big_bill_target: 2, monthly_target: 900000, annual_aop: 10800000, status: 'ACTIVE' },
  { id: 'STF-106', name: 'Sneha Reddy', store_name: 'Bengaluru - Indiranagar', store_id: 'STR-03', daily_target: 26000, daily_sale_target: 26000, daily_qty_target: 20, daily_ff_target: 5, daily_big_bill_target: 2, monthly_target: 780000, annual_aop: 9360000, status: 'ACTIVE' },
  { id: 'STF-107', name: 'Vikram Singh', store_name: 'Hyderabad - Inorbit Mall', store_id: 'STR-04', daily_target: 34000, daily_sale_target: 34000, daily_qty_target: 26, daily_ff_target: 6, daily_big_bill_target: 3, monthly_target: 1020000, annual_aop: 12240000, status: 'ACTIVE' },
  { id: 'STF-108', name: 'Ananya Nair', store_name: 'Chennai - Express Avenue', store_id: 'STR-05', daily_target: 25000, daily_sale_target: 25000, daily_qty_target: 20, daily_ff_target: 5, daily_big_bill_target: 2, monthly_target: 750000, annual_aop: 9000000, status: 'ACTIVE' }
];

function seedDatabase(force = false) {
  const storeCount = db.prepare('SELECT COUNT(*) as count FROM stores').get().count;
  if (storeCount === 0 || force) {
    db.prepare('DELETE FROM stores').run();
    const insertStore = db.prepare('INSERT INTO stores (id, name, location, status) VALUES (?, ?, ?, ?)');
    for (const store of sampleStores) {
      insertStore.run(store.id, store.name, store.location, store.status);
    }
  }

  const staffCount = db.prepare('SELECT COUNT(*) as count FROM staff').get().count;
  if (staffCount === 0 || force) {
    db.prepare('DELETE FROM staff').run();
    const insertStaff = db.prepare(`
      INSERT INTO staff (id, name, store_name, store_id, daily_target, daily_sale_target, daily_qty_target, daily_ff_target, daily_big_bill_target, monthly_target, annual_aop, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of sampleStaff) {
      insertStaff.run(s.id, s.name, s.store_name, s.store_id, s.daily_target, s.daily_sale_target, s.daily_qty_target, s.daily_ff_target, s.daily_big_bill_target, s.monthly_target, s.annual_aop, s.status);
    }
  }

  const transCount = db.prepare('SELECT COUNT(*) as count FROM sales_transactions').get().count;
  if (transCount === 0 || force) {
    if (force) {
      db.prepare('DELETE FROM sales_transactions').run();
    }

    const { date: todayStr } = getIndiaDateTime();
    const insertTrans = db.prepare(`
      INSERT INTO sales_transactions (
        date, time, staff_id, staff_name, store_id, store_name, sale_amount, qty, ff, big_bill, target_amount, target_qty, target_ff, target_big_bill, bill_number, product_category, payment_mode, remarks, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    const now = Date.now();

    // Rahul's exact 3 demo transactions per user prompt specification:
    // ₹5,000 / Qty 4 / FF 1 / Big Bill 0
    // ₹8,000 / Qty 6 / FF 1 / Big Bill 1
    // ₹7,000 / Qty 5 / FF 1 / Big Bill 0
    const rahulTransactions = [
      { amount: 5000, qty: 4, ff: 1, big_bill: 0, bill: 'R-01', cat: 'Apparel', pay: 'UPI', time: '10:00 AM' },
      { amount: 8000, qty: 6, ff: 1, big_bill: 1, bill: 'R-02', cat: 'Footwear', pay: 'Card', time: '11:30 AM' },
      { amount: 7000, qty: 5, ff: 1, big_bill: 0, bill: 'R-03', cat: 'Accessories', pay: 'Cash', time: '02:15 PM' }
    ];

    for (const t of rahulTransactions) {
      insertTrans.run(
        todayStr, t.time, 'STF-101', 'Rahul Sharma', 'STR-01', 'Mumbai - Phoenix Palladium',
        t.amount, t.qty, t.ff, t.big_bill, 25000, 20, 5, 2, t.bill, t.cat, t.pay, 'Rahul demo transaction', now, now
      );
    }

    // Other staff demo transactions for today
    const otherTodayTransactions = [
      { staff_id: 'STF-102', staff_name: 'Priya Patel', store_id: 'STR-01', store_name: 'Mumbai - Phoenix Palladium', amount: 35200, qty: 25, ff: 6, big_bill: 3, bill: 'B-104', cat: 'Apparel', pay: 'Card', time: '11:30 AM' },
      { staff_id: 'STF-103', staff_name: 'Amit Verma', store_id: 'STR-02', store_name: 'Delhi - Connaught Place', amount: 25000, qty: 20, ff: 5, big_bill: 2, bill: 'B-105', cat: 'Apparel', pay: 'UPI', time: '01:00 PM' },
      { staff_id: 'STF-104', staff_name: 'Neha Gupta', store_id: 'STR-02', store_name: 'Delhi - Connaught Place', amount: 37600, qty: 30, ff: 7, big_bill: 3, bill: 'B-107', cat: 'Apparel', pay: 'Card', time: '04:45 PM' }
    ];

    for (const t of otherTodayTransactions) {
      insertTrans.run(
        todayStr, t.time, t.staff_id, t.staff_name, t.store_id, t.store_name,
        t.amount, t.qty, t.ff, t.big_bill, 30000, 22, 5, 2, t.bill, t.cat, t.pay, 'Demo transaction', now, now
      );
    }

    // Past days for WTD / MTD / YTD rollups
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      const pastDate = d.toISOString().split('T')[0];

      sampleStaff.forEach((staff, idx) => {
        const amount = 20000 + ((idx * 17 + dayOffset * 23) % 10000);
        insertTrans.run(
          pastDate, '12:00 PM', staff.id, staff.name, staff.store_id, staff.store_name,
          amount, 18, 5, 2, staff.daily_sale_target, staff.daily_qty_target, staff.daily_ff_target, staff.daily_big_bill_target,
          `PB-${dayOffset}-${idx}`, 'General', 'Cash', 'Past day record', now, now
        );
      });
    }

    const currentYear = new Date().getFullYear();
    const pastMonths = [
      `${currentYear}-04-15`, `${currentYear}-05-15`, `${currentYear}-06-15`,
      `${currentYear}-07-15`, `${currentYear}-08-15`, `${currentYear}-09-15`, `${currentYear}-10-15`
    ];

    for (const mDate of pastMonths) {
      if (mDate >= todayStr) continue;
      sampleStaff.forEach((staff, idx) => {
        const amount = 500000 + (idx * 25000);
        insertTrans.run(
          mDate, '03:00 PM', staff.id, staff.name, staff.store_id, staff.store_name,
          amount, 350, 100, 30, staff.daily_sale_target, staff.daily_qty_target, staff.daily_ff_target, staff.daily_big_bill_target,
          `FY-${idx}`, 'Apparel', 'Card', 'Monthly audit batch', now, now
        );
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

// Stores CRUD
app.get('/api/stores', (req, res) => {
  const stores = db.prepare('SELECT * FROM stores ORDER BY name ASC').all();
  res.json(stores);
});

app.post('/api/stores', (req, res) => {
  const { id, name, location, status } = req.body;
  if (!id || !name || !location) {
    return res.status(400).json({ error: 'Store ID, Name, and Location are required' });
  }
  try {
    db.prepare('INSERT INTO stores (id, name, location, status) VALUES (?, ?, ?, ?)').run(
      id, name, location, status || 'ACTIVE'
    );
    const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(id);
    res.status(201).json(store);
  } catch (e) {
    res.status(400).json({ error: 'Store ID already exists or invalid data' });
  }
});

app.put('/api/stores/:id', (req, res) => {
  const storeId = req.params.id;
  const { name, location, status } = req.body;
  try {
    db.prepare('UPDATE stores SET name = ?, location = ?, status = ? WHERE id = ?').run(
      name, location, status || 'ACTIVE', storeId
    );
    const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(storeId);
    res.json(store);
  } catch (e) {
    res.status(400).json({ error: 'Failed to update store' });
  }
});

app.delete('/api/stores/:id', (req, res) => {
  const storeId = req.params.id;
  db.prepare('DELETE FROM stores WHERE id = ?').run(storeId);
  res.json({ message: 'Store deleted successfully' });
});

// Staff CRUD
app.get('/api/staff', (req, res) => {
  const staff = db.prepare('SELECT * FROM staff ORDER BY name ASC').all();
  res.json(staff);
});

app.post('/api/staff', (req, res) => {
  const { id, name, store_name, store_id, daily_sale_target, daily_qty_target, daily_ff_target, daily_big_bill_target, monthly_target, annual_aop, status } = req.body;
  if (!id || !name || !store_name) {
    return res.status(400).json({ error: 'Staff ID, Name, and Store are required' });
  }
  const sTgt = daily_sale_target ?? 25000;
  const qTgt = daily_qty_target ?? 20;
  const fTgt = daily_ff_target ?? 5;
  const bTgt = daily_big_bill_target ?? 2;
  const mTgt = monthly_target ?? (sTgt * 30);
  const aAop = annual_aop ?? (mTgt * 12);

  try {
    db.prepare(`
      INSERT INTO staff (id, name, store_name, store_id, daily_target, daily_sale_target, daily_qty_target, daily_ff_target, daily_big_bill_target, monthly_target, annual_aop, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, store_name, store_id || '', sTgt, sTgt, qTgt, fTgt, bTgt, mTgt, aAop, status || 'ACTIVE'
    );
    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(id);
    res.status(201).json(staff);
  } catch (e) {
    res.status(400).json({ error: 'Staff ID already exists or invalid data' });
  }
});

app.put('/api/staff/:id', (req, res) => {
  const staffId = req.params.id;
  const { name, store_name, store_id, daily_sale_target, daily_qty_target, daily_ff_target, daily_big_bill_target, monthly_target, annual_aop, status } = req.body;
  const sTgt = daily_sale_target ?? 25000;
  const qTgt = daily_qty_target ?? 20;
  const fTgt = daily_ff_target ?? 5;
  const bTgt = daily_big_bill_target ?? 2;
  const mTgt = monthly_target ?? (sTgt * 30);
  const aAop = annual_aop ?? (mTgt * 12);

  try {
    db.prepare(`
      UPDATE staff SET name = ?, store_name = ?, store_id = ?, daily_target = ?, daily_sale_target = ?, daily_qty_target = ?, daily_ff_target = ?, daily_big_bill_target = ?, monthly_target = ?, annual_aop = ?, status = ? 
      WHERE id = ?
    `).run(
      name, store_name, store_id || '', sTgt, sTgt, qTgt, fTgt, bTgt, mTgt, aAop, status || 'ACTIVE', staffId
    );
    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId);
    res.json(staff);
  } catch (e) {
    res.status(400).json({ error: 'Failed to update staff' });
  }
});

app.delete('/api/staff/:id', (req, res) => {
  const staffId = req.params.id;
  db.prepare('DELETE FROM staff WHERE id = ?').run(staffId);
  res.json({ message: 'Staff deleted successfully' });
});

// Sales Transactions CRUD
app.get('/api/sales', (req, res) => {
  const sales = db.prepare('SELECT * FROM sales_transactions ORDER BY date DESC, id DESC').all();
  res.json(sales);
});

app.post('/api/sales', (req, res) => {
  const { date, time, staff_id, staff_name, store_id, store_name, sale_amount, qty, ff, big_bill, bill_number, product_category, payment_mode, remarks } = req.body;

  if (!staff_id || sale_amount === undefined) {
    return res.status(400).json({ error: 'Staff ID and Sale Amount are required' });
  }

  const amount = parseFloat(sale_amount);
  if (isNaN(amount) || amount < 0) {
    return res.status(400).json({ error: 'Sale amount cannot be negative or empty' });
  }

  // Get staff targets
  const staffRecord = db.prepare('SELECT * FROM staff WHERE id = ?').get(staff_id);
  const tSale = staffRecord?.daily_sale_target || staffRecord?.daily_target || 25000;
  const tQty = staffRecord?.daily_qty_target || 20;
  const tFF = staffRecord?.daily_ff_target || 5;
  const tBigBill = staffRecord?.daily_big_bill_target || 2;

  const dt = date || getIndiaDateTime().date;
  const tm = time || getIndiaDateTime().time;
  const qVal = parseInt(qty, 10) >= 0 ? parseInt(qty, 10) : 1;
  const fVal = parseInt(ff, 10) >= 0 ? parseInt(ff, 10) : 1;
  
  // Big Bill logic: if big_bill explicit passed, use it; otherwise threshold >= 10000 or amount >= 10000
  let bVal = big_bill !== undefined ? parseInt(big_bill, 10) : (amount >= 10000 ? 1 : 0);

  const now = Date.now();
  const result = db.prepare(`
    INSERT INTO sales_transactions (
      date, time, staff_id, staff_name, store_id, store_name, sale_amount, qty, ff, big_bill, target_amount, target_qty, target_ff, target_big_bill, bill_number, product_category, payment_mode, remarks, is_demo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    dt, tm, staff_id, staff_name || staff_id, store_id || '', store_name || '',
    amount, qVal, fVal, bVal, tSale, tQty, tFF, tBigBill,
    bill_number || '', product_category || 'General', payment_mode || 'Cash', remarks || '', now, now
  );

  const inserted = db.prepare('SELECT * FROM sales_transactions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: 'Sale recorded successfully', entry: inserted });
});

app.put('/api/sales/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { date, time, sale_amount, qty, ff, big_bill, bill_number, product_category, payment_mode, remarks } = req.body;

  const amount = parseFloat(sale_amount);
  if (isNaN(amount) || amount < 0) {
    return res.status(400).json({ error: 'Sale amount cannot be negative' });
  }

  const qVal = qty !== undefined ? parseInt(qty, 10) : 1;
  const fVal = ff !== undefined ? parseInt(ff, 10) : 1;
  const bVal = big_bill !== undefined ? parseInt(big_bill, 10) : (amount >= 10000 ? 1 : 0);

  const now = Date.now();
  db.prepare(`
    UPDATE sales_transactions SET
      date = COALESCE(?, date),
      time = COALESCE(?, time),
      sale_amount = ?,
      qty = ?,
      ff = ?,
      big_bill = ?,
      bill_number = COALESCE(?, bill_number),
      product_category = COALESCE(?, product_category),
      payment_mode = COALESCE(?, payment_mode),
      remarks = COALESCE(?, remarks),
      updated_at = ?
    WHERE id = ?
  `).run(date || null, time || null, amount, qVal, fVal, bVal, bill_number || null, product_category || null, payment_mode || null, remarks || null, now, id);

  const updated = db.prepare('SELECT * FROM sales_transactions WHERE id = ?').get(id);
  res.json({ message: 'Sale updated successfully', entry: updated });
});

app.delete('/api/sales/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM sales_transactions WHERE id = ?').run(id);
  res.json({ message: 'Sale deleted successfully' });
});

app.post('/api/demo/reload', (req, res) => {
  seedDatabase(true);
  res.json({ message: 'Sample demo data reloaded successfully' });
});

app.post('/api/demo/clear', (req, res) => {
  db.prepare('DELETE FROM sales_transactions WHERE is_demo = 1').run();
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
