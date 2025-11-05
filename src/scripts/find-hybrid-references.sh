#!/bin/bash

# 🔍 Script para encontrar referências ao sistema híbrido

echo "🔍 Procurando referências ao sistema híbrido..."
echo "=============================================="
echo ""

echo "📝 Buscando 'HybridData' nos arquivos:"
echo "--------------------------------------"
grep -r "HybridData" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null | grep -v ".md" | grep -v "HYBRID_SYSTEM_REMOVAL"
echo ""

echo "📝 Buscando 'hybridService' nos arquivos:"
echo "-----------------------------------------"
grep -r "hybridService" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null | grep -v ".md"
echo ""

echo "📝 Buscando 'IndexedDB' nos arquivos:"
echo "-------------------------------------"
grep -r "IndexedDB" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null | grep -v ".md"
echo ""

echo "📝 Buscando 'kv_store' ou 'kv.get' nos arquivos:"
echo "------------------------------------------------"
grep -r "kv\." --include="*.tsx" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null | grep -v ".md"
echo ""

echo "📝 Buscando imports de 'hybridDataService':"
echo "-------------------------------------------"
grep -r "from.*hybridDataService" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null
echo ""

echo "📝 Buscando imports de 'HybridDataContext':"
echo "-------------------------------------------"
grep -r "from.*HybridDataContext" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null
echo ""

echo "📝 Buscando 'initializeDataSync':"
echo "---------------------------------"
grep -r "initializeDataSync" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null
echo ""

echo "✅ Busca concluída!"
echo ""
echo "💡 Próximos passos:"
echo "  1. Atualizar os arquivos listados acima"
echo "  2. Remover imports do sistema híbrido"
echo "  3. Usar SupabaseContext e supabaseClient"
echo "  4. Testar cada arquivo atualizado"
