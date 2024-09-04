import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Entry} from "@/types/entry";

type SliceState = {
    entries: { [id: string]: Entry; };
}

const initialState: SliceState = {
    entries: {},
}

const entriesSlice = createSlice({
    name: 'entries',
    initialState,
    reducers: {
        setEntry: (state, action: PayloadAction<Entry>) => {
            state.entries[action.payload.id] = action.payload
        },
        // updateEvent: (state, action: PayloadAction<TaskUpdate>) => {
        //     const eventIndex = state.events.findIndex(event => event.id === action.payload.id)
        //     state.events[eventIndex] = {
        //         ...state.events[eventIndex],
        //         ...action.payload
        //     }
        // },
        setEntries: (state, action: PayloadAction<Entry[]>) => {
            // const entries = action.payload.reduce((acc, entry) => {
            //     acc[entry.id] = entry
            //     return acc
            // }, {} as { [id: string]: Entry })

            for (const entry of action.payload) {
                state.entries[entry.id] = entry
            }
        },
        removeEntry: (state, action: PayloadAction<string>) => {
            delete state.entries[action.payload]
        },
    }
})

export const {
    setEntry,
    setEntries,
    removeEntry,
    // updateEvent
} = entriesSlice.actions

export default entriesSlice.reducer;
