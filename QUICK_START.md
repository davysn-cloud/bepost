# ⚡ Quick Start - Deploy BePost no Vercel

## 🚨 Está com erro? Vá direto para [VERCEL_FIX.md](./VERCEL_FIX.md)

## ✅ Deploy Rápido (3 minutos)

### 1. Prepare o Repositório

Certifique-se de que você fez commit e push de tudo:

```bash
git add .
git commit -m "Preparar para deploy"
git push
```

### 2. Configure no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New..."** → **"Project"**
3. Importe seu repositório **bepost**
4. **Configure EXATAMENTE assim:**

   **Framework Preset:** `Next.js` ← OBRIGATÓRIO
   **Root Directory:** `frontend` ← OBRIGATÓRIO
   **Build Command:** (deixe vazio)
   **Output Directory:** (deixe vazio)
   **Install Command:** (deixe vazio)

5. Clique em **"Deploy"**

### 3. Aguarde (2-3 minutos)

O Vercel vai:
- ✓ Clonar o repositório
- ✓ Instalar dependências
- ✓ Fazer build do Next.js
- ✓ Deploy automático

### 4. Pronto! 🎉

Você receberá uma URL: `https://bepost-xxxxx.vercel.app`

---

## ⚙️ Configurações Opcionais

### Adicionar Variável de Ambiente (Backend)

Se você já fez deploy do backend:

1. No Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://seu-backend.railway.app`
3. Salve e faça um Redeploy

### Custom Domain

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

---

## 🐛 Problemas?

### Erro 404 ou "No Output Directory"

Veja o guia completo: **[VERCEL_FIX.md](./VERCEL_FIX.md)**

Esse guia tem a solução passo-a-passo com 100% de garantia.

### Build Falhou

```bash
# Teste localmente primeiro
cd frontend
npm install
npm run build
```

Se funcionar localmente, o problema é na configuração do Vercel.

---

## 📚 Documentação Completa

- **[README.md](./README.md)** - Visão geral do projeto
- **[INSTALLATION.md](./INSTALLATION.md)** - Instalação local
- **[VERCEL_FIX.md](./VERCEL_FIX.md)** - Solução para erros do Vercel
- **[FEATURES.md](./FEATURES.md)** - Funcionalidades implementadas

---

## 🎯 Checklist Pré-Deploy

- [ ] Código commitado e no repositório
- [ ] Pasta `frontend/public/` existe
- [ ] Arquivo `frontend/package.json` tem `next` nas dependências
- [ ] Arquivos `layout.tsx` e `page.tsx` existem em `src/app/`
- [ ] Framework Preset configurado como **Next.js**
- [ ] Root Directory configurado como **frontend**

Se todos os itens estão ✅, o deploy vai funcionar!

---

## 💡 Dica Pro

Para monorepos (backend + frontend):

- **Frontend:** Deploy no Vercel
- **Backend:** Deploy no Railway ou Render
- **Banco:** Supabase ou Railway PostgreSQL
- **Redis:** Upstash Redis

Isso dá a melhor performance e separação de preocupações.

---

## 🚀 Deploy do Backend

O frontend vai precisar se conectar ao backend. Opções:

### Railway (Recomendado)

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy backend
cd backend
railway up
```

### Render

1. Acesse [render.com](https://render.com)
2. Crie um **Web Service**
3. Conecte ao repositório
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
5. Adicione variáveis de ambiente do `.env.example`

---

## ✅ Tudo Funcionando?

Acesse seu app: `https://seu-app.vercel.app`

Você deve ver a página inicial do BePost! 🎉

Para acessar o dashboard:
1. Registre-se em `/register`
2. Faça login
3. Crie sua primeira organização

---

**Problemas?** Consulte [VERCEL_FIX.md](./VERCEL_FIX.md) para solução completa.
