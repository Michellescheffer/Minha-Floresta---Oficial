import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ngnybwsovjignsflrhyr.supabase.co';
const SUPABASE_SERVICE_KEY = '***REMOVED***';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔍 Verificando schema da tabela certificates...\n');

try {
  // Try to insert a minimal test record to see what fields are required
  const testCert = {
    certificate_number: 'TEST-001',
    project_id: '90815445-98d2-45ed-9e19-e3f228085368',
    customer_name: 'Test Customer',
    customer_email: 'test@test.com',
    area_sqm: 100,
    co2_offset_kg: 250,
    issue_date: new Date().toISOString(),
    status: 'issued'
  };

  console.log('📝 Tentando inserir certificado de teste...');
  const { data, error } = await supabase
    .from('certificates')
    .insert([testCert])
    .select();

  if (error) {
    console.log('❌ Erro:', error.message);
    console.log('📋 Detalhes:', error);
    
    // Try with different field names
    console.log('\n🔄 Tentando com nomes alternativos...');
    const altCert = {
      certificate_number: 'TEST-002',
      project_id: '90815445-98d2-45ed-9e19-e3f228085368',
      customer_name: 'Test Customer',
      customer_email: 'test@test.com',
      area_m2: 100,
      co2_offset: 250,
      issue_date: new Date().toISOString(),
      status: 'issued'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('certificates')
      .insert([altCert])
      .select();
    
    if (error2) {
      console.log('❌ Erro 2:', error2.message);
    } else {
      console.log('✅ Sucesso com nomes alternativos!');
      console.log('📋 Certificado criado:', data2[0]);
      
      // Delete test certificate
      await supabase.from('certificates').delete().eq('certificate_number', 'TEST-002');
      console.log('🗑️  Certificado de teste removido');
    }
  } else {
    console.log('✅ Sucesso!');
    console.log('📋 Certificado criado:', data[0]);
    
    // Show all fields
    console.log('\n📊 Campos disponíveis:');
    Object.keys(data[0]).forEach(key => {
      console.log(`   - ${key}: ${typeof data[0][key]}`);
    });
    
    // Delete test certificate
    await supabase.from('certificates').delete().eq('certificate_number', 'TEST-001');
    console.log('\n🗑️  Certificado de teste removido');
  }

} catch (error) {
  console.error('\n❌ Erro:', error.message);
}
