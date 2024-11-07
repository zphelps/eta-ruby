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
import {getDocumentText} from "@/app/api/document_ocr/helpers.ts";
import {uploadFileToGCS} from "@/helpers/gcs.ts";
import EntriesService, {entriesService} from "@/services/entries/index.ts";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())

    const schema = z.object({
        uid: z.string(),
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

        // get notebooks that belong to the user
        const {data: notebooks, error: notebookError} = await supabase.from("user_notebooks").select("notebook_id").eq("user_id", params.uid);

        if (notebookError) {
            return NextResponse.json({
                message: notebookError.message,
                error: notebookError.message
            }, { status: 400 })
        }

        if (params.entry_id) {
            query = query.eq("id", params.entry_id).in("notebook_id", notebooks.map((notebook) => notebook.notebook_id))
        }

        if (params.notebook_id) {
            query = query.eq("notebook_id", params.notebook_id).in("notebook_id", notebooks.map((notebook) => notebook.notebook_id))
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

        // const supabase = createClient();
        //
        // const buffer = await body.file.arrayBuffer();
        // const newEntryDoc = await PDFDocument.load(buffer);
        //
        // await uploadFileToGCS(body.file, "eta-ruby-entries", {})

        await entriesService.createEntry({
            id: id,
            notebook_id: body.notebook_id,
            title: body.title,
            created_at: body.created_at,
            file: body.file,
        });


        // get number of pages in new pdf file
        // const buffer = await body.file.arrayBuffer();
        // const newEntryDoc = await PDFDocument.load(buffer);
        // const num_pages = newEntryDoc.getPages().length;
        //
        // if (num_pages > 15) {
        //     throw new Error("Document is too long. Please upload a document with fewer than 15 pages.");
        // }
        //
        // // upload new entry to storage
        // await uploadPDF("entries", `${body.notebook_id}/${id}.pdf`, newEntryDoc);
        //
        // const entryUrl = await getPublicURL("entries", `${body.notebook_id}/${id}.pdf`);
        //
        // const entryToInsert = {
        //     id: id,
        //     title: body.title,
        //     created_at: body.created_at,
        //     updated_at: body.created_at,
        //     notebook_id: body.notebook_id,
        //     url: entryUrl,
        //     page_count: num_pages,
        // }
        //
        // await insertEntry(entryToInsert);
        //
        // // insert row into preview queue table
        // await supabase.from("preview_queue").insert({notebook_id: body.notebook_id});
        //
        return NextResponse.json({
            message: 'Success',
            // data: entryToInsert,
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

export async function PATCH(request: Request) {}
