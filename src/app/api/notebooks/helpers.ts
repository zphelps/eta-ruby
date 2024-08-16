import {createClient} from "@/utils/supabase/server";
import {PDFDocument} from "pdf-lib";
import {CreateEntry, Entry} from "@/types/entry";

export const getIndicesToRemove = async (entryToRemove: Entry) => {
    const supabase = createClient();

    console.log("Entry to remove", entryToRemove);

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

    console.log(indices, start_index, end_index);

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
    const {data: urlData} = supabase.storage.from(entry.notebook_id).getPublicUrl(`${entry.id}.pdf`);

    const {error: databaseError} = await supabase.from("entries").insert(entry);

    if (databaseError) {
        throw new Error(databaseError.message);
    }
}

export const deleteEntry = async (entryId: string) => {
    const supabase = createClient();
    const {error} = await supabase.from("entries").delete().eq("id", entryId);

    if (error) {
        throw new Error(error.message);
    }
}

export const upsertPDF = async (notebookId: string, fileName: string, pdfDoc: PDFDocument) => {
    const supabase = createClient();
    const pdfBytes = await pdfDoc.save();

    const { error: previewUploadError } = await supabase.storage.from(notebookId).upload(
        fileName,
        pdfBytes,
        { contentType: 'application/pdf', upsert: true }
    );

    if (previewUploadError) {
        throw new Error(previewUploadError.message);
    }
}

export const deletePDF = async (notebookId: string, fileName: string) => {
    const supabase = createClient();
    const { error: previewDeleteError } = await supabase.storage.from(notebookId).remove([fileName]);

    if (previewDeleteError) {
        throw new Error(previewDeleteError.message);
    }
}

export const getPreviewPDFDoc = async (notebookId: string) => {
    const supabase = createClient();
    const {data: previewData, error: previewDownloadError} = await supabase
        .storage
        .from(notebookId)
        .download(`preview.pdf?buster=${new Date().getTime()}`);

    if (previewDownloadError) {
        throw new Error(previewDownloadError.message);
    }

    const buffer = await previewData?.arrayBuffer();

    return await PDFDocument.load(buffer);
}

export const previewPDFExists = async (notebookId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .storage
        .from(notebookId)
        .list("", { search: "preview" });

    if (error) {
        console.error(error);
        return false;
    }

    return data.length > 0;
}

export const removeEntryFromPreviewPDF = async (notebookId: string, entryId: string) => {
    const supabase = createClient();

}