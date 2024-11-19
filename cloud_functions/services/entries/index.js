const { createClient } = require('@supabase/supabase-js');
const { PDFDocument } = require('pdf-lib');
const { uploadFileToGCS } = require("../gcs");
const { Storage } = require('@google-cloud/storage');
const { OpenAI } = require("openai");

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const storage = new Storage();

exports.createEntry = async ({ notebook_id, id, title, date, file_url }) => {
    try {
        // Download file from GCS
        const fileData = await downloadFileFromGCS(file_url);

        // Load the PDF document
        const pdfDoc = await PDFDocument.load(fileData);
        const page_count = pdfDoc.getPageCount();

        // Prepare metadata for GCS upload
        const metadata = {
            fileName: `${id}.pdf`,
            fileMimeType: 'application/pdf',
            customMetadata: {
                notebook_id,
                entry_id: id
            }
        };

        // Upload the file to the desired GCS bucket (if needed)
        const publicUrl = await uploadFileToGCS(fileData, metadata, "entries-to-be-processed", `notebooks/${notebook_id}/${id}`);

        // Check for existing entries with the same date
        let adjustedDate = new Date(date);
        let isDuplicateDate = true;

        while (isDuplicateDate) {
            const { data: existingEntries, error: fetchError } = await supabase
                .from('entries')
                .select('id')
                .eq('notebook_id', notebook_id)
                .eq('created_at', adjustedDate.toISOString());

            if (fetchError) {
                throw fetchError;
            }

            if (existingEntries.length > 0) {
                // If an entry exists with the same date, add one minute
                adjustedDate = new Date(adjustedDate.getTime() + 60000);
            } else {
                isDuplicateDate = false;
            }
        }

        const { data, error } = await supabase
            .from('entries')
            .insert([
                {
                    id,
                    title,
                    created_at: adjustedDate.toISOString(),
                    notebook_id,
                    page_count,
                    url: publicUrl
                }
            ])
            .select();

        if (error) {
            throw error;
        }

        return data[0];
    } catch (error) {
        console.error('Error creating entry:', error);
        throw error;
    }
};

// Helper function to download file from GCS
async function downloadFileFromGCS(fileUrl) {
    try {
        // Extract bucket name and file path from the GCS URL
        const match = fileUrl.match(/https:\/\/storage.googleapis.com\/([^\/]+)\/(.+)/);
        if (!match) {
            throw new Error('Invalid GCS URL');
        }
        const bucketName = match[1];
        const filePath = match[2];

        const file = storage.bucket(bucketName).file(filePath);
        const [exists] = await file.exists();

        if (!exists) {
            throw new Error('File does not exist in GCS');
        }

        // Download the file into a buffer
        const [data] = await file.download();
        return data;
    } catch (error) {
        console.error('Error downloading file from GCS:', error);
        throw error;
    }
}

exports.createMultipleEntries = async ({ notebook_id, base_file_url, entries }) => {
    console.log("Creating multiple entries:", entries);

    try {
        // Download base PDF file from GCS
        const baseFileData = await downloadFileFromGCS(base_file_url);

        // Load the base PDF document
        const basePdf = await PDFDocument.load(baseFileData);

        // Map to keep track of used created_at dates
        const usedDates = new Set();

        // Adjust 'created_at' dates to ensure uniqueness
        for (let i = 0; i < entries.length; i++) {
            let entrySelection = entries[i];
            let entry = entrySelection.entry;
            let createdAtDate = new Date(entry.created_at);
            let dateString = createdAtDate.toISOString();

            // If date string is already used, adjust by adding 1 minute
            while (usedDates.has(dateString)) {
                createdAtDate = new Date(createdAtDate.getTime() + 60000); // Add 1 minute
                dateString = createdAtDate.toISOString();
            }

            // Set the adjusted date in the entry
            entry.created_at = dateString;

            // Add to used dates
            usedDates.add(dateString);

            // Save back the adjusted entry
            entrySelection.entry = entry;
            entries[i] = entrySelection;
        }

        // Process entries in parallel
        const createEntryPromises = entries.map(async (entrySelection) => {
            const { start_page, end_page, entry } = entrySelection;
            const { id, title, created_at } = entry;

            // Extract pages from base PDF
            const extractedPdf = await PDFDocument.create();

            // Adjust for zero-based index
            const startPageIndex = start_page - 1;
            const endPageIndex = end_page - 1;

            // Copy pages from base PDF
            const copiedPages = await extractedPdf.copyPages(basePdf, Array.from({ length: endPageIndex - startPageIndex + 1 }, (_, i) => i + startPageIndex));

            copiedPages.forEach((page) => extractedPdf.addPage(page));

            const pdfBytes = await extractedPdf.save();
            const page_count = copiedPages.length;

            // Prepare metadata for GCS upload
            const metadata = {
                fileName: `${id}.pdf`,
                fileMimeType: 'application/pdf',
                customMetadata: {
                    notebook_id,
                    entry_id: id
                }
            };

            // Upload file to GCS
            const publicUrl = await uploadFileToGCS(pdfBytes, metadata, "entries-to-be-processed", `notebooks/${notebook_id}/${id}`);

            // Insert entry into the database
            const { data, error } = await supabase
                .from('entries')
                .insert({
                    id,
                    title,
                    created_at,
                    notebook_id,
                    page_count,
                    url: publicUrl
                })
                .select();

            if (error) {
                throw error;
            }

            return data[0];
        });

        // Wait for all entries to be created
        const createdEntries = await Promise.all(createEntryPromises);

        console.log('All entries created successfully:', createdEntries);

        return createdEntries;

    } catch (error) {
        console.error('Error creating multiple entries:', error);
        throw error;
    }
};

exports.deleteEntry = async (id) => {
    console.log("Deleting entry:", id);

    try {
        // Delete the entry from the database
        const { data, error } = await supabase
            .from('entries')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        console.log("Entry deleted successfully:", id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting entry:', error);
        return { success: false, message: error.message };
    }
};

exports.createEntryTextChunks = async ({ id, textChunks }) => {
    try {

        const embeddedChunks = await Promise.all(
            textChunks.map(async chunk => {
                const embeddingResponse = await openaiClient.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: chunk.text
                });

                const embedding = embeddingResponse.data[0].embedding;

                return {
                    content: chunk.text,
                    entry_id: id,
                    embedding: embedding,
                    page: chunk.page
                };
            })
        );

        const { data, error } = await supabase
            .from('entry_chunks')
            .insert(embeddedChunks)
            .select();

        if (error) {
            throw error;
        }

        console.log("Entry text chunks created successfully:", data);

        return data;
    } catch (error) {
        console.error('Error creating entry text chunks:', error);
        throw error;
    }
}