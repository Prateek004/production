"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart, ClipboardList, UtensilsCrossed,
  Settings, Package, LayoutDashboard,
} from "lucide-react";
import { useApp } from "@/lib/store/AppContext";

const TABS = [
  { href: "/dashboard", label: "Home",     Icon: LayoutDashboard },
  { href: "/pos",       label: "POS",      Icon: ShoppingCart    },
  { href: "/orders",    label: "Orders",   Icon: ClipboardList   },
  { href: "/menu",      label: "Menu",     Icon: UtensilsCrossed },
  { href: "/stock",     label: "Stock",    Icon: Package         },
  { href: "/settings",  label: "Settings", Icon: Settings        },
];

const TC = "#B24B2F";   // primary-500 terracotta
const TC_BG = "#FAF0EB"; // primary-50

export default function BottomNav() {
  const pathname = usePathname();
  const { state } = useApp();
  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
      background: "#1C1410",
      borderTop: "0.5px solid rgba(255,255,255,0.08)",
      paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
    }}>
      <div style={{ display: "flex", maxWidth: 520, margin: "0 auto" }}>
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 10,
                paddingBottom: 6,
                gap: 3,
                position: "relative",
                textDecoration: "none",
                color: active ? "#D97C5A" : "rgba(255,255,255,0.35)",
                transition: "color 0.15s",
              }}
            >
              {/* top active line */}
              {active && (
                <span style={{
                  position: "absolute", top: 0,
                  left: "50%", transform: "translateX(-50%)",
                  width: 28, height: 2,
                  background: "#D97C5A",
                  borderRadius: "0 0 3px 3px",
                }} />
              )}

              {/* icon + cart badge */}
              <div style={{ position: "relative" }}>
                <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
                {href === "/pos" && cartCount > 0 && (
                  <span style={{
                    position: "absolute", top: -5, right: -7,
                    minWidth: 15, height: 15,
                    padding: "0 3px",
                    background: "#D97C5A",
                    color: "white",
                    fontSize: 9,
                    fontWeight: 700,
                    borderRadius: 99,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>

              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: "0.04em" }}>
                {label.toUpperCase()}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
