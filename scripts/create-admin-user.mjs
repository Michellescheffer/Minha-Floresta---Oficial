import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ngnybwsovjignsflrhyr.supabase.co';
const SUPABASE_SERVICE_KEY = '***REMOVED***';

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
    // Criar usuário via Admin API
    console.log('📧 Email:', adminEmail);
    console.log('👤 Nome:', adminName);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirma o email
      user_metadata: {
        name: adminName,
        role: 'admin'
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('\n⚠️  Usuário já existe!');
        console.log('Tentando atualizar senha...\n');
        
        // Buscar usuário existente
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === adminEmail);
        
        if (existingUser) {
          // Atualizar senha
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              password: adminPassword,
              user_metadata: {
                name: adminName,
                role: 'admin'
              }
            }
          );
          
          if (updateError) {
            console.error('❌ Erro ao atualizar usuário:', updateError.message);
            return;
          }
          
          console.log('✅ Senha atualizada com sucesso!');
          console.log('✅ Metadata atualizado com role: admin');
        }
      } else {
        throw error;
      }
    } else {
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
