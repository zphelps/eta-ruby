"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPreview } from "@/slices/previews";
import { api } from "@/lib/api";
import { Preview } from "@/types/preview";

export const usePreview = (notebook_id?: string) => {
    const dispatch = useAppDispatch();
    const preview = useAppSelector(state => notebook_id ? state.previews.previews[notebook_id] : undefined);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchPreview = useCallback(async (id: string) => {
        try {
            setLoading(true);
            console.log('FETCHING PREVIEW', id);
            const response = await api.get("/preview", {
                params: {
                    notebook_id: id,
                }
            });
            dispatch(setPreview({ notebookId: id, preview: response.data }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        if (!preview && notebook_id) {
            fetchPreview(notebook_id);
        }
    }, [notebook_id, preview, fetchPreview]);

    return { preview, loading };
}
