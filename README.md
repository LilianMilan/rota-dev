# 🦊 Rota Dev

Planner de estudos com IA para quem está começando na programação.

🔗 **[rotadev.app.br](https://rotadev.app.br)**

## 💡 Sobre o projeto

O Rota Dev monta um plano de estudos personalizado a partir dos objetivos, do nível e do tempo disponível de cada pessoa. Depois de gerado, o plano fica salvo na conta e dá para acompanhar o progresso semana a semana.

### Funcionalidades

- **Onboarding guiado** — algumas perguntas sobre objetivo, experiência e rotina
- **Plano gerado por IA** — trilha de estudos personalizada (OpenAI)
- **Acompanhamento de progresso** — marca o que já foi estudado
- **Agente IA** — chat focado em programação e carreira dev (só Pro, até 30 mensagens/dia)
- **Login** com e-mail ou conta social (Clerk)

### Planos

| | Free | Pro vitalício |
|---|---|---|
| Preço | grátis | **R$ 9,90** (pagamento único) |
| Planos de estudo | 1 | vários por mês |
| Agente IA | — | ✅ |

Pagamento por cartão (Stripe) ou Pix (Asaas).

## 🛠️ Tecnologias

- **Front:** React 19, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form
- **Back:** Netlify Functions (serverless)
- **Auth:** Clerk
- **Banco:** Supabase (Postgres)
- **IA:** OpenAI
- **Pagamentos:** Stripe e Asaas (Pix)
- **Deploy:** Netlify

## 📁 Estrutura

```
rota-dev/                  # app (o deploy roda daqui)
├── src/
│   ├── pages/             # landing, login, dashboard, plano, progresso, agente IA…
│   ├── features/          # onboarding, pix, landing
│   ├── contexts/          # status Pro do usuário
│   └── lib/               # cliente da API, Supabase, preço
├── netlify/functions/     # API: gerar plano, chat, checkout, webhooks, cotas…
├── supabase/              # SQL (cotas diárias de uso)
└── netlify.toml           # build + /api/* → functions
```

## ▶️ Rodando localmente

```bash
cd rota-dev
npm install
npx netlify dev     # sobe o front e as functions juntos
```

> `npm run dev` sobe só o front (Vite), sem as rotas `/api`.

Crie um `rota-dev/.env` com as variáveis abaixo.

**Front**

| Variável | Para quê |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk (front) |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Supabase |
| `VITE_API_URL` | base da API (opcional, padrão é o mesmo domínio) |
| `VITE_PIX_ENABLED` | liga o pagamento por Pix |

**Functions**

| Variável | Para quê |
|---|---|
| `CLERK_SECRET_KEY` | valida o token do usuário |
| `SUPABASE_SERVICE_ROLE_KEY` | acesso ao banco pelo servidor |
| `OPENAI_API_KEY` | geração de plano e agente IA |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | pagamento por cartão |
| `ASAAS_API_KEY` / `ASAAS_ENV` / `ASAAS_WEBHOOK_TOKEN` | pagamento por Pix |
| `VITE_APP_URL` | URL pública do app (padrão `https://rotadev.app.br`) |

### Banco

Rode [`rota-dev/supabase/usage_quota.sql`](rota-dev/supabase/usage_quota.sql) uma vez no SQL Editor do Supabase — é o contador das cotas diárias do agente IA e da geração de planos.

## 📜 Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento (Vite) |
| `npm run build` | checa os tipos e gera o build em `dist/` |
| `npm run preview` | serve o build localmente |
| `npm run lint` | ESLint |

## 🚀 Deploy

Netlify, a partir da pasta `rota-dev/` (configurado em [`netlify.toml`](rota-dev/netlify.toml)). As variáveis de ambiente ficam no painel do Netlify.

---

Criado por [@codebylilian](https://www.instagram.com/codebylilian)
