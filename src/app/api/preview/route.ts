import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import {createClient} from "@/utils/supabase/server";
import PDFMerger from "pdf-merger-js";
import {v4 as uuid} from "uuid";
import {PDFDocument} from "pdf-lib";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())

    const schema = z.object({
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

        const {data: entries, error: entriesError} = await supabase
            .from("entries")
            .select("*")
            .eq("notebook_id", params.notebook_id)
            .order("created_at", {ascending: true})

        if (entriesError) {
            console.error(entriesError)
            return NextResponse.json({
                message: entriesError.message,
                error: entriesError.message
            }, { status: 400 })
        }

        let toc_entries = []
        let start_page = 0

        for (const entry of entries) {
            const {data} = supabase.storage.from(params.notebook_id).getPublicUrl(`${entry.id}.pdf`)
            toc_entries.push({
                id: entry.id,
                title: entry.title,
                created_at: entry.created_at,
                url: data.publicUrl,
                start_page,
            })
            start_page += entry.page_count
        }

        // get notebook title
        const {data: notebook, error: notebookError} = await supabase
            .from("notebooks")
            .select("title, team:team_id(name, number)")
            .eq("id", params.notebook_id)
            .single()

        console.log("Notebook: ", notebook)

        if (notebookError) {
            console.error(notebookError)
            return NextResponse.json({
                message: notebookError.message,
                error: notebookError.message
            }, { status: 400 })
        }

        // get preview url
        const {data} = supabase.storage
            .from(params.notebook_id)
            .getPublicUrl("preview.pdf")

        const notebookPreview = {
            id: uuid(),
            notebook_id: params.notebook_id,
            // @ts-ignore
            team_name: notebook.team.name,
            // @ts-ignore
            team_number: notebook.team.number,
            title: notebook.title,
            entries: toc_entries,
            preview_url: data.publicUrl + `?buster=${new Date().getTime()}`,
        }

        return NextResponse.json({
            data: notebookPreview,
            message: 'Success',
        }, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, { status: 400 })
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = await request.json();

    const schema = z.object({
        notebook_id: z.string().optional(),
    });

    const validationResponse = schema.safeParse(body);
    if (!validationResponse.success) {
        return NextResponse.json({
            message: "Invalid request schema",
            error: validationResponse.error.errors
        }, { status: 400 })
    }

    try {
        const supabase = createClient();

        const {data: entries, error: entriesError} = await supabase
            .from("entries")
            .select("*")
            .eq("notebook_id", body.notebook_id)

        if (entriesError) {
            console.error(entriesError)
            return NextResponse.json({
                message: entriesError.message,
                error: entriesError.message
            }, { status: 400 })
        }

        let files: File[] = []

        let merger = new PDFMerger();

        for (const entry of entries) {
            console.log(entry)
            console.log(body.notebook_id)
            // get entry file from storage
            const {data: blob, error: fileError} = await supabase.storage
                .from(body.notebook_id)
                .download(`${entry.id}.pdf`)

            // const buffer = await blob.arrayBuffer()
            // const doc = await PDFDocument.load(buffer)
            // const numPages = doc.getPages().length
            //
            // if (fileError || ) {
            //     console.error(fileError)
            //     return NextResponse.json({
            //         message: fileError.message,
            //         error: fileError.message
            //     }, { status: 400 })
            // }

            await merger.add(blob as Blob)
        }


        await merger.setMetadata({
            title: "Merged PDF",
        })

        const buffer = await merger.saveAsBuffer(); //save under given name and reset the internal document

        return NextResponse.json({
            data: buffer,
            message: 'Success',
        }, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, { status: 400 })
    }
}