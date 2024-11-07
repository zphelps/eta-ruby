const { createClient } = require('@supabase/supabase-js');
const { PDFDocument } = require('pdf-lib');
const { uploadFileToGCS } = require("../gcs");

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