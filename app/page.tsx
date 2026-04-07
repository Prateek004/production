"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store/AppContext";

export default function RootPage() {
  const router = useRouter();
  const { state } = useApp();

  useEffect(() => {
    if (state.isLoading) return;
    router.replace(state.session ? "/pos" : "/auth");
  }, [state.isLoading, state.session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-primary-300 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}
