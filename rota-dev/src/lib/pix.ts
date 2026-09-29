// Pix via Asaas. Só aparece com VITE_PIX_ENABLED=true (deploy seguro antes
// das chaves de produção estarem configuradas no Netlify).
export const PIX_ENABLED = import.meta.env.VITE_PIX_ENABLED === "true";
