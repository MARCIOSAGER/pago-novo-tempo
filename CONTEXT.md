# P.A.G.O. — Novo Tempo | Contexto Completo do Projeto

> Este documento serve como referência completa para qualquer IA, desenvolvedor ou colaborador que precise entender a estrutura, arquitetura, segurança e funcionalidades do projeto P.A.G.O.

---

## 1. Visão Geral

**P.A.G.O.** é um acrônimo para:

- **P** — Princípios acima de Resultados
- **A** — Alinhamento gera Autoridade
- **G** — Governo inicia no Secreto
- **O** — Obediência sustenta o Invisível

É um **sistema de reorganização de vida** criado por **Jefferson Evangelista**, destinado a pessoas que amam a Deus mas vivem desorganizadas. O P.A.G.O. oferece um caminho para estruturar a vida espiritual, emocional e prática através de mentoria fundamentada em princípios bíblicos.

### Filosofia Central

> "Prosperidade sem governo gera queda. Crescimento sem estrutura gera colapso. Fé sem alinhamento gera confusão."

O projeto não é apenas um programa de mentoria espiritual — é um **ecossistema de governo pessoal e corporativo** que visa formar líderes conscientes, organizados e posicionados.

### Sobre Jefferson Evangelista

Jefferson Evangelista é o criador e defensor do P.A.G.O. Ele se define como um **construtor de estruturas e organizador de destinos**. À frente da Interaja e de múltiplas frentes empresariais, Jefferson opera como um arquiteto de sistemas sustentáveis. Atleta de resistência (endurance), Legendário e embaixador dos Legendários. Sua convicção: governo espiritual precede crescimento financeiro, alinhamento precede expansão, obediência precede autoridade.

---

## 2. Identidade Visual

### Filosofia de Design: "Governo Silencioso" — Elegância Subliminar

O estilo visual é **vibrante e espiritual, porém não apelativo — subliminar**. Inspirado no conceito de *quiet luxury*, onde a espiritualidade não grita, ela sussurra com autoridade.

### Paleta de Cores

| Token CSS | Nome | Hex | Uso |
|-----------|------|-----|-----|
| `--navy` | Azul Marinho Profundo | `#1A2744` | Cor primária, fundos escuros, texto principal |
| `--warm-white` | Branco Quente | `#FAFAF8` | Fundos claros, texto sobre escuro |
| `--sand` | Areia | `#E8E0D4` | Fundos secundários, seções alternadas |
| `--gold` | Dourado Discreto | `#B8A88A` | Acentos, CTAs, linhas decorativas |
| `--gold-light` | Dourado Claro | `#C9BC9E` | Hover states |
| `--navy-light` | Navy Claro | `#2A3A5C` | Hover states sobre navy |

### Tipografia

| Fonte | Uso | Classe CSS |
|-------|-----|------------|
| **Cormorant Garamond** | Títulos e display | `font-display` |
| **Lora** | Corpo de texto | `font-body` |
| **Montserrat** | Labels, micro-textos, caixa alta | `font-accent` |

### Assets do Logo

| Variação | URL CDN |
|----------|---------|
| Logo principal (fundo branco) | `https://d2xsxph8kpxj0f.cloudfront.net/.../pago-logo_ea5770c3.jpeg` |
| Logo fundo escuro | `https://d2xsxph8kpxj0f.cloudfront.net/.../logo-dark-bg-WkvJyM9yKnYBzcgNNcwNUt.png` |
| Logo ícone compacto | `https://d2xsxph8kpxj0f.cloudfront.net/.../logo-icon-iVmjCJKvrf9GUWw5WLxVQ2.png` |
| Logo redes sociais | `https://d2xsxph8kpxj0f.cloudfront.net/.../logo-social-L32YuK8M9U3PRTbjdBiBwX.png` |
| Favicon | `https://d2xsxph8kpxj0f.cloudfront.net/.../favicon-large-a3Qg3nmYJL8vzPBfUHDFYm.png` |

### Imagens Geradas por IA

| Imagem | URL CDN |
|--------|---------|
| Hero Background (farol ao pôr do sol) | `https://d2xsxph8kpxj0f.cloudfront.net/.../hero-bg-fyJtxWkcWj2UeE7kR85wJt.webp` |
| Pilar Princípios (montanha ao amanhecer) | `https://d2xsxph8kpxj0f.cloudfront.net/.../pillar-principles-HDhT4DKjE38mG8ZkecmGd4.webp` |
| Pilar Alinhamento (ponte sobre rio) | `https://d2xsxph8kpxj0f.cloudfront.net/.../pillar-alignment-8YXRToADNaAGsGXCjL5Bc7.webp` |
| Pilar Governo (biblioteca/escritório) | `https://d2xsxph8kpxj0f.cloudfront.net/.../pillar-government-FR3LgatrhZbMSEfDZavEpF.webp` |
| Pilar Obediência (caminho na floresta) | `https://d2xsxph8kpxj0f.cloudfront.net/.../pillar-obedience-f5zof3JxmnB8U7Po4wBCp3.webp` |

---

## 3. Arquitetura Técnica

### Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | React + TypeScript | 19.x |
| **Estilização** | Tailwind CSS 4 + Framer Motion | 4.x |
| **Componentes UI** | shadcn/ui (Radix) | Latest |
| **Roteamento** | Wouter | 3.x |
| **Backend** | Express + tRPC | 4.x / 11.x |
| **Banco de Dados** | MySQL/TiDB via Drizzle ORM | - |
| **Armazenamento** | AWS S3 | - |
| **Autenticação** | Manus OAuth + JWT | - |
| **Build** | Vite + esbuild | 7.x |
| **Testes** | Vitest | 2.x |

### Estrutura de Diretórios

```
pago_platform/
├── client/
│   ├── public/                    # Assets estáticos
│   ├── src/
│   │   ├── _core/hooks/           # useAuth hook
│   │   ├── components/            # Componentes reutilizáveis
│   │   │   ├── AboutSection.tsx   # Seção "Sobre o P.A.G.O."
│   │   │   ├── CTASection.tsx     # Formulário de inscrição (com LGPD)
│   │   │   ├── CookieBanner.tsx   # Banner de consentimento de cookies
│   │   │   ├── FAQSection.tsx     # Perguntas frequentes
│   │   │   ├── Footer.tsx         # Rodapé com links legais
│   │   │   ├── HeroSection.tsx    # Seção hero com imagem de fundo
│   │   │   ├── JeffersonSection.tsx # Seção sobre o fundador
│   │   │   ├── KitSection.tsx     # Seção do kit de mentoria
│   │   │   ├── Navbar.tsx         # Navegação principal
│   │   │   ├── PagoChatBot.tsx    # Chatbot flutuante com IA
│   │   │   └── PillarsSection.tsx # Os 4 pilares do P.A.G.O.
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Página principal (landing page)
│   │   │   ├── PrivacyPolicy.tsx  # Política de Privacidade (LGPD)
│   │   │   ├── TermsOfUse.tsx     # Termos de Uso
│   │   │   ├── CookiePolicy.tsx   # Política de Cookies
│   │   │   └── NotFound.tsx       # Página 404
│   │   ├── App.tsx                # Rotas e layout principal
│   │   ├── main.tsx               # Providers (tRPC, QueryClient)
│   │   └── index.css              # Tema global (cores, fontes)
│   └── index.html                 # HTML base com meta tags
├── server/
│   ├── _core/                     # Infraestrutura (OAuth, context, Vite)
│   │   ├── chat.ts                # Helper de chat com IA
│   │   ├── context.ts             # Contexto tRPC
│   │   ├── env.ts                 # Variáveis de ambiente
│   │   ├── index.ts               # Servidor Express principal
│   │   ├── notification.ts        # Notificações para owner
│   │   └── trpc.ts                # Configuração tRPC
│   ├── db.ts                      # Query helpers (Drizzle)
│   ├── routers.ts                 # Rotas tRPC (API)
│   ├── security.ts                # Middleware de segurança
│   └── storage.ts                 # Helpers S3
├── drizzle/
│   └── schema.ts                  # Schema do banco de dados
├── shared/
│   └── const.ts                   # Constantes compartilhadas
├── docs/
│   ├── ebook-pago-metodologia.md  # Ebook completo do P.A.G.O.
│   └── recomendacoes-tecnicas-plataforma.md # Recomendações técnicas
└── CONTEXT.md                     # Este arquivo
```

---

## 4. Banco de Dados

### Tabelas

#### `users` — Usuários autenticados via OAuth

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INT (PK, auto) | ID do usuário |
| `openId` | VARCHAR(64) | Identificador OAuth único |
| `name` | TEXT | Nome do usuário |
| `email` | VARCHAR(320) | Email |
| `loginMethod` | VARCHAR(64) | Método de login |
| `role` | ENUM('user','admin') | Papel (default: 'user') |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Última atualização |
| `lastSignedIn` | TIMESTAMP | Último login |

#### `mentoria_inscriptions` — Inscrições para mentoria

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INT (PK, auto) | ID da inscrição |
| `name` | VARCHAR(255) | Nome do candidato |
| `email` | VARCHAR(320) | Email do candidato |
| `phone` | VARCHAR(30) | Telefone (opcional) |
| `message` | TEXT | Mensagem pessoal (opcional) |
| `status` | ENUM('pending','contacted','enrolled','rejected') | Status (default: 'pending') |
| `createdAt` | TIMESTAMP | Data de inscrição |
| `updatedAt` | TIMESTAMP | Última atualização |

#### `files` — Metadados de arquivos no S3

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INT (PK, auto) | ID do arquivo |
| `fileKey` | VARCHAR(512) | Chave S3 do objeto |
| `url` | TEXT | URL pública do arquivo |
| `filename` | VARCHAR(255) | Nome original do arquivo |
| `mimeType` | VARCHAR(128) | Tipo MIME |
| `size` | BIGINT | Tamanho em bytes |
| `category` | VARCHAR(64) | Categoria (ebook, kit, material) |
| `description` | TEXT | Descrição opcional |
| `uploadedBy` | INT | ID do usuário que fez upload |
| `createdAt` | TIMESTAMP | Data de upload |
| `updatedAt` | TIMESTAMP | Última atualização |

---

## 5. API (tRPC Routers)

### Rotas Públicas (sem autenticação)

| Rota | Tipo | Descrição |
|------|------|-----------|
| `auth.me` | Query | Retorna o usuário autenticado ou null |
| `auth.logout` | Mutation | Limpa o cookie de sessão |
| `mentoria.submit` | Mutation | Submete inscrição para mentoria (com honeypot) |
| `chat.sendMessage` | Mutation | Envia mensagem ao chatbot P.A.G.O. |

### Rotas Protegidas (requer autenticação)

| Rota | Tipo | Descrição |
|------|------|-----------|
| `files.upload` | Mutation | Upload de arquivo para S3 |
| `files.list` | Query | Lista arquivos (com filtro por categoria) |
| `files.getById` | Query | Busca arquivo por ID |

### Rotas Admin (requer role='admin')

| Rota | Tipo | Descrição |
|------|------|-----------|
| `mentoria.list` | Query | Lista todas as inscrições |
| `mentoria.updateStatus` | Mutation | Atualiza status de inscrição |
| `files.delete` | Mutation | Deleta arquivo do S3 |

---

## 6. Segurança

O projeto implementa **12 camadas de segurança** de última geração:

### Camadas de Proteção

| # | Camada | Implementação | Arquivo |
|---|--------|---------------|---------|
| 1 | **HTTP Security Headers** | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) | `server/security.ts` |
| 2 | **Rate Limiting** | express-rate-limit (100 req/15min geral, 20 req/15min sensível, 10 req/15min auth) | `server/security.ts` |
| 3 | **HTTP Parameter Pollution** | hpp middleware | `server/security.ts` |
| 4 | **Input Sanitization** | Strip de tags `<script>`, `<iframe>`, event handlers, `javascript:` URIs | `server/security.ts` |
| 5 | **Input Validation** | Zod schemas com regex, min/max length em todas as rotas | `server/routers.ts` |
| 6 | **SQL Injection Prevention** | Drizzle ORM (queries parametrizadas, zero SQL raw) | `server/db.ts` |
| 7 | **File Upload Validation** | Whitelist de MIME types, blacklist de extensões perigosas, limite de 50MB | `server/security.ts` |
| 8 | **Path Traversal Protection** | Rejeição de `..`, `/`, `\`, null bytes em nomes de arquivo | `server/security.ts` |
| 9 | **Request Size Limiting** | JSON body limit: 1MB, URL-encoded limit: 1MB | `server/security.ts` |
| 10 | **Security Audit Logger** | Detecção de padrões suspeitos (SQL injection, XSS, path traversal, command injection) | `server/security.ts` |
| 11 | **Honeypot Anti-Bot** | Campo oculto no formulário que bots preenchem — submissions silenciosamente descartadas | `server/security.ts` + `CTASection.tsx` |
| 12 | **CORS Restritivo** | Apenas origens `localhost`, `*.manus.space`, `*.manus.computer` permitidas | `server/security.ts` |

### Autenticação e Autorização

- **OAuth 2.0** via Manus OAuth com cookie de sessão JWT
- **RBAC (Role-Based Access Control):** `user` e `admin`
- **Procedures protegidas:** `protectedProcedure` (requer login), `adminProcedure` (requer role='admin')
- **Trust Proxy:** Configurado para ambientes com reverse proxy

---

## 7. Conformidade Legal (LGPD)

### Páginas Legais

| Página | Rota | Descrição |
|--------|------|-----------|
| Política de Privacidade | `/privacidade` | Conformidade LGPD completa (Lei 13.709/2018) |
| Termos de Uso | `/termos` | Termos e condições de uso da plataforma |
| Política de Cookies | `/cookies` | Detalhamento de cookies utilizados |

### Mecanismos de Consentimento

1. **Banner de Cookies:** Exibido na primeira visita, com opções de aceitar ou recusar cookies não essenciais. Preferências salvas em `localStorage`.
2. **Checkbox LGPD no Formulário:** O formulário de inscrição requer consentimento explícito antes do envio, com links para Política de Privacidade e Termos de Uso.
3. **Links no Footer:** Todas as páginas legais são acessíveis pelo rodapé do site.

---

## 8. Chatbot P.A.G.O.

O chatbot flutuante é alimentado por IA (GPT-4o via Forge API) com um **system prompt especializado** no contexto do P.A.G.O. Ele:

- Responde em português brasileiro
- Conhece os 4 pilares, a história de Jefferson, o kit de mentoria
- Mantém tom acolhedor, respeitoso e profundo
- Não inventa informações — orienta para inscrição quando não sabe
- Respostas concisas (máximo 3 parágrafos)
- Não faz proselitismo agressivo — é subliminar e elegante

### Componente: `PagoChatBot.tsx`

- Botão flutuante no canto inferior direito (z-index: 9998)
- Janela de chat com header navy, mensagens estilizadas
- Perguntas sugeridas na primeira interação
- Indicador de digitação (bouncing dots)
- Responsivo (max-width: 380px)

---

## 9. Seções do Site

| # | Seção | Componente | Descrição |
|---|-------|-----------|-----------|
| 1 | **Hero** | `HeroSection.tsx` | Imagem cinematográfica de farol, título "Princípio. Alinhamento. Governo. Obediência.", CTAs |
| 2 | **Sobre** | `AboutSection.tsx` | Apresentação do P.A.G.O. como sistema de reorganização de vida |
| 3 | **Os 4 Pilares** | `PillarsSection.tsx` | Cards com imagens para cada pilar, com descrição e versículo |
| 4 | **Jefferson** | `JeffersonSection.tsx` | Biografia do fundador com citação inspiradora |
| 5 | **Kit Mentoria** | `KitSection.tsx` | Apresentação do kit (Bíblia BKJ, Caderno, Caneta, Ebook) |
| 6 | **Inscrição (CTA)** | `CTASection.tsx` | Formulário com validação, honeypot e consentimento LGPD |
| 7 | **FAQ** | `FAQSection.tsx` | 6 perguntas frequentes com accordion |
| 8 | **Footer** | `Footer.tsx` | Links de navegação, legais e informações de contato |

---

## 10. Variáveis de Ambiente

| Variável | Descrição | Uso |
|----------|-----------|-----|
| `DATABASE_URL` | String de conexão MySQL/TiDB | Server |
| `JWT_SECRET` | Segredo para assinar cookies de sessão | Server |
| `VITE_APP_ID` | ID da aplicação Manus OAuth | Client |
| `OAUTH_SERVER_URL` | URL base do OAuth backend | Server |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login Manus | Client |
| `OWNER_OPEN_ID` | OpenID do proprietário | Server |
| `OWNER_NAME` | Nome do proprietário | Server |
| `BUILT_IN_FORGE_API_URL` | URL da API Forge (LLM, storage, etc.) | Server |
| `BUILT_IN_FORGE_API_KEY` | Bearer token para API Forge | Server |
| `VITE_FRONTEND_FORGE_API_KEY` | Token frontend para APIs Forge | Client |
| `VITE_FRONTEND_FORGE_API_URL` | URL frontend para APIs Forge | Client |

---

## 11. Comandos Úteis

```bash
# Desenvolvimento
pnpm dev                    # Inicia servidor de desenvolvimento
pnpm build                  # Build para produção
pnpm start                  # Inicia servidor de produção

# Banco de Dados
pnpm db:push                # Gera e aplica migrações

# Testes
pnpm test                   # Executa testes vitest

# Formatação
pnpm format                 # Formata código com Prettier
pnpm check                  # Verifica tipos TypeScript
```

---

## 12. Roadmap Futuro

- [ ] Painel Admin (Dashboard) para gerenciar inscrições
- [ ] Integração Stripe para pagamentos
- [ ] Sistema de progressão do mentorado (módulos/etapas)
- [ ] Modelo White-Label para organizações
- [ ] App mobile (PWA)
- [ ] Sistema de notificações por email
- [ ] Analytics e relatórios de engajamento
- [ ] Integração com calendário para agendamento de sessões

---

## 13. Repositório GitHub

- **URL:** `github.com/MARCIOSAGER/pago_platform`
- **Sincronização:** Bidirecional com Manus (checkpoints = commits)
- **Branch principal:** `main`

---

*Documento gerado para facilitar a continuidade do desenvolvimento por qualquer IA ou desenvolvedor. Última atualização: Fevereiro 2026.*
