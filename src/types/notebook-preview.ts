
export interface NotebookPreview {
    id: string;
    notebook_id: string;
    title: string;
    entries: {
        id: string;
        title: string;
        created_at: string;
        start_page: number;
    }[],
    preview_url: string;
}