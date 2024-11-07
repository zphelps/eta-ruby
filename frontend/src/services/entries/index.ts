import {uploadFileToGCS} from "@/helpers/gcs.ts";
import {createClient} from "@/utils/supabase/client.ts";

interface CreateEntry {
    id: string;
    notebook_id: string;
    title: string;
    created_at: string;
    file: File;
}

class EntriesService {
    async createEntry(entry: CreateEntry) {
        const {id, notebook_id, title, created_at, file} = entry;

        const supabase = createClient();

        // Upload the file to GCS
        const {url, gcsPath} = await uploadFileToGCS(file, "eta-ruby-entries", {})

        console.log(url, gcsPath);

        // Create the entry in the database
        // const {data, error} = await supabase.from("entries").insert({
        //     id,
        //     notebook_id,
        //     title,
        //     created_at,
        // });
    }
}

export const entriesService = new EntriesService();
