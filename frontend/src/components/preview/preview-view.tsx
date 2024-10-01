"use client";

import React, {FC, useState} from "react";
import {PreviewToolbar} from "@/components/preview/preview-toolbar";
import {PDFViewer} from "@/components/editor/pdf-viewer";
import {PageChangeEvent, ReaderAPI} from "react-pdf-headless";
import {PreviewTocSideBar} from "@/components/preview/preview-toc-side-bar";
import {ErrorIcon} from "react-hot-toast";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {Preview} from "@/types/preview";
import {PreviewHeader} from "@/components/preview/preview-header";
import {usePreview} from "@/hooks/usePreview";
import {PreviewSearchSideBar} from "@/components/preview/preview-search-side-bar.tsx";

interface PreviewViewProps {
    entry_id: string;
    navigating: string;
    notebook_id: string;
}

export const PreviewView:FC<PreviewViewProps> = (props) => {
    const {notebook_id, navigating, entry_id} = props;
    const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);

    const preview = usePreview(notebook_id);

    console.log('PREVIEW', preview)

    const searchParams = useSearchParams();
    const {replace} = useRouter()
    const pathname = usePathname()

    const onPageChange = (e: PageChangeEvent) => {
        // get current entry based on page number
        if (!preview) {
            return
        }

        const params = new URLSearchParams(searchParams.toString())

        for (const entry of preview?.entries) {
            if (entry.start_page <= e.currentPage && entry.end_page >= e.currentPage) {
                if (entry_id === entry.id && navigating === '1') {
                    //remove navigating
                    params.set('entry', entry.id)
                    params.delete('navigating')
                    replace(`${pathname}?${params.toString()}`)
                } else if (entry_id !== entry.id && navigating !== '1') {
                    params.set('entry', entry.id)
                    replace(`${pathname}?${params.toString()}`)
                }
                break
            }
        }
    }

    return (
        <div>
            {preview && <PreviewHeader preview={preview}/>}
            <div className={'h-[calc(100vh-56px)] pt-[56px] flex'}>
                {preview && <PreviewTocSideBar
                    entries={preview?.entries}
                    setPage={(page) => readerAPI?.jumpToPage(page)}
                />}

                {preview && preview.entries.length > 0 && (
                    <div className={"w-full h-full"}>
                        <PreviewToolbar readerAPI={readerAPI} preview={preview}/>
                        <PDFViewer
                            onPageChange={onPageChange}
                            url={preview?.preview_url}
                            setReaderAPI={setReaderAPI}
                        />
                    </div>
                )}

                {preview && preview.entries.length > 0 && (
                    <PreviewSearchSideBar notebook_id={notebook_id} setPage={(page) => readerAPI?.jumpToPage(page)} preview={preview} />
                )}

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
