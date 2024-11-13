"use client";

import React, { FC, useState, useMemo } from "react";
import { PreviewToolbar } from "@/components/preview/preview-toolbar";
import { PDFViewer } from "@/components/editor/pdf-viewer";
import { PageChangeEvent, ReaderAPI } from "react-pdf-headless";
import { PreviewTocSideBar } from "@/components/preview/preview-toc-side-bar";
import { PreviewSearchSideBar } from "@/components/preview/preview-search-side-bar";
import { ErrorIcon } from "react-hot-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PreviewHeader } from "@/components/preview/preview-header";
import { usePreview } from "@/hooks/usePreview";

interface PreviewViewProps {
    entry_id: string;
    navigating: string;
    notebook_id: string;
}

export const PreviewView: FC<PreviewViewProps> = (props) => {
    const { notebook_id, navigating, entry_id } = props;
    const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);

    const { preview, loading: previewLoading } = usePreview(notebook_id);

    const memoizedEntries = useMemo(() => {
        console.log('useMemo', preview?.entries);

        // Use a single pass to both sort and group entries
        const groups: { [key: string]: PreviewEntry[] } = {};

        preview?.entries.forEach(item => {
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
    }, [JSON.stringify(preview?.entries)]);


    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const pathname = usePathname();

    const onPageChange = (e: PageChangeEvent) => {
        // get current entry based on page number
        // if (!preview) {
        //     return;
        // }

        // // const params = new URLSearchParams(searchParams.toString());

        // for (const entry of preview?.entries) {
        //     if (entry.start_page <= e.currentPage && entry.end_page >= e.currentPage) {
        //         if (entry_id === entry.id && navigating === '1') {
        //             //remove navigating
        //             //   params.set('entry', entry.id);
        //             //   params.delete('navigating');
        //             //   replace(`${pathname}?${params.toString()}`);
        //             replace(`/preview/${notebook_id}/${entry.id}`);
        //         } else if (entry_id !== entry.id && navigating !== '1') {
        //             //    params.set('entry', entry.id);
        //             replace(`/preview/${notebook_id}/${entry.id}`);
        //         }
        //         break;
        //     }
        // }
    };

    return (
        <div>
            <PreviewHeader />

            <div className="h-[calc(100vh-56px)] pt-[56px] flex relative">
                {/* TOC Sidebar */}
                {preview && (
                    <PreviewTocSideBar
                        entries={memoizedEntries}
                        setPage={(page) => readerAPI?.jumpToPage(page)}
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
