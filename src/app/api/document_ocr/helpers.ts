import {PDFDocument} from "pdf-lib";
import {DocumentProcessorServiceClient} from "@google-cloud/documentai";

const documentOCRClient = new DocumentProcessorServiceClient();

export const getDocumentText = async (file: File) => {
    const projectId = 'eta-ruby';
    const location = 'us'; // Format is 'us' or 'eu'
    const processorId = '5f462157b077ca2c'; // Create processor in Cloud Console

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const buffer = await file.arrayBuffer();
    const newEntryDoc = await PDFDocument.load(buffer);
    const num_pages = newEntryDoc.getPages().length;

    if (num_pages > 15) {
        throw new Error("Document is too long. Please upload a document with less than 15 pages.");
    }

    const encodedFile = Buffer.from(buffer).toString('base64');

    const request = {
        name,
        rawDocument: {
            content: encodedFile,
            mimeType: 'application/pdf',
        },
    };

    try {
        const [result] = await documentOCRClient.processDocument(request);
        const {document} = result;

        if (!document || !document.text) {
            throw new Error("No text found in document");
        }

        return document.text;
    } catch (error: any) {
        throw new Error("Failed to process document: " + error.message);
    }
}
