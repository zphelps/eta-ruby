// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@^1.11.1?dts';
import OpenAI from "https://esm.sh/openai@4";

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {record} = await req.json();
    const {id: entryId, notebook_id, queue, text} = record;

    console.log("FUNCTION FOR ENTRY ID:", entryId);
    console.log("ENTRY ID:", entryId, "NOTEBOOK_ID", notebook_id, "QUEUE", queue);

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: {Authorization: req.headers.get('Authorization')!},
          },
        }
    )

    // // Function to check if current entry's queue value is the smallest
    // const isCurrentQueueSmallest = async () => {
    //   const { data, error } = await supabase
    //       .from('entries')
    //       .select('queue')
    //       .eq('notebook_id', notebook_id)
    //       .order('queue', { ascending: true })
    //       .limit(1);
    //
    //   if (error) {
    //     throw new Error(error.message);
    //   }
    //
    //   console.log("CURRENT QUEUE VALUE", data?.[0]?.queue);
    //   console.log("ENTRY QUEUE VALUE", queue);
    //
    //   // Check if the smallest queue value is equal to the current entry's queue
    //   return data?.[0]?.queue === queue;
    // };
    //
    // // Polling function
    // const waitForQueue = async (interval: number = 1000, maxAttempts: number = 100) => {
    //   let attempts = 0;
    //
    //   while (attempts < maxAttempts) {
    //     const isSmallest = await isCurrentQueueSmallest();
    //     if (isSmallest) {
    //       console.log(`Queue value for entry_id ${entryId} is the smallest`);
    //       return true;
    //     }
    //
    //     console.log(`Queue value for entry_id ${entryId} is not the smallest, retrying...`);
    //     attempts++;
    //     await new Promise((resolve) => setTimeout(resolve, interval)); // Wait for the specified interval
    //   }
    //
    //   throw new Error('Max attempts reached, queue value did not become the smallest');
    // };
    //
    // // Wait until the current entry's queue value is the smallest
    // await waitForQueue();
    //
    // console.log("MODIFYING PDF FOR -> ", "ENTRY ID:", entryId, "NOTEBOOK_ID", notebook_id);
    //
    // // get new entry file from storage
    // const {data: newEntryData, error: newEntryDownloadError} = await supabase
    //     .storage
    //     .from("entries")
    //     .download(`${notebook_id}/${entryId}.pdf?buster=${new Date().getTime()}`);
    // if (newEntryDownloadError) {
    //     console.error("ERROR GETTING ENTRY FILE", newEntryDownloadError);
    //     throw new Error(newEntryDownloadError.message);
    // }
    //
    // const buffer = await newEntryData?.arrayBuffer();
    // const newEntryDoc = await PDFDocument.load(buffer);
    //
    // // check if preview exists
    // const { data, error } = await supabase
    //     .storage
    //     .from("notebooks")
    //     .list(notebook_id, { search: "preview" });
    // const preview_exists= data ? data.length > 0 : false;
    //
    // let existingPreviewDoc;
    //
    // if (preview_exists) {
    //   const {data: previewData, error: previewDownloadError} = await supabase
    //       .storage
    //       .from("notebooks")
    //       .download(`${notebook_id}/preview.pdf?buster=${new Date().getTime()}`);
    //   if (previewDownloadError) {
    //     console.error(previewDownloadError);
    //     throw new Error(previewDownloadError.message);
    //   }
    //   const buffer = await previewData?.arrayBuffer();
    //   existingPreviewDoc = await PDFDocument.load(buffer);
    // } else {
    //   existingPreviewDoc = await PDFDocument.create();
    // }
    //
    // // merge the new entry with the existing preview
    // const mergedPDF: PDFDocument = await PDFDocument.create();
    //
    // for (const pdf of [existingPreviewDoc, newEntryDoc]) {
    //   const copiedPages = await mergedPDF.copyPages(pdf, pdf.getPageIndices());
    //   copiedPages.forEach((page) => mergedPDF.addPage(page));
    // }
    //
    // // upload the new preview
    // const pdfBytes = await mergedPDF.save();
    //
    // const { error: previewUploadError } = await supabase.storage.from("notebooks").upload(
    //     `${notebook_id}/preview.pdf`,
    //     pdfBytes,
    //     { contentType: 'application/pdf', upsert: true }
    // );
    //
    // if (previewUploadError) {
    //   console.error(previewUploadError);
    //   throw new Error(previewUploadError.message);
    // }

    if (text) {
      // generate embedding for the new entry
      const openai = new OpenAI({
        apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
      });

      const result = await openai.embeddings.create({
        input: text,
        model: "text-embedding-3-small",
      });

      const [{ embedding }] = result.data;

      const {error: updateEntryError} = await supabase
          .from('entries')
          .update({ embedding })
          .eq('id', entryId);

      if (updateEntryError) {
        console.error(updateEntryError);
        throw new Error(updateEntryError.message);
      }
    }

    // // update the entry queue value to be null
    // const {error: updateEntryError} = await supabase
    //     .from('entries')
    //     .update({ queue: null })
    //     .eq('id', entryId);
    //
    // if (updateEntryError) {
    //     console.error(updateEntryError);
    //     throw new Error(updateEntryError.message);
    // }
    //
    // console.log("ENTRY ID:", entryId, "UPDATED");

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
