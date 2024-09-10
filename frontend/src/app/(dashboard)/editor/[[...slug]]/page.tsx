
import {EntriesSideBar} from "@/components/editor/entries-side-bar";
import {validate} from "uuid";
import {EditorHeader} from "@/components/editor/editor-header";
import {Metadata, ResolvingMetadata} from "next";
import {EntryView} from "@/components/editor/entry-view";
import {createClient} from "@/utils/supabase/server";

type Props = {
    params: { slug?: string[] }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const id = params.slug?.[0];

    const supabase = createClient();

    const {data: notebook, error} = await supabase.from("notebooks").select("*").eq("id", id).single();

    if (!id || !validate(id)) {
        return {
            title: "Select Notebook",
        }
    }

    return {
        title: `${notebook?.team_number} - ${notebook?.team_name} | EngScribe`,
    }
}

export default function Editor({ params, searchParams }: Props) {
    const notebookId = params.slug?.[0];

    console.log(notebookId);
    console.log(searchParams);
    const selectedEntryId = searchParams["entry"] as string;

    console.log(notebookId, selectedEntryId);

    return (
        <div>
            <EditorHeader notebook_id={notebookId}/>
            <div className={'h-[calc(100vh-56px)] pt-[56px] flex'}>
                {notebookId && <EntriesSideBar notebook_id={notebookId}/>}

                {selectedEntryId && notebookId && <EntryView selectedEntryId={selectedEntryId} notebookId={notebookId}/>}

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
