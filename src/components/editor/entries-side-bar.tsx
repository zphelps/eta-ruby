import {FC, useCallback, useEffect, useState} from "react";
import {StickyNote} from "lucide-react";
import {Entry} from "@/types/entry";
import {api} from "@/lib/api";
import {useSearchParams} from "next/navigation";
import {UploadEntryDialog} from "@/components/editor/upload-entry-dialog";
import { format } from "date-fns";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {useEntries} from "@/hooks/useEntries";
import {v4 as uuidv4, validate} from "uuid";

interface EntriesSideBarProps {

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
    const searchParams = useSearchParams();
    const selectedEntryId = searchParams.get("entry");
    const selectedNotebookId = searchParams.get("notebook");

    const entries = useEntries(selectedNotebookId as string);
    const groupedEntries = useGroupedEntries(entries);

    const getDefaultValue = useCallback(() => {
        const selectedEntry = entries.find(entry => entry.id === selectedEntryId);
        if (!selectedEntry) {
            return undefined;
        }
        const date = new Date(selectedEntry.created_at);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return [`${month} ${year}`];
    }, [entries, selectedEntryId]);

    function onEntrySelect(entryId: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('entry', entryId)
        window.history.pushState(null, '', `?${params.toString()}`)
    }

    if (!selectedNotebookId) {
        return null;
    }

    return (
        <div className={'h-full border-r border-r-slate-200 w-full'}>
            <div className={'flex justify-between text-md pl-3 pr-1 pt-0.5 items-center h-10'}>
                <p className={'font-semibold'}>
                    Entries
                </p>
                <UploadEntryDialog />
            </div>

            <Separator className={'mt-0'} />

            {Object.keys(groupedEntries).length === 0 && (
                <div className={'w-full min-h-full text-center justify-center content-center space-y-2'}>
                    <StickyNote size={75} className={'text-gray-400 mx-auto'}/>
                    <p className={'text-gray-400 font-medium text-lg '}>
                        No entries found
                    </p>
                </div>
            )}
            <div className={'overflow-y-auto'}>
                <Accordion type="multiple" className="w-full" defaultValue={getDefaultValue()}>
                    {Object.keys(groupedEntries).map((key, index) => {
                        return (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger className={'font-semibold text-sm mx-3 pb-2'}>
                                    {key}
                                </AccordionTrigger>
                                <div className={'pb-2'}>
                                    {groupedEntries[key].map((entry: Entry) => {
                                        return (
                                            <AccordionContent
                                                key={entry.id}
                                                onClick={() => onEntrySelect(entry.id)}
                                                className={cn(selectedEntryId === entry.id ? "bg-slate-100" : "", 'flex items-center justify-between hover:bg-slate-50 rounded-md py-1.5 px-2 cursor-pointer mx-1')}
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

                {/*{entries.map((entry, index) => {*/}
                {/*    const date = new Date(entry.created_at);*/}
                {/*    const month = date.toLocaleString('default', { month: 'long' });*/}
                {/*    const year = date.getFullYear();*/}
                {/*    const monthYear = `${month} ${year}`;*/}

                {/*    const prevDate = index > 0 ? new Date(entries[index - 1].created_at) : null;*/}
                {/*    const prevMonthYear = prevDate*/}
                {/*        ? `${prevDate.toLocaleString('default', { month: 'long' })} ${prevDate.getFullYear()}`*/}
                {/*        : '';*/}

                {/*    return (*/}
                {/*        <div key={index}>*/}
                {/*            {monthYear !== prevMonthYear && (*/}
                {/*                <p className={'font-semibold text-sm mb-2 mx-3'}>*/}
                {/*                    {monthYear}*/}
                {/*                </p>*/}
                {/*            )}*/}
                {/*            <div*/}
                {/*                onClick={() => onEntrySelect(entry.id)}*/}
                {/*                className={cn(selectedEntryId === entry.id ? "bg-slate-100" : "", 'flex items-center justify-between hover:bg-slate-50 rounded-md py-1.5 px-2 cursor-pointer mx-1')}*/}
                {/*            >*/}
                {/*                <p*/}
                {/*                    className={cn(selectedEntryId === entry.id ? "text-gray-700" : "text-gray-500", "font-medium text-sm")}*/}
                {/*                >*/}
                {/*                    {entry.title}*/}
                {/*                </p>*/}
                {/*                <p className={"font-normal text-slate-400 text-sm"}>*/}
                {/*                    {format(new Date(entry.created_at), "M/d")}*/}
                {/*                </p>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    );*/}
                {/*})}*/}
                {/*{entries.map(entry => (*/}
                {/*    <div key={entry.id} className={"p-3 border-b border-r-slate-200 flex items-center justify-between"}>*/}
                {/*        <p className={"font-medium text-slate-500 text-sm"}>*/}
                {/*            {entry.title}*/}
                {/*        </p>*/}
                {/*        <p className={'font-normal text-slate-400 text-sm'}>*/}
                {/*            {format(new Date(entry.created_at), 'M/d')}*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*))}*/}
            </div>
        </div>
    )
}
