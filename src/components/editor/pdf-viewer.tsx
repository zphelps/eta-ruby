import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import React, {ChangeEvent, FC, useRef, useState} from "react";
import {RotateLoader} from "react-spinners";
import {Page, pdfjs} from "react-pdf";
import {PageChangeEvent, Reader, ReaderAPI, RenderPageProps} from "react-pdf-headless";


// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

pdfjs.GlobalWorkerOptions.workerSrc="https://unpkg.com/pdfjs-dist@4.4.168/legacy/build/pdf.worker.min.mjs"

const LoadingComponent = () => {
    return <div>
        Overidden Loading
    </div>;
};

interface PDFViewerProps {
    url: string;
    setReaderAPI: (api: ReaderAPI) => void;
    onPageChange?: (e: PageChangeEvent) => void;
}

export const PDFViewer: FC<PDFViewerProps> = (props) => {

    const {url, setReaderAPI, onPageChange} = props;

    const [pageNum, setPageNum] = useState<number | null>(null);
    const [scale, setScale] = useState<number | null>(1.5);
    const [file, setFile] = useState<string>();
    const [wantPage, setWantPage] = useState<number | null>(null);
    // const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);
    const [offset, setOffset] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const initialHighlight = useRef(false);


    // const onPageChange = (e: PageChangeEvent) => {
    //     setPageNum(e.currentPage);
    // };

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

    return (
        <div
            className={'w-full h-full'}
        >
            <Reader
                file={url}
                onPageChange={onPageChange}
                onDocumentLoad={onDocumentLoaded}
                onViewportsMeasured={onViewportsMeasured}
                initialScale={scale || undefined}
                initialRotation={0}
                setReaderAPI={(api: ReaderAPI) => setReaderAPI(api)}
                renderPage={renderPage}
                reactPDFDocumentProps={{loading: (
                        <div className={'w-full mt-96 justify-center flex'}>
                            <RotateLoader color={"#2563EB"} size={8} />
                        </div>
                    )}}
            />
        </div>

    );
}
