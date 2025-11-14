import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ngnybwsovjignsflrhyr.supabase.co';
const SUPABASE_SERVICE_KEY = '***REMOVED***';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupTables() {
  console.log('🚀 Iniciando configuração das tabelas de imagens...\n');

  try {
    // Inserir imagens padrão do Hero
    console.log('📸 Inserindo imagens padrão do Hero...');
    const { data: siteData, error: siteError } = await supabase
      .from('site_images')
      .upsert([
        {
          key: 'hero_primary',
          url: '/images/amazon-aerial-new.jpg',
          alt_text: 'Floresta Amazônica - Vista Aérea',
          display_order: 1,
          is_active: true
        },
        {
          key: 'hero_secondary',
          url: 'https://images.unsplash.com/photo-1653149875526-e2533c6af095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwYWVyaWFsJTIwdmlld3hlbnwxfHx8fDE3NTYxNjc0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
          alt_text: 'Floresta Amazônica - Vista Aérea 2',
          display_order: 2,
          is_active: true
        }
      ], { 
        onConflict: 'key',
        ignoreDuplicates: false 
      });

    if (siteError) {
      console.log('⚠️  Tabela site_images:', siteError.message);
      console.log('   (Isso é normal se as tabelas ainda não existirem)');
    } else {
      console.log('✅ Imagens do Hero configuradas!');
    }

    // Verificar se as tabelas existem
    console.log('\n🔍 Verificando tabelas...');
    
    const { data: checkSite, error: checkSiteError } = await supabase
      .from('site_images')
      .select('count')
      .limit(1);
    
    if (checkSiteError) {
      console.log('❌ Tabela site_images não existe ainda');
      console.log('   Execute a migration SQL manualmente no Supabase Dashboard:');
      console.log('   supabase/migrations/20250113_create_image_management_tables.sql');
    } else {
      console.log('✅ Tabela site_images existe!');
    }

    const { data: checkCert, error: checkCertError } = await supabase
      .from('certificate_images')
      .select('count')
      .limit(1);
    
    if (checkCertError) {
      console.log('❌ Tabela certificate_images não existe ainda');
    } else {
      console.log('✅ Tabela certificate_images existe!');
    }

    // Verificar bucket de storage
    console.log('\n📦 Verificando bucket de storage...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.log('❌ Erro ao verificar buckets:', bucketsError.message);
    } else {
      const imagesBucket = buckets.find(b => b.name === 'images');
      if (imagesBucket) {
        console.log('✅ Bucket "images" existe!');
      } else {
        console.log('⚠️  Bucket "images" não existe');
        console.log('   Criando bucket...');
        
        const { data: newBucket, error: createError } = await supabase
          .storage
          .createBucket('images', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });

        if (createError) {
          console.log('❌ Erro ao criar bucket:', createError.message);
          console.log('   Crie manualmente no Supabase Dashboard > Storage');
        } else {
          console.log('✅ Bucket "images" criado com sucesso!');
        }
      }
    }

    console.log('\n✅ Configuração concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Se as tabelas não existem, execute a migration SQL no Supabase Dashboard');
    console.log('2. Acesse /admin-images para gerenciar as imagens');
    console.log('3. Faça upload das imagens do Hero e da galeria de certificados');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
}

setupTables();
