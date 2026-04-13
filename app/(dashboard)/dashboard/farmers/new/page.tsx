"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  MapPin,
  TreePine,
  Info,
  Plus,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { registerFarmerAction } from "@/lib/actions/compliance";

// UP districts + tehsils (sample subset — full list would be loaded from a JSON)
const UP_DISTRICTS = [
  {
    name: "Saharanpur",
    tehsils: ["Behat", "Deoband", "Gangoh", "Muzaffarabad", "Nakur", "Rampur Maniharan", "Sarsawa", "Saharanpur"],
  },
  {
    name: "Muzaffarnagar",
    tehsils: ["Budhana", "Charthawal", "Jansath", "Khatauli", "Muzaffarnagar", "Purqazi", "Shahpur"],
  },
  {
    name: "Meerut",
    tehsils: ["Hapur", "Kithore", "Meerut", "Mawana", "Modinagar"],
  },
  {
    name: "Bijnor",
    tehsils: ["Afzalgarh", "Bijnor", "Chandpur", "Haldaur", "Kiratpur", "Kotwali", "Nagina", "Najibabad", "Noorpur"],
  },
];

const TIMBER_SPECIES = [
  "Sheesham (Dalbergia sissoo)",
  "Mango (Mangifera indica)",
  "Teak (Tectona grandis)",
  "Eucalyptus",
  "Poplar",
  "Bamboo",
  "Neem",
  "Mahua",
  "Other",
];

const LAND_USES = [
  { value: "agricultural", label: "Agricultural land (bari)" },
  { value: "homestead", label: "Homestead / house plot" },
  { value: "roadside", label: "Roadside / boundary trees" },
  { value: "forest_fringe", label: "Forest fringe land" },
  { value: "other", label: "Other" },
];

type Step = 1 | 2 | 3 | 4;

export default function NewPlotPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [verified, setVerified] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Farmer fields
  const [farmerName, setFarmerName] = useState("");
  const [farmerVillage, setFarmerVillage] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");

  // Plot fields
  const [district, setDistrict] = useState("Saharanpur");
  const [tehsil, setTehsil] = useState("");
  const [village, setVillage] = useState("");
  const [khasraNo, setKhasraNo] = useState("");
  const [khatauni, setKhatauni] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [areaHa, setAreaHa] = useState("");
  const [landUse, setLandUse] = useState("agricultural");
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);

  const selectedDistrict = UP_DISTRICTS.find((d) => d.name === district);

  const bhulekhDeepLink = `https://bhulekh.up.gov.in/Bhulekh/PublicRorTehsilWise.jsp`;

  const steps = [
    { number: 1, label: "Farmer Details" },
    { number: 2, label: "Plot / Khasra" },
    { number: 3, label: "Bhulekh Verify" },
    { number: 4, label: "Confirm" },
  ];

  function toggleSpecies(s: string) {
    setSelectedSpecies((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleSave() {
    setIsPending(true);

    const formData = new FormData();
    formData.append("farmerName", farmerName);
    formData.append("farmerVillage", farmerVillage);
    formData.append("farmerPhone", farmerPhone);
    formData.append("farmerAadhaar", (document.getElementById("farmer-aadhaar") as HTMLInputElement)?.value || "");
    
    formData.append("khasraNumber", khasraNo);
    formData.append("district", district);
    formData.append("tehsil", tehsil);
    formData.append("village", village);
    formData.append("landUse", landUse);
    formData.append("areaHa", areaHa);
    
    selectedSpecies.forEach(s => formData.append("species", s));

    try {
      const result = await registerFarmerAction(formData);
      if (result.success) {
        toast.success("Plot saved successfully!", {
          description: result.message,
        });
        router.push("/dashboard/farmers");
      } else {
        toast.error("Compliance registration failed", {
          description: result.message,
        });
      }
    } catch (err) {
      toast.error("System error during record sealing.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      {/* Back */}
      <Link href="/dashboard/farmers" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Farmers
      </Link>

      <h1 className="text-2xl font-bold mb-1">Add Farmer & Plot</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Enter plot details and verify against UP Bhulekh land records
      </p>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2 flex-1">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              step > s.number ? "gradient-forest text-white" :
              step === s.number ? "border-2 border-primary text-primary" :
              "border border-border text-muted-foreground"
            }`}>
              {step > s.number ? "✓" : s.number}
            </div>
            <span className={`text-xs hidden sm:block ${step === s.number ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[1px] ${step > s.number ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Farmer Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-500/10 text-forest-500 text-xs font-bold">1</span>
              Farmer / Timber Supplier Details
            </CardTitle>
            <CardDescription>Enter the details of the farmer who supplied the timber</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farmer-name">Full Name *</Label>
              <Input id="farmer-name" placeholder="e.g. Ramesh Kumar Singh" value={farmerName} onChange={(e) => setFarmerName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farmer-village">Village</Label>
                <Input id="farmer-village" placeholder="e.g. Nauganwan Sadat" value={farmerVillage} onChange={(e) => setFarmerVillage(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farmer-phone">Mobile Number</Label>
                <Input id="farmer-phone" placeholder="+91 98765 43210" value={farmerPhone} onChange={(e) => setFarmerPhone(e.target.value)} />
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Aadhaar is optional but helps uniquely identify farmers with common names. Only the last 4 digits are stored.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmer-aadhaar">Aadhaar Last 4 Digits (optional)</Label>
              <Input id="farmer-aadhaar" placeholder="XXXX" maxLength={4} className="max-w-[120px]" />
            </div>
            <Button
              variant="forest"
              className="w-full mt-2"
              onClick={() => setStep(2)}
              disabled={!farmerName}
            >
              Continue to Plot Details →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Plot details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-500/10 text-forest-500 text-xs font-bold">2</span>
              Plot / Khasra Details
            </CardTitle>
            <CardDescription>Enter the land parcel details from revenue records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {UP_DISTRICTS.map((d) => (
                      <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tehsil">Tehsil *</Label>
                <Select value={tehsil} onValueChange={setTehsil}>
                  <SelectTrigger id="tehsil">
                    <SelectValue placeholder="Select tehsil" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDistrict?.tehsils.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="village">Village / Gram</Label>
                <Input id="village" placeholder="e.g. Nauganwan Sadat" value={village} onChange={(e) => setVillage(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="khasra">Khasra Number *</Label>
                <Input id="khasra" placeholder="e.g. 241/3" value={khasraNo} onChange={(e) => setKhasraNo(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="khatauni">Khatauni Number</Label>
                <Input id="khatauni" placeholder="e.g. 0012-00023" value={khatauni} onChange={(e) => setKhatauni(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area (Hectares)</Label>
                <Input id="area" type="number" placeholder="e.g. 0.82" step="0.01" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Recorded Owner Name (from Khatauni)</Label>
              <Input id="owner" placeholder="As it appears in land records" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="land-use">Land Use Type</Label>
              <Select value={landUse} onValueChange={setLandUse}>
                <SelectTrigger id="land-use">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAND_USES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timber Species on Plot</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {TIMBER_SPECIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecies(s)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      selectedSpecies.includes(s)
                        ? "border-forest-500 bg-forest-500/20 text-forest-400"
                        : "border-border text-muted-foreground hover:border-forest-500/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button
                variant="forest"
                className="flex-1"
                onClick={() => setStep(3)}
                disabled={!khasraNo || !district || !tehsil}
              >
                Continue to Bhulekh Verification →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Bhulekh verification */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-500/10 text-forest-500 text-xs font-bold">3</span>
              Verify on UP Bhulekh
            </CardTitle>
            <CardDescription>
              Cross-reference this plot against the official UP government land registry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Pre-fill summary */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Plot to verify</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">District: </span>
                  <span className="font-medium">{district}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tehsil: </span>
                  <span className="font-medium">{tehsil}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Village: </span>
                  <span className="font-medium">{village || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Khasra No: </span>
                  <span className="font-medium">{khasraNo}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Owner: </span>
                  <span className="font-medium">{ownerName || farmerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Area: </span>
                  <span className="font-medium">{areaHa ? `${areaHa} ha` : "—"}</span>
                </div>
              </div>
            </div>

            {/* Bhulekh link */}
            <div className="rounded-xl border border-forest-500/30 bg-forest-500/5 p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-forest-500" />
                Step 1 — Open Bhulekh Portal
              </h4>
              <p className="text-sm text-muted-foreground">
                Click the button below to open the UP Bhulekh portal. Navigate to:
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                <li>Select <strong className="text-foreground">{district}</strong> district</li>
                <li>Select <strong className="text-foreground">{tehsil}</strong> tehsil</li>
                <li>Select village and enter Khasra <strong className="text-foreground">{khasraNo}</strong></li>
                <li>Confirm the owner name matches your records</li>
              </ol>
              <a href={bhulekhDeepLink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 mt-1">
                  Open bhulekh.up.gov.in
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>

            {/* Confirmation checkbox */}
            <div className="rounded-xl border border-border p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-forest-500" />
                Step 2 — Confirm Verification
              </h4>
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  id="bhulekh-confirm"
                  className="mt-0.5 accent-forest-500 h-4 w-4"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  I have verified this plot on UP Bhulekh. The Khasra number, owner name, and area match the land records for Khasra <strong className="text-foreground">{khasraNo}</strong> in {tehsil}, {district}.
                </span>
              </label>
            </div>

            {verified && (
              <div className="flex items-center gap-2 rounded-lg bg-forest-500/10 border border-forest-500/30 px-4 py-3 text-sm text-forest-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Plot verified from UP Land Records ✓ — This record will be marked as Bhulekh-verified.
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
              <Button
                variant="forest"
                className="flex-1"
                onClick={() => setStep(4)}
              >
                {verified ? "Continue with Verified Plot →" : "Skip Verification →"}
              </Button>
            </div>

            {/* Fallback: TOF / offline mapper */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Plot not found on Bhulekh?{" "}
                <Link href="/field/map" className="text-forest-500 hover:underline">
                  Use the Offline Polygon Mapper instead →
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirm & Save */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-500/10 text-forest-500 text-xs font-bold">4</span>
              Confirm & Save
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-forest-500/20 bg-forest-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <TreePine className="h-5 w-5 text-forest-500" />
                <h3 className="font-semibold">Plot Summary</h3>
                {verified && (
                  <Badge variant="green" className="gap-1 ml-auto">
                    <CheckCircle2 className="h-3 w-3" />
                    Bhulekh Verified
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                {[
                  ["Farmer", farmerName],
                  ["Khasra No", khasraNo],
                  ["District", district],
                  ["Tehsil", tehsil],
                  ["Village", village || "—"],
                  ["Area", areaHa ? `${areaHa} ha` : "—"],
                  ["Land Use", LAND_USES.find((l) => l.value === landUse)?.label || landUse],
                  ["Species", selectedSpecies.length > 0 ? selectedSpecies.join(", ") : "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-muted-foreground">{label}: </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              Next step: run a satellite deforestation risk check on this plot to get a GREEN/AMBER/RED risk score before adding it to a shipment.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} disabled={isPending}>← Back</Button>
              <Button variant="forest" className="flex-1" onClick={handleSave} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isPending ? "Sealing Record..." : "Save Plot & Farmer ✓"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
