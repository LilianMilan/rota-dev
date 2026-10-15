-- Cotas diárias por usuário (agente IA, geração de plano). Usado pelas
-- functions agent-chat e generate-plan. Rodar uma vez no SQL Editor do Supabase.

create table if not exists public.usage_quota (
  clerk_id text not null,
  kind text not null,
  day date not null,
  count int not null default 0,
  primary key (clerk_id, kind, day)
);

-- Só a service role (functions) mexe aqui.
alter table public.usage_quota enable row level security;

-- Conta 1 uso e diz se ainda estava dentro do limite. Atômico: duas
-- requisições ao mesmo tempo não passam do limite. Dia no fuso de Brasília.
create or replace function public.use_quota(p_clerk_id text, p_kind text, p_limit int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'America/Sao_Paulo')::date;
  v_count int;
begin
  insert into usage_quota (clerk_id, kind, day, count)
  values (p_clerk_id, p_kind, v_day, 1)
  on conflict (clerk_id, kind, day) do update
    set count = usage_quota.count + 1
    where usage_quota.count < p_limit
  returning count into v_count;

  return v_count is not null;
end;
$$;

revoke execute on function public.use_quota(text, text, int) from public, anon, authenticated;
grant execute on function public.use_quota(text, text, int) to service_role;
