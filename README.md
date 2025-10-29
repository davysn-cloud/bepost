# BePost - Instagram Content Management SaaS

Uma plataforma completa de colaboração e aprovação de conteúdo para Social Media Managers e agências.

## 🚀 Visão Geral

BePost é uma solução SaaS que centraliza todo o ciclo de vida de posts do Instagram - desde o rascunho inicial até a aprovação final do cliente e o agendamento automático.

### Principais Funcionalidades

- 📊 **Calendário de Conteúdo**: Visualização clara de todos os posts agendados
- 👥 **Gestão de Organizações**: Gerencie múltiplos clientes em um só lugar
- ✅ **Sistema de Aprovação**: Fluxo de trabalho com status personalizáveis
- 💬 **Comentários Visuais**: Comente diretamente nas imagens com coordenadas X,Y
- 🔗 **Aprovação Externa**: Páginas de aprovação sem login para clientes
- 📧 **Notificações Inteligentes**: Alertas por email em mudanças de status
- ⏰ **Agendamento Automático**: Publicação automática no Instagram
- 🔐 **OAuth Instagram**: Integração segura com contas do Instagram

## 🏗️ Arquitetura

```
bepost/
├── backend/          # API Node.js + Express + Prisma
├── frontend/         # Next.js 14+ App Router
└── shared/           # Tipos e utilitários compartilhados
```

## 🛠️ Stack Tecnológica

### Backend
- **Runtime**: Node.js 18+ com TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Queue**: Bull (Redis)
- **Storage**: AWS S3 / Local (desenvolvimento)
- **Auth**: JWT + OAuth 2.0 (Instagram)
- **Email**: Nodemailer

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18+ com TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Calendar**: React Big Calendar

## 📋 Requisitos Funcionais

### RF01-RF03: Gestão de Organizações e Usuários
- Criar e gerenciar organizações (clientes)
- Sistema de convites com papéis (Admin, Equipe, Cliente/Aprovador)
- Integração OAuth com Instagram

### RF04-RF06: Calendário e Posts
- Visualização em calendário
- Criação de cards de post com mídia
- Sistema de status gerenciável

### RF07-RF09: Colaboração
- Comentários em texto e coordenadas visuais
- Página de aprovação externa com link único
- Ações de aprovação sem login

### RF10-RF12: Automação
- Aprovação automática muda status para "Agendado"
- Notificações por email
- Publicação automática no Instagram

## 🚦 Como Começar

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (para jobs)
- Conta Meta Developer (para Instagram API)

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd bepost
```

2. Configure o Backend:
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npx prisma migrate dev
npm run dev
```

3. Configure o Frontend:
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure as variáveis de ambiente
npm run dev
```

### Variáveis de Ambiente

#### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/bepost"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
INSTAGRAM_CLIENT_ID="your-instagram-app-id"
INSTAGRAM_CLIENT_SECRET="your-instagram-app-secret"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_BUCKET_NAME="bepost-uploads"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-email-password"
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 📚 Documentação da API

Após iniciar o backend, acesse:
- API Docs: http://localhost:3001/api/docs
- Health Check: http://localhost:3001/health

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🚀 Deploy

### Backend (Railway/Render/Fly.io)
```bash
cd backend
npm run build
npm start
```

### Frontend (Vercel)
```bash
cd frontend
npm run build
```

## 📝 Licença

Proprietary - Todos os direitos reservados

## 👥 Equipe

Desenvolvido por [Sua Agência/Nome]

## 📞 Suporte

Para suporte, envie email para: suporte@bepost.com
