# VrikshLogix — Forest-to-Finish EUDR Compliance

**VrikshLogix** is an enterprise-grade traceability platform designed for timber exporters to meet the rigorous demands of **Regulation (EU) 2023/1115 (EUDR)**. 

Focused on the timber industrial hubs like Saharanpur, India, VrikshLogix transforms fragmented supply chain data into a "Golden Record" of compliance—linking specific harvest plots to final export shipments with cryptographic integrity.

---

## 🌟 Key Features

### 🗺️ GIS Supply Chain Dashboard
- **Interactive Workbench**: Unified map interface for plot digitization, satellite audit overlays, and supply chain visualization.
- **Polygon Intelligence**: Automated spherical area calculation (Hectares) and Article 9 geolocation verification.
- **Stability-First Architecture**: Hardened WebGL lifecycle prevents "white screen" failures during navigation.

### ⛓️ Traceability Pipeline
- **Chain-of-Custody Graph**: Real-time visualization of timber movement from **Harvest Plot** → **Transit Permit** → **Sawmill Batch** → **Carving Unit** → **Final Shipment**.
- **Golden Record Ledger**: SHA-256 batch hashing ensures that every unit of wood in a container can be traced back to a specific coordinate-verified plot.

### 🔍 Compliance Intelligence
- **UP Bhulekh Integration**: Digital verification of land ownership records (Khasra) for Indian exporters.
- **Satellite Risk Engine**: Automated monitoring for post-2020 forest cover loss using geospatial datasets.
- **OCR Acquisition**: Automated digitization of Form-T transit permits and range-office authorizations.

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS 4, Lucide Icons.
- **GIS Engine**: MapLibre GL v5.23 (Optimized for low-latency layer toggling).
- **Backend/DB**: Supabase (PostgreSQL + PostGIS), SHA-256 Hashing.
- **Visualization**: Recharts (Compliance analytics), SVG-based Pipeline Graphs.

### Core Reliability Patterns
- **Rigid Viewport Architecture**: Fixed-footprint map containers prevent race conditions during React hydration.
- **Navigation Lifecycle Guards**: Explicit WebGL context cleanup during route changes avoids memory leaks and "Zombie" contexts.
- **Fluid Layout**: Unblocked scrolling architecture with a responsive dashboard shell.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or higher
- **Docker**: For containerized PostGIS and environment parity
- **Supabase Account**: For database and auth services

### Installation
1. **Clone the Project**:
   ```bash
   git clone https://github.com/sarthakpapneja/VrikshLogix.git
   cd vrikshlogix
   ```

2. **Setup Environment**:
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   *Access the platform at `http://localhost:3000` (or `3002` if configured).*

---

## 📂 Project Structure

- `/components/compliance` — The Traceability Pipeline and Risk Badge components.
- `/components/dashboard` — GIS Mini-Maps, Sidebar, and Dashboard primitives.
- `/lib/gis` — Geospatial math and polygon auditing utilities.
- `/lib/intelligence` — Bhulekh verification and Satellite audit logic.
- `/supabase/migrations` — Full schema for chain-of-custody tracking.
- `middleware.ts` — Authentication and route protection logic.

---

## 🛡️ Stability & Recovery

If you encounter **Internal Server Errors** in restricted local environments:
1. **Clear Build Cache**: `rm -rf .next node_modules/.cache`
2. **Prune NPM Cache**: `npm cache clean --force`
3. **Restart**: Ensure at least **2GB of free disk space** for Turbopack/Webpack compilation.

---

*VrikshLogix — Building Trust through Traceability.*
