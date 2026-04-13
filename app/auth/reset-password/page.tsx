"use client";

import { useState } from "react";
import Link from "next/link";
import { TreePine, ArrowRight, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        toast.error("Recovery Failed", {
          description: error.message,
        });
        return;
      }

      setSent(true);
      toast.success("Recovery Sent", {
        description: "Check your email for the recovery link.",
      });
    } catch (err) {
      toast.error("Process Error", {
        description: "A system error occurred during recovery initialization.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-khaki-100/30 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-border p-10 shadow-xl">
        <Link href="/auth/login" className="flex items-center gap-2 group mb-12">
           <ArrowLeft className="h-4 w-4 text-khaki-600 group-hover:-translate-x-1 transition-transform" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-khaki-600">Back to Portal</span>
        </Link>

        {sent ? (
          <div className="text-center space-y-6 py-8">
            <div className="h-16 w-16 bg-forest-900 mx-auto flex items-center justify-center text-khaki-100 rounded-full">
              <Mail size={32} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Transmission Sent</h2>
            <p className="text-muted-foreground font-medium">
              A recovery link has been dispatched to <span className="text-forest-900 font-bold">{email}</span>.
            </p>
            <Link href="/auth/login">
              <Button className="w-full h-12 bg-forest-900 text-khaki-100 font-bold uppercase tracking-widest text-xs rounded-none mt-4">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Recover Key</h1>
              <p className="text-muted-foreground text-sm font-medium">Verify your organizational email to reset your compliance access key.</p>
            </header>

            <form onSubmit={handleReset} className="space-y-6">
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

              <Button type="submit" disabled={loading} className="w-full h-12 bg-forest-900 text-khaki-100 font-bold uppercase tracking-[0.2em] text-xs rounded-none hover:bg-forest-800 transition-all">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Request Verification <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
