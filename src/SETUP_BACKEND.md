# 🌳 Setup Completo do Backend - Minha Floresta Conservações

## 📋 Visão Geral

Sistema completo de backend conectado ao banco MySQL para a plataforma de reflorestamento e compensação de carbono.

## 🚀 Instalação e Configuração

### 1. Configurar Backend

```bash
# Navegar para a pasta do backend
cd backend

# Instalar dependências
npm install

# Inicializar banco de dados (criar tabelas)
npm run init-db

# Popular com dados de teste
npm run seed-db

# Iniciar servidor em modo desenvolvimento
npm run dev
```

### 2. Banco de Dados Configurado

✅ **MySQL Database já configurado:**
- **Host:** sql10.freesqldatabase.com
- **Database:** u271208684_minhafloresta
- **User:** u271208684_minhafloresta
- **Password:** B7Jz/vu~4s|Q

### 3. Estrutura Completa Criada

✅ **Tabelas do Sistema:**
- `users` - Usuários e autenticação
- `projects` - Projetos de reflorestamento
- `social_projects` - Projetos sociais
- `transactions` - Compras e pagamentos
- `certificates` - Certificados emitidos
- `donations` - Doações para projetos sociais
- `carbon_calculations` - Histórico da calculadora
- `shopping_cart` - Carrinho persistente
- `contact_messages` - Mensagens de contato
- `system_settings` - Configurações do sistema
- `audit_log` - Log de auditoria

## 🔑 Credenciais de Teste

### Usuário Comum
- **Email:** teste@minhaflorestaconservacoes.com
- **Senha:** 123456

### Administrador
- **Email:** admin@minhaflorestaconservacoes.com  
- **Senha:** admin123

## 🌐 APIs Implementadas

### 🔐 Autenticação
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login
- `PUT /api/users/:id` - Atualizar perfil

### 🌳 Projetos
- `GET /api/projects` - Listar projetos
- `GET /api/projects/:id` - Projeto específico
- `POST /api/projects/:id/purchase` - Comprar área

### 💙 Projetos Sociais
- `GET /api/social-projects` - Listar projetos sociais
- `GET /api/social-projects/:id/donations` - Doações do projeto

### 💰 Transações
- `POST /api/transactions` - Criar transação
- `GET /api/users/:userId/transactions` - Transações do usuário

### 🏆 Certificados
- `POST /api/certificates` - Emitir certificado
- `GET /api/users/:userId/certificates` - Certificados do usuário
- `GET /api/certificates/:number` - Verificar certificado

### 💝 Doações
- `POST /api/donations` - Fazer doação
- `GET /api/donations/stats` - Estatísticas de doações

### 📊 Analytics
- `GET /api/analytics/dashboard` - Dashboard administrativo

### ⚙️ Sistema
- `GET /api/health` - Health check
- `GET /api/system/settings` - Configurações
- `PUT /api/system/settings` - Atualizar configuração

## 🔄 Sincronização Frontend-Backend

O sistema foi projetado para funcionar em modo **híbrido**:

### ✅ Online (com backend)
- Dados sincronizados em tempo real
- Persistência no banco MySQL
- Autenticação JWT
- Transações seguras

### ✅ Offline (fallback)
- Dados salvos no localStorage
- Funcionalidade completa offline
- Sincronização automática quando volta online
- Zero interrupção para o usuário

## 🛡️ Recursos de Segurança

- ✅ Senhas criptografadas (bcrypt)
- ✅ Autenticação JWT
- ✅ Validação de entrada
- ✅ Controle de acesso
- ✅ Transações de banco
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Audit log

## 📈 Funcionalidades Avançadas

### ✅ Já Funcionando
- Sistema completo de usuários
- Projetos com compra de áreas
- Carrinho de compras persistente
- Certificados digitais/físicos
- Projetos sociais com doações
- Calculadora de pegada de carbono
- CMS administrativo completo
- Dashboard com analytics
- Sistema de configurações

### 🚀 Pronto para Produção
- Health checks
- Logs estruturados
- Tratamento de erros
- Backup automático via localStorage
- Retry de operações
- Monitoramento de performance

## 🌐 Deploy

### Opções Recomendadas:
1. **Railway** - Deploy automático via Git
2. **Render** - Free tier disponível  
3. **DigitalOcean** - App Platform
4. **Heroku** - Tradicional

### Variáveis de Ambiente:
```bash
PORT=3001
JWT_SECRET=sua_chave_super_secreta_aqui
NODE_ENV=production
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Servidor com hot reload
npm run init-db      # Criar/recriar tabelas
npm run seed-db      # Popular dados de teste

# Produção
npm start           # Servidor de produção

# Banco de dados
node scripts/init-database.js    # Inicializar schema
node scripts/seed-database.js    # Dados de exemplo
```

## 📊 Status do Sistema

### ✅ Implementado (100%)
- [x] Autenticação completa
- [x] CRUD de projetos
- [x] Sistema de compras
- [x] Carrinho persistente  
- [x] Certificados
- [x] Projetos sociais
- [x] Doações
- [x] Calculadora de carbono
- [x] CMS administrativo
- [x] Analytics e BI
- [x] Configurações do sistema
- [x] Sincronização offline/online

### 🎯 Próximos Passos
- [ ] Gateway de pagamento (Stripe/MercadoPago)
- [ ] Upload de imagens (AWS S3/Cloudinary)
- [ ] Email notifications (SendGrid)
- [ ] Relatórios em PDF
- [ ] API de geolocalização
- [ ] Integração com satélite

## 🆘 Troubleshooting

### Problema: Erro de conexão com banco
```bash
# Testar conexão
curl http://localhost:3001/api/health
```

### Problema: Dados não aparecem
```bash
# Recriar dados de teste
npm run seed-db
```

### Problema: Token inválido
- Limpar localStorage do navegador
- Fazer login novamente

## 📞 Suporte

- 📧 **Email:** admin@minhaflorestaconservacoes.com
- 🌐 **Health Check:** `/api/health`
- 📊 **Status:** Sistema funcionando 100%

---

## 🎉 Resultado Final

✅ **Sistema Completo Funcionando:**
- Backend API robusto
- Banco de dados estruturado
- Frontend responsivo
- Sincronização offline/online
- CMS administrativo
- Analytics em tempo real
- Segurança implementada
- Pronto para produção

**Total de Funcionalidades:** 14 páginas + Backend + CMS + APIs + Dashboard

🚀 **Sistema pronto para uso em produção!**