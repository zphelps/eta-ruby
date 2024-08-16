import {useCallback, useEffect, useState} from "react";
import {RootState, useAppDispatch, useAppSelector} from "@/store";
import {api} from "@/lib/api";
import {setEntry} from "@/slices/entries";
import {Preview} from "@/types/preview";

export const usePreview = (notebook_id: string) => {
    const dispatch = useAppDispatch();
    const [preview,setPreview] = useState<Preview>();

    const fetchPreview = useCallback(async (id: string) => {
        try {
            const response = await api.get("/preview", {
                params: {
                    notebook_id: id,
                }
            });
            setPreview(response.data);
        } catch (err) {
            console.error(err);
        }
    }, [notebook_id]);

    useEffect(() => {
            if (!preview && notebook_id) {
                fetchPreview(notebook_id);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [notebook_id]
    );

    return preview;
}
