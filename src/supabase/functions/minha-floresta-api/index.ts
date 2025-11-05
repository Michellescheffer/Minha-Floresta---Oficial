import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    
    console.log(`${method} ${path}`);

    // Helper function to get KV data
    const getKVData = async (key: string) => {
      const { data, error } = await supabaseClient
        .from('kv_store_minha_floresta')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is ok
        console.error('Error getting KV data:', error);
        throw error;
      }
      
      return data?.value;
    };

    // Helper function to set KV data
    const setKVData = async (key: string, value: any) => {
      const { error } = await supabaseClient
        .from('kv_store_minha_floresta')
        .upsert({ key, value });
      
      if (error) {
        console.error('Error setting KV data:', error);
        throw error;
      }
    };

    // Helper function to get data by prefix
    const getKVByPrefix = async (prefix: string) => {
      const { data, error } = await supabaseClient
        .from('kv_store_minha_floresta')
        .select('key, value')
        .like('key', `${prefix}%`);
      
      if (error) {
        console.error('Error getting KV data by prefix:', error);
        throw error;
      }
      
      return data?.map(d => d.value) ?? [];
    };

    // Helper function to delete KV data
    const deleteKVData = async (key: string) => {
      const { error } = await supabaseClient
        .from('kv_store_minha_floresta')
        .delete()
        .eq('key', key);
      
      if (error) {
        console.error('Error deleting KV data:', error);
        throw error;
      }
    };

    // Root endpoint - redirect to status
    if (path === '/' && method === 'GET') {
      return new Response(
        JSON.stringify({
          message: 'Minha Floresta API',
          status: 'operational',
          version: '1.0.0',
          endpoints: [
            'GET /status',
            'GET /health', 
            'GET /projects',
            'POST /projects',
            'GET /projects/:id',
            'PUT /projects/:id',
            'DELETE /projects/:id',
            'GET /social-projects',
            'POST /social-projects',
            'GET /admin/projects',
            'POST /initialize'
          ]
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Status endpoint
    if (path === '/status' && method === 'GET') {
      return new Response(
        JSON.stringify({
          status: 'operational',
          connected: true,
          timestamp: new Date().toISOString(),
          database: 'connected',
          version: '1.0.0'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Health check
    if (path === '/health' && method === 'GET') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Projects endpoints
    if (path === '/projects' && method === 'GET') {
      const projects = await getKVByPrefix('project_');
      return new Response(
        JSON.stringify({
          success: true,
          data: projects,
          count: projects.length
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (path === '/projects' && method === 'POST') {
      const body = await req.json();
      const id = crypto.randomUUID();
      
      const projectWithMeta = {
        ...body,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await setKVData(`project_${id}`, projectWithMeta);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: projectWithMeta
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Project by ID
    if (path.match(/^\/projects\/[a-zA-Z0-9-]+$/) && method === 'GET') {
      const id = path.split('/')[2];
      const project = await getKVData(`project_${id}`);
      
      if (!project) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Project not found' 
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          data: project
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update project
    if (path.match(/^\/projects\/[a-zA-Z0-9-]+$/) && method === 'PUT') {
      const id = path.split('/')[2];
      const updates = await req.json();
      const existing = await getKVData(`project_${id}`);
      
      if (!existing) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Project not found' 
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const updatedProject = {
        ...existing,
        ...updates,
        id,
        created_at: existing.created_at,
        updated_at: new Date().toISOString()
      };
      
      await setKVData(`project_${id}`, updatedProject);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: updatedProject
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Delete project
    if (path.match(/^\/projects\/[a-zA-Z0-9-]+$/) && method === 'DELETE') {
      const id = path.split('/')[2];
      const existing = await getKVData(`project_${id}`);
      
      if (!existing) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Project not found' 
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      await deleteKVData(`project_${id}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Project deleted successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Social projects endpoints
    if (path === '/social-projects' && method === 'GET') {
      const socialProjects = await getKVByPrefix('social_project_');
      return new Response(
        JSON.stringify({
          success: true,
          data: socialProjects,
          count: socialProjects.length
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (path === '/social-projects' && method === 'POST') {
      const body = await req.json();
      const id = crypto.randomUUID();
      
      const projectWithMeta = {
        ...body,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await setKVData(`social_project_${id}`, projectWithMeta);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: projectWithMeta
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize data endpoint
    if (path === '/initialize' && method === 'POST') {
      console.log('Initializing sample data...');
      
      const projects = await getKVByPrefix('project_');
      
      if (projects.length === 0) {
        console.log('Creating sample projects...');
        
        const sampleProjects = [
          {
            id: crypto.randomUUID(),
            name: 'Amazônia Verde',
            description: 'Reflorestamento da Amazônia com espécies nativas para preservação da biodiversidade e sequestro de carbono.',
            location: 'Amazônia, Brasil',
            price: 25.00,
            available: 10000,
            sold: 2500,
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=60',
            type: 'reforestation',
            status: 'active',
            co2_per_m2: 8.5,
            trees_per_m2: 0.8,
            biome: 'amazonia',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            name: 'Mata Atlântica Viva',
            description: 'Restauração da Mata Atlântica com foco em corredores ecológicos e recuperação de nascentes.',
            location: 'São Paulo, Brasil',
            price: 30.00,
            available: 5000,
            sold: 1200,
            image: 'https://images.unsplash.com/photo-1574263867128-ca4c7707e1c8?w=800&auto=format&fit=crop&q=60',
            type: 'restoration',
            status: 'active',
            co2_per_m2: 12.2,
            trees_per_m2: 1.2,
            biome: 'mata_atlantica',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            name: 'Cerrado Sustentável',
            description: 'Conservação e restauração do Cerrado brasileiro, protegendo nascentes e biodiversidade única.',
            location: 'Minas Gerais, Brasil',
            price: 18.00,
            available: 8000,
            sold: 1800,
            image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=60',
            type: 'conservation',
            status: 'active',
            co2_per_m2: 6.8,
            trees_per_m2: 0.6,
            biome: 'cerrado',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        for (const project of sampleProjects) {
          await setKVData(`project_${project.id}`, project);
          console.log(`Created project: ${project.name}`);
        }
        
        console.log(`Successfully created ${sampleProjects.length} sample projects`);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Data initialized successfully',
          projects_created: projects.length === 0 ? 3 : 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Admin endpoints
    if (path === '/admin/projects' && method === 'GET') {
      const projects = await getKVByPrefix('project_');
      const donations = await getKVByPrefix('donation_');
      const certificates = await getKVByPrefix('certificate_');
      
      return new Response(
        JSON.stringify({
          projects,
          donations,
          certificates,
          stats: {
            totalProjects: projects.length,
            totalDonations: donations.length,
            totalCertificates: certificates.length
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Cart endpoints
    if (path.match(/^\/cart\/[a-zA-Z0-9-]+$/) && method === 'GET') {
      const userId = path.split('/')[2];
      const cart = await getKVData(`cart_${userId}`);
      
      return new Response(
        JSON.stringify({
          cart: cart || { items: [] }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (path.match(/^\/cart\/[a-zA-Z0-9-]+$/) && method === 'POST') {
      const userId = path.split('/')[2];
      const cart = await req.json();
      await setKVData(`cart_${userId}`, cart);
      
      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Default 404 response
    return new Response(
      JSON.stringify({
        error: 'Endpoint not found',
        path: path,
        method: method,
        available_endpoints: [
          'GET /',
          'GET /status',
          'GET /health',
          'GET /projects',
          'POST /projects',
          'GET /projects/:id',
          'PUT /projects/:id',
          'DELETE /projects/:id',
          'GET /social-projects',
          'POST /social-projects',
          'GET /admin/projects',
          'POST /initialize'
        ]
      }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});