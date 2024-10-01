"use client"
import {ArrowUp01, Brain, ChartNoAxesGanttIcon, Pointer, Repeat, Search, Wrench, X} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.tsx";
import {Preview, PreviewEntry} from "@/types/preview.ts";
import {cn} from "@/lib/utils.ts";
import {format} from "date-fns";
import {Separator} from "@/components/ui/separator.tsx";
import {FC, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {createClient} from "@/utils/supabase/client.ts";
import {Entry} from "@/types/entry.ts";

const entryTags = [
    {
        label: 'Identify Problem',
        value: 'tag1',
        icon: Search,
    },
    {
        label: "Brainstorm Solutions",
        value: 'tag2',
        icon: Brain,
    },
    {
        label: "Select Solution",
        value: 'tag3',
        icon: Pointer,
    },
    {
        label: "Implement Solution",
        value: 'tag4',
        icon: Wrench,
    },
    {
        label: "Test Solution",
        value: 'tag5',
        icon: ArrowUp01,
    },
    {
        label: "Repeat Design Process",
        value: 'tag6',
        icon: Repeat,
    },
    {
        label: "Team Management",
        value: 'tag7',
        icon: ChartNoAxesGanttIcon,
    },
]

type Tag = "identify" | "brainstorm" | "select" | "implement" | "test" | "repeat" | "team";

interface SearchFilter {
    tag?: Tag;
    query?: string;
}

interface PreviewSearchSideBarProps {
    notebook_id: string;
    preview: Preview;
    setPage: (page: number) => void;
}

export const PreviewSearchSideBar:FC<PreviewSearchSideBarProps> = (props) => {
    const {notebook_id, setPage, preview} = props;
    const searchParams = useSearchParams();
    const selectedEntryId = searchParams.get("entry") as string;
    const [filter, setFilter] = useState<SearchFilter>({tag: undefined, query: undefined});

    const [searching, setSearching] = useState(false);

    const [searchResults, setSearchResults] = useState<Entry[]>([]);
    const pathname = usePathname();
    const {push} = useRouter();

    const handleSetTag = (tag: Tag) => {
        if (filter.tag === tag) {
            setFilter({tag: undefined, query: undefined});
        } else {
            setFilter({tag, query: undefined});
        }
    }

    const handleSetQuery = (query: string) => {
        setFilter({...filter, query});
    }

    const search = async (query: string) => {
        setSearching(true);
        setSearchResults([]);
        const supabase = createClient();

        const response = await supabase.functions.invoke('search-entries', {
            body: { query: query, notebook_id: notebook_id }
        })

        console.log(response)

        setSearchResults(response.data ?? []);

        setSearching(false);
    }

    const handleSearchResultSelected = (entry: Entry) => {
        if (selectedEntryId === entry.id) return;
        const params = new URLSearchParams(searchParams.toString())
        params.set('navigating', '1')
        params.set('entry', entry.id)
        push(`${pathname}?${params.toString()}`)
        const selectedEntry = preview.entries.find((e) => e.id === entry.id);
        if (!selectedEntry) return;
        setPage(selectedEntry.start_page);
    }

    return (
        <div className={'h-full min-w-[375px] max-w-[375px] border-l border-l-slate-200 w-full'}>
            <div
                className={'flex justify-between text-md items-center h-11 border-b border-b-slate-200'}>
                <Search
                    className={'w-5 h-5 mb-0.5 text-slate-400 ml-3'}
                />
                <input
                    type="text"
                    placeholder="Search notebook..."
                    className={'px-2.5 py-2 h-fit text-sm w-full focus:outline-none'}
                    onChange={(e) => handleSetQuery(e.target.value)}
                    onKeyUp={async (e) => {
                        console.log(e.key)
                        if (e.key === "Enter" && filter.query) {
                            await search(filter.query);
                        }
                    }}
                />

            </div>

            <div className={'flex-wrap gap-x-1.5 gap-y-2 flex px-2.5 py-2.5 border-b border-b-slate-200'}>
                {entryTags.map((tag) => (
                    <div
                        key={tag.value}
                        onClick={() => handleSetTag(tag.value as Tag)}
                        className={cn(
                            tag.value === filter.tag
                                ? "border-sky-200 bg-sky-50"
                                : "border-slate-100 bg-slate-50 hover:bg-slate-100",
                            "border px-2 py-1 flex items-center  rounded-md w-fit cursor-pointer ")}
                    >
                        <tag.icon
                            className={cn(tag.value === filter.tag
                                ? "text-sky-500"
                                : "text-slate-500",
                                "w-4 h-4")}
                        />
                        <p className={cn(tag.value === filter.tag
                            ? "text-sky-500"
                            : "text-slate-500",
                            "ml-2 text-sm")}>
                            {tag.label}
                        </p>
                        {tag.value === filter.tag && (
                            <X className={"ml-1.5 text-sky-400 hover:text-sky-500 w-4 h-4"}/>
                        )}
                    </div>
                ))}
            </div>

            <div className={"overflow-y-auto"}>
                {searching && (
                    <div className={"w-full min-h-full flex items-center text-center justify-center content-center space-y-2"}>
                        <Repeat className="mr-3 text-slate-500 h-6 w-6 animate-spin"/>
                        <p className={"text-gray-400 font-medium text-lg "}>Searching...</p>
                    </div>
                )}

                {!searching && searchResults.length === 0 && (
                    <div className={"w-full min-h-full text-center justify-center content-center space-y-2"}>
                        <Search className={"text-gray-400 mx-auto"} size={75}/>
                        <p className={"text-gray-400 font-medium text-lg "}>No search results</p>
                    </div>
                )}
                {searchResults.map((result) => (
                    <div key={result.id}
                         onClick={() => handleSearchResultSelected(result)}
                         className={
                        cn(selectedEntryId === result.id
                            ? 'bg-sky-100'
                            : 'hover:bg-slate-50',
                            'p-3 border-b border-b-slate-200 cursor-pointer')

                    }>
                        <p className={'font-semibold text-sm'}>{result.title}</p>
                        <p
                            className={cn(selectedEntryId === result.id
                                ? 'text-slate-500'
                                : 'text-slate-400',
                                'text-sm')}
                        >
                            {result.text?.substring(0, 100) ?? "No text available"}...
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
