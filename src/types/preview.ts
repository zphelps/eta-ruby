
export interface Preview {
    id: string;
    notebook_id: string;
    team_name: string;
    team_number: number;
    title: string;
    entries: PreviewEntry[],
    preview_url: string;
}

export interface PreviewEntry {
    id: string;
    title: string;
    created_at: string;
    start_page: number;
    url: string;
}