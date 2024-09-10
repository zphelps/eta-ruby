import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import {
    deleteEntry,
    deletePDF,
    getEntry,
    getIndicesToRemove,
    getPreviewPDFDoc,
    removeIndicesFromPDF, uploadPDF
} from "@/app/api/notebooks/helpers";
import {createClient} from "@/utils/supabase/server";

export async function DELETE(request: NextRequest) {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())

    const { notebook_id, entry_id } = params;

    console.log("Deleting entry", entry_id, "from notebook", notebook_id);

    const schema = z.object({
        notebook_id: z.string(),
        entry_id: z.string(),
    });

    const validationResponse = schema.safeParse(params);
    if (!validationResponse.success) {
        return NextResponse.json({
            message: "Invalid request schema",
            error: validationResponse.error.errors
        }, { status: 400 })
    }

    try {

        const supabase = createClient();

        // check if any entries for this notebook have a non-null queue
        const { data: entries, error } = await supabase
            .from("entries")
            .select("queue")
            .eq("notebook_id", notebook_id)
            .not("queue", "is", null);

        console.log("Entries", entries);

        if (error) {
            console.log("Error deleting entry", error);
            return NextResponse.json({
                message: error.message,
                error: error.message
            }, { status: 400 })
        }

        if (entries.length !== 0) {
            return NextResponse.json({
                message: "Cannot delete entry while there are entries still processing. Try again later.",
                error: "Cannot delete entry while there are entries in the queue"
            }, { status: 400 })
        }

        const existingPreviewPDF = await getPreviewPDFDoc(notebook_id);

        const entry = await getEntry(entry_id);

        await deleteEntry(entry_id);

        await deletePDF("entries", `${notebook_id}/${entry_id}.pdf`);

        const indicesToRemove = await getIndicesToRemove(entry);

        console.log("Indices to remove", indicesToRemove);

        const newPreviewPDF = await removeIndicesFromPDF(existingPreviewPDF, indicesToRemove);

        if (newPreviewPDF === null) {
            await deletePDF("notebooks", `${notebook_id}/preview.pdf`);
        } else {
            await uploadPDF("notebooks", `${notebook_id}/preview.pdf`, newPreviewPDF);
        }

        return NextResponse.json({
            success: true,
            message: 'Success',
        }, {status: 200})

    } catch (e) {
        console.log("Error deleting entry", e);
        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, {status: 400})
    }
}
