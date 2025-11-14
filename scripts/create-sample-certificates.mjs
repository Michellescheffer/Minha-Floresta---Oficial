import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ngnybwsovjignsflrhyr.supabase.co';
const SUPABASE_SERVICE_KEY = '***REMOVED***';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🎫 Criando certificados de exemplo...\n');

try {
  // Get sales and projects
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .order('sale_date', { ascending: false });

  if (salesError) throw salesError;

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name');

  if (projectsError) throw projectsError;

  console.log(`📊 Encontradas ${sales.length} vendas`);
  console.log(`🌳 Encontrados ${projects.length} projetos\n`);

  // Create certificates for each sale
  const certificates = sales.map((sale, index) => {
    const project = projects[index % projects.length]; // Distribute among projects
    const certNumber = `MF-${new Date(sale.sale_date).getFullYear()}-${String(index + 1).padStart(6, '0')}`;
    
    return {
      certificate_number: certNumber,
      project_id: project.id,
      customer_name: sale.customer_name,
      customer_email: sale.customer_email,
      area_m2: sale.total_m2,
      co2_offset: sale.total_m2 * 2.5, // 2.5 kg CO2 per m²
      issue_date: sale.sale_date,
      status: 'issued',
      verification_code: `VER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      qr_code_url: null,
      metadata: {
        sale_id: sale.id,
        payment_method: sale.payment_method,
        total_value: sale.total_value
      }
    };
  });

  console.log('📝 Inserindo certificados...');
  const { data: inserted, error: insertError } = await supabase
    .from('certificates')
    .insert(certificates)
    .select();

  if (insertError) {
    console.error('❌ Erro ao inserir:', insertError);
    throw insertError;
  }

  console.log(`✅ ${inserted.length} certificados criados com sucesso!\n`);

  // Show summary
  console.log('📋 Certificados criados:');
  inserted.forEach((cert, i) => {
    console.log(`   ${i + 1}. ${cert.certificate_number} - ${cert.customer_name} - ${cert.area_m2}m²`);
  });

  console.log('\n✅ Concluído!');

} catch (error) {
  console.error('\n❌ Erro:', error.message);
  process.exit(1);
}
