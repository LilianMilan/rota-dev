import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

const PRO_CACHE_KEY = "rota-dev-is-pro";

type ProStatusContextType = {
  isPro: boolean;
  planType: "monthly" | "lifetime" | null;
  planCount: number;
  loading: boolean;
  /** Boleto gerado mas ainda não compensado — acesso libera quando o pagamento cair. */
  paymentPending: boolean;
  refetch: () => void;
};

const ProStatusContext = createContext<ProStatusContextType>({
  isPro: false,
  planType: null,
  planCount: 0,
  loading: true,
  paymentPending: false,
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
  const [paymentPending, setPaymentPending] = useState(() => localStorage.getItem("rota-dev-payment-pending") === "true");

  function updateIsPro(value: boolean) {
    setIsPro(value);
    localStorage.setItem(PRO_CACHE_KEY, String(value));
  }

  function updatePaymentPending(value: boolean) {
    setPaymentPending(value);
    if (value) localStorage.setItem("rota-dev-payment-pending", "true");
    else localStorage.removeItem("rota-dev-payment-pending");
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
        // Pagamento compensou (boleto) → some o aviso de pendência.
        if (data.is_pro) updatePaymentPending(false);
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

    // Limpa cache se o usuário mudou (evita herdar status Pro de outra conta)
    const cachedUserId = localStorage.getItem("rota-dev-user-id");
    if (cachedUserId && cachedUserId !== user.id) {
      localStorage.removeItem(PRO_CACHE_KEY);
      localStorage.removeItem("rota-dev-plan-type");
      setIsPro(false);
      setPlanType(null);
    }
    localStorage.setItem("rota-dev-user-id", user.id);

    const params = new URLSearchParams(window.location.search);
    const justSubscribed = params.get("subscribed") === "true";

    if (justSubscribed) {
      // Confirma a compra direto no Stripe pela session_id antes de liberar:
      // cartão volta "paid" (libera na hora); boleto volta "pending" (gerado,
      // mas só libera quando compensar). Depois sincroniza com o banco.
      const email = user.primaryEmailAddress?.emailAddress ?? "";
      const sessionId = params.get("session_id") ?? undefined;
      void (async () => {
        try {
          const res = await fetch("/api/confirm-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clerk_id: user.id, email, session_id: sessionId }),
          });
          const data = await res.json() as { is_pro: boolean; status?: string };
          if (data.is_pro) {
            updateIsPro(true);
            updatePaymentPending(false);
          } else if (data.status === "pending") {
            updatePaymentPending(true);
          }
        } catch {
          // API indisponível — segue para o sync, que lê o status do banco.
        } finally {
          void syncAndFetch();
        }
      })();
    } else {
      void syncAndFetch();
    }
  }, [isLoaded, user?.id]);

  return (
    <ProStatusContext.Provider value={{ isPro, planType, planCount, loading, paymentPending, refetch: syncAndFetch }}>
      {children}
    </ProStatusContext.Provider>
  );
}

export function useProStatus() {
  return useContext(ProStatusContext);
}
