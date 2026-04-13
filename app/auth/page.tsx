"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, Loader2, Store, ChevronDown } from "lucide-react";
import { signIn, signUp } from "@/lib/supabase/auth";
import { useApp } from "@/lib/store/AppContext";
import { HIDE_FRANCHISE } from "@/lib/utils";
import type { UserRole, BusinessType } from "@/lib/types";

type Mode = "signin" | "signup";

const BIZ_TYPES = [
  { value: "cafe",       label: "Cafe"       },
  { value: "restaurant", label: "Restaurant" },
  { value: "food_truck", label: "Food Truck" },
  { value: "kiosk",      label: "Kiosk"      },
  { value: "bakery",     label: "Bakery"     },
  { value: "franchise",  label: "Franchise"  },
].filter((b) => !(HIDE_FRANCHISE && b.value === "franchise"));

function VynnLogo() {
  return (
    <div className="w-[72px] h-[72px] flex items-center justify-center rounded-[22px] shadow-xl mb-4"
      style={{ background: "#B24B2F" }}>
      <svg viewBox="0 0 26 26" fill="none" width={42} height={42}>
        <polygon points="13,2 22,7 22,19 13,24 4,19 4,7" stroke="white" strokeWidth="1.3" fill="none"/>
        <polygon points="13,7 19,10.5 19,17.5 13,21 7,17.5 7,10.5" stroke="white" strokeWidth="1" fill="none"/>
        <line x1="10" y1="3.5" x2="16.5" y2="22.5" stroke="white" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { setSession, loadMenuFromTemplate } = useApp();

  const [mode,         setMode        ] = useState<Mode>("signin");
  const [username,     setUsername    ] = useState("");
  const [password,     setPassword    ] = useState("");
  const [showPwd,      setShowPwd     ] = useState(false);
  const [role,         setRole        ] = useState<UserRole>("owner");
  const [businessName, setBusinessName] = useState("");
  const [ownerName,    setOwnerName   ] = useState("");
  const [bizType,      setBizType     ] = useState("restaurant");
  const [loading,      setLoading     ] = useState(false);
  const [error,        setError       ] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!username.trim() || password.length < 6) {
      setError("Username required · password ≥ 6 characters");
      return;
    }
    if (mode === "signup" && !businessName.trim()) {
      setError("Business name required");
      return;
    }
    setLoading(true);

    if (mode === "signup") {
      const result = await signUp({ username, password, role, businessName, ownerName, businessType: bizType });
      if (!result.ok) { setError(result.error ?? "Signup failed"); setLoading(false); return; }
      const login = await signIn(username, password);
      if (!login.ok)  { setError("Signed up! Please sign in."); setLoading(false); setMode("signin"); return; }
      const uid = login.userId ?? `local_${username}`;
      setSession({ userId: uid, username, role, businessName, businessType: bizType as BusinessType, gstPercent: 5 });
      await loadMenuFromTemplate(bizType, uid);
    } else {
      const result = await signIn(username, password);
      if (!result.ok) { setError(result.error ?? "Sign in failed"); setLoading(false); return; }
      const uid = result.userId ?? `local_${username}`;
      setSession({
        userId:       uid,
        username,
        role:         result.role         ?? "cashier" as UserRole,
        businessName: result.businessName ?? "",
        businessType: (result.businessType ?? "restaurant") as BusinessType,
        gstPercent:   result.gstPercent   ?? 5,
        upiId:        result.upiId,
      });
      await loadMenuFromTemplate(result.businessType ?? "restaurant", uid);
    }
    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#1C0C06" }}>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-16 pb-8">
        <VynnLogo />
        <h1 className="text-3xl mb-1"
          style={{ fontFamily: "serif", color: "#B24B2F", letterSpacing: "0.14em", fontWeight: 700 }}>
          VYNN
        </h1>
        <p className="text-xs font-semibold tracking-widest" style={{ color: "rgba(178,75,47,0.5)" }}>
          SMART POS FOR INDIAN F&amp;B
        </p>
      </div>

      {/* Sheet */}
      <div className="w-full rounded-t-[28px] px-6 pt-7 pb-10" style={{ background: "#FFFCF8" }}>

        {/* Toggle */}
        <div className="flex rounded-xl p-[3px] mb-6" style={{ background: "#EFE7D8" }}>
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2.5 rounded-[10px] text-sm font-bold transition-all"
              style={{
                background: mode === m ? "#FFFCF8" : "transparent",
                color:      mode === m ? "#1C1008"  : "#8C6E58",
              }}>
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8C6E58" }} />
            <input className="bm-input pl-10" placeholder="Username" value={username}
              onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" autoCorrect="off" />
          </div>

          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8C6E58" }} />
            <input className="bm-input pl-10 pr-11" placeholder="Password"
              type={showPwd ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)} />
            <button onClick={() => setShowPwd((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#8C6E58" }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === "signup" && (
            <>
              <input className="bm-input" placeholder="Business Name *" value={businessName}
                onChange={(e) => setBusinessName(e.target.value)} />
              <input className="bm-input" placeholder="Owner Name" value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)} />
              <div className="relative">
                <Store size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8C6E58" }} />
                <select className="bm-input pl-10 appearance-none" value={bizType}
                  onChange={(e) => setBizType(e.target.value)}>
                  {BIZ_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#8C6E58" }} />
              </div>
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: "#8C6E58" }}>Role</p>
                <div className="flex gap-2">
                  {(["owner", "cashier"] as UserRole[]).map((r) => (
                    <button key={r} onClick={() => setRole(r)}
                      className="flex-1 py-2.5 rounded-xl border-2 text-sm font-bold capitalize transition-all"
                      style={{
                        borderColor: role === r ? "#B24B2F" : "rgba(178,75,47,0.18)",
                        background:  role === r ? "#FAF0EB" : "#FFFCF8",
                        color:       role === r ? "#B24B2F" : "#8C6E58",
                      }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="text-sm font-semibold rounded-xl px-3 py-2.5 mb-4"
            style={{ background: "#FAF0EB", color: "#B24B2F" }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full rounded-2xl font-bold press shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-white"
          style={{ background: "#B24B2F", height: 52, fontSize: 15 }}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </div>
    </div>
  );
}
