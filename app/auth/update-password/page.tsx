"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TreePine, ArrowRight, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mismatch", { description: "Keys do not match." });
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error("Update Failed", {
          description: error.message,
        });
        return;
      }

      toast.success("Key Updated", {
        description: "New compliance key has been synchronized. Redirecting...",
      });
      router.push("/dashboard");
    } catch (err) {
      toast.error("Process Error", {
        description: "A system error occurred during key synchronization.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-khaki-100/30 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-border p-10 shadow-xl">
        <header className="mb-10 text-center">
          <div className="h-12 w-12 bg-forest-900 mx-auto flex items-center justify-center text-khaki-100 mb-6">
            <TreePine size={24} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Set New Key</h1>
          <p className="text-muted-foreground text-sm font-medium">Re-initialize your organizational access credentials.</p>
        </header>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Access Key</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirm New Key</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="confirm" 
                type="password" 
                placeholder="••••••••" 
                className="pl-10 h-11 rounded-none border-border" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 bg-forest-900 text-khaki-100 font-bold uppercase tracking-[0.2em] text-xs rounded-none hover:bg-forest-800 transition-all">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Finalize Update <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        </form>
      </div>
    </div>
  );
}
