# 🔐 Credenciais de Administrador

## Usuário Admin Principal

**Email:** `nei@ampler.me`  
**Senha:** `Qwe123@#`  
**Nome:** Nei Maciel  
**Role:** admin  
**ID:** 26048652-dd49-4a24-9fdb-ed4cb57922b0

## 📍 Onde Usar

### 1. Painel CMS (Completo)
- **URL:** `/cms`
- **Descrição:** Painel administrativo completo
- **Recursos:**
  - Dashboard com estatísticas
  - Gerenciar projetos
  - Gerenciar certificados
  - Visualizar transações
  - Gerenciar usuários
  - Configurações do sistema

### 2. Painel de Imagens
- **URL:** `/admin-images`
- **Descrição:** Gerenciamento de imagens
- **Recursos:**
  - Imagens do Hero (banner principal)
  - Galeria de certificados (1-8 imagens)
  - Upload, exclusão e reordenação

## 🔄 Usuário de Desenvolvimento (Legado)

**Email:** `admin@minhaflorestaconservacoes.com`  
**Senha:** `admin123`

> ⚠️ Este usuário é apenas para desenvolvimento/teste. Use o usuário principal acima para produção.

## 🛡️ Segurança

### Boas Práticas
1. ✅ Senha forte com maiúsculas, minúsculas, números e símbolos
2. ✅ Email verificado automaticamente
3. ✅ Role de admin configurada no metadata
4. ✅ Acesso via Supabase Auth

### Alterar Senha
Se precisar alterar a senha:
1. Acesse o Supabase Dashboard
2. Vá em Authentication → Users
3. Encontre o usuário `nei@ampler.me`
4. Clique em "..." → "Reset Password"
5. Ou use o script: `node scripts/create-admin-user.mjs` (atualiza automaticamente)

## 📝 Criar Novos Admins

Para criar novos usuários admin, edite o arquivo `scripts/create-admin-user.mjs` e execute:

\`\`\`bash
node scripts/create-admin-user.mjs
\`\`\`

## 🔒 Proteção de Rotas

As rotas admin são protegidas por:
1. Autenticação via Supabase Auth
2. Verificação de email confirmado
3. Metadata `role: 'admin'` (em desenvolvimento)

### Melhorar Segurança (Recomendado)

Para adicionar verificação de role mais robusta:

\`\`\`typescript
// Em qualquer página admin
const { user } = useAuth();

useEffect(() => {
  if (!user || user.role !== 'admin') {
    navigate('/');
    toast.error('Acesso negado');
  }
}, [user]);
\`\`\`

## 📞 Suporte

Se tiver problemas com login:
1. Verifique se o email está confirmado no Supabase Dashboard
2. Tente resetar a senha via "Esqueceu a senha?"
3. Execute o script de criação novamente para atualizar
4. Verifique os logs do Supabase para erros de autenticação
