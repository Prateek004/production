"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, ClipboardList, UtensilsCrossed, BarChart2, Settings, LogOut, Package } from "lucide-react";
import { useApp } from "@/lib/store/AppContext";
import { signOut } from "@/lib/supabase/auth";

const NAV = [
  { href: "/pos",      label: "Register",  Icon: ShoppingCart    },
  { href: "/orders",   label: "Orders",    Icon: ClipboardList   },
  { href: "/menu",     label: "Menu",      Icon: UtensilsCrossed },
  { href: "/stock",    label: "Stock",     Icon: Package         },
  { href: "/stats",    label: "Stats",     Icon: BarChart2       },
  { href: "/settings", label: "Settings",  Icon: Settings        },
];

function VynnMark() {
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md"
      style={{ background: "#B24B2F" }}>
      <svg viewBox="0 0 26 26" fill="none" width={20} height={20}>
        <polygon points="13,2 22,7 22,19 13,24 4,19 4,7" stroke="white" strokeWidth="1.3" fill="none"/>
        <polygon points="13,7 19,10.5 19,17.5 13,21 7,17.5 7,10.5" stroke="white" strokeWidth="1" fill="none"/>
        <line x1="10" y1="3.5" x2="16.5" y2="22.5" stroke="white" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { state, setSession } = useApp();

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    router.replace("/auth");
  };

  return (
    <aside className="hidden lg:flex flex-col w-16 xl:w-56 h-screen shrink-0"
      style={{ background: "#FFFCF8", borderRight: "1px solid rgba(178,75,47,0.10)" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-3 xl:px-4 py-5"
        style={{ borderBottom: "1px solid rgba(178,75,47,0.10)" }}>
        <VynnMark />
        <div className="hidden xl:block min-w-0">
          <p className="font-black text-sm tracking-widest" style={{ color: "#B24B2F", fontFamily: "serif", letterSpacing: "0.14em" }}>
            VYNN
          </p>
          <p className="text-[10px] font-semibold truncate" style={{ color: "#8C6E58" }}>
            {state.session?.businessName ?? "Smart POS"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-2 xl:px-3 py-2.5 rounded-xl transition-all press"
              style={{
                background: active ? "rgba(178,75,47,0.08)" : "transparent",
                color:      active ? "#B24B2F" : "#8C6E58",
              }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className="shrink-0" />
              <span className="hidden xl:block text-sm font-bold">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-2" style={{ borderTop: "1px solid rgba(178,75,47,0.10)" }}>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 xl:px-3 py-2.5 rounded-xl transition-all press"
          style={{ color: "#8C6E58" }}>
          <LogOut size={20} className="shrink-0" />
          <span className="hidden xl:block text-sm font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
