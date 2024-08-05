import {useCallback, useEffect} from "react";
import {RootState, useAppDispatch, useAppSelector} from "@/store";
import {api} from "@/lib/api";
import {setEntries, setEntry} from "@/slices/entries";

export const useEntries = (notebook_id: string) => {
    const dispatch = useAppDispatch();
    const entries = useAppSelector((state: RootState) => state.entries.entries);

    const fetchEntries = useCallback(async (id: string) => {
        try {
            const response = await api.get("/entries", {
                params: {
                    notebook_id: id,
                }
            });

            console.log(response.data)

            dispatch(setEntries(response.data));
        } catch (err) {
            console.error(err);
        }
    }, [notebook_id]);

    useEffect(() => {
            fetchEntries(notebook_id);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [notebook_id]
    );

    return Object.values(entries);
}
