"use client"

import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {EntriesSideBar} from "@/components/editor/entries-side-bar";
import {EntryToolbar} from "@/components/editor/entry-toolbar";
import {PDFViewer} from "@/components/editor/pdf-viewer";
import {validate} from "uuid";
import {useEntry} from "@/hooks/useEntry";
import {ReaderAPI} from "react-pdf-headless";
import {read} from "node:fs";

export default function Dashboard() {
    const searchParams = useSearchParams();

    const selectedEntryId = searchParams.get("entry") as string;
    const selectedNotebookId = searchParams.get("notebook") as string;

    const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);

    const entry = useEntry(selectedEntryId);

    // TODO: Unify all url validation logic into a single hook
    useEffect(() => {
        if (!selectedNotebookId && selectedEntryId) {
            console.log('Dashboard: No notebook selected, removing entry from URL');
            const params = new URLSearchParams(searchParams.toString())
            params.delete('entry')
            window.history.pushState(null, '', `?${params.toString()}`)
        } else if (!validate(selectedEntryId as string)) {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('entry')
            window.history.pushState(null, '', `?${params.toString()}`)
        }
    }, [selectedNotebookId, selectedEntryId]);

    return (
        <div className={'h-[calc(100vh-56px)] pt-[56px] flex'}>
            {selectedNotebookId && <div className={'min-w-[325px] max-w-[325px]'}>
                <EntriesSideBar/>
            </div>}

            {selectedEntryId && selectedNotebookId && <div className={"w-full h-full"}>
                <EntryToolbar readerAPI={readerAPI} />
                {entry && (
                    <PDFViewer
                        url={entry.url}
                        setReaderAPI={setReaderAPI}
                    />
                )}
            </div>}
        </div>
    )
}
