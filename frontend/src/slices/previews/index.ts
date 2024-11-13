import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Preview } from "@/types/preview";

type SliceState = {
    previews: { [notebookId: string]: Preview };
}

const initialState: SliceState = {
    previews: {},
}

const previewsSlice = createSlice({
    name: 'previews',
    initialState,
    reducers: {
        setPreview: (state, action: PayloadAction<{ notebookId: string, preview: Preview }>) => {
            state.previews[action.payload.notebookId] = action.payload.preview;
        },
        removePreview: (state, action: PayloadAction<string>) => {
            delete state.previews[action.payload];
        }
    }
})

export const {
    setPreview,
    removePreview
} = previewsSlice.actions

export default previewsSlice.reducer;
