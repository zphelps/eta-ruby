import {createClient} from "@/utils/supabase/server";
import {z} from "zod";
import {NextRequest, NextResponse} from "next/server";
import {v4 as uuid} from "uuid";
import {PDFDocument} from "pdf-lib";
import {previewPDFExists} from "@/app/api/notebooks/helpers";
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
        const doc = await PDFDocument.load(buffer)
        const num_pages = doc.getPages().length

        // upload pdf file to storage
        const {error: storageError} = await supabase.storage.from(body.notebook_id).upload(
            `${id}.pdf`,
            body.file,
            { contentType: body.file.type} // Optional
        );

        if (storageError) {
            console.log(storageError)
            return NextResponse.json({
                message: storageError.message,
                error: storageError.message
            }, { status: 400 })
        }

        let previewDoc;
        const previewExists = await previewPDFExists(body.notebook_id);

        if (previewExists) {
            const {data: previewData, error: previewDownloadError} = await supabase.storage.from(body.notebook_id).download(`preview.pdf?buster=${new Date().getTime()}`);

            if (previewDownloadError) {
                console.log(previewDownloadError)
                return NextResponse.json({
                    message: previewDownloadError.message,
                    error: previewDownloadError.message
                }, { status: 400 })
            }

            const previewBuffer = await previewData.arrayBuffer();
            previewDoc = await PDFDocument.load(previewBuffer, {ignoreEncryption: true});

            console.log("PAGES", previewDoc.getPages())
            console.log("PAGE COUNT", previewDoc.getPageCount())
        } else {
            previewDoc = await PDFDocument.create();
        }

        const newPages = await previewDoc.copyPages(doc, doc.getPageIndices());

        newPages.forEach((page) => {
            previewDoc.addPage(page);
        });

        const previewPdfBytes = await previewDoc.save();

        const { error: previewUploadError } = await supabase.storage.from(body.notebook_id).upload(
            `preview.pdf`,
            previewPdfBytes,
            { contentType: 'application/pdf', upsert: true }
        );

        if (previewUploadError) {
            console.log(previewUploadError);
            return NextResponse.json({
                message: previewUploadError.message,
                error: previewUploadError.message
            }, { status: 400 });
        }

        const {data: urlData} = supabase.storage.from(body.notebook_id).getPublicUrl(`${id}.pdf`);

        const {error: databaseError} = await supabase.from("entries").insert({
            id: id,
            title: body.title,
            created_at: body.created_at,
            notebook_id: body.notebook_id,
            url: urlData?.publicUrl,
            page_count: num_pages
        });

        if (databaseError) {
            console.log(databaseError)
            return NextResponse.json({
                message: databaseError.message,
                error: databaseError.message
            }, { status: 400 })
        }

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

    const schema = z.object({
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

        const {data, error} = await supabase.from("entries").delete().eq("id", params.entry_id);

        if (error) {
            return NextResponse.json({
                message: error.message,
                error: error.message
            }, {status: 400})
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
