"use client";

import React, { FC, useState, useEffect, useRef } from "react";
import { PreviewToolbar } from "@/components/preview/preview-toolbar";
import { PDFViewer } from "@/components/editor/pdf-viewer";
import { PageChangeEvent, ReaderAPI } from "react-pdf-headless";
import { PreviewTocSideBar } from "@/components/preview/preview-toc-side-bar";
import { PreviewSearchSideBar } from "@/components/preview/preview-search-side-bar";
import { ErrorIcon } from "react-hot-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PreviewHeader } from "@/components/preview/preview-header";
import { usePreview } from "@/hooks/usePreview";
import { PreviewEntry } from "@/types/preview";

interface PreviewViewProps {
    notebook_id: string;
}

export const PreviewView: FC<PreviewViewProps> = ({ notebook_id }) => {
    const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);
    const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

    const isProgrammaticNavigation = useRef(false);
    const [targetPage, setTargetPage] = useState<number | null>(null);

    const { preview } = usePreview(notebook_id);

    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const entry_id = searchParams.get("entry");
        setCurrentEntryId(entry_id);
    }, [searchParams]);

    const handleEntrySelect = (entry: PreviewEntry) => {
        if (currentEntryId === entry.id) return;

        setCurrentEntryId(entry.id);
        setTargetPage(entry.start_page);
        isProgrammaticNavigation.current = true;
        readerAPI?.jumpToPage(entry.start_page);
    };

    const onPageChange = (e: PageChangeEvent) => {
        if (!preview) return;

        if (isProgrammaticNavigation.current) {
            if (e.currentPage === targetPage) {
                isProgrammaticNavigation.current = false;
                setTargetPage(null);
            }
            return;
        }

        const entry = preview.entries.find(
            (entry) =>
                entry.start_page <= e.currentPage && entry.end_page >= e.currentPage
        );

        if (entry && entry.id !== currentEntryId) {
            setCurrentEntryId(entry.id);
            const params = new URLSearchParams(searchParams.toString());
            params.set("entry", entry.id);
            replace(`${pathname}?${params.toString()}`);
        }
    };

    return (
        <div>
            {preview && <PreviewHeader preview={preview} />}

            <div className="h-[calc(100vh-56px)] pt-[56px] flex relative">
                {/* TOC Sidebar */}
                {preview && (
                    <PreviewTocSideBar
                        entries={preview.entries}
                        notebook_id={notebook_id}
                        currentEntryId={currentEntryId}
                        handleEntrySelect={handleEntrySelect}
                    />
                )}

                {/* Main Content */}
                {preview && preview.entries.length > 0 && (
                    <div className="flex-1 h-full">
                        <PreviewToolbar readerAPI={readerAPI} preview={preview} />
                        <PDFViewer
                            onPageChange={onPageChange}
                            url={preview.preview_url}
                            setReaderAPI={setReaderAPI}
                        />
                    </div>
                )}

                {/* Search Sidebar */}
                {preview && preview.entries.length > 0 && (
                    <PreviewSearchSideBar
                        notebook_id={notebook_id}
                        setPage={(page) => readerAPI?.jumpToPage(page)}
                        preview={preview}
                    />
                )}

                {/* Handle case when no preview is available */}
                {preview && preview.entries.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center gap-2">
                        <ErrorIcon className="w-12 h-12" />
                        <p className="text-lg font-semibold text-gray-500">Preview not available</p>
                    </div>
                )}
            </div>
        </div>
    );
};
