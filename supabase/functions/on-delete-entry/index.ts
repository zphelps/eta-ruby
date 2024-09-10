// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import {corsHeaders} from "../_shared/cors.ts";
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@^1.11.1?dts';
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {record, old_record} = await req.json();
    const {id: entryId, notebook_id} = old_record;

    console.log("OLD RECORD:", record, "NEW RECORD:", old_record);
    console.log("ENTRY ID:", entryId, "NOTEBOOK_ID", notebook_id);

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: {Authorization: req.headers.get('Authorization')!},
          },
        }
    )

    const {data: previewData, error: previewDownloadError} = await supabase
        .storage
        .from("notebooks")
        .download(`${notebook_id}/preview.pdf?buster=${new Date().getTime()}`);
    if (previewDownloadError) {
      console.error(previewDownloadError);
      throw new Error(previewDownloadError.message);
    }
    const buffer = await previewData?.arrayBuffer();
    const existingPreviewPDF = await PDFDocument.load(buffer);

    // get entry from database
    const {data: entryData, error: entryError} = await supabase.from("entries").select("*").eq("id", entryId);

    if (entryError) {
      throw new Error(entryError.message);
    }

    const entryToRemove = entryData[0];

    // delete entry from storage
    const { error: previewDeleteError } = await supabase.storage.from("entries").remove([`${notebook_id}/${entryId}.pdf`]);

    if (previewDeleteError) {
      throw new Error(previewDeleteError.message);
    }

    // get indices to remove
    const {data, error} = await supabase
        .from("entries")
        .select("*")
        .eq("notebook_id", entryToRemove.notebook_id)
        .lte("created_at", entryToRemove.created_at)
        .order("created_at", {ascending: true});

    if (error) {
      throw new Error(error.message);
    }

    let start_index = 0;

    for (const entry of data) {
      start_index += entry.page_count;
    }

    const end_index = start_index + entryToRemove.page_count;

    const indices_to_remove = [];
    for (let i = start_index; i < end_index; i++) {
      indices.push(i);
    }


    // remove indices from existing preview
    let newPreviewPDF: PDFDocument = await PDFDocument.create();

    const indicesToCopy = existingPreviewPDF.getPageIndices().filter((index) => !indices_to_remove.includes(index));

    if (indicesToCopy.length === 0) {
      newPreviewPDF = null;
    } else {
      const copiedPages = await newPreviewPDF.copyPages(existingPreviewPDF, existingPreviewPDF.getPageIndices().filter((index) => !indices_to_remove.includes(index)));
      copiedPages.forEach((page) => newPreviewPDF.addPage(page));
    }

    if (newPreviewPDF === null) {
      await supabase.storage.from("notebooks").remove([`${notebook_id}/preview.pdf`]);
    } else {
        const pdfBytes = await newPreviewPDF.save();
        const { error: previewUploadError } = await supabase.storage.from("notebooks").upload(
            `${notebook_id}/preview.pdf`,
            pdfBytes,
            { contentType: 'application/pdf', upsert: true }
        );

        if (previewUploadError) {
            throw new Error(previewUploadError.message);
        }
    }

    return new Response(JSON.stringify(data), {
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/on-delete-entry' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
