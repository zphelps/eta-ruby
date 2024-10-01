// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@^1.11.1?dts';

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {notebook_id} = await req.json();

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: {Authorization: req.headers.get('Authorization')!},
          },
        }
    )

    // get all entry urls in the notebook
    const { data: entries, error: entriesError } = await supabase
        .from('entries')
        .select('id, created_at, url')
        .eq('notebook_id', notebook_id)
        .order('created_at', { ascending: true });

    if (entriesError) {
      console.error(entriesError);
      throw new Error(entriesError.message);
    }

    const urls = entries.map((entry) => entry.url);

    console.log("URLS:", urls);

    // Fetch all PDFs in parallel and ensure results are in the same order
    const fetchPromises = urls.map((url) =>
        fetch(url).then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch the PDF from ${url}: ${response.statusText}`);
          }
          return response.arrayBuffer();
        })
    );

    // Wait for all fetches to complete and store in the original order
    const pdfBuffers = await Promise.all(fetchPromises);

    // Create a new PDFDocument
    const mergedPdf: PDFDocument = await PDFDocument.create();

    // Load and merge each PDF in the order of the original URLs
    for (const pdfBuffer of pdfBuffers) {
      const pdf = await PDFDocument.load(pdfBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Serialize the merged PDF to bytes
    const mergedPdfBytes = await mergedPdf.save();

    // Upload the merged PDF to the storage bucket
    const { error: uploadError } = await supabase.storage
        .from("notebooks")
        .upload(`${notebook_id}/preview.pdf`, mergedPdfBytes, {
          contentType: 'application/pdf',
          upsert: true,
        });

    if (uploadError) {
      console.error(uploadError);
      throw new Error(uploadError.message);
    }

    return new Response(JSON.stringify({success: "true"}), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
