"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, ClipboardList, UtensilsCrossed, Settings, Package } from "lucide-react";
import { useApp } from "@/lib/store/AppContext";

const TABS = [
  { href: "/pos",      label: "POS",      Icon: ShoppingCart    },
  { href: "/orders",   label: "Orders",   Icon: ClipboardList   },
  { href: "/menu",     label: "Menu",     Icon: UtensilsCrossed },
  { href: "/stock",    label: "Stock",    Icon: Package         },
  { href: "/settings", label: "Settings", Icon: Settings        },
];

export default function BottomNav() {
  const pathname  = usePathname();
  const { state } = useApp();
  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      style={{ background: "#FFFCF8", borderTop: "1px solid rgba(178,75,47,0.10)" }}>
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors"
              style={{ color: active ? "#B24B2F" : "#B89880" }}>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 rounded-b-full"
                  style={{ height: 2.5, background: "#B24B2F" }} />
              )}
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {href === "/pos" && cartCount > 0 && (
                  <span className="badge-pop absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                    style={{ background: "#B24B2F" }}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
