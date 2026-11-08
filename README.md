# Staff Sales Tracker & Store Manager MIS Portal

A mobile-first, production-ready web application for retail staff daily sales tracking, automated WTD, MTD, and YTD performance calculations, and multi-store analytics.

## Features

- **3 Access Modes (No Password Required)**:
  - **Staff Entry (`?mode=staff`)**: Rapid daily entry form for counter associates.
  - **Store Manager (`?mode=sm`)**: WhatsApp-style daily reporting with **Live Automatic MIS Calculations** (WTD, MTD, YTD, Shortfall, Excess).
  - **Admin Dashboard (`?mode=admin`)**: Executive analytics, KPI summary cards, 7-day sales trend chart, staff/store performance rankings, audit log, and reporting tools.
- **Automated MIS Engine**:
  - **Daily**: Sales, targets, shortfall/excess, and achievement % for selected date.
  - **WTD (Week to Date)**: Automatically aggregated from Monday of the current week.
  - **MTD (Month to Date)**: Aggregated from the 1st of the active month.
  - **YTD (Year to Date)**: Calculated using the **Indian Financial Year (April 1 to March 31)**.
  - **Safe Math**: Handles zero targets without returning NaN or Infinity.
- **Persistent Database**:
  - SQLite database (`data/sales_mis.db`) with tables for `stores`, `staff`, and `sales_entries`.
  - Realistic Indian retail demo data pre-seeded (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai) with reload/clear controls.
- **Audit & Reports**:
  - Global instant search across Staff, ID, Store, and Date.
  - Inline edit and delete with confirmation dialog; edits trigger automatic recalculation of all WTD, MTD, and YTD metrics.
  - 1-click CSV export and formatted report clipboard copy.

## Google Cloud Run Deployment

This application is ready to deploy directly to Google Cloud Run.

### 1. Build and Run Locally

```bash
# Install dependencies
npm install

# Build client production bundle
npm run build

# Start production server (listens on PORT or 3000, 0.0.0.0)
npm start
```

### 2. Deploy to Google Cloud Run with gcloud CLI

```bash
# Build and deploy from source
gcloud run deploy staff-sales-mis \
  --source . \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --port 8080
```

### 3. Server Configuration

- The server in `server.js` automatically binds to `0.0.0.0` and listens to `process.env.PORT` (defaults to `8080` in production, `3000` locally).
- Serves both the REST API (`/api/*`) and the static React SPA frontend (`dist/`).
