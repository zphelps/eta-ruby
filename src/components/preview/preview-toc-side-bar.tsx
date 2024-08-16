import {useSearchParams} from "next/navigation";
import {FC, useCallback, useEffect} from "react";
import {Separator} from "@/components/ui/separator";
import {StickyNote} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {PreviewEntry} from "@/types/preview";

export const useGroupedPreviewEntries = (entries: PreviewEntry[]) => {
    // sort entries by date
    entries = entries.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateA.getTime() - dateB.getTime();
    });
    return entries.reduce((groups: { [x: string]: PreviewEntry[]; }, item: PreviewEntry) => {
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

interface PreviewTocSideBarProps {
    entries: PreviewEntry[];
    setPage: (page: number) => void;
}

export const PreviewTocSideBar:FC<PreviewTocSideBarProps> = (props) => {
    const {entries, setPage} = props;
    const groupedEntries = useGroupedPreviewEntries(entries);

    const searchParams = useSearchParams();
    const selectedEntryId = searchParams.get("entry") as string;

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

    function onEntrySelect(entry: PreviewEntry) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('entry', entry.id)
        window.history.pushState(null, '', `?${params.toString()}`)
    }

    useEffect(() => {
        const entry = entries.find(entry => entry.id === selectedEntryId);
        if (entry) setPage(entry.start_page);
    }, [selectedEntryId, entries, setPage]);

    return (
        <div className={'h-full border-r border-r-slate-200 w-full'}>
            <div className={'flex justify-between text-md pl-3 pr-1 pt-0.5 items-center h-10'}>
                <p className={'font-semibold'}>
                    Table of Contents
                </p>
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
                <Accordion type="multiple" className="w-full" value={getDefaultValue()}>
                    {Object.keys(groupedEntries).map((key, index) => {
                        return (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger className={'font-semibold text-sm mx-3 pb-1 pt-2'}>
                                    {key}
                                </AccordionTrigger>
                                <div className={'pb-1'}>
                                    {groupedEntries[key].map((entry: PreviewEntry) => {
                                        return (
                                            <AccordionContent
                                                key={entry.id}
                                                onClick={() => onEntrySelect(entry)}
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
            </div>
        </div>
    )
}