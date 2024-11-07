

async function entryHasExtractedText(entry_id) {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );
    const { data, error } = await supabase
        .from('entries')
        .select('text')
        .eq('id', entry_id)
        .single();

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return !!data.text;
}

async function getEntryFile(notebook_id, entry_id) {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
        .storage
        .from('entries')
        .download(`${notebook_id}/${entry_id}.pdf`)

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    return data;
}
