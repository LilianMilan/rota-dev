import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

type ProStatusContextType = {
  isPro: boolean;
  planCount: number;
  loading: boolean;
  refetch: () => void;
};

const ProStatusContext = createContext<ProStatusContextType>({
  isPro: false,
  planCount: 0,
  loading: true,
  refetch: () => {},
});

export function ProStatusProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [isPro, setIsPro] = useState(false);
  const [planCount, setPlanCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function syncAndFetch() {
    if (!user) return;

    const clerkId = user.id;
    const email = user.primaryEmailAddress?.emailAddress ?? "";

    try {
      // Sincroniza usuário no Supabase
      await fetch("/api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: clerkId, email }),
      });

      // Busca status
      const res = await fetch(`/api/user-status?clerk_id=${clerkId}`);
      if (res.ok) {
        const data = await res.json() as { is_pro: boolean; plan_count: number };
        setIsPro(data.is_pro);
        setPlanCount(data.plan_count);
      }
    } catch {
      // API não disponível localmente — usa defaults (isPro=false)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setLoading(false); return; }
    void syncAndFetch();
  }, [isLoaded, user?.id]);

  return (
    <ProStatusContext.Provider value={{ isPro, planCount, loading, refetch: syncAndFetch }}>
      {children}
    </ProStatusContext.Provider>
  );
}

export function useProStatus() {
  return useContext(ProStatusContext);
}
