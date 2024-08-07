"use client"

import {useEffect} from "react";
import {useSearchParams} from "next/navigation";
import {EntriesSideBar} from "@/components/editor/entries-side-bar";
import {EntryToolbar} from "@/components/editor/entry-toolbar";
import {EntryViewer} from "@/components/editor/entry-viewer";
import {validate} from "uuid";

export default function Dashboard() {
    const searchParams = useSearchParams();

    const selectedEntryId = searchParams.get("entry");
    const selectedNotebookId = searchParams.get("notebook");

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
        <div className={'h-screen pt-[56px] flex'}>
            {selectedNotebookId && <div className={'min-w-[325px] max-w-[325px]'}>
                <EntriesSideBar/>
            </div>}

            {selectedEntryId && selectedNotebookId && <div className={"w-full h-full"}>
                <EntryToolbar />
                <EntryViewer
                    // fileUrl={"https://mqtngvbwllxtievxdfll.supabase.co/storage/v1/object/sign/312e53be-46b0-4ab9-8ebd-b60c688ecd14/State-compressed.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiIzMTJlNTNiZS00NmIwLTRhYjktOGViZC1iNjBjNjg4ZWNkMTQvU3RhdGUtY29tcHJlc3NlZC5wZGYiLCJpYXQiOjE3MjI4Njk3MzUsImV4cCI6MTcyMzQ3NDUzNX0.GmfUsE5aDCTm4CRLhBQ_OsaCbRYDYhi1ROdnXlYpnc8&t=2024-08-05T14%3A55%3A35.408Z"}
                    // fileUrl={"https://mqtngvbwllxtievxdfll.supabase.co/storage/v1/object/sign/312e53be-46b0-4ab9-8ebd-b60c688ecd14/State.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiIzMTJlNTNiZS00NmIwLTRhYjktOGViZC1iNjBjNjg4ZWNkMTQvU3RhdGUucGRmIiwiaWF0IjoxNzIyODY3NTUyLCJleHAiOjE3MjM0NzIzNTJ9.1yoAnKHgaevrPCTrySfU-XAz15UtIGf7rSSIAO8Puv8&t=2024-08-05T14%3A19%3A13.056Z"}
                    // fileUrl={'https://mqtngvbwllxtievxdfll.supabase.co/storage/v1/object/sign/312e53be-46b0-4ab9-8ebd-b60c688ecd14/ghfhfghgf.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiIzMTJlNTNiZS00NmIwLTRhYjktOGViZC1iNjBjNjg4ZWNkMTQvZ2hmaGZnaGdmLnBkZiIsImlhdCI6MTcyMjg2Nzg4OSwiZXhwIjoxNzIzNDcyNjg5fQ.qezV-0rAUQ9iFunsUQJuN4pPQCou06kdj1o8eFQ9DAs&t=2024-08-05T14%3A24%3A49.664Z'}
                />
            </div>}
        </div>
    )
}
