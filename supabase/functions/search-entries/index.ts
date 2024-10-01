// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import OpenAI from 'npm:openai'
import {corsHeaders} from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Grab the user's query from the JSON payload
    const { query, tag, notebook_id } = await req.json()

    console.log('QUERY:', query, 'TAG:', tag)

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: {Authorization: req.headers.get('Authorization')!},
          },
        }
    )

    // Instantiate OpenAI client
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! })

    // Generate a one-time embedding for the user's query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      dimensions: 1536,
    })

    const [{ embedding }] = embeddingResponse.data

    console.log("NOTEBOOK_ID", notebook_id)

    // Call hybrid_search Postgres function via RPC
    const { data: documents } = await supabase.rpc('match_entries', {
      query_text: query,
      query_embedding: embedding,
      match_count: 10,
      notebook_id_filter: notebook_id,
    })

    console.log('DOCUMENTS:', documents)

    return new Response(JSON.stringify(documents), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.log(error)
    return new Response(error.message, { status: 500 })
  }


})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/search-entries' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
