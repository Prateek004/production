"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store/AppContext";
import DesktopSidebar from "./DesktopSidebar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: ReactNode }) {
  const { state } = useApp();
  const router    = useRouter();

  useEffect(() => {
    if (!state.isLoading && !state.session) router.replace("/auth");
  }, [state.isLoading, state.session, router]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#E8DDD0" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "#B24B2F" }}>
            <svg viewBox="0 0 26 26" fill="none" width={26} height={26}>
              <polygon points="13,2 22,7 22,19 13,24 4,19 4,7" stroke="white" strokeWidth="1.3" fill="none"/>
              <polygon points="13,7 19,10.5 19,17.5 13,21 7,17.5 7,10.5" stroke="white" strokeWidth="1" fill="none"/>
              <line x1="10" y1="3.5" x2="16.5" y2="22.5" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="flex gap-1">
            {[0,1,2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: "#B24B2F", opacity: 0.6, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#E8DDD0" }}>
      <DesktopSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</div>
        <div className="lg:hidden"><BottomNav /></div>
      </div>
    </div>
  );
}
