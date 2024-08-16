import {Entry} from "@/types/entry";
import {FC, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {useEntry} from "@/hooks/useEntry";
import { format } from "date-fns";
import {Button} from "@/components/ui/button";
import {MoreHorizontal, Plus, Trash} from "lucide-react";
import * as React from "react";
import {validate} from "uuid";
import {api} from "@/lib/api";
import {useAppDispatch} from "@/store";
import {removeEntry} from "@/slices/entries";
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {DropdownMenu, DropdownMenuContent} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {EntryActionsDropdown} from "@/components/editor/entry-actions-dropdown";

interface EntryToolbarProps {
}

export const EntryToolbar:FC<EntryToolbarProps> = (props) => {

    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const selectedEntryId = searchParams.get("entry") as string;
    const entry = useEntry(selectedEntryId as string);

    if (!entry) {
        return null;
    }

    return (
        <div
            className={"w-full border-b border-b-slate-200 p-1.5 flex items-center justify-between"}
        >
            <div className={'flex space-x-2 items-center'}>
                <p className={"py-0.5 px-2 bg-sky-50 border border-sky-100 rounded-md text-xs text-sky-600"}>
                    {format(new Date(entry.created_at), 'MMM d, yyyy')}
                </p>
                <p className={"font-medium text-sm"}>
                    {entry.title}
                </p>
            </div>

            <EntryActionsDropdown />

        </div>
    )
}
