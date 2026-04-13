# VrikshLogix — EUDR Compliance Intelligence Suite

**VrikshLogix** is a specialized, full-stack Micro-SaaS platform engineered for wood exporters in Saharanpur, India. It centralizes land record verification (UP Bhulekh), satellite deforestation risk analysis (GFW), and supply chain traceability to ensure 100% compliance with **Regulation (EU) 2023/1115 (EUDR)**.

---

## 🏗 Tactical Architecture

### 1. The Golden Record Ledger
Located in `lib/actions/compliance.ts`, this cryptographic engine uses SHA-256 hashing to "seal" every timber batch. It links farmers, permits, and sawmill outputs into an immutable chain-of-custody.

### 2. GIS Intelligence Layer
Specialized polygon processing (Article 9 compliant) in `lib/gis/polygon-intel.ts`:
- **Accuracy**: Spherical area calculations in hectares (ha).
- **Audit**: Post-2020 forest cover loss detection via Hansen GFW dataset integration stubs.

### 3. Regulatory Output Engine
Official Article 12 Public Disclosure Dossiers generated via `lib/exports/pdf-generator.ts`. These stubs follow the **Annex II** structure of EUDR for direct submission to EU TRACES NT.

---

## 🚀 Rapid Deployment (DevOps)

### Containerized Setup
Ensures a consistent production environment.
```bash
# Build and launch the full stack (Next.js + PostGIS)
docker-compose up --build
```

### CI/CD Quality Gates
The included `.github/workflows/compliance-ci.yml` enforces:
- Article 9 Geolocation Math Verification.
- Supply Chain Hash Consistency.
- Industrial Performance Linting.

---

## 🛠 Operator Handbook

### 1. Registering a New Plot
- Use the **Farmer Registry** terminal.
- Digitize coordinates accurately from the UP Bhulekh portal.
- VrikshLogix will automatically run a "Sealing" action to generate the Golden Record ID.

### 2. Risk Command Center
- Monitor all plots for **SATELLITE_RISK**.
- 'RED' plots (>0.1ha loss post-2020) are automatically blocked from inclusion in Export Batches.

### 3. Quarterly Article 12 Filing
- Navigate to the **Compliance Reporting Suite**.
- Use the **DDS Pack Compiler** to collate all quarterly shipment data.
- Preview and Sign the Article 12 Dossier for regulatory submission.

--
*VrikshLogix — Building Trust through Traceability.*
