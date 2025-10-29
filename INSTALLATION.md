# Guia de Instalação - BePost

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js 18+ ([download](https://nodejs.org/))
- PostgreSQL 14+ ([download](https://www.postgresql.org/download/))
- Redis ([download](https://redis.io/download))
- Git

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd bepost
```

### 2. Configurar o Backend

```bash
cd backend
npm install
```

### 3. Configurar o Banco de Dados

Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE bepost;
```

Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure suas variáveis:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bepost?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="sua-chave-secreta-aqui"
# ... outras variáveis
```

### 4. Executar Migrações do Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Iniciar o Backend

```bash
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 6. Configurar o Frontend

Em um novo terminal:

```bash
cd frontend
npm install
```

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Edite o `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 7. Iniciar o Frontend

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 🔐 Configuração do Instagram

Para habilitar a integração com Instagram:

1. Crie um app no [Meta for Developers](https://developers.facebook.com/)
2. Configure Instagram Basic Display
3. Adicione as credenciais no `.env` do backend:

```env
INSTAGRAM_CLIENT_ID="seu-app-id"
INSTAGRAM_CLIENT_SECRET="seu-app-secret"
INSTAGRAM_REDIRECT_URI="http://localhost:3001/api/instagram/callback"
```

## 📧 Configuração de Email

Configure o SMTP no `.env` do backend:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
```

Para Gmail, você precisará criar uma [senha de app](https://support.google.com/accounts/answer/185833).

## 🗄️ Redis (para Jobs)

Certifique-se de que o Redis está rodando:

```bash
redis-server
```

## ✅ Verificar Instalação

1. Acesse `http://localhost:3000` - deve mostrar a página inicial
2. Acesse `http://localhost:3001/health` - deve retornar `{"status":"ok"}`
3. Registre um usuário em `/register`
4. Crie uma organização
5. Conecte uma conta do Instagram (se configurado)

## 🐳 Docker (Opcional)

Se preferir usar Docker:

```bash
# Backend
cd backend
docker-compose up -d

# Frontend
cd frontend
docker build -t bepost-frontend .
docker run -p 3000:3000 bepost-frontend
```

## 🛠️ Comandos Úteis

### Backend

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Prisma Studio (GUI do banco)
npx prisma studio
```

### Frontend

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

## 📝 Estrutura de Pastas

```
bepost/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── middleware/     # Middlewares Express
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços externos
│   │   ├── jobs/           # Jobs agendados (Bull)
│   │   ├── utils/          # Utilitários
│   │   └── index.ts        # Entrada do servidor
│   ├── prisma/
│   │   └── schema.prisma   # Schema do banco de dados
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Rotas Next.js (App Router)
│   │   ├── components/     # Componentes React
│   │   ├── lib/            # Utilitários e configs
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # TypeScript types
│   └── package.json
│
└── README.md
```

## 🐛 Troubleshooting

### Erro de conexão com o banco

- Verifique se o PostgreSQL está rodando: `pg_isready`
- Confirme as credenciais no `DATABASE_URL`

### Erro de conexão com Redis

- Verifique se o Redis está rodando: `redis-cli ping`
- Deve retornar `PONG`

### Erros de migração do Prisma

```bash
# Resetar banco (cuidado: apaga dados)
npx prisma migrate reset

# Forçar migração
npx prisma migrate deploy
```

### Porta já em uso

```bash
# Encontrar processo na porta 3001
lsof -i :3001
# Matar processo
kill -9 <PID>
```

## 📞 Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato: suporte@bepost.com

## 📄 Licença

Proprietary - Todos os direitos reservados
