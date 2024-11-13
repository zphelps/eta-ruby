const { createClient } = require('@supabase/supabase-js');
const { PDFDocument } = require('pdf-lib');
const { uploadFileToGCS } = require("../gcs");
const { OpenAI } = require("openai");

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.createEntry = async ({ notebook_id, id, title, date, fileData, fileName, fileMimeType }) => {
    try {
        const pdfDoc = await PDFDocument.load(fileData);
        const page_count = pdfDoc.getPageCount();
        const metadata = {
            fileName,
            fileMimeType,
            customMetadata: {
                notebook_id,
                entry_id: id
            }
        };

        const publicUrl = await uploadFileToGCS(fileData, metadata, "entries-to-be-processed", `notebooks/${notebook_id}/${id}`);

        const { data, error } = await supabase
            .from('entries')
            .insert([
                { id, title, created_at: date, notebook_id, page_count, url: publicUrl }
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
                    embedding: embedding
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

        return data;
    } catch (error) {
        console.error('Error creating entry text chunks:', error);
        throw error;
    }
}