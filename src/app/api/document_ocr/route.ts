import {z} from "zod";
import {NextResponse} from "next/server";
import {v4 as uuid} from "uuid";
import {PDFDocument} from "pdf-lib";
import {getPreviewPDFDoc, getPublicURL, insertEntry, mergePDFs, uploadPDF} from "@/app/api/notebooks/helpers";
import {DocumentProcessorServiceClient} from "@google-cloud/documentai";
import {getDocumentText} from "@/app/api/document_ocr/helpers";

export async function POST(request: Request) {

    const formData = await request.formData();

    const body = {
        file: formData.get('file') as File,
    }

    const schema = z.object({
        file: z.instanceof(File),
    });

    const validationResponse = schema.safeParse(body);
    if (!validationResponse.success) {
        return NextResponse.json({
            message: 'Invalid entry schema',
            error: validationResponse.error
        }, { status: 400 })
    }

    try {

        const text = await getDocumentText(body.file);

        // // Extract shards from the text field
        // const getText = textAnchor => {
        //     if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
        //         return '';
        //     }
        //
        //     // First shard in document doesn't have startIndex property
        //     const startIndex = textAnchor.textSegments[0].startIndex || 0;
        //     const endIndex = textAnchor.textSegments[0].endIndex;
        //
        //     return text.substring(startIndex, endIndex);
        // };
        //
        // // Read the text recognition output from the processor
        // console.log('The document contains the following paragraphs:');
        // const [page1] = document.pages;
        // const {paragraphs} = page1;
        //
        // for (const paragraph of paragraphs) {
        //     const paragraphText = getText(paragraph.layout.textAnchor);
        //     console.log(`Paragraph text:\n${paragraphText}`);
        // }

        return NextResponse.json({
            message: 'Success',
            data: {
                text: text,
            }
        }, { status: 200 })
    } catch (e: any) {
        console.log("Error in POST /document_ocr", e)
        // Ensure you are only sending necessary information to the client
        return NextResponse.json({
            message: e.message || 'Invalid Request',
            error: process.env.NODE_ENV === 'development' ? e.stack : undefined
        }, { status: 400 });
    }
}