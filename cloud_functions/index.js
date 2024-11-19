const functions = require("@google-cloud/functions-framework");
const { extractTextFromFile, extractTextChunks, uploadEntryToGCS } = require("./services/ocr");
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const { PassThrough } = require('stream');
const { createEntry } = require("./services/entries");
const { createClient } = require('@supabase/supabase-js');
const { PDFDocument } = require('pdf-lib');
const { uploadFileToGCS } = require("./services/gcs");
const { createEntryTextChunks } = require("./services/entries");
const { Storage } = require('@google-cloud/storage');
const { deleteEntry } = require("./services/entries");
const { createMultipleEntries } = require("./services/entries");

const storage = new Storage();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/*
gcloud functions deploy upload-single-entry \
--gen2 \
--env-vars-file=env.yaml \
--runtime=nodejs20 \
--region=us-west1 \
--source=. \
--entry-point=uploadSingleEntry \
--trigger-http \
--allow-unauthenticated
 */
functions.http('uploadSingleEntry', async (req, res) => {
    // Set CORS headers for all responses
    res.set('Access-Control-Allow-Origin', '*'); // Or specify allowed origin
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        // Handle preflight OPTIONS request
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // Ensure Content-Type is application/json
    if (!req.is('application/json')) {
        res.status(400).send('Expected application/json content type');
        return;
    }

    const { notebook_id, id, title, date, file_url } = req.body;

    if (!file_url || !notebook_id || !id || !title || !date) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const entry = await createEntry({
            notebook_id,
            id,
            title,
            date,
            file_url
        });

        res.status(200).json(entry);
    } catch (error) {
        console.error('Error creating entry:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


/*
gcloud functions deploy upload-multiple-entries \
--gen2 \
--env-vars-file=env.yaml \
--runtime=nodejs20 \
--region=us-west1 \
--source=. \
--entry-point=uploadMultipleEntries \
--trigger-http \
--allow-unauthenticated
 */
functions.http('uploadMultipleEntries', async (req, res) => {
    // Set CORS headers for all responses
    res.set('Access-Control-Allow-Origin', '*'); // Or specify allowed origin
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        // Handle preflight OPTIONS request
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // Ensure Content-Type is application/json
    if (!req.is('application/json')) {
        res.status(400).send('Expected application/json content type');
        return;
    }

    const { notebook_id, entries, base_file_url } = req.body;

    if (!base_file_url || !notebook_id || !entries) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    let parsedEntries;
    try {
        parsedEntries = JSON.parse(entries);
        if (!Array.isArray(parsedEntries) || parsedEntries.length === 0) {
            return res.status(400).json({ message: 'Invalid entries data' });
        }
    } catch (error) {
        return res.status(400).json({ message: 'Entries must be a valid JSON array' });
    }

    try {
        const createdEntries = await createMultipleEntries({
            notebook_id,
            base_file_url: base_file_url,
            entries: parsedEntries
        });

        res.status(200).json({ message: 'Entries created successfully', data: createdEntries });
    } catch (error) {
        console.error('Error creating multiple entries:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


/*
gcloud functions deploy delete-entry \
--gen2 \
--env-vars-file=env.yaml \
--runtime=nodejs20 \
--region=us-west1 \
--source=. \
--entry-point=deleteEntry \
--trigger-http \
--allow-unauthenticated
 */
functions.http('deleteEntry', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).send('');
    }

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const response = await deleteEntry(id);

        if (response.success) {
            res.status(200).json({ success: true, message: 'Entry deleted successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to delete entry', error: response.message });
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});

/*
gcloud functions deploy extract-text-from-file \
--gen2 \
--runtime=nodejs20 \
--env-vars-file=env.yaml \
--region=us-west1 \
--source=. \
--entry-point=extractTextFromFile \
--memory=1GiB \
--trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
--trigger-event-filters="bucket=entries-to-be-processed"
 */
functions.cloudEvent('extractTextFromFile', async cloudEvent => {
    console.log(`Event ID: ${cloudEvent.id}`);
    console.log(`Event Type: ${cloudEvent.type}`);

    const file = cloudEvent.data;

    console.log(`Bucket: ${file.bucket}`);
    console.log(`File: ${file.name}`);
    console.log(`Metageneration: ${file.metageneration}`);
    console.log(`Created: ${file.timeCreated}`);
    console.log(`Updated: ${file.updated}`);

    const success = await extractTextFromFile(file.name);

    if (!success) {
        console.error(`Failed to extract text from file: ${file.name}`);
    } else {
        console.log(`Successfully extracted text from file: ${file.name}`);
    }

});

/*
gcloud functions deploy extract-text-chunks \
--gen2 \
--runtime=nodejs20 \
--region=us-west1 \
--env-vars-file=env.yaml \
--source=. \
--entry-point=extractTextChunks \
--trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
--trigger-event-filters="bucket=processed-entries"
 */
functions.cloudEvent('extractTextChunks', async cloudEvent => {
    console.log(`Event ID: ${cloudEvent.id}`);
    console.log(`Event Type: ${cloudEvent.type}`);

    const file = cloudEvent.data;
    const bucketName = file.bucket;
    const fileName = file.name;

    console.log(`Bucket: ${bucketName}`);
    console.log(`File: ${fileName}`);
    console.log(`Metageneration: ${file.metageneration}`);
    console.log(`Created: ${file.timeCreated}`);
    console.log(`Updated: ${file.updated}`);

    const entryId = fileName.split('/')[2];

    const chunks = await extractTextChunks(file);

    const textChunks = await createEntryTextChunks({
        id: entryId,
        textChunks: chunks
    });

    console.log("Text Chunks:", textChunks);
});


/*
gcloud functions deploy generate-preview-file \
--gen2 \
--runtime=nodejs20 \
--env-vars-file=env.yaml \
--source=. \
--region=us-west1 \
--entry-point=generatePreviewFile \
--trigger-http \
--allow-unauthenticated
 */
functions.http('generatePreviewFile', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } else {
        console.log(req.body);
        const { type, record, old_record } = await req.body;
        // const { id: entryId, notebook_id } = record;

        let entryId;
        let notebook_id;

        if (type === "DELETE") {
            entryId = old_record.id;
            notebook_id = old_record.notebook_id;
        } else {
            entryId = record.id;
            notebook_id = record.notebook_id;
        }

        console.log(`Generating preview for entry ${entryId} in notebook ${notebook_id}`);

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
            const metadata = {
                fileName: 'preview.pdf',
                fileMimeType: 'application/pdf',
                customMetadata: {
                    notebook_id
                }
            };

            const publicUrl = await uploadFileToGCS(mergedPdfBytes, metadata, "eta-ruby-notebooks", `${notebook_id}`);

            console.log(`File uploaded to GCS with public URL: ${publicUrl}`);

            // // remove row from preview queue
            // const { error: deleteError } = await supabase
            //     .from('preview_queue')
            //     .delete()
            //     .eq('notebook_id', notebook_id);

            // if (deleteError) {
            //     console.error(deleteError);
            //     throw new Error(deleteError.message);
            // }
        } catch (error) {
            console.error(error)
        }

    }
});
