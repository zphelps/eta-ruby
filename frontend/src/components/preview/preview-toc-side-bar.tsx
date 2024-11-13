import { usePathname, useRouter, useParams } from "next/navigation";
import { FC, useCallback, useEffect, useState, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PreviewEntry } from "@/types/preview";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TableProperties } from "lucide-react";

export const useGroupedPreviewEntries = (entries: PreviewEntry[]) => {
    return useMemo(() => {
        console.log('useGroupedPreviewEntries', entries);

        // Use a single pass to both sort and group entries
        const groups: { [key: string]: PreviewEntry[] } = {};

        entries.forEach(item => {
            const date = new Date(item.created_at);
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const key = `${month} ${year}`;

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        // Sort each group by date
        for (const key in groups) {
            groups[key].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }

        return groups;
    }, [JSON.stringify(entries)]);
}

interface PreviewTocSideBarProps {
    entries: PreviewEntry[];
    setPage: (page: number) => void;
}

export const PreviewTocSideBar: FC<PreviewTocSideBarProps> = (props) => {
    const { entries, setPage } = props;

    // const groupedEntries = useGroupedPreviewEntries(entries);
    const groupedEntries = entries;

    console.log(entries);

    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const selectedEntryId = params.slug[1];

    const [accordionValue, setAccordionValue] = useState<string[]>();
    const [isCollapsed, setIsCollapsed] = useState(false);

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
        if (selectedEntryId === entry.id) return;
        router.replace(`/preview/${params.slug[0]}/${entry.id}`);
        // if (selectedEntryId === entry.id) return;
        // const params = new URLSearchParams(searchParams.toString())
        // params.set('navigating', '1')
        // params.set('entry', entry.id)
        // router.push(`${pathname}?${params.toString()}`)
        // setPage(entry.start_page);
    }

    function onAccordionValueChange(value: string[]) {
        setAccordionValue(value);
    }

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div
            className={`h-full transition-width duration-300 border-r border-r-slate-200 ${isCollapsed ? "w-10" : "w-[325px]"
                }`}
        >
            <div className="flex px-3 justify-between items-center h-11 border-b border-b-slate-200">
                <p className={`font-semibold ${isCollapsed ? "hidden" : "block"}`}>
                    Table of Contents
                </p>
                <Button className="-m-3" variant="ghost" size="icon" onClick={toggleCollapse}>
                    {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </Button>
            </div>

            {!isCollapsed && (
                <div className="h-full overflow-y-auto">
                    <Accordion type="multiple" className="w-full" value={accordionValue ?? getDefaultValue()} onValueChange={onAccordionValueChange}>
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
                                            );
                                        })}
                                    </div>

                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
            )}
        </div>
    )
}
