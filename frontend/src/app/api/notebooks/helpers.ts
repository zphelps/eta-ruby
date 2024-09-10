import {createClient} from "@/utils/supabase/server";
import {PDFDocument} from "pdf-lib";
import {CreateEntry, Entry, UpdateEntry} from "@/types/entry";

// function to get the smallest value of in column "queue" in entries table for rows with a specific notebook_id
export const getNextQueueValue = async (notebookId: string) => {
    const supabase = createClient();
    const {data, error} = await supabase
        .from("entries")
        .select("queue")
        .eq("notebook_id", notebookId)
        .order("queue", {ascending: true})
        .limit(1);

    if (error) {
        throw new Error(error.message);
    }

    return data[0]?.queue;
}

export const getLastQueueValue = async (notebookId: string) => {
    const supabase = createClient();
    const {data, error} = await supabase
        .from("entries")
        .select("queue")
        .eq("notebook_id", notebookId)
        .order("queue", {ascending: false, nullsFirst: false})
        .limit(1);

    if (error) {
        throw new Error(error.message);
    }

    return data[0]?.queue;
}


export const createStorageBucket = async (notebookId: string) => {
    const supabase = createClient();
    const {error} = await supabase.storage.createBucket(notebookId, {
        public: true,
    });

    if (error) {
        throw new Error(error.message);
    }
}

export const getIndicesToRemove = async (entryToRemove: Entry) => {
    const supabase = createClient();

    const {data, error} = await supabase
        .from("entries")
        .select("*")
        .eq("notebook_id", entryToRemove.notebook_id)
        .lte("created_at", entryToRemove.created_at)
        .order("created_at", {ascending: true});

    console.log(data);

    if (error) {
        throw new Error(error.message);
    }

    let start_index = 0;

    for (const entry of data) {
        start_index += entry.page_count;
    }

    const end_index = start_index + entryToRemove.page_count;

    const indices = [];
    for (let i = start_index; i < end_index; i++) {
        indices.push(i);
    }

    return indices;
}

export const mergePDFs = async (pdfs: PDFDocument[]) => {
    const mergedPDF = await PDFDocument.create();

    for (const pdf of pdfs) {
        const copiedPages = await mergedPDF.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPDF.addPage(page));
    }

    return mergedPDF;
}

export const removeIndicesFromPDF = async (pdf: PDFDocument, indices: number[]) => {
    const newPDF = await PDFDocument.create();

    const indicesToCopy = pdf.getPageIndices().filter((index) => !indices.includes(index));

    if (indicesToCopy.length === 0) {
        return null;
    }

    const copiedPages = await newPDF.copyPages(pdf, pdf.getPageIndices().filter((index) => !indices.includes(index)));
    copiedPages.forEach((page) => newPDF.addPage(page));

    return newPDF;
}

export const getEntry = async (entryId: string) => {
    const supabase = createClient();
    const {data: entryData, error: entryError} = await supabase.from("entries").select("*").eq("id", entryId);

    if (entryError) {
        throw new Error(entryError.message);
    }

    return entryData[0];
}

export const insertEntry = async (entry: CreateEntry) => {
    const supabase = createClient();

    console.log("Inserting entry", entry);

    const {error: databaseError} = await supabase.from("entries").insert(entry);

    if (databaseError) {
        throw new Error(databaseError.message);
    }
}

export const updateEntry = async (entry: UpdateEntry) => {
    const supabase = createClient();
    const {error} = await supabase
        .from("entries")
        .update(entry)
        .eq("id", entry.id);

    if (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export const deleteEntry = async (entryId: string) => {
    const supabase = createClient();
    const {error} = await supabase.from("entries").delete().eq("id", entryId);

    if (error) {
        throw new Error(error.message);
    }
}

export const getPublicURL = async (bucket_id: string, file_path: string) => {
    const supabase = createClient();
    const {data: urlData} = supabase.storage.from(bucket_id).getPublicUrl(file_path);
    return urlData.publicUrl;
}

export const uploadPDF = async (bucket_id: string, file_path: string, pdfDoc: PDFDocument) => {
    const supabase = createClient();
    const pdfBytes = await pdfDoc.save();

    const { error: previewUploadError } = await supabase.storage.from(bucket_id).upload(
        file_path,
        pdfBytes,
        { contentType: 'application/pdf', upsert: true }
    );

    if (previewUploadError) {
        throw new Error(previewUploadError.message);
    }
}

export const deletePDF = async (bucket_id: string, file_path: string) => {
    const supabase = createClient();
    const { error: previewDeleteError } = await supabase.storage.from(bucket_id).remove([file_path]);

    if (previewDeleteError) {
        throw new Error(previewDeleteError.message);
    }
}

export const getPreviewPDFDoc = async (notebookId: string) => {

    const previewExists = await previewPDFExists(notebookId);

    if (previewExists) {
        const supabase = createClient();
        const {data: previewData, error: previewDownloadError} = await supabase
            .storage
            .from("notebooks")
            .download(`${notebookId}/preview.pdf?buster=${new Date().getTime()}`);

        if (previewDownloadError) {
            throw new Error(previewDownloadError.message);
        }

        const buffer = await previewData?.arrayBuffer();

        return await PDFDocument.load(buffer);
    } else {
        return await PDFDocument.create();
    }
}

export const previewPDFExists = async (notebookId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .storage
        .from("notebooks")
        .list(notebookId, { search: "preview" });

    if (error) {
        console.error(error);
        return false;
    }

    return data.length > 0;
}

