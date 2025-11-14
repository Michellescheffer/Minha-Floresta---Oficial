# 🚀 Instruções de Configuração - Sistema de Imagens

## ✅ O que já foi feito automaticamente:

1. ✅ Bucket `images` criado no Supabase Storage
2. ✅ Bucket configurado como público
3. ✅ Código implementado e commitado

## 📋 O que você precisa fazer (2 minutos):

### 1. Executar Migration SQL no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr
2. Vá em **SQL Editor** (menu lateral esquerdo)
3. Clique em **New Query**
4. Cole o conteúdo do arquivo: `supabase/migrations/20250113_create_image_management_tables.sql`
5. Clique em **Run** (ou pressione Ctrl+Enter)

**Ou copie e cole este SQL:**

\`\`\`sql
-- Tabela para imagens estáticas do site (Hero, banners, etc.)
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para imagens dos certificados
CREATE TABLE IF NOT EXISTS certificate_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_site_images_key ON site_images(key);
CREATE INDEX IF NOT EXISTS idx_site_images_active ON site_images(is_active);
CREATE INDEX IF NOT EXISTS idx_certificate_images_active ON certificate_images(is_active);
CREATE INDEX IF NOT EXISTS idx_certificate_images_order ON certificate_images(display_order);

-- RLS Policies
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_images ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública
CREATE POLICY "Allow public read access to site_images" ON site_images
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to certificate_images" ON certificate_images
  FOR SELECT USING (is_active = true);

-- Permitir admin gerenciar
CREATE POLICY "Allow authenticated users to manage site_images" ON site_images
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage certificate_images" ON certificate_images
  FOR ALL USING (auth.role() = 'authenticated');

-- Inserir imagens padrão do Hero
INSERT INTO site_images (key, url, alt_text, display_order) VALUES
  ('hero_primary', '/images/amazon-aerial-new.jpg', 'Floresta Amazônica - Vista Aérea', 1),
  ('hero_secondary', 'https://images.unsplash.com/photo-1653149875526-e2533c6af095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwYWVyaWFsJTIwdmlld3hlbnwxfHx8fDE3NTYxNjc0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080', 'Floresta Amazônica - Vista Aérea 2', 2)
ON CONFLICT (key) DO NOTHING;
\`\`\`

### 2. Adicionar Rota Admin (Opcional)

Se quiser acessar o painel de administração, adicione a rota no seu sistema de rotas.

**Exemplo para React Router:**
\`\`\`typescript
import AdminImageManagerPage from './pages/AdminImageManagerPage';

// Adicione na sua configuração de rotas:
{
  path: '/admin-images',
  element: <AdminImageManagerPage />
}
\`\`\`

## 🎉 Pronto!

Após executar o SQL, você terá:

1. ✅ Tabelas `site_images` e `certificate_images` criadas
2. ✅ Bucket `images` configurado
3. ✅ Imagens padrão do Hero inseridas
4. ✅ Sistema pronto para uso

## 🎨 Como Usar

### Gerenciar Imagens do Hero
1. Acesse `/admin-images` (após adicionar a rota)
2. Tab "Imagens do Site"
3. Faça upload de 2 imagens
4. Elas aparecerão no Hero com transição automática

### Gerenciar Galeria de Certificados
1. Acesse `/admin-images`
2. Tab "Galeria de Certificados"
3. Adicione de 1 a 8 imagens
4. Elas aparecerão aleatoriamente nos certificados

## 🔍 Verificar se Funcionou

Execute novamente:
\`\`\`bash
node scripts/setup-image-tables.mjs
\`\`\`

Você deve ver:
- ✅ Tabela site_images existe!
- ✅ Tabela certificate_images existe!
- ✅ Bucket "images" existe!

## 📞 Problemas?

Se algo der errado:
1. Verifique se você está logado no Supabase Dashboard
2. Confirme que está no projeto correto (ngnybwsovjignsflrhyr)
3. Tente executar cada comando SQL separadamente
4. Verifique os logs de erro no SQL Editor
