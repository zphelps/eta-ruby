import {useCallback, useEffect} from "react";
import {RootState, useAppDispatch, useAppSelector} from "@/store";
import {api} from "@/lib/api";
import {setTeamsForUser} from "@/slices/teams";
import {setNotebooksForUser} from "@/slices/notebooks";

export const useNotebooks = (user_id: string, selectedNotebookId?: string) => {
    const dispatch = useAppDispatch();
    const notebooks = useAppSelector((state: RootState) => state.notebooks.notebooks);

    const fetchNotebooks = useCallback(async (user_id: string) => {
        try {
            const response = await api.get("/notebooks", {
                params: {
                    uid: user_id,
                }
            });

            dispatch(setNotebooksForUser({
                user_id: user_id,
                notebooks: response.data.map((n: any) => n.notebooks),
            }));
        } catch (err) {
            console.error(err);
        }
    }, [user_id, selectedNotebookId]);

    useEffect(() => {
        if (user_id) {
            console.log("Fetching notebooks for user", user_id);
            fetchNotebooks(user_id);
        }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user_id, selectedNotebookId]
    );

    return Object.values(notebooks[user_id] || []);
};
