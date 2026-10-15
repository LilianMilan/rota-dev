-- Limite diário de mensagens do agente IA (usado por netlify/functions/agent-chat.ts).
-- Rodar uma vez no SQL Editor do Supabase.

create table if not exists public.agent_usage (
  clerk_id text not null,
  day date not null,
  count int not null default 0,
  primary key (clerk_id, day)
);

-- Só a service role (functions) mexe aqui.
alter table public.agent_usage enable row level security;

-- Conta 1 mensagem e diz se ainda estava dentro do limite. Atômico: duas
-- requisições ao mesmo tempo não passam do limite. Dia no fuso de Brasília.
create or replace function public.use_agent_message(p_clerk_id text, p_limit int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'America/Sao_Paulo')::date;
  v_count int;
begin
  insert into agent_usage (clerk_id, day, count)
  values (p_clerk_id, v_day, 1)
  on conflict (clerk_id, day) do update
    set count = agent_usage.count + 1
    where agent_usage.count < p_limit
  returning count into v_count;

  return v_count is not null;
end;
$$;

revoke execute on function public.use_agent_message(text, int) from public, anon, authenticated;
grant execute on function public.use_agent_message(text, int) to service_role;
