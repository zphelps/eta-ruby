import { FC, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEntry } from "@/hooks/useEntry";
import { format } from "date-fns";
import * as React from "react";
import { ReaderAPI } from "react-pdf-headless";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Preview, PreviewEntry } from "@/types/preview";

interface PreviewToolbarProps {
    preview: Preview;
    readerAPI: ReaderAPI | null;
}

export const PreviewToolbar: FC<PreviewToolbarProps> = (props) => {
    const { readerAPI, preview } = props;

    const searchParams = useSearchParams();
    const selectedEntryId = searchParams.get("entry") as string;
    const currentEntry = preview.entries.find(entry => entry.id === selectedEntryId);

    if (!currentEntry) {
        return null;
    }

    return (
        <div
            className={"w-full border-b border-b-slate-200 h-11 px-2 flex items-center justify-between"}
        >
            <div className={"flex space-x-1 items-center"}>
                <p className={"py-1 px-2 bg-sky-50 border border-sky-100 rounded-md text-xs text-sky-600"}>
                    {format(new Date(currentEntry.created_at), "MMM d, yyyy")}
                </p>
                <p className={"font-medium text-sm hover:bg-slate-50 rounded-md border border-transparent px-2 py-1"}>
                    {currentEntry.title}
                </p>
            </div>

            <div className={"flex items-center"}>
                <Button variant="ghost" size="icon" onClick={() => readerAPI?.increaseZoom()}>
                    <Plus size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => readerAPI?.decreaseZoom()}>
                    <Minus size={16} />
                </Button>
            </div>

        </div>
    )
}
