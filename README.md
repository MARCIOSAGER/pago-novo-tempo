# P.A.G.O. — Novo Tempo

> Sistema de Reorganização de Vida | Mentoria fundamentada em princípios bíblicos

---

## Sobre o Projeto

**P.A.G.O.** é uma plataforma de mentoria criada por **Jefferson Evangelista** que oferece um sistema estruturado de reorganização de vida baseado em quatro pilares fundamentais:

| Pilar | Significado |
|-------|-------------|
| **P** | Princípios acima de Resultados |
| **A** | Alinhamento gera Autoridade |
| **G** | Governo inicia no Secreto |
| **O** | Obediência sustenta o Invisível |

Uma resposta para pessoas que amam a Deus, mas vivem desorganizadas. Um caminho para estruturar a vida espiritual, emocional e prática.

---

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Animações | Framer Motion |
| Backend | Express 4 + tRPC 11 |
| Banco de Dados | MySQL/TiDB via Drizzle ORM |
| Armazenamento | AWS S3 |
| Autenticação | Manus OAuth + JWT |
| IA (Chatbot) | GPT-4o via Forge API |
| Build | Vite 7 + esbuild |
| Testes | Vitest |

---

## Início Rápido

### Pré-requisitos

- Node.js 22+
- pnpm 10+

### Instalação

```bash
git clone https://github.com/MARCIOSAGER/pago_platform.git
cd pago_platform
pnpm install
```

### Desenvolvimento

```bash
pnpm dev          # Inicia servidor de desenvolvimento
```

### Build para Produção

```bash
pnpm build        # Compila frontend e backend
pnpm start        # Inicia servidor de produção
```

### Banco de Dados

```bash
pnpm db:push      # Gera e aplica migrações
```

### Testes

```bash
pnpm test         # Executa testes vitest
```

---

## Funcionalidades

### Landing Page

- Hero cinematográfico com imagem de farol ao pôr do sol
- Apresentação dos 4 pilares com imagens geradas por IA
- Seção sobre o fundador Jefferson Evangelista
- Kit de mentoria (Bíblia BKJ, Caderno, Caneta, Ebook)
- Formulário de inscrição com validação e proteção anti-bot
- FAQ com 6 perguntas frequentes
- Footer com links de navegação e legais

### Chatbot IA

- Assistente flutuante alimentado por GPT-4o
- Especializado no contexto P.A.G.O. e metodologia
- Perguntas sugeridas para primeira interação
- Respostas em português brasileiro

### Conformidade Legal (LGPD)

- Política de Privacidade (`/privacidade`)
- Termos de Uso (`/termos`)
- Política de Cookies (`/cookies`)
- Banner de consentimento de cookies
- Checkbox de consentimento LGPD no formulário

### Segurança (12 camadas)

1. HTTP Security Headers (Helmet.js)
2. Rate Limiting (geral, sensível, auth)
3. HTTP Parameter Pollution Protection
4. Input Sanitization (XSS)
5. Input Validation (Zod)
6. SQL Injection Prevention (Drizzle ORM)
7. File Upload Validation
8. Path Traversal Protection
9. Request Size Limiting
10. Security Audit Logger
11. Honeypot Anti-Bot
12. CORS Restritivo

### API (tRPC)

- Inscrição para mentoria (público)
- Chat com IA (público)
- Upload de arquivos para S3 (autenticado)
- Gerenciamento de inscrições (admin)
- Gerenciamento de arquivos (admin)

---

## Estrutura do Projeto

```
pago_platform/
├── client/src/
│   ├── components/     # Componentes React (Navbar, Hero, Pilares, etc.)
│   ├── pages/          # Páginas (Home, Privacidade, Termos, Cookies)
│   ├── App.tsx          # Rotas e layout
│   └── index.css        # Tema global (cores, fontes)
├── server/
│   ├── routers.ts       # Rotas tRPC
│   ├── db.ts            # Query helpers
│   ├── security.ts      # Middleware de segurança
│   └── storage.ts       # Helpers S3
├── drizzle/
│   └── schema.ts        # Schema do banco de dados
├── docs/
│   ├── ebook-pago-metodologia.md
│   └── recomendacoes-tecnicas-plataforma.md
├── CONTEXT.md           # Contexto completo para IA/devs
└── README.md            # Este arquivo
```

---

## Documentação

Para informações detalhadas sobre arquitetura, segurança, banco de dados, API e identidade visual, consulte o arquivo [CONTEXT.md](./CONTEXT.md).

---

## Licença

Projeto proprietário. Todos os direitos reservados a Jefferson Evangelista e Interaja.

---

## Contato

Para dúvidas sobre o projeto ou a mentoria P.A.G.O., utilize o formulário de inscrição no site ou entre em contato através dos canais oficiais.

---

*Desenvolvido com propósito. Estruturado para permanecer.*
