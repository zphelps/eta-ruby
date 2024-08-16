"use client"
import {EntriesSideBar} from "@/components/editor/entries-side-bar";
import {EntryToolbar} from "@/components/editor/entry-toolbar";
import {PDFViewer} from "@/components/editor/pdf-viewer";
import {api} from "@/lib/api";
import React, {useEffect, useState} from "react";
import {PageChangeEvent, Reader, ReaderAPI} from "react-pdf-headless";
import {RotateLoader} from "react-spinners";
import {pdfjs} from "react-pdf";
import {PreviewHeader} from "@/components/preview/preview-header";
import {usePreview} from "@/hooks/usePreview";
import {PreviewTocSideBar} from "@/components/preview/preview-toc-side-bar";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Preview({ params }: { params: { notebook_id: string } }) {
    const {notebook_id} = params;

    const preview = usePreview(notebook_id)

    console.log(preview)

    const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);

    return (
        <div>
            {preview && <PreviewHeader preview={preview}/>}
            <div className={'h-screen pt-[56px] flex'}>
                <div className={'min-w-[325px] max-w-[325px]'}>
                    {preview && <PreviewTocSideBar
                        entries={preview?.entries}
                        setPage={(page) => readerAPI?.jumpToPage(page)}
                    />}
                </div>

                <div className={"w-full h-full"}>
                    {/*<EntryToolbar/>*/}
                    {preview && <PDFViewer
                        url={preview?.preview_url}
                        setReaderAPI={setReaderAPI}
                    />}
                </div>
            </div>
        </div>
    )
}