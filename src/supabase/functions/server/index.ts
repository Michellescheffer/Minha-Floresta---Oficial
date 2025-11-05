import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface RequestData {
  method: string;
  path: string;
  body?: any;
}

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
    
    // Route prefix for all endpoints
    const routePrefix = '/make-server-1328d8b4';
    
    // Remove the prefix from the path for routing
    const cleanPath = path.replace(routePrefix, '');

    // Helper function to get KV data
    const getKVData = async (key: string) => {
      const { data, error } = await supabaseClient
        .from('kv_store_1328d8b4')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      
      if (error) throw error;
      return data?.value;
    };

    // Helper function to set KV data
    const setKVData = async (key: string, value: any) => {
      const { error } = await supabaseClient
        .from('kv_store_1328d8b4')
        .upsert({ key, value });
      
      if (error) throw error;
    };

    // Helper function to get data by prefix
    const getKVByPrefix = async (prefix: string) => {
      const { data, error } = await supabaseClient
        .from('kv_store_1328d8b4')
        .select('key, value')
        .like('key', `${prefix}%`);
      
      if (error) throw error;
      return data?.map(d => d.value) ?? [];
    };

    // Helper function to delete KV data
    const deleteKVData = async (key: string) => {
      const { error } = await supabaseClient
        .from('kv_store_1328d8b4')
        .delete()
        .eq('key', key);
      
      if (error) throw error;
    };

    // Status endpoint
    if (cleanPath === '/status' && method === 'GET') {
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
    if (cleanPath === '/health' && method === 'GET') {
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
    if (cleanPath === '/projects' && method === 'GET') {
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

    if (cleanPath === '/projects' && method === 'POST') {
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
    if (cleanPath.match(/^\/projects\/[a-zA-Z0-9-]+$/) && method === 'GET') {
      const id = cleanPath.split('/')[2];
      const project = await getKVData(`project_${id}`);
      
      if (!project) {
        return new Response(
          JSON.stringify({ error: 'Project not found' }),
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
    if (cleanPath.match(/^\/projects\/[a-zA-Z0-9-]+$/) && method === 'PUT') {
      const id = cleanPath.split('/')[2];
      const updates = await req.json();
      const existing = await getKVData(`project_${id}`);
      
      if (!existing) {
        return new Response(
          JSON.stringify({ error: 'Project not found' }),
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
    if (cleanPath.match(/^\/projects\/[a-zA-Z0-9-]+$/) && method === 'DELETE') {
      const id = cleanPath.split('/')[2];
      const existing = await getKVData(`project_${id}`);
      
      if (!existing) {
        return new Response(
          JSON.stringify({ error: 'Project not found' }),
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
    if (cleanPath === '/social-projects' && method === 'GET') {
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

    if (cleanPath === '/social-projects' && method === 'POST') {
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

    // Initialize data
    if (cleanPath === '/initialize' && method === 'POST') {
      const projects = await getKVByPrefix('project_');
      
      if (projects.length === 0) {
        const sampleProjects = [
          {
            id: crypto.randomUUID(),
            name: 'Amazônia Verde',
            description: 'Reflorestamento da Amazônia com espécies nativas',
            location: 'Amazônia, Brasil',
            price: 25.00,
            available: 10000,
            sold: 2500,
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
            type: 'reforestation',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            name: 'Mata Atlântica Viva',
            description: 'Restauração da Mata Atlântica',
            location: 'São Paulo, Brasil',
            price: 30.00,
            available: 5000,
            sold: 1200,
            image: 'https://images.unsplash.com/photo-1574263867128-ca4c7707e1c8?w=800',
            type: 'restoration',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        for (const project of sampleProjects) {
          await setKVData(`project_${project.id}`, project);
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Data initialized'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Admin endpoints
    if (cleanPath === '/admin/projects' && method === 'GET') {
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
    if (cleanPath.match(/^\/cart\/[a-zA-Z0-9-]+$/) && method === 'GET') {
      const userId = cleanPath.split('/')[2];
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

    if (cleanPath.match(/^\/cart\/[a-zA-Z0-9-]+$/) && method === 'POST') {
      const userId = cleanPath.split('/')[2];
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
        path: cleanPath,
        method: method
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
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});