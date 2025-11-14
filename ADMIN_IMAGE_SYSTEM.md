# Sistema de Gerenciamento de Imagens - Admin

## 📋 Visão Geral

Sistema completo para gerenciar todas as imagens estáticas do site através de um painel administrativo.

## 🎯 Funcionalidades

### 1. Imagens do Hero (Banner Principal)
- **2 imagens** com transição automática após 5 segundos
- Upload e substituição via painel admin
- Carregamento dinâmico do banco de dados

### 2. Galeria de Certificados
- **1 a 8 imagens** gerenciáveis
- Seleção **aleatória** para cada certificado
- Upload, exclusão e reordenação
- Imagem exibida abaixo do QR code no certificado

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

#### `site_images`
```sql
- id: UUID (PK)
- key: TEXT (hero_primary, hero_secondary)
- url: TEXT
- alt_text: TEXT
- display_order: INTEGER
- is_active: BOOLEAN
- created_at, updated_at: TIMESTAMPTZ
```

#### `certificate_images`
```sql
- id: UUID (PK)
- url: TEXT
- alt_text: TEXT
- display_order: INTEGER
- is_active: BOOLEAN
- created_at, updated_at: TIMESTAMPTZ
```

## 🚀 Como Usar

### 1. Executar Migration

Execute o SQL no Supabase SQL Editor:

```bash
# Arquivo: supabase/migrations/20250113_create_image_management_tables.sql
```

Ou via CLI:
```bash
supabase db push
```

### 2. Criar Bucket de Storage

No Supabase Dashboard:
1. Vá em **Storage**
2. Crie um bucket chamado `images`
3. Configure como **público**
4. Adicione policies de leitura pública

### 3. Acessar Painel Admin

```
/admin-images
```

**Nota**: Adicione esta rota no seu sistema de rotas!

## 📸 Como Funciona

### Hero (Banner Principal)

1. Admin faz upload de 2 imagens
2. Sistema salva no bucket `images/site/`
3. URLs são armazenadas em `site_images`
4. Hero carrega imagens do banco
5. Transição automática após 5s

### Certificados

1. Admin adiciona 1-8 imagens na galeria
2. Sistema salva no bucket `images/certificates/`
3. URLs são armazenadas em `certificate_images`
4. Ao abrir certificado:
   - Sistema busca todas as imagens ativas
   - Seleciona uma **aleatoriamente**
   - Exibe abaixo do QR code
5. **Nova imagem a cada reload** do certificado

## 🔧 Componentes

### `AdminImageManagerPage.tsx`
Painel completo de administração com:
- Tabs para Hero e Certificados
- Upload de imagens
- Preview em tempo real
- Exclusão e reordenação
- Limite de 8 imagens para certificados

### `Hero.tsx`
- Carrega imagens do banco
- Fallback para imagens padrão
- Transição suave entre imagens

### `VisualizarCertificadoPage.tsx`
- Carrega imagem aleatória da galeria
- Exibe abaixo do QR code
- Recarrega a cada visualização

## 🎨 Layout do Certificado

```
┌─────────────────────────────────┐
│ Logo + Título                   │
├─────────────────────────────────┤
│ Token de Verificação            │
│                                 │
│ Nome do Comprador               │
│ Área Preservada                 │
│ Projeto                         │
│                                 │
│ Data + Status + Validade        │
├─────────────────────────────────┤
│ QR Code (direita)               │
│ ┌─────────────┐                 │
│ │   QR CODE   │                 │
│ └─────────────┘                 │
│ Escaneie para verificar         │
│                                 │
│ ┌─────────────┐ ← NOVA IMAGEM   │
│ │   IMAGEM    │                 │
│ │  ALEATÓRIA  │                 │
│ └─────────────┘                 │
└─────────────────────────────────┘
```

## 🔐 Segurança

### RLS (Row Level Security)

**Leitura Pública**:
- Qualquer um pode ver imagens ativas
- Necessário para exibir no site

**Escrita Autenticada**:
- Apenas usuários autenticados podem gerenciar
- Ajuste conforme sua lógica de admin

### Recomendações

1. Adicione verificação de role admin:
```sql
CREATE POLICY "Only admins can manage images" ON site_images
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

2. Limite tamanho de upload (5MB):
```typescript
if (file.size > 5 * 1024 * 1024) {
  alert('Arquivo muito grande. Máximo 5MB');
  return;
}
```

3. Valide tipos de arquivo:
```typescript
const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!validTypes.includes(file.type)) {
  alert('Tipo de arquivo inválido');
  return;
}
```

## 📝 TODO

- [ ] Adicionar rota `/admin-images` no sistema de rotas
- [ ] Criar bucket `images` no Supabase Storage
- [ ] Executar migration SQL
- [ ] Adicionar verificação de role admin
- [ ] Otimizar imagens no upload (resize, compress)
- [ ] Adicionar preview antes do upload
- [ ] Implementar drag-and-drop para reordenação
- [ ] Cache de imagens no frontend

## 🐛 Troubleshooting

### Imagens não carregam
1. Verifique se o bucket `images` existe
2. Confirme que o bucket é público
3. Verifique as policies RLS

### Upload falha
1. Verifique autenticação do usuário
2. Confirme permissões do bucket
3. Verifique tamanho do arquivo

### Imagem não aparece no certificado
1. Verifique se há imagens ativas na galeria
2. Confirme que `is_active = true`
3. Verifique console para erros

## 📚 Referências

- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [React File Upload](https://react.dev/reference/react-dom/components/input#reading-the-files-information-without-uploading-them-to-the-server)
