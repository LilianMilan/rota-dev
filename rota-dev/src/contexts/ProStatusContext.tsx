import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

const PRO_CACHE_KEY = "rota-dev-is-pro";

type ProStatusContextType = {
  isPro: boolean;
  planType: "monthly" | "lifetime" | null;
  planCount: number;
  loading: boolean;
  refetch: () => void;
};

const ProStatusContext = createContext<ProStatusContextType>({
  isPro: false,
  planType: null,
  planCount: 0,
  loading: true,
  refetch: () => {},
});

export function ProStatusProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  // Lê cache do localStorage como valor inicial para evitar flash
  const [isPro, setIsPro] = useState(() => localStorage.getItem(PRO_CACHE_KEY) === "true");
  const [planType, setPlanType] = useState<"monthly" | "lifetime" | null>(() => {
    const v = localStorage.getItem("rota-dev-plan-type");
    return v === "monthly" || v === "lifetime" ? v : null;
  });
  const [planCount, setPlanCount] = useState(0);
  const [loading, setLoading] = useState(true);

  function updateIsPro(value: boolean) {
    setIsPro(value);
    localStorage.setItem(PRO_CACHE_KEY, String(value));
  }

  function updatePlanType(value: "monthly" | "lifetime" | null) {
    setPlanType(value);
    if (value) localStorage.setItem("rota-dev-plan-type", value);
    else localStorage.removeItem("rota-dev-plan-type");
  }

  async function syncAndFetch() {
    if (!user) return;

    const clerkId = user.id;
    const email = user.primaryEmailAddress?.emailAddress ?? "";

    try {
      await fetch("/api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: clerkId, email }),
      });

      const res = await fetch(`/api/user-status?clerk_id=${clerkId}`);
      if (res.ok) {
        const data = await res.json() as { is_pro: boolean; plan_count: number; plan_type: "monthly" | "lifetime" | null };
        updateIsPro(data.is_pro);
        updatePlanType(data.plan_type);
        setPlanCount(data.plan_count);
      }
    } catch {
      // API não disponível localmente — mantém cache
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setLoading(false); return; }

    const justSubscribed = new URLSearchParams(window.location.search).get("subscribed") === "true";

    if (justSubscribed) {
      // Marca Pro imediatamente (otimista) e confirma direto no Stripe
      updateIsPro(true);
      const email = user.primaryEmailAddress?.emailAddress ?? "";
      void fetch("/api/confirm-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: user.id, email }),
      });
    }

    void syncAndFetch();
  }, [isLoaded, user?.id]);

  return (
    <ProStatusContext.Provider value={{ isPro, planType, planCount, loading, refetch: syncAndFetch }}>
      {children}
    </ProStatusContext.Provider>
  );
}

export function useProStatus() {
  return useContext(ProStatusContext);
}
