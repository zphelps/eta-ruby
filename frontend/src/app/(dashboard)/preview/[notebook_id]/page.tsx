"use client"
import {PDFViewer} from "@/components/editor/pdf-viewer";
import React, {useState} from "react";
import {PageChangeEvent, ReaderAPI} from "react-pdf-headless";
import {pdfjs} from "react-pdf";
import {PreviewHeader} from "@/components/preview/preview-header";
import {usePreview} from "@/hooks/usePreview";
import {PreviewTocSideBar} from "@/components/preview/preview-toc-side-bar";
import {ErrorIcon} from "react-hot-toast";
import {PreviewToolbar} from "@/components/preview/preview-toolbar";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Preview({ params }: { params: { notebook_id: string } }) {
    const {notebook_id} = params;

    const preview = usePreview(notebook_id)

    const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter()
    const pathname = usePathname()

    const onPageChange = (e: PageChangeEvent) => {
        // get current entry based on page number
        if (!preview) {
            return
        }

        const params = new URLSearchParams(searchParams.toString())
        const selectedEntryId = searchParams.get("entry") as string;
        const navigating = searchParams.get("navigating") as string;

        for (const entry of preview?.entries) {
            if (entry.start_page <= e.currentPage && entry.end_page >= e.currentPage) {
                if (selectedEntryId === entry.id && navigating === '1') {
                    //remove navigating
                    params.set('entry', entry.id)
                    params.delete('navigating')
                    router.push(`${pathname}?${params.toString()}`)
                } else if (selectedEntryId !== entry.id && navigating !== '1') {
                    params.set('entry', entry.id)
                    router.push(`${pathname}?${params.toString()}`)
                }
                break
            }
        }
    }

    return (
        <div>
            {preview && <PreviewHeader preview={preview}/>}
            <div className={'h-[calc(100vh-56px)] pt-[56px] flex'}>
                <div className={'min-w-[325px] max-w-[325px]'}>
                    {preview && <PreviewTocSideBar
                        entries={preview?.entries}
                        setPage={(page) => readerAPI?.jumpToPage(page)}
                    />}
                </div>

                {preview && preview.entries.length > 0 && <div className={"w-full h-full"}>
                    <PreviewToolbar readerAPI={readerAPI} preview={preview}/>
                    <PDFViewer
                        onPageChange={onPageChange}
                        url={preview?.preview_url}
                        setReaderAPI={setReaderAPI}
                    />
                </div>}

                {preview && preview.entries.length === 0 && (
                    <div className={"w-full h-full items-center align-middle flex justify-center gap-2"}>
                        <ErrorIcon className={"w-12 h-12"}/>
                        <p className={"font-lg font-semibold text-gray-500"}>
                            Preview not available
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
