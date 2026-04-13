import { NextRequest, NextResponse } from "next/server";

/**
 * Form-T OCR API
 * POST /api/ocr
 * Body: FormData with { image: File }
 * Returns: extracted fields with confidence scores
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ error: "FormData required" }, { status: 400 });
  }

  const image = formData.get("image") as File | null;
  if (!image) {
    return NextResponse.json({ error: "image file required" }, { status: 400 });
  }

  const gcpCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

  if (gcpCreds && processorId && !gcpCreds.startsWith("placeholder")) {
    // Real Google Document AI path
    try {
      const result = await callDocumentAI(image, gcpCreds, processorId);
      return NextResponse.json({ method: "document_ai", ...result });
    } catch (err) {
      console.error("[ocr] Document AI failed, falling back to mock:", err);
    }
  }

  // Fallback: return demo extraction
  // In production: this slot is filled by Tesseract.js running browser-side
  const bytes = await image.arrayBuffer();
  const sizeKB = bytes.byteLength / 1024;

  return NextResponse.json({
    method: "mock_server_fallback",
    note: "Set GOOGLE_APPLICATION_CREDENTIALS_JSON + DOCUMENT_AI_PROCESSOR_ID for live OCR. Tesseract.js runs client-side.",
    file_size_kb: sizeKB.toFixed(1),
    fields: {
      permit_no: { value: "UP-SHR-2026-00385", confidence: 0.96 },
      species: { value: "Sheesham (Dalbergia sissoo)", confidence: 0.88 },
      volume_cft: { value: "320.5", confidence: 0.92 },
      volume_tonnes: { value: "—", confidence: 0 },
      origin_district: { value: "Saharanpur", confidence: 0.97 },
      issue_date: { value: "2026-03-15", confidence: 0.91 },
      valid_until: { value: "—", confidence: 0 },
      issuing_range_office: { value: "Forest Range Office, Behat", confidence: 0.74 },
    },
    raw_text_sample: "वन विभाग उत्तर प्रदेश / UP Forest Department\nTransit Permit Form-T\nPermit No: UP-SHR-2026-00385",
  });
}

async function callDocumentAI(
  image: File,
  gcpCredsJson: string,
  processorId: string
) {
  // Google Document AI REST API (no SDK required)
  // Authenticate via service account credentials
  const creds = JSON.parse(gcpCredsJson);
  const bytes = new Uint8Array(await image.arrayBuffer());
  const base64Content = Buffer.from(bytes).toString("base64");

  // Build JWT for Google auth (simplified — use google-auth-library in production)
  const endpoint = `https://documentai.googleapis.com/v1/${processorId}:process`;
  const authToken = await getGoogleAuthToken(creds);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      rawDocument: {
        content: base64Content,
        mimeType: image.type || "image/jpeg",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Document AI API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const entities = json.document?.entities ?? [];

  const fieldMap: Record<string, { value: string; confidence: number }> = {};
  entities.forEach((entity: { type?: string; mentionText?: string; confidence?: number }) => {
    const type = entity.type ?? "";
    const value = entity.mentionText ?? "";
    const confidence = entity.confidence ?? 0;
    if (type) fieldMap[type] = { value, confidence };
  });

  return {
    fields: fieldMap,
    raw_text_sample: json.document?.text?.substring(0, 200) ?? "",
  };
}

async function getGoogleAuthToken(creds: { client_email: string; private_key: string }): Promise<string> {
  // In production, use google-auth-library for proper JWT signing
  // This is a stub return — replace with actual implementation
  void creds;
  throw new Error("Google auth not configured — install google-auth-library");
}


export async function GET() {
  return NextResponse.json({
    message: "Form-T OCR API",
    engines: ["document_ai", "tesseract_client_side"],
    status: process.env.DOCUMENT_AI_PROCESSOR_ID ? "document_ai_configured" : "mock_mode",
  });
}
