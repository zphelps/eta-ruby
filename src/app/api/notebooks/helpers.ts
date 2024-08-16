import {createClient} from "@/utils/supabase/server";

export const previewPDFExists = async (notebookId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .storage
        .from(notebookId)
        .list("", { search: "preview" });

    if (error) {
        console.error(error);
        return false;
    }

    return data.length > 0;
}