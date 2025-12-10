import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ngnybwsovjignsflrhyr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrado. Configure no .env ou exporte antes de rodar o script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🚀 Criando usuário administrador...\n');

  const adminEmail = 'nei@ampler.me';
  const adminPassword = 'Qwe123@#';
  const adminName = 'Nei Maciel';

  try {
    console.log('📧 Email:', adminEmail);
    console.log('👤 Nome:', adminName);

    const { data: existingData, error: listError } = await supabase.auth.admin.listUsers({
      email: adminEmail,
    });

    if (listError) {
      throw listError;
    }

    const existingUser = existingData?.users?.[0];

    if (existingUser) {
      console.log('\n⚠️  Usuário já existe! Atualizando credenciais...\n');
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          name: adminName,
          role: 'admin',
        },
      });

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Senha e metadata atualizados com sucesso!');
    } else {
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          name: adminName,
          role: 'admin',
        },
      });

      if (createError) {
        throw createError;
      }

      console.log('\n✅ Usuário criado com sucesso!');
      console.log('📝 ID:', data.user?.id);
    }

    console.log('\n🔐 Credenciais de Admin:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', adminEmail);
    console.log('Senha:    ', adminPassword);
    console.log('Nome:     ', adminName);
    console.log('Role:     ', 'admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n✅ Configuração concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Faça login com as credenciais acima');
    console.log('2. Acesse /cms para o painel administrativo');
    console.log('3. Acesse /admin-images para gerenciar imagens');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
}

createAdminUser();
