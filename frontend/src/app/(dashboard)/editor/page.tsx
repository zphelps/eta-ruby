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

const PDFViewer = dynamic(
    () => import('@/components/editor/pdf-viewer').then(mod => mod.PDFViewer),
    { ssr: false }
)

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
                {/*<Button onClick={async () => {*/}
                {/*    console.log('Button clicked')*/}
                {/*    const supabaseClient = createClient()*/}
                {/*    //*/}
                {/*    // const {error} = await supabase.from("webhook_test").insert({*/}
                {/*    //     id: "0f32fdc0-f62e-473e-80ec-81d146276479",*/}
                {/*    //     notebook_id: "312e53be-46b0-4ab9-8ebd-b60c688ecd14",*/}
                {/*    // })*/}
                {/*    //*/}
                {/*    // console.log('Error:', error)*/}
                {/*    const {*/}
                {/*        data: entryBlob,*/}
                {/*        error: entryFileError*/}
                {/*    } = await supabaseClient.storage.from("entries").download(`${selectedNotebookId}/${selectedEntryId}.pdf`);*/}
                {/*    if (entryFileError) {*/}
                {/*        return new Response(JSON.stringify({error: entryFileError.message}), {status: 500})*/}
                {/*    }*/}
                {/*    const buffer = await entryBlob?.arrayBuffer();*/}

                {/*    console.log("Buffer:", buffer)*/}

                {/*    const encodedFile = Buffer.from(buffer).toString('base64');*/}

                {/*    const response = await fetch("https://us-documentai.googleapis.com/v1/projects/eta-ruby/locations/us/processors/5f462157b077ca2c/processorVersions/pretrained-ocr-v2.0-2023-06-02:process", {*/}
                {/*        method: 'POST',*/}
                {/*        headers: {*/}
                {/*            'Content-Type': 'application/json',*/}
                {/*        },*/}
                {/*        body: JSON.stringify({*/}
                {/*            rawDocument: {*/}
                {/*                content: encodedFile,*/}
                {/*                mimeType: 'application/pdf',*/}
                {/*            },*/}
                {/*        }),*/}
                {/*        })*/}

                {/*    const json = await response.json()*/}

                {/*    console.log("JSON:", json)*/}
                {/*    // const { data, error } = await supabase.functions.invoke('hello-world', {*/}
                {/*    //     body: { name: 'Functions' },*/}
                {/*    // })*/}
                {/*    //*/}
                {/*    // if (error) {*/}
                {/*    //     console.error('Error calling hello-world', error)*/}
                {/*    // } else {*/}
                {/*    //     console.log('Success calling hello-world', data)*/}
                {/*    // }*/}
                {/*}}>Click me</Button>*/}
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

            {!selectedEntryId && (
                <div className={"w-full h-full items-center align-middle flex justify-center gap-5"}>
                    <p className={"font-lg font-semibold text-slate-500"}>
                        Select an entry to view
                    </p>
                </div>
            )}
        </div>
    )
}
