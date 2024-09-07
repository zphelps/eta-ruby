import {useCallback, useEffect} from "react";
import {RootState, useAppDispatch, useAppSelector} from "@/store";
import {api} from "@/lib/api";
import {setEntry} from "@/slices/entries";
import {useAuth} from "@/hooks/useAuth";

// status type for the entry

export const useEntry = (id: string) => {
    const dispatch = useAppDispatch();
    const entry = useAppSelector((state: RootState) => state.entries.entries[id]);
    const {user} = useAuth();

    const fetchEntry = useCallback(async (id: string) => {
        try {
            console.log('FETCHING ENTRY', id)
            const response = await api.get("/entries", {
                params: {
                    uid: user?.id,
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
