import {NextRequest, NextResponse} from "next/server";
import {PDFDocument} from "pdf-lib";
import {extractRangeFromDoc} from "@/helpers/entries";
import {getLastQueueValue, getPublicURL, insertEntry, uploadPDF} from "@/app/api/notebooks/helpers";
import {CreateEntry} from "@/types/entry";
import {EntrySelection} from "@/components/editor/dialogs/upload-multiple-entries-dialog";
import {getDocumentText} from "@/app/api/document_ocr/helpers";
import {createClient} from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const body = {
        entrySelections: JSON.parse(formData.get('entries') as string) as EntrySelection[],
        file: formData.get('file') as File,
        notebook_id: formData.get('notebook_id') as string,
    }

    const {entrySelections, file, notebook_id} = body;

    try {
        const supabase = createClient();

        for (const entrySelection of entrySelections) {
            const entryDoc = await extractRangeFromDoc(
                await PDFDocument.load(await file.arrayBuffer()),
                entrySelection.start_page! - 1,
                entrySelection.end_page!
            );

            const text = await getDocumentText(entryDoc);

        }

        // let entries = [];
        // const initialDoc = await PDFDocument.load(await file.arrayBuffer());
        //
        // // Create an array of promises for uploads and entries
        // const uploadPromises = entrySelections.map(async (entrySelection) => {
        //     const entryDoc = await extractRangeFromDoc(
        //         initialDoc,
        //         entrySelection.start_page! - 1,
        //         entrySelection.end_page!
        //     );
        //
        //     const text = await getDocumentText(entryDoc);
        //
        //     console.log(
        //         `ENTRY ${entrySelection.entry.id} - ${entrySelection.start_page} - ${entrySelection.end_page} -> entry doc is ${entryDoc.getPageCount()} pages`
        //     );
        //
        //     // Upload the PDF concurrently
        //     await uploadPDF('entries', `${notebook_id}/${entrySelection.entry.id}.pdf`, entryDoc);
        //
        //     // Get the public URL after uploading
        //     const publicURL = await getPublicURL('entries', `${notebook_id}/${entrySelection.entry.id}.pdf`);
        //
        //     const entry: CreateEntry = {
        //         ...entrySelection.entry,
        //         notebook_id: notebook_id,
        //         url: publicURL,
        //         page_count: entryDoc.getPageCount(),
        //         text: text,
        //     };
        //
        //     entries.push(entry);
        //
        //     // Insert entry into the database
        //     await insertEntry(entry);
        //
        //     return entry; // Return entry to be included in the final response
        // });
        //
        // // Wait for all uploads and insertions to complete
        // const results = await Promise.all(uploadPromises);
        //
        // // insert row into preview queue table
        // await supabase.from("preview_queue").insert({notebook_id: notebook_id});
        //
        // return NextResponse.json({ entries: results }, { status: 200 });

    } catch (e) {
        console.error(e);
        // @ts-ignore
        return NextResponse.json({error: e?.message}, {status: 500});
    }
}
