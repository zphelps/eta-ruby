import {useCallback, useEffect, useState} from "react";
import {RootState, useAppDispatch, useAppSelector} from "@/store";
import {api} from "@/lib/api";
import {setEntries, setEntry} from "@/slices/entries";
import {useAuth} from "@/hooks/useAuth";

export const useEntries = (notebook_id: string) => {
    const dispatch = useAppDispatch();
    const entries = useAppSelector((state: RootState) => state.entries.entries);
    const [loading, setLoading] = useState(false);
    const {user} = useAuth();

    const fetchEntries = useCallback(async (id: string) => {
        setLoading(true);
        try {
            console.log("FETCHING ENTRIES", id);
            const response = await api.get("/entries", {
                params: {
                    uid: user?.id,
                    notebook_id: id,
                }
            });
            dispatch(setEntries(response.data));
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [notebook_id]);

    useEffect(() => {
            fetchEntries(notebook_id);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [notebook_id]
    );
    return {
        loading,
        entries: Object.values(entries).filter((entry) => entry.notebook_id === notebook_id),
    };
}
