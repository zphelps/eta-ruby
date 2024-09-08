import {PDFDocument} from "pdf-lib";

export const extractRangeFromDoc = async (doc: PDFDocument, start: number, end: number) => {
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(doc, Array.from({length: end - start}, (_, i) => start + i));
    copiedPages.forEach((page) => newDoc.addPage(page));
    return newDoc;
}
