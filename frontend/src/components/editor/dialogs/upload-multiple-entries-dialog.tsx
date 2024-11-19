"use client"
import * as React from "react"
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FileUploader } from "@/components/editor/file-uploader"
import { FC, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { CreateEntry, Entry } from "@/types/entry";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { v4 as uuid } from "uuid";
import { Plus, Upload } from "lucide-react";
import { addMilliseconds, format } from "date-fns";
import { EntrySelectionCard } from "@/components/editor/entry-selection-card";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { addEntries } from "@/slices/entries";
import { useAppDispatch } from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";

export interface EntrySelection {
    id: string,
    entry: CreateEntry,
    start_page?: number,
    end_page?: number,
    queue?: number,
}

interface UploadMultipleEntriesDialogProps {
    notebook_id?: string,
    setDialogMenu?: (menu: string) => void;
}

pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@4.4.168/legacy/build/pdf.worker.min.mjs"

export const UploadMultipleEntriesDialog: FC<UploadMultipleEntriesDialogProps> = (props) => {
    const { notebook_id, setDialogMenu } = props

    const initialEntrySelectionID = uuid();

    const [numPagesSuccessfullyLoaded, setNumPagesSuccessfullyLoaded] = useState<number>(0);

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
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                notebook_id: notebook_id!,
                url: "",
                page_count: 1,
            }
        }
    ]);

    const initialEntrySelections = [
        {
            "id": "05b00075-5e3e-4977-b6f4-22b37d318718",
            "start_page": 1,
            "end_page": 1,
            "entry": {
                "id": "30902c55-a31a-4717-b538-2a2c5a3111ea",
                "title": "Cover",
                "created_at": "2024-11-15T08:28:19.369Z",
                "updated_at": "2024-11-15T08:28:19.369Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "af1f6efe-8dcc-40bd-a454-d88d4a28e699",
            "start_page": 2,
            "end_page": 2,
            "entry": {
                "id": "bb37ec27-7813-4b78-b60f-089c7cdface5",
                "title": "Innovate Award Submission",
                "created_at": "2024-11-15T08:28:38.756Z",
                "updated_at": "2024-11-15T08:28:38.756Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "9648e90a-ffc4-4ebe-925d-97d2a075060b",
            "start_page": 3,
            "end_page": 3,
            "entry": {
                "id": "aed8d536-69d9-4704-b90c-2c27445b3579",
                "title": "Table of Contents",
                "created_at": "2024-11-15T08:28:47.265Z",
                "updated_at": "2024-11-15T08:28:47.265Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "a6bd2a22-dc59-43da-a926-9b2a3b006e16",
            "start_page": 4,
            "end_page": 4,
            "entry": {
                "id": "7bd3dfeb-a8ff-4975-bbfc-707e9067571b",
                "title": "Welcome to Our Engineering Notebook",
                "created_at": "2024-11-15T08:28:55.551Z",
                "updated_at": "2024-11-15T08:28:55.551Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "245d4715-3489-4a88-b526-d0ad3aa1bc34",
            "start_page": 5,
            "end_page": 6,
            "entry": {
                "id": "c139679f-5f73-4a0d-8868-0ae14b18eba0",
                "title": "Meet the Team",
                "created_at": "2024-11-15T08:29:07.793Z",
                "updated_at": "2024-11-15T08:29:07.793Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "102f9256-b1a9-4bc9-aed7-7b0ea13dba00",
            "start_page": 7,
            "end_page": 8,
            "entry": {
                "id": "651c8d1c-e8c1-4db8-aa6c-4e02f82caef8",
                "title": "Starting the Season - Team Goals",
                "created_at": "2024-11-15T08:29:15.271Z",
                "updated_at": "2024-11-15T08:29:15.271Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "321c9595-d59b-40e7-9e2c-107eadcded98",
            "start_page": 9,
            "end_page": 10,
            "entry": {
                "id": "e7ace42b-f886-4e26-bf06-b051578f8f99",
                "title": "Guide to Reading the Notebook",
                "created_at": "2024-11-15T08:29:32.163Z",
                "updated_at": "2024-11-15T08:29:32.163Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "6decc0f3-ca47-4bf5-adac-ec6e1c6f72a3",
            "start_page": 11,
            "end_page": 11,
            "entry": {
                "id": "1a1bb330-a893-42fd-938f-3247c1e89b06",
                "title": "Design Process",
                "created_at": "2024-11-15T08:29:44.323Z",
                "updated_at": "2024-11-15T08:29:44.323Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "95021246-eeaf-49af-8a24-a0bc0c1d033b",
            "start_page": 12,
            "end_page": 24,
            "entry": {
                "id": "57cf569f-b35a-4dde-8837-d3674865e191",
                "title": "Game Analysis - Identifying the Problem",
                "created_at": "2024-11-15T08:29:52.883Z",
                "updated_at": "2024-11-15T08:29:52.883Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "6578456b-e22e-42eb-9a6d-9f74176a9946",
            "start_page": 25,
            "end_page": 29,
            "entry": {
                "id": "5158d619-442a-48a7-896b-6b84978b8680",
                "title": "Developing Strategies - Brainstorming Solutions",
                "created_at": "2024-11-15T08:30:19.812Z",
                "updated_at": "2024-11-15T08:30:19.812Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "02e975f4-ef4c-405e-84eb-f7eb122faad9",
            "start_page": 30,
            "end_page": 31,
            "entry": {
                "id": "740ec881-b056-4994-ad17-7b38e80fa776",
                "title": "Summer Timeline - Planning the Solution",
                "created_at": "2024-11-15T08:30:43.782Z",
                "updated_at": "2024-11-15T08:30:43.782Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "6a862cbf-a751-44b1-b683-d76e78de1f1f",
            "start_page": 32,
            "end_page": 33,
            "entry": {
                "id": "1f08756d-f749-469d-970b-98292108fe67",
                "title": "Building a Conceptual Solution",
                "created_at": "2024-11-15T08:31:02.518Z",
                "updated_at": "2024-11-15T08:31:02.518Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "72688983-7660-42ce-b8e1-4ba32ae8ca16",
            "start_page": 34,
            "end_page": 35,
            "entry": {
                "id": "1f293123-d7f1-46f9-9e09-29cf7d20e2b1",
                "title": "Changes to Judging",
                "created_at": "2024-11-15T08:31:18.699Z",
                "updated_at": "2024-11-15T08:31:18.699Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        },
        {
            "id": "b0030428-b389-4dc1-b8fc-7bf734974176",
            "start_page": 36,
            "end_page": 36,
            "entry": {
                "id": "e1a40332-e61d-421e-85a6-b3281bf18d65",
                "title": "Drivebase - Identify the Problem",
                "created_at": "2024-11-15T08:31:31.072Z",
                "updated_at": "2024-11-15T08:31:31.072Z",
                "notebook_id": "32bd4f03-32fd-49bc-8845-85b27e0844ec",
                "url": "",
                "page_count": 1
            }
        }
    ]

    // console.log("ENTRY SELECTIONS", JSON.stringify(entrySelections, null, 2))

    const [entrySelectionsValid, setEntrySelectionsValid] = useState<boolean>(true);

    const dispatch = useAppDispatch();

    const pathname = usePathname();

    const { replace } = useRouter();

    const searchParams = useSearchParams();

    const uploadEntries = async () => {
        try {
            const formData = new FormData();

            const entriesData = entrySelections.map((selection) => {
                return {
                    start_page: selection.start_page,
                    end_page: selection.end_page,
                    entry: {
                        id: selection.entry.id,
                        title: selection.entry.title,
                        created_at: selection.entry.created_at,
                        notebook_id: selection.entry.notebook_id,
                    },
                };
            });

            formData.append("entries", JSON.stringify(entriesData));
            formData.append("notebook_id", notebook_id!);
            formData.append("file", file!);

            const response = await fetch('/api/entries/bulk-upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload failed with status:', response.status, response.statusText);
                console.error('Response:', errorText);
                throw new Error(`Failed to upload entries: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            return result.data;
        } catch (error: any) {
            console.error("Error uploading entries:", error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        console.log("SUBMITTING", entrySelections, file, notebook_id);

        setUploading(true);

        if (!validateEntrySelections()) {
            toast.error("You have one or more entries with missing or invalid fields. Please fill out all fields for each entry before submitting.");
            setUploading(false);
            return;
        }

        if (!file) {
            toast.error("No file selected.");
            setUploading(false);
            return;
        }

        if (!notebook_id) {
            toast.error("No notebook selected.");
            setUploading(false);
            return;
        }

        try {
            const result = await toast.promise(
                uploadEntries(),
                {
                    loading: 'Uploading entries...\nThis may take a few moments.',
                    success: <b>Entries uploaded!</b>,
                    error: <b>Could not upload entries.</b>,
                }
            );

            console.log("ENTRIES", result);

            if (result && result.length > 0) {
                dispatch(addEntries(result));
                setDialogMenu?.("none");
                const params = new URLSearchParams(searchParams.toString());
                params.set('entry', result[0].id);
                replace(`${pathname}?${params.toString()}`);
            } else {
                toast.error("No entries were uploaded.");
            }
        } catch (error: any) {
            console.error("Upload failed:", error);
            toast.error("An error occurred while uploading entries.");
        } finally {
            setUploading(false);
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
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
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
        if (uploading) return;
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
                    if (selection.start_page && page - selection.start_page > 15) {
                        toast.error("Entry cannot be longer than 15 pages.");
                        return selection;
                    }
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
                || selection.entry.title.trim() === "");
        setEntrySelectionsValid(invalidSelections.length === 0);
        return invalidSelections.length === 0;
    }

    const handlePageHover = (page: number) => {
        if (uploading) return;
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
                                <br />
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
                                                    loading={<div className={'hidden'} />}
                                                    onLoadSuccess={handlePageLoadSuccess}
                                                    scale={0.4} pageNumber={index + 1}
                                                    className={cn(entrySelection !== undefined && "opacity-10", "w-full", numPagesSuccessfullyLoaded !== totalPages && "hidden")} />

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
                                <Plus size={16} className={'mr-2'} />
                                Add Entry
                            </Button>
                        </div>


                        <div ref={scrollRef} className={"space-y-2 overflow-y-auto h-[calc(100%-92px)] rounded-lg pb-4"}>
                            {entrySelections.map((selection) => (
                                <EntrySelectionCard key={selection.id}
                                    uploading={uploading}
                                    selection={selection}
                                    handleEntrySelectionClicked={handleEntrySelectionClicked}
                                    entrySelectionIdBeingEdited={entrySelectionIdBeingEdited}
                                    setEntrySelections={setEntrySelections} />
                            ))}
                        </div>


                        <div className={'flex absolute bottom-2 right-2 left-2'}>
                            <Button className={'w-full drop-shadow-2xl'} onClick={handleSubmit} disabled={!entrySelectionsValid || entrySelections.length === 0 || uploading}>
                                <Upload size={16} className={'mr-2.5'} />
                                Upload Entries
                            </Button>
                        </div>


                    </div>
                </div>
            )}


        </DialogContent>
    )
}
