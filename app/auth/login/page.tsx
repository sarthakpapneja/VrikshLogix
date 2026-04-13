"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TreePine, ArrowRight, Lock, Mail, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showVerifyAlert, setShowVerifyAlert] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "false") {
      setShowVerifyAlert(true);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Auth Failure", {
          description: error.message,
        });
        return;
      }

      toast.success("Access Granted", {
        description: "Redirecting to compliance terminal...",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error("System Error", {
        description: "An unexpected error occurred during authorization.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="bg-forest-900 hidden lg:flex flex-col justify-between p-12 text-khaki-100 relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 group mb-20">
            <div className="h-10 w-10 bg-khaki-100 flex items-center justify-center text-forest-900 transform group-hover:rotate-12 transition-transform">
              <TreePine size={24} />
            </div>
            <span className="font-display text-2xl font-black uppercase tracking-tighter">VrikshLogix</span>
          </Link>
          
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            Securing the <br /> Golden Record.
          </h1>
          <p className="text-xl text-khaki-600 max-w-md font-medium">
            Access the forest-to-finish traceability portal and Article 10 audit logs.
          </p>
        </div>

        <div className="relative z-10 bg-forest-800/50 p-6 border border-khaki-100/10 inline-block self-start font-mono text-[10px] uppercase tracking-widest text-khaki-600">
           System Access Monitoring: ACTIVE · SHA-256 Protocol
        </div>

        {/* Tactical background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
           <TreePine size={600} strokeWidth={0.5} />
        </div>
      </div>

      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-24 bg-white">
        <div className="max-w-sm w-full mx-auto">
          <header className="mb-10 lg:hidden flex items-center gap-2">
             <div className="h-8 w-8 bg-forest-900 flex items-center justify-center text-khaki-100">
               <TreePine size={18} />
             </div>
             <span className="font-display text-xl font-black uppercase tracking-tighter">VrikshLogix</span>
          </header>

          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Operator Login</h2>
          <p className="text-muted-foreground text-sm font-medium mb-8">Enter your credentials to access the compliance terminal.</p>

          {showVerifyAlert && (
            <div className="mb-8 p-4 bg-khaki-100 border-l-4 border-forest-900 flex items-start gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
               <Info className="h-5 w-5 text-forest-900 mt-0.5 shrink-0" />
               <div>
                  <p className="text-xs font-bold uppercase tracking-tight text-forest-900">Verification Required</p>
                  <p className="text-[10px] text-forest-900/70 font-medium leading-relaxed mt-1">
                    We've sent a secure link to your organizational inbox. Please verify your account before logging in.
                  </p>
               </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Work Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="compliance@exports.com" 
                  className="pl-10 h-11 rounded-none border-border" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secret Access Key</Label>
                <Link href="/auth/reset-password" title="Initialize Recovery" className="text-[10px] font-bold uppercase tracking-widest text-khaki-600 hover:text-forest-900 underline">Reset Key</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-11 rounded-none border-border" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-forest-900 text-khaki-100 font-bold uppercase tracking-[0.2em] text-xs rounded-none hover:bg-forest-800 transition-all">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Authorize Access <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>

            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
               </div>
               <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-white px-4 text-muted-foreground">OR_IDENT_GATEWAY</span>
               </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleLogin}
              className="w-full h-11 border-border rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-khaki-100/50 transition-all font-mono"
            >
              Continue with Google Access
            </Button>
          </form>

          <footer className="mt-12 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium">
              Authorized operators only. By logging in, you agree to the <Link href="/terms" className="text-forest-900 underline">Terms of Service</Link>.
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-4">
              Need a compliance license? <Link href="/auth/signup" className="text-forest-900 font-bold">Register Company Profile</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
