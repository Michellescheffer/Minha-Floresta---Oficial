# 🚀 Guia de Início Rápido - Banco de Dados

## ⚡ Setup em 3 Comandos

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Banco Completo
```bash
npm run setup-db
```

### 3. Iniciar Servidor
```bash
npm run dev
```

## ✅ O que o `setup-db` faz:

```
🔗 Conectando ao banco de dados...
✅ Conexão estabelecida com sucesso!
🏥 Teste de conectividade: OK
📂 Carregando schema do banco de dados...
🏗️ Executando criação das tabelas...
✅ Schema executado com sucesso!
📋 Verificando tabelas criadas:
   1. users
   2. projects  
   3. social_projects
   4. transactions
   5. certificates
   6. donations
   7. carbon_calculations
   8. shopping_cart
   9. contact_messages
   10. system_settings
   11. audit_log
✅ Total de 11 tabelas criadas!
👤 Criando usuários iniciais...
   ✅ Usuários criados com sucesso!
🌳 Criando projetos de reflorestamento...
   ✅ Projetos de reflorestamento criados!
🤝 Criando projetos sociais...
   ✅ Projetos sociais criados!
🎉 CONFIGURAÇÃO COMPLETA!
```

## 🔑 Credenciais Criadas

### Usuário de Teste
- **Email:** teste@minhaflorestaconservacoes.com
- **Senha:** 123456

### Administrador
- **Email:** admin@minhaflorestaconservacoes.com  
- **Senha:** admin123

## 🔍 Verificar Status

```bash
npm run check-db
```

Mostra:
- ✅ Status da conexão
- 📊 Estatísticas de todas as tabelas
- ⚡ Performance das consultas
- 🌱 Status dos projetos
- ⚙️ Configurações do sistema

## 🔄 Reset Completo (se necessário)

```bash
npm run db:reset
```

Executa setup + verificação automaticamente.

## 🚨 Solução de Problemas

### Se der erro de conexão:
1. Verificar internet
2. Confirmar se as credenciais estão corretas
3. Tentar novamente em alguns minutos

### Se algumas tabelas falharem:
```bash
npm run db:reset
```

### Verificar se está tudo OK:
```bash
npm run check-db
```

## 🌍 Dados Criados Automaticamente

### 4 Projetos de Reflorestamento:
1. **Amazônia Verde Plus** (R$ 25,00/m²)
2. **Mata Atlântica Renascimento** (R$ 30,00/m²)  
3. **Cerrado Sustentável 2.0** (R$ 20,00/m²)
4. **Projeto Mangue Azul Avançado** (R$ 35,00/m²)

### 4 Projetos Sociais:
1. **Educação Ambiental Comunitária**
2. **Capacitação em Agrofloresta Avançada**
3. **Pesquisa em Biodiversidade Tropical**
4. **Desenvolvimento Comunitário Sustentável**

### Configurações do Sistema:
- Taxa de processamento: 3.5%
- CO₂ por m²: 22kg/ano
- Validade certificados: 30 anos
- Taxa de sobrevivência: 85%

## 🎯 Resultado Final

Após executar os comandos, você terá:

✅ **Banco MySQL funcionando** com todas as tabelas
✅ **Dados de teste** prontos para usar
✅ **Usuários de teste** criados
✅ **Projetos de exemplo** cadastrados
✅ **Configurações** definidas
✅ **Sistema pronto** para desenvolvimento/produção

---

💚 **Sua floresta digital está pronta para crescer!** 🌳