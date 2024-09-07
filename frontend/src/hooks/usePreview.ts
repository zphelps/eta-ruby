"use client";

import {useCallback, useEffect, useState} from "react";
import {api} from "@/lib/api";
import {Preview} from "@/types/preview";

export const usePreview = (notebook_id?: string) => {
    const [preview,setPreview] = useState<Preview>();

    const fetchPreview = useCallback(async (id: string) => {
        try {
            console.log('FETCHING PREVIEW', id)
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
