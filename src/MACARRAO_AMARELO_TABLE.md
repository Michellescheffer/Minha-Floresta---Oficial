# 🍝 Tabela Macarrão Amarelo - Documentação Completa

## 📋 Visão Geral

Tabela de demonstração criada no Supabase PostgreSQL com **5 tipos clássicos de massa italiana**.

---

## 🗄️ Estrutura da Tabela

### Nome da Tabela
```sql
public.macarrao_amarelo
```

### Colunas Principais (5 Tipos de Massa)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único (Primary Key) |
| `espaguete` | TEXT | Descrição da massa Espaguete |
| `penne` | TEXT | Descrição da massa Penne |
| `fusilli` | TEXT | Descrição da massa Fusilli |
| `farfalle` | TEXT | Descrição da massa Farfalle (Gravatinha) |
| `rigatoni` | TEXT | Descrição da massa Rigatoni |

### Colunas Adicionais

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `cor` | TEXT | 'amarelo' | Cor da massa |
| `ingrediente_principal` | TEXT | 'trigo durum' | Ingrediente base |
| `tempo_cozimento` | INTEGER | 8 | Tempo de cozimento em minutos |
| `porcao_recomendada` | INTEGER | 100 | Porção recomendada em gramas |
| `created_at` | TIMESTAMP | NOW() | Data de criação |
| `updated_at` | TIMESTAMP | NOW() | Data de atualização |

---

## 🍝 Os 5 Tipos de Massa

### 1. **Espaguete** 🍝
```
Massa longa e fina, perfeita com molho de tomate, 
carbonara ou alho e óleo.
Tempo de cozimento: 8-10 minutos
```

### 2. **Penne** 🍝
```
Massa tubular com pontas cortadas, ideal para molho 
à bolonhesa, arrabbiata e molhos cremosos.
Tempo de cozimento: 11-13 minutos
```

### 3. **Fusilli** 🍝
```
Massa em formato espiral, excelente para saladas frias, 
molhos com pedaços de carne ou vegetais.
Tempo de cozimento: 10-12 minutos
```

### 4. **Farfalle (Gravatinha)** 🍝
```
Massa em formato de laço, ótima para molhos leves, 
saladas e pratos com salmão.
Tempo de cozimento: 10-12 minutos
```

### 5. **Rigatoni** 🍝
```
Massa tubular grande com estrias, perfeita para molhos 
encorpados, gratinados e massas assadas.
Tempo de cozimento: 12-15 minutos
```

---

## 🚀 Endpoints da API

### Base URL
```
https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4
```

### 1. Listar Todos os Tipos de Massa

**Request:**
```bash
GET /macarrao
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "espaguete": "Massa longa e fina...",
      "penne": "Massa em formato de canudo...",
      "fusilli": "Massa em espiral...",
      "farfalle": "Massa em gravatinha...",
      "rigatoni": "Massa tubular grande...",
      "cor": "amarelo dourado",
      "ingrediente_principal": "Sêmola de trigo durum",
      "tempo_cozimento": 10,
      "porcao_recomendada": 100,
      "created_at": "2025-01-04T...",
      "updated_at": "2025-01-04T..."
    }
  ],
  "source": "supabase",
  "count": 1,
  "massas": {
    "espaguete": "🍝 Massa longa e fina",
    "penne": "🍝 Massa em canudo",
    "fusilli": "🍝 Massa em espiral",
    "farfalle": "🍝 Massa em gravatinha",
    "rigatoni": "🍝 Massa tubular grande"
  }
}
```

---

### 2. Buscar Tipo Específico

**Request:**
```bash
GET /macarrao/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "espaguete": "...",
    "penne": "...",
    ...
  },
  "source": "supabase"
}
```

---

### 3. Criar Novo Tipo de Massa

**Request:**
```bash
POST /macarrao
Content-Type: application/json

{
  "espaguete": "Descrição customizada do espaguete",
  "penne": "Descrição customizada do penne",
  "fusilli": "Descrição customizada do fusilli",
  "farfalle": "Descrição customizada do farfalle",
  "rigatoni": "Descrição customizada do rigatoni",
  "cor": "amarelo ouro",
  "ingrediente_principal": "trigo durum orgânico",
  "tempo_cozimento": 12,
  "porcao_recomendada": 120
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "source": "hybrid",
  "message": "🍝 Novo tipo de massa criado com sucesso!"
}
```

---

### 4. Atualizar Tipo de Massa

**Request:**
```bash
PUT /macarrao/:id
Content-Type: application/json

{
  "tempo_cozimento": 15,
  "cor": "amarelo intenso"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "source": "hybrid",
  "message": "🍝 Tipo de massa atualizado com sucesso!"
}
```

---

### 5. Deletar Tipo de Massa

**Request:**
```bash
DELETE /macarrao/:id
```

**Response:**
```json
{
  "success": true,
  "message": "🍝 Tipo de massa deletado com sucesso!",
  "source": "hybrid"
}
```

---

### 6. Estatísticas das Massas

**Request:**
```bash
GET /macarrao/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 1,
    "tempo_medio_cozimento": 10,
    "porcao_media": 100,
    "cores_disponiveis": ["amarelo dourado"],
    "ingredientes": ["Sêmola de trigo durum"],
    "tipos": [
      "🍝 Espaguete",
      "🍝 Penne",
      "🍝 Fusilli",
      "🍝 Farfalle",
      "🍝 Rigatoni"
    ]
  },
  "message": "🍝 Estatísticas das massas amarelas!"
}
```

---

## 🔐 Segurança (RLS)

### Políticas Ativas

```sql
-- Leitura pública (todos podem ver)
✅ Allow public read access

-- Inserção apenas para usuários autenticados
✅ Allow authenticated insert

-- Atualização apenas para admins
✅ Allow admin update
```

---

## 🔨 Como Criar a Tabela

### Método 1: Via Supabase CLI (Recomendado)

```bash
# Executar migration
npx supabase db push
```

### Método 2: Via Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard/project/ngnybwsovjignsflrhyr/editor
2. Clique em "SQL Editor"
3. Cole o conteúdo do arquivo: `/supabase/migrations/002_macarrao_amarelo.sql`
4. Execute o SQL

### Método 3: Via Script Node.js

```bash
# Executar script
node scripts/create-macarrao-table.js
```

---

## 🧪 Como Testar

### 1. Via cURL

```bash
# Listar massas
curl https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/macarrao \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Criar nova massa
curl -X POST \
  https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/macarrao \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "espaguete": "Meu espaguete especial",
    "cor": "amarelo ouro",
    "tempo_cozimento": 9
  }'

# Ver estatísticas
curl https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/macarrao/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Via JavaScript/Browser

```javascript
// Fetch API
const response = await fetch(
  'https://ngnybwsovjignsflrhyr.supabase.co/functions/v1/make-server-1328d8b4/macarrao',
  {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }
);

const data = await response.json();
console.log('🍝 Massas:', data);
```

### 3. Via Supabase Client

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ngnybwsovjignsflrhyr.supabase.co',
  'sua-anon-key'
);

// Listar massas
const { data, error } = await supabase
  .from('macarrao_amarelo')
  .select('*');

console.log('🍝 Massas:', data);
```

---

## 📊 Dados de Exemplo

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "espaguete": "Espaguete: Massa longa e fina, perfeita com molho de tomate, carbonara ou alho e óleo. Tempo de cozimento: 8-10 minutos",
  "penne": "Penne: Massa tubular com pontas cortadas, ideal para molho à bolonhesa, arrabbiata e molhos cremosos. Tempo de cozimento: 11-13 minutos",
  "fusilli": "Fusilli: Massa em formato espiral, excelente para saladas frias, molhos com pedaços de carne ou vegetais. Tempo de cozimento: 10-12 minutos",
  "farfalle": "Farfalle (Gravatinha): Massa em formato de laço, ótima para molhos leves, saladas e pratos com salmão. Tempo de cozimento: 10-12 minutos",
  "rigatoni": "Rigatoni: Massa tubular grande com estrias, perfeita para molhos encorpados, gratinados e massas assadas. Tempo de cozimento: 12-15 minutos",
  "cor": "amarelo dourado",
  "ingrediente_principal": "Sêmola de trigo durum (grano duro)",
  "tempo_cozimento": 10,
  "porcao_recomendada": 100,
  "created_at": "2025-01-04T12:00:00.000Z",
  "updated_at": "2025-01-04T12:00:00.000Z"
}
```

---

## 🔄 Sistema Híbrido

A tabela funciona no **sistema híbrido** Supabase + KV Store:

```
Request
  ↓
Edge Function
  ↓
  ├─→ Supabase PostgreSQL (Primary)
  │   └─→ Tabela macarrao_amarelo
  │
  └─→ KV Store (Cache/Fallback)
      └─→ Keys: macarrao_{id}
```

**Vantagens:**
- ✅ Performance com cache
- ✅ Fallback automático
- ✅ Sincronização dupla
- ✅ Offline capability

---

## 📁 Arquivos Relacionados

```
/supabase/migrations/002_macarrao_amarelo.sql    → Migration SQL
/supabase/functions/server/index.tsx             → Endpoints da API
/scripts/create-macarrao-table.js                → Script de criação
/MACARRAO_AMARELO_TABLE.md                       → Esta documentação
```

---

## 🎯 Casos de Uso

### 1. Catálogo de Massas
```javascript
// Listar todas as massas para um cardápio
const massas = await fetch('/macarrao').then(r => r.json());
```

### 2. Receitas
```javascript
// Buscar informações de uma massa específica para uma receita
const penne = await fetch('/macarrao/id').then(r => r.json());
console.log('Tempo de cozimento:', penne.data.tempo_cozimento, 'minutos');
```

### 3. Análise Nutricional
```javascript
// Ver estatísticas de todas as massas
const stats = await fetch('/macarrao/stats').then(r => r.json());
console.log('Tempo médio de cozimento:', stats.stats.tempo_medio_cozimento);
```

---

## ✅ Checklist de Implementação

- [x] Migration SQL criada
- [x] Tabela com 5 colunas (tipos de massa)
- [x] Índices configurados
- [x] RLS habilitado
- [x] Políticas de segurança
- [x] Triggers para updated_at
- [x] Dados de exemplo inseridos
- [x] Endpoints da API criados (6 endpoints)
- [x] Sistema híbrido implementado
- [x] Fallback para KV Store
- [x] Documentação completa

---

## 🎉 Status

**Status:** ✅ **PRONTO PARA USO**

A tabela `macarrao_amarelo` está totalmente configurada e pronta para ser criada no Supabase!

---

**Criado em:** 2025-01-04  
**Versão:** 1.0.0  
**Autor:** Sistema Híbrido Minha Floresta Conservações
