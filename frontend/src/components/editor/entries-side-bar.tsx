import {FC, useCallback, useEffect, useState} from "react";
import {Plus, StickyNote} from "lucide-react";
import {Entry} from "@/types/entry";
import {useSearchParams} from "next/navigation";
import {UploadEntryDialog} from "@/components/editor/dialogs/upload-entry-dialog";
import { format } from "date-fns";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {useEntries} from "@/hooks/useEntries";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {RotateLoader} from "react-spinners";
import {ReloadIcon} from "@radix-ui/react-icons";

interface EntriesSideBarProps {
    notebook_id: string;
}

const useGroupedEntries = (entries: Entry[]) => {
    // sort entries by date
    entries = entries.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateA.getTime() - dateB.getTime();
    });
    return entries.reduce((groups: { [x: string]: Entry[]; }, item: Entry) => {
        const date = new Date(item.created_at);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const key = `${month} ${year}`;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

export const EntriesSideBar:FC<EntriesSideBarProps> = (props) => {
    const {notebook_id} = props;
    const searchParams = useSearchParams();
    const selectedEntryId = searchParams.get("entry") as string;

    const {loading, entries} = useEntries(notebook_id);
    const groupedEntries = useGroupedEntries(entries);

    const getDefaultAccordionValue = useCallback(() => {
        const selectedEntry = entries.find(entry => entry.id === selectedEntryId);
        if (!selectedEntry) {
            return [];
        }
        const date = new Date(selectedEntry.created_at);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return [`${month} ${year}`];
    }, [entries, selectedEntryId]);

    const [accordionValue, setAccordionValue] = useState<string[]>();

    function onEntrySelect(entryId: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('entry', entryId)
        window.history.pushState(null, '', `?${params.toString()}`)
    }

    function onAccordionValueChange(value: string[]) {
        setAccordionValue(value);
    }

    return (
        <div className={'h-[calc(100vh-56px)] border-r border-r-slate-200 w-full'}>
            <div className={'flex justify-between text-md pl-3 pr-1 items-center h-11 border-b border-b-slate-200'}>
                <p className={'font-semibold'}>
                    Entries
                </p>
                <UploadEntryDialog
                    minimumDate={entries.length > 0 ? new Date(entries[entries.length - 1].created_at) : undefined}
                >
                    <Button variant="ghost" size="icon" className={"p-2.5 h-fit"}>
                        <Plus size={16}/>
                    </Button>
                </UploadEntryDialog>
            </div>

            {Object.keys(groupedEntries).length === 0 && (
                <div className={'w-full min-h-full text-center justify-center content-center space-y-2'}>
                    <StickyNote size={75} className={'text-gray-400 mx-auto'}/>
                    <p className={'text-gray-400 font-medium text-lg '}>
                        No entries found
                    </p>
                </div>
            )}

            {loading && (
                <div className={'w-full min-h-full flex items-center text-center justify-center content-center space-y-2'}>
                    <ReloadIcon className="mr-3 text-slate-500 h-6 w-6 animate-spin"/>
                    <p className={'text-gray-400 font-medium text-lg '}>
                        Loading entries...
                    </p>
                </div>
            )}

            {!loading && <div className={"overflow-y-auto"}>
                <Accordion type="multiple" className="w-full" value={accordionValue ?? getDefaultAccordionValue()}
                           onValueChange={onAccordionValueChange}>
                    {Object.keys(groupedEntries).map((key, index) => {
                        return (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger className={"font-semibold text-sm mx-3 pb-1 pt-2"}>
                                    {key}
                                </AccordionTrigger>
                                <div className={"pb-1"}>
                                    {groupedEntries[key].map((entry: Entry) => {
                                        return (
                                            <AccordionContent
                                                key={entry.id}
                                                onClick={() => onEntrySelect(entry.id)}
                                                className={cn(selectedEntryId === entry.id ? "bg-slate-100" : "", "flex items-center justify-between hover:bg-slate-50 rounded-md py-1.5 px-2 cursor-pointer mx-1")}
                                            >
                                                <p
                                                    className={cn(selectedEntryId === entry.id ? "text-gray-700" : "text-gray-500", "font-medium text-sm")}
                                                >
                                                    {entry.title}
                                                </p>
                                                <p className={"font-normal text-slate-400 text-sm"}>
                                                    {format(new Date(entry.created_at), "M/d")}
                                                </p>
                                            </AccordionContent>
                                        );
                                    })}
                                </div>

                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>}
        </div>
    )
}
