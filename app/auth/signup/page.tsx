"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TreePine, ArrowRight, UserPlus, Factory, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first: "",
    last: "",
    org: "",
    email: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first,
            last_name: formData.last,
            company_name: formData.org,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error("Registration Failed", {
          description: error.message,
        });
        return;
      }

      toast.success("Profile Initialized", {
        description: "Please check your email to verify your account.",
      });
      // Optionally redirect to a 'please verify' page
      router.push("/auth/login?verified=false");
    } catch (err) {
      toast.error("Process Error", {
        description: "A system error occurred during profile initialization.",
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
            <div className="h-10 w-10 bg-khaki-100 flex items-center justify-center text-forest-900 transform group-hover:-rotate-12 transition-transform">
              <TreePine size={24} />
            </div>
            <span className="font-display text-2xl font-black uppercase tracking-tighter">VrikshLogix</span>
          </Link>
          
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-6 italic">
            Traceability <br />
            Starts Here.
          </h1>
          <p className="text-xl text-khaki-600 max-w-md font-medium">
            Join the Saharanpur compliance network. Digitize your supply chain before the Dec 2026 deadline.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-4 bg-forest-800/50 p-4 border border-khaki-100/10">
              <Factory className="text-khaki-400" />
              <div>
                 <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-khaki-100">For Exporters</p>
                 <p className="text-[9px] font-mono text-khaki-600 uppercase">Manage full DDS lifecycle</p>
              </div>
           </div>
           <div className="flex items-center gap-4 bg-forest-800/50 p-4 border border-khaki-100/10 opacity-50">
              <Building2 className="text-khaki-400" />
              <div>
                 <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-khaki-100">For Artisan Units</p>
                 <p className="text-[9px] font-mono text-khaki-600 uppercase">Free digital waypoint tool</p>
              </div>
           </div>
        </div>

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

          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Register Profile</h2>
          <p className="text-muted-foreground text-sm font-medium mb-8 text-khaki-600">Initialize your EUDR compliance license.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="first" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                 <Input 
                   id="first" 
                   placeholder="Rajan" 
                   className="h-11 rounded-none border-border" 
                   required 
                   value={formData.first}
                   onChange={(e) => setFormData({ ...formData, first: e.target.value })}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="last" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                 <Input 
                   id="last" 
                   placeholder="Agarwal" 
                   className="h-11 rounded-none border-border" 
                   required 
                   value={formData.last}
                   onChange={(e) => setFormData({ ...formData, last: e.target.value })}
                 />
               </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Organization / Export House</Label>
              <Input 
                id="org" 
                placeholder="Agarwal Wood Crafts Pvt Ltd" 
                className="h-11 rounded-none border-border" 
                required 
                value={formData.org}
                onChange={(e) => setFormData({ ...formData, org: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="rajan@agarwalcrafts.com" 
                className="h-11 rounded-none border-border" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Access Key</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-11 rounded-none border-border" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 mt-4 bg-forest-900 text-khaki-100 font-bold uppercase tracking-[0.2em] text-xs rounded-none hover:bg-forest-800 transition-all">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Initialize Profile <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <footer className="mt-12 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium">
              By registering, you agree to our <Link href="/privacy" className="text-forest-900 underline">Privacy Policy</Link> and <Link href="/terms" className="text-forest-900 underline">Terms of Service</Link>.
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-4">
              Already registered? <Link href="/auth/login" className="text-forest-900 font-bold">Authorized Login</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
