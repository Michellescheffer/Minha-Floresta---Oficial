#!/usr/bin/env node

/**
 * Seeds essential Minha Floresta data into Supabase (site settings + donation projects/certificates).
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('Set them before running (e.g., via `.env.local` or exporting in the shell).');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const forceSeed = process.argv.includes('--force');

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const defaultSettings = {
  site_name: 'Minha Floresta',
  site_description: 'Compense sua pegada de carbono investindo em projetos de reflorestamento e conservação.',
  contact_email: 'contato@minhafloresta.com.br',
  contact_phone: '(11) 99999-9999',
  contact_address: 'São Paulo, SP - Brasil',
  social_instagram: 'https://instagram.com/minhafloresta',
  social_linkedin: 'https://linkedin.com/company/minhafloresta',
  social_facebook: 'https://facebook.com/minhafloresta',
  stripe_public_key: process.env.VITE_STRIPE_PUBLIC_KEY ?? null,
};

const donationProjectSeeds = [
  {
    title: 'Reflorestamento Amazônia 2025',
    description: 'Recuperação de áreas degradadas da Amazônia com espécies nativas e monitoramento por 5 anos.',
    long_description:
      'Este projeto cobre 1.200 hectares de floresta degradada na região de Santarém (PA). Inclui viveiros comunitários, monitoramento por satélite e relatórios trimestrais.',
    goal_amount: 500_000,
    current_amount: 125_000,
    image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
    status: 'active',
    start_date: '2025-01-01',
    end_date: '2026-12-31',
  },
  {
    title: 'Mata Atlântica Viva',
    description: 'Restauração de corredores ecológicos no Vale do Ribeira (SP).',
    long_description:
      'A iniciativa planta 250 mil mudas ao longo de rios e áreas de APP, envolvendo agricultores familiares e capacitações em sistemas agroflorestais.',
    goal_amount: 320_000,
    current_amount: 64_500,
    image_url: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1200',
    status: 'active',
    start_date: '2024-09-15',
    end_date: '2025-09-15',
  },
  {
    title: 'Proteção dos Manguezais',
    description: 'Projeto de carbono azul em comunidades costeiras do Maranhão.',
    long_description:
      'Focado em conservar 3.500 hectares de manguezais, promovendo pesca sustentável, educação ambiental e monitoração da captura de carbono.',
    goal_amount: 210_000,
    current_amount: 35_000,
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
    status: 'active',
    start_date: '2024-11-01',
    end_date: '2026-05-01',
  },
];

async function ensureSiteSettings() {
  if (forceSeed) {
    const { error: deleteError } = await supabase
      .from('site_settings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) throw new Error(`Erro ao limpar site_settings: ${deleteError.message}`);
  }

  const { data, error } = await supabase.from('site_settings').select('id').limit(1);
  if (error) throw new Error(`Erro ao verificar site_settings: ${error.message}`);

  if (data && data.length > 0) {
    console.log('ℹ️  site_settings já possui registro. Nenhuma inserção necessária.');
    return { inserted: false };
  }

  const { error: insertError } = await supabase.from('site_settings').insert(defaultSettings);
  if (insertError) throw new Error(`Erro ao inserir site_settings: ${insertError.message}`);

  console.log('✅ site_settings populado com dados padrão.');
  return { inserted: true };
}

async function ensureDonationProjects() {
  if (forceSeed) {
    const { error: deleteError } = await supabase
      .from('donation_projects')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) throw new Error(`Erro ao limpar donation_projects: ${deleteError.message}`);
  }

  const { data, error } = await supabase.from('donation_projects').select('id, title');
  if (error) throw new Error(`Erro ao verificar donation_projects: ${error.message}`);

  if (data && data.length > 0) {
    console.log(`ℹ️  donation_projects já possui ${data.length} registro(s). Nenhuma inserção realizada.`);
    return { inserted: 0, projects: data };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('donation_projects')
    .insert(donationProjectSeeds)
    .select('id, title');

  if (insertError) throw new Error(`Erro ao inserir donation_projects: ${insertError.message}`);

  console.log(`✅ ${inserted.length} projetos de doação inseridos.`);
  return { inserted: inserted.length, projects: inserted };
}

async function ensureDonationCertificates(projects) {
  if (forceSeed) {
    const { error: deleteError } = await supabase
      .from('donation_certificates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) throw new Error(`Erro ao limpar donation_certificates: ${deleteError.message}`);
  }

  if (!projects || projects.length === 0) {
    console.log('⚠️  Nenhum projeto de doação disponível para gerar certificados.');
    return { inserted: 0 };
  }

  const { data, error } = await supabase
    .from('donation_certificates')
    .select('id')
    .limit(1);
  if (error) throw new Error(`Erro ao verificar donation_certificates: ${error.message}`);

  if (data && data.length > 0) {
    console.log('ℹ️  donation_certificates já possui registros. Nenhum certificado seed criado.');
    return { inserted: 0 };
  }

  const today = new Date().toISOString().slice(0, 10);
  const certificateSeed = [
    {
      donation_project_id: projects[0].id,
      donor_name: 'João Silva',
      donor_email: 'joao@example.com',
      donor_cpf: '123.456.789-00',
      donation_amount: 500,
      donation_date: today,
      message: 'Contribuindo para um futuro mais verde!',
      status: 'active',
      is_anonymous: false,
    },
  ];

  const { data: inserted, error: insertError } = await supabase
    .from('donation_certificates')
    .insert(certificateSeed)
    .select('id');

  if (insertError) throw new Error(`Erro ao inserir donation_certificates: ${insertError.message}`);

  console.log('✅ Certificado de doação de exemplo criado.');
  return { inserted: inserted.length };
}

async function main() {
  console.log('🌱 Iniciando seed do Supabase...\n');

  try {
    const siteSettingsResult = await ensureSiteSettings();
    const donationProjectsResult = await ensureDonationProjects();
    const certificateResult = await ensureDonationCertificates(donationProjectsResult.projects);

    console.log('\n📋 Resumo do seed:');
    console.log(` • site_settings: ${siteSettingsResult.inserted ? 'inserido' : 'já existia'}`);
    console.log(` • donation_projects: ${donationProjectsResult.inserted ?? 0} inserido(s)`);
    console.log(` • donation_certificates: ${certificateResult.inserted ?? 0} inserido(s)\n`);

    console.log(`✨ Seed concluído com sucesso${forceSeed ? ' (modo force)' : ''}.`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Falha ao executar seed:');
    console.error(error);
    process.exit(1);
  }
}

main();
