import {FC, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {useEntry} from "@/hooks/useEntry";
import { format } from "date-fns";
import * as React from "react";
import {useAppDispatch} from "@/store";
import {EntryActionsDropdown} from "@/components/editor/entry-actions-dropdown";
import {EditEntryNameDialog} from "@/components/editor/dialogs/edit-entry-name-dialog";
import {ReaderAPI} from "react-pdf-headless";
import {Button} from "@/components/ui/button";
import {Minus, Plus} from "lucide-react";
import {Separator} from "@/components/ui/separator";

interface EntryToolbarProps {
    readerAPI: ReaderAPI | null;
}

export const EntryToolbar:FC<EntryToolbarProps> = (props) => {
    const {readerAPI} = props;
    const searchParams = useSearchParams();

    const selectedEntryId = searchParams.get("entry") as string;
    const entry = useEntry(selectedEntryId as string);

    if (!entry) {
        return null;
    }

    return (
        <div
            className={"w-full border-b border-b-slate-200 h-11 px-2 flex items-center justify-between"}
        >
            <div className={'flex space-x-1 items-center'}>
                <p className={"py-1 px-2 bg-sky-50 border border-sky-100 rounded-md text-xs text-sky-600"}>
                    {format(new Date(entry.created_at), 'MMM d, yyyy')}
                </p>
                <EditEntryNameDialog entry={entry}>
                    <p className={"font-medium text-sm hover:bg-slate-50 rounded-md border border-transparent px-2 py-1"}>
                        {entry.title}
                    </p>
                </EditEntryNameDialog>
            </div>

            <div className={'flex items-center'}>
                <Button variant="ghost" size="icon" onClick={() => readerAPI?.increaseZoom()}>
                    <Plus size={16}/>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => readerAPI?.decreaseZoom()}>
                    <Minus size={16}/>
                </Button>
                <Separator orientation="vertical" className={'h-5 mx-2'} />
                <EntryActionsDropdown/>
            </div>

            {/*<EntryActionsDropdown/>*/}


        </div>
    )
}
