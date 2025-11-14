import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create site_images table
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    // Create certificate_images table
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS certificate_images (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          url TEXT NOT NULL,
          alt_text TEXT,
          display_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    // Create indexes
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_site_images_key ON site_images(key);
        CREATE INDEX IF NOT EXISTS idx_site_images_active ON site_images(is_active);
        CREATE INDEX IF NOT EXISTS idx_certificate_images_active ON certificate_images(is_active);
        CREATE INDEX IF NOT EXISTS idx_certificate_images_order ON certificate_images(display_order);
      `
    });

    // Enable RLS
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
        ALTER TABLE certificate_images ENABLE ROW LEVEL SECURITY;
      `
    });

    // Create policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow public read access to site_images" ON site_images;
        CREATE POLICY "Allow public read access to site_images" ON site_images
          FOR SELECT USING (is_active = true);

        DROP POLICY IF EXISTS "Allow public read access to certificate_images" ON certificate_images;
        CREATE POLICY "Allow public read access to certificate_images" ON certificate_images
          FOR SELECT USING (is_active = true);

        DROP POLICY IF EXISTS "Allow authenticated users to manage site_images" ON site_images;
        CREATE POLICY "Allow authenticated users to manage site_images" ON site_images
          FOR ALL USING (auth.role() = 'authenticated');

        DROP POLICY IF EXISTS "Allow authenticated users to manage certificate_images" ON certificate_images;
        CREATE POLICY "Allow authenticated users to manage certificate_images" ON certificate_images
          FOR ALL USING (auth.role() = 'authenticated');
      `
    });

    // Insert default images
    await supabase.from('site_images').upsert([
      {
        key: 'hero_primary',
        url: '/images/amazon-aerial-new.jpg',
        alt_text: 'Floresta Amazônica - Vista Aérea',
        display_order: 1
      },
      {
        key: 'hero_secondary',
        url: 'https://images.unsplash.com/photo-1653149875526-e2533c6af095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwYWVyaWFsJTIwdmlld3hlbnwxfHx8fDE3NTYxNjc0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
        alt_text: 'Floresta Amazônica - Vista Aérea 2',
        display_order: 2
      }
    ], { onConflict: 'key' });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Migration executada com sucesso!',
        errors: [error1, error2].filter(e => e !== null)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
