"use client"

import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {EntriesSideBar} from "@/components/editor/entries-side-bar";
import {EntryToolbar} from "@/components/editor/entry-toolbar";
// import {PDFViewer} from "@/components/editor/pdf-viewer";
import {validate} from "uuid";
import {useEntry} from "@/hooks/useEntry";
import {ReaderAPI} from "react-pdf-headless";
import dynamic from "next/dynamic";
import {MousePointerClick} from "lucide-react";
import {EditorHeader} from "@/components/editor/editor-header";

const PDFViewer = dynamic(
    () => import('@/components/editor/pdf-viewer').then(mod => mod.PDFViewer),
    { ssr: false }
)

export default function Editor({ params }: { params: { slug?: string[] } }) {
    const notebookId = params.slug?.[0];
    const searchParams = useSearchParams();
    const selectedEntryId = searchParams.get("entry") as string;

    const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);

    const entry = useEntry(selectedEntryId);

    return (
        <div>
            <EditorHeader notebook_id={notebookId} />
            <div className={'h-[calc(100vh-56px)] pt-[56px] flex'}>
                {notebookId && <div className={'min-w-[325px] max-w-[325px]'}>
                    <EntriesSideBar notebook_id={notebookId}/>
                </div>}

                {selectedEntryId && notebookId && <div className={"w-full h-full"}>
                    <EntryToolbar readerAPI={readerAPI} />
                    {entry && (
                        <PDFViewer
                            url={entry.url}
                            setReaderAPI={setReaderAPI}
                        />
                    )}
                </div>}

                {!selectedEntryId && (
                    <div className={"w-full h-full items-center align-middle flex justify-center gap-5"}>
                        <p className={"font-lg font-semibold text-slate-500"}>
                            Select an entry to view
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
