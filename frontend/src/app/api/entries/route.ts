import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { PDFDocument } from "pdf-lib";
import {
    deleteEntry, deletePDF, getEntry, getIndicesToRemove,
    getPreviewPDFDoc, getPublicURL,
    insertEntry,
    mergePDFs,
    removeIndicesFromPDF, updateEntry, uploadPDF,
} from "@/app/api/notebooks/helpers";
import { Storage } from "@google-cloud/storage";
import { Readable } from "stream";

// Initialize GCS client
const storage = new Storage();

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
        const { data: notebooks, error: notebookError } = await supabase.from("user_notebooks").select("notebook_id").eq("user_id", params.uid);

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

        const { data, error } = await query.order("created_at", { ascending: true });

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

export async function HEAD(request: Request) { }

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const body = {
        id: formData.get("id") as string,
        title: formData.get("title") as string,
        created_at: formData.get("date") as string,
        file: formData.get("file") as File,
        notebook_id: formData.get("notebook_id") as string,
    };

    const schema = z.object({
        id: z.string().optional(),
        title: z.string(),
        created_at: z.string(),
        file: z.instanceof(File),
        notebook_id: z.string(),
    });

    const validationResponse = schema.safeParse(body);
    if (!validationResponse.success) {
        return NextResponse.json(
            {
                message: "Invalid entry schema",
                error: validationResponse.error.errors,
            },
            { status: 400 }
        );
    }

    try {
        const id = body.id ?? uuid();
        const notebook_id = body.notebook_id;
        const file = body.file;
        const title = body.title;
        const date = body.created_at;

        // Upload the file to GCS
        const bucketName = "entries-to-be-processed"; // Replace with your GCS bucket name
        const filePath = `notebooks/${notebook_id}/${id}/${file.name}`;
        const bucket = storage.bucket(bucketName);
        const gcsFile = bucket.file(filePath);

        // Convert the File object to a Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a stream from the buffer
        const stream = Readable.from(buffer);

        // Upload the file
        await new Promise<void>((resolve, reject) => {
            stream
                .pipe(
                    gcsFile.createWriteStream({
                        metadata: {
                            contentType: file.type,
                            metadata: {
                                notebook_id: notebook_id,
                                entry_id: id,
                            },
                        },
                    })
                )
                .on("finish", resolve)
                .on("error", reject);
        });

        // Generate the GCS file URL
        const file_url = `https://storage.googleapis.com/${bucketName}/${filePath}`;

        // Call the cloud function to create the entry
        const payload = {
            id: id,
            title: title,
            date: date,
            notebook_id: notebook_id,
            file_url: file_url,
        };

        const cloudFunctionUrl =
            "https://upload-single-entry-tdyx7enzba-uw.a.run.app";
        const response = await fetch(cloudFunctionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Cloud function error:",
                response.status,
                response.statusText
            );
            console.error("Response:", errorText);
            throw new Error(
                `Failed to create entry: ${response.status} ${response.statusText}`
            );
        }

        const entry = await response.json();

        return NextResponse.json(
            {
                message: "Success",
                data: entry,
            },
            { status: 200 }
        );
    } catch (e: any) {
        console.error("Error in POST /entries", e);

        // Ensure you are only sending necessary information to the client
        return NextResponse.json(
            {
                message: e.message || "Invalid Request",
                error:
                    process.env.NODE_ENV === "development" ? e.stack : undefined,
            },
            { status: 400 }
        );
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

export async function PATCH(request: Request) { }
