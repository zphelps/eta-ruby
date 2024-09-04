import {useCallback, useEffect} from "react";
import {RootState, useAppDispatch, useAppSelector} from "@/store";
import {api} from "@/lib/api";
import {setEntry} from "@/slices/entries";

export const useEntry = (id: string) => {
    const dispatch = useAppDispatch();
    const entry = useAppSelector((state: RootState) => state.entries.entries[id]);

    const fetchEntry = useCallback(async (id: string) => {
        try {
            console.log('FETCHING ENTRY', id)
            const response = await api.get("/entries", {
                params: {
                    entry_id: id,
                }
            });
            dispatch(setEntry(response.data));
        } catch (err) {
            console.error(err);
        }
    }, [id]);

    useEffect(() => {
            if (!entry && id) {
                fetchEntry(id);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [id]
    );

    return entry;
}
