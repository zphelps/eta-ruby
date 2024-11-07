// Instantiates Document AI, Storage clients

const { DocumentProcessorServiceClient } = require("@google-cloud/documentai");
const { Storage } = require('@google-cloud/storage');
const { promisify } = require('util');
const zlib = require('zlib');
const gunzip = promisify(zlib.gunzip);
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');

const client = new DocumentProcessorServiceClient();
const storage = new Storage();

const projectId = 'eta-ruby';
const location = 'us'; // Format is 'us' or 'eu'
const processorId = '5f462157b077ca2c';

exports.extractTextFromFile = async (fileName) => {

    try {
        const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

        // Configure the batch process request.
        const request = {
            name,
            inputDocuments: {
                gcsDocuments: {
                    documents: [
                        {
                            gcsUri: `gs://entries-to-be-processed/${fileName}`,
                            mimeType: 'application/pdf',
                        },
                    ],
                },
            },
            documentOutputConfig: {
                gcsOutputConfig: {
                    gcsUri: `gs://processed-entries/${fileName.replace('.pdf', '')}`,
                },
            },
        };

        console.log("Batch process request:", request);

        // Batch process document using a long-running operation.
        const [operation] = await client.batchProcessDocuments(request);

        // Wait for operation to complete.
        await operation.promise();
        console.log('Document processing complete.');

        return true;

    } catch (e) {
        console.error("ERROR:", e);
        return false; // Return an empty list in case of error
    }

}


exports.extractTextChunks = async (file) => {
    const bucketName = file.bucket;
    const fileName = file.name;

    if (!fileName.endsWith('.json')) {
        console.log(`Skipping non-JSON file: ${fileName}`);
        return;
    }

    try {
        console.log(`Processing file: gs://${bucketName}/${fileName}`);
        const bucket = storage.bucket(bucketName);
        const fileObj = bucket.file(fileName);

        const [content] = await fileObj.download();
        console.log('File downloaded successfully.');

        const documentContent = content.toString('utf8');
        console.log('Document content:', documentContent);

        const document = JSON.parse(documentContent);
        console.log('Document parsed successfully:', document);

        const { text } = document;
        const chunks = [];

        // Desired character length for each chunk
        const chunkSize = 1000; // Adjust if necessary
        const chunkOverlap = 200; // Overlap between chunks

        const getText = (textAnchor) => {
            if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
                return '';
            }

            const startIndex = parseInt(textAnchor.textSegments[0].startIndex || 0);
            const endIndex = parseInt(textAnchor.textSegments[0].endIndex);

            return text.substring(startIndex, endIndex);
        };

        // Process each page individually
        for (const page of document.pages) {
            const { paragraphs } = page;

            // Collect all paragraph texts from the page
            let pageText = '';
            for (const paragraph of paragraphs) {
                const paragraphText = getText(paragraph.layout.textAnchor).trim();
                if (paragraphText) {
                    pageText += paragraphText + '\n';
                }
            }

            // Use LangChain's text splitter on the page text
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: chunkSize,
                chunkOverlap: chunkOverlap,
                separators: ['\n\n', '\n', ' ', ''],
            });

            const pageChunks = await splitter.splitText(pageText);

            // Add each chunk to the chunks array with the page number
            for (const chunkText of pageChunks) {
                chunks.push({
                    text: chunkText.trim(),
                    page: page.pageNumber,
                });
            }
        }

        console.log('Extracted Text Chunks:', chunks);
        return chunks;

    } catch (error) {
        console.error('Error processing file:', error);
        return [];
    }
};
