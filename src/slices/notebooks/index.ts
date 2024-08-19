import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Entry} from "@/types/entry";
import {Team} from "@/types/team";
import {Notebook} from "@/types/notebook";

type SliceState = {
    notebooks: { [user_id: string]: Notebook[]; };
}

const initialState: SliceState = {
    notebooks: {},
}

const notebooksSlice = createSlice({
    name: 'notebooks',
    initialState,
    reducers: {
        addNotebookForUser: (state, action: PayloadAction<{user_id: string, notebook: Notebook}>) => {
            if (state.notebooks[action.payload.user_id]) {
                state.notebooks[action.payload.user_id].push(action.payload.notebook)
            } else {
                state.notebooks[action.payload.user_id] = [action.payload.notebook]
            }
            console.log(state.notebooks)
        },
        setNotebooksForUser: (state, action: PayloadAction<{ user_id: string, notebooks: Notebook[] }>) => {
            state.notebooks[action.payload.user_id] = action.payload.notebooks
        },
        removeNotebookForUser: (state, action: PayloadAction<{user_id: string, notebook_id: string}>) => {
            state.notebooks[action.payload.user_id] = state.notebooks[action.payload.user_id].filter(notebook => notebook.id !== action.payload.notebook_id)
        },
    }
})

export const {
    addNotebookForUser,
    setNotebooksForUser,
    removeNotebookForUser,
} = notebooksSlice.actions

export default notebooksSlice.reducer;
