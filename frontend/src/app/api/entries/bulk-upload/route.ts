import {NextRequest, NextResponse} from "next/server";
import {PDFDocument} from "pdf-lib";
import {extractRangeFromDoc} from "@/helpers/entries";
import {getPublicURL, insertEntry, uploadPDF} from "@/app/api/notebooks/helpers";
import {v4 as uuid} from "uuid";
import {CreateEntry} from "@/types/entry";
import {EntrySelection} from "@/components/editor/dialogs/upload-multiple-entries-dialog";
import entries from "@/slices/entries";

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const body = {
        entrySelections: JSON.parse(formData.get('entries') as string) as EntrySelection[],
        file: formData.get('file') as File,
        notebook_id: formData.get('notebook_id') as string,
    }

    const {entrySelections, file, notebook_id} = body;

    console.log(body);

    try {

        let entries = [];
        const initialDoc = await PDFDocument.load(await file.arrayBuffer());

        // Create an array of promises for uploads and entries
        const uploadPromises = entrySelections.map(async (entrySelection) => {
            const entryDoc = await extractRangeFromDoc(
                initialDoc,
                entrySelection.start_page! - 1,
                entrySelection.end_page!
            );

            console.log(
                `ENTRY ${entrySelection.entry.id} - ${entrySelection.start_page} - ${entrySelection.end_page} -> entry doc is ${entryDoc.getPageCount()} pages`
            );

            // Upload the PDF concurrently
            await uploadPDF('entries', `${notebook_id}/${entrySelection.entry.id}`, entryDoc);

            // Get the public URL after uploading
            const publicURL = await getPublicURL('entries', `${notebook_id}/${entrySelection.entry.id}`);

            const entry: CreateEntry = {
                ...entrySelection.entry,
                notebook_id: notebook_id,
                url: publicURL,
                page_count: entryDoc.getPageCount(),
            };

            entries.push(entry);

            // Insert entry into the database
            await insertEntry({
                ...entrySelection.entry,
                notebook_id: notebook_id,
                url: publicURL,
                page_count: entryDoc.getPageCount(),
            });

            return entry; // Return entry to be included in the final response
        });

        // Wait for all uploads and insertions to complete
        const results = await Promise.all(uploadPromises);

        return NextResponse.json({ entries: results }, { status: 200 });

    } catch (e) {
        console.error(e);
        // @ts-ignore
        return NextResponse.json({error: e?.message}, {status: 500});
    }
}
