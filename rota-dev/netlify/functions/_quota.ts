import { supabaseAdmin } from "./_supabase.js";

/** Conta 1 uso de `kind` hoje; false se passou do limite. Contador em supabase/usage_quota.sql.
 *  Se o contador falhar (ex.: SQL não rodado), deixa passar e registra no log —
 *  melhor que derrubar o recurso de quem pagou. */
export async function consumeQuota(clerkId: string, kind: string, limit: number): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc("use_quota", {
    p_clerk_id: clerkId,
    p_kind: kind,
    p_limit: limit,
  });
  if (error) {
    console.error(`quota ${kind}: contador falhou`, error.message);
    return true;
  }
  return data === true;
}
