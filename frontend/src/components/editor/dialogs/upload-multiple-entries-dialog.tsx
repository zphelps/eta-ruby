
"use client"
import * as React from "react"
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FileUploader } from "@/components/editor/file-uploader"
import {FC, useEffect, useRef, useState} from "react";
import {Document, Page, pdfjs} from "react-pdf";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import {CreateEntry, Entry} from "@/types/entry";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {v4 as uuid} from "uuid";
import { Plus, Upload} from "lucide-react";
import {addMilliseconds, format} from "date-fns";
import {EntrySelectionCard} from "@/components/editor/entry-selection-card";
import toast from "react-hot-toast";
import {api} from "@/lib/api";
import {addEntries} from "@/slices/entries";
import {useAppDispatch} from "@/store";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useDebounce} from "use-debounce";

export interface EntrySelection {
    id: string,
    entry: CreateEntry,
    start_page?: number,
    end_page?: number,
    queue?: number,
}

interface UploadMultipleEntriesDialogProps {
    notebook_id?: string,
    minimum_date?: Date,
    setDialogMenu?: (menu: string) => void;
}

pdfjs.GlobalWorkerOptions.workerSrc="https://unpkg.com/pdfjs-dist@4.4.168/legacy/build/pdf.worker.min.mjs"

export const UploadMultipleEntriesDialog: FC<UploadMultipleEntriesDialogProps> = (props) => {
    const {notebook_id, setDialogMenu, minimum_date} = props

    const initialEntrySelectionID = uuid();

    const [numPagesSuccessfullyLoaded, setNumPagesSuccessfullyLoaded] = useState<number>(0);

    // Debounced version of numPagesSuccessfullyLoaded
    const [debouncedNumPagesSuccessfullyLoaded] = useDebounce(numPagesSuccessfullyLoaded, 100); // 100ms debounce delay

    const [uploading, setUploading] = useState<boolean>(false);

    const [entrySelectionIdBeingEdited, setEntrySelectionIdBeingEdited] = useState<string>(initialEntrySelectionID);

    const [file, setFile] = useState<File>()

    const [totalPages, setTotalPages] = useState<number>();

    const [currentPageHovered, setCurrentPageHovered] = useState<number>();

    const scrollRef = useRef<HTMLDivElement>(null);

    const [entrySelections, setEntrySelections] = useState<EntrySelection[]>([
        {
            id: initialEntrySelectionID,
            start_page: undefined,
            end_page: undefined,
            entry: {
                id: uuid(),
                title: "New Entry",
                // Ensure that order is preserved when sorting by created_at
                created_at: minimum_date ? addMilliseconds(minimum_date, 1)?.toISOString() : new Date().toISOString(),
                updated_at: minimum_date ? addMilliseconds(minimum_date, 1)?.toISOString() : new Date().toISOString(),
                notebook_id: notebook_id!,
                url: "",
                page_count: 1,
            }
        }
    ]);

    const [entrySelectionsValid, setEntrySelectionsValid] = useState<boolean>(true);

    const dispatch = useAppDispatch();

    const pathname = usePathname();

    const {replace} = useRouter();

    const searchParams = useSearchParams() ;

    const uploadEntries = () => new Promise(async resolve => {

        const formData = new FormData();

        formData.append("entries", JSON.stringify(entrySelections));
        formData.append("notebook_id", notebook_id!);
        // add file to form data
        formData.append("file", file!);


        const response = await api.post("/entries/bulk-upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        resolve(response)
    });

    const handleSubmit = async () => {
        console.log("SUBMITTING", entrySelections, file, notebook_id);

        setUploading(true);

        if (!validateEntrySelections()) {
            toast.error("You have one or more entries with missing or invalid fields. Please fill out all fields for each entry before submitting.");
            return;
        }

        if (!file) {
            toast.error("No file selected.");
            return;
        }

        if (!notebook_id) {
            toast.error("No notebook selected.");
            return;
        }

        const {entries} = await toast.promise(
            uploadEntries(),
            {
                loading: 'Uploading entries...\nThis may take a few moments.',
                success: <b>Entries uploaded!</b>,
                error: <b>Could not delete.</b>,
            },
        ) as {entries?: Entry[]};

        console.log("ENTRIES", entries);

        setUploading(false);

        // if successful, close the dialog
        if (entries) {
            setDialogMenu?.("none");
            dispatch(addEntries(entries));
            const params = new URLSearchParams(searchParams.toString())
            params.set('entry', entries[0].id)
            replace(`${pathname}?${params.toString()}`)
        }
    }

    const handleNewEntry = () => {

        if (!validateEntrySelections()) {
            toast.error("Please fill out all fields for the current entry before adding a new one.");
            return;
        }

        const newEntrySelectionId = uuid();
        setEntrySelections([...entrySelections, {
            id: newEntrySelectionId,
            start_page: undefined,
            end_page: undefined,
            entry: {
                id: uuid(),
                title: "New Entry",
                // Ensure that order is preserved when sorting by created_at
                created_at: minimum_date ? addMilliseconds(minimum_date, 1)?.toISOString() : new Date().toISOString(),
                updated_at: minimum_date ? addMilliseconds(minimum_date, 1)?.toISOString() : new Date().toISOString(),
                notebook_id: notebook_id!,
                url: "",
                page_count: 1,
            }
        }]);
        setEntrySelectionIdBeingEdited(newEntrySelectionId);
    }

    const getEntryForPage = (page: number): EntrySelection | undefined => {
        return entrySelections.find(entry => {

            if (entry.start_page && entry.end_page) {
                return page >= entry.start_page && page <= entry.end_page;
            } else if (entry.start_page && !entry.end_page && currentPageHovered && currentPageHovered >= entry.start_page) {
                return page >= entry.start_page && page <= currentPageHovered;
            }

            return entry.start_page === page;
        });
    }

    const handlePageLoadSuccess = () => {
        setNumPagesSuccessfullyLoaded(prevState => prevState + 1);
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setTotalPages(numPages);
        console.log("DOCUMENT LOADED", numPages);
    }

    const handlePageSelected = (page: number) => {
        const entrySelectionForPage = getEntryForPage(page);
        if (entrySelectionIdBeingEdited === undefined || (entrySelectionForPage && entrySelectionForPage.id !== entrySelectionIdBeingEdited)) {
            return;
        }

        const newSelections = entrySelections.map(selection => {
            if (selection.id === entrySelectionIdBeingEdited) {

                if (selection.start_page && selection.end_page && selection.start_page === page) {
                    return {
                        ...selection,
                        start_page: undefined,
                        end_page: undefined,
                    }
                } else if (selection.start_page && selection.end_page) {
                    return {
                        ...selection,
                        start_page: page,
                        end_page: undefined,
                    }
                } else if (!selection.start_page && !selection.end_page) {
                    return {
                        ...selection,
                        start_page: page,
                        end_page: undefined,
                    }
                } else if (selection.start_page && !selection.end_page && page < selection.start_page) {
                    return {
                        ...selection,
                        start_page: page,
                        end_page: undefined,
                    }
                } else {
                    return {
                        ...selection,
                        end_page: page,
                    }
                }
            }
            return selection;
        });

        setEntrySelections(newSelections);
    }

    const handleEntrySelectionClicked = (id: string) => {
        if (entrySelectionIdBeingEdited !== id && !validateEntrySelections()) {
            toast.error("Please fill out all fields for the current entry before adding a new one.");
            return;
        }

        setEntrySelectionIdBeingEdited(id);
    }

    const validateEntrySelections = () => {
        const invalidSelections = entrySelections
            .filter(selection =>
                selection.start_page === undefined
                || selection.end_page === undefined
                || selection.start_page > selection.end_page
                || selection.start_page < 1
                || selection.entry.title === "");
        setEntrySelectionsValid(invalidSelections.length === 0);
        return invalidSelections.length === 0;
    }

    const handlePageHover = (page: number) => {
        setCurrentPageHovered(page);
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        validateEntrySelections();
    }, [JSON.stringify(entrySelections)]);

    return (
        <DialogContent
            onInteractOutside={e => uploading && e.preventDefault()}
            className={cn(file ? "w-screen" : "w-fit", "min-w-screen max-w-screen-2xl max-h-screen")}>
            <DialogHeader>
                <DialogTitle>
                    {file ? `Select page(s) for "${entrySelections.find(s => s.id === entrySelectionIdBeingEdited)?.entry.title}"` : "Upload Entries PDF"}
                </DialogTitle>
                <DialogDescription>
                    {!file && "Drag and drop your file here or click to browse."}
                    {file && "Select the pages you want to include in this entry."}
                </DialogDescription>
            </DialogHeader>

            {!file && <FileUploader
                // disabled={uploading}
                className={'w-96 h-96'}
                maxFileCount={1}
                maxSize={100 * 1024 * 1024}
                value={file ? [file] : []}
                onValueChange={files => {
                    console.log(files);
                    setFile(files[0]);
                }}
                accept={{
                    "application/pdf": [],
                }}
            />}

            {file && (
                <div className={'flex gap-x-4 h-[calc(100vh-150px)] mb-4 min-h-full flex-grow'}>
                    <div className={'w-2/3 h-full border border-slate-200 rounded-lg'}>
                        {numPagesSuccessfullyLoaded !== totalPages && <div className="h-full flex items-center justify-center">
                            <p className={"text-slate-500 font-semibold text-center"}>
                                Loading PDF...
                                <br/>
                                This may take a few moments.
                            </p>
                        </div>}
                        <div className="h-full overflow-y-scroll p-4">
                            {/* Load the PDF Document */}
                            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                                {/* Tailwind styles for a three-column grid with vertical scrolling */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 w-full">
                                    {/* Render each page of the PDF */}
                                    {Array.from(new Array(totalPages), (el, index) => {
                                        const entrySelection = getEntryForPage(index + 1);
                                        return (
                                            <div
                                                key={`page_${index + 1}`}
                                                onMouseEnter={() => handlePageHover(index + 1)}
                                                className={cn(entrySelection?.id === entrySelectionIdBeingEdited && "bg-sky-500 border-sky-500 bg-opacity-20", "border-2 rounded relative w-fit shadow-md cursor-pointer")}
                                                onClick={() => handlePageSelected(index + 1)}>
                                                <Page
                                                    loading={<div className={'hidden'}/>}
                                                    onLoadSuccess={handlePageLoadSuccess}
                                                    scale={0.4} pageNumber={index + 1}
                                                    className={cn(entrySelection !== undefined && "opacity-10", "w-full", numPagesSuccessfullyLoaded !== totalPages && "hidden")}/>

                                                {entrySelection !== undefined && (
                                                    <div
                                                        className={"absolute bottom-0 top-0 right-0 left-0 opacity-100 w-full justify-center items-center flex"}>
                                                        <p className={"w-fit text-center text-xs bg-white shadow-md py-0.5 px-1.5 rounded-md"}>
                                                            {entrySelection.entry.title}
                                                        </p>
                                                    </div>
                                                )}

                                                {numPagesSuccessfullyLoaded === totalPages && <div className={"absolute bottom-1.5 w-full justify-center flex"}>
                                                    <p className={"w-fit text-center text-xs bg-white shadow-md py-0.5 px-1.5 rounded-md"}>
                                                        Page {index + 1} of {totalPages}
                                                    </p>
                                                </div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Document>
                        </div>
                    </div>
                    <div className={'relative border border-slate-200 rounded-lg w-1/3 h-full p-2 space-y-2'}>

                        <div className={'flex items-center justify-between'}>
                            <p className={'ml-1 text-xl font-semibold'}>
                                Entries
                            </p>
                            <Button variant={'outline'} disabled={uploading} onClick={handleNewEntry}>
                                <Plus size={16} className={'mr-2'}/>
                                Add Entry
                            </Button>
                        </div>


                        <div ref={scrollRef} className={"space-y-2 overflow-y-auto h-[calc(100%-92px)] rounded-lg pb-4"}>
                            {entrySelections.map((selection) => (
                                <EntrySelectionCard key={selection.id}
                                                    minimumDate={minimum_date}
                                                    selection={selection}
                                                    handleEntrySelectionClicked={handleEntrySelectionClicked}
                                                    entrySelectionIdBeingEdited={entrySelectionIdBeingEdited}
                                                    setEntrySelections={setEntrySelections}/>
                            ))}
                        </div>


                        <div className={'flex absolute bottom-2 right-2 left-2'}>
                            <Button className={'w-full drop-shadow-2xl'} onClick={handleSubmit} disabled={!entrySelectionsValid || entrySelections.length === 0 || uploading}>
                                <Upload size={16} className={'mr-2.5'}/>
                                Upload Entries
                            </Button>
                        </div>


                    </div>
                </div>
            )}


        </DialogContent>
    )
}
