# 🚀 Guia de Deploy no Vercel - BePost Frontend

## ⚠️ Problemas Comuns e Soluções

### Erro 1: 404 NOT_FOUND
Se você está recebendo erro 404 no Vercel, o problema é que o Root Directory não está configurado.

### Erro 2: No Output Directory named "public" found
Se você está recebendo este erro, o Vercel não está reconhecendo o projeto como Next.js. As soluções abaixo resolvem ambos os problemas.

## 📋 Solução: Configuração Correta do Vercel

### Opção 1: Configurar Root Directory (Recomendado)

1. **Acesse o projeto no Vercel Dashboard**
   - Vá para [vercel.com](https://vercel.com/dashboard)
   - Selecione seu projeto BePost

2. **Configure o Root Directory**
   - Vá em **Settings** → **General**
   - Em **Root Directory**, clique em **Edit**
   - Digite: `frontend`
   - Clique em **Save**

3. **Redeploy**
   - Vá em **Deployments**
   - Clique nos 3 pontos do deployment mais recente
   - Clique em **Redeploy**

### Opção 2: Deploy Diretamente da Pasta Frontend

1. **Via Vercel CLI**
   ```bash
   # Instalar Vercel CLI (se ainda não tem)
   npm i -g vercel

   # Navegar para a pasta frontend
   cd frontend

   # Fazer deploy
   vercel

   # Para produção
   vercel --prod
   ```

2. **Via Dashboard**
   - Clique em **Add New** → **Project**
   - Importe o repositório
   - **Configure as seguintes opções:**
     - **Framework Preset:** Next.js
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `.next`
     - **Install Command:** `npm install`

### Opção 3: Criar Projeto Separado

Se o seu repositório tem backend e frontend juntos:

1. **Via Dashboard**
   - Crie um novo projeto no Vercel
   - Conecte ao mesmo repositório
   - Na configuração:
     - **Root Directory:** `frontend`
     - Deixe o resto automático

## 🔧 Variáveis de Ambiente

Configure as variáveis de ambiente no Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   ```
   NEXT_PUBLIC_API_URL = https://seu-backend-url.com
   ```
3. Clique em **Save**
4. Faça um novo deploy

## ✅ Checklist de Verificação

Antes de fazer deploy, verifique:

- [ ] Arquivo `frontend/package.json` existe e tem os scripts corretos
- [ ] Arquivo `frontend/next.config.js` existe
- [ ] Arquivo `frontend/src/app/layout.tsx` existe
- [ ] Arquivo `frontend/src/app/page.tsx` existe
- [ ] Arquivo `frontend/.eslintrc.json` existe
- [ ] Pasta `frontend/src/app` tem a estrutura correta
- [ ] Root Directory está configurado como `frontend` no Vercel

## 🐛 Troubleshooting

### Erro: "No output directory"
**Solução:** Verifique se o Root Directory está configurado para `frontend`

### Erro: "Build failed"
**Solução:**
1. Verifique os logs de build no Vercel
2. Teste o build localmente:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### Erro: "Module not found"
**Solução:**
1. Delete `node_modules` e `package-lock.json`
2. Rode `npm install` novamente
3. Faça um novo commit e push

### Erro: "Cannot find module 'next'"
**Solução:**
1. Verifique se o `package.json` tem `next` nas dependências
2. Force a reinstalação no Vercel:
   - Settings → General → Clear Build Cache
   - Redeploy

## 📱 Estrutura Esperada do Projeto

```
bepost/
├── backend/              # Não é usado pelo Vercel
├── frontend/             # ← ROOT DIRECTORY DO VERCEL
│   ├── src/
│   │   └── app/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── globals.css
│   ├── public/
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
├── vercel.json           # Opcional
└── README.md
```

## 🎯 Comando Rápido de Deploy

Se você tem o Vercel CLI instalado:

```bash
# Na raiz do projeto
cd frontend
vercel --prod
```

## 📞 Ainda com Problemas?

Se ainda estiver com erro 404:

1. **Verifique os logs de build:**
   - Vercel Dashboard → Seu Projeto → Deployments → Clique no deployment → View Function Logs

2. **Teste localmente primeiro:**
   ```bash
   cd frontend
   npm run build
   npm start
   # Acesse http://localhost:3000
   ```

3. **Verifique se todos os arquivos foram commitados:**
   ```bash
   git status
   git add frontend/
   git commit -m "fix: adicionar configurações do Vercel"
   git push
   ```

## 🔗 Recursos Úteis

- [Vercel Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
- [Next.js Documentation](https://nextjs.org/docs)

## 💡 Dica Pro

Para monorepos, é melhor ter dois projetos no Vercel:
- **bepost-frontend** → apontando para `/frontend`
- **bepost-backend** → apontando para `/backend` (deploy em Railway/Render)

Isso dá mais controle e clareza no deploy.
