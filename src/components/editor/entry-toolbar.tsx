import {Entry} from "@/types/entry";
import {FC} from "react";
import {useSearchParams} from "next/navigation";
import {useEntry} from "@/hooks/useEntry";
import { format } from "date-fns";
import {Button} from "@/components/ui/button";
import {MoreHorizontal, Plus} from "lucide-react";
import * as React from "react";

interface EntryToolbarProps {
    id: string;
}

export const EntryToolbar:FC<EntryToolbarProps> = (props) => {

    const {id} = props;

    const searchParams = useSearchParams();

    const entry = useEntry(id);

    if (!entry) {
        return null;
    }

    return (
        <div
            className={"w-full border-b border-b-slate-200 p-2.5 flex items-center justify-between"}
        >
            <div className={'flex space-x-2 items-center'}>
                <p className={"py-0.5 px-2 bg-sky-50 border border-sky-100 rounded-md text-sm text-sky-600"}>
                    {format(new Date(entry.created_at), 'MMM d, yyyy')}
                </p>
                <p className={"font-medium"}>
                    {entry.title}
                </p>
            </div>
            <Button variant="ghost" size="icon" className={"py-1 h-full"}>
                <MoreHorizontal className="h-5 w-5" />
            </Button>
        </div>
    )
}
