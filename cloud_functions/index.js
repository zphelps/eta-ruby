const functions = require('@google-cloud/functions-framework');
const {createClient} = require("@supabase/supabase-js");
const {PDFDocument} = require("pdf-lib");

// Register an HTTP function with the Functions Framework that will be executed
// when you make an HTTP request to the deployed function's endpoint.
functions.http('function-1', (req, res) => {
    res.send('Hello World!');


});

/*
gcloud functions deploy generate-preview \
--gen2 \
--runtime=nodejs20 \
--source=. \
--region=us-west1 \
--entry-point=generate-preview \
--trigger-http \
--allow-unauthenticated
 */
functions.http('generate-preview', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } else {
        console.log(req.body);
        const {record} = await req.body;
        const {id: entryId, notebook_id} = record;

        console.log(`Generating preview for entry ${entryId} in notebook ${notebook_id}`);

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        try {
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

            console.log("ENTRIES:", entries);

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
            const mergedPdf = await PDFDocument.create();

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

            // remove row from preview queue
            const { error: deleteError } = await supabase
                .from('preview_queue')
                .delete()
                .eq('notebook_id', notebook_id);

            if (deleteError) {
                console.error(deleteError);
                throw new Error(deleteError.message);
            }
        } catch (error) {
            console.error(error)
        }

    }
});

