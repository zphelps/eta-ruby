import {PDFViewer} from "@/components/editor/pdf-viewer";
import React from "react";
import {PageChangeEvent, ReaderAPI} from "react-pdf-headless";
import {pdfjs} from "react-pdf";
import {PreviewHeader} from "@/components/preview/preview-header";
import {usePreview} from "@/hooks/usePreview";
import {PreviewTocSideBar} from "@/components/preview/preview-toc-side-bar";
import {ErrorIcon} from "react-hot-toast";
import {PreviewToolbar} from "@/components/preview/preview-toolbar";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {Metadata, ResolvingMetadata} from "next";
import {createClient} from "@/utils/supabase/server";
import {validate} from "uuid";
import {PreviewView} from "@/components/preview/preview-view";

type Props = {
    params: { notebook_id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const id = params.notebook_id;

    const supabase = createClient();

    console.log("ID", id);

    const {data: notebook, error} = await supabase.from("notebooks").select("*").eq("id", id).single();

    if (!id || !validate(id)) {
        return {
            title: "Select Notebook",
        }
    }

    return {
        title: `${notebook?.team_number} - ${notebook?.team_name}`,
    }
}

export default function Preview({ params, searchParams }: Props) {
    const notebook_id = params.notebook_id;

    return (
        <div>
            {notebook_id && validate(notebook_id) && <PreviewView
                notebook_id={notebook_id}
                navigating={searchParams["navigating"] as string}
                entry_id={searchParams["entry"] as string}
            />}
        </div>
    )
}
