# Minha Floresta Conservações - Backend API

Backend completo para a plataforma de reflorestamento e compensação de carbono.

## 🚀 Configuração Rápida

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados
O sistema está configurado para usar o banco MySQL fornecido:
- **Host:** sql10.freesqldatabase.com
- **Usuário:** u271208684_minhafloresta
- **Senha:** B7Jz/vu~4s|Q
- **Database:** u271208684_minhafloresta

### 3. Inicializar Banco de Dados
```bash
# Criar todas as tabelas
npm run init-db

# Inserir dados de teste
npm run seed-db
```

### 4. Iniciar Servidor
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

O servidor estará disponível em: `http://localhost:3001`

## 🔑 Credenciais de Teste

### Usuário Comum
- **Email:** teste@minhaflorestaconservacoes.com
- **Senha:** 123456

### Administrador
- **Email:** admin@minhaflorestaconservacoes.com
- **Senha:** admin123

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login de usuário

### Usuários
- `PUT /api/users/:id` - Atualizar perfil (autenticado)

### Projetos
- `GET /api/projects` - Listar projetos
- `GET /api/projects/:id` - Buscar projeto específico
- `POST /api/projects/:id/purchase` - Comprar área do projeto

### Projetos Sociais
- `GET /api/social-projects` - Listar projetos sociais

### Transações
- `POST /api/transactions` - Criar transação (autenticado)
- `GET /api/users/:userId/transactions` - Listar transações do usuário

### Sistema
- `GET /api/health` - Health check da API
- `GET /api/system/settings` - Configurações do sistema

## 🗄️ Estrutura do Banco

### Principais Tabelas
- **users** - Usuários da plataforma
- **projects** - Projetos de reflorestamento
- **social_projects** - Projetos sociais
- **transactions** - Transações de compra
- **certificates** - Certificados emitidos
- **donations** - Doações para projetos sociais
- **system_settings** - Configurações do sistema

## 🔧 Funcionalidades

### ✅ Implementado
- ✅ Autenticação JWT
- ✅ Cadastro e login de usuários
- ✅ CRUD de projetos
- ✅ Sistema de compra de áreas
- ✅ Projetos sociais
- ✅ Transações
- ✅ Configurações do sistema
- ✅ Health check
- ✅ Validação de dados
- ✅ Controle de transações

### 🚧 Em Desenvolvimento
- 🚧 Sistema de certificados
- 🚧 Gateway de pagamento
- 🚧 Sistema de doações
- 🚧 Calculadora de pegada de carbono
- 🚧 Upload de imagens
- 🚧 Relatórios e analytics
- 🚧 Notificações por email

## 🛡️ Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Validação de entrada
- Controle de acesso por usuário
- Transações de banco de dados
- CORS configurado

## 🌐 Deploy

### Variáveis de Ambiente
Crie um arquivo `.env` com:
```
PORT=3001
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
NODE_ENV=production
```

### Serviços Recomendados
- **API:** Railway, Render, DigitalOcean
- **Banco:** Já configurado (freesqldatabase.com)
- **CDN:** Cloudflare para assets

## 📝 Logs e Monitoramento

- Logs detalhados no console
- Health check em `/api/health`
- Tratamento de erros consistente
- Timestamps em todas as operações

## 🔄 Sincronização com Frontend

O frontend está configurado para:
- Funcionar offline com localStorage
- Sincronizar automaticamente quando online
- Fallback para dados locais em caso de erro
- Retry automático de operações falhadas

## 📞 Suporte

Em caso de problemas:
1. Verifique a conexão com o banco
2. Consulte os logs do servidor
3. Teste o health check: `GET /api/health`
4. Verifique as credenciais do banco

## 🔄 Atualizações

Para atualizar o schema do banco:
1. Modifique `/database/schema.sql`
2. Execute `npm run init-db`

Para adicionar dados de teste:
1. Modifique `/backend/scripts/seed-database.js`
2. Execute `npm run seed-db`