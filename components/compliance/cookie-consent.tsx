"use client";

import { useState, useEffect } from "react";
import { Shield, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("vriksh_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("vriksh_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("vriksh_cookie_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-[420px] z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-forest-900 border-2 border-khaki-400/30 text-khaki-100 p-6 shadow-2xl relative">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 bg-khaki-100 flex items-center justify-center text-forest-900 shrink-0 transform -rotate-6">
            <Shield size={20} />
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Privacy Protocol_v1.0</h4>
            <p className="text-[10px] leading-relaxed text-khaki-600 font-medium">
              VrikshLogix uses required technical identifiers to maintain your high-precision compliance session. By continuing, you agree to our EUDR-aligned data handling practices.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button 
                onClick={handleAccept}
                className="h-9 flex-1 bg-khaki-100 text-forest-900 rounded-none text-[10px] uppercase font-bold tracking-widest hover:bg-white transition-all shadow-md group"
              >
                Accept_Protocol <Check className="ml-2 h-3 w-3 group-hover:scale-125 transition-transform" />
              </Button>
              <Button 
                onClick={handleDecline}
                variant="ghost"
                className="h-9 text-khaki-600 hover:text-khaki-100 hover:bg-forest-800 rounded-none text-[10px] uppercase font-bold tracking-widest px-4 border border-khaki-900"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleDecline}
          className="absolute top-3 right-3 text-khaki-100/30 hover:text-khaki-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
