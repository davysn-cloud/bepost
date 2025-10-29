# 🚀 Deploy do Backend - Guia Completo

## ⚠️ Erro: Connection Refused

Se você está vendo este erro no frontend:
```
localhost:3001/api/auth/register: Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**Isso é normal!** O backend ainda não foi deployado. Siga este guia para fazer o deploy.

---

## 🎯 Opções de Deploy

Escolha uma das opções abaixo (Railway é a mais fácil):

1. **Railway** - Grátis, fácil, recomendado ⭐
2. **Render** - Grátis, bom para começar
3. **Fly.io** - Mais configuração, mais controle

---

## 🚂 OPÇÃO 1: Railway (Recomendado)

### Passo 1: Criar Conta

1. Acesse: [railway.app](https://railway.app)
2. Clique em **"Start a New Project"**
3. Faça login com GitHub

### Passo 2: Deploy do PostgreSQL

1. No dashboard, clique em **"New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. O Railway criará o banco automaticamente
4. Clique no serviço PostgreSQL
5. Vá na aba **"Variables"**
6. Copie a variável `DATABASE_URL`

### Passo 3: Deploy do Backend

1. Clique em **"New"** → **"GitHub Repo"**
2. Selecione o repositório **bepost**
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`

### Passo 4: Configurar Variáveis de Ambiente

Na aba **"Variables"** do serviço backend, adicione:

```bash
# Database (copiar do PostgreSQL criado)
DATABASE_URL=<cole-aqui-a-url-do-postgres>

# Redis (opcional - pode usar Upstash)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=seu-super-secret-jwt-key-mude-isso-em-producao
JWT_EXPIRES_IN=7d

# Instagram OAuth (opcional por enquanto)
INSTAGRAM_CLIENT_ID=seu-instagram-app-id
INSTAGRAM_CLIENT_SECRET=seu-instagram-app-secret
INSTAGRAM_REDIRECT_URI=https://seu-backend.railway.app/api/auth/instagram/callback

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# App Config
PORT=3001
NODE_ENV=production
API_URL=https://seu-backend.railway.app
FRONTEND_URL=https://seu-frontend.vercel.app
```

### Passo 5: Deploy das Migrações

1. Instale Railway CLI:
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. Link ao projeto:
   ```bash
   cd backend
   railway link
   ```

3. Execute as migrações:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Passo 6: Obter URL do Backend

1. No Railway, clique no serviço backend
2. Vá em **"Settings"** → **"Networking"**
3. Clique em **"Generate Domain"**
4. Copie a URL gerada: `https://bepost-backend-production.up.railway.app`

### Passo 7: Configurar Frontend no Vercel

1. Vá em [vercel.com/dashboard](https://vercel.com/dashboard)
2. Abra seu projeto **BePost**
3. **Settings** → **"Environment Variables"**
4. Adicione:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://seu-backend.railway.app` (a URL do passo 6)
5. Clique em **"Save"**
6. Vá em **"Deployments"** → **"Redeploy"**

### ✅ Pronto!

Aguarde 2-3 minutos e teste:
- Frontend: `https://seu-app.vercel.app/register`
- Backend: `https://seu-backend.railway.app/health`

---

## 🎨 OPÇÃO 2: Render

### Passo 1: Criar Banco de Dados

1. Acesse: [render.com](https://render.com)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `bepost-db`
   - **Plan:** Free
4. Crie e copie a **"Internal Database URL"**

### Passo 2: Criar Web Service

1. Clique em **"New +"** → **"Web Service"**
2. Conecte ao repositório GitHub **bepost**
3. Configure:
   ```
   Name:              bepost-backend
   Region:            Escolha o mais próximo
   Branch:            seu-branch
   Root Directory:    backend
   Runtime:           Node
   Build Command:     npm install && npx prisma generate && npm run build
   Start Command:     npm start
   Plan:              Free
   ```

### Passo 3: Variáveis de Ambiente

Em **"Environment"**, adicione:

```bash
DATABASE_URL=<cole-a-url-do-postgres>
JWT_SECRET=seu-secret-key-aqui
NODE_ENV=production
PORT=3001
```

### Passo 4: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (5-10 minutos)
3. Após deploy, vá em **"Shell"** e execute:
   ```bash
   npx prisma migrate deploy
   ```

### Passo 5: Obter URL

No dashboard do serviço, copie a URL:
```
https://bepost-backend.onrender.com
```

### Passo 6: Configurar Vercel

Mesmos passos do Railway (Passo 7).

---

## ✈️ OPÇÃO 3: Fly.io

### Passo 1: Instalar Flyctl

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Passo 2: Login

```bash
flyctl auth login
```

### Passo 3: Criar App

```bash
cd backend
flyctl launch

# Responda:
# ? App name: bepost-backend
# ? Choose region: escolha o mais próximo
# ? Would you like to set up a Postgresql database? Yes
# ? Select configuration: Development
```

### Passo 4: Configurar Secrets

```bash
flyctl secrets set \
  JWT_SECRET="seu-secret" \
  NODE_ENV="production"
```

### Passo 5: Deploy

```bash
flyctl deploy
```

### Passo 6: Executar Migrações

```bash
flyctl ssh console
npx prisma migrate deploy
exit
```

### Passo 7: Obter URL

```bash
flyctl status
```

Copie a URL: `https://bepost-backend.fly.dev`

---

## 🧪 Testar Backend

Após deploy, teste se está funcionando:

```bash
# Health check
curl https://seu-backend.railway.app/health

# Deve retornar:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123
}
```

---

## 🔧 Troubleshooting

### Erro: "No Output Directory"
- Certifique-se que o `Root Directory` está configurado como `backend`

### Erro: "Cannot find module 'prisma'"
- Adicione ao Build Command: `npm install && npx prisma generate && npm run build`

### Erro: Database connection
- Verifique se o `DATABASE_URL` está correto
- Execute as migrações: `npx prisma migrate deploy`

### Erro: Port already in use
- No Railway/Render, use a variável `PORT` fornecida por eles
- Ou remova a configuração de porta do código

---

## 📊 Custos Estimados

| Plataforma | Free Tier | Limites |
|------------|-----------|---------|
| **Railway** | $5 crédito/mês | 500h + 1GB RAM |
| **Render** | Grátis | 750h/mês, sleep após 15min |
| **Fly.io** | Grátis | 3 VMs pequenas |

**Recomendação:** Railway para começar (mais fácil e estável).

---

## 🎯 Checklist Final

Após deploy, verifique:

- [ ] Backend respondendo: `https://seu-backend.com/health`
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada no Vercel
- [ ] Frontend redeploy feito no Vercel
- [ ] Cadastro funcionando: `https://seu-app.vercel.app/register`
- [ ] Login funcionando: `https://seu-app.vercel.app/login`

---

## 🚀 Deploy Rápido (Railway CLI)

Se você tem pressa:

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto novo
cd backend
railway init

# 4. Adicionar PostgreSQL
railway add

# 5. Deploy
railway up

# 6. Executar migrações
railway run npx prisma migrate deploy

# 7. Obter URL
railway domain

# 8. Configurar no Vercel
# Settings → Environment Variables → NEXT_PUBLIC_API_URL
```

---

## 💡 Dicas

1. **Use Railway para desenvolvimento** - Mais fácil e rápido
2. **Use Render para produção inicial** - Mais estável para long-term
3. **Configure Redis** - Necessário para jobs de agendamento
4. **Configure Email** - Para notificações funcionarem
5. **Monitore os logs** - Use `railway logs` ou dashboard

---

## 🆘 Precisa de Ajuda?

Se algo não funcionar:

1. Verifique os logs do deploy
2. Teste o health check do backend
3. Verifique se todas as variáveis estão configuradas
4. Certifique-se que as migrações foram executadas

---

**Próximo Passo:** Escolha Railway (mais fácil) e siga o guia. Em 10 minutos seu backend estará no ar! 🚀
