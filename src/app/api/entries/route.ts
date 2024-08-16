import {createClient} from "@/utils/supabase/server";
import {z} from "zod";
import {NextRequest, NextResponse} from "next/server";
import {v4 as uuid} from "uuid";
import {PDFDocument} from "pdf-lib";
import {
    deleteEntry, deletePDF, getEntry, getIndicesToRemove,
    getPreviewPDFDoc,
    insertEntry,
    mergePDFs,
    previewPDFExists, removeIndicesFromPDF,
    upsertPDF
} from "@/app/api/notebooks/helpers";
// import {pdfjs} from "react-pdf";

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
            query = query.eq("notebook_id", params.notebook_id)
        }

        const {data, error} = await query.order("created_at", {ascending: true});

        console.log(data)

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

export async function POST(request: Request) {

    const formData = await request.formData();

    const body = {
        id: formData.get('id') as string,
        title: formData.get('title') as string,
        created_at: formData.get('date') as string,
        file: formData.get('file') as File,
        notebook_id: formData.get('notebook_id') as string,
    }

    console.log(body)

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
            error: validationResponse.error
        }, { status: 400 })
    }

    try {
        const id = body.id ?? uuid();
        const supabase = createClient();

        // get number of pages in pdf file
        const buffer = await body.file.arrayBuffer();
        const newEntryDoc = await PDFDocument.load(buffer)
        const num_pages = newEntryDoc.getPages().length

        // upload pdf file to storage
        await upsertPDF(body.notebook_id, `${id}.pdf`, newEntryDoc);

        let existingPreviewDoc;
        const previewExists = await previewPDFExists(body.notebook_id);

        if (previewExists) {
            existingPreviewDoc = await getPreviewPDFDoc(body.notebook_id);
            console.log("PAGES", existingPreviewDoc.getPages())
            console.log("PAGE COUNT", existingPreviewDoc.getPageCount())
        } else {
            existingPreviewDoc = await PDFDocument.create();
        }

        const newPreviewDoc = await mergePDFs([existingPreviewDoc, newEntryDoc]);

        await upsertPDF(body.notebook_id, "preview.pdf", newPreviewDoc);

        const {data: urlData} = supabase.storage.from(body.notebook_id).getPublicUrl(`${id}.pdf`);

        await insertEntry({
            id: id,
            title: body.title,
            created_at: body.created_at,
            updated_at: body.created_at,
            notebook_id: body.notebook_id,
            url: urlData?.publicUrl,
            page_count: num_pages
        })


        return NextResponse.json({
            message: 'Success',
            data: {
                id: id,
                title: body.title,
                created_at: body.created_at,
                notebook_id: body.notebook_id,
                url: urlData?.publicUrl + `?buster=${new Date().getTime()}`,
            }
        }, { status: 200 })
    } catch (e) {
        console.log(e)
        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, { status: 400 })
    }
}

export async function PUT(request: Request) {}

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

        await deletePDF(notebook_id, `${entry_id}.pdf`);

        const indicesToRemove = await getIndicesToRemove(entry);

        const newPreviewPDF = await removeIndicesFromPDF(existingPreviewPDF, indicesToRemove);

        if (newPreviewPDF === null) {
            await deletePDF(notebook_id, "preview.pdf");
        } else {
            await upsertPDF(notebook_id, "preview.pdf", newPreviewPDF);
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
