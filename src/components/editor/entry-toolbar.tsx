import {Entry} from "@/types/entry";
import {FC, useEffect} from "react";
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

interface EntryToolbarProps {
}

export const EntryToolbar:FC<EntryToolbarProps> = (props) => {

    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const selectedEntryId = searchParams.get("entry") as string;
    const entry = useEntry(selectedEntryId as string);

    async function handleDeleteEntry() {
        console.log('Add page');

        await api.delete(`/entries`, {
            params: {
                entry_id: selectedEntryId
            }
        });

        dispatch(removeEntry(selectedEntryId));

        const params = new URLSearchParams(searchParams.toString())
        params.delete('entry')
        window.history.pushState(null, '', `?${params.toString()}`)
    }

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


            {/*TODO: Add dropdown menu for entry actions*/}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={"py-1 h-full"}>
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Entry Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem className={'text-red-500'}>
                            <Trash className={'h-5 w-5 mr-2'}/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

        </div>
    )
}
