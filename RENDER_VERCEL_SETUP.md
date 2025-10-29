# 🎨 Guia Completo: Deploy Backend no Render + Frontend no Vercel

## 📋 PARTE 1: Configurar Backend no Render

### Passo 1: Criar PostgreSQL Database

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** (canto superior direito)
3. Selecione **"PostgreSQL"**
4. Configure:
   ```
   Name:        bepost-db
   Database:    bepost
   User:        bepost
   Region:      Oregon (ou o mais próximo de você)
   Plan:        Free
   ```
5. Clique em **"Create Database"**
6. **AGUARDE** 2-3 minutos até o status ficar **"Available"** (verde)

### Passo 2: Copiar URL do Banco de Dados

1. Clique no banco **bepost-db** que acabou de criar
2. Na página do banco, role até **"Connections"**
3. Você verá duas URLs:
   - **External Database URL** (começa com `postgres://`)
   - **Internal Database URL** (começa com `postgres://`)

4. **COPIE** a **"Internal Database URL"** (é mais rápida)
   ```
   Exemplo:
   postgres://bepost:abc123@dpg-xxxxx-a.oregon-postgres.render.com/bepost
   ```

5. **MANTENHA** esta aba aberta ou salve a URL em um bloco de notas

---

### Passo 3: Criar Web Service (Backend)

1. Volte para o dashboard: [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte ao GitHub:
   - Clique em **"Connect a repository"**
   - Se ainda não conectou o GitHub, autorize
   - Encontre e selecione o repositório **bepost**
   - Clique em **"Connect"**

4. Configure o serviço:
   ```
   Name:              bepost-backend
   Region:            Oregon (mesmo do banco)
   Branch:            claude/saas-instagram-content-approval-011CUc4kfSvotJjVauv7aLVw
   Root Directory:    backend
   Runtime:           Node
   Build Command:     npm install && npx prisma generate && npm run build
   Start Command:     npm start
   Plan:              Free
   ```

5. **NÃO CLIQUE** em "Create Web Service" ainda!

---

### Passo 4: Adicionar Variáveis de Ambiente (IMPORTANTE!)

**ANTES** de criar o serviço, role para baixo até a seção **"Environment Variables"**

Clique em **"Add Environment Variable"** e adicione cada variável abaixo:

#### Variável 1: DATABASE_URL
```
Key:    DATABASE_URL
Value:  [Cole aqui a Internal Database URL do Passo 2]
```
**Exemplo:**
```
postgres://bepost:abc123@dpg-xxxxx-a.oregon-postgres.render.com/bepost
```

#### Variável 2: JWT_SECRET
```
Key:    JWT_SECRET
Value:  mude-isso-para-um-valor-super-secreto-e-aleatorio-123456789
```
**Dica:** Use um gerador online ou crie uma string aleatória longa

#### Variável 3: NODE_ENV
```
Key:    NODE_ENV
Value:  production
```

#### Variável 4: PORT (OPCIONAL)
```
Key:    PORT
Value:  3001
```
**Nota:** O Render define o PORT automaticamente, mas não faz mal adicionar

#### Variável 5: JWT_EXPIRES_IN
```
Key:    JWT_EXPIRES_IN
Value:  7d
```

#### Variável 6: FRONTEND_URL
```
Key:    FRONTEND_URL
Value:  https://seu-app.vercel.app
```
**Substitua** `seu-app.vercel.app` pela URL real do seu frontend no Vercel

#### Variável 7: API_URL (para o próprio backend se conhecer)
```
Key:    API_URL
Value:  https://bepost-backend.onrender.com
```
**Nota:** Ainda não temos a URL, mas você vai atualizar depois

---

### Passo 5: Criar o Web Service

Agora sim, clique em **"Create Web Service"**

**AGUARDE** 5-10 minutos. Você verá:
```
==> Building...
==> Installing dependencies...
==> Generating Prisma Client...
==> Building TypeScript...
==> Build successful!
==> Starting server...
==> Your service is live at https://bepost-backend.onrender.com
```

---

### Passo 6: Executar Migrações do Prisma

Após o deploy completar:

1. No dashboard do Render, clique no seu serviço **bepost-backend**
2. No menu lateral, clique em **"Shell"**
3. Digite o seguinte comando e pressione Enter:
   ```bash
   npx prisma migrate deploy
   ```
4. Aguarde a mensagem:
   ```
   ✔ All migrations have been successfully applied
   ```

**IMPORTANTE:** Se não executar as migrações, o backend não funcionará!

---

### Passo 7: Obter URL do Backend

1. No dashboard do serviço **bepost-backend**
2. No topo da página, você verá a URL:
   ```
   https://bepost-backend.onrender.com
   ```
3. **COPIE** esta URL

4. **ATUALIZE** a variável `API_URL`:
   - No menu lateral, clique em **"Environment"**
   - Encontre a variável `API_URL`
   - Clique no ícone de **editar (lápis)**
   - Cole a URL: `https://bepost-backend.onrender.com`
   - Clique em **"Save Changes"**

---

### Passo 8: Testar o Backend

Abra o navegador e acesse:
```
https://bepost-backend.onrender.com/health
```

Você deve ver:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123
}
```

✅ **Se viu isso, seu backend está funcionando!**

---

## 📋 PARTE 2: Conectar Frontend (Vercel) ao Backend (Render)

### Passo 1: Adicionar Variável de Ambiente no Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique no seu projeto **BePost** (ou nome que deu)
3. Clique em **"Settings"** (menu superior)
4. No menu lateral, clique em **"Environment Variables"**

### Passo 2: Adicionar a Variável

1. Em **"Key"**, digite:
   ```
   NEXT_PUBLIC_API_URL
   ```

2. Em **"Value"**, cole a URL do backend:
   ```
   https://bepost-backend.onrender.com
   ```

3. Em **"Environment"**, selecione:
   - ☑ Production
   - ☑ Preview
   - ☑ Development

4. Clique em **"Save"**

### Passo 3: Redeploy do Frontend

1. Vá em **"Deployments"** (menu superior)
2. Encontre o deployment mais recente
3. Clique nos **3 pontos (⋮)** à direita
4. Clique em **"Redeploy"**
5. Clique em **"Redeploy"** novamente para confirmar

**AGUARDE** 2-3 minutos até o deploy completar

---

## 🧪 PARTE 3: Testar Tudo Funcionando

### Teste 1: Backend está online?
```
https://bepost-backend.onrender.com/health
```
✅ Deve retornar JSON com status "ok"

### Teste 2: Frontend carregou?
```
https://seu-app.vercel.app
```
✅ Deve mostrar a página inicial

### Teste 3: O aviso amarelo sumiu?
```
https://seu-app.vercel.app
```
✅ NÃO deve mostrar o aviso "Backend não configurado"

### Teste 4: Cadastro funciona?
```
https://seu-app.vercel.app/register
```
1. Preencha o formulário:
   - Nome: Seu Nome
   - Email: seu@email.com
   - Senha: 123456
   - Confirmar: 123456
2. Clique em **"Criar conta"**
3. ✅ Deve redirecionar para `/dashboard`
4. ✅ Deve mostrar "Bem-vindo ao BePost!"
5. ✅ Deve mostrar seus dados

### Teste 5: Logout e Login
1. No dashboard, clique em **"Sair"**
2. Volte para `/login`
3. Entre com as mesmas credenciais
4. ✅ Deve entrar no dashboard novamente

---

## 📊 Resumo das Variáveis

### No Render (Backend):
```
DATABASE_URL        = postgres://bepost:xxx@dpg-xxx.oregon-postgres.render.com/bepost
JWT_SECRET          = seu-secret-key-super-aleatorio-aqui
NODE_ENV            = production
PORT                = 3001
JWT_EXPIRES_IN      = 7d
FRONTEND_URL        = https://seu-app.vercel.app
API_URL             = https://bepost-backend.onrender.com
```

### No Vercel (Frontend):
```
NEXT_PUBLIC_API_URL = https://bepost-backend.onrender.com
```

---

## ⚠️ Problemas Comuns

### Erro: "Cannot connect to database"
**Solução:**
- Verifique se o DATABASE_URL está correto
- Use a **Internal Database URL**, não a External
- Executou `npx prisma migrate deploy`?

### Erro: "Service Unavailable"
**Solução:**
- O Render free tier hiberna após 15 minutos
- Aguarde 30 segundos na primeira requisição
- O serviço vai "acordar" automaticamente

### Erro: "CORS Error" no frontend
**Solução:**
- Adicione `FRONTEND_URL` no Render
- Valor: `https://seu-app.vercel.app` (sem / no final)
- Redeploy o backend

### Aviso amarelo ainda aparece
**Solução:**
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se `NEXT_PUBLIC_API_URL` está no Vercel
- Redeploy do frontend foi feito?

---

## 🎉 Sucesso!

Se todos os testes passaram, você tem:

✅ Backend rodando no Render
✅ Banco de dados PostgreSQL ativo
✅ Frontend rodando no Vercel
✅ Comunicação backend ↔ frontend funcionando
✅ Cadastro e login funcionais
✅ Sistema completo no ar!

---

## 📞 Próximos Passos

Agora que está tudo funcionando:

1. **Teste criar uma organização** (quando implementar)
2. **Teste criar posts** (quando implementar)
3. **Configure Instagram OAuth** (opcional)
4. **Configure Email SMTP** (opcional)
5. **Adicione Redis** (para jobs de agendamento)

---

## 💰 Custos

**Total: $0/mês** 🎉

- Render Free: 750 horas/mês
- Vercel: Ilimitado grátis
- PostgreSQL: 1GB grátis no Render

**Limitações do Free Tier:**
- Render hiberna após 15min sem uso
- Primeira requisição pode demorar 30s
- Limite de 1GB no banco

**Upgrade recomendado quando:**
- Tiver +10 usuários ativos
- Precisar de uptime 24/7
- Banco passar de 1GB

---

## 🔒 Segurança

Não se esqueça de:

1. **Mudar o JWT_SECRET** para algo mais seguro
2. **Configurar CORS** corretamente no backend
3. **Não commitar** o `.env` no git
4. **Usar HTTPS** sempre (Render e Vercel já fazem isso)

---

**Tudo claro?** Se tiver qualquer dúvida em algum passo, me avise! 🚀
