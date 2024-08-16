
export interface Entry {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    notebook_id: string;
    url: string;
    page_count: number;
}

export interface CreateEntry {
    id?: string;
    title: string;
    notebook_id: string;
    created_at?: string;
    updated_at?: string;
    url: string;
    page_count: number;
}
