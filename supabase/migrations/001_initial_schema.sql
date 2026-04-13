-- ============================================================
-- VrikshLogix — Initial Database Schema
-- Run against Supabase PostgreSQL with PostGIS enabled
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- for fuzzy text search

-- ============================================================
-- EXPORTERS (tenant root)
-- ============================================================
CREATE TABLE exporters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  gstin TEXT UNIQUE,
  epch_reg_no TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  district TEXT DEFAULT 'Saharanpur',
  state TEXT DEFAULT 'Uttar Pradesh',
  pincode TEXT,
  website TEXT,
  subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free','starter','sme','enterprise')),
  trial_used BOOLEAN DEFAULT FALSE,
  razorpay_customer_id TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FARMERS / TIMBER SUPPLIERS
-- ============================================================
CREATE TABLE farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  aadhaar_last4 TEXT CHECK (aadhaar_last4 ~ '^\d{4}$'),
  village TEXT,
  tehsil TEXT,
  district TEXT,
  state TEXT DEFAULT 'Uttar Pradesh',
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PLOTS (PostGIS polygon geometry)
-- ============================================================
CREATE TABLE plots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE NOT NULL,
  exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE NOT NULL,
  -- Bhulekh fields
  khasra_no TEXT,
  khatauni_no TEXT,
  owner_name TEXT,
  -- Geometry (WGS84)
  polygon GEOMETRY(Polygon, 4326),
  centroid GEOMETRY(Point, 4326),
  -- Area
  area_ha DECIMAL(10,4),
  -- Admin
  village TEXT,
  tehsil TEXT,
  district TEXT,
  state TEXT DEFAULT 'Uttar Pradesh',
  -- Source / verification
  source TEXT DEFAULT 'manual'
    CHECK (source IN ('bhulekh','manual','field_mapped')),
  bhulekh_verified_at TIMESTAMPTZ,
  bhulekh_deep_link TEXT,
  bhulekh_raw JSONB, -- raw Bhulekh response/user entry
  -- Land classification
  land_use TEXT DEFAULT 'agricultural'
    CHECK (land_use IN ('agricultural','homestead','roadside','forest_fringe','other')),
  is_tof BOOLEAN DEFAULT FALSE, -- Trees Outside Forest
  timber_species TEXT[],
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX plots_polygon_idx ON plots USING GIST(polygon);
CREATE INDEX plots_centroid_idx ON plots USING GIST(centroid);
CREATE INDEX plots_exporter_idx ON plots(exporter_id);
CREATE INDEX plots_farmer_idx ON plots(farmer_id);

-- ============================================================
-- FORM-T TRANSIT PERMITS (OCR parsed)
-- ============================================================
CREATE TABLE form_t_permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE NOT NULL,
  plot_id UUID REFERENCES plots(id) ON DELETE SET NULL,
  -- Permit details (OCR extracted or manually entered)
  permit_no TEXT,
  species TEXT[],
  volume_cft DECIMAL(10,2),
  volume_tonnes DECIMAL(10,2),
  origin_district TEXT,
  issue_date DATE,
  valid_until DATE,
  issuing_range_office TEXT,
  -- OCR metadata
  image_url TEXT, -- Supabase Storage path
  ocr_raw JSONB,
  ocr_confidence JSONB, -- {field_name: 0.0-1.0}
  ocr_method TEXT DEFAULT 'tesseract' CHECK (ocr_method IN ('tesseract','document_ai','manual')),
  -- Workflow status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','extracted','verified','rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CARVING UNITS
-- ============================================================
CREATE TABLE carving_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE NOT NULL,
  unit_name TEXT NOT NULL,
  owner_name TEXT,
  address TEXT,
  district TEXT DEFAULT 'Saharanpur',
  contact_phone TEXT,
  gstin TEXT,
  location GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAWMILL BATCHES
-- ============================================================
CREATE TABLE sawmill_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_qr_id TEXT UNIQUE NOT NULL,
  exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE NOT NULL,
  sawmill_name TEXT NOT NULL,
  sawmill_location GEOMETRY(Point, 4326),
  sawmill_address TEXT,
  sawmill_gstin TEXT,
  sawmill_district TEXT,
  processing_date DATE DEFAULT CURRENT_DATE,
  input_volume_cft DECIMAL(10,2) DEFAULT 0,
  output_volume_cft DECIMAL(10,2) DEFAULT 0,
  output_pieces INTEGER,
  conversion_factor DECIMAL(5,4), -- output/input ratio
  species_mix TEXT[],
  notes TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','processing','dispatched','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch inputs: plots + permits → batch
CREATE TABLE batch_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES sawmill_batches(id) ON DELETE CASCADE NOT NULL,
  plot_id UUID REFERENCES plots(id) ON DELETE SET NULL,
  permit_id UUID REFERENCES form_t_permits(id) ON DELETE SET NULL,
  volume_allocated_cft DECIMAL(10,2),
  species TEXT[]
);

-- Batch dispatches: batch → carving units
CREATE TABLE batch_dispatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES sawmill_batches(id) ON DELETE CASCADE NOT NULL,
  carving_unit_id UUID REFERENCES carving_units(id) ON DELETE SET NULL,
  volume_dispatched_cft DECIMAL(10,2),
  pieces_dispatched INTEGER,
  dispatch_date DATE DEFAULT CURRENT_DATE,
  challan_no TEXT,
  notes TEXT
);

-- ============================================================
-- RISK ASSESSMENTS (Satellite)
-- ============================================================
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plot_id UUID REFERENCES plots(id) ON DELETE CASCADE NOT NULL,
  exporter_id UUID REFERENCES exporters(id),
  -- GFW result
  gfw_query JSONB,
  gfw_result JSONB,
  gfw_deforestation_ha DECIMAL(10,4) DEFAULT 0,
  gfw_queried_at TIMESTAMPTZ,
  -- JRC result
  jrc_result JSONB,
  jrc_deforestation_ha DECIMAL(10,4) DEFAULT 0,
  jrc_queried_at TIMESTAMPTZ,
  -- Composite score
  deforestation_detected BOOLEAN DEFAULT FALSE,
  deforestation_area_ha DECIMAL(10,4) DEFAULT 0,
  risk_score TEXT CHECK (risk_score IN ('green','amber','red')),
  risk_reason TEXT,
  data_gaps TEXT[],
  -- Metadata
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  assessed_by UUID REFERENCES auth.users(id),
  data_source TEXT DEFAULT 'gfw' CHECK (data_source IN ('gfw','jrc','manual','mock'))
);

-- ============================================================
-- SHIPMENTS
-- ============================================================
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE NOT NULL,
  shipment_ref TEXT UNIQUE,
  eu_buyer_name TEXT,
  eu_buyer_country TEXT DEFAULT 'DE',
  eu_buyer_eori TEXT,
  hs_codes TEXT[],
  product_description TEXT,
  volume_kg DECIMAL(10,2),
  volume_cbm DECIMAL(10,3),
  shipment_date DATE,
  port_of_export TEXT DEFAULT 'Nhava Sheva',
  bl_number TEXT,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','dds_pending','dds_generated','submitted','cleared')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: shipments ↔ sawmill batches
CREATE TABLE shipment_batches (
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES sawmill_batches(id),
  PRIMARY KEY (shipment_id, batch_id)
);

-- ============================================================
-- DDS RECORDS
-- ============================================================
CREATE TABLE dds_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) UNIQUE,
  exporter_id UUID REFERENCES exporters(id),
  -- PDF
  dds_pdf_url TEXT,
  -- EUDR payload
  dds_geojson JSONB,
  dds_payload JSONB,
  dds_version TEXT DEFAULT '1.0',
  -- TRACES NT
  traces_reference_no TEXT,
  traces_submitted_at TIMESTAMPTZ,
  traces_status TEXT DEFAULT 'not_submitted'
    CHECK (traces_status IN ('not_submitted','submitted','accepted','rejected','pending')),
  traces_rejection_reason TEXT,
  -- Audit
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exporter_id UUID REFERENCES exporters(id) UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free'
    CHECK (plan IN ('free','starter','sme','enterprise')),
  razorpay_subscription_id TEXT,
  razorpay_plan_id TEXT,
  status TEXT DEFAULT 'trial'
    CHECK (status IN ('active','paused','cancelled','trial','expired')),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  dds_credits INTEGER DEFAULT 0,
  monthly_dds_limit INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DDS Credit Transactions
CREATE TABLE dds_credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exporter_id UUID REFERENCES exporters(id),
  amount INTEGER NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- OFFLINE POLYGON SYNC QUEUE
-- ============================================================
CREATE TABLE offline_polygon_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exporter_id UUID REFERENCES exporters(id),
  field_agent_id UUID REFERENCES auth.users(id),
  local_id TEXT NOT NULL,
  plot_data JSONB NOT NULL,
  synced_plot_id UUID REFERENCES plots(id),
  sync_status TEXT DEFAULT 'pending'
    CHECK (sync_status IN ('pending','synced','error')),
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exporter_id UUID,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  payload JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX audit_log_exporter_idx ON audit_log(exporter_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE exporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_t_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE carving_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE sawmill_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dds_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function: get current exporter id from JWT
CREATE OR REPLACE FUNCTION get_exporter_id()
RETURNS UUID AS $$
  SELECT id FROM exporters WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Policies: exporters
CREATE POLICY "Users manage own exporter" ON exporters
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies: farmers (scoped to exporter)
CREATE POLICY "Exporter manages farmers" ON farmers
  FOR ALL USING (exporter_id = get_exporter_id());

-- RLS Policies: plots
CREATE POLICY "Exporter manages plots" ON plots
  FOR ALL USING (exporter_id = get_exporter_id());

-- RLS Policies: form_t_permits
CREATE POLICY "Exporter manages permits" ON form_t_permits
  FOR ALL USING (exporter_id = get_exporter_id());

-- RLS Policies: carving_units
CREATE POLICY "Exporter manages carving units" ON carving_units
  FOR ALL USING (exporter_id = get_exporter_id());

-- RLS Policies: sawmill_batches
CREATE POLICY "Exporter manages batches" ON sawmill_batches
  FOR ALL USING (exporter_id = get_exporter_id());

-- RLS Policies: batch_inputs (via batch ownership)
CREATE POLICY "Exporter manages batch inputs" ON batch_inputs
  FOR ALL USING (
    batch_id IN (SELECT id FROM sawmill_batches WHERE exporter_id = get_exporter_id())
  );

-- RLS Policies: batch_dispatches
CREATE POLICY "Exporter manages dispatches" ON batch_dispatches
  FOR ALL USING (
    batch_id IN (SELECT id FROM sawmill_batches WHERE exporter_id = get_exporter_id())
  );

-- RLS Policies: risk_assessments
CREATE POLICY "Exporter manages risk assessments" ON risk_assessments
  FOR ALL USING (exporter_id = get_exporter_id());

-- RLS Policies: shipments
CREATE POLICY "Exporter manages shipments" ON shipments
  FOR ALL USING (exporter_id = get_exporter_id());

-- RLS Policies: dds_records
CREATE POLICY "Exporter manages DDS" ON dds_records
  FOR ALL USING (exporter_id = get_exporter_id());

-- RLS Policies: subscriptions
CREATE POLICY "Exporter manages subscription" ON subscriptions
  FOR ALL USING (exporter_id = get_exporter_id());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exporters_updated_at BEFORE UPDATE ON exporters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER farmers_updated_at BEFORE UPDATE ON farmers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER plots_updated_at BEFORE UPDATE ON plots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER permits_updated_at BEFORE UPDATE ON form_t_permits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER batches_updated_at BEFORE UPDATE ON sawmill_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-compute centroid from polygon
CREATE OR REPLACE FUNCTION compute_centroid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.polygon IS NOT NULL THEN
    NEW.centroid = ST_Centroid(NEW.polygon);
    IF NEW.area_ha IS NULL THEN
      NEW.area_ha = ROUND(
        (ST_Area(NEW.polygon::geography) / 10000)::NUMERIC, 4
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plots_compute_centroid BEFORE INSERT OR UPDATE ON plots
  FOR EACH ROW EXECUTE FUNCTION compute_centroid();

-- Auto-generate batch QR ID
CREATE OR REPLACE FUNCTION generate_batch_qr_id()
RETURNS TRIGGER AS $$
DECLARE
  seq_no INTEGER;
BEGIN
  IF NEW.batch_qr_id IS NULL THEN
    SELECT COUNT(*) + 1 INTO seq_no FROM sawmill_batches
      WHERE exporter_id = NEW.exporter_id;
    NEW.batch_qr_id = 'VL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(seq_no::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sawmill_batch_qr BEFORE INSERT ON sawmill_batches
  FOR EACH ROW EXECUTE FUNCTION generate_batch_qr_id();

-- Auto-generate shipment ref
CREATE OR REPLACE FUNCTION generate_shipment_ref()
RETURNS TRIGGER AS $$
DECLARE
  seq_no INTEGER;
BEGIN
  IF NEW.shipment_ref IS NULL THEN
    SELECT COUNT(*) + 1 INTO seq_no FROM shipments WHERE exporter_id = NEW.exporter_id;
    NEW.shipment_ref = 'SHP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq_no::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipments_ref BEFORE INSERT ON shipments
  FOR EACH ROW EXECUTE FUNCTION generate_shipment_ref();

-- Create default subscription on new exporter
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (exporter_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'free', 'trial', NOW() + INTERVAL '14 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER exporter_create_subscription AFTER INSERT ON exporters
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();
