"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, ArrowRight, ArrowLeft, Building2, User, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const steps = [
  { number: 1, label: "Company Details" },
  { number: 2, label: "Add First Plot" },
  { number: 3, label: "Upload Form-T" },
  { number: 4, label: "Choose Plan" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [epch, setEpch] = useState("");

  async function handleComplete() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Account created! 14-day trial started.", {
      description: "Welcome to VrikshLogix. Let's build your compliance record.",
    });
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-forest-500/6 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-forest mb-4">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">Start your EUDR compliance journey</h1>
          <p className="text-muted-foreground text-sm mt-1">14-day free trial · No credit card required</p>
        </div>

        {/* Progress */}
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

        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Details</CardTitle>
              <CardDescription>Your export house information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-email">Work Email *</Label>
                <Input id="reg-email" type="email" placeholder="you@exporthouse.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input id="company" placeholder="e.g. Sharma Wood Crafts Pvt Ltd" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" placeholder="09AAABBB1234C1Z5" value={gstin} onChange={(e) => setGstin(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epch">EPCH Reg. No.</Label>
                  <Input id="epch" placeholder="EPCH/XXX/0001" value={epch} onChange={(e) => setEpch(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input defaultValue="Saharanpur" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input defaultValue="Uttar Pradesh" disabled className="opacity-60" />
                </div>
              </div>
              <Button
                variant="forest"
                className="w-full gap-2"
                onClick={() => setStep(2)}
                disabled={!email || !companyName}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Your First Farmer & Plot</CardTitle>
              <CardDescription>We'll guide you through the UP Bhulekh verification process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-forest-500/20 bg-forest-500/5 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">💡 Quick tip</p>
                Have the farmer's Khasra number and Khatauni number ready. You'll find these on any land record document from the Tehsil office.
              </div>
              <div className="space-y-2">
                <Label>Farmer Name *</Label>
                <Input placeholder="e.g. Ramesh Kumar Singh" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Khasra Number *</Label>
                  <Input placeholder="e.g. 241/3" />
                </div>
                <div className="space-y-2">
                  <Label>Tehsil</Label>
                  <Input placeholder="e.g. Behat" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button variant="forest" className="flex-1 gap-2" onClick={() => setStep(3)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <button
                className="text-xs text-muted-foreground hover:text-forest-500 w-full text-center transition-colors"
                onClick={() => setStep(3)}
              >
                Skip for now, add plots later →
              </button>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload Your First Form-T Permit</CardTitle>
              <CardDescription>Let our OCR extract all permit details automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-forest-500/50 hover:bg-forest-500/5 transition-all">
                <p className="text-sm font-medium mb-1">Drop Form-T image here</p>
                <p className="text-xs text-muted-foreground">JPEG, PNG, PDF · OCR extracts Hindi/English text</p>
                <Button variant="outline" size="sm" className="mt-3">Browse Files</Button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button variant="forest" className="flex-1 gap-2" onClick={() => setStep(4)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <button
                className="text-xs text-muted-foreground hover:text-forest-500 w-full text-center transition-colors"
                onClick={() => setStep(4)}
              >
                Skip for now, upload permits later →
              </button>
            </CardContent>
          </Card>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose Your Plan</CardTitle>
              <CardDescription>14-day trial on SME Compliance, no payment now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: "sme", label: "SME Compliance", price: "₹4,999/mo", desc: "Most popular · Unlimited plots, 20 DDS/mo", recommended: true },
                { id: "starter", label: "Compliance Starter", price: "₹1,999/mo or ₹199/DDS", desc: "For smaller EU export volumes", recommended: false },
                { id: "free", label: "Free / Artisan", price: "₹0", desc: "Basic features only", recommended: false },
              ].map((plan) => (
                <label key={plan.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${plan.recommended ? "border-forest-500/50 bg-forest-500/5" : "border-border hover:border-forest-500/30"}`}>
                  <input type="radio" name="plan" value={plan.id} defaultChecked={plan.recommended} className="mt-1 accent-forest-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{plan.label}</span>
                      {plan.recommended && <span className="text-[10px] font-bold text-forest-500 bg-forest-500/10 px-2 py-0.5 rounded-full">Recommended</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.desc}</p>
                    <p className="text-sm font-bold text-foreground mt-1">{plan.price}</p>
                  </div>
                </label>
              ))}

              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={() => setStep(3)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button variant="forest" className="flex-1 gap-2" onClick={handleComplete} disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : <>Start Free Trial <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">No credit card now · You'll be prompted after 14 days</p>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-forest-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
