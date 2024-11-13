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
functions.http('uploadSingleEntry', (req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        // Ensure the rawBody is available
        if (!req.rawBody) {
            return res.status(400).send('Expected req.rawBody to be a Buffer');
        }

        const busboy = Busboy({ headers: req.headers });
        const fields = {};
        let fileData = null;
        let fileName = null;
        let fileMimeType = null;

        busboy.on('file', (fieldname, file, info) => {
            const { filename, encoding, mimeType } = info;
            fileName = filename;
            fileMimeType = mimeType;

            const buffers = [];
            file.on('data', (data) => {
                buffers.push(data);
            });
            file.on('end', () => {
                fileData = Buffer.concat(buffers);
            });
        });

        busboy.on('field', (fieldname, val) => {
            fields[fieldname] = val;
        });

        busboy.on('finish', async () => {
            const { notebook_id, id, title, date } = fields;

            if (!fileData) {
                return res.status(400).json({ message: 'File is required' });
            }

            if (!notebook_id || !id || !title || !date) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            if (!fileName) {
                console.error('No filename provided, using default filename.');
                fileName = 'uploaded-file';
            }

            try {
                const entry = await createEntry({
                    notebook_id,
                    id,
                    title,
                    date,
                    fileData,
                    fileName,
                    fileMimeType
                });

                res.status(200).json(entry);
            } catch (error) {
                console.error('Error creating entry:', error);
                res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });

        busboy.on('error', (error) => {
            console.error('Error parsing form data:', error);
            res.status(500).json({ message: 'Error parsing form data', error: error.message });
        });

        // Create a stream from rawBody and pipe it to Busboy
        const bufferStream = new PassThrough();
        bufferStream.end(req.rawBody);
        bufferStream.pipe(busboy);
    });
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
        const { record } = await req.body;
        const { id: entryId, notebook_id } = record;

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
