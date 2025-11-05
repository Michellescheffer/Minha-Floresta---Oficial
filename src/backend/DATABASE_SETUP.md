# 🗄️ Configuração do Banco de Dados - Minha Floresta Conservações

## 📋 Visão Geral

Este documento descreve como configurar e gerenciar o banco de dados MySQL para a plataforma Minha Floresta Conservações.

## 🚀 Scripts Disponíveis

### 1. Setup Completo (Recomendado)
```bash
npm run setup-db
```
**O que faz:**
- ✅ Conecta ao banco de dados
- ✅ Cria todas as tabelas do schema
- ✅ Insere dados iniciais (projetos, usuários, configurações)
- ✅ Verifica a integridade dos dados
- ✅ Mostra credenciais de acesso

### 2. Verificação do Banco
```bash
npm run check-db
```
**O que faz:**
- 🔍 Testa a conectividade
- 📊 Mostra estatísticas das tabelas
- ⚡ Testa performance das consultas
- ⚙️ Verifica configurações do sistema
- 🌱 Status dos projetos

### 3. Reset Completo
```bash
npm run db:reset
```
**O que faz:**
- 🔄 Executa setup completo
- ✅ Executa verificação
- 📋 Relatório final

### 4. Scripts Individuais

#### Inicializar Schema
```bash
npm run init-db
```
Apenas cria as tabelas (sem dados)

#### Popular com Dados
```bash
npm run seed-db
```
Apenas insere dados de exemplo

## 🏗️ Estrutura do Banco de Dados

### Tabelas Principais

#### 👥 **users**
- Usuários da plataforma
- Autenticação e perfis
- Dados pessoais e preferências

#### 🌱 **projects**
- Projetos de reflorestamento
- Tipos: reforestation, restoration, conservation, blue-carbon
- Controle de área disponível/vendida

#### 🤝 **social_projects**
- Projetos sociais e educativos
- Categorias: education, training, research, community
- Controle de orçamento e beneficiários

#### 💳 **transactions**
- Transações de compra de m²
- Integração com gateways de pagamento
- Status de pagamento

#### 📜 **certificates**
- Certificados digitais e físicos
- Numeração única
- Dados de CO₂ compensado

#### 💝 **donations**
- Doações para projetos sociais
- Controle de recibos
- Opção de anonimato

#### 🌍 **carbon_calculations**
- Histórico de cálculos de pegada
- Recomendações personalizadas
- Dados por usuário/sessão

#### 🛒 **shopping_cart**
- Carrinho persistente
- Suporte a usuários e sessões
- Gerenciamento de quantidades

#### 📧 **contact_messages**
- Mensagens de contato
- Status de atendimento
- Sistema de respostas

#### ⚙️ **system_settings**
- Configurações globais da plataforma
- Valores dinâmicos
- Controle de versão

#### 📝 **audit_log**
- Log de auditoria
- Rastreamento de ações importantes
- Histórico de alterações

### Índices de Performance

Criados automaticamente para otimizar consultas:
- ✅ Emails de usuários
- ✅ Status de projetos e transações
- ✅ Números de certificados
- ✅ Datas de criação
- ✅ Relacionamentos entre tabelas

## 🔐 Credenciais Padrão

### Usuário de Teste
- **Email:** teste@minhaflorestaconservacoes.com
- **Senha:** 123456
- **Perfil:** Usuário regular

### Administrador
- **Email:** admin@minhaflorestaconservacoes.com
- **Senha:** admin123
- **Perfil:** Administrador do sistema

## 📊 Dados de Exemplo

### Projetos de Reflorestamento
1. **Amazônia Verde Plus** - R$ 25,00/m²
2. **Mata Atlântica Renascimento** - R$ 30,00/m²
3. **Cerrado Sustentável 2.0** - R$ 20,00/m²
4. **Projeto Mangue Azul Avançado** - R$ 35,00/m²

### Projetos Sociais
1. **Educação Ambiental Comunitária**
2. **Capacitação em Agrofloresta Avançada**
3. **Pesquisa em Biodiversidade Tropical**
4. **Desenvolvimento Comunitário Sustentável**

## 🔧 Configuração de Conexão

```javascript
const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'u271208684_minhafloresta',
  password: 'B7Jz/vu~4s|Q',
  database: 'u271208684_minhafloresta',
  port: 3306
};
```

## 🚨 Solução de Problemas

### Erro de Conexão
```
❌ ECONNREFUSED
```
**Soluções:**
- Verificar conexão com internet
- Confirmar se o servidor MySQL está acessível
- Testar conectividade na porta 3306

### Credenciais Inválidas
```
❌ ER_ACCESS_DENIED_ERROR
```
**Soluções:**
- Verificar usuário e senha
- Confirmar permissões do usuário no banco
- Testar conexão manual

### Banco Não Existe
```
❌ ER_BAD_DB_ERROR
```
**Soluções:**
- Executar `npm run setup-db`
- Verificar nome do banco de dados
- Confirmar se o banco foi criado

### Tabelas Não Encontradas
```
❌ Table doesn't exist
```
**Soluções:**
- Executar `npm run init-db`
- Verificar se o schema foi aplicado
- Executar reset completo: `npm run db:reset`

## 📈 Monitoramento

### Pool de Conexões
- **Máximo:** 20 conexões simultâneas
- **Timeout:** 60 segundos
- **Reconexão:** Automática
- **Keep-alive:** Habilitado

### Health Checks
- ✅ Ping a cada 30 segundos
- ✅ Retry com backoff exponencial
- ✅ Log detalhado de operações
- ✅ Estatísticas do pool

## 🔄 Backup e Restore

### Backup Manual
```bash
mysqldump -h sql10.freesqldatabase.com -u u271208684_minhafloresta -p u271208684_minhafloresta > backup.sql
```

### Restore Manual
```bash
mysql -h sql10.freesqldatabase.com -u u271208684_minhafloresta -p u271208684_minhafloresta < backup.sql
```

## 📞 Suporte

Para problemas técnicos:
1. Execute `npm run check-db` para diagnóstico
2. Verifique os logs do servidor
3. Consulte este documento
4. Entre em contato com a equipe técnica

---

💚 **Minha Floresta Conservações** - Tecnologia para um planeta mais verde!