# VrikshLogix — Database Schema

This document defines the PostgreSQL / Supabase schema for VrikshLogix. The architecture is designed for **Full Chain-of-Custody Traceability**, satisfying Article 9 (Information), Article 10 (Risk Assessment), and Article 12 (Reporting) of the EUDR.

## Core Tables

### 1. `plots` (The Source)
Stores the geospatial and administrative data for each timber source.
- `id`: UUID (Primary Key)
- `khasra_number`: VARCHAR(50) (Mandatory for UP Bhulekh)
- `owner_name`: VARCHAR(255)
- `polygon`: GEOMETRY(POLYGON, 4326) (GeoJSON Polygon)
- `risk_rating`: ENUM('negligible', 'standard', 'high')
- `bhulekh_verified_at`: TIMESTAMP
- `gfw_audit_log`: JSONB (Satellite alert history)
- `exporter_id`: UUID (Foreign Key to users/orgs)

### 2. `permits` (Harvest Authorization)
Stores the digitized Form-T permits issued by the UP Forest Department.
- `id`: UUID (Primary Key)
- `permit_number`: VARCHAR(100)
- `plot_id`: UUID (Foreign Key to `plots`)
- `species`: VARCHAR(100)
- `volume_cft`: DECIMAL
- `range_office`: VARCHAR(255)
- `ocr_confidence`: DECIMAL
- `document_url`: TEXT (Path to scanned PDF/JPG)
- `issue_date`: DATE

### 3. `sawmill_batches` (The Pivot)
Links raw timber permits to industrial processing lots.
- `id`: UUID (Primary Key)
- `permit_id`: UUID (Foreign Key to `permits`)
- `facility_name`: VARCHAR(255)
- `inlet_weight_kg`: DECIMAL
- `outlet_weight_kg`: DECIMAL
- `transit_pass_number`: VARCHAR(100)
- `batch_hash`: CHAR(64) (SHA-256 for Golden Record)
- `created_at`: TIMESTAMP

### 4. `artisan_tasks` (Manufacturing)
Tracks movement from the sawmill to the carving units.
- `id`: UUID (Primary Key)
- `batch_id`: UUID (Foreign Key to `sawmill_batches`)
- `master_carver_id`: UUID
- `product_type`: VARCHAR(255) (e.g., 'Floral Panels')
- `geolocation_at_logging`: POINT
- `status`: ENUM('assigned', 'processing', 'completed')

### 5. `shipments_dds` (Export Finality)
The final node linking production to the EU Due Diligence Statement.
- `id`: UUID (Primary Key)
- `batch_ids`: UUID[] (Array of constituent batches)
- `dds_reference`: VARCHAR(100) (Assigned by EU TRACES NT)
- `reporting_period`: VARCHAR(20)
- `golden_record_hash`: CHAR(64) (Root hash for Article 12 disclosure)
- `export_certificate_url`: TEXT

## Indexes & Constraints
- UNIQUE (`khasra_number`, `exporter_id`)
- INDEX on `plots.polygon` (GIST) for spatial queries.
- INDEX on `sawmill_batches.batch_hash` for traceability lookups.
