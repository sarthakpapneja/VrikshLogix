"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("magic");

  async function handleMagicLink() {
    if (!email) { toast.error("Please enter your email address"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setMagicSent(true);
    setLoading(false);
    toast.success("Magic link sent!", { description: `Check ${email} for your secure login link` });
  }

  async function handlePassword() {
    if (!email || !password) { toast.error("Please fill all fields"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    // In real app: supabase.auth.signInWithPassword
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-forest-500/6 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-forest mb-4">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to VrikshLogix</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            {/* Mode toggle */}
            <div className="flex rounded-lg bg-muted p-1">
              <button
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${mode === "magic" ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}
                onClick={() => setMode("magic")}
              >
                Magic Link
              </button>
              <button
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${mode === "password" ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}
                onClick={() => setMode("password")}
              >
                Password
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@yourcompany.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={magicSent}
                />
              </div>
            </div>

            {mode === "password" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Your password"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-right">
                  <button className="text-xs text-forest-500 hover:underline">Forgot password?</button>
                </div>
              </div>
            )}

            {magicSent ? (
              <div className="rounded-lg bg-forest-500/10 border border-forest-500/30 p-4 text-sm text-center text-forest-400 space-y-1">
                <p className="font-semibold">Check your inbox ✉️</p>
                <p className="text-forest-500/70">We sent a link to <strong>{email}</strong></p>
                <button className="text-xs underline mt-1" onClick={() => setMagicSent(false)}>Try again</button>
              </div>
            ) : (
              <Button
                variant="forest"
                className="w-full gap-2"
                disabled={loading}
                onClick={mode === "magic" ? handleMagicLink : handlePassword}
                id="login-submit"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "magic" ? "Send Magic Link" : "Sign In"}
              </Button>
            )}

            {/* Demo shortcut */}
            <div className="text-center">
              <Link href="/dashboard">
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                  Skip login → View demo dashboard
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-forest-500 font-medium hover:underline">
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
