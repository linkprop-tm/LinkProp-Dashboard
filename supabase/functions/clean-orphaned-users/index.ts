import { createClient } from 'npm:@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: adminUser, error: adminCheckError } = await supabaseClient
      .from('usuarios')
      .select('rol')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (adminCheckError || !adminUser || adminUser.rol !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (authUsersError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch auth users', 
          details: authUsersError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: dbUsers, error: dbUsersError } = await supabaseClient
      .from('usuarios')
      .select('auth_id');

    if (dbUsersError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch database users', 
          details: dbUsersError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const dbAuthIds = new Set(dbUsers.map(u => u.auth_id));
    const orphanedUsers = authUsers.users.filter(authUser => !dbAuthIds.has(authUser.id));

    const url = new URL(req.url);
    const shouldDelete = url.searchParams.get('delete') === 'true';

    if (shouldDelete && orphanedUsers.length > 0) {
      const deletionResults = [];
      for (const orphan of orphanedUsers) {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(orphan.id);
        deletionResults.push({
          id: orphan.id,
          email: orphan.email,
          success: !deleteError,
          error: deleteError?.message || null,
        });
      }

      return new Response(
        JSON.stringify({ 
          message: 'Orphaned users deletion completed',
          totalOrphaned: orphanedUsers.length,
          deletionResults,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Orphaned users found',
        totalAuthUsers: authUsers.users.length,
        totalDbUsers: dbUsers.length,
        totalOrphaned: orphanedUsers.length,
        orphanedUsers: orphanedUsers.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
        })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});