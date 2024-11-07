"use client";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Plus, StickyNote } from "lucide-react";
import { Entry } from "@/types/entry";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEntries } from "@/hooks/useEntries";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { UploadEntryDropdown } from "@/components/editor/upload-entry-dropdown";
import { createClient } from "@/utils/supabase/client.ts";

interface EntriesSideBarProps {
    notebook_id: string;
}

// Memoized function to group entries by month and year
const useGroupedEntries = (entries: Entry[]) => {
    return useMemo(() => {
        if (!entries || entries.length === 0) return {};

        const sortedEntries = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        return sortedEntries.reduce((groups: { [x: string]: Entry[] }, item: Entry) => {
            const date = new Date(item.created_at);
            const month = date.toLocaleString("default", { month: "long" });
            const year = date.getFullYear();
            const key = `${month} ${year}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    }, [JSON.stringify(entries)]); // Recalculate only when `entries` change
};

export const EntriesSideBar: FC<EntriesSideBarProps> = ({ notebook_id }) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace, push } = useRouter();

    const selectedEntryId = searchParams.get("entry") as string;
    const { loading, entries } = useEntries(notebook_id);

    const groupedEntries = useGroupedEntries(entries);

    // Memoize default accordion value
    const defaultAccordionValue = useMemo(() => {
        const selectedEntry = entries.find((entry) => entry.id === selectedEntryId);
        if (!selectedEntry) {
            return [];
        }
        const date = new Date(selectedEntry.created_at);
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.getFullYear();
        return [`${month} ${year}`];
    }, [JSON.stringify(entries), selectedEntryId]); // Recalculate only when `entries` or `selectedEntryId` change

    const [accordionValue, setAccordionValue] = useState<string[]>(defaultAccordionValue);

    const onEntrySelect = useCallback(
        (entryId: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("entry", entryId);
            push(`${pathname}?${params.toString()}`);
        },
        [searchParams, pathname, replace]
    );

    const onAccordionValueChange = useCallback((value: string[]) => {
        setAccordionValue(value);
    }, []);

    useEffect(() => {
        setAccordionValue(defaultAccordionValue);
    }, [JSON.stringify(defaultAccordionValue)]);

    return (
        <div className={"h-full min-w-[325px] max-w-[325px] border-r border-r-slate-200 w-full"}>
            <div className={"flex justify-between text-md pl-3 pr-1 items-center h-11 border-b border-b-slate-200"}>
                <p className={"font-semibold"}>Entries</p>
                <UploadEntryDropdown
                    notebook_id={notebook_id}
                    minimum_date={entries.length > 0 ? new Date(entries[entries.length - 1].created_at) : undefined}
                >
                    <Button variant="ghost" size="icon" className={"p-2.5 h-fit"}>
                        <Plus size={16} />
                    </Button>
                </UploadEntryDropdown>
            </div>

            {Object.keys(groupedEntries).length === 0 && !loading && (
                <div className={"w-full min-h-full text-center justify-center content-center space-y-2"}>
                    <StickyNote size={75} className={"text-gray-400 mx-auto"} />
                    <p className={"text-gray-400 font-medium text-lg "}>No entries found</p>
                </div>
            )}

            {loading && (
                <div className={"w-full min-h-full flex items-center text-center justify-center content-center space-y-2"}>
                    <ReloadIcon className="mr-3 text-slate-500 h-6 w-6 animate-spin" />
                    <p className={"text-gray-400 font-medium text-lg "}>Loading entries...</p>
                </div>
            )}

            {!loading && Object.keys(groupedEntries).length > 0 && (
                <div className={"h-full overflow-y-auto"}>
                    <Accordion
                        type="multiple"
                        className="w-full"
                        value={accordionValue}
                        onValueChange={onAccordionValueChange}
                    >
                        {Object.keys(groupedEntries).map((key) => (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger className={"font-semibold text-sm mx-3 pb-1 pt-2"}>{key}</AccordionTrigger>
                                <div className={"pb-1"}>
                                    {groupedEntries[key].map((entry: Entry) => (
                                        <AccordionContent
                                            key={entry.id}
                                            onClick={() => onEntrySelect(entry.id)}
                                            className={cn(
                                                selectedEntryId === entry.id ? "bg-slate-200 hover:bg-slate-200" : "hover:bg-slate-50",
                                                "flex items-center justify-between rounded-sm py-1 px-2.5 cursor-pointer mx-1"
                                            )}
                                        >
                                            <p
                                                className={cn(
                                                    selectedEntryId === entry.id ? "text-black" : "text-slate-500",
                                                    "text-sm"
                                                )}
                                            >
                                                {entry.title}
                                            </p>
                                            <p className={cn(
                                                selectedEntryId === entry.id ? "text-slate-600" : "text-slate-400",
                                                "text-xs"
                                            )}>
                                                {format(new Date(entry.created_at), "M/d")}
                                            </p>
                                        </AccordionContent>
                                    ))}
                                </div>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}
        </div>
    );
};
