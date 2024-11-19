import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { Storage } from "@google-cloud/storage";
import { Readable } from "stream";
import { PDFDocument } from "pdf-lib";
import { extractRangeFromDoc } from "@/helpers/entries";
import { getLastQueueValue, getPublicURL, insertEntry, uploadPDF } from "@/app/api/notebooks/helpers";
import { CreateEntry } from "@/types/entry";
import { EntrySelection } from "@/components/editor/dialogs/upload-multiple-entries-dialog";
import { getDocumentText } from "@/app/api/document_ocr/helpers";
import { createClient } from "@/utils/supabase/server";

// Initialize GCS client
const storage = new Storage();

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const body = {
        entrySelections: JSON.parse(
            formData.get("entries") as string
        ) as EntrySelection[],
        file: formData.get("file") as File,
        notebook_id: formData.get("notebook_id") as string,
    };

    const { entrySelections, file, notebook_id } = body;

    try {
        const id = uuid();

        // Upload the base file to GCS
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
        const base_file_url = `https://storage.googleapis.com/${bucketName}/${filePath}`;

        // Prepare the payload
        const payload = {
            notebook_id,
            entries: JSON.stringify(entrySelections),
            base_file_url,
        };

        // Call the cloud function
        const cloudFunctionUrl =
            "https://upload-multiple-entries-tdyx7enzba-uw.a.run.app";

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
                `Failed to create entries: ${response.status} ${response.statusText}`
            );
        }

        const result = await response.json();

        return NextResponse.json(
            {
                message: "Entries created successfully",
                data: result.data,
            },
            { status: 200 }
        );
    } catch (e: any) {
        console.error("Error in POST /entries/bulk-upload", e);

        // Ensure you are only sending necessary information to the client
        return NextResponse.json(
            {
                message: e.message || "Invalid Request",
                error: process.env.NODE_ENV === "development" ? e.stack : undefined,
            },
            { status: 500 }
        );
    }
}

// // Increase the body size limit if necessary
// export const config = {
//     api: {
//         bodyParser: {
//             sizeLimit: "50mb", // Adjust as needed
//         },
//     },
// };
