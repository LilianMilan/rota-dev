import { createClient } from "@supabase/supabase-js";

// Cliente server-side com service role key (acesso total, ignora RLS)
// Nunca expor essa chave no frontend
export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
