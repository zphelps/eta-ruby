import {createClient} from "@/utils/supabase/server";
import {z} from "zod";
import {NextRequest, NextResponse} from "next/server";
import {v4 as uuid} from "uuid";
import {PDFDocument} from "pdf-lib";
import {
    deleteEntry, deletePDF, getEntry, getIndicesToRemove,
    getPreviewPDFDoc, getPublicURL,
    insertEntry,
    mergePDFs,
    removeIndicesFromPDF, updateEntry, uploadPDF,
} from "@/app/api/notebooks/helpers";
import {getDocumentText} from "@/app/api/document_ocr/helpers";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())

    const schema = z.object({
        entry_id: z.string().optional(),
        notebook_id: z.string().optional(),
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

        let query = supabase.from("entries").select("*")

        if (params.entry_id) {
            query = query.eq("id", params.entry_id)
        }

        if (params.notebook_id) {
            console.log("Filtering by notebook", params.notebook_id)
            query = query.eq("notebook_id", params.notebook_id)
        }

        const {data, error} = await query.order("created_at", {ascending: true});

        if (error) {
            return NextResponse.json({
                message: error.message,
                error: error.message
            }, { status: 400 })
        }

        return NextResponse.json({
            data: params.entry_id && data ? data[0] : data,
            message: 'Success',
        }, { status: 200 })
    } catch (e) {
        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, { status: 400 })
    }
}

export async function HEAD(request: Request) {}

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const body = {
        id: formData.get('id') as string,
        title: formData.get('title') as string,
        created_at: formData.get('date') as string,
        file: formData.get('file') as File,
        notebook_id: formData.get('notebook_id') as string,
    }

    const schema = z.object({
        id: z.string().optional(),
        title: z.string(),
        created_at: z.string(),
        file: z.instanceof(File),
        notebook_id: z.string(),
    });

    const validationResponse = schema.safeParse(body);
    if (!validationResponse.success) {
        return NextResponse.json({
            message: 'Invalid entry schema',
            error: validationResponse.error.errors
        }, { status: 400 });
    }

    try {
        const id = body.id ?? uuid();

        // get number of pages in new pdf file
        const buffer = await body.file.arrayBuffer();
        const newEntryDoc = await PDFDocument.load(buffer);
        const num_pages = newEntryDoc.getPages().length;

        if (num_pages > 15) {
            throw new Error("Document is too long. Please upload a document with less than 15 pages.");
        }

        const existingPreviewDoc = await getPreviewPDFDoc(body.notebook_id);
        const newPreviewDoc = await mergePDFs([existingPreviewDoc, newEntryDoc]);

        // upload new entry to storage
        await uploadPDF("entries", `${body.notebook_id}/${id}.pdf`, newEntryDoc);

        // upload notebook preview to storage
        await uploadPDF("notebooks", `${body.notebook_id}/preview.pdf`, newPreviewDoc);

        const entryUrl = await getPublicURL("entries", `${body.notebook_id}/${id}.pdf`);

        const document_text = await getDocumentText(body.file);

        await insertEntry({
            id: id,
            title: body.title,
            created_at: body.created_at,
            updated_at: body.created_at,
            notebook_id: body.notebook_id,
            url: entryUrl,
            page_count: num_pages,
            text: document_text,
        });

        return NextResponse.json({
            message: 'Success',
            data: {
                id: id,
                title: body.title,
                created_at: body.created_at,
                notebook_id: body.notebook_id,
                url: entryUrl + `?buster=${new Date().getTime()}`,
            }
        }, { status: 200 });
    } catch (e: any) {
        console.error("Error in POST /entries", e);

        // Ensure you are only sending necessary information to the client
        return NextResponse.json({
            message: e.message || 'Invalid Request',
            error: process.env.NODE_ENV === 'development' ? e.stack : undefined
        }, { status: 400 });
    }
}


export async function PUT(request: NextRequest) {
    const body = await request.json();

    const schema = z.object({
        id: z.string().optional(),
        title: z.string().optional(),
    });

    const validationResponse = schema.safeParse(body);

    if (!validationResponse.success) {
        return NextResponse.json({
            message: 'Invalid entry schema',
            error: validationResponse.error
        }, { status: 400 })
    }

    try {
        await updateEntry({
            id: body.id,
            title: body.title,
            updated_at: new Date().toISOString(),
        })

        return NextResponse.json({
            message: 'Success',
        }, { status: 200 })
    } catch (e) {

        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, { status: 400 })
    }
}

export async function DELETE(request: NextRequest) {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())

    const { notebook_id, entry_id } = params;

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
            message: 'Success',
        }, {status: 200})

    } catch (e) {
        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, {status: 400})
    }
}

export async function PATCH(request: Request) {}
