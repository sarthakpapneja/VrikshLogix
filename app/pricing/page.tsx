"use client";

import Link from "next/link";
import { Check, ArrowRight, Leaf, Zap, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const plans = [
  {
    id: "free",
    name: "Free / Artisan",
    price: "₹0",
    period: "",
    description: "For individual artisan carvers and small units",
    badge: null,
    features: [
      "GI tag credential registration",
      "Basic inventory tracker",
      "View own plot record",
      "Up to 5 plots",
      "Email support",
    ],
    notIncluded: [
      "Module 1 Bhulekh Connector",
      "Form-T OCR Parser",
      "Sawmill Batch Tracker",
      "DDS Generation",
      "Satellite Risk Check",
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    highlight: false,
  },
  {
    id: "starter",
    name: "Compliance Starter",
    price: "₹1,999",
    period: "/month",
    altPrice: "or ₹199 per DDS",
    description: "For exporters under ₹50L annual EU exports",
    badge: null,
    features: [
      "Everything in Free",
      "UP Bhulekh land connector",
      "Form-T permit OCR parser",
      "Up to 20 plots",
      "5 DDS credits/month",
      "PDF DDS generation",
      "Satellite risk check (5 plots/month)",
      "Priority email support",
    ],
    notIncluded: [
      "Sawmill batch tracker",
      "TRACES NT API submission",
      "ERP connectors",
    ],
    cta: "Start 14-Day Trial",
    ctaVariant: "default" as const,
    highlight: false,
  },
  {
    id: "sme",
    name: "SME Compliance",
    price: "₹4,999",
    period: "/month",
    description: "For exporters ₹50L–₹5Cr EU exports",
    badge: "Most Popular",
    features: [
      "Everything in Starter",
      "Unlimited plots",
      "Sawmill batch tracker (Module 3)",
      "Offline polygon mapper",
      "20 DDS credits/month",
      "Satellite risk check (unlimited)",
      "Batch QR codes",
      "Supply chain pipeline view",
      "Field agent access (up to 3)",
      "Phone + WhatsApp support",
    ],
    notIncluded: [
      "TRACES NT API live submission",
      "ERP connectors",
      "White-label option",
    ],
    cta: "Start 14-Day Trial",
    ctaVariant: "forest" as const,
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plus",
    price: "₹25,000+",
    period: "/month",
    description: "Large trading houses + EU importer white-label",
    badge: "Enterprise",
    features: [
      "Everything in SME",
      "Unlimited DDS credits",
      "TRACES NT API live submission",
      "Dedicated field agent accounts",
      "ERP connector (Phase 3)",
      "White-label option",
      "Dedicated compliance consultant",
      "SLA: 99.9% uptime",
      "Custom integrations",
      "EU importer portal (Phase 3)",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    highlight: false,
  },
];

const creditPacks = [
  { amount: 1, price: "₹200", label: "1 DDS Credit" },
  { amount: 5, price: "₹850", label: "5 DDS Credits", saving: "Save ₹150" },
  { amount: 20, price: "₹3,000", label: "20 DDS Credits", saving: "Save ₹1,000" },
  { amount: 50, price: "₹6,500", label: "50 DDS Credits", saving: "Save ₹3,500" },
];

const faqs = [
  {
    q: "What is a DDS and why do I need one?",
    a: "A Due Diligence Statement (DDS) is a legally required document under EUDR that proves your timber products are deforestation-free. From 30 December 2026, all wood products entering the EU must have a TRACES NT reference number — obtained by submitting a DDS.",
  },
  {
    q: "Why does India need full due diligence?",
    a: "India is classified as Standard Risk under EU Benchmarking Regulation (EU) 2025/1093. This means Indian exporters cannot take any simplified due diligence shortcuts — polygon-level geolocation and satellite deforestation checks are mandatory.",
  },
  {
    q: "What happens if I don't comply by December 2026?",
    a: "Your shipments will be detained at EU ports of entry. EU customs will require a valid TRACES NT DDS reference number before releasing goods. Non-compliance can result in fines up to 4% of annual EU turnover.",
  },
  {
    q: "Can I pay per DDS instead of a monthly subscription?",
    a: "Yes. The Compliance Starter plan supports ₹199 per DDS as a pay-as-you-go alternative. You can also buy DDS Credit Packs for seasonal high-volume exports.",
  },
  {
    q: "Is the 14-day trial truly free?",
    a: "Yes. No credit card required. You get full SME Compliance access including Bhulekh connector, OCR, sawmill tracker, polygon mapper, and 3 DDS credits to try the full workflow.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar stub */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg gradient-forest flex items-center justify-center">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text">VrikshLogix</span>
          </Link>
          <Link href="/register">
            <Button variant="forest" size="sm">Start Free Trial</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge variant="secondary" className="mb-4">Transparent Pricing in INR</Badge>
          <h1 className="text-4xl font-bold">Simple plans for every exporter</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Choose the plan that matches your EU export volume. All plans include a 14-day SME free trial. Razorpay · INR billing · Cancel anytime.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative rounded-2xl border ${plan.highlight ? "border-forest-500/50 shadow-lg shadow-forest-500/10" : "border-border"} bg-card flex flex-col`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant={plan.id === "sme" ? "green" : "secondary"} className="shadow-sm">
                    {plan.badge === "Most Popular" && <Zap className="h-3 w-3 mr-1" />}
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className={`p-6 rounded-t-2xl ${plan.highlight ? "gradient-forest" : ""}`}>
                <h3 className={`font-bold mb-1 ${plan.highlight ? "text-white" : ""}`}>{plan.name}</h3>
                <div className={`flex items-baseline gap-1 mb-1 ${plan.highlight ? "text-white" : ""}`}>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}>{plan.period}</span>
                </div>
                {plan.altPrice && (
                  <p className={`text-xs ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}>{plan.altPrice}</p>
                )}
                <p className={`text-sm mt-2 ${plan.highlight ? "text-white/80" : "text-muted-foreground"}`}>{plan.description}</p>
              </div>

              <div className="p-6 flex flex-col flex-1 gap-4">
                <Link href={plan.id === "enterprise" ? "/contact" : "/register"} className="w-full">
                  <Button
                    variant={plan.ctaVariant}
                    className="w-full"
                    id={`plan-cta-${plan.id}`}
                  >
                    {plan.cta}
                    {plan.id !== "enterprise" && <ArrowRight className="h-4 w-4 ml-1" />}
                  </Button>
                </Link>

                <Separator />

                <div className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-forest-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="h-4 w-4 shrink-0 mt-0.5 text-center text-[10px]">✕</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DDS Credit Packs */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">DDS Credit Packs</h2>
            <p className="text-muted-foreground mt-2">For seasonal high-volume exporters. Buy DDS credits à la carte.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creditPacks.map((pack) => (
              <Card key={pack.amount} className="card-hover text-center">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold mb-1">{pack.price}</p>
                  <p className="font-medium mb-1">{pack.label}</p>
                  {pack.saving && (
                    <Badge variant="green" className="text-[10px]">{pack.saving}</Badge>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-4" id={`credit-pack-${pack.amount}`}>
                    Buy Credits
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="mb-16 overflow-x-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Feature Comparison</h2>
          </div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                {plans.map((p) => (
                  <th key={p.id} className={`py-3 px-4 font-semibold text-center ${p.highlight ? "text-forest-500" : ""}`}>
                    {p.name.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["UP Bhulekh Land Connector", false, true, true, true],
                ["Form-T OCR Parser", false, true, true, true],
                ["Sawmill Batch Tracker", false, false, true, true],
                ["Offline Polygon Mapper", false, false, true, true],
                ["Satellite Risk Engine", false, "5/mo", "Unlimited", "Unlimited"],
                ["DDS PDF Generation", false, "5/mo", "20/mo", "Unlimited"],
                ["TRACES NT API Submission", false, false, false, true],
                ["Field Agent Accounts", false, false, "3 users", "Unlimited"],
                ["White-label option", false, false, false, true],
              ].map(([feature, ...values]) => (
                <tr key={feature as string} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{feature as string}</td>
                  {values.map((v, i) => (
                    <td key={i} className="py-3 px-4 text-center">
                      {v === true ? (
                        <Check className="h-4 w-4 text-forest-500 mx-auto" />
                      ) : v === false ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="text-xs font-medium">{v as string}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.q}>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-forest-500/20 bg-forest-500/5 p-10">
          <h2 className="text-2xl font-bold mb-3">Ready to achieve EUDR compliance?</h2>
          <p className="text-muted-foreground mb-6">30 December 2026 is closer than you think. Start your supply chain digitisation today.</p>
          <Link href="/register">
            <Button variant="forest" size="lg">
              Start 14-Day Free Trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">No credit card required · Cancel anytime · Razorpay INR billing</p>
        </div>
      </main>
    </div>
  );
}
