"use client"
import {EntriesSideBar} from "@/components/editor/entries-side-bar";
import {EntryToolbar} from "@/components/editor/entry-toolbar";
import {EntryViewer} from "@/components/editor/entry-viewer";
import {api} from "@/lib/api";
import {useEffect} from "react";

export default function Preview({ params }: { params: { notebook_id: string } }) {
    const {notebook_id} = params;

    async function fetchNotebookPreview() {
        const response = await api.get("/preview", {
            params: {
                notebook_id,
            }
        })

        console.log(response.data)

    }

    useEffect(() => {
        fetchNotebookPreview()
    }, []);

    return (
        <div className={'h-screen pt-[56px] flex'}>
            <div className={'min-w-[325px] max-w-[325px]'}>
                {/*<EntriesSideBar/>*/}
                {notebook_id}
            </div>

            <div className={"w-full h-full"}>
                {/*<EntryToolbar/>*/}
                <EntryViewer/>
            </div>
        </div>
    )
}