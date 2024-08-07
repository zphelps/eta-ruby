import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import React, {ChangeEvent, FC, useEffect, useRef, useState} from "react";
import {Page, pdfjs} from "react-pdf";
import {useSearchParams} from "next/navigation";
import {useEntry} from "@/hooks/useEntry";
import {PageChangeEvent, Reader, ReaderAPI, RenderPageProps} from "react-pdf-headless";
import {RotateLoader} from "react-spinners";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const LoadingComponent = () => {
    return <div>
        Overidden Loading
    </div>;
};

interface PDFViewerProps {
}
export const EntryViewer: FC<PDFViewerProps> = (props) => {

    const searchParams = useSearchParams();

    const selectedEntryId = searchParams.get("entry") as string;

    const entry = useEntry(selectedEntryId);

    const [pageNum, setPageNum] = useState<number | null>(null);
    const [scale, setScale] = useState<number | null>(0.75);
    const [file, setFile] = useState<string>();
    const [wantPage, setWantPage] = useState<number | null>(null);
    const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);
    const [offset, setOffset] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const initialHighlight = useRef(false);


    const onPageChange = (e: PageChangeEvent) => {
        setPageNum(e.currentPage);
    };

    const handleScaleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setScale(isNaN(value) ? null : value);
    };

    const handleFileChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFile(e.target.value);
    };

    const handleWantPageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setWantPage(isNaN(value) ? null : value);
    };

    const handleOffsetChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setOffset(isNaN(value) ? null : value);
    };

    const renderPage = (props: RenderPageProps) => {
        return (
            <>
                <Page {...props} loading={(
                    <div>
                    {/* TODO: Replace with better loading UI */}
                    </div>
                )}>
                    {/*<TestHighlightsLayer {...props} />*/}
                </Page>
            </>
        );
    };

    const handlePageNumChange = (e: any) => {
        if (e.target.value === "") {
            setPageNum(null);
            return;
        }
        setPageNum(e.target.value);
    };

    // Virtualizer has set up the dimension
    const onViewportsMeasured = () => {
        setIsLoaded(true);
    };

    // PDF is ready
    const onDocumentLoaded = () => {
        // console.log("pdf ready");
        // debugger;
    };


    if (!entry) {
        return null;
    }

    return (
        <div
            // style={{
            //     width: "700px",
            //     height: "800px",
            //     borderColor: "gray",
            //     borderWidth: "1px",
            //     borderStyle: "solid",
            // }}
            className={'w-full h-full'}
        >
            {entry && <Reader
                file={entry.url}
                // file={"https://mqtngvbwllxtievxdfll.supabase.co/storage/v1/object/public/312e53be-46b0-4ab9-8ebd-b60c688ecd14/3aba8b73-d106-4ec2-9f2c-7f3790ee1d2d.pdf"}
                onPageChange={onPageChange}
                onDocumentLoad={onDocumentLoaded}
                onViewportsMeasured={onViewportsMeasured}
                // initialScale={scale || undefined}
                initialRotation={0}
                setReaderAPI={(api: ReaderAPI) => setReaderAPI(api)}
                renderPage={renderPage}
                reactPDFDocumentProps={{loading: (
                        <div className={'w-full mt-96 justify-center flex'}>
                            <RotateLoader color={"#2563EB"} size={8} />
                        </div>
                    )}}
            />}
        </div>

    );
}
