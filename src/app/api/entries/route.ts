import {createClient} from "@/utils/supabase/server";
import {z} from "zod";
import {NextRequest, NextResponse} from "next/server";
import {v4 as uuid} from "uuid";

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

        const {data, error} = await query;

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
        const {error: databaseError} = await supabase.from("entries").insert({
            id: id,
            title: body.title,
            created_at: body.created_at,
            notebook_id: body.notebook_id
        });

        if (databaseError) {
            console.log(databaseError)
            return NextResponse.json({
                message: databaseError.message,
                error: databaseError.message
            }, { status: 400 })
        }

        const {error: storageError} = await supabase.storage.from(body.notebook_id).upload(
            `${body.title}-${id}.pdf`,
            body.file,
            { contentType: body.file.type } // Optional
        );

        if (storageError) {
            console.log(storageError)
            return NextResponse.json({
                message: storageError.message,
                error: storageError.message
            }, { status: 400 })
        }

        return NextResponse.json({
            message: 'Success',
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

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}
