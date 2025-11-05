#!/bin/bash

# ⚡ Script Automatizado: Corrigir erro projects.status
# Execute: chmod +x fix-projects-status.sh && ./fix-projects-status.sh

set -e

PROJECT_REF="ngnybwsovjignsflrhyr"
MIGRATION_FILE="FIX_NOW.sql"

echo ""
echo "═══════════════════════════════════════════════════"
echo "⚡ Correção Automática: column projects.status"
echo "═══════════════════════════════════════════════════"
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não está instalado"
    echo ""
    echo "SOLUÇÃO MANUAL:"
    echo "1. Abra: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
    echo "2. Copie todo o conteúdo de: /$MIGRATION_FILE"
    echo "3. Cole no SQL Editor e clique 'Run'"
    echo ""
    echo "Ou instale o Supabase CLI:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Verificar se está linkado ao projeto
echo "🔗 Verificando conexão com o projeto..."
if ! supabase projects list 2>/dev/null | grep -q "$PROJECT_REF"; then
    echo "⚠️  Projeto não está linkado"
    echo "🔗 Linkando ao projeto $PROJECT_REF..."
    
    if ! supabase link --project-ref "$PROJECT_REF"; then
        echo ""
        echo "❌ Falha ao linkar projeto"
        echo ""
        echo "SOLUÇÃO MANUAL:"
        echo "1. Execute: supabase login"
        echo "2. Execute: supabase link --project-ref $PROJECT_REF"
        echo "3. Ou siga: /EXECUTE_FIX_NOW.md"
        echo ""
        exit 1
    fi
fi

echo "✅ Projeto linkado"
echo ""

# Verificar se arquivo de migração existe
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Arquivo $MIGRATION_FILE não encontrado"
    echo ""
    echo "Certifique-se de estar no diretório raiz do projeto"
    echo ""
    exit 1
fi

echo "✅ Arquivo de migração encontrado"
echo ""

# Aplicar migração
echo "🚀 Aplicando migração..."
echo ""

if supabase db execute --file "$MIGRATION_FILE" --project-ref "$PROJECT_REF"; then
    echo ""
    echo "═══════════════════════════════════════════════════"
    echo "✅ SUCESSO! Migração aplicada com sucesso!"
    echo "══════════════════════════════════════════════���════"
    echo ""
    echo "📊 Colunas adicionadas à tabela projects:"
    echo "   ✅ status"
    echo "   ✅ slug"
    echo "   ✅ category"
    echo "   ✅ long_description"
    echo "   ✅ featured"
    echo "   ✅ priority"
    echo ""
    echo "🚀 PRÓXIMO PASSO:"
    echo "   Reinicie a aplicação:"
    echo "   npm run dev"
    echo ""
    echo "✅ O erro 'column projects.status does not exist' foi corrigido!"
    echo ""
else
    echo ""
    echo "❌ Erro ao aplicar migração via CLI"
    echo ""
    echo "SOLUÇÃO MANUAL (30 segundos):"
    echo "1. Abra: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
    echo "2. Copie todo o conteúdo de: /$MIGRATION_FILE"
    echo "3. Cole no SQL Editor e clique 'Run'"
    echo ""
    echo "Guia completo: /EXECUTE_FIX_NOW.md"
    echo ""
    exit 1
fi
