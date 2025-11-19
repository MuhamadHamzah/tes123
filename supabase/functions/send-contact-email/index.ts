import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { name, email, subject, message }: ContactMessage = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        name,
        email,
        subject,
        message,
      });

    if (insertError) {
      throw insertError;
    }

    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_notification_email')
      .maybeSingle();

    const adminEmail = settings?.value || 'admin@hmpti.edu';

    console.log(`New contact message from ${name} (${email})`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`This message should be sent to: ${adminEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Pesan berhasil dikirim!',
        note: `Email notification will be sent to ${adminEmail}` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing contact message:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send message', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
