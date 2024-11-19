"use client"
import { ArrowUp01, Brain, ChartNoAxesGanttIcon, Pointer, Repeat, Search, Wrench, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion.tsx";
import { Preview, PreviewEntry } from "@/types/preview.ts";
import { cn } from "@/lib/utils.ts";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator.tsx";
import { FC, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client.ts";
import { Entry } from "@/types/entry.ts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

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

interface SearchResult {
    entry: Entry;
    text: string;
    page: number;
}

interface PreviewSearchSideBarProps {
    notebook_id: string;
    preview: Preview;
    setPage: (page: number) => void;
}

// Debounce hook
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup timeout if value changes (also on unmount)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export const PreviewSearchSideBar: FC<PreviewSearchSideBarProps> = (props) => {
    const { notebook_id, setPage, preview } = props;
    const searchParams = useSearchParams();
    const selectedEntryId = searchParams.get("entry") as string;
    const [filter, setFilter] = useState<SearchFilter>({ tag: undefined, query: undefined });

    const [searching, setSearching] = useState(false);

    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const pathname = usePathname();
    const { push } = useRouter();

    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300); // Adjust the delay as needed

    const [isCollapsed, setIsCollapsed] = useState(true);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Fetch search results when debounced query changes
    useEffect(() => {
        const minimumQueryLength = 2; // Set a minimum length for the search query
        if (debouncedQuery && debouncedQuery.length >= minimumQueryLength) {
            search(debouncedQuery);
        } else {
            setSearchResults([]);
        }
    }, [debouncedQuery]);

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setFilter({ ...filter, query: e.target.value });
    };

    const handleSetTag = (tag: Tag) => {
        if (filter.tag === tag) {
            setFilter({ tag: undefined, query: undefined });
        } else {
            setFilter({ tag, query: undefined });
        }
    }

    const handleSetQuery = (query: string) => {
        setFilter({ ...filter, query });
    }

    const search = async (query: string) => {
        console.log("Searching for", query);
        setSearching(true);
        setSearchResults([]);

        const supabase = createClient();

        const response = await supabase.functions.invoke('search-entries', {
            body: { query: query, notebook_id: notebook_id }
        })

        if (response.error) {
            console.error('Error fetching search results:', response.error);
            setSearching(false);
            return;
        }

        const results = response.data.map((result: any) => ({
            entry: result.entry,
            text: result.chunk_content,
            page: preview.entries.find((e) => e.id === result.entry.id)?.start_page + result.page,
        }));

        console.log("Search results:", results)

        // Process results as needed
        setSearchResults(results);
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

    // Function to get the snippet with highlighted query
    const getHighlightedSnippet = (text: string, query: string) => {
        const queryLower = query.toLowerCase();
        const textLower = text.toLowerCase();

        const index = textLower.indexOf(queryLower);

        const snippetLength = 88; // should be even

        if (index !== -1) {
            // Query found in text
            const snippetStart = Math.max(0, index - (snippetLength / 2));
            const snippetEnd = Math.min(text.length, index + query.length + (snippetLength / 2));
            const snippet = text.substring(snippetStart, snippetEnd);

            // Split the snippet to highlight the query
            const beforeMatch = snippet.substring(0, index - snippetStart);
            const matchText = snippet.substring(index - snippetStart, index - snippetStart + query.length);
            const afterMatch = snippet.substring(index - snippetStart + query.length);
            return (
                <p className="text-xs text-slate-500">
                    {beforeMatch}
                    <span className="bg-yellow-200 rounded-sm px-0.5 -mx-0.5">{matchText}</span>
                    {afterMatch}
                    ...
                </p>
            );
        } else {
            // Query not found, display first 100 characters
            const snippet = text.substring(0, snippetLength);
            return (
                <p className="text-xs text-slate-500">
                    {snippet}...
                </p>
            );
        }
    };

    return (
        <div
            className={`h-full transition-width duration-300 border-l border-l-slate-200 ${isCollapsed ? "w-10" : "w-[375px]"
                }`}
        >
            <div className="flex px-3 gap-x-2 items-center h-11 border-b border-b-slate-200">
                <Button className="-m-3" variant="ghost" size="icon" onClick={toggleCollapse}>
                    {isCollapsed ? <Search size={16} /> : <Search size={16} />}
                </Button>
                {/* <p className={`font-semibold ${isCollapsed ? "hidden" : "block"}`}>
                    Search
                </p> */}
                <input
                    type="text"
                    placeholder="Search notebook..."
                    className={`ml-2 w-full focus:outline-none ${isCollapsed ? "hidden" : "block"}`}
                    value={query}
                    onChange={handleQueryChange}
                />
            </div>

            {!isCollapsed && (
                <div className="h-full overflow-y-auto">
                    {/* <div className="flex items-center p-2">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search notebook..."
                            className="ml-2 w-full focus:outline-none"
                            value={query}
                            onChange={handleQueryChange}
                        />
                    </div> */}

                    {/* <div className={'flex-wrap gap-x-1.5 gap-y-2 flex px-2.5 py-2.5 border-b border-b-slate-200'}>
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
                                    <X className={"ml-1.5 text-sky-400 hover:text-sky-500 w-4 h-4"} />
                                )}
                            </div>
                        ))}
                    </div> */}

                    <div className={"overflow-y-auto"}>
                        {searching && (
                            <div className={"w-full min-h-full py-24 flex items-center text-center justify-center content-center space-y-2"}>
                                <Repeat className="mr-3 text-slate-500 h-6 w-6 animate-spin" />
                                <p className={"text-gray-400 font-medium text-lg "}>Searching...</p>
                            </div>
                        )}

                        {!searching && searchResults.length === 0 && query && (
                            <div className={"w-full min-h-full py-24 text-center justify-center content-center space-y-2"}>
                                <Search className={"text-gray-400 mx-auto"} size={75} />
                                <p className={"text-gray-400 font-medium text-lg "}>No search results</p>
                            </div>
                        )}

                        {!searching && !query && (
                            <div className={"w-full min-h-full py-48 text-center justify-center content-center space-y-2"}>
                                <Search className={"text-gray-400 mx-auto"} size={75} />
                                <p className={"text-gray-400 font-medium text-lg "}>Start typing to search</p>
                            </div>
                        )}

                        {searchResults.length > 0 && query.length > 0 && searchResults.map((result, index) => (
                            <div key={index}
                                onClick={() => handleSearchResultSelected(result.entry)}
                                className={
                                    cn(selectedEntryId === result.entry.id
                                        ? 'bg-sky-100'
                                        : 'hover:bg-slate-100 bg-white',
                                        'p-2 py-1 border shadow-sm m-2 border-slate-100 cursor-pointer rounded-md')

                                }>
                                <div className="flex items-center justify-between">
                                    <p className={'text-sm'}>{result.entry.title}</p>
                                    <p className={'text-xs text-slate-500'}>{result.page}</p>
                                </div>
                                {getHighlightedSnippet(result.text, filter.query || '')}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
