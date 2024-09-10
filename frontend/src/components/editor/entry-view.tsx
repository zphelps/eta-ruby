"use client"
import {EntryToolbar} from "@/components/editor/entry-toolbar";
import {FC, useState} from "react";

import {ReaderAPI} from "react-pdf-headless";
import {useEntry} from "@/hooks/useEntry";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
    () => import('@/components/editor/pdf-viewer').then(mod => mod.PDFViewer),
    { ssr: false }
)

interface EntryViewProps {
    notebookId: string;
    selectedEntryId: string;
}

export const EntryView:FC<EntryViewProps> = (props) => {
    const {selectedEntryId, notebookId} = props;

    const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);
    const entry = useEntry(selectedEntryId);

    return (
        <div className={"w-full h-full"}>
            <EntryToolbar readerAPI={readerAPI} notebookId={notebookId}/>
            {entry && (
                <PDFViewer
                    url={entry.url}
                    setReaderAPI={setReaderAPI}
                />
            )}
        </div>
    )
}
