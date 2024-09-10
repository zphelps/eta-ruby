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
    const {record, old_record} = await req.json();
    const {id: entryId, notebook_id, queue} = record;

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

    // Function to check if current entry's queue value is the smallest
    const isCurrentQueueSmallest = async () => {
      const { data, error } = await supabase
          .from('entries')
          .select('queue')
          .eq('notebook_id', notebook_id)
          .order('queue', { ascending: true })
          .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      // Check if the smallest queue value is equal to the current entry's queue
      return data?.[0]?.queue === queue;
    };

    // Polling function
    const waitForQueue = async (interval: number = 1000, maxAttempts: number = 100) => {
      let attempts = 0;

      while (attempts < maxAttempts) {
        const isSmallest = await isCurrentQueueSmallest();
        if (isSmallest) {
          return true;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, interval)); // Wait for the specified interval
      }

      throw new Error('Max attempts reached, queue value did not become the smallest');
    };

    // Wait until the current entry's queue value is the smallest
    await waitForQueue();

    // get new entry file from storage
    const {data: newEntryData, error: newEntryDownloadError} = await supabase
        .storage
        .from("entries")
        .download(`${notebook_id}/${entryId}.pdf?buster=${new Date().getTime()}`);
    if (newEntryDownloadError) {
        console.error("ERROR GETTING ENTRY FILE", newEntryDownloadError);
        throw new Error(newEntryDownloadError.message);
    }

    const buffer = await newEntryData?.arrayBuffer();
    const newEntryDoc = await PDFDocument.load(buffer);

    // check if preview exists
    const { data, error } = await supabase
        .storage
        .from("notebooks")
        .list(notebook_id, { search: "preview" });
    const preview_exists= data ? data.length > 0 : false;

    let existingPreviewDoc;

    if (preview_exists) {
      const {data: previewData, error: previewDownloadError} = await supabase
          .storage
          .from("notebooks")
          .download(`${notebook_id}/preview.pdf?buster=${new Date().getTime()}`);
      if (previewDownloadError) {
        console.error(previewDownloadError);
        throw new Error(previewDownloadError.message);
      }
      const buffer = await previewData?.arrayBuffer();
      existingPreviewDoc = await PDFDocument.load(buffer);
    } else {
      existingPreviewDoc = await PDFDocument.create();
    }

    // merge the new entry with the existing preview
    const mergedPDF: PDFDocument = await PDFDocument.create();

    for (const pdf of [existingPreviewDoc, newEntryDoc]) {
      const copiedPages = await mergedPDF.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPDF.addPage(page));
    }

    // upload the new preview
    const pdfBytes = await mergedPDF.save();

    const { error: previewUploadError } = await supabase.storage.from("notebooks").upload(
        `${notebook_id}/preview.pdf`,
        pdfBytes,
        { contentType: 'application/pdf', upsert: true }
    );

    if (previewUploadError) {
      console.error(previewUploadError);
      throw new Error(previewUploadError.message);
    }

    // update the entry queue value to be null
    const {error: updateEntryError} = await supabase
        .from('entries')
        .update({ queue: null })
        .eq('id', entryId);

    if (updateEntryError) {
        console.error(updateEntryError);
        throw new Error(updateEntryError.message);
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
